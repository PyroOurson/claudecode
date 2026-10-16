  const PVS = `attribute vec3 pcolor; attribute float alpha; attribute float size; attribute float seed; uniform float scale; varying vec3 vC; varying float vA; varying float vS;
void main() { vC = pcolor; vA = alpha; vS = seed; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = alpha > 0.0 ? min(size * scale / max(1.0, -mv.z), 640.0) : 0.0; gl_Position = projectionMatrix * mv; }`;
  const PFS = `uniform float kind; varying vec3 vC; varying float vA; varying float vS;
float fxh(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float fxn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(fxh(i), fxh(i + vec2(1.0, 0.0)), f.x), mix(fxh(i + vec2(0.0, 1.0)), fxh(i + vec2(1.0, 1.0)), f.x), f.y); }
void main() {
  vec2 d = gl_PointCoord - 0.5; float r = length(d);
  if (kind < 0.5) { float a = smoothstep(0.5, 0.04, r) * vA; if (a < 0.01) discard; gl_FragColor = vec4(mix(vC, vec3(1.0), smoothstep(0.16, 0.0, r) * 0.3), a); }
  else { float c = cos(vS * 6.2832), s = sin(vS * 6.2832); vec2 q = mat2(c, -s, s, c) * d; float m = fxn(q * 4.5 + vS * 31.0) * 0.6 + fxn(q * 10.0 - vS * 17.0) * 0.4; float a = smoothstep(0.5, 0.1, r + (m - 0.5) * 0.32) * vA * (0.38 + m * 0.5); if (a < 0.01) discard; gl_FragColor = vec4(vC * (0.78 + m * 0.5 - r * 0.35), a); }
}`;
  const FXSVS = `attribute vec3 tail; attribute vec2 corner; attribute vec3 scol; attribute float salpha; attribute float swid; varying vec3 vC; varying float vA; varying float vE;
void main() { vec4 h = modelViewMatrix * vec4(position, 1.0); vec4 t = modelViewMatrix * vec4(tail, 1.0); vec3 p = mix(h.xyz, t.xyz, corner.x); vec3 sd = cross(t.xyz - h.xyz, p); float l = length(sd); sd = l > 1e-4 ? sd / l : vec3(1.0, 0.0, 0.0); p += sd * corner.y * swid * (1.0 - corner.x * 0.8); vC = scol; vA = salpha * (1.0 - corner.x * 0.92); vE = corner.y; gl_Position = projectionMatrix * vec4(p, 1.0); }`;
  const FXSFS = `varying vec3 vC; varying float vA; varying float vE;
void main() { float e = 1.0 - abs(vE); float a = vA * e * e; if (a < 0.01) discard; gl_FragColor = vec4(mix(vC, vec3(1.0), e * e * 0.6), a); }`;
  const FXHV = `varying float vR; varying float vQ;
void main() { vQ = length(position.xy); vec4 mv = modelViewMatrix * vec4(position, 1.0); vec3 n = normalize(normalMatrix * normal); vR = 1.0 - abs(dot(n, normalize(-mv.xyz))); gl_Position = projectionMatrix * mv; }`;
  const FXHF = `uniform vec3 color; uniform float op; uniform float ring; varying float vR; varying float vQ;
void main() { float a = ring > 0.5 ? pow(sin(clamp((vQ - 0.55) / 0.45, 0.0, 1.0) * 3.1416), 1.5) : pow(1.0 - vR, 1.4) * 0.42 + pow(vR, 3.0) * 0.3; a *= op; if (a < 0.004) discard; gl_FragColor = vec4(mix(color, vec3(1.0), ring > 0.5 ? 0.25 : pow(1.0 - vR, 3.0) * 0.55), a); }`;
  const CSS_FX = `
$ .fxrp{position:absolute;inset:0;pointer-events:none;overflow:hidden;--tc:#3f8cff;--td:#123a8c}
$ .fxw{position:absolute;inset:0;overflow:hidden;visibility:hidden}
$ .fxw.fxgo{visibility:visible}
$ .fxw i{position:absolute;top:-30%;bottom:-30%;left:0;width:150%;transform:translateX(-120%) skewX(-24deg)}
$ .fxw i:nth-child(1){background:linear-gradient(90deg,transparent,var(--tc) 30%,var(--tc))}
$ .fxw i:nth-child(2){background:linear-gradient(90deg,#061430,#0e2a5c 50%,#061430)}
$ .fxw i:nth-child(3){background:linear-gradient(90deg,var(--tc),var(--td) 70%,transparent)}
$ .fxw.fxgo i:nth-child(1){animation:gmrs-fxw .62s cubic-bezier(.5,0,.5,1) both}
$ .fxw.fxgo i:nth-child(2){animation:gmrs-fxw .62s cubic-bezier(.5,0,.5,1) .045s both}
$ .fxw.fxgo i:nth-child(3){animation:gmrs-fxw .62s cubic-bezier(.5,0,.5,1) .09s both}
$ .fxw .shd{position:absolute;left:50%;top:50%;width:calc(var(--u)*13);height:calc(var(--u)*13);transform:translate(-50%,-50%);opacity:0}
$ .fxw.fxgo .shd{animation:gmrs-fxt .62s ease both}
@keyframes gmrs-fxw{0%{transform:translateX(-120%) skewX(-24deg)}100%{transform:translateX(105%) skewX(-24deg)}}
@keyframes gmrs-fxt{0%,25%{opacity:0;transform:translate(-50%,-50%) scale(1.3)}45%,60%{opacity:1;transform:translate(-50%,-50%) scale(1)}85%,100%{opacity:0;transform:translate(-50%,-50%) scale(.9)}}
$ .fxl{position:absolute;left:calc(var(--u)*1.6);bottom:calc(var(--u)*1.6);display:flex;align-items:center;gap:calc(var(--u)*.6);font:300 calc(var(--u)*3.3)/1 var(--rf);letter-spacing:.02em;text-transform:uppercase;color:#ff6550;text-shadow:0 0 calc(var(--u)*.7) rgba(255,60,40,.85);opacity:0;transform:translateX(-30%);transition:opacity .25s,transform .35s cubic-bezier(.2,1.3,.4,1)}
$ .fxl i{width:calc(var(--u)*.95);height:calc(var(--u)*.95);border-radius:50%;background:#ff3b30;box-shadow:0 0 calc(var(--u)*.8) #ff3b30;animation:gmrs-fxr 1.2s steps(2) infinite}
$ .fxrp.fxon .fxl{opacity:1;transform:none}
@keyframes gmrs-fxr{50%{opacity:.3}}
$ .fxc{position:absolute;left:50%;bottom:calc(var(--u)*5.2);transform:translate(-50%,30%);display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*.45);opacity:0;transition:opacity .3s,transform .4s cubic-bezier(.2,1.2,.4,1)}
$ .fxrp.fxon .fxc{opacity:1;transform:translateX(-50%)}
$ .fxc>small{font:400 max(9px,calc(var(--u)*1.05))/1 var(--rf);letter-spacing:.04em;text-transform:uppercase;color:#7cc8ff;text-shadow:0 1px 3px rgba(0,0,0,.7)}
$ .fxcd{position:relative;display:flex;align-items:center;width:calc(var(--u)*25);height:calc(var(--u)*4.1);padding-left:calc(var(--u)*5.6);box-sizing:border-box;background:linear-gradient(90deg,#1b4c8c,#2f74c2 62%,#4790da);box-shadow:inset 0 1px 0 rgba(190,225,255,.4)}
$ .fxrp.t1 .fxcd{background:linear-gradient(90deg,#8c3a0c,#c8601c 62%,#e27c30);box-shadow:inset 0 1px 0 rgba(255,220,190,.4)}
$ .fxav{position:absolute;left:calc(var(--u)*-.4);top:50%;width:calc(var(--u)*4.8);height:calc(var(--u)*4.8);padding:calc(var(--u)*.26);box-sizing:border-box;transform:translateY(-50%);border-radius:calc(var(--u)*.45);background:linear-gradient(180deg,#f4f7fb,#aeb7c4);box-shadow:0 2px 6px rgba(0,0,0,.5)}
$ .fxav svg{border-radius:calc(var(--u)*.2)}
$ .fxcd>b{position:relative;z-index:1;max-width:72%;font:400 max(13px,calc(var(--u)*2.1))/1 var(--tf);color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
$ .fxcd>svg{position:absolute;right:calc(var(--u)*-.4);top:50%;width:calc(var(--u)*6.4);height:calc(var(--u)*6.4);transform:translateY(-50%);opacity:.22}
$ .fxs{display:flex;gap:calc(var(--u)*2.6);margin-top:calc(var(--u)*.4);font:400 max(12px,calc(var(--u)*1.75))/1 var(--rf);color:#cfeaff;text-shadow:0 1px 3px rgba(0,0,0,.7)}
$ .fxs span{display:flex;align-items:center;gap:calc(var(--u)*.4)}
$ .fxs svg{width:calc(var(--u)*2.2);height:calc(var(--u)*2.2)}
$ .fxs b{font-weight:400}
$ .fxs small{font-size:.6em;align-self:flex-end;margin-bottom:.15em}
$ .fxk{position:absolute;right:calc(var(--u)*1.2);bottom:calc(var(--u)*1.4);display:flex;flex-direction:column;align-items:flex-end;gap:calc(var(--u)*.6);opacity:0;transition:opacity .3s}
$ .fxk>div:first-child{font:400 max(9px,calc(var(--u)*1.05))/1 var(--rf);letter-spacing:.04em;text-transform:uppercase;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.8)}
$ .fxk kbd{margin:0 .4em}
$ .fxn{font:300 max(13px,calc(var(--u)*1.95))/1 var(--rf);color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.8)}
$ .fxn i{font-style:normal;color:#ff7a6a}
$ .fxn i.p0{color:#7fb8ff}
$ .fxrp.fxon .fxk{opacity:1}
$ .fxrp.fxon::after{content:'';position:absolute;inset:0;box-shadow:inset 0 0 calc(var(--u)*9) rgba(0,0,10,.5)}
$ .fxrep .vh .bd,$ .fxrep .vh .tc,$ .fxrep .vh .cb,$ .fxrep .vh .cbt,$ .fxrep .vh .qc,$ .fxrep .vh .chat,$ .fxrep .vh .ss,$ .fxrep .vh .pops,$ .fxrep .vh .feed,$ .fxrep .vh .ban{opacity:0!important;transition:opacity .2s}
$ .portrait .fxc{bottom:calc(var(--u)*11)}
$ .portrait .fxk{bottom:calc(var(--u)*5)}
`;

