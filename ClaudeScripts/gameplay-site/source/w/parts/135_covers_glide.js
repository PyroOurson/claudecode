
(() => {
  const S = Ameplay.covers;


  S['rhythm'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs>
<radialGradient id="rhy-bg" cx=".5" cy=".9" r=".85"><stop offset="0" stop-color="#a24ee8"/><stop offset=".5" stop-color="#7209b7"/><stop offset="1" stop-color="#4a067d"/></radialGradient>
<linearGradient id="rhy-lane" gradientUnits="userSpaceOnUse" x1="0" y1="20" x2="0" y2="300"><stop offset="0" stop-color="#1d0237" stop-opacity="0"/><stop offset=".5" stop-color="#1d0237" stop-opacity=".55"/><stop offset="1" stop-color="#1d0237" stop-opacity=".75"/></linearGradient>
<linearGradient id="rhy-ln" gradientUnits="userSpaceOnUse" x1="0" y1="20" x2="0" y2="300"><stop offset="0" stop-color="#e0aaff" stop-opacity="0"/><stop offset="1" stop-color="#e0aaff" stop-opacity=".75"/></linearGradient>
<linearGradient id="rhy-beam" gradientUnits="userSpaceOnUse" x1="0" y1="20" x2="0" y2="240"><stop offset="0" stop-color="#4cc9f0" stop-opacity="0"/><stop offset="1" stop-color="#4cc9f0" stop-opacity=".6"/></linearGradient>
</defs>
<rect width="400" height="300" fill="url(#rhy-bg)"/>
<g fill="none" stroke="#e0aaff" stroke-width="5" stroke-linecap="round">
<path d="M58,92 Q42,118 58,144" opacity=".8"/><path d="M42,78 Q18,118 42,158" opacity=".55"/><path d="M26,64 Q-6,118 26,172" opacity=".3"/>
<path d="M342,92 Q358,118 342,144" opacity=".8"/><path d="M358,78 Q382,118 358,158" opacity=".55"/><path d="M374,64 Q406,118 374,172" opacity=".3"/>
</g>
<g fill="#f0c3ff"><g transform="translate(70,26)"><ellipse cx="0" cy="40" rx="11" ry="8" transform="rotate(-20 0 40)"/><ellipse cx="34" cy="34" rx="11" ry="8" transform="rotate(-20 34 34)"/><rect x="6" y="4" width="5" height="36"/><rect x="40" y="-2" width="5" height="36"/><polygon points="6,4 45,-4 45,6 6,14"/></g>
<g transform="translate(318,36)" fill="#ff9ecb"><ellipse cx="0" cy="36" rx="11" ry="8" transform="rotate(-20 0 36)"/><rect x="6" y="0" width="5" height="36"/><path d="M11,0 C20,6 28,12 24,28 C22,18 17,14 11,13 Z"/></g></g>
<polygon points="150,20 250,20 360,300 40,300" fill="url(#rhy-lane)"/>
<polygon points="131.8,240 200,240 200,20 175,20" fill="url(#rhy-beam)"/>
<g stroke="url(#rhy-ln)" stroke-width="3"><line x1="175" y1="20" x2="120" y2="300"/><line x1="200" y1="20" x2="200" y2="300"/><line x1="225" y1="20" x2="280" y2="300"/></g>
<g stroke="url(#rhy-ln)" stroke-width="5"><line x1="150" y1="20" x2="40" y2="300"/><line x1="250" y1="20" x2="360" y2="300"/></g>
<line x1="64" y1="240" x2="336" y2="240" stroke="#fff" stroke-width="4" opacity=".7"/>
<g fill="none" stroke-width="4"><ellipse cx="97.7" cy="240" rx="27" ry="10" stroke="#ff70a6"/><ellipse cx="234.1" cy="240" rx="27" ry="10" stroke="#ffd166"/><ellipse cx="302.3" cy="240" rx="27" ry="10" stroke="#72efdd"/></g>
<rect x="236.3" y="58.5" width="26" height="9" rx="4.5" fill="#2bb5a3"/><rect x="236.3" y="55.5" width="26" height="9" rx="4.5" fill="#72efdd"/>
<rect x="162.6" y="97.5" width="34" height="11" rx="5.5" fill="#2a8fc0"/><rect x="162.6" y="94.5" width="34" height="11" rx="5.5" fill="#4cc9f0"/>
<rect x="203.2" y="146" width="44" height="14" rx="7" fill="#e09f3e"/><rect x="203.2" y="143" width="44" height="14" rx="7" fill="#ffd166"/>
<rect x="259.9" y="173.5" width="48" height="15" rx="7.5" fill="#2bb5a3"/><rect x="259.9" y="170.5" width="48" height="15" rx="7.5" fill="#72efdd"/>
<rect x="84.7" y="191" width="52" height="16" rx="8" fill="#d6457f"/><rect x="84.7" y="188" width="52" height="16" rx="8" fill="#ff70a6"/>
<g transform="translate(166,240)">
<ellipse rx="62" ry="40" fill="none" stroke="#fff" stroke-width="3" opacity=".4"/>
<polygon transform="scale(1,.8)" fill="#fff" opacity=".9" points="50,0 16.6,6.9 35.4,35.4 6.9,16.6 0,50 -6.9,16.6 -35.4,35.4 -16.6,6.9 -50,0 -16.6,-6.9 -35.4,-35.4 -6.9,-16.6 0,-50 6.9,-16.6 35.4,-35.4 16.6,-6.9"/>
<ellipse rx="40" ry="26" fill="none" stroke="#4cc9f0" stroke-width="5"/>
<rect x="-30" y="-6" width="60" height="18" rx="9" fill="#2a8fc0"/><rect x="-30" y="-9" width="60" height="18" rx="9" fill="#4cc9f0"/><rect x="-18" y="-5" width="36" height="5" rx="2.5" fill="#fff" opacity=".7"/>
</g>
<circle cx="108" cy="204" r="4.5" fill="#fff"/><circle cx="232" cy="210" r="5" fill="#ffd166"/><circle cx="124" cy="282" r="4.5" fill="#4cc9f0"/><circle cx="216" cy="276" r="4" fill="#fff"/>
</svg>`;

  S['word-guess'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs>
<radialGradient id="wg-bg" cx=".5" cy=".45" r=".7"><stop offset="0" stop-color="#8acb82"/><stop offset="1" stop-color="#5b9a55"/></radialGradient>
<path id="wg-sp" d="M0,-14 Q2,-2 14,0 Q2,2 0,14 Q-2,2 -14,0 Q-2,-2 0,-14Z"/>
</defs>
<rect width="400" height="300" fill="url(#wg-bg)"/>
<g opacity=".9"><rect x="22" y="34" width="10" height="16" rx="3" fill="#ffd166" transform="rotate(25 27 42)"/><rect x="364" y="246" width="10" height="16" rx="3" fill="#fff" transform="rotate(-30 369 254)"/><rect x="26" y="256" width="10" height="16" rx="3" fill="#fff" transform="rotate(40 31 264)"/><rect x="368" y="30" width="10" height="16" rx="3" fill="#ffd166" transform="rotate(-20 373 38)"/><rect x="190" y="282" width="10" height="14" rx="3" fill="#ffd166" transform="rotate(60 195 289)"/></g>
<use href="#wg-sp" x="368" y="110" fill="#fff"/><use href="#wg-sp" x="32" y="200" fill="#ffe08a"/>
<g transform="rotate(-4 200 150)">
<rect x="61" y="38" width="290" height="237" rx="18" fill="#2f5e2b" opacity=".3"/>
<rect x="55" y="30" width="290" height="237" rx="18" fill="#fffdf7"/>
<g>
<rect x="71" y="50" width="46" height="46" rx="8" fill="#5e6264"/><rect x="71" y="46" width="46" height="46" rx="8" fill="#787c7e"/>
<rect x="124" y="50" width="46" height="46" rx="8" fill="#a8953f"/><rect x="124" y="46" width="46" height="46" rx="8" fill="#c9b458"/>
<rect x="177" y="50" width="46" height="46" rx="8" fill="#4e8a49"/><rect x="177" y="46" width="46" height="46" rx="8" fill="#6aaa64"/>
<rect x="230" y="50" width="46" height="46" rx="8" fill="#5e6264"/><rect x="230" y="46" width="46" height="46" rx="8" fill="#787c7e"/>
<rect x="283" y="50" width="46" height="46" rx="8" fill="#a8953f"/><rect x="283" y="46" width="46" height="46" rx="8" fill="#c9b458"/>
<rect x="71" y="103" width="46" height="46" rx="8" fill="#a8953f"/><rect x="71" y="99" width="46" height="46" rx="8" fill="#c9b458"/>
<rect x="124" y="103" width="46" height="46" rx="8" fill="#4e8a49"/><rect x="124" y="99" width="46" height="46" rx="8" fill="#6aaa64"/>
<rect x="177" y="103" width="46" height="46" rx="8" fill="#4e8a49"/><rect x="177" y="99" width="46" height="46" rx="8" fill="#6aaa64"/>
<rect x="230" y="103" width="46" height="46" rx="8" fill="#4e8a49"/><rect x="230" y="99" width="46" height="46" rx="8" fill="#6aaa64"/>
<rect x="283" y="103" width="46" height="46" rx="8" fill="#5e6264"/><rect x="283" y="99" width="46" height="46" rx="8" fill="#787c7e"/>
<rect x="71" y="153" width="46" height="46" rx="8" fill="#4e8a49"/><rect x="71" y="149" width="46" height="46" rx="8" fill="#6aaa64"/>
<rect x="124" y="148" width="46" height="46" rx="8" fill="#4e8a49"/><rect x="124" y="144" width="46" height="46" rx="8" fill="#6aaa64"/>
<rect x="177" y="145" width="46" height="46" rx="8" fill="#4e8a49"/><rect x="177" y="141" width="46" height="46" rx="8" fill="#6aaa64"/>
<rect x="230" y="148" width="46" height="46" rx="8" fill="#4e8a49"/><rect x="230" y="144" width="46" height="46" rx="8" fill="#6aaa64"/>
<rect x="283" y="153" width="46" height="46" rx="8" fill="#4e8a49"/><rect x="283" y="149" width="46" height="46" rx="8" fill="#6aaa64"/>
</g>
<g fill="none" stroke="#d3d6da" stroke-width="3"><rect x="72.5" y="206.5" width="43" height="43" rx="7"/><rect x="125.5" y="206.5" width="43" height="43" rx="7"/><rect x="178.5" y="206.5" width="43" height="43" rx="7"/><rect x="231.5" y="206.5" width="43" height="43" rx="7"/><rect x="284.5" y="206.5" width="43" height="43" rx="7"/></g>
<g font-family="Nunito, Arial Rounded MT Bold, Arial, sans-serif" font-weight="800" font-size="28" fill="#fff" text-anchor="middle">
<text x="94" y="79">C</text><text x="147" y="79">R</text><text x="200" y="79">A</text><text x="253" y="79">N</text><text x="306" y="79">E</text>
<text x="94" y="132">T</text><text x="147" y="132">E</text><text x="200" y="132">A</text><text x="253" y="132">R</text><text x="306" y="132">S</text>
<text x="94" y="182">H</text><text x="147" y="177">E</text><text x="200" y="174">A</text><text x="253" y="177">R</text><text x="306" y="182">T</text>
</g>
</g>
</svg>`;

  S['slide'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs>
<radialGradient id="sld-bg" cx=".5" cy=".45" r=".75"><stop offset="0" stop-color="#f7aaa7"/><stop offset=".6" stop-color="#f28482"/><stop offset="1" stop-color="#e06c6a"/></radialGradient>
<g id="sld-t"><rect y="4" width="52" height="48" rx="10" fill="#e5a99a"/><rect width="52" height="48" rx="10" fill="#fff4ec"/></g>
</defs>
<rect width="400" height="300" fill="url(#sld-bg)"/>
<g fill="#fff4ec"><rect x="22" y="40" width="30" height="30" rx="7" opacity=".45" transform="rotate(-14 37 55)"/><rect x="346" y="226" width="28" height="28" rx="7" opacity=".4" transform="rotate(12 360 240)"/><rect x="350" y="46" width="20" height="20" rx="5" opacity=".35" transform="rotate(20 360 56)"/><rect x="30" y="232" width="20" height="20" rx="5" opacity=".3" transform="rotate(-24 40 242)"/></g>
<rect x="86" y="34" width="244" height="244" rx="22" fill="#a8504e" opacity=".4"/>
<rect x="78" y="24" width="244" height="244" rx="22" fill="#6d2e46"/>
<rect x="84" y="30" width="232" height="232" rx="16" fill="#4e1f33"/>
<use href="#sld-t" x="87" y="33"/><use href="#sld-t" x="145" y="33"/><use href="#sld-t" x="203" y="33"/><use href="#sld-t" x="261" y="33"/>
<use href="#sld-t" x="87" y="91"/><use href="#sld-t" x="145" y="91"/><use href="#sld-t" x="203" y="91"/><use href="#sld-t" x="261" y="91"/>
<use href="#sld-t" x="87" y="149"/><use href="#sld-t" x="145" y="149"/>
<use href="#sld-t" x="87" y="207"/><use href="#sld-t" x="145" y="207"/><use href="#sld-t" x="203" y="207"/><use href="#sld-t" x="261" y="207"/>
<g stroke="#ffd166" stroke-width="4" stroke-linecap="round" opacity=".9"><path d="M288,163 h20"/><path d="M292,175 h16"/><path d="M288,187 h20"/></g>
<rect x="232" y="155" width="52" height="48" rx="10" fill="#4e1f33" opacity=".6"/>
<rect x="229" y="153" width="52" height="48" rx="10" fill="#e0a93a"/><rect x="229" y="149" width="52" height="48" rx="10" fill="#ffd166"/>
<g font-family="Nunito, Arial Rounded MT Bold, Arial, sans-serif" font-weight="800" font-size="24" fill="#6d2e46" text-anchor="middle">
<text x="113" y="66">1</text><text x="171" y="66">2</text><text x="229" y="66">3</text><text x="287" y="66">4</text>
<text x="113" y="124">5</text><text x="171" y="124">6</text><text x="229" y="124">7</text><text x="287" y="124">8</text>
<text x="113" y="182">9</text><text x="171" y="182">10</text><text x="255" y="182">11</text>
<text x="113" y="240">13</text><text x="171" y="240">14</text><text x="229" y="240">15</text><text x="287" y="240">12</text>
</g>
</svg>`;

  S['pong'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs>
<radialGradient id="png-bg" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#3b3e5c"/><stop offset="1" stop-color="#23253a"/></radialGradient>
<linearGradient id="png-tr" gradientUnits="userSpaceOnUse" x1="110" y1="190" x2="312" y2="100"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".55"/></linearGradient>
</defs>
<rect width="400" height="300" fill="url(#png-bg)"/>
<rect x="16" y="16" width="368" height="268" rx="14" fill="none" stroke="#8d99ae" stroke-width="4" opacity=".35"/>
<line x1="200" y1="34" x2="200" y2="270" stroke="#8d99ae" stroke-width="6" stroke-dasharray="14 14" stroke-linecap="round" opacity=".5"/>
<rect x="32" y="170" width="32" height="96" rx="12" fill="#ef476f" opacity=".18"/>
<g fill="#ef476f" opacity=".85"><rect x="146" y="40" width="12" height="12" rx="3"/><rect x="166" y="40" width="12" height="12" rx="3"/></g><g fill="#4cc9f0" opacity=".85"><rect x="222" y="40" width="12" height="12" rx="3"/><rect x="242" y="40" width="12" height="12" rx="3"/><rect x="262" y="40" width="12" height="12" rx="3"/></g>
<path d="M60,213 L110,190" stroke="#fff" stroke-width="4" stroke-dasharray="1 10" stroke-linecap="round" opacity=".35"/>
<rect x="38" y="178" width="20" height="80" rx="5" fill="#ef476f"/><rect x="42" y="184" width="5" height="60" rx="2.5" fill="#fff" opacity=".35"/>
<rect x="332" y="52" width="32" height="96" rx="12" fill="#4cc9f0" opacity=".18"/>
<rect x="338" y="60" width="20" height="80" rx="5" fill="#4cc9f0"/><rect x="342" y="66" width="5" height="60" rx="2.5" fill="#fff" opacity=".4"/>
<polygon points="316.5,110 307.5,90 110,190" fill="url(#png-tr)"/>
<g fill="#fff"><rect x="179" y="149" width="14" height="14" rx="3" opacity=".1"/><rect x="220" y="130" width="16" height="16" rx="3" opacity=".18"/><rect x="261" y="110" width="18" height="18" rx="4" opacity=".3"/></g>
<circle cx="312" cy="100" r="24" fill="#fff" opacity=".12"/>
<rect x="301" y="89" width="22" height="22" rx="4" fill="#fff"/>
<g stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85"><path d="M322,78 L330,66"/><path d="M322,122 L330,134"/><path d="M302,80 L296,70"/></g>
</svg>`;

  S['connect-four'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs>
<radialGradient id="c4-bg" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="#6a86ff"/><stop offset=".55" stop-color="#4361ee"/><stop offset="1" stop-color="#3049c9"/></radialGradient>
<pattern id="c4-h" x="81" y="77" width="34" height="34" patternUnits="userSpaceOnUse"><rect width="34" height="34" fill="#2638b8"/><circle cx="17" cy="17" r="13" fill="#17227c"/><circle cx="17" cy="19.5" r="12" fill="#8399fb"/></pattern>
<g id="c4-r"><circle r="13.5" fill="#e63946" stroke="#b51f2e" stroke-width="3"/><circle r="7" fill="none" stroke="#ff7a85" stroke-width="3"/></g>
<g id="c4-y"><circle r="13.5" fill="#ffd166" stroke="#e09f3e" stroke-width="3"/><circle r="7" fill="none" stroke="#fff0c2" stroke-width="3"/></g>
<path id="c4-sp" d="M0,-12 Q2,-2 12,0 Q2,2 0,12 Q-2,2 -12,0 Q-2,-2 0,-12Z"/>
</defs>
<rect width="400" height="300" fill="url(#c4-bg)"/>
<g fill="#1e2a8c"><rect x="60" y="110" width="18" height="182" rx="8"/><rect x="322" y="110" width="18" height="182" rx="8"/><rect x="48" y="282" width="42" height="12" rx="6"/><rect x="310" y="282" width="42" height="12" rx="6"/></g>
<rect x="82" y="80" width="248" height="214" rx="18" fill="#1a2475" opacity=".35"/>
<rect x="76" y="72" width="248" height="214" rx="18" fill="#2638b8" stroke="#5a72ff" stroke-width="3"/>
<rect x="81" y="77" width="238" height="204" fill="url(#c4-h)"/>
<g fill="#fff" opacity=".4"><circle cx="132" cy="264" r="20"/><circle cx="166" cy="230" r="20"/><circle cx="200" cy="196" r="20"/><circle cx="234" cy="162" r="20"/></g>
<use href="#c4-r" x="98" y="264"/><use href="#c4-y" x="132" y="264"/><use href="#c4-r" x="166" y="264"/><use href="#c4-y" x="200" y="264"/><use href="#c4-r" x="234" y="264"/><use href="#c4-y" x="268" y="264"/><use href="#c4-r" x="302" y="264"/>
<use href="#c4-y" x="166" y="230"/><use href="#c4-r" x="200" y="230"/><use href="#c4-y" x="234" y="230"/><use href="#c4-r" x="268" y="230"/>
<use href="#c4-y" x="200" y="196"/><use href="#c4-r" x="234" y="196"/>
<use href="#c4-y" x="234" y="162"/>
<line x1="132" y1="264" x2="234" y2="162" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".9"/>
<use href="#c4-sp" x="262" y="132" fill="#fff"/><use href="#c4-sp" x="350" y="54" fill="#fff" opacity=".8"/><use href="#c4-sp" x="44" y="66" fill="#ffd166"/>
<g stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"><path d="M154,6 v12"/><path d="M166,2 v16"/><path d="M178,6 v12"/></g>
<use href="#c4-r" x="166" y="42"/>
</svg>`;

  S['number-memory'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="nm-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4fa3"/><stop offset=".5" stop-color="#f72585"/><stop offset="1" stop-color="#c5166d"/></linearGradient>
</defs>
<rect width="400" height="300" fill="url(#nm-bg)"/>
<circle cx="200" cy="64" r="58" fill="#ffd166" opacity=".16"/><circle cx="200" cy="64" r="42" fill="#ffd166" opacity=".22"/>
<g stroke="#ffe6a3" stroke-width="5" stroke-linecap="round"><path d="M138,62 h14"/><path d="M248,62 h14"/><path d="M156,22 l10,10"/><path d="M244,22 l-10,10"/><path d="M200,4 v14"/></g>
<circle cx="200" cy="62" r="28" fill="#ffd166"/><path d="M184,80 L216,80 L213,96 L187,96 Z" fill="#ffd166"/>
<path d="M192,80 V70 A8,8 0 0 1 208,70 V80" fill="none" stroke="#f3722c" stroke-width="3.5" stroke-linecap="round"/>
<path d="M182,54 A20,20 0 0 1 194,40" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>
<rect x="185" y="96" width="30" height="8" rx="4" fill="#fff"/><rect x="187" y="106" width="26" height="7" rx="3.5" fill="#fff" opacity=".85"/><rect x="194" y="115" width="12" height="5" rx="2.5" fill="#fff" opacity=".7"/>
<g font-family="Nunito, Arial Rounded MT Bold, Arial, sans-serif" font-weight="800" font-size="92" text-anchor="middle">
<g fill="#9e0f57" opacity=".35"><text x="84" y="216">4</text><text x="138" y="216">8</text><text x="220" y="216" opacity=".6">2</text></g>
<g fill="#fff"><text x="80" y="210">4</text><text x="134" y="210">8</text>
<text x="216" y="210" opacity=".8">2</text><text x="220" y="210" opacity=".15">2</text>
<g opacity=".14"><text x="264" y="210">1</text><text x="272" y="210">1</text><text x="268" y="205">1</text><text x="268" y="215">1</text></g><text x="268" y="210" opacity=".3">1</text>
<g opacity=".12"><text x="313" y="210">3</text><text x="327" y="210">3</text><text x="320" y="203">3</text><text x="320" y="217">3</text><text x="320" y="210">3</text></g><text x="320" y="210" opacity=".14">3</text></g>
</g>
<g fill="#fff"><rect x="296" y="146" width="8" height="8" rx="2" opacity=".55"/><rect x="318" y="128" width="7" height="7" rx="2" opacity=".45"/><rect x="346" y="144" width="7" height="7" rx="2" opacity=".4"/><rect x="360" y="114" width="6" height="6" rx="2" opacity=".3"/><rect x="340" y="178" width="6" height="6" rx="2" opacity=".3"/><rect x="372" y="158" width="6" height="6" rx="2" opacity=".25"/><rect x="286" y="124" width="6" height="6" rx="2" opacity=".4"/></g>
<rect x="90" y="236" width="220" height="12" rx="6" fill="#fff" opacity=".25"/><rect x="90" y="236" width="118" height="12" rx="6" fill="#fff"/>
</svg>`;


})();

