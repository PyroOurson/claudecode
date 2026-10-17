  Object.assign(BODIES, {
    breakout: { name: 'Breakout', hitbox: 'Breakout', hb: [66.996, 41.5105, 16.4], off: [12.5, 0, 11.75], cz: 11.75, wf: [51.5, 26.67, 13.5], wb: [-35.75, 35, 15], sr: [29.7, 29.666], rz: 18.37 },
    merc: { name: 'Merc', hitbox: 'Merc', hb: [61.61, 39.60515, 22.07955], off: [11.3757, 0, 21.505], cz: 21.505, wf: [51.25, 25.9, 15], wb: [-33.75, 29.5, 15], sr: [39.505, 39.105], rz: 18.81 },
    venom: { name: 'Venom', hitbox: 'Hybrid', hb: [64.7595, 42.34395, 18.32955], off: [13.8757, 0, 20.755], cz: 20.755, wf: [51.25, 25.9, 12.5], wb: [-34, 29.5, 15], sr: [38.755, 37.055] },
    paladin: { name: 'Paladin', hitbox: 'Plank', mdl: 'dominus', hb: [65.66, 43.5852, 15.9472], off: [9.00857, 0, 12.0942], cz: 12.0942, wf: [49.97, 27.8, 12.5], wb: [-35.43, 20.28, 17], sr: [31.9242, 27.9242], rz: 18.67 }
  });
  for (const k in BODIES) if (!BODY_IDS.includes(k)) BODY_IDS.push(k);
  const NO_GL = { kicker: '3D', title: '3D unavailable', text: 'Your browser could not start WebGL. Try another browser or turn on hardware acceleration.', button: null };
  const TEAMC = [0x2f7bff, 0xff7a1a], TEAMCSS = ['#3f8cff', '#ff8a2a'], TEAMN = ['Blue', 'Orange'];
  const el = (tag, cls, parent, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.append(e); return e; };
  const mmss = s => { s = Math.max(0, s); const m = Math.floor(s / 60), r = Math.floor(s % 60); return m + ':' + (r < 10 ? '0' : '') + r; };
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

  const CSS = `
$ [hidden]{display:none!important}
$ .wrap{position:relative;max-width:100%;border-radius:var(--r);overflow:hidden;background:#06101f;box-shadow:0 22px 50px -30px rgba(31,29,43,.7);container-type:inline-size;--u:1cqw;--rf:"Saira Semi Condensed","Bahnschrift","DIN Alternate","Roboto Condensed","Arial Narrow",sans-serif-condensed,sans-serif;--tf:"Saira Semi Condensed","Segoe UI",Roboto,Arial,sans-serif;--cy:#a6ecff;--cyg:rgba(70,200,255,.55);--bdr:rgba(80,190,240,.75);--f1:max(11px,calc(var(--u)*1.55));--f0:max(9px,calc(var(--u)*1.02));--bh:max(28px,calc(var(--u)*3.3));--sk:-20deg;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;font-family:var(--rf)}
$ .wrap.portrait{--u:1.9cqw;--f1:max(12px,calc(var(--u)*1.7))}
$ .wrap>canvas{display:block;width:100%;border-radius:0;background:#06101f}
$ .wrap button{font-family:var(--rf);-webkit-tap-highlight-color:transparent}
$ .wrap kbd{display:inline-grid;place-items:center;min-width:1.55em;height:1.55em;padding:0 .3em;box-sizing:border-box;margin:0 .35em 0 0;border-radius:999px;border:0;background:rgba(255,255,255,.14);box-shadow:inset 0 0 0 1px rgba(255,255,255,.55);color:#fff;font:600 .78em/1 var(--rf);vertical-align:middle}
$ .wrap kbd.kb{background:#c8203a;box-shadow:inset 0 0 0 1px rgba(255,170,170,.7)}
$ .wrap kbd.ka{background:#1b8a3a;box-shadow:inset 0 0 0 1px rgba(170,255,190,.7)}
$ .wrap kbd.kx{background:#1f63c8;box-shadow:inset 0 0 0 1px rgba(170,210,255,.7)}
$ .hud{position:absolute;inset:0;pointer-events:none;color:#fff;font-family:var(--rf);overflow:hidden}
$ .vh{position:absolute;left:0;top:0;width:100%;height:100%;container-type:inline-size;overflow:hidden;pointer-events:none}
$ .vh.flip{transform:rotate(180deg)}
$ .split .vh{--u:1.6cqw;box-shadow:inset 0 0 0 1.5px rgba(4,8,22,.85)}
$ .portrait.split .vh{--u:2.1cqw}
$ .dg{display:block;height:1em;overflow:visible;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:square;stroke-linejoin:miter}
$ .ic{display:inline-grid;place-items:center;text-decoration:none;color:#ffc23d;filter:drop-shadow(0 0 .25em rgba(255,140,20,.6))}
$ .ic svg{width:100%;height:100%;fill:currentColor;overflow:visible}
$ .sb{position:absolute;top:0;left:50%;transform:translateX(-50%);display:flex;align-items:stretch;height:calc(var(--u)*4.3);filter:drop-shadow(0 calc(var(--u)*.2) calc(var(--u)*.5) rgba(0,0,10,.55))}
$ .sq{position:relative;display:grid;place-items:center;width:calc(var(--u)*4.4);color:#fff;font-size:calc(var(--u)*2.75);background:linear-gradient(180deg,#3d86ff,#1d56d8);clip-path:polygon(0 0,100% 0,100% 100%,24% 100%,0 76%)}
$ .sq.r{clip-path:polygon(0 0,100% 0,100% 76%,76% 100%,0 100%)}
$ .sq .dg{filter:drop-shadow(0 0 calc(var(--u)*.2) rgba(255,255,255,.35))}
$ .sq .dg .o{stroke:#fff;stroke-width:3.3}
$ .sq .dg .n{stroke:#2a66ea;stroke-width:1.15}
$ .sq.c1 .dg .n{stroke:#ef7a22}
$ .sq.c1{background:linear-gradient(180deg,#ff9a3a,#e2620e)}
$ .sb .clk{min-width:calc(var(--u)*10.4);display:grid;place-items:center;font-size:calc(var(--u)*2.5);color:#f6f9ff;background:linear-gradient(180deg,rgba(30,34,48,.9),rgba(4,5,10,.92));box-shadow:inset 0 1px 0 rgba(255,255,255,.28),inset 0 -1px 0 rgba(255,255,255,.1)}
$ .sb .clk .dg{filter:drop-shadow(0 0 calc(var(--u)*.2) rgba(200,225,255,.4))}
$ .sb .clk .dg .o{stroke:currentColor;stroke-width:2.7}
$ .sb .clk .dg .n{stroke:#10131d;stroke-width:.95}
$ .sb .clk.ot{color:#ffd65a}
$ .touch .sb{pointer-events:auto;cursor:pointer}
$ .bd{position:absolute;right:calc(var(--u)*1.6);bottom:calc(var(--u)*1.4);width:calc(var(--u)*13.6);height:calc(var(--u)*13.6);--bdF0:rgba(214,92,18,.92);--bdF1:rgba(110,38,6,.84);--bdF2:rgba(22,8,2,.88);--bdD:rgba(255,190,120,.4);--bdN:#ffb15a;--bdG:rgba(255,120,10,.9)}
$ .bd.b{--bdF0:rgba(18,42,150,.88);--bdF1:rgba(6,16,66,.88);--bdF2:rgba(2,4,14,.92);--bdD:rgba(140,190,255,.42);--bdN:#5d8dff;--bdG:rgba(50,130,255,.95)}
$ .bd .dec{stroke:var(--bdD)}
$ .bd svg{display:block;width:100%;height:100%;overflow:visible}
$ .bd .tk path{opacity:.04;transition:opacity .08s}
$ .bd .tk path.on{opacity:1}
$ .bd .bn{position:absolute;left:50%;top:48%;transform:translate(-50%,-50%);font-size:calc(var(--u)*3.6);color:var(--bdN);filter:drop-shadow(0 0 calc(var(--u)*.35) var(--bdG)) drop-shadow(0 0 calc(var(--u)*.9) var(--bdG))}
$ .bd .bn .dg{width:auto}
$ .bd .bn .o{stroke:currentColor;stroke-width:2.9}
$ .bd .bn .n{stroke:#0a1a66;stroke-width:1}
$ .bd:not(.b) .bn .n{stroke:#3a1404}
$ .bd .bl{position:absolute;left:50%;top:66%;transform:translateX(-50%);font-size:calc(var(--u)*.9);font-weight:600;letter-spacing:.14em;color:var(--bdN);opacity:0;transition:opacity .15s}
$ .bd.on .bl{opacity:.75}
$ .touch .bd{right:auto;left:50%;transform:translateX(-50%);bottom:auto;top:calc(var(--u)*5.4);width:calc(var(--u)*8.5);height:calc(var(--u)*8.5)}
$ .touch .bd .bn{font-size:calc(var(--u)*2.25)}
$ .split.touch .bd{left:auto;right:calc(var(--u)*1.4);top:calc(var(--u)*1.3);transform:none}
$ .cb{position:absolute;left:calc(var(--u)*3.6);bottom:calc(var(--u)*1.9);display:flex;flex-direction:column;align-items:flex-start;gap:calc(var(--u)*.35);padding:0;border:0;background:none;color:rgba(255,255,255,.55);font:400 max(13px,calc(var(--u)*2.15))/1 var(--rf);letter-spacing:.02em;text-transform:uppercase;cursor:pointer;pointer-events:auto;text-shadow:0 1px 4px rgba(0,0,0,.7)}
$ .cb b{display:flex;align-items:center;gap:.25em;font-weight:400}
$ .cb b i{width:.4em;height:.4em;margin-left:-.65em;border-radius:50%;background:currentColor;box-shadow:0 0 .45em currentColor}
$ .cb small{font:500 max(8px,calc(var(--u)*.98))/1 var(--rf);letter-spacing:.04em;color:rgba(255,255,255,.85)}
$ .cb small kbd{margin:0 .35em}
$ .cb.on{color:#ff5a3a}
$ .cb.on b{text-shadow:0 0 .5em rgba(255,70,40,.55),0 1px 3px rgba(0,0,0,.6)}
$ .touch .cb,$ .pzo .vh .cb,$ .pzo .vh .bd,$ .pzo .vh .pops,$ .pzo .vh .feed,$ .pzo .vh .chat,$ .pzo .vh .ss,$ .pzo .vh .ban,$ .pzo .vh .tc,$ .pzo .vh .qc{display:none!important}
$ .fxrep .vh .cb,$ .fxrep .vh .qc{opacity:0!important;transition:opacity .2s}
$ .tl{position:absolute;z-index:2;left:calc(var(--u)*1.2);top:calc(var(--u)*1.2);display:flex;gap:6px;pointer-events:auto}
$ .tl button{display:grid;place-items:center;min-width:40px;min-height:40px;height:calc(var(--u)*4);padding:0 calc(var(--u)*1.2);border:0;border-radius:6px;background:rgba(6,16,34,.66);color:#fff;font:500 max(11px,calc(var(--u)*1.3))/1 var(--rf);letter-spacing:.06em;cursor:pointer;box-shadow:inset 0 0 0 1px var(--bdr)}
$ .tl button svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linejoin:round;stroke-linecap:round}
$ .tl .cbt,$ .tl .qb{display:none}
$ .touch .tl .cbt,$ .touch .tl .qb{display:grid}
$ .tl .cbt.on{background:linear-gradient(180deg,#ff6a4a,#d8341c);box-shadow:none}
$ .portrait .tl{flex-direction:column;align-items:flex-start}
$ .ping{position:absolute;left:calc(var(--u)*1.4);top:calc(var(--u)*1.2 + 50px);font:500 max(9px,calc(var(--u)*1))/1 var(--rf);letter-spacing:.1em;opacity:.8;text-shadow:0 1px 3px rgba(0,0,0,.7)}
$ .portrait .ping{top:calc(var(--u)*1.2 + 96px)}
$ .ban{position:absolute;left:0;right:0;top:22%;display:flex;flex-direction:column;align-items:center;text-align:center;pointer-events:none}
$ .ban .bt{font:300 calc(var(--u)*7.4)/1 var(--rf);letter-spacing:.04em;text-transform:uppercase;color:#fff;text-shadow:0 0 calc(var(--u)*1.6) var(--gl,rgba(80,170,255,.9)),0 0 calc(var(--u)*.3) var(--gl,rgba(80,170,255,.9))}
$ .ban .bs{margin-top:calc(var(--u)*.7);font:400 max(11px,calc(var(--u)*1.7))/1.2 var(--rf);letter-spacing:.1em;text-transform:uppercase;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.8)}
$ .ban .cd{font-size:calc(var(--u)*4.6);color:#f4c63e;filter:drop-shadow(0 0 calc(var(--u)*.25) rgba(255,170,30,.55))}
$ .ban.cdn{top:30%}
$ .ban.cdn .bt{font-size:calc(var(--u)*4.6);font-weight:400;color:transparent;-webkit-text-stroke:max(1px,calc(var(--u)*.11)) #f4c63e;text-shadow:none;filter:drop-shadow(0 0 calc(var(--u)*.25) rgba(255,170,30,.55))}
$ .ban .cd .o{display:none}
$ .ban .cd .n{stroke:currentColor;stroke-width:1.25}
$ .ban.pop>*{animation:gmrs-pop .45s cubic-bezier(.2,1.5,.4,1) both}
@keyframes gmrs-pop{0%{transform:scale(1.6);opacity:0}100%{transform:none;opacity:1}}
$ .ban.gol{top:29%}
$ .ban .gn{max-width:96%;font:400 calc(var(--u)*5.2)/1.1 var(--rf);letter-spacing:.03em;text-transform:uppercase;color:transparent;background:linear-gradient(180deg,#fff2c2 8%,#ffc04a 52%,#e8780e 92%);-webkit-background-clip:text;background-clip:text;filter:drop-shadow(0 0 calc(var(--u)*.35) rgba(255,150,40,.85)) drop-shadow(0 0 calc(var(--u)*1) rgba(255,110,10,.45));white-space:nowrap;overflow:hidden;text-overflow:ellipsis;animation:gmrs-gn 3.1s ease-out both}
$ .ban .gx{margin-top:calc(var(--u)*.6);font:400 max(10px,calc(var(--u)*1.3))/1 var(--rf);letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.85);text-shadow:0 1px 4px rgba(0,0,0,.8);animation:gmrs-gn 2.9s ease-out .3s both}
@keyframes gmrs-gn{0%{opacity:0;transform:scale(.92)}10%{opacity:1;transform:none}88%{opacity:1}100%{opacity:0}}
$ .ban .wn{display:flex;flex-direction:column;align-items:center;margin-top:-6%}
$ .ban .wn small{font:400 max(12px,calc(var(--u)*2.1))/1 var(--rf);letter-spacing:.06em;text-transform:uppercase;color:#fff;text-shadow:0 0 calc(var(--u)*.8) rgba(255,160,40,.9);margin-bottom:calc(var(--u)*9.5)}
$ .ban .wn em{font:400 calc(var(--u)*2.7)/1 var(--rf);font-style:normal;letter-spacing:.04em;text-transform:uppercase;color:var(--wl,#9fd6ff);text-shadow:0 0 calc(var(--u)*1) var(--wg,rgba(60,140,255,.9))}
$ .ban .wn b{font:300 calc(var(--u)*7.6)/1 var(--rf);letter-spacing:.04em;text-transform:uppercase;color:var(--wl,#9fd6ff);text-shadow:0 0 calc(var(--u)*1.3) var(--wg,rgba(60,140,255,.95)),0 0 calc(var(--u)*.25) var(--wg,rgba(60,140,255,1))}
$ .feed{position:absolute;right:calc(var(--u)*1.2);top:calc(var(--u)*1.1);display:flex;flex-direction:column;align-items:flex-end;gap:calc(var(--u)*.55)}
$ .feed>div{display:flex;align-items:center;gap:calc(var(--u)*.3);font:600 max(11px,calc(var(--u)*1.5))/1 var(--rf);text-transform:uppercase;white-space:nowrap;animation:gmrs-in .3s ease-out both}
$ .feed>div.tx{padding:calc(var(--u)*.45) calc(var(--u)*.9);border-radius:999px;background:rgba(6,14,30,.7);font-weight:500;letter-spacing:.04em}
$ .feed i{font-style:normal;padding:calc(var(--u)*.38) calc(var(--u)*.85);border-radius:999px;background:linear-gradient(180deg,#5d9dff,#2662de);box-shadow:inset 0 0 0 1px rgba(190,220,255,.6);color:#fff!important;text-shadow:0 1px 1px rgba(0,0,0,.3)}
$ .feed i.p1{background:linear-gradient(180deg,#ffa652,#e46510);box-shadow:inset 0 0 0 1px rgba(255,220,180,.6)}
$ .feed .ic{width:max(20px,calc(var(--u)*3));height:max(20px,calc(var(--u)*3))}
$ .split .feed{top:calc(var(--u)*6.6)}
@keyframes gmrs-in{0%{opacity:0;transform:translateX(20px)}100%{opacity:1;transform:none}}
$ .pops{position:absolute;left:50%;top:19%;width:60%;height:calc(var(--u)*9);transform:translateX(-50%)}
$ .pops>div{position:absolute;left:0;right:0;top:0;display:flex;flex-direction:column;align-items:center;text-align:center;animation:gmrs-pp 2.4s ease-out both}
$ .pops>div::before{content:'';position:absolute;left:50%;top:calc(var(--u)*-.9);width:calc(var(--u)*8.6);height:calc(var(--u)*8.6);transform:translateX(-50%);border-radius:50%;background:radial-gradient(circle,rgba(255,150,50,.92),rgba(255,118,24,.7) 52%,rgba(255,100,10,0) 71%);z-index:-1}
$ .pops .ic{position:absolute;left:50%;top:calc(var(--u)*-3.4);width:calc(var(--u)*2.6);height:calc(var(--u)*2.6);transform:translateX(-50%);opacity:.85;color:#ffb066}
$ .pops>div.np .ic{top:calc(var(--u)*-3.8)}
$ .pops b{font:500 max(12px,calc(var(--u)*1.95))/1 var(--rf);letter-spacing:.01em;text-transform:uppercase;white-space:nowrap;text-shadow:0 0 calc(var(--u)*.4) rgba(0,0,0,.9),0 2px 3px rgba(0,0,0,.6);margin-top:calc(var(--u)*1.4)}
$ .pops em{margin-top:calc(var(--u)*.15);font:400 max(10px,calc(var(--u)*1.3))/1 var(--rf);font-style:normal;color:#fff;text-shadow:0 0 calc(var(--u)*.4) rgba(0,0,0,.9)}
$ .pops>div.np em{margin-top:calc(var(--u)*1.1);font:300 max(16px,calc(var(--u)*3))/1 var(--rf);text-shadow:0 0 calc(var(--u)*.5) rgba(0,0,0,.8)}
$ .pops>div.old{animation:gmrs-po .4s ease-in both}
@keyframes gmrs-pp{0%{opacity:0;transform:scale(1.25)}8%{opacity:1;transform:none}85%{opacity:1}100%{opacity:0}}
@keyframes gmrs-po{0%{opacity:1}100%{opacity:0;transform:translateY(-40%) scale(.9)}}
$ .ss{position:absolute;left:0;right:0;top:36%;text-align:center;text-transform:uppercase;text-shadow:0 2px 10px rgba(0,0,0,.7)}
$ .ss b{display:block;font:300 calc(var(--u)*4.4)/1 var(--rf);letter-spacing:.06em;color:#ff7a5a;text-shadow:0 0 calc(var(--u)*1) rgba(255,60,30,.85)}
$ .ss small{display:inline-block;margin-top:calc(var(--u)*.8);font:400 max(11px,calc(var(--u)*1.6))/1 var(--rf);letter-spacing:.12em}
$ .ss.tu{top:calc(var(--u)*5.6)}
$ .ss.tu small{margin:0;padding:calc(var(--u)*.4) calc(var(--u)*1);background:rgba(4,6,12,.75);font-size:max(9px,calc(var(--u)*1.1));color:#ffd65a}
$ .chat{position:absolute;left:calc(var(--u)*1.6);top:calc(var(--u)*1.2 + 68px);max-width:42%;display:flex;flex-direction:column;align-items:flex-start;gap:calc(var(--u)*.15)}
$ .chat>div{max-width:100%;font:400 max(10px,calc(var(--u)*1.3))/1.3 var(--tf);text-shadow:0 1px 2px rgba(0,0,0,.9),0 0 6px rgba(0,0,0,.6);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;animation:gmrs-chat 7s linear both}
$ .chat i{font-style:normal;font-weight:600}
$ .chat i.p0{color:#7fb8ff}
$ .chat i.p1{color:#ffae62}
$ .chat .tmg{color:#9fe0ff;font-weight:600}
$ .chat .sy{color:#ffd65a}
$ .touch .chat{top:calc(var(--u)*1.2 + 50px)}
$ .portrait.touch .chat{top:calc(var(--u)*1.2 + 150px)}
@keyframes gmrs-chat{0%{opacity:0;transform:translateX(-10px)}4%{opacity:1;transform:none}82%{opacity:1}100%{opacity:0}}
$ .qc{position:absolute;z-index:3;left:calc(var(--u)*1.6);top:50%;transform:translateY(-50%);width:max(170px,calc(var(--u)*20));padding:calc(var(--u)*.8);box-sizing:border-box;background:linear-gradient(180deg,rgba(14,40,70,.94),rgba(5,14,30,.94));box-shadow:inset 0 0 0 1px var(--bdr),0 0 calc(var(--u)*1.2) rgba(60,170,255,.25);pointer-events:auto;animation:gmrs-qc .18s ease-out both}
$ .qc h4{margin:0 0 calc(var(--u)*.5);font:400 max(11px,calc(var(--u)*1.5))/1 var(--rf);letter-spacing:.06em;text-transform:uppercase;color:var(--cy);text-shadow:0 0 .6em var(--cyg)}
$ .qc button{display:flex;align-items:center;gap:calc(var(--u)*.7);width:100%;min-height:max(30px,calc(var(--u)*3));padding:0 calc(var(--u)*.7);margin-top:3px;border:0;background:linear-gradient(180deg,rgba(48,98,160,.75),rgba(24,58,104,.75));color:#fff;font:400 max(11px,calc(var(--u)*1.35))/1 var(--tf);text-align:left;cursor:pointer}
$ .qc button:hover{background:linear-gradient(180deg,#effcff,#bdeeff);color:#0d4f8f}
$ .qc kbd{margin:0}
@keyframes gmrs-qc{0%{opacity:0;transform:translate(-14px,-50%)}100%{opacity:1;transform:translateY(-50%)}}
$ .tab{position:absolute;left:50%;top:52%;transform:translate(-50%,-50%);width:min(96%,calc(var(--u)*80));display:flex;flex-direction:column;gap:calc(var(--u)*.6);padding:calc(var(--u)*1.2) calc(var(--u)*1.4);box-sizing:border-box;background:linear-gradient(180deg,rgba(6,12,24,.82),rgba(3,6,14,.86));box-shadow:inset 0 0 0 1px rgba(80,190,240,.35);pointer-events:none;animation:gmrs-fd .15s ease-out both}
$ .touch .tab{pointer-events:auto}
@keyframes gmrs-fd{0%{opacity:0}100%{opacity:1}}
$ .tm{align-self:center;display:flex;align-items:center;justify-content:center;gap:calc(var(--u)*1.6);font:500 max(9px,calc(var(--u)*1.1))/1 var(--rf);letter-spacing:.14em;color:rgba(220,236,255,.8);text-transform:uppercase}
$ .tm .dg{font-size:max(14px,calc(var(--u)*2.2));color:#fff;stroke-width:1.6}
$ .tm.ot .dg{color:#ffd65a}
$ .sbd{display:flex;flex-direction:column;gap:calc(var(--u)*1.6);min-width:0}
$ .stm{--g:minmax(0,calc(var(--u)*3.2)) calc(var(--u)*4.2) minmax(0,1fr) calc(var(--u)*3) repeat(6,minmax(0,calc(var(--u)*6.2)));display:flex;flex-direction:column;gap:calc(var(--u)*.35);min-width:0}
$ .stm.t0{--tc:#4f9bff;--tr:linear-gradient(90deg,rgba(26,66,190,.88),rgba(18,48,150,.8));--ta:#2a5fd0}
$ .stm.t1{--tc:#ff9a3c;--tr:linear-gradient(90deg,rgba(200,82,16,.88),rgba(160,60,10,.8));--ta:#c45a12}
$ .sth{display:grid;grid-template-columns:var(--g);align-items:end;min-height:calc(var(--u)*4.6)}
$ .sth .tn{grid-column:1/5;display:flex;flex-direction:column;align-items:flex-start;padding-left:calc(var(--u)*.4)}
$ .sth .tn small{font:400 max(10px,calc(var(--u)*1.55))/1 var(--rf);letter-spacing:.04em;color:var(--tc);text-shadow:0 0 .5em var(--tc);margin-bottom:calc(var(--u)*.2)}
$ .sth .tn div{display:flex;align-items:center;gap:calc(var(--u)*1);font:300 calc(var(--u)*3.4)/1 var(--rf);color:var(--tc);text-transform:uppercase;text-shadow:0 0 .35em rgba(0,0,0,.6)}
$ .sth .tn .dg{color:#fff;stroke-width:1.5}
$ .sth>span{text-align:center;font:500 max(7.5px,calc(var(--u)*.98))/1 var(--rf);letter-spacing:.04em;color:#fff;text-transform:uppercase;padding-bottom:calc(var(--u)*.4)}
$ .sbr{display:grid;grid-template-columns:var(--g);align-items:center;min-height:max(24px,calc(var(--u)*3.6));font:500 max(11px,calc(var(--u)*1.55))/1 var(--rf)}
$ .sbr>span{text-align:center;white-space:nowrap;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.4)}
$ .sbr .ck{display:grid;place-items:center;font-style:normal;color:#6ef24a;filter:drop-shadow(0 0 .2em rgba(110,242,74,.6))}
$ .sbr .ck svg{width:calc(var(--u)*2.6);height:calc(var(--u)*2.6);fill:none;stroke:currentColor;stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}
$ .sbr .av{align-self:stretch;display:block;margin:calc(var(--u)*.15) 0;box-shadow:inset 0 0 0 max(1px,calc(var(--u)*.15)) var(--ta);background:var(--ta);padding:max(1px,calc(var(--u)*.15))}
$ .sbr .av svg,$ .pav svg,$ .fxav svg{display:block;width:100%;height:100%}
$ .sbr .snm,$ .sbr .mv,$ .sbr .sv{align-self:stretch;background:var(--tr)}
$ .sbr .snm{display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:calc(var(--u)*.2);min-width:0;padding-left:calc(var(--u)*.8);text-align:left}
$ .sbr .snm b{max-width:100%;font:400 max(11px,calc(var(--u)*1.65))/1 var(--tf);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
$ .sbr .snm small{font:500 max(7px,calc(var(--u)*.85))/1 var(--rf);letter-spacing:.06em;color:rgba(255,255,255,.85);text-transform:uppercase}
$ .sbr .mv{display:grid;place-items:center}
$ .sbr .mv .ic{width:calc(var(--u)*2.3);height:calc(var(--u)*2.3)}
$ .sbr .sv{display:grid;place-items:center}
$ .sbr .sv.pn{display:flex;justify-content:center;align-items:center;gap:.25em;color:#8dff5a;font-size:.9em}
$ .sbr .sv.pn svg{width:.95em;height:.95em}
$ .sbr .sv.pn.bt{color:rgba(255,255,255,.7);font-size:.75em;letter-spacing:.08em}
$ .sbr.me .snm b{color:#fff;font-weight:600}
$ .sbr.me .snm{box-shadow:inset 0 max(1px,calc(var(--u)*.12)) 0 rgba(255,255,255,.35)}
$ .tc{position:absolute;inset:0;display:none}
$ .touch .tc{display:block}
$ .jz{position:absolute;left:0;top:18%;bottom:0;width:55%;pointer-events:auto;touch-action:none}
$ .joy{position:absolute;width:104px;height:104px;margin:-52px 0 0 -52px;border-radius:50%;background:rgba(10,30,60,.25);box-shadow:inset 0 0 0 2px rgba(140,220,255,.55);pointer-events:none}
$ .joy i{position:absolute;left:50%;top:50%;width:44px;height:44px;margin:-22px;border-radius:50%;background:rgba(230,248,255,.9);box-shadow:0 4px 12px rgba(0,0,0,.3)}
$ .tb{position:absolute;display:grid;place-items:center;border:0;border-radius:50%;color:#fff;font:600 13px/1 var(--rf);letter-spacing:.04em;pointer-events:auto;touch-action:none;box-shadow:inset 0 0 0 2px rgba(255,255,255,.55),0 6px 16px rgba(0,0,0,.35)}
$ .tb.dn{transform:scale(.92);filter:brightness(1.25)}
$ .tb.boost{right:14px;bottom:16px;width:84px;height:84px;background:radial-gradient(circle at 50% 35%,rgba(255,170,70,.95),rgba(230,90,10,.85))}
$ .tb.jump{right:108px;bottom:22px;width:72px;height:72px;background:radial-gradient(circle at 50% 35%,rgba(110,190,255,.95),rgba(30,90,220,.85))}
$ .tb.slide{right:30px;bottom:112px;width:56px;height:56px;font-size:11px;background:rgba(10,24,46,.72)}
$ .menu,$ .end,$ .pz,$ .ttl,$ .ld,$ .opw,$ .dlg{position:absolute;inset:0;color:#fff;font-family:var(--rf)}
$ .menu,$ .end,$ .pz,$ .ttl,$ .opw,$ .dlg{pointer-events:auto}
$ .rb{position:relative;isolation:isolate;display:flex;align-items:center;gap:calc(var(--u)*.8);width:100%;min-height:var(--bh);padding:0 calc(var(--u)*1.6);box-sizing:border-box;border:0;background:none;color:#fff;font:400 var(--f1)/1 var(--rf);letter-spacing:.02em;text-transform:uppercase;text-align:left;white-space:nowrap;cursor:pointer;outline:none}
$ .rb::before{content:'';position:absolute;inset:0;z-index:-1;transform:skewX(var(--sk));background:linear-gradient(90deg,rgba(6,9,16,.86),rgba(12,17,28,.74));box-shadow:inset 0 1px 0 rgba(255,255,255,.07);transition:background .12s,box-shadow .12s}
$ .rb>small{margin-left:auto;font:400 max(8px,calc(var(--u)*.92))/1 var(--rf);letter-spacing:.06em;color:rgba(255,255,255,.55)}
$ .rb>em{margin-left:auto;font:400 max(10px,calc(var(--u)*1.25))/1 var(--rf);font-style:normal;letter-spacing:.04em}
$ .rb.on{color:#1663ad}
$ .rb.on::before{background:linear-gradient(180deg,#f2fdff,#c2efff);box-shadow:0 0 calc(var(--u)*1.1) rgba(110,215,255,.85),inset 0 0 0 1px #fff}
$ .rb.on>small{color:rgba(20,90,160,.75)}
$ .rb.dis{opacity:.45}
$ .rb.act{color:#fff}
$ .rb.act::before{background:linear-gradient(90deg,rgba(30,96,176,.9),rgba(22,70,138,.8));box-shadow:inset 0 0 0 1px rgba(140,210,255,.45)}
$ .pnl .rb{justify-content:center;text-align:center;margin:0 auto}
$ .pnl .rb::before{background:linear-gradient(180deg,#2f6aa8,#173f72);box-shadow:inset 0 1px 0 rgba(170,220,255,.55),inset 0 -1px 0 rgba(0,0,0,.35)}
$ .pnl .rb.on::before{background:linear-gradient(180deg,#f2fdff,#b4ebff);box-shadow:0 0 calc(var(--u)*1.2) rgba(110,215,255,.9),inset 0 0 0 1px #fff}
$ .pnl{position:relative;box-sizing:border-box;padding:calc(var(--u)*1.2) calc(var(--u)*2.2) calc(var(--u)*1.8);background:linear-gradient(180deg,rgba(18,52,92,.97),rgba(8,24,46,.97) 30%,rgba(5,16,32,.97));box-shadow:inset 0 0 0 1px var(--bdr),0 0 calc(var(--u)*1.4) rgba(40,160,240,.35),0 calc(var(--u)*1) calc(var(--u)*3) rgba(0,0,0,.5)}
$ .pt{margin:0 0 calc(var(--u)*1.1);text-align:center;font:300 max(20px,calc(var(--u)*3.6))/1 var(--rf);letter-spacing:.03em;text-transform:uppercase;color:var(--cy);text-shadow:0 0 calc(var(--u)*.9) var(--cyg)}
$ .bt{margin:0;font:300 max(30px,calc(var(--u)*7))/.9 var(--rf);letter-spacing:.01em;text-transform:uppercase;color:#fff;text-shadow:0 0 calc(var(--u)*1.2) rgba(0,0,0,.45)}
$ .md{margin-top:calc(var(--u)*.9);font:400 max(10px,calc(var(--u)*1.3))/1.3 var(--tf);color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.85)}
$ .hk{display:flex;flex-wrap:wrap;align-items:center;gap:calc(var(--u)*1.8);margin-top:calc(var(--u)*.9);font:400 max(10px,calc(var(--u)*1.25))/1 var(--rf);letter-spacing:.02em;text-transform:uppercase;text-shadow:0 1px 4px rgba(0,0,0,.85)}
$ .hk>span{display:inline-flex;align-items:center;min-height:28px;cursor:pointer}
$ .hk>span:hover{color:var(--cy)}
$ .menu{overflow:hidden}
$ .mvg{position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(2,6,14,.55),rgba(2,6,14,.18) 38%,transparent 60%),linear-gradient(0deg,rgba(2,6,14,.75),transparent 34%)}
$ .mm,$ .gsx,$ .msx{position:absolute;left:calc(var(--u)*2.6);top:0;bottom:calc(var(--u)*10.2);display:flex;flex-direction:column;justify-content:flex-end;width:calc(var(--u)*25)}
$ .mm{width:calc(var(--u)*52)}
$ .mcol{display:flex;align-items:flex-start;gap:calc(var(--u)*1.4)}
$ .msx{width:calc(var(--u)*34)}
$ .msx .sl{width:calc(var(--u)*32)}
$ .ml,$ .ms,$ .gl,$ .sl{display:flex;flex-direction:column;gap:calc(var(--u)*.45);width:calc(var(--u)*23)}
$ .ms .rb{min-height:calc(var(--bh)*.9);font-size:calc(var(--f1)*.92)}
$ .ms .rb::before{background:linear-gradient(90deg,rgba(6,9,16,.66),rgba(12,17,28,.5))}
$ .ms .rb.on::before{background:linear-gradient(180deg,#f2fdff,#c2efff)}
$ .ml .rb.on{color:#2a1500}
$ .ml .rb.on::before{background:linear-gradient(180deg,#ffd47e,#f39a1c);box-shadow:0 0 calc(var(--u)*1.1) rgba(255,166,50,.8),inset 0 0 0 1px #ffe6ae}
$ .ml .rb.on>small{color:rgba(70,34,0,.75)}
$ .mlg{display:flex;align-items:center;gap:calc(var(--u)*.6);margin-bottom:auto;padding-top:calc(var(--u)*2.2)}
$ .mlg .shd{width:calc(var(--u)*5.4);height:calc(var(--u)*5.4)}
$ .wm{display:flex;flex-direction:column;font:800 calc(var(--u)*2.9)/.84 var(--rf);letter-spacing:-.01em;text-transform:uppercase;color:#fff;text-shadow:0 calc(var(--u)*.15) calc(var(--u)*.5) rgba(0,0,0,.45)}
$ .shd{display:block;flex:none;overflow:visible;filter:drop-shadow(0 calc(var(--u)*.2) calc(var(--u)*.5) rgba(0,0,0,.4))}
$ .gsx .bt,$ .msx .bt{margin-bottom:calc(var(--u)*.7)}
$ .gl .rb{min-height:calc(var(--bh)*.96)}
$ .gp2{display:flex;gap:calc(var(--u)*.6);margin-bottom:calc(var(--u)*.7)}
$ .gp2 .rb{width:auto;flex:1;justify-content:center;min-height:calc(var(--bh)*.85);font-size:calc(var(--f1)*.85)}
$ .so{gap:0}
$ .so>span{flex:1}
$ .so>i,$ .so>b{font-style:normal;font-weight:400}
$ .so>b{min-width:calc(var(--u)*10);text-align:center}
$ .so>i{opacity:.8;padding:0 calc(var(--u)*.4);font-size:1.15em}
$ .sgo{margin-top:calc(var(--u)*.6)}
$ .sgo::before{background:linear-gradient(90deg,rgba(18,70,130,.9),rgba(24,96,170,.8))!important;box-shadow:inset 0 0 0 1px rgba(140,220,255,.6)!important}
$ .sgo.on::before{background:linear-gradient(180deg,#f2fdff,#c2efff)!important;box-shadow:0 0 calc(var(--u)*1.1) rgba(110,215,255,.85),inset 0 0 0 1px #fff!important}
$ .plb{position:absolute;left:calc(var(--u)*1.1);bottom:calc(var(--u)*2.4);display:flex;align-items:flex-start;pointer-events:auto;cursor:pointer;z-index:4}
$ .pav{position:relative;width:calc(var(--u)*4.6);height:calc(var(--u)*4.6);padding:calc(var(--u)*.25);box-sizing:border-box;border-radius:calc(var(--u)*.5);background:linear-gradient(180deg,#f4f7fb,#aeb7c4);box-shadow:0 2px 6px rgba(0,0,0,.5);z-index:1}
$ .pav svg{border-radius:calc(var(--u)*.25)}
$ .plv{position:absolute;left:50%;bottom:calc(var(--u)*-1.25);transform:translateX(-50%);min-width:calc(var(--u)*2.6);padding:calc(var(--u)*.22) calc(var(--u)*.4);box-sizing:border-box;clip-path:polygon(18% 0,82% 0,100% 50%,82% 100%,18% 100%,0 50%);background:linear-gradient(180deg,#ffe58a,#f0a818);color:#4a2600;text-align:center;font:600 max(9px,calc(var(--u)*1.05))/1 var(--rf)}
$ .pnm{position:relative;display:flex;align-items:center;width:calc(var(--u)*17);height:calc(var(--u)*3.5);margin-top:calc(var(--u)*.3);padding-left:calc(var(--u)*1.2);box-sizing:border-box;overflow:hidden;background:linear-gradient(90deg,#1d4f8f,#2f75c4 60%,#4a8fd6);box-shadow:inset 0 1px 0 rgba(180,220,255,.4)}
$ .pnm span{position:relative;z-index:1;font:400 max(12px,calc(var(--u)*1.75))/1 var(--tf);color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:78%}
$ .pnm svg{position:absolute;right:calc(var(--u)*-.6);top:50%;width:calc(var(--u)*5.4);height:calc(var(--u)*5.4);transform:translateY(-50%);opacity:.22}
$ .pxp{position:absolute;left:calc(var(--u)*4.6);bottom:calc(var(--u)*-.6);width:calc(var(--u)*17);height:max(3px,calc(var(--u)*.4));background:repeating-linear-gradient(90deg,rgba(255,255,255,.12) 0 18%,transparent 18% 20%)}
$ .pxp u{display:block;height:100%;background:repeating-linear-gradient(90deg,#ff9a1a 0 calc(var(--u)*3.2),transparent calc(var(--u)*3.2) calc(var(--u)*3.45));box-shadow:0 0 6px rgba(255,150,30,.6)}
$ .ttl{display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;background:radial-gradient(ellipse at 50% 46%,rgba(8,26,80,.38),rgba(2,8,30,.72))}
$ .tlg{display:flex;align-items:center;gap:calc(var(--u)*1.2);margin-top:-6%;animation:gmrs-tl 1s ease-out both}
$ .tlg .shd{width:calc(var(--u)*20);height:calc(var(--u)*20)}
$ .tlg .wm{font-size:calc(var(--u)*10.4)}
$ .tpa{margin-top:calc(var(--u)*4);font:400 max(13px,calc(var(--u)*1.85))/1 var(--rf);letter-spacing:.03em;text-transform:uppercase;color:#fff;text-shadow:0 0 calc(var(--u)*.6) rgba(0,0,0,.85),0 2px 4px rgba(0,0,0,.6);animation:gmrs-tp 2.2s ease-in-out infinite}
$ .tft{position:absolute;left:0;right:0;bottom:calc(var(--u)*1.6);text-align:center;font:400 max(8px,calc(var(--u)*.85))/1.4 var(--tf);color:rgba(255,255,255,.75);text-shadow:0 1px 3px rgba(0,0,0,.8)}
@keyframes gmrs-tl{0%{opacity:0;transform:scale(.94)}100%{opacity:1;transform:none}}
@keyframes gmrs-tp{0%,100%{opacity:1}50%{opacity:.45}}
$ .ld{pointer-events:auto;background:radial-gradient(ellipse 70% 80% at 64% 46%,rgba(8,30,80,0),rgba(8,30,80,.25) 45%,rgba(6,24,70,.85) 85%),linear-gradient(90deg,rgba(6,26,78,.92),rgba(6,26,78,.45) 34%,rgba(6,26,78,0) 60%),linear-gradient(0deg,rgba(5,20,62,.95),rgba(5,20,62,0) 30%);animation:gmrs-fd .25s ease-out both}
$ .ld .mlg{position:absolute;left:calc(var(--u)*5.2);top:calc(var(--u)*4.2);padding:0;margin:0}
$ .ld .mlg .shd{width:calc(var(--u)*10.8);height:calc(var(--u)*10.8)}
$ .ld .wm{font-size:calc(var(--u)*5.2)}
$ .lt{position:absolute;left:calc(var(--u)*5);right:30%;bottom:calc(var(--u)*3.6)}
$ .lt b{display:block;font:400 max(14px,calc(var(--u)*2.1))/1 var(--rf);letter-spacing:.02em;color:#3e9cf0;text-transform:uppercase}
$ .lt p{margin:calc(var(--u)*.5) 0 0;font:400 max(10px,calc(var(--u)*1.3))/1.35 var(--tf);color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.6)}
$ .ll{position:absolute;right:calc(var(--u)*4.6);bottom:calc(var(--u)*3.6);display:flex;align-items:center;gap:calc(var(--u)*.6);font:400 max(14px,calc(var(--u)*2.2))/1 var(--rf);text-transform:uppercase;color:#8be2ff;text-shadow:0 0 calc(var(--u)*.7) rgba(60,190,255,.8)}
$ .ll i{width:calc(var(--u)*2.4);height:calc(var(--u)*2.4);border-radius:50%;box-sizing:border-box;border:max(2px,calc(var(--u)*.38)) solid rgba(140,226,255,.25);border-top-color:#a6efff;border-right-color:#a6efff;box-shadow:0 0 calc(var(--u)*.7) rgba(60,190,255,.6);animation:gmrs-sp .9s linear infinite}
@keyframes gmrs-sp{100%{transform:rotate(360deg)}}
$ .opw{display:grid;place-items:center;padding:calc(var(--u)*1.2);box-sizing:border-box;background:rgba(2,6,14,.62);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);z-index:6}
$ .op{width:min(100%,calc(var(--u)*72));max-height:100%;display:flex;flex-direction:column}
$ .otb{display:flex;align-items:center;justify-content:center;gap:calc(var(--u)*.5);margin-bottom:calc(var(--u)*.9);flex-wrap:wrap}
$ .otb>kbd{background:rgba(0,0,0,.35);border-radius:calc(var(--u)*.5);min-width:2.2em;height:1.9em;font-size:max(9px,calc(var(--u)*1.05))}
$ .ot{min-height:max(28px,calc(var(--u)*3));padding:0 calc(var(--u)*1.1);border:0;border-radius:calc(var(--u)*.35);background:linear-gradient(180deg,#2c6aa6,#163e70);color:#fff;font:400 max(11px,calc(var(--u)*1.45))/1 var(--rf);letter-spacing:.03em;text-transform:uppercase;cursor:pointer;box-shadow:inset 0 1px 0 rgba(170,220,255,.5)}
$ .ot.on{position:relative;background:linear-gradient(180deg,#fff,#cbefff);color:#1663ad;box-shadow:0 0 calc(var(--u)*1) rgba(110,215,255,.85)}
$ .ot.on::after{content:'';position:absolute;left:50%;bottom:calc(var(--u)*-.7);width:calc(var(--u)*.9);height:calc(var(--u)*.9);transform:translateX(-50%) rotate(45deg);border-right:2px solid #cbefff;border-bottom:2px solid #cbefff}
$ .ob{flex:1;min-height:0;overflow-y:auto;scrollbar-width:thin;padding:calc(var(--u)*.6);background:rgba(4,12,26,.55);box-shadow:inset 0 0 0 1px rgba(80,190,240,.25)}
$ .og{margin-bottom:calc(var(--u)*.7);padding:calc(var(--u)*.6) calc(var(--u)*.8) calc(var(--u)*.8);background:rgba(20,48,84,.45)}
$ .og h5{display:flex;align-items:center;gap:.4em;margin:0 0 calc(var(--u)*.6);font:400 max(12px,calc(var(--u)*1.75))/1 var(--rf);letter-spacing:.02em;text-transform:uppercase;color:#52b8ff}
$ .og h5 i{width:.85em;height:.85em;background:radial-gradient(circle,#cfd8e4 30%,transparent 32%),conic-gradient(#8ea0b6 0 25%,#cfd8e4 0 50%,#8ea0b6 0 75%,#cfd8e4 0);border-radius:50%;opacity:.8}
$ .oq{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:calc(var(--u)*.8)}
$ .oq select{width:100%;min-width:0;height:max(26px,calc(var(--u)*2.7));padding:0 calc(var(--u)*2.6) 0 calc(var(--u)*.6);border:0;border-radius:0;-webkit-appearance:none;appearance:none;background:linear-gradient(90deg,#0b111c,#151d2b) padding-box;box-shadow:inset 0 0 0 1px rgba(255,255,255,.18);color:#fff;font:400 max(10px,calc(var(--u)*1.3))/1 var(--tf);cursor:pointer;outline:none;background-image:linear-gradient(45deg,transparent 50%,#9fdcff 50%),linear-gradient(135deg,#9fdcff 50%,transparent 50%),linear-gradient(90deg,#0b111c,#151d2b);background-position:calc(100% - calc(var(--u)*1.25)) 50%,calc(100% - calc(var(--u)*.85)) 50%,0 0;background-size:calc(var(--u)*.42) calc(var(--u)*.42),calc(var(--u)*.42) calc(var(--u)*.42),100% 100%;background-repeat:no-repeat}
$ .oq select:focus,$ .oq select:hover{box-shadow:inset 0 0 0 1px #9fe6ff,0 0 calc(var(--u)*.6) rgba(110,215,255,.6)}
$ .oq option{background:#0b1626;color:#fff}
$ .orw{display:flex;align-items:center;gap:calc(var(--u)*1);min-height:max(30px,calc(var(--u)*3.3));padding:0 calc(var(--u)*.8);margin-bottom:2px;background:rgba(20,48,84,.4);font:400 max(11px,calc(var(--u)*1.45))/1 var(--rf);text-transform:uppercase;letter-spacing:.02em}
$ .orw>span{flex:1;min-width:0}
$ .orw>b{min-width:calc(var(--u)*4.2);text-align:right;font-weight:400;color:var(--cy)}
$ .orw input[type=range]{flex:0 0 42%;height:max(18px,calc(var(--u)*2));margin:0;-webkit-appearance:none;appearance:none;background:transparent;cursor:pointer}
$ .orw input[type=range]::-webkit-slider-runnable-track{height:max(4px,calc(var(--u)*.45));background:linear-gradient(90deg,#57c4ff var(--p,50%),rgba(255,255,255,.18) var(--p,50%))}
$ .orw input[type=range]::-moz-range-track{height:max(4px,calc(var(--u)*.45));background:linear-gradient(90deg,#57c4ff var(--p,50%),rgba(255,255,255,.18) var(--p,50%))}
$ .orw input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:max(12px,calc(var(--u)*1.3));height:max(16px,calc(var(--u)*1.9));margin-top:calc(max(16px,calc(var(--u)*1.9))/-2 + max(4px,calc(var(--u)*.45))/2);border:0;background:linear-gradient(180deg,#fff,#c8efff);box-shadow:0 0 6px rgba(110,215,255,.9)}
$ .orw input[type=range]::-moz-range-thumb{width:max(12px,calc(var(--u)*1.3));height:max(16px,calc(var(--u)*1.9));border:0;border-radius:0;background:linear-gradient(180deg,#fff,#c8efff)}
$ .orw input[type=text]{flex:0 0 42%;height:max(24px,calc(var(--u)*2.6));padding:0 calc(var(--u)*.6);box-sizing:border-box;border:0;background:#0b111c;box-shadow:inset 0 0 0 1px rgba(255,255,255,.25);color:#fff;font:400 max(11px,calc(var(--u)*1.4))/1 var(--tf);outline:none;-webkit-user-select:text;user-select:text}
$ .orw input[type=text]:focus{box-shadow:inset 0 0 0 1px #9fe6ff}
$ .tg2{display:flex;gap:2px;flex:0 0 42%}
$ .tg2 button{flex:1;min-height:max(24px,calc(var(--u)*2.5));border:0;background:rgba(255,255,255,.08);color:rgba(255,255,255,.75);font:400 max(10px,calc(var(--u)*1.2))/1 var(--rf);text-transform:uppercase;cursor:pointer}
$ .tg2 button.on{background:linear-gradient(180deg,#fff,#c8efff);color:#1663ad}
$ .ocr p{margin:0 0 2px;padding:calc(var(--u)*.7) calc(var(--u)*.9);background:rgba(20,48,84,.4);font:400 max(11px,calc(var(--u)*1.3))/1.4 var(--rf);color:#d6e6ff;overflow-wrap:anywhere}
$ .ocr a{color:#62c2ff;text-decoration:none}
$ .ocr a:hover{text-decoration:underline}
$ .okt{width:100%;border-collapse:collapse;font:400 max(10px,calc(var(--u)*1.25))/1.2 var(--rf);text-transform:uppercase}
$ .okt th{padding:calc(var(--u)*.4) calc(var(--u)*.6);text-align:left;font-weight:400;color:#52b8ff;letter-spacing:.04em}
$ .okt td{padding:calc(var(--u)*.45) calc(var(--u)*.6);background:rgba(20,48,84,.4);border-bottom:2px solid rgba(4,12,26,.6)}
$ .okt td:first-child{color:#fff}
$ .okt td+td{color:var(--cy)}
$ .op .hk{margin-top:calc(var(--u)*1)}
$ .pz{display:grid;place-items:center}
$ .pzp{width:min(92%,calc(var(--u)*30));display:flex;flex-direction:column;gap:calc(var(--u)*.6);padding:calc(var(--u)*1.3) calc(var(--u)*2) calc(var(--u)*2)}
$ .pzp .pt{margin-bottom:calc(var(--u)*.6)}
$ .pzp .rb{width:84%;--sk:-14deg}
$ .dlg{display:grid;place-items:center;z-index:8;background:rgba(2,5,12,.66);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);animation:gmrs-fd .15s ease-out both}
$ .dp{width:min(94%,calc(var(--u)*45))}
$ .dp .pt{white-space:nowrap}
$ .dq{display:flex;align-items:center;gap:calc(var(--u)*1.4);margin:calc(var(--u)*.4) 0 calc(var(--u)*1.6);padding:0 calc(var(--u)*.6)}
$ .dq i{flex:none;display:grid;place-items:center;width:calc(var(--u)*3.6);height:calc(var(--u)*3.6);border-radius:50%;background:radial-gradient(circle at 50% 40%,#c9f6ff,#55d6ff);color:#082a44;font:600 calc(var(--u)*2.6)/1 var(--rf);font-style:normal;box-shadow:0 0 calc(var(--u)*1) rgba(90,210,255,.7)}
$ .dq p{margin:0;font:400 max(11px,calc(var(--u)*1.45))/1.35 var(--tf)}
$ .db{display:flex;gap:calc(var(--u)*.8);justify-content:center}
$ .db .rb{width:44%;margin:0;--sk:-18deg}
$ .db .rb::before{background:linear-gradient(180deg,#9fb8cc,#5d7d98)}
$ .db .rb{color:#fff}
$ .db .rb.on{color:#1663ad}
$ .end{overflow:hidden}
$ .end .mvg{transition:background .6s;background:linear-gradient(90deg,rgba(2,6,14,.7),rgba(2,6,14,.4) 40%,rgba(2,6,14,.3)),linear-gradient(0deg,rgba(2,6,14,.6),transparent 40%)}
$ .end.dim .mvg{background:rgba(2,5,14,.62)}
$ .nmx{position:absolute;left:50%;top:0;transform:translateX(-50%);min-width:calc(var(--u)*10.4);padding:calc(var(--u)*.7) calc(var(--u)*1) calc(var(--u)*.6);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*.35);background:rgba(4,6,10,.88);z-index:3}
$ .nmx small{font:400 max(8px,calc(var(--u)*.78))/1 var(--rf);letter-spacing:.04em;text-transform:uppercase;color:#fff}
$ .nmx span{font-size:calc(var(--u)*2.3);color:#ffd27a;filter:drop-shadow(0 0 calc(var(--u)*.3) rgba(255,160,40,.6))}
$ .nmx .dg{stroke-width:1.5}
$ .pg{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;cursor:pointer}
$ .xpb{position:relative;display:flex;align-items:center;gap:calc(var(--u)*1);width:min(86%,calc(var(--u)*52));margin-top:13%;animation:gmrs-in2 .5s ease-out both}
$ .xpb>b{font:400 max(14px,calc(var(--u)*2.1))/1 var(--rf);color:#fff;text-shadow:0 0 calc(var(--u)*.6) rgba(80,180,255,.7)}
$ .xb{position:relative;flex:1;height:calc(var(--u)*1.25);background:linear-gradient(180deg,rgba(40,90,140,.55),rgba(14,40,70,.6));box-shadow:inset 0 0 0 1px rgba(110,200,255,.35)}
$ .xb u{position:absolute;left:0;top:0;bottom:0;width:0;background:linear-gradient(180deg,#9ce8ff,#2c9bf0);box-shadow:0 0 calc(var(--u)*1) rgba(60,180,255,.9)}
$ .xb u.x1{background:linear-gradient(180deg,#e9fbff,#7fdcff);transition:width 1.8s cubic-bezier(.3,0,.2,1)}
$ .xb em{position:absolute;top:-80%;bottom:-80%;width:max(4px,calc(var(--u)*.5));margin-left:max(-2px,calc(var(--u)*-.25));background:#fff;box-shadow:0 0 calc(var(--u)*1.2) #9ce8ff,0 0 calc(var(--u)*2.4) rgba(120,220,255,.8);transform:skewX(-18deg);transition:left 1.8s cubic-bezier(.3,0,.2,1)}
$ .xn{position:absolute;right:calc(var(--u)*3.6);top:calc(100% + calc(var(--u)*.4));font:400 max(9px,calc(var(--u)*1))/1 var(--rf);color:#ffd27a}
$ .xlu{position:absolute;left:50%;top:calc(var(--u)*-3.4);transform:translateX(-50%);font:300 max(14px,calc(var(--u)*2.4))/1 var(--rf);letter-spacing:.08em;color:var(--cy);text-shadow:0 0 calc(var(--u)*.8) var(--cyg);animation:gmrs-pop .5s cubic-bezier(.2,1.5,.4,1) both}
$ .xl{display:flex;flex-direction:column;width:min(70%,calc(var(--u)*36));margin-top:calc(var(--u)*3.4)}
$ .xl>div{display:flex;justify-content:space-between;padding:calc(var(--u)*.55) calc(var(--u)*1.2);font:400 max(11px,calc(var(--u)*1.45))/1 var(--tf);background:linear-gradient(90deg,transparent,rgba(20,60,110,.45) 20%,rgba(20,60,110,.45) 80%,transparent);border-bottom:1px solid rgba(90,170,230,.25);animation:gmrs-in2 .4s ease-out both}
$ .xl>div b{font-weight:400;color:#ffd27a}
@keyframes gmrs-in2{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:none}}
$ .rk{position:absolute;left:50%;top:52%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;width:min(90%,calc(var(--u)*50))}
$ .rkc{display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*.6);margin-bottom:calc(var(--u)*1.6);animation:gmrs-pop .5s cubic-bezier(.2,1.4,.4,1) both}
$ .rkc>small{font:300 max(14px,calc(var(--u)*2.4))/1 var(--rf);letter-spacing:.04em;color:#e8f6ff;text-shadow:0 0 calc(var(--u)*.6) rgba(120,200,255,.6)}
$ .rkc>div{display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*.6);padding:calc(var(--u)*1.2) calc(var(--u)*2) calc(var(--u)*.9);background:linear-gradient(180deg,rgba(26,96,140,.9),rgba(12,58,96,.9));box-shadow:inset 0 0 0 1px rgba(140,220,255,.4)}
$ .rkc .ic{width:calc(var(--u)*5);height:calc(var(--u)*5);padding:calc(var(--u)*.5);color:#9fe6ff;background:rgba(80,180,240,.35);box-shadow:inset 0 0 0 1px rgba(160,230,255,.6);filter:none}
$ .rkc b{font:400 max(10px,calc(var(--u)*1.2))/1 var(--rf);letter-spacing:.06em;text-transform:uppercase}
$ .rkb{display:flex;align-items:center;gap:calc(var(--u)*.8);width:100%;animation:gmrs-in2 .5s ease-out both}
$ .rkb .shd{width:calc(var(--u)*5.6);height:calc(var(--u)*5.6)}
$ .rks{position:relative;display:grid;place-items:center;flex:none;width:calc(var(--u)*5.2);height:calc(var(--u)*5.8)}
$ .rks svg{position:absolute;inset:0;width:100%;height:100%}
$ .rks b{position:relative;font:400 calc(var(--u)*2.6)/1 var(--rf);color:#fff}
$ .rks.sm{width:calc(var(--u)*2.6);height:calc(var(--u)*2.9)}
$ .rks.sm b{font-size:calc(var(--u)*1.2)}
$ .rsg{flex:1;display:flex;gap:calc(var(--u)*.35)}
$ .rsg i{flex:1;height:calc(var(--u)*1.6);transform:skewX(-14deg);background:rgba(80,60,160,.35);box-shadow:inset 0 0 0 1px rgba(160,140,255,.5)}
$ .rsg i.on{background:linear-gradient(180deg,#f2b8ff,#a24dff);box-shadow:0 0 calc(var(--u)*.6) rgba(200,120,255,.8)}
$ .rsg i.nw{animation:gmrs-seg 1s ease-out .5s both}
@keyframes gmrs-seg{0%{background:rgba(80,60,160,.35)}50%{background:#fff;box-shadow:0 0 calc(var(--u)*1.4) #fff}100%{background:linear-gradient(180deg,#f2b8ff,#a24dff)}}
$ .pak{position:absolute;left:0;right:0;bottom:calc(var(--u)*6.5);text-align:center;font:400 max(10px,calc(var(--u)*1.3))/1 var(--tf);color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.8)}
$ .ps{position:absolute;inset:0}
$ .clg{position:absolute;left:calc(var(--u)*1.6);top:calc(var(--u)*1.6);width:calc(var(--u)*21);height:calc(var(--u)*12.4);padding:calc(var(--u)*.8) calc(var(--u)*1);box-sizing:border-box;display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden;background:rgba(2,4,8,.42);font:400 max(9px,calc(var(--u)*1.2))/1.3 var(--tf)}
$ .clg div{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 2px rgba(0,0,0,.8)}
$ .clg i{font-style:normal}
$ .clg i.p0{color:#7fb8ff}
$ .clg i.p1{color:#ffae62}
$ .clg .sy{color:#ffd27a}
$ .pqc{position:absolute;left:calc(var(--u)*1.6);top:calc(var(--u)*14.4);width:calc(var(--u)*21);display:grid;grid-template-columns:1fr 1fr;gap:calc(var(--u)*.35)}
$ .pqc button{display:flex;align-items:center;min-height:max(24px,calc(var(--u)*2.4));padding:0 calc(var(--u)*.5);border:0;background:rgba(10,18,32,.72);box-shadow:inset 0 0 0 1px rgba(255,255,255,.14);color:#fff;font:400 max(9px,calc(var(--u)*1.1))/1 var(--tf);cursor:pointer;white-space:nowrap;overflow:hidden}
$ .pqc button:hover{background:linear-gradient(180deg,#f2fdff,#c2efff);color:#1663ad}
$ .pqc kbd{flex:none;font-size:.85em}
$ .pml{position:absolute;left:calc(var(--u)*1.6);bottom:calc(var(--u)*11.2);width:calc(var(--u)*19);display:flex;flex-direction:column;gap:calc(var(--u)*.3)}
$ .pml .rb{min-height:calc(var(--bh)*.88);font-size:calc(var(--f1)*.92);--sk:-14deg}
$ .vt{display:flex;flex-direction:column;align-items:flex-end;gap:calc(var(--u)*.3);margin-bottom:calc(var(--u)*.2)}
$ .vt span{font:400 max(12px,calc(var(--u)*1.7))/1 var(--rf);color:#ff3d4d;text-transform:uppercase}
$ .vt span b{font-weight:400;font-size:1.35em;color:#fff}
$ .vt i{display:block;width:100%;height:max(3px,calc(var(--u)*.35));background:#c01c30}
$ .vt i u{display:block;height:100%;background:#fff;transition:width .3s}
$ .hs{position:absolute;left:calc(var(--u)*1.6);bottom:calc(var(--u)*8);padding:calc(var(--u)*.5) calc(var(--u)*1);border:0;background:rgba(2,4,8,.5);color:rgba(255,255,255,.85);font:400 max(9px,calc(var(--u)*1))/1 var(--rf);text-transform:uppercase;letter-spacing:.04em;cursor:pointer}
$ .ps .sbd{position:absolute;left:calc(var(--u)*24);right:calc(var(--u)*1.6);top:calc(var(--u)*7.2)}
$ .ps.hid .sbd{display:none}
$ .tab .stm{--g:minmax(0,calc(var(--u)*.4)) calc(var(--u)*3.8) minmax(0,1fr) calc(var(--u)*2.8) repeat(6,minmax(0,calc(var(--u)*6.4)))}
$ .tab .sbr{min-height:max(22px,calc(var(--u)*3.2))}
$ .tab .sth{min-height:calc(var(--u)*3.8)}
$ .tab .sth .tn div{font-size:calc(var(--u)*2.8)}
$ .lf{display:grid;place-items:center;width:100%;height:100%}
$ .portrait .mm,$ .portrait .gsx,$ .portrait .msx{left:calc(var(--u)*3);right:calc(var(--u)*3);width:auto;bottom:calc(var(--u)*13)}
$ .portrait .mcol{flex-direction:column;gap:calc(var(--u)*.9)}
$ .portrait .ml,$ .portrait .ms,$ .portrait .gl,$ .portrait .sl{width:100%}
$ .portrait .mvg{background:linear-gradient(0deg,rgba(2,6,14,.9),rgba(2,6,14,.55) 46%,transparent 70%)}
$ .portrait .bt{font-size:calc(var(--u)*9)}
$ .portrait .gl{display:grid;grid-template-columns:1fr 1fr;gap:calc(var(--u)*.6) calc(var(--u)*1.6)}
$ .portrait .gl .rb>small{display:none}
$ .portrait .tlg{flex-direction:column;gap:calc(var(--u)*2)}
$ .portrait .tlg .shd{width:calc(var(--u)*26);height:calc(var(--u)*26)}
$ .portrait .tlg .wm{font-size:calc(var(--u)*11);align-items:center}
$ .portrait .ld .mlg .shd{width:calc(var(--u)*12);height:calc(var(--u)*12)}
$ .portrait .lt{right:calc(var(--u)*5);bottom:calc(var(--u)*10)}
$ .portrait .ll{bottom:calc(var(--u)*3.4)}
$ .portrait .oq{grid-template-columns:repeat(2,minmax(0,1fr))}
$ .portrait .op{width:100%}
$ .portrait .clg{display:none}
$ .portrait .pqc{top:auto;left:calc(var(--u)*3);right:calc(var(--u)*3);width:auto;bottom:calc(var(--u)*25);grid-template-columns:repeat(4,minmax(0,1fr))}
$ .portrait .ps .sbd{left:calc(var(--u)*2);right:calc(var(--u)*2);top:calc(var(--u)*9)}
$ .portrait .pml{left:calc(var(--u)*3);right:calc(var(--u)*3);width:auto;bottom:calc(var(--u)*11.5);display:grid;grid-template-columns:1fr 1fr;gap:calc(var(--u)*.6) calc(var(--u)*1.4)}
$ .portrait .pml .vt{grid-column:1/3}
$ .portrait .hs{bottom:calc(var(--u)*8.6);left:auto;right:calc(var(--u)*3)}
$ .portrait .stm,$ .portrait .tab .stm{--g:minmax(0,calc(var(--u)*2.4)) calc(var(--u)*4) minmax(0,1fr) calc(var(--u)*2.6) repeat(5,minmax(0,calc(var(--u)*5.2))) 0}
$ .portrait .stm .c6{display:none}
$ .portrait .sth>span{font-size:max(7px,calc(var(--u)*.8));letter-spacing:0}
$ .portrait .xpb{margin-top:30%}
$ .portrait .pak{bottom:calc(var(--u)*12)}
$ .portrait.touch .ban .wn{margin-top:12%}
$ .portrait .pnm{width:calc(var(--u)*22)}
$ .portrait .pxp{width:calc(var(--u)*22)}
$ .lob{position:absolute;inset:0;display:grid;place-items:center;padding:calc(var(--u)*1.2);box-sizing:border-box;pointer-events:auto;color:#fff;font-family:var(--rf);background:radial-gradient(ellipse at 50% 40%,rgba(6,22,60,.3),rgba(2,8,24,.8));z-index:5}
$ .lbx{width:min(96%,calc(var(--u)*66));max-height:100%;overflow:auto;display:flex;flex-direction:column;gap:calc(var(--u)*.9);padding:calc(var(--u)*1.3) calc(var(--u)*2) calc(var(--u)*1.6)}
$ .lbx .pt{margin:0}
$ .lbh{display:flex;align-items:center;justify-content:space-between;gap:calc(var(--u)*1)}
$ .lbc{font:400 max(11px,calc(var(--u)*1.35))/1 var(--rf);letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.7);white-space:nowrap}
$ .lbc b{color:var(--cy);font-weight:600;margin-left:.4em;letter-spacing:.14em}
$ .lbb{display:flex;flex-wrap:wrap;gap:calc(var(--u)*.6)}
$ .lbb .rb{flex:1 1 30%}
$ .lbx .md{margin:0;min-height:1.3em;text-align:center}
$ .lbw{display:inline-block;width:.9em;height:.9em;margin-left:.6em;vertical-align:-.12em;border-radius:50%;border:2px solid rgba(166,236,255,.25);border-top-color:var(--cy);animation:gmrs-sp .8s linear infinite}
$ .lbx .rb{font-size:calc(var(--f1)*.8);padding:0 calc(var(--u)*1);min-width:0}
@container (max-width:640px){$ .lbx{gap:calc(var(--u)*.7)}}
@container (max-width:560px){$ .stm{--g:minmax(0,calc(var(--u)*3)) calc(var(--u)*4.2) minmax(0,1fr) calc(var(--u)*2.8) repeat(5,minmax(0,calc(var(--u)*6.4))) 0}$ .stm .c6{display:none}}
@media (max-width:640px){$ .tl button{font-size:10.5px}}
$ .menu.gar .mvg{background:linear-gradient(90deg,rgba(2,6,14,.72),rgba(2,6,14,.4) 48%,transparent 68%),linear-gradient(0deg,rgba(2,6,14,.6),transparent 30%)}
$ .menu.gar .gsx{top:calc(var(--u)*2.2);bottom:auto;justify-content:flex-start;width:calc(var(--u)*21)}
$ .menu.gar .gsx .bt{font-size:max(24px,calc(var(--u)*4.4));margin-bottom:calc(var(--u)*.4)}
$ .gcl{display:flex;flex-direction:column;gap:calc(var(--u)*.4);margin-top:calc(var(--u)*.4)}
$ .gcb{flex-direction:column;align-items:flex-start;justify-content:center;gap:calc(var(--u)*.3);min-height:calc(var(--bh)*1.14)}
$ .gcb>small{margin:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;color:rgba(160,220,255,.75)}
$ .gcb.act>small{color:rgba(220,240,255,.85)}
$ .gpn{position:absolute;left:calc(var(--u)*25);top:calc(var(--u)*2.2);bottom:calc(var(--u)*10.6);width:calc(var(--u)*33);display:flex;flex-direction:column;padding:calc(var(--u)*1) calc(var(--u)*1.2)}
$ .gph{margin:0 0 calc(var(--u)*.8);display:flex;align-items:baseline;justify-content:space-between;gap:1em;font:400 max(14px,calc(var(--u)*2.2))/1 var(--rf);letter-spacing:.02em;text-transform:uppercase;color:var(--cy);text-shadow:0 0 .6em var(--cyg)}
$ .gph small{font:400 max(9px,calc(var(--u)*1.02))/1 var(--rf);letter-spacing:.06em;color:rgba(255,255,255,.6);text-shadow:none;white-space:nowrap}
$ .gg{flex:1;min-height:0;overflow-y:auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));align-content:start;gap:calc(var(--u)*.6);padding:3px;scrollbar-width:thin}
$ .gi{position:relative;display:flex;flex-direction:column;align-items:stretch;gap:2px;min-width:0;padding:calc(var(--u)*.4) calc(var(--u)*.45) calc(var(--u)*.65);border:0;border-radius:2px;background:linear-gradient(180deg,rgba(40,70,110,.55),rgba(14,28,48,.8));box-shadow:inset 0 0 0 1px rgba(120,190,255,.2),inset 0 -3px 0 var(--rc);color:#fff;font:400 max(10px,calc(var(--u)*1.12))/1.1 var(--rf);text-transform:uppercase;text-align:left;cursor:pointer;outline:none;overflow:hidden}
$ .gi:hover{background:linear-gradient(180deg,rgba(60,110,170,.6),rgba(20,44,76,.85))}
$ .gi.on{background:linear-gradient(180deg,rgba(90,170,240,.62),rgba(30,70,120,.88));box-shadow:inset 0 0 0 2px #c8f2ff,0 0 calc(var(--u)*1) rgba(110,215,255,.75),inset 0 -3px 0 var(--rc)}
$ .gim{display:grid;place-items:center;aspect-ratio:12/7;background:radial-gradient(ellipse at 50% 62%,rgba(130,180,240,.3),rgba(0,0,0,0) 70%);overflow:hidden}
$ .gim img{position:static;display:block;width:100%;height:100%;object-fit:contain;pointer-events:none}
$ .gi b,$ .pti b{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
$ .gi small{font-size:.8em;color:var(--rc);letter-spacing:.04em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
$ .gi.lk .gim{filter:grayscale(.85) brightness(.5)}
$ .gi.lk b{color:rgba(255,255,255,.62)}
$ .gi.lk small{color:#ffd24a}
$ .geq{position:absolute;right:4px;top:4px;display:grid;place-items:center;width:max(14px,calc(var(--u)*1.7));height:max(14px,calc(var(--u)*1.7));border-radius:50%;background:#26c45e;box-shadow:0 0 6px rgba(40,220,110,.7)}
$ .geq svg{width:70%;height:70%;fill:none;stroke:#fff;stroke-width:3.6;stroke-linecap:round;stroke-linejoin:round}
$ .glk{position:absolute;right:6px;top:calc(4px + max(5px,calc(var(--u)*.6)));width:max(10px,calc(var(--u)*1.2));height:max(8px,calc(var(--u)*.95));border-radius:2px;background:#ffd24a;box-shadow:0 0 5px rgba(0,0,0,.6)}
$ .glk::before{content:'';position:absolute;left:18%;right:18%;bottom:92%;height:90%;box-sizing:border-box;border:max(2px,calc(var(--u)*.22)) solid #ffd24a;border-bottom:0;border-radius:99px 99px 0 0}
$ .gnw{position:absolute;left:4px;top:4px;padding:2px 5px;border-radius:2px;background:#ff5a2a;color:#fff;font:600 max(8px,calc(var(--u)*.82))/1 var(--rf);font-style:normal;letter-spacing:.06em;text-transform:uppercase;box-shadow:0 0 8px rgba(255,90,40,.7)}
$ .ml .gnw{position:static;margin-left:.7em}
$ .gsw{display:block;width:70%;height:60%;border-radius:4px}
$ .gsw.bo{width:84%;height:44%;border-radius:10% 50% 50% 10%;background:radial-gradient(ellipse at 90% 50%,var(--b) 0,var(--b) 12%,var(--a) 34%,rgba(0,0,0,0) 72%),linear-gradient(90deg,rgba(0,0,0,0),var(--c) 70%,var(--a));filter:drop-shadow(0 0 6px var(--c))}
$ .gsw.tr{width:88%;height:20%;border-radius:99px;background:linear-gradient(90deg,rgba(255,255,255,0),var(--a) 65%,#fff);box-shadow:0 0 12px var(--a)}
$ .gsw.tr.jt{height:30%;border-radius:0;clip-path:polygon(0 45%,18% 20%,32% 70%,50% 15%,64% 72%,82% 22%,100% 40%,100% 62%,82% 44%,64% 92%,50% 38%,32% 92%,18% 42%,0 62%)}
$ .gsw.rbw{background:linear-gradient(90deg,#ff004c,#ffb800,#3dff6a,#00c8ff,#a040ff)!important}
$ .gsw.bo.rbw{background:radial-gradient(ellipse at 90% 50%,#fff 0,#fff 12%,rgba(255,255,255,0) 40%),linear-gradient(90deg,rgba(0,0,0,0),#ff004c 30%,#ffb800,#3dff6a,#00c8ff,#a040ff)!important}
$ .gsw.gx{display:grid;place-items:center;width:auto;height:88%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,#fff 0,var(--a) 34%,rgba(0,0,0,0) 70%)}
$ .gsw.gx svg{width:56%;height:56%;fill:#fff;filter:drop-shadow(0 0 4px var(--a))}
$ .gsw.fn{width:auto;height:84%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 34% 30%,rgba(255,255,255,.95) 0,rgba(255,255,255,.25) 16%,rgba(255,255,255,0) 32%),radial-gradient(circle,var(--a) 0,var(--a) 55%,#000 125%)}
$ .gsw.f-matte{background:radial-gradient(circle at 38% 34%,rgba(255,255,255,.16),rgba(255,255,255,0) 52%),radial-gradient(circle,var(--a) 48%,#000 140%)}
$ .gsw.f-metal{background:radial-gradient(circle at 34% 30%,#fff 0,rgba(255,255,255,.45) 10%,rgba(255,255,255,0) 28%),conic-gradient(from 210deg,var(--a),#0a0a0a,var(--a),#fff 50%,var(--a) 62%,#0a0a0a,var(--a))}
$ .gsw.f-satin{background:radial-gradient(circle at 36% 32%,rgba(255,255,255,.5) 0,rgba(255,255,255,0) 40%),radial-gradient(circle,var(--a) 40%,#000 135%)}
$ .gsw.f-pearl{background:radial-gradient(circle at 34% 30%,#fff 0,rgba(255,255,255,.35) 18%,rgba(255,255,255,0) 38%),linear-gradient(135deg,var(--a),#ffe2f2 48%,var(--a) 68%,#a8e6ff)}
$ .gsw.f-chrome{background:radial-gradient(circle at 34% 28%,#fff 0,#fff 7%,rgba(255,255,255,0) 22%),linear-gradient(180deg,#fff 0,var(--a) 34%,#050505 50%,var(--a) 70%,#fff 100%)}
$ .gsw.no{width:auto;height:52%;aspect-ratio:1;border-radius:50%;box-shadow:inset 0 0 0 2px rgba(255,255,255,.35);background:linear-gradient(45deg,transparent 46%,rgba(255,255,255,.35) 46% 54%,transparent 54%)}
$ .gsw.tl{display:grid;place-items:center;width:auto;height:70%;aspect-ratio:1;color:#ffd24a}
$ .gsw.tl svg{width:100%;height:100%;fill:currentColor}
$ .gpts{display:flex;gap:2px;margin-bottom:calc(var(--u)*.8)}
$ .gpt{flex:1;min-height:max(26px,calc(var(--u)*2.8));border:0;background:rgba(255,255,255,.08);color:rgba(255,255,255,.8);font:400 max(10px,calc(var(--u)*1.15))/1 var(--rf);text-transform:uppercase;cursor:pointer;white-space:nowrap}
$ .gpt.on{background:linear-gradient(180deg,#fff,#c8efff);color:#1663ad}
$ .gcw{display:flex;gap:calc(var(--u)*1.4);align-items:center}
$ .cwh{position:relative;flex:none;width:calc(var(--u)*13.5);height:calc(var(--u)*13.5);min-width:108px;min-height:108px;border-radius:50%;background:radial-gradient(closest-side,#fff,rgba(255,255,255,0)),conic-gradient(#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00);box-shadow:0 0 0 2px rgba(255,255,255,.55),0 0 16px rgba(0,0,0,.6);cursor:crosshair;touch-action:none}
$ .cwv{position:absolute;inset:0;border-radius:50%;background:#000;pointer-events:none}
$ .cwm{position:absolute;width:14px;height:14px;margin:-9px 0 0 -9px;border:2px solid #fff;border-radius:50%;box-shadow:0 0 0 1px #000,0 2px 6px rgba(0,0,0,.6);pointer-events:none}
$ .cws{flex:1;min-width:0;display:flex;flex-direction:column;gap:calc(var(--u)*.8)}
$ .cwl{display:flex;flex-direction:column;gap:6px;font:400 max(10px,calc(var(--u)*1.1))/1 var(--rf);letter-spacing:.04em;text-transform:uppercase;color:rgba(255,255,255,.75)}
$ .cwl input{width:100%;height:max(14px,calc(var(--u)*1.6));margin:0;-webkit-appearance:none;appearance:none;border-radius:99px;background:linear-gradient(90deg,#000,var(--c,#fff));box-shadow:inset 0 0 0 1px rgba(255,255,255,.3);cursor:pointer}
$ .cwl input::-webkit-slider-thumb{-webkit-appearance:none;width:max(16px,calc(var(--u)*1.8));height:max(16px,calc(var(--u)*1.8));border-radius:50%;background:#fff;box-shadow:0 0 0 2px #000,0 0 6px rgba(255,255,255,.8)}
$ .cwl input::-moz-range-thumb{width:max(16px,calc(var(--u)*1.8));height:max(16px,calc(var(--u)*1.8));border:0;border-radius:50%;background:#fff;box-shadow:0 0 0 2px #000}
$ .cwx{display:flex;align-items:center;gap:6px}
$ .cwx i{flex:none;width:max(26px,calc(var(--u)*2.8));height:max(26px,calc(var(--u)*2.8));border-radius:4px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.45)}
$ .cwx input{flex:1;min-width:0;height:max(26px,calc(var(--u)*2.8));padding:0 8px;box-sizing:border-box;border:0;background:#0b111c;box-shadow:inset 0 0 0 1px rgba(255,255,255,.25);color:#fff;font:400 max(11px,calc(var(--u)*1.3))/1 var(--tf);text-transform:uppercase;outline:none;-webkit-user-select:text;user-select:text}
$ .cwx input:focus{box-shadow:inset 0 0 0 1px #9fe6ff}
$ .gpd{min-height:max(26px,calc(var(--u)*2.7));border:0;background:linear-gradient(180deg,#2f6aa8,#173f72);box-shadow:inset 0 1px 0 rgba(170,220,255,.5);color:#fff;font:400 max(10px,calc(var(--u)*1.1))/1 var(--rf);text-transform:uppercase;cursor:pointer}
$ .gpl{display:grid;grid-template-columns:repeat(20,minmax(0,1fr));gap:2px;margin-top:calc(var(--u)*1.1)}
$ .gpl .pls{position:relative;aspect-ratio:1;min-height:9px;padding:0;border:0;border-radius:1px;cursor:pointer}
$ .gpl .pls:hover{transform:scale(1.4);z-index:1;box-shadow:0 0 0 1px #fff}
$ .gpl .pls.on{z-index:1;box-shadow:0 0 0 2px #fff,0 0 6px #fff}
$ .gmd{margin-top:calc(var(--u)*.7);min-height:2.6em}
$ .ghk{position:absolute;left:calc(var(--u)*25);bottom:calc(var(--u)*7.6);margin:0}
$ .gdr{opacity:.7;cursor:default!important}
$ .pnm span small{display:block;margin-top:2px;font:500 max(8px,calc(var(--u)*.82))/1 var(--rf);letter-spacing:.06em;text-transform:uppercase;color:#ffd27a}
$ .menu.pas .mvg{background:linear-gradient(90deg,rgba(2,6,14,.7),rgba(2,6,14,.25) 50%,transparent 70%),linear-gradient(0deg,rgba(2,6,14,.92),rgba(2,6,14,.5) 30%,transparent 48%)}
$ .psx{position:absolute;left:calc(var(--u)*2.6);right:calc(var(--u)*2.6);top:calc(var(--u)*2.2);bottom:calc(var(--u)*9.4);display:flex;flex-direction:column}
$ .psh{display:flex;align-items:baseline;flex-wrap:wrap;gap:calc(var(--u)*.4) calc(var(--u)*1.5)}
$ .psh small{font:400 max(10px,calc(var(--u)*1.3))/1 var(--rf);letter-spacing:.08em;text-transform:uppercase;color:var(--cy)}
$ .psx .bt{font-size:max(26px,calc(var(--u)*5))}
$ .pst{display:flex;align-items:center;gap:calc(var(--u)*1.4);width:min(100%,calc(var(--u)*46));margin:calc(var(--u)*.9) 0 calc(var(--u)*.6)}
$ .ptb{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;flex:none;width:calc(var(--u)*6.4);height:calc(var(--u)*7);min-width:50px;min-height:54px;clip-path:polygon(50% 0,100% 17%,100% 72%,50% 100%,0 72%,0 17%);background:linear-gradient(180deg,#ffe58a,#e09412);color:#3a1d00}
$ .ptb small{font:600 max(8px,calc(var(--u)*.9))/1 var(--rf);letter-spacing:.08em;text-transform:uppercase}
$ .ptb b{font:600 max(18px,calc(var(--u)*2.9))/1 var(--rf)}
$ .ptb.sm{width:calc(var(--u)*4.4);height:calc(var(--u)*4.8);min-width:36px;min-height:40px;opacity:.75}
$ .ptb.sm b{font-size:max(13px,calc(var(--u)*1.9))}
$ .ptx{flex:1;display:flex;flex-direction:column;gap:6px}
$ .ptx i{display:block;height:max(8px,calc(var(--u)*1));background:rgba(255,255,255,.12);box-shadow:inset 0 0 0 1px rgba(255,210,100,.35)}
$ .ptx u{display:block;height:100%;background:linear-gradient(180deg,#ffe58a,#f0a818);box-shadow:0 0 10px rgba(255,180,40,.8)}
$ .ptx span{font:400 max(10px,calc(var(--u)*1.3))/1 var(--rf);letter-spacing:.04em;text-transform:uppercase;color:#ffd27a;text-shadow:0 1px 3px rgba(0,0,0,.8)}
$ .ptr{display:flex;gap:calc(var(--u)*.6);overflow-x:auto;padding:calc(var(--u)*1.3) 3px calc(var(--u)*.7);scrollbar-width:thin}
$ .pti{position:relative;flex:none;width:calc(var(--u)*10.2);min-width:82px;display:flex;flex-direction:column;gap:3px;padding:calc(var(--u)*.4) calc(var(--u)*.4) calc(var(--u)*.6);border:0;background:linear-gradient(180deg,rgba(40,70,110,.62),rgba(14,28,48,.88));box-shadow:inset 0 0 0 1px rgba(120,190,255,.2),inset 0 -3px 0 var(--rc);color:#fff;font:400 max(9px,calc(var(--u)*1.02))/1.1 var(--rf);text-transform:uppercase;text-align:left;cursor:pointer;outline:none;transition:transform .12s}
$ .pti>small{font:600 max(10px,calc(var(--u)*1.2))/1 var(--rf);color:#ffd27a}
$ .pti:not(.own) .gim{filter:grayscale(.8) brightness(.5)}
$ .pti.cur{box-shadow:inset 0 0 0 2px #ffd24a,0 0 calc(var(--u)*.8) rgba(255,200,60,.6),inset 0 -3px 0 var(--rc)}
$ .pti.on{transform:translateY(calc(var(--u)*-.7));background:linear-gradient(180deg,rgba(90,170,240,.62),rgba(30,70,120,.92));box-shadow:inset 0 0 0 2px #c8f2ff,0 0 calc(var(--u)*1) rgba(110,215,255,.75),inset 0 -3px 0 var(--rc)}
$ .pdt{display:flex;align-items:center;gap:calc(var(--u)*1.4);width:min(100%,calc(var(--u)*46));margin:calc(var(--u)*.3) 0 auto;padding:calc(var(--u)*.7) calc(var(--u)*1.2);box-sizing:border-box;background:linear-gradient(90deg,rgba(6,14,30,.9),rgba(6,14,30,.45));box-shadow:inset 3px 0 0 var(--rc)}
$ .pdt>.gim{flex:none;width:calc(var(--u)*11);min-width:80px}
$ .pdt>div{flex:1;min-width:0;display:flex;flex-direction:column;gap:5px}
$ .pdt small{font:400 max(9px,calc(var(--u)*1.02))/1 var(--rf);letter-spacing:.06em;text-transform:uppercase;color:var(--rc)}
$ .pdt b{font:400 max(16px,calc(var(--u)*2.5))/1 var(--rf);text-transform:uppercase}
$ .pdt p{margin:0;font:400 max(10px,calc(var(--u)*1.2))/1.3 var(--tf);color:rgba(255,255,255,.82)}
$ .pdt .pbe{flex:none;width:auto;--sk:-14deg}
$ .pxs{margin-top:calc(var(--u)*.6);font:400 max(9px,calc(var(--u)*1.05))/1.3 var(--tf);color:rgba(255,255,255,.7);text-shadow:0 1px 3px rgba(0,0,0,.8)}
$ .psx .hk{margin-top:calc(var(--u)*.5)}
$ .rvl{position:absolute;inset:0;z-index:9;display:grid;place-items:center;overflow:hidden;pointer-events:auto;cursor:pointer;background:radial-gradient(ellipse at 50% 50%,rgba(10,30,70,.78),rgba(0,4,12,.95));animation:gmrs-fd .3s ease-out both}
$ .rvb{position:relative;display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*.6);color:#fff;font-family:var(--rf);text-align:center}
$ .rvr{position:absolute;left:50%;top:58%;width:calc(var(--u)*72);height:calc(var(--u)*72);margin:calc(var(--u)*-36) 0 0 calc(var(--u)*-36);border-radius:50%;background:repeating-conic-gradient(var(--rc) 0 5deg,transparent 5deg 15deg);-webkit-mask-image:radial-gradient(circle,#000 0,rgba(0,0,0,.55) 30%,transparent 64%);mask-image:radial-gradient(circle,#000 0,rgba(0,0,0,.55) 30%,transparent 64%);opacity:0;pointer-events:none;animation:gmrs-rays 14s linear infinite,gmrs-rvo .6s ease-out .9s forwards}
@keyframes gmrs-rays{100%{transform:rotate(360deg)}}
@keyframes gmrs-rvo{100%{opacity:.55}}
$ .rvs{font:400 max(11px,calc(var(--u)*1.5))/1 var(--rf);letter-spacing:.16em;text-transform:uppercase;color:var(--cy);animation:gmrs-in2 .4s ease-out both}
$ .rvh{margin:0;font:300 max(30px,calc(var(--u)*6))/1 var(--rf);text-transform:uppercase;text-shadow:0 0 calc(var(--u)*1.4) var(--rc);animation:gmrs-pop .5s cubic-bezier(.2,1.5,.4,1) .1s both}
$ .rvc{position:relative;width:calc(var(--u)*24);min-width:190px;aspect-ratio:3/4;margin-top:calc(var(--u)*1);perspective:900px}
$ .rvf,$ .rvk{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:calc(var(--u)*.7);box-sizing:border-box;border-radius:6px;-webkit-backface-visibility:hidden;backface-visibility:hidden;box-shadow:inset 0 0 0 2px var(--rc),0 0 calc(var(--u)*3) var(--rc)}
$ .rvf{background:linear-gradient(160deg,#1d4f8f,#071a33);animation:gmrs-fl1 .6s ease-in .8s forwards}
$ .rvf .shd{width:52%;height:auto}
$ .rvk{padding:calc(var(--u)*1);background:linear-gradient(180deg,rgba(40,80,130,.96),rgba(8,20,40,.98));transform:rotateY(180deg);animation:gmrs-fl2 .6s ease-out .8s forwards}
@keyframes gmrs-fl1{100%{transform:rotateY(-180deg)}}
@keyframes gmrs-fl2{100%{transform:rotateY(0)}}
$ .rvk .gim{width:100%}
$ .rvk b{font:400 max(16px,calc(var(--u)*2.4))/1.05 var(--rf);text-transform:uppercase}
$ .rvk small{font:400 max(10px,calc(var(--u)*1.15))/1 var(--rf);letter-spacing:.08em;text-transform:uppercase;color:var(--rc)}
$ .rvp{margin:calc(var(--u)*1.4) 0 0;font:400 max(10px,calc(var(--u)*1.3))/1 var(--tf);color:rgba(255,255,255,.78);animation:gmrs-in2 .4s ease-out 1.4s both}
$ .rpp{position:relative;display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*.9);width:100%;animation:gmrs-in2 .5s ease-out both}
$ .rpp>small{font:300 max(14px,calc(var(--u)*2.4))/1 var(--rf);letter-spacing:.04em;text-transform:uppercase;color:#ffd27a;text-shadow:0 0 .6em rgba(255,170,40,.5)}
$ .rpb{display:flex;align-items:center;gap:calc(var(--u)*1);width:100%}
$ .rpb .xb{flex:1}
$ .rpb .xb u{background:linear-gradient(180deg,#ffe58a,#f0a818);box-shadow:0 0 calc(var(--u)*1) rgba(255,170,40,.9)}
$ .rpb .xb u.x1{background:linear-gradient(180deg,#fff6d0,#ffd24a)}
$ .rpl{display:flex;flex-wrap:wrap;justify-content:center;gap:calc(var(--u)*.4) calc(var(--u)*1.3);font:400 max(10px,calc(var(--u)*1.25))/1 var(--tf);color:rgba(255,255,255,.82)}
$ .rpl b{font-weight:400;color:#ffd27a}
$ .rpl .tt{color:#fff}
$ .rpp .xlu{top:calc(var(--u)*-3.4);color:#ffd27a;text-shadow:0 0 .8em rgba(255,170,40,.8)}
$ .trn{position:absolute;inset:0;display:none;pointer-events:none}
$ .train .trn{display:block}
$ .trp{position:absolute;top:0;left:50%;transform:translateX(-50%);display:flex;align-items:stretch;height:calc(var(--u)*4.3);filter:drop-shadow(0 calc(var(--u)*.2) calc(var(--u)*.5) rgba(0,0,10,.55))}
$ .trp b{display:grid;place-items:center;padding:0 calc(var(--u)*1.6);background:linear-gradient(180deg,rgba(30,34,48,.92),rgba(4,5,10,.94));font:400 calc(var(--u)*2.1)/1 var(--rf);letter-spacing:.06em;text-transform:uppercase;color:#ffd65a}
$ .trp span{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-width:calc(var(--u)*6.4);padding:0 calc(var(--u)*.6);background:linear-gradient(180deg,#3d86ff,#1d56d8);font:500 max(8px,calc(var(--u)*.9))/1 var(--rf);letter-spacing:.08em;text-transform:uppercase}
$ .trp span:nth-child(3){background:linear-gradient(180deg,#ff9a3a,#e2620e)}
$ .trp span:nth-child(4){background:linear-gradient(180deg,#5b6578,#2c3342)}
$ .trp em{font:400 calc(var(--u)*2.1)/1 var(--rf);font-style:normal}
$ .trk{position:absolute;left:calc(var(--u)*1.6);top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:calc(var(--u)*.45);padding:calc(var(--u)*.9) calc(var(--u)*1.4) calc(var(--u)*.9) calc(var(--u)*1);background:linear-gradient(90deg,rgba(4,10,22,.75),rgba(4,10,22,.15));font:400 max(10px,calc(var(--u)*1.12))/1 var(--rf);letter-spacing:.03em;text-transform:uppercase;text-shadow:0 1px 3px rgba(0,0,0,.8)}
$ .trk div{display:flex;align-items:center}
$ .trk i{margin-left:.45em;font-style:normal;color:rgba(255,255,255,.5)}
$ .trk i.on{color:#6ef24a}
$ .tl .trb{display:none}
$ .touch.train .tl .trb{display:grid}
$ .train .tl .qb{display:none!important}
$ .train .cb{bottom:calc(var(--u)*1.9)}
$ .portrait .menu.gar .gsx{left:calc(var(--u)*2);right:calc(var(--u)*2);top:calc(var(--u)*2);width:auto}
$ .portrait .menu.gar .gsx .bt{display:none}
$ .portrait .gcl{flex-direction:row;overflow-x:auto;gap:calc(var(--u)*.6);padding-bottom:4px;scrollbar-width:none}
$ .portrait .gcb{flex:none;width:auto;min-width:calc(var(--u)*19)}
$ .portrait .gpn{left:calc(var(--u)*2);right:calc(var(--u)*2);width:auto;top:auto;bottom:calc(var(--u)*17);height:47%}
$ .portrait .ghk{left:calc(var(--u)*3);bottom:calc(var(--u)*11.6)}
$ .portrait .gpn{overflow-y:auto;scrollbar-width:thin}
$ .portrait .gpn .gmd{display:none}
$ .portrait .gpn .gg{flex:none;overflow:visible}
$ .portrait .psx{bottom:calc(var(--u)*14)}
$ .portrait .pst{width:100%}
$ .portrait .trk{display:none}
$ .pzp{width:min(92%,calc(var(--u)*24));gap:calc(var(--u)*.38);padding:calc(var(--u)*.5) calc(var(--u)*1.2) calc(var(--u)*1.3);background:linear-gradient(180deg,rgba(14,40,80,.9),rgba(6,20,44,.9))}
$ .pzp .pt{margin:0 0 calc(var(--u)*.5);font-size:max(18px,calc(var(--u)*2.5))}
$ .pzp .rb{width:100%;min-height:max(24px,calc(var(--u)*2.35));justify-content:center;font:500 max(10px,calc(var(--u)*1.08))/1 var(--rf);letter-spacing:.03em;--sk:-4deg}
$ .pzp .rb::before{background:linear-gradient(180deg,#24609c,#123e6e);box-shadow:inset 0 1px 0 rgba(170,220,255,.5),inset 0 0 0 1px rgba(110,180,240,.35)}
$ .pzp .rb.on{color:#0f4d86}
$ .pzm{position:absolute;right:0;top:43%;min-width:calc(var(--u)*15);padding:calc(var(--u)*.45) calc(var(--u)*1.2) calc(var(--u)*.45) calc(var(--u)*3);box-sizing:border-box;text-align:right;background:linear-gradient(90deg,transparent,rgba(6,16,34,.85) 25%);font-family:var(--rf);text-transform:uppercase}
$ .pzm b{display:block;font:400 max(12px,calc(var(--u)*1.55))/1 var(--rf);color:#7fc4ff;letter-spacing:.03em}
$ .pzm small{display:block;margin-top:calc(var(--u)*.3);font:500 max(9px,calc(var(--u)*.9))/1 var(--rf);color:#fff;letter-spacing:.05em}
$ .pz .mbb{z-index:0}
$ .pz .plb{z-index:1}
$ .wrap{--sk:-5deg}
$ .mm{width:calc(var(--u)*44)}
$ .mm>.md{display:none}
$ .mm{left:calc(var(--u)*1.7);bottom:calc(var(--u)*12.6)}
$ .ml{width:calc(var(--u)*18);gap:calc(var(--u)*.3)}
$ .ml .rb{min-height:calc(var(--u)*2.55);padding:0 calc(var(--u)*2.4) 0 calc(var(--u)*1.1);flex-direction:column;align-items:flex-start;justify-content:center;gap:0;font:500 max(11px,calc(var(--u)*1.17))/1 var(--rf);letter-spacing:.035em}
$ .ml .rb::before{background:linear-gradient(90deg,rgba(3,5,8,.9),rgba(9,11,15,.86));box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}
$ .ml .rb>small{display:none;margin:calc(var(--u)*.14) 0 0;font:500 max(8px,calc(var(--u)*.74))/1 var(--rf);letter-spacing:.04em;color:#2c6aa0}
$ .ml .rb.on{color:#1c5486;min-height:calc(var(--u)*2.95)}
$ .ml .rb.on>small{display:block;color:#2c6aa0}
$ .ml .rb.on::before{background:linear-gradient(100deg,#eef9ff,#cbe9fc 40%,#a2d2f3);box-shadow:inset 0 0 0 1px rgba(255,255,255,.75),0 0 calc(var(--u)*.7) rgba(140,210,255,.45)}
$ .ml .rb.act{color:#fff}
$ .ml .rb.act>small{display:block;color:rgba(200,230,255,.8)}
$ .ml .dmd{position:absolute;right:calc(var(--u)*1.05);top:50%;width:calc(var(--u)*.6);height:calc(var(--u)*.6);transform:translateY(-50%) rotate(45deg);background:linear-gradient(135deg,#fff6c8,#f5c94a);box-shadow:0 0 calc(var(--u)*.45) rgba(255,205,90,.85)}
$ .ms{width:calc(var(--u)*19)}
$ .ms .rb::before{background:linear-gradient(90deg,rgba(3,5,8,.86),rgba(9,11,15,.8))}
$ .mnr{position:absolute;right:calc(var(--u)*3.9);top:calc(var(--u)*11.8);width:calc(var(--u)*17.2);display:flex;flex-direction:column;gap:calc(var(--u)*.9);font-family:var(--rf);pointer-events:auto}
$ .mnc{position:relative;height:calc(var(--u)*10.6);overflow:hidden;cursor:pointer;background:radial-gradient(ellipse at 72% 38%,rgba(110,150,255,.4),transparent 52%),linear-gradient(165deg,#163a78,#08193a 62%,#050e22);box-shadow:inset 0 0 0 1px rgba(120,190,255,.3)}
$ .mnc b{position:absolute;left:calc(var(--u)*1);top:calc(var(--u)*.7);font:italic 800 max(14px,calc(var(--u)*2.3))/1 var(--rf);letter-spacing:.01em;text-transform:uppercase;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.6)}
$ .mnc small{position:absolute;left:calc(var(--u)*1.1);top:calc(var(--u)*3.1);font:600 max(8px,calc(var(--u)*.8))/1 var(--rf);letter-spacing:.08em;text-transform:uppercase;color:#8fd0ff}
$ .mnb{position:absolute;right:calc(var(--u)*1);top:calc(var(--u)*1.2);width:calc(var(--u)*8.6);height:calc(var(--u)*6.6)}
$ .mnb u{position:absolute;width:calc(var(--u)*4.4);height:calc(var(--u)*4.4);border-radius:50%;box-shadow:inset 0 0 0 calc(var(--u)*.18) rgba(255,255,255,.18),inset calc(var(--u)*-.6) calc(var(--u)*-.7) calc(var(--u)*1) rgba(0,0,0,.45),0 0 calc(var(--u)*1.2) rgba(150,170,255,.45)}
$ .mnb u:nth-child(1){left:0;top:calc(var(--u)*1.7);background:radial-gradient(circle at 38% 32%,#c58cff,#6a2cc8 55%,#2a0d5c)}
$ .mnb u:nth-child(2){left:calc(var(--u)*2.2);top:0;background:radial-gradient(circle at 38% 32%,#7ab8ff,#1f5ad8 55%,#0a2066)}
$ .mnb u:nth-child(3){left:calc(var(--u)*3.9);top:calc(var(--u)*2);background:radial-gradient(circle at 38% 32%,#ff8a7a,#d02a1c 55%,#5a0a06)}
$ .mnp{position:absolute;left:calc(var(--u)*.9);right:calc(var(--u)*.9);bottom:calc(var(--u)*1.7);height:calc(var(--u)*1.05);background:rgba(4,12,30,.85);box-shadow:inset 0 0 0 1px rgba(110,170,240,.35)}
$ .mnp u{display:block;height:100%;background:linear-gradient(90deg,#2f8cff,#7fd2ff)}
$ .mnc em{position:absolute;right:calc(var(--u)*1.3);bottom:calc(var(--u)*1.82);font:500 max(8px,calc(var(--u)*.78))/1 var(--rf);font-style:normal;color:#dff2ff}
$ .mnd{position:absolute;left:0;right:0;bottom:calc(var(--u)*.55);display:flex;justify-content:center;gap:calc(var(--u)*.25)}
$ .mnd i{width:calc(var(--u)*.9);height:calc(var(--u)*.18);background:rgba(255,255,255,.3)}
$ .mnd i.on{width:calc(var(--u)*2);background:#fff}
$ .mnch{padding:calc(var(--u)*.7) calc(var(--u)*.5) calc(var(--u)*.8);background:linear-gradient(180deg,rgba(28,78,150,.93),rgba(14,46,104,.93));box-shadow:inset 0 0 0 1px rgba(130,200,255,.55),0 0 calc(var(--u)*.8) rgba(40,120,220,.35)}
$ .mnch h4{margin:0 0 calc(var(--u)*.5);text-align:center;font:italic 600 max(12px,calc(var(--u)*1.75))/1 var(--rf);letter-spacing:.01em;text-transform:uppercase;color:#fff}
$ .mnch h4 small{display:block;margin-top:calc(var(--u)*.12);font:italic 600 max(8px,calc(var(--u)*.95))/1 var(--rf);color:#56b8ff}
$ .mcr{position:relative;margin-top:calc(var(--u)*.35);padding:calc(var(--u)*.45) calc(var(--u)*.5) calc(var(--u)*.4);background:rgba(54,118,200,.42);box-shadow:inset 0 1px 0 rgba(160,210,255,.25)}
$ .mcr span{display:block;font:400 max(8px,calc(var(--u)*.8))/1.15 var(--tf);color:#e6f3ff}
$ .mcr i{display:block;height:calc(var(--u)*.85);margin-top:calc(var(--u)*.35);background:rgba(6,16,38,.9)}
$ .mcr i u{display:block;height:100%;background:linear-gradient(90deg,#2f8cff,#7fd2ff)}
$ .mcr em{position:absolute;right:calc(var(--u)*.7);bottom:calc(var(--u)*.47);font:500 max(7px,calc(var(--u)*.7))/1 var(--rf);font-style:normal;color:#fff}
$ .mvc{display:block;width:94%;height:calc(var(--u)*2.1);margin:calc(var(--u)*.8) auto 0;border:0;cursor:pointer;color:#fff;font:500 max(9px,calc(var(--u)*.95))/1 var(--rf);letter-spacing:.04em;text-transform:uppercase;background:linear-gradient(180deg,#4a90cc,#245e9c);box-shadow:inset 0 1px 0 rgba(200,235,255,.5);clip-path:polygon(1.5% 0,100% 0,98.5% 100%,0 100%)}
$ .mvc:hover{background:linear-gradient(180deg,#eef9ff,#a2d2f3);color:#1c5486}
$ .mnw{position:absolute;right:0;top:calc(var(--u)*19);width:calc(var(--u)*2.7);height:calc(var(--u)*10);display:grid;place-items:center;background:linear-gradient(90deg,rgba(14,22,36,.9),rgba(4,8,14,.94));clip-path:polygon(32% 0,100% 0,100% 100%,32% 100%,0 88%,0 12%);font:600 max(10px,calc(var(--u)*1.35))/1 var(--rf);letter-spacing:.12em;text-transform:uppercase;color:#fff;writing-mode:vertical-rl;transform:rotate(180deg);pointer-events:none}
$ .mbb{position:absolute;left:0;right:0;bottom:0;height:calc(var(--u)*2.5);background:linear-gradient(180deg,rgba(8,12,20,.9),rgba(2,4,8,.96));box-shadow:inset 0 1px 0 rgba(70,150,230,.5);pointer-events:none}
$ .mcp{position:absolute;left:calc(var(--u)*21.6);bottom:calc(var(--u)*2.5);height:calc(var(--u)*2.4);padding:0 calc(var(--u)*1.6) 0 calc(var(--u)*1);border:0;cursor:pointer;pointer-events:auto;color:#fff;font:500 max(9px,calc(var(--u)*.85))/1 var(--rf);letter-spacing:.04em;text-transform:uppercase;background:linear-gradient(90deg,rgba(8,12,20,.9),rgba(8,12,20,.7));clip-path:polygon(0 0,88% 0,100% 100%,0 100%)}
$ .mcp:hover{color:var(--cy)}
$ .menu.gar .mnr,$ .menu.pas .mnr{display:none}
$ .plv{bottom:calc(var(--u)*-1.7);min-width:calc(var(--u)*2.2);height:calc(var(--u)*2.4);padding:calc(var(--u)*.5) 0 0;clip-path:polygon(50% 100%,0 70%,0 6%,50% 0,100% 6%,100% 70%);background:linear-gradient(180deg,#d8e8f6,#8fa8c0);color:#fff;font:500 max(9px,calc(var(--u)*1.05))/1 var(--rf)}
$ .plv::before{content:'';position:absolute;inset:max(1px,calc(var(--u)*.14));z-index:-1;clip-path:inherit;background:linear-gradient(180deg,#2a5d96,#122f58)}
$ .plv{isolation:isolate}
$ .pnm{background:linear-gradient(90deg,#22558a,#2f6aa2 55%,#3b7ab2);box-shadow:inset 0 1px 0 rgba(160,210,255,.3)}
$ .pnm span small{color:#a9d6fb;font-weight:500}
$ .pxp{left:calc(var(--u)*3.3);bottom:calc(var(--u)*-.95);width:calc(var(--u)*14.5);height:max(3px,calc(var(--u)*.42));background:rgba(14,30,56,.85)}
$ .pxp u{position:relative;min-width:2px;background:linear-gradient(90deg,#1c78d8,#55bfff 80%,#bfeaff);box-shadow:0 0 6px rgba(90,190,255,.7)}
$ .pxp u::after{content:'';position:absolute;right:-1px;top:-90%;width:max(2px,calc(var(--u)*.18));height:280%;border-radius:2px;background:#fff1d0;box-shadow:0 0 6px 2px rgba(255,150,40,.9)}
$ .psc{position:absolute;left:calc(var(--u)*4);right:calc(var(--u)*4);top:calc(var(--u)*2.4);bottom:calc(var(--u)*4.2);display:flex;flex-direction:column}
$ .pbt{margin:0 0 calc(var(--u)*2.2);font:300 calc(var(--u)*9.5)/.9 var(--rf);letter-spacing:.02em;text-transform:uppercase;color:rgba(255,255,255,.04);-webkit-text-stroke:max(1px,calc(var(--u)*.11)) rgba(255,255,255,.6)}
$ .ptl{display:flex;gap:calc(var(--u)*1.3)}
$ .ptl .ptt{flex:1;width:auto;height:calc(var(--u)*25);padding:0;flex-direction:column;align-items:flex-start;justify-content:flex-end;gap:0;white-space:normal;overflow:hidden;color:#fff}
$ .ptl .ptt::before{transform:none;background:linear-gradient(180deg,rgba(16,44,92,.86),rgba(5,14,32,.95));box-shadow:inset 0 0 0 1px rgba(110,180,240,.45)}
$ .ptl .ptt.on{color:#fff}
$ .ptl .ptt.on::before{background:linear-gradient(180deg,rgba(44,116,198,.92),rgba(10,40,90,.95));box-shadow:inset 0 0 0 2px #bfe8ff,0 0 calc(var(--u)*1.4) rgba(110,200,255,.7)}
$ .ptt b{position:relative;padding:0 calc(var(--u)*1.3);font:500 max(14px,calc(var(--u)*2))/1 var(--rf);letter-spacing:.02em}
$ .ptt>small{position:relative;margin:0;padding:calc(var(--u)*.45) calc(var(--u)*1.3) calc(var(--u)*1.5);font:500 max(9px,calc(var(--u)*.9))/1 var(--rf);letter-spacing:.06em;color:#8fcfff}
$ .ptl .ptt.on>small{color:#d6f0ff}
$ .plx{position:absolute;left:0;right:0;top:0;bottom:calc(var(--u)*5.6);overflow:hidden;background:repeating-linear-gradient(115deg,rgba(255,255,255,.035) 0 calc(var(--u)*.5),transparent calc(var(--u)*.5) calc(var(--u)*2.2))}
$ .plx u{position:absolute;top:50%;width:calc(var(--u)*9);height:calc(var(--u)*9);border-radius:50%;transform:translate(-50%,-50%)}
$ .p-online u:nth-child(1){left:36%;background:radial-gradient(circle at 40% 35%,#7fb6ff,#2160e0 50%,rgba(20,60,200,0) 72%)}
$ .p-online u:nth-child(2){left:64%;background:radial-gradient(circle at 40% 35%,#ffc07a,#ef6d18 50%,rgba(220,90,10,0) 72%)}
$ .p-cpu u:nth-child(1){left:50%;background:radial-gradient(circle at 38% 32%,#fff,#c9d2dc 35%,#58616e 70%,#1d222a 72%,transparent 74%);box-shadow:0 0 calc(var(--u)*2) rgba(150,200,255,.5)}
$ .p-cpu u:nth-child(2){left:50%;width:calc(var(--u)*13);height:calc(var(--u)*13);background:radial-gradient(circle,transparent 60%,rgba(120,200,255,.35) 62%,transparent 66%)}
$ .p-train u:nth-child(1){left:50%;background:repeating-radial-gradient(circle,#ff9a2a 0 calc(var(--u)*.7),rgba(255,154,42,.12) calc(var(--u)*.7) calc(var(--u)*1.5));-webkit-mask:radial-gradient(circle,#000 66%,transparent 70%);mask:radial-gradient(circle,#000 66%,transparent 70%)}
$ .p-train u:nth-child(2){left:50%;width:calc(var(--u)*1.8);height:calc(var(--u)*1.8);background:#fff;box-shadow:0 0 calc(var(--u)*1) #ffd27a}
$ .psc .md{margin-top:calc(var(--u)*1.2)}
$ .portrait .ptl{flex-direction:column}
$ .barw{position:absolute;width:calc(var(--u)*2.8);height:calc(var(--u)*2.2);pointer-events:none;background:linear-gradient(90deg,rgba(255,255,255,.35),#fff);clip-path:polygon(0 18%,55% 18%,55% 0,100% 50%,55% 100%,55% 82%,0 82%);filter:drop-shadow(0 0 2px rgba(0,0,0,.9));opacity:.85}
$ .pzo .vh .barw,$ .fxrep .vh .barw{display:none}
$ .portrait .pbt{margin-bottom:calc(var(--u)*6);font-size:calc(var(--u)*12)}
$ .wrap:not(.portrait) .msx.mtx{top:calc(var(--u)*6);bottom:auto;justify-content:flex-start}
$ .ptt.dis .plx{opacity:.55}
$ .ptt.dis .plx::before,$ .ptt.dis .plx::after{content:'';position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)}
$ .p-cas .plx::before{width:calc(var(--u)*6);height:calc(var(--u)*6);border-radius:50%;background:radial-gradient(circle at 38% 32%,#fff,#bfd2dc 35%,#4f6672 70%,#1d2a30 72%,transparent 74%)}
$ .p-cas .plx::after{width:calc(var(--u)*12);height:calc(var(--u)*2.4);margin-top:calc(var(--u)*3);border-radius:50%;background:radial-gradient(ellipse,rgba(120,255,240,.45),transparent 70%)}
$ .p-cmp .plx::before{width:calc(var(--u)*6.2);height:calc(var(--u)*7);clip-path:polygon(50% 0,100% 18%,100% 62%,50% 100%,0 62%,0 18%);background:linear-gradient(180deg,#ffd27a,#e0701e 60%,#7a2a08)}
$ .p-cmp .plx::after{width:calc(var(--u)*3.2);height:calc(var(--u)*3.6);clip-path:polygon(50% 0,100% 18%,100% 62%,50% 100%,0 62%,0 18%);background:rgba(60,16,2,.75)}
$ .p-trn .plx::before{width:calc(var(--u)*5.6);height:calc(var(--u)*4.4);margin-top:calc(var(--u)*-.8);border-radius:0 0 calc(var(--u)*2.8) calc(var(--u)*2.8);background:linear-gradient(180deg,#e8ffb0,#9ac83a 55%,#4a6a14)}
$ .p-trn .plx::after{width:calc(var(--u)*4.2);height:calc(var(--u)*1);margin-top:calc(var(--u)*2.6);background:#2e4410;box-shadow:0 calc(var(--u)*-.9) 0 calc(var(--u)*-.3) #9ac83a}
$ .msx .sgs{width:58%;min-height:calc(var(--u)*2.3);margin:calc(var(--u)*.2) 0 0 42%;justify-content:center;font-size:max(10px,calc(var(--u)*1.1))}
$ .msx .sgs:first-of-type{margin-top:calc(var(--u)*1.2)}
$ .msx .sgs::before{transform:skewX(-10deg)!important;background:linear-gradient(90deg,rgba(3,5,8,.9),rgba(9,11,15,.86))}
$ .msx .sgs.on{color:#0f4d86}
$ .msx .sgs.on::before{background:linear-gradient(180deg,#e2f5ff,#92cdf1)}
$ .msx.mtx{width:auto;right:calc(var(--u)*3)}
$ .msx.mtx .bt small{margin-left:calc(var(--u)*1);font:italic 500 .55em/1 var(--rf);color:#6fc0ff}
$ .mcs{display:flex;gap:calc(var(--u)*1.6);align-items:flex-start}
$ .mcs .sl{width:calc(var(--u)*24)}
$ .mcs h6{margin:0 0 calc(var(--u)*.3);font:italic 600 max(11px,calc(var(--u)*1.3))/1 "Rajdhani",var(--rf);letter-spacing:.04em;text-transform:uppercase;color:#6fc0ff}
$ .msx .so.dis{opacity:1}
$ .msx .so.dis>b,$ .msx .so.dis>i{opacity:.45}
$ .portrait .mcs{flex-direction:column;gap:calc(var(--u)*.6)}
$ .portrait .mcs .sl{width:100%}
$ .otb{flex-wrap:nowrap}
$ .ot{padding:0 calc(var(--u)*.75);font-size:max(10px,calc(var(--u)*1.15))}
$ .osb select{width:calc(var(--u)*7.2)}
$ .nobci .vh .cb{display:none}
$ .osh{margin:calc(var(--u)*.6) 0 calc(var(--u)*.3);padding-left:calc(var(--u)*.6);font:600 max(10px,calc(var(--u)*1.1))/1 "Rajdhani",var(--rf);letter-spacing:.06em;text-transform:uppercase;color:#5ab8ff}
$ .osb select{flex:0 0 auto;width:calc(var(--u)*8.5);height:max(22px,calc(var(--u)*2.3));margin-left:calc(var(--u)*.4);border:0;background:linear-gradient(90deg,#03080f,#0c1726);box-shadow:inset 0 0 0 1px rgba(120,190,240,.55);color:#fff;font:500 max(10px,calc(var(--u)*1.05))/1 var(--tf)}
$ .ob .osb>span{flex:0 0 24%}
$ .ban .gn{color:rgba(0,0,0,.18);-webkit-text-stroke:max(1.2px,calc(var(--u)*.12)) #ffc24a;filter:drop-shadow(0 0 1px rgba(0,0,0,.95)) drop-shadow(0 0 calc(var(--u)*.25) rgba(0,0,0,.75)) drop-shadow(0 0 calc(var(--u)*.4) rgba(255,150,30,.55))}
$ .ban.gol::before{content:'';position:absolute;left:12%;right:12%;top:-30%;height:160%;z-index:-1;background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,.32),transparent 70%);pointer-events:none}
$ .ban.gol{isolation:isolate}
$ .tab .stm.t0{--tc:#8cc2ff}
$ .tab .stm.t1{--tc:#ffb878}
$ .tab .sth .tn div{filter:none;text-shadow:0 0 .25em rgba(0,0,0,.95),0 0 .6em rgba(0,0,0,.7),0 0 .5em var(--tc)}
$ .wrap .tab{padding:calc(var(--u)*1) calc(var(--u)*1.4);background:radial-gradient(ellipse at 50% 50%,rgba(2,6,14,.55),rgba(2,6,14,.25) 70%,transparent)}
$ .tab .sth>span{color:#fff}
$ .wrap:not(.portrait) .menu.gar .gmd{transition:left .08s,top .08s}
$ .gmd .gnt{display:block;margin-top:calc(var(--u)*.7);font:500 max(8px,calc(var(--u)*.8))/1 var(--rf);text-decoration:none;letter-spacing:.04em;text-transform:uppercase;color:#ffd34a}
$ .gmd em.ok,$ .gmd em.eq{color:#9fd8ff}
$ .gmd em.eq{color:#7fe08f}
$ .tab .sth .tn div,$ .ps .sth .tn div{filter:brightness(1.35)}
$ .ban.cdn .bt{-webkit-text-stroke-width:max(1.5px,calc(var(--u)*.17));letter-spacing:.06em}
$ .wrap:not(.portrait) .ld .mlg{display:none}
$ .wrap:not(.portrait) .lar{top:calc(var(--u)*3.4);bottom:auto;left:calc(var(--u)*4.4);flex-direction:column-reverse;gap:calc(var(--u)*.5)}
$ .wrap:not(.portrait) .lar b{font-size:calc(var(--u)*5);font-weight:300;letter-spacing:.04em;color:#eaf6ff;text-shadow:0 0 calc(var(--u)*.6) rgba(80,170,255,.45)}
$ .wrap:not(.portrait) .lar small{font-weight:600;font-size:max(9px,calc(var(--u)*1.05));letter-spacing:.06em;color:#5fb8ff}
$ .portrait .lar{display:none}
$ .wrap:not(.touch) .qc{top:58%;width:max(160px,calc(var(--u)*17));padding:calc(var(--u)*.6) calc(var(--u)*1) calc(var(--u)*.8);background:linear-gradient(90deg,rgba(2,6,14,.55),rgba(2,6,14,0));box-shadow:none}
$ .qch{display:block;font:500 max(8px,calc(var(--u)*.8))/1 var(--rf);letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.55)}
$ .wrap:not(.touch) .qc h4{margin:calc(var(--u)*.2) 0 calc(var(--u)*.4);font:500 max(12px,calc(var(--u)*1.45))/1 var(--rf);color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.8)}
$ .wrap:not(.touch) .qc button{min-height:max(20px,calc(var(--u)*2));margin-top:0;padding:0;gap:calc(var(--u)*1);background:none;color:rgba(255,255,255,.85);font-size:max(10px,calc(var(--u)*1.1));text-shadow:0 1px 3px rgba(0,0,0,.85)}
$ .wrap:not(.touch) .qc button:hover{background:none;color:#fff}
$ .wrap:not(.touch) .qc kbd{min-width:0;width:auto;height:auto;padding:0;background:none;box-shadow:none;border-radius:0;color:rgba(255,255,255,.75);font:inherit}
$ .touch .qch{display:none}
$ .ban .gn{-webkit-text-stroke-width:max(1px,calc(var(--u)*.12));filter:drop-shadow(0 0 calc(var(--u)*.12) rgba(0,0,0,.7)) drop-shadow(0 0 calc(var(--u)*.35) rgba(255,150,30,.75))}
$ .msx .so::before,$ .msx .sgo::before{transform:skewX(-10deg)!important}
$ .msx .so>i{font:700 1.5em/1 var(--rf);color:#fff;opacity:1}
$ .msx .so>b{font-weight:500}
$ .pzp{background:linear-gradient(180deg,rgba(14,40,80,.8),rgba(6,20,44,.8))}
$ .pzp .pt{font-size:max(16px,calc(var(--u)*2.1))}
$ .pzp .rb{font-weight:500}
$ .menu.psn .mvg{background:radial-gradient(ellipse at 50% 45%,rgba(2,8,24,.35),rgba(2,6,16,.7))}
$ .wrap:not(.portrait) .ptl{flex-wrap:wrap;justify-content:center;width:calc(var(--u)*72);margin-top:calc(var(--u)*6.5)}
$ .wrap:not(.portrait) .ptl .ptt{width:calc(var(--u)*22.6);height:calc(var(--u)*13)}
$ .ptl .ptt.dis{opacity:1;cursor:default}
$ .ptl .ptt.dis::before{background:linear-gradient(160deg,#2a3d58,#141e30);filter:grayscale(.6)}
$ .ptl .ptt.p-cas::before{background:linear-gradient(160deg,#1f8f9a,#0d4a66)}
$ .ptl .ptt.p-cmp::before{background:linear-gradient(160deg,#e0701e,#8a2a0c)}
$ .ptl .ptt.p-trn::before{background:linear-gradient(160deg,#6a9a3a,#24461c)}
$ .ptt.dis>b,$ .ptt.dis>small{opacity:.45}
$ .pun{position:absolute;left:0;right:0;top:34%;text-align:center;font:600 max(10px,calc(var(--u)*1.25))/1 "Rajdhani",var(--rf);font-style:normal;letter-spacing:.1em;text-transform:uppercase;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.8)}
$ .pun::before{content:'';display:block;width:calc(var(--u)*2.6);height:calc(var(--u)*2.6);margin:0 auto calc(var(--u)*.5);border-radius:50%;box-shadow:inset 0 0 0 calc(var(--u)*.28) #fff;background:linear-gradient(45deg,transparent 45%,#fff 45%,#fff 55%,transparent 55%)}
$ .portrait .ptt.dis{display:none}
$ .bd.on .bl{opacity:0}
$ .bd.full .bl{opacity:.6;color:#d8d8d8;font-weight:500;letter-spacing:.1em}
$ .end:not(.pod) .mvg{background:linear-gradient(90deg,rgba(2,6,14,.72),rgba(2,6,14,.5) 45%,rgba(2,6,14,.45))}
$ .ps .sbr{opacity:.88}
$ .wrap:not(.portrait) .pml{width:calc(var(--u)*17);bottom:calc(var(--u)*12)}
$ .wrap:not(.portrait) .pml .rb{min-height:calc(var(--u)*2.2);font-size:max(10px,calc(var(--u)*1.05));font-weight:500}
$ .portrait .mcp,$ .portrait .gmc,$ .portrait .pzm{display:none}
$ .portrait .mm.grt{width:auto}
$ .portrait .grt .ml{width:100%}
$ .wrap:not(.touch) .tl .pb{opacity:0;transition:opacity .2s}
$ .wrap:not(.touch) .tl .pb:hover,$ .wrap:not(.touch) .tl .pb:focus-visible{opacity:1}
$ .wrap:not(.touch):not(.split) .bd{width:calc(var(--u)*12.4);height:calc(var(--u)*12.4);right:calc(var(--u)*1.3);bottom:calc(var(--u)*.9)}
$ .wrap:not(.touch):not(.split) .bd .bn{font-size:calc(var(--u)*3.55)}
$ .wrap:not(.touch):not(.split) .bd .bl{font-size:calc(var(--u)*.8)}
$ .ban .cd{color:#ffc24a;filter:drop-shadow(0 0 calc(var(--u)*.3) rgba(255,160,30,.75))}
$ .ban .cd .h{stroke-width:2.4}
$ .ban.cdn .bt{-webkit-text-stroke:max(1px,calc(var(--u)*.13)) #ffc24a;filter:drop-shadow(0 0 calc(var(--u)*.3) rgba(255,160,30,.75))}
$ .ban .gn{-webkit-text-stroke:max(1px,calc(var(--u)*.1)) #ffc24a;filter:drop-shadow(0 0 calc(var(--u)*.3) rgba(255,150,30,.8)) drop-shadow(0 0 calc(var(--u)*.08) rgba(255,200,90,.9))}
$ .ml .rb,$ .pzp .rb,$ .ctl .rb,$ .ob .orw>span,$ .msx .so>span{font-weight:500}
$ .ml .rb:not(.on),$ .ctl .rb:not(.on){color:#e4e4e4}
$ .ob .orw>span{color:#c9d2dc}
$ .ml,$ .ctl{--sk:-12deg}
$ .ml .rb{padding-left:calc(var(--u)*1.3)}
$ .ml .rb,$ .pzp .rb,$ .ctl .rb,$ .pml .rb,$ .dlg .db .rb,$ .ot,$ .ob .orw>span,$ .mvc,$ .mcp,$ .wrap:not(.portrait) .menu .hk>span,$ .wrap:not(.portrait) .op .hk>span,$ .msx .so,$ .msx .sgo,$ .ptt b,$ .ptt>small,$ .mnc small,$ .mnch h4 small,$ .gph small,$ .pzm small,$ .ml .rb>small{font-family:"Rajdhani",var(--rf);font-weight:600}
$ .ml .rb{font-size:max(12px,calc(var(--u)*1.32))}
$ .ml .rb>small{font-size:max(9px,calc(var(--u)*.82))}
$ .pzp .rb,$ .ctl .rb{font-size:max(11px,calc(var(--u)*1.2))}
$ .ob .orw>span{font-size:max(11px,calc(var(--u)*1.3))}
$ .cb small{font-weight:500;letter-spacing:.07em;color:rgba(230,230,230,.85)}
$ .wrap .cb small kbd{font-size:1em;line-height:1;text-transform:uppercase}
$ .cb.on b{text-shadow:0 0 .35em rgba(255,70,40,.75),0 1px 3px rgba(0,0,0,.6)}
$ .grt .gbt{margin:0 0 calc(var(--u)*.5);font:300 max(28px,calc(var(--u)*4.6))/1 var(--rf);letter-spacing:.02em;text-transform:uppercase;color:#fff;text-shadow:0 0 calc(var(--u)*.6) rgba(0,0,0,.4)}
$ .mm.grt>.md{display:block;margin-top:calc(var(--u)*.6);font-size:max(10px,calc(var(--u)*1.05))}
$ .mm.grt{width:calc(var(--u)*24)}
$ .grt .ml{width:calc(var(--u)*24)}
$ .gmc{top:43%}
$ .feed{gap:calc(var(--u)*.35)}
$ .feed>div{gap:0;font-size:max(9px,calc(var(--u)*1.1));font-weight:700;letter-spacing:.02em}
$ .feed i{padding:calc(var(--u)*.28) calc(var(--u)*.75)}
$ .feed .ic{width:max(16px,calc(var(--u)*2.3));height:max(16px,calc(var(--u)*2.3));margin-left:calc(var(--u)*-.45);color:#ffd27a}
$ .feed>div.tx{font-size:max(9px,calc(var(--u)*1));font-weight:500}
$ .dlg .dp{width:min(92%,calc(var(--u)*34));padding:calc(var(--u)*.6) calc(var(--u)*1.4) calc(var(--u)*1.2)}
$ .dlg .pt{font-size:max(16px,calc(var(--u)*2.2));margin-bottom:calc(var(--u)*.5)}
$ .dlg .dq{gap:calc(var(--u)*.9);margin:calc(var(--u)*.3) 0 calc(var(--u)*1)}
$ .dlg .dq i{width:calc(var(--u)*2.4);height:calc(var(--u)*2.4);font-size:calc(var(--u)*1.7)}
$ .dlg .dq p{font-size:max(10px,calc(var(--u)*1.05))}
$ .dlg .db .rb{width:40%;min-height:max(22px,calc(var(--u)*2.1));justify-content:center;font-size:max(10px,calc(var(--u)*1));--sk:-6deg}
$ .dlg .db .rb::before{background:linear-gradient(180deg,#24609c,#123e6e);box-shadow:inset 0 1px 0 rgba(170,220,255,.5)}
$ .dlg{background:rgba(2,5,12,.5)}
$ .tab .sth .tn div{text-shadow:0 0 .3em rgba(0,0,0,.95),0 0 .1em rgba(0,0,0,.9)}
$ .sai{display:flex;width:100%;height:100%;align-items:center;justify-content:center;font:700 max(9px,calc(var(--u)*1.2))/1 var(--rf);font-style:normal;color:#fff;background:linear-gradient(180deg,#3f8cff,#1d56d8);text-shadow:0 1px 2px rgba(0,0,0,.4)}
$ .sai.t1{background:linear-gradient(180deg,#ff9a3a,#e2620e)}
$ .wrap:not(.portrait) .ps .sbd{left:calc(var(--u)*30);right:calc(var(--u)*8);top:calc(var(--u)*10.5)}
$ .ps .sbr,$ .tab .sbr{height:max(22px,calc(var(--u)*2.6));min-height:0;font-size:max(10px,calc(var(--u)*1.3))}
$ .ps .sbr .av,$ .tab .sbr .av{overflow:hidden;min-height:0}
$ .ps .sbr .snm b,$ .tab .sbr .snm b{font-size:max(10px,calc(var(--u)*1.3))}
$ .ps .sbr .snm small,$ .tab .sbr .snm small{font-size:max(6px,calc(var(--u)*.62))}
$ .ps .sbr .mv .ic{width:calc(var(--u)*1.7);height:calc(var(--u)*1.7)}
$ .sth .tn small{text-transform:uppercase}
$ .ps .sth{min-height:calc(var(--u)*3.6)}
$ .ps .sth .tn div{font-size:calc(var(--u)*2.5)}
$ .lar{position:absolute;left:calc(var(--u)*5.2);bottom:calc(var(--u)*10.5);display:flex;flex-direction:column;gap:calc(var(--u)*.4);font-family:var(--rf);text-transform:uppercase;pointer-events:none}
$ .lar b{font:300 calc(var(--u)*4.2)/1 var(--rf);letter-spacing:.03em;color:#fff;text-shadow:0 0 calc(var(--u)*.8) rgba(80,170,255,.6)}
$ .lar small{font:500 max(10px,calc(var(--u)*1.1))/1 var(--rf);letter-spacing:.08em;color:#8fd0ff}
$ .bd.n{--bdF0:rgba(74,74,76,.9);--bdF1:rgba(40,40,42,.88);--bdF2:rgba(12,12,13,.9);--bdD:rgba(220,220,220,.35);--bdN:#f2f2f2;--bdG:rgba(255,255,255,.55)}
$ .bd.n:not(.b) .bn .n{stroke:#262628}
$ .ban .gn{color:rgba(255,255,255,.03);background:none;-webkit-text-stroke:max(1px,calc(var(--u)*.09)) #f0b040;filter:drop-shadow(0 0 calc(var(--u)*.3) rgba(255,150,30,.55))}
$ .ban .cd .h{stroke:currentColor;stroke-width:2.1}
$ .ban.cdn{top:31%}
$ .ban .cd{color:#f0b040}
$ .ban.cdn .bt{-webkit-text-stroke-color:#f0b040}
$ .sq{background:linear-gradient(180deg,#3577ff,#2a6aff 60%,#225ce8)}
$ .sq.c1{background:linear-gradient(180deg,#ff8a3e,#ff7a2a 60%,#ee6a1c)}
$ .sq .dg .n{stroke:#2a6aff}
$ .sq.c1 .dg .n{stroke:#ff7a2a}
$ .bd{--bdF0:rgba(130,44,10,.9);--bdF1:rgba(60,18,4,.88);--bdF2:rgba(12,4,1,.92);--bdN:#ff9636;--bdG:rgba(255,110,20,.9)}
$ .bd:not(.b) .bn .n{stroke:#2a0c02}
$ .end .nmx{left:calc(var(--u)*1.6);top:auto;bottom:calc(var(--u)*28);transform:none;min-width:0;padding:0;align-items:flex-start;flex-direction:row;align-items:baseline;gap:calc(var(--u)*.6);background:none}
$ .end .nmx small{font:italic 500 max(10px,calc(var(--u)*1.2))/1 var(--rf);color:#ff9a3a;text-shadow:0 1px 3px rgba(0,0,0,.8)}
$ .end .nmx span{font-size:calc(var(--u)*1.9);color:#ff9a3a}
$ .mfr{position:absolute;right:calc(var(--u)*1.2);bottom:calc(var(--u)*.45);width:calc(var(--u)*1.9);height:calc(var(--u)*1.6);display:grid;place-items:center;background:linear-gradient(180deg,#2a5d96,#173c66);box-shadow:inset 0 0 0 1px rgba(150,200,250,.5)}
$ .mfr svg{width:72%;height:80%;fill:#fff}
$ .wrap:not(.portrait) .menu .hk>span,$ .wrap:not(.portrait) .op .hk>span{position:relative;isolation:isolate;min-height:calc(var(--u)*2.3);padding:0 calc(var(--u)*1.4);font-style:italic;font-weight:500}
$ .wrap:not(.portrait) .menu .hk>span::before,$ .wrap:not(.portrait) .op .hk>span::before{content:'';position:absolute;inset:0;z-index:-1;transform:skewX(-14deg);background:rgba(4,6,10,.88);box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}
$ .wrap:not(.portrait) .menu .hk>span.gdr{font-style:normal;font-weight:400}
$ .wrap:not(.portrait) .menu .hk>span.gdr::before{display:none}
$ .wrap:not(.portrait) .menu .hk,$ .wrap:not(.portrait) .op .hk{gap:calc(var(--u)*.35)}
$ .cb small kbd{display:inline;min-width:0;height:auto;margin:0 .3em;padding:0;background:none;box-shadow:none;border-radius:0;font:inherit;color:inherit}
$ .pdm,$ .pdn{display:none}
$ .end.pod .pdm{position:absolute;left:0;right:0;top:calc(var(--u)*2.4);display:flex;flex-direction:column;align-items:center;font-family:var(--rf);text-transform:uppercase;pointer-events:none}
$ .pdm small{font:400 max(12px,calc(var(--u)*2))/1 var(--rf);letter-spacing:.06em;color:#fff;text-shadow:0 0 calc(var(--u)*.6) rgba(0,0,0,.6)}
$ .pdm b{margin-top:calc(var(--u)*.2);font:300 calc(var(--u)*5.4)/1 var(--rf);letter-spacing:.04em;color:rgba(255,255,255,.04);-webkit-text-stroke:max(1px,calc(var(--u)*.09)) #a8d4ff;filter:drop-shadow(0 0 calc(var(--u)*.5) rgba(50,130,255,.95))}
$ .pdm b.t1{-webkit-text-stroke-color:#ffc890;filter:drop-shadow(0 0 calc(var(--u)*.5) rgba(255,120,20,.95))}
$ .end.pod .pdn{position:absolute;inset:0;display:block;pointer-events:none}
$ .pdn>div{position:absolute;display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%)}
$ .pdn b{padding:calc(var(--u)*.3) calc(var(--u)*1);border-radius:999px;font:600 max(10px,calc(var(--u)*1.15))/1 var(--rf);letter-spacing:.03em;text-transform:uppercase;color:#fff;background:rgba(40,110,240,.85);box-shadow:inset 0 0 0 1px rgba(200,225,255,.55);white-space:nowrap}
$ .pdn .p1 b{background:rgba(240,110,20,.85);box-shadow:inset 0 0 0 1px rgba(255,220,190,.55)}
$ .pmv{display:grid;place-items:center;width:calc(var(--u)*4.4);height:calc(var(--u)*4.4);margin-bottom:calc(var(--u)*.4);border-radius:50%;font:500 max(10px,calc(var(--u)*1.3))/1 var(--rf);font-style:normal;letter-spacing:.04em;color:#ffd27a;box-shadow:inset 0 0 0 calc(var(--u)*.22) #ffb23c,0 0 calc(var(--u)*1.2) rgba(255,160,40,.85),inset 0 0 calc(var(--u)*1) rgba(255,160,40,.6);text-shadow:0 0 calc(var(--u)*.5) rgba(255,150,30,.9)}
$ .end.pod .mvg{background:linear-gradient(0deg,rgba(2,6,14,.45),transparent 30%)}
$ .end.pod .nmx,$ .end.pod .plb{visibility:hidden}
$ .sb .clk.ot{color:#f6f9ff}
$ .sb .clk .otx{display:none;font:400 calc(var(--u)*1.75)/1 var(--rf);letter-spacing:.03em;text-transform:uppercase;color:#fff}
$ .sb .clk.otn .dg{display:none}
$ .sb .clk.otn .otx{display:block}
$ .wrap .tab{top:50%;background:none;box-shadow:none;-webkit-backdrop-filter:none;backdrop-filter:none;border:0}
$ .tab .tm{flex-direction:column;gap:calc(var(--u)*.4);margin-bottom:calc(var(--u)*.4)}
$ .tab .tm b{font:300 max(20px,calc(var(--u)*3.4))/1 var(--rf);letter-spacing:.04em;color:#fff;text-shadow:0 0 calc(var(--u)*.6) rgba(0,0,0,.6)}
$ .tab .tm span{font-size:max(8px,calc(var(--u)*.85));text-shadow:0 1px 3px rgba(0,0,0,.8)}
$ .tab .sbr{min-height:max(20px,calc(var(--u)*2.7));opacity:.9}
$ .tab .sth>span{text-shadow:0 1px 3px rgba(0,0,0,.8)}
$ .ban .wn{margin-top:1%}
$ .ban .wn::before{content:'';width:calc(var(--u)*2.6);height:calc(var(--u)*2.6);margin-bottom:calc(var(--u)*.7);border-radius:50%;box-shadow:inset 0 0 0 calc(var(--u)*.3) var(--wl),0 0 calc(var(--u)*1.2) var(--wg),0 0 0 200vmax rgba(2,4,10,.4)}
$ .ban .wn small{margin-bottom:calc(var(--u)*.45);font-size:max(11px,calc(var(--u)*1.5));color:var(--wl);text-shadow:0 0 calc(var(--u)*.6) var(--wg)}
$ .ban .wn em{font-size:calc(var(--u)*2.2)}
$ .ban .wn b{margin-top:calc(var(--u)*.2);font-size:calc(var(--u)*7);color:rgba(255,255,255,.04);-webkit-text-stroke:max(1px,calc(var(--u)*.1)) var(--wl);text-shadow:none;filter:drop-shadow(0 0 calc(var(--u)*.5) var(--wg))}
$ .wrap:not(.portrait) .trp{display:none}
$ .wrap:not(.portrait) .trk{left:auto;right:calc(var(--u)*1.1);top:calc(var(--u)*.7);transform:none;align-items:flex-end;gap:calc(var(--u)*.2);padding:0;background:none;font:400 max(10px,calc(var(--u)*1.28))/1.2 "Segoe UI",Roboto,Arial,sans-serif;text-transform:none;letter-spacing:0;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.9),0 0 4px rgba(0,0,0,.5)}
$ .wrap:not(.portrait) .trk div{gap:.4em}
$ .wrap:not(.portrait) .trk kbd{order:2;display:inline;overflow:visible;margin:0;padding:0;min-width:0;height:auto;border:0;border-radius:0;background:none;box-shadow:none;color:#4fd8e0;font:inherit;text-transform:none}
$ .pzo .vh .trk{display:none}
$ .wrap:not(.portrait) .trk i{order:1;margin:0;text-transform:uppercase;font-size:.85em}
$ .wrap:not(.portrait) .psc{left:0;right:0;top:calc(var(--u)*1.2);bottom:auto;align-items:center}
$ .wrap:not(.portrait) .pbt{position:absolute;left:calc(var(--u)*1.8);top:0;margin:0;font-size:calc(var(--u)*11);color:rgba(255,255,255,.06);-webkit-text-stroke:max(1px,calc(var(--u)*.1)) rgba(255,255,255,.22)}
$ .wrap:not(.portrait) .ptl{margin-top:calc(var(--u)*10.5);gap:calc(var(--u)*1)}
$ .wrap:not(.portrait) .ptl .ptt{flex:none;width:calc(var(--u)*22.6);height:calc(var(--u)*14)}
$ .wrap:not(.portrait) .psc .md{text-align:center}
$ .ptl .ptt::before{box-shadow:inset 0 0 0 max(1px,calc(var(--u)*.1)) #3fa0ff}
$ .ptl .ptt.on::before{box-shadow:inset 0 0 0 max(2px,calc(var(--u)*.2)) #bfe8ff,0 0 calc(var(--u)*1.4) rgba(110,200,255,.75)}
$ .ptl .ptt[data-p="online"]::before{background:radial-gradient(ellipse at 50% 30%,#b44fc0,#5a2a9c 45%,#2a1458 80%)}
$ .ptl .ptt[data-p="cpu"]::before{background:radial-gradient(ellipse at 50% 30%,#2f8cf0,#14489c 50%,#0a2050 85%)}
$ .ptl .ptt[data-p="train"]::before{background:radial-gradient(ellipse at 50% 30%,#c040e0,#6a1c9c 50%,#300c50 85%)}
$ .ptl .ptt.on[data-p]::before{filter:brightness(1.18)}
$ .ptt b{font:italic 600 max(13px,calc(var(--u)*1.75))/1 var(--rf);letter-spacing:.02em;text-shadow:0 1px 4px rgba(0,0,0,.6)}
$ .ptt>small{padding-bottom:calc(var(--u)*1.1);color:rgba(255,255,255,.8)}
$ .ptl .ptt.on>small{color:#fff}
$ .plx{bottom:calc(var(--u)*4.2);background:none}
$ .plx u{width:calc(var(--u)*6.6);height:calc(var(--u)*6.6)}
$ .p-cpu u:nth-child(2){width:calc(var(--u)*9.5);height:calc(var(--u)*9.5)}
$ .p-train u:nth-child(2){width:calc(var(--u)*1.4);height:calc(var(--u)*1.4)}
$ .portrait .ptl .ptt{height:calc(var(--u)*16)}
$ .portrait .mnr,$ .portrait .mnw{display:none}
$ .ctm{position:absolute;left:calc(var(--u)*6.5);right:calc(var(--u)*4);top:calc(var(--u)*4.6)}
$ .ctt{margin:0;font:300 max(26px,calc(var(--u)*4.6))/1 var(--rf);letter-spacing:.03em;text-transform:uppercase;color:#fff;text-shadow:0 0 calc(var(--u)*.7) rgba(255,255,255,.35)}
$ .ctl{position:absolute;left:0;top:calc(var(--u)*6.2);width:calc(var(--u)*17);display:flex;flex-direction:column;gap:calc(var(--u)*.35)}
$ .ctl .rb{min-height:calc(var(--u)*2.4);font:500 max(10px,calc(var(--u)*1.05))/1 var(--rf);letter-spacing:.03em}
$ .ctl .rb::before{background:linear-gradient(90deg,rgba(3,5,8,.9),rgba(9,11,15,.86))}
$ .ctl .rb.on::before{background:linear-gradient(100deg,#eef9ff,#cbe9fc 40%,#a2d2f3)}
$ .ctb{position:absolute;left:calc(var(--u)*21);right:0;top:calc(var(--u)*6.2)}
$ .ctr{display:grid;grid-template-columns:1fr repeat(6,calc(var(--u)*5));align-items:center;height:calc(var(--u)*4.2);margin-bottom:calc(var(--u)*1.6);font:500 max(8px,calc(var(--u)*.78))/1 var(--rf);text-transform:uppercase;color:#fff;text-align:center;text-shadow:0 1px 3px rgba(0,0,0,.7)}
$ .ctr b{display:flex;align-items:center;gap:calc(var(--u)*.8);text-align:left;font:300 max(16px,calc(var(--u)*2.5))/1 var(--rf);letter-spacing:.04em}
$ .ctr b i{width:calc(var(--u)*2);height:calc(var(--u)*1.45);border-radius:calc(var(--u)*.38);box-shadow:inset 0 0 0 max(2px,calc(var(--u)*.17)) currentColor,0 0 calc(var(--u)*.5) currentColor}
$ .ctr.t0 b{color:#a8ccff;text-shadow:0 0 calc(var(--u)*.7) rgba(60,130,255,.95)}
$ .ctr.t1 b{color:#ffcba6;text-shadow:0 0 calc(var(--u)*.7) rgba(255,120,40,.95)}
$ .ctb p{margin:0;font:500 max(9px,calc(var(--u)*1.05))/1 var(--rf);letter-spacing:.02em;text-transform:uppercase;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.8)}
$ .menu.ctm-on .mvg{background:linear-gradient(90deg,rgba(2,6,14,.45),rgba(2,6,14,.12) 45%,transparent 70%)}
$ .menu.ctm-on .plb,$ .menu.ctm-on .mbb{display:none}
$ .portrait .ctm{left:calc(var(--u)*3);right:calc(var(--u)*3)}
$ .portrait .ctb{left:0;top:calc(var(--u)*24)}
$ .wrap:not(.portrait) .menu.gar .gsx{left:calc(var(--u)*1.1);top:calc(var(--u)*2.2);width:calc(var(--u)*33);z-index:2}
$ .wrap:not(.portrait) .menu.gar .gsx .bt{display:none}
$ .wrap:not(.portrait) .menu.gar .gcl{flex-direction:row;gap:calc(var(--u)*.22);margin:0;padding:calc(var(--u)*.5) calc(var(--u)*.6) calc(var(--u)*.1);background:linear-gradient(180deg,rgba(20,56,102,.97),rgba(14,42,80,.97));box-shadow:inset 1px 1px 0 var(--bdr),inset -1px 0 0 var(--bdr)}
$ .wrap:not(.portrait) .menu.gar .gcb{flex:1;min-width:0;min-height:calc(var(--u)*3.3);padding:0;align-items:center;justify-content:center}
$ .wrap:not(.portrait) .menu.gar .gcb::before{transform:none;background:linear-gradient(180deg,#1f4f82,#123660);box-shadow:inset 0 0 0 1px rgba(120,190,250,.35)}
$ .wrap:not(.portrait) .menu.gar .gcb>span,$ .wrap:not(.portrait) .menu.gar .gcb>small{display:none}
$ .wrap:not(.portrait) .menu.gar .gcb.on::before,$ .wrap:not(.portrait) .menu.gar .gcb.act::before{background:linear-gradient(180deg,#fff,#d4ecfb);box-shadow:none}
$ .wrap:not(.portrait) .menu.gar .gcb.on .gci,$ .wrap:not(.portrait) .menu.gar .gcb.act .gci{color:#123a66}
$ .wrap:not(.portrait) .menu.gar .gpn{left:calc(var(--u)*1.1);top:calc(var(--u)*6.1);bottom:calc(var(--u)*6.4);width:calc(var(--u)*33);padding:calc(var(--u)*.7) calc(var(--u)*1) calc(var(--u)*1)}
$ .wrap:not(.portrait) .menu.gar .gph{flex-direction:column;align-items:flex-start;justify-content:flex-start;gap:calc(var(--u)*.35);margin-bottom:calc(var(--u)*.9);font:300 max(18px,calc(var(--u)*3.3))/1 var(--rf);letter-spacing:.02em;color:#e8f7ff;text-shadow:none}
$ .wrap:not(.portrait) .menu.gar .gph small{font:500 max(9px,calc(var(--u)*.85))/1 var(--rf);letter-spacing:.05em;color:#5fc8ff;text-transform:uppercase}
$ .wrap:not(.portrait) .menu.gar .gg{grid-template-columns:repeat(4,minmax(0,1fr));gap:calc(var(--u)*.45)}
$ .wrap:not(.portrait) .menu.gar .gi{align-items:center;text-align:center;padding:calc(var(--u)*.3) calc(var(--u)*.3) calc(var(--u)*.6);border-radius:0;background:linear-gradient(180deg,rgba(12,26,52,.95),rgba(6,14,30,.96));box-shadow:inset 0 0 0 1px rgba(80,140,210,.16)}
$ .wrap:not(.portrait) .menu.gar .gi:hover{background:linear-gradient(180deg,rgba(22,44,80,.95),rgba(10,22,44,.96))}
$ .wrap:not(.portrait) .menu.gar .gi b{max-width:100%;font-weight:400;text-transform:none;font-size:max(9px,calc(var(--u)*.92));color:#e6edf5}
$ .wrap:not(.portrait) .menu.gar .gi small{display:none}
$ .wrap:not(.portrait) .menu.gar .gi.on{background:linear-gradient(180deg,rgba(26,56,96,.96),rgba(10,24,48,.96));box-shadow:inset 0 0 0 2px #cfefff,0 0 calc(var(--u)*.8) rgba(110,215,255,.55)}
$ .wrap:not(.portrait) .menu.gar .gmd{position:absolute;left:calc(var(--u)*35);top:calc(var(--u)*6.4);width:calc(var(--u)*17);margin:0;min-height:0;padding:calc(var(--u)*.9) calc(var(--u)*1.1);box-sizing:border-box;background:rgba(13,16,22,.93);box-shadow:inset 0 0 0 1px rgba(255,255,255,.12),0 calc(var(--u)*.4) calc(var(--u)*1.2) rgba(0,0,0,.45);text-shadow:none;pointer-events:none}
$ .wrap:not(.portrait) .menu.gar .plb,$ .wrap:not(.portrait) .menu.gar .mbb{display:none}
$ .wrap:not(.portrait) .menu.gar .ghk{left:calc(var(--u)*1.1);bottom:calc(var(--u)*1.6);gap:calc(var(--u)*.35)}
$ .wrap:not(.portrait) .menu.gar .ghk>span{position:relative;isolation:isolate;min-height:calc(var(--u)*2.3);padding:0 calc(var(--u)*1.4);font-style:italic;font-weight:500}
$ .wrap:not(.portrait) .menu.gar .ghk>span::before{content:'';position:absolute;inset:0;z-index:-1;transform:skewX(-14deg);background:rgba(4,6,10,.88);box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}
$ .wrap:not(.portrait) .menu.gar .ghk>span.gdr{font-style:normal;font-weight:400;opacity:.7}
$ .wrap:not(.portrait) .menu.gar .ghk>span.gdr::before{display:none}
$ .gci{display:block;width:calc(var(--u)*2);height:calc(var(--u)*2);color:#fff}
$ .gci svg{display:block;width:100%;height:100%;fill:currentColor}
$ .gmd b{display:block;font:500 max(14px,calc(var(--u)*2))/1 var(--rf);letter-spacing:.01em;text-transform:uppercase;color:#fff}
$ .gmd small{display:block;margin-top:calc(var(--u)*.35);font:400 max(9px,calc(var(--u)*1))/1.15 var(--tf);color:#9aa6b4}
$ .gmd i{display:block;margin-top:calc(var(--u)*1);font:400 max(10px,calc(var(--u)*1.15))/1 var(--tf);font-style:normal;color:#fff}
$ .gmd p{margin:calc(var(--u)*.45) 0 0;font:400 max(9px,calc(var(--u)*.85))/1.3 var(--tf);color:#c4ccd6}
$ .gmd em{display:block;margin-top:calc(var(--u)*.85);font:500 max(9px,calc(var(--u)*.88))/1.1 var(--rf);font-style:normal;letter-spacing:.03em;text-transform:uppercase;color:#ffd34a}
$ .gmd em.eq{color:#7fe08f}
$ .gmd:empty{display:none}
$ .portrait .menu.gar .gmd{display:none}
$ .portrait .gcb .gci{display:none}
$ .msx .bt{white-space:nowrap;margin-bottom:calc(var(--u)*.7);font:italic 500 max(26px,calc(var(--u)*4.4))/1 var(--rf);letter-spacing:.02em;color:#f2fbff;text-shadow:0 0 calc(var(--u)*.9) rgba(80,190,255,.85),0 0 calc(var(--u)*.2) rgba(140,215,255,.9)}
$ .msx .sl{width:calc(var(--u)*30);gap:calc(var(--u)*.35)}
$ .msx .so{min-height:calc(var(--u)*2.3);padding:0;font-size:max(10px,calc(var(--u)*1.1))}
$ .msx .so::before{left:42%;transform:none;border-radius:calc(var(--u)*.2);background:linear-gradient(180deg,#0f1319,#05070b);box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)}
$ .msx .so>span{flex:0 0 42%;box-sizing:border-box;padding-right:calc(var(--u)*.8);text-align:right;font-style:italic;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.8)}
$ .msx .so>b{flex:1;min-width:0;text-transform:none}
$ .msx .so>i{padding:0 calc(var(--u)*.6)}
$ .msx .so.on{color:#0f4d86}
$ .msx .so.on>span{color:#fff}
$ .msx .so.on::before{background:linear-gradient(180deg,#e2f5ff,#92cdf1);box-shadow:inset 0 0 0 1px #fff,0 0 calc(var(--u)*.8) rgba(120,200,255,.7)}
$ .msx .sgo{width:58%;min-height:calc(var(--u)*2.3);margin:calc(var(--u)*1.8) 0 0 42%;justify-content:center;font-size:max(10px,calc(var(--u)*1.1))}
$ .msx .sgo::before{transform:none}
$ .op .pt{font-weight:300;letter-spacing:.07em;color:#c4f0ff;text-shadow:0 0 calc(var(--u)*1.1) rgba(80,200,255,.75)}
$ .op.pnl{background:linear-gradient(180deg,rgba(22,60,104,.97),rgba(10,32,62,.97) 22%,rgba(6,18,38,.97))}
$ .ot{border-radius:0;padding:0 calc(var(--u)*1.3);background:linear-gradient(180deg,#1f5281,#0f2f52);box-shadow:inset 0 0 0 1px rgba(130,205,255,.55);color:#e8f4ff;font-weight:500}
$ .ot.on{background:linear-gradient(180deg,#f4fdff,#b8e7ff);color:#0f4d86;box-shadow:inset 0 0 0 1px #fff,0 0 calc(var(--u)*1) rgba(110,215,255,.8)}
$ .ob{padding:calc(var(--u)*1) calc(var(--u)*.6);background:linear-gradient(180deg,rgba(16,42,76,.92),rgba(7,20,40,.94));box-shadow:inset 0 0 0 1px rgba(90,170,230,.5)}
$ .ob .orw{gap:calc(var(--u)*1.3);min-height:max(24px,calc(var(--u)*2.75));margin:0;padding:0 calc(var(--u)*.6);background:none;font-weight:500}
$ .ob .orw:hover{background:rgba(80,160,230,.1)}
$ .ob .orw>span{flex:0 0 44%;text-align:right;color:#e2ecf6;font-size:max(10px,calc(var(--u)*1.2))}
$ .ob .orw input[type=range]{flex:0 0 24%}
$ .ob .orw input[type=range]::-webkit-slider-runnable-track{height:max(5px,calc(var(--u)*.55));background:linear-gradient(90deg,#4f9cd6,#8fd0f6 var(--p,50%),#030a14 var(--p,50%));box-shadow:inset 0 0 0 1px rgba(120,190,240,.35)}
$ .ob .orw input[type=range]::-moz-range-track{height:max(5px,calc(var(--u)*.55));background:linear-gradient(90deg,#4f9cd6,#8fd0f6 var(--p,50%),#030a14 var(--p,50%))}
$ .ob .orw input[type=range]::-webkit-slider-thumb{width:max(7px,calc(var(--u)*.7));height:max(14px,calc(var(--u)*1.5));margin-top:calc(max(14px,calc(var(--u)*1.5))/-2 + max(5px,calc(var(--u)*.55))/2);background:linear-gradient(180deg,#bfe6ff,#5aa6dc);box-shadow:0 0 0 1px #0b2340}
$ .ob .orw>b{flex:1;min-width:0;text-align:left;color:#fff;font-weight:500}
$ .ob .tg2,$ .ob .orw input[type=text]{flex:0 0 30%}
$ .ock{flex:0 0 auto;width:max(20px,calc(var(--u)*2.1));height:max(20px,calc(var(--u)*2.1));margin:0;padding:0;border:0;cursor:pointer;background:#050c16;box-shadow:inset 0 0 0 1px rgba(150,200,240,.6)}
$ .ock{position:relative}
$ .ock.on::after{content:'';position:absolute;left:34%;top:14%;width:26%;height:50%;border-right:max(2px,calc(var(--u)*.26)) solid #fff;border-bottom:max(2px,calc(var(--u)*.26)) solid #fff;transform:rotate(40deg)}
$ .osel{flex:0 0 24%;height:max(22px,calc(var(--u)*2.3));padding:0 calc(var(--u)*2.2) 0 calc(var(--u)*.5);border:0;cursor:pointer;text-align:left;color:#fff;font:500 max(10px,calc(var(--u)*1.15))/1 var(--tf);background:linear-gradient(90deg,#03080f,#0c1726);box-shadow:inset 0 0 0 1px rgba(120,190,240,.55);position:relative}
$ .osel::after{content:'';position:absolute;right:0;top:0;bottom:0;width:calc(var(--u)*1.9);background:linear-gradient(180deg,#5c9fd2,#2b6ba4)}
$ .osel::before{content:'';position:absolute;right:calc(var(--u)*.55);top:50%;z-index:1;border:calc(var(--u)*.4) solid transparent;border-top:calc(var(--u)*.5) solid #fff;border-bottom:0;transform:translateY(-35%)}
`;

  Ameplay.register({
    id: ID,
    title: 'Rocket League',
    category: '3D',
    tint: '#2f7bff',
    blurb: 'Rocket-powered car soccer: customize your car in the garage, level up the Rocket Pass, practise in Free Play and score in Duel, Doubles or Standard against bots or friends online.',
    help: '<kbd>W</kbd><kbd>S</kbd> throttle · <kbd>A</kbd><kbd>D</kbd> steer · <kbd>Shift</kbd> or left click boost · <kbd>Space</kbd> or right click jump, again to flip · <kbd>X</kbd>/<kbd>Ctrl</kbd> powerslide &amp; air roll · <kbd>Q</kbd><kbd>E</kbd> air roll · <kbd>C</kbd> ball cam · <kbd>Tab</kbd> scoreboard · <kbd>1</kbd>–<kbd>4</kbd> quick chat · <kbd>Esc</kbd> pause · menus: arrows + <kbd>Enter</kbd>, <kbd>Esc</kbd> back · Free Play: <kbd>R</kbd> reset ball, <kbd>T</kbd> reset car · touch: stick + Boost/Jump/Slide',
    better: 'high',
    ownPause: true,
    width: 960,
    format: v => v + ' pts',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="44" cy="20" r="11"/><path d="M38 12l6 4 6-4M44 16v8l-6 4M44 24l6 4"/><path d="M6 46l4-8h14l6-6h10l6 8h6v6H6z"/><circle cx="16" cy="48" r="4"/><circle cx="42" cy="48" r="4"/><path d="M2 40h4"/></svg>',
    css: (CSS + CSS_FX).replace(/\$/g, '.gm-' + ID),
    sim: { CFG, BODIES, BODY_IDS, sdf, sdfN, makeWorld, startMatch, worldStep, kickoff, placeCar, ballStep, predict, makeBall, net: { enc: netEnc, dec: netDec, inEnc: netInEnc, inDec: netInDec, host: netHost, guest: netGuest, bot: netBot } },
    mount(root, api) {
      const keys = api.keys;
      const coarse = matchMedia('(pointer: coarse)').matches;
      const portrait = coarse && innerWidth < innerHeight;
      const wrap = el('div', 'wrap' + (portrait ? ' portrait' : '') + (coarse ? ' touch' : ''), root);
      let cleanup = null;
      api.gl(portrait ? 540 : 960, portrait ? 800 : 600).then(v => { if (v && api.alive) cleanup = run(v); }, () => { if (api.alive) api.overlay(NO_GL); });
      return { destroy() { if (cleanup) cleanup(); cleanup = null; } };

