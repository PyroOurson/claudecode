
(() => {
  const S = Ameplay.covers;
  const F = 'font-family="Nunito, Arial Rounded MT Bold, Arial, sans-serif" font-weight="800"';

  S['reaction'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="rct-bg" cx="55%" cy="45%" r="70%"><stop offset="0" stop-color="#ff8f8f"/><stop offset="1" stop-color="#f05656"/></radialGradient></defs>
<rect width="400" height="300" fill="url(#rct-bg)"/>
<circle cx="215" cy="200" r="150" fill="#fff" opacity=".08"/>
<circle cx="215" cy="200" r="105" fill="#fff" opacity=".08"/>
<path d="M352 16 L302 104 H334 L314 172 L378 74 H344 L368 16 Z" fill="#c03e3e" opacity=".35" transform="translate(7 9)"/>
<path d="M352 16 L302 104 H334 L314 172 L378 74 H344 L368 16 Z" fill="#ffd166"/>
<path d="M352 16 L330 56 L346 56 L364 16 Z" fill="#fff" opacity=".45"/>
<ellipse cx="224" cy="258" rx="130" ry="32" fill="#b83a3a" opacity=".35"/>
<ellipse cx="212" cy="230" rx="122" ry="44" fill="#1d1b26"/>
<ellipse cx="212" cy="219" rx="122" ry="44" fill="#3a3348"/>
<path d="M132 182 V208 A80 30 0 0 0 292 208 V182 Z" fill="#2c9a62"/>
<ellipse cx="212" cy="182" rx="80" ry="30" fill="#4fd38e"/>
<ellipse cx="188" cy="173" rx="38" ry="11" fill="#fff" opacity=".45"/>
<path d="M225 160 L210 145 M240 154 L242 134 M218 175 L198 172" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
<path d="M0 0 V74 L18 58 L31 86 L45 80 L32 52 H56 Z" fill="#1d1b26" opacity=".3" transform="translate(246 190)"/>
<path d="M0 0 V74 L18 58 L31 86 L45 80 L32 52 H56 Z" fill="#fff" stroke="#1d1b26" stroke-width="7" stroke-linejoin="round" transform="translate(236 178)"/>
<circle cx="107" cy="121" r="57" fill="#b83a3a" opacity=".35"/>
<rect x="88" y="34" width="26" height="18" rx="6" fill="#1d1b26"/>
<rect x="95" y="46" width="12" height="14" fill="#1d1b26"/>
<rect x="140" y="56" width="18" height="13" rx="5" fill="#1d1b26" transform="rotate(42 149 62)"/>
<circle cx="101" cy="113" r="57" fill="#1d1b26"/>
<circle cx="101" cy="113" r="46" fill="#fff"/>
<path d="M101 113 V67 A46 46 0 0 1 144 97 Z" fill="#ffb0b0"/>
<path d="M101 73 V82 M141 113 H132 M101 153 V144 M61 113 H70" stroke="#1d1b26" stroke-width="5" stroke-linecap="round"/>
<path d="M101 113 L135 101" stroke="#f05656" stroke-width="7" stroke-linecap="round"/>
<circle cx="101" cy="113" r="7" fill="#1d1b26"/>
<path d="M22 196 H62 M14 214 H50 M30 232 H66" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".6"/>
</svg>`;


  S['2048'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="t48-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffbb4d"/><stop offset="1" stop-color="#ef9714"/></linearGradient>
<radialGradient id="t48-gl" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<linearGradient id="t48-t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe56e"/><stop offset="1" stop-color="#ffc21f"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#t48-bg)"/>
<path d="M262 148 L200 -20 H250 Z M262 148 L360 -20 H420 Z M262 148 L420 120 V190 Z M262 148 L380 320 H320 Z M262 148 L170 320 H120 Z M262 148 L-10 230 V170 Z" fill="#fff" opacity=".13"/>
<circle cx="262" cy="148" r="150" fill="url(#t48-gl)"/>
<g transform="rotate(-6 262 148)">
<rect x="177" y="63" width="170" height="170" rx="24" fill="#a85f00" opacity=".3" transform="translate(10 18)"/>
<rect x="177" y="75" width="170" height="170" rx="24" fill="#e09a00"/>
<rect x="177" y="63" width="170" height="170" rx="24" fill="url(#t48-t)"/>
<rect x="193" y="74" width="138" height="16" rx="8" fill="#fff" opacity=".45"/>
<text x="262" y="170" text-anchor="middle" font-size="58" fill="#fff" stroke="#d17a00" stroke-width="9" stroke-linejoin="round" paint-order="stroke" ${F}>2048</text>
</g>
<g transform="rotate(8 120 58)">
<rect x="80" y="18" width="80" height="80" rx="16" fill="#a85f00" opacity=".3" transform="translate(6 12)"/>
<rect x="80" y="26" width="80" height="80" rx="16" fill="#d9541c"/>
<rect x="80" y="18" width="80" height="80" rx="16" fill="#ff7a3d"/>
<text x="120" y="76" text-anchor="middle" font-size="50" fill="#fff" ${F}>8</text>
</g>
<g transform="rotate(-10 70 152)">
<rect x="36" y="118" width="68" height="68" rx="14" fill="#a85f00" opacity=".3" transform="translate(6 10)"/>
<rect x="36" y="125" width="68" height="68" rx="14" fill="#e3b26a"/>
<rect x="36" y="118" width="68" height="68" rx="14" fill="#ffe3b3"/>
<text x="70" y="167" text-anchor="middle" font-size="42" fill="#9a6420" ${F}>4</text>
</g>
<g transform="rotate(6 80 242)">
<rect x="53" y="215" width="54" height="54" rx="12" fill="#a85f00" opacity=".3" transform="translate(5 8)"/>
<rect x="53" y="221" width="54" height="54" rx="12" fill="#e6c48e"/>
<rect x="53" y="215" width="54" height="54" rx="12" fill="#fff6e2"/>
<text x="80" y="254" text-anchor="middle" font-size="34" fill="#9a6420" ${F}>2</text>
</g>
<path d="M366 34 L370 46 L382 50 L370 54 L366 66 L362 54 L350 50 L362 46 Z" fill="#fff"/>
<path d="M362 236 L365 245 L374 248 L365 251 L362 260 L359 251 L350 248 L359 245 Z" fill="#fff"/>
<path d="M178 252 L181 260 L189 263 L181 266 L178 274 L175 266 L167 263 L175 260 Z" fill="#fff" opacity=".85"/>
</svg>`;

  const car = (body, top, glass) => `<rect x="-26" y="-46" width="52" height="92" rx="16" fill="#1d1b26" opacity=".3" transform="translate(7 9)"/>
<rect x="-31" y="-34" width="10" height="20" rx="4" fill="#1d1b26"/><rect x="21" y="-34" width="10" height="20" rx="4" fill="#1d1b26"/>
<rect x="-31" y="16" width="10" height="20" rx="4" fill="#1d1b26"/><rect x="21" y="16" width="10" height="20" rx="4" fill="#1d1b26"/>
<rect x="-26" y="-46" width="52" height="92" rx="16" fill="${body}"/>
<path d="M-19 -16 Q0 -25 19 -16 L16 -3 H-16 Z" fill="${glass}"/>
<rect x="-16" y="-3" width="32" height="25" rx="6" fill="${top}"/>
<path d="M-16 22 H16 L18 32 Q0 37 -18 32 Z" fill="${glass}"/>
<rect x="-20" y="-45" width="11" height="6" rx="3" fill="#fff"/><rect x="9" y="-45" width="11" height="6" rx="3" fill="#fff"/>`;



  S['perfect-stop'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="pst-bg" cx="55%" cy="40%" r="75%"><stop offset="0" stop-color="#bb8ce6"/><stop offset="1" stop-color="#8d55c4"/></radialGradient>
<linearGradient id="pst-tr" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".5"/></linearGradient>
</defs>
<rect width="400" height="300" fill="url(#pst-bg)"/>
<circle cx="244" cy="150" r="118" fill="#fff" opacity=".07"/>
<circle cx="244" cy="150" r="80" fill="#fff" opacity=".08"/>
<rect x="34" y="122" width="332" height="68" rx="34" fill="#4e2a7a" opacity=".45" transform="translate(8 14)"/>
<rect x="34" y="132" width="332" height="68" rx="34" fill="#251a38"/>
<rect x="34" y="120" width="332" height="68" rx="34" fill="#3a2a58"/>
<rect x="52" y="136" width="296" height="36" rx="18" fill="#1f152f"/>
<path d="M236 96 L96 142 V166 L236 212 Z" fill="url(#pst-tr)"/>
<rect x="190" y="136" width="108" height="36" fill="#ffd166"/>
<rect x="214" y="124" width="60" height="60" rx="14" fill="#4fd38e" opacity=".4"/>
<rect x="222" y="136" width="44" height="36" fill="#4fd38e"/>
<rect x="190" y="136" width="108" height="8" fill="#fff" opacity=".35"/>
<rect x="238" y="98" width="20" height="112" rx="10" fill="#1d1b26" opacity=".3" transform="translate(5 7)"/>
<rect x="234" y="94" width="20" height="120" rx="10" fill="#fff"/>
<path d="M226 78 H262 L244 96 Z" fill="#fff" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>
<path d="M210 64 L198 50 M244 54 V36 M278 64 L290 50 M296 96 H314 M192 96 H174" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
<path d="M318 30 L323 45 L338 50 L323 55 L318 70 L313 55 L298 50 L313 45 Z" fill="#ffd166"/>
<path d="M150 46 L154 56 L164 60 L154 64 L150 74 L146 64 L136 60 L146 56 Z" fill="#ffd166"/>
<path d="M310 226 L313 235 L322 238 L313 241 L310 250 L307 241 L298 238 L307 235 Z" fill="#fff"/>
<path d="M80 226 L83 234 L91 237 L83 240 L80 248 L77 240 L69 237 L77 234 Z" fill="#fff" opacity=".7"/>
</svg>`;

  const back = (x, y) => `<rect x="${x}" y="${y}" width="92" height="116" rx="14" fill="#c9446b" opacity=".35" transform="translate(6 10)"/>
<rect x="${x}" y="${y + 6}" width="92" height="116" rx="14" fill="#5a2f9e"/>
<rect x="${x}" y="${y}" width="92" height="116" rx="14" fill="#7d4cc9"/>
<rect x="${x + 10}" y="${y + 10}" width="72" height="96" rx="9" fill="none" stroke="#fff" stroke-width="4" opacity=".35"/>
<path d="M${x + 46} ${y + 36} L${x + 68} ${y + 58} L${x + 46} ${y + 80} L${x + 24} ${y + 58} Z" fill="#fff" opacity=".3"/>`;
  const heart = 'M0 24 C-34 2 -38 -18 -22 -27 C-11 -33 0 -24 0 -15 C0 -24 11 -33 22 -27 C38 -18 34 2 0 24 Z';
  const face = (cx, cy, r) => `<g transform="rotate(${r} ${cx} ${cy})">
<rect x="${cx - 54}" y="${cy - 66}" width="108" height="132" rx="22" fill="#fff" opacity=".22"/>
<rect x="${cx - 46}" y="${cy - 58}" width="92" height="116" rx="14" fill="#c9446b" opacity=".35" transform="translate(6 12)"/>
<rect x="${cx - 46}" y="${cy - 52}" width="92" height="116" rx="14" fill="#f2c2d0"/>
<rect x="${cx - 46}" y="${cy - 58}" width="92" height="116" rx="14" fill="#fff"/>
<path d="${heart}" fill="#ef476f" transform="translate(${cx} ${cy + 2}) scale(1.05)"/>
<ellipse cx="${cx - 14}" cy="${cy - 14}" rx="7" ry="5" fill="#fff" opacity=".6" transform="rotate(-30 ${cx - 14} ${cy - 14})"/>
</g>`;

  S['pairs'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="prs-bg" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#ffaac0"/><stop offset="1" stop-color="#ff7d9e"/></radialGradient></defs>
<rect width="400" height="300" fill="url(#prs-bg)"/>
${back(46, 18)}
${back(262, 18)}
${back(154, 160)}
<path d="M184 30 L218 20 V144 L184 134 Z" fill="#c9446b" opacity=".35" stroke="#c9446b" stroke-width="10" stroke-linejoin="round" transform="translate(6 10)"/>
<path d="M184 30 L218 20 V144 L184 134 Z" fill="#7d4cc9" stroke="#7d4cc9" stroke-width="10" stroke-linejoin="round"/>
<path d="M184 30 L218 20 V144 L184 134 Z" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>
<path d="M201 60 L210 82 L201 104 L192 82 Z" fill="#fff" opacity=".35"/>
<path d="M166 52 Q158 79 166 106 M234 52 Q242 79 234 106" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>
<path d="M160 98 L166 108 L174 99 M240 60 L234 50 L226 59" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
${face(92, 216, -7)}
${face(308, 216, 7)}
<path d="M38 150 L42 160 L52 164 L42 168 L38 178 L34 168 L24 164 L34 160 Z" fill="#ffd166"/>
<path d="M366 146 L370 157 L381 161 L370 165 L366 176 L362 165 L351 161 L362 157 Z" fill="#ffd166"/>
<path d="M140 270 L143 278 L151 281 L143 284 L140 292 L137 284 L129 281 L137 278 Z" fill="#fff"/>
</svg>`;

  const pill = (x, y, c, l) => `<rect x="${x}" y="${y}" width="168" height="50" rx="25" fill="#c98f1c" opacity=".35" transform="translate(5 7)"/>
<rect x="${x}" y="${y}" width="168" height="50" rx="25" fill="#fff"/>
<circle cx="${x + 26}" cy="${y + 25}" r="18" fill="${c}"/>
<text x="${x + 26}" y="${y + 33}" text-anchor="middle" font-size="22" fill="#fff" ${F}>${l}</text>
<rect x="${x + 54}" y="${y + 20}" width="92" height="11" rx="5.5" fill="#f3dca2"/>`;

  S['trivia'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="trv-bg" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#ffde8a"/><stop offset="1" stop-color="#ffc240"/></radialGradient></defs>
<rect width="400" height="300" fill="url(#trv-bg)"/>
<circle cx="200" cy="70" r="96" fill="#fff" opacity=".18"/>
<g transform="translate(6 8)" fill="#c98f1c" opacity=".35"><rect x="112" y="12" width="176" height="114" rx="32"/><path d="M146 118 L128 148 L182 122 Z"/></g>
<rect x="112" y="12" width="176" height="114" rx="32" fill="#fff"/>
<path d="M146 118 L128 148 L182 122 Z" fill="#fff" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>
<text x="200" y="104" text-anchor="middle" font-size="92" fill="#7b4fd6" ${F}>?</text>
${pill(24, 158, '#7b4fd6', 'A')}
${pill(24, 226, '#ef476f', 'C')}
${pill(208, 226, '#5b8def', 'D')}
<g transform="rotate(-3 292 183)">
<rect x="208" y="158" width="168" height="50" rx="25" fill="#2e8a5c" opacity=".4" transform="translate(5 8)"/>
<rect x="204" y="154" width="176" height="56" rx="28" fill="#4cc38a"/>
<circle cx="232" cy="182" r="19" fill="#fff"/>
<text x="232" y="190" text-anchor="middle" font-size="22" fill="#2e9a66" ${F}>B</text>
<rect x="260" y="177" width="80" height="11" rx="5.5" fill="#fff" opacity=".75"/>
<circle cx="372" cy="156" r="20" fill="#fff"/>
<path d="M362 156 L369 164 L382 149" stroke="#2e9a66" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<path d="M330 40 L334 52 L346 56 L334 60 L330 72 L326 60 L314 56 L326 52 Z" fill="#fff"/>
<path d="M66 70 L69 79 L78 82 L69 85 L66 94 L63 85 L54 82 L63 79 Z" fill="#fff"/>
</svg>`;

  const tgt = (cx, cy, r) => `<circle cx="${cx + 7}" cy="${cy + 10}" r="${r}" fill="#a8203f" opacity=".35"/>
<circle cx="${cx}" cy="${cy + 6}" r="${r}" fill="#b8b0c4"/>
<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff"/>
<circle cx="${cx}" cy="${cy}" r="${r * .8}" fill="#c9244f"/>
<circle cx="${cx}" cy="${cy}" r="${r * .6}" fill="#fff"/>
<circle cx="${cx}" cy="${cy}" r="${r * .4}" fill="#c9244f"/>
<circle cx="${cx}" cy="${cy}" r="${r * .2}" fill="#ffd166"/>`;

  S['aim'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="aim-bg" cx="55%" cy="45%" r="75%"><stop offset="0" stop-color="#f76b88"/><stop offset="1" stop-color="#df3a62"/></radialGradient></defs>
<rect width="400" height="300" fill="url(#aim-bg)"/>
${tgt(338, 236, 30)}
${tgt(232, 148, 80)}
<circle cx="84" cy="84" r="54" fill="none" stroke="#fff" stroke-width="5" opacity=".45"/>
${tgt(84, 84, 30)}
<g fill="#fff"><circle cx="84" cy="14" r="7"/><circle cx="140" cy="44" r="6"/><circle cx="152" cy="98" r="8"/><circle cx="118" cy="146" r="6"/><circle cx="40" cy="140" r="7"/><circle cx="16" cy="78" r="6"/><circle cx="34" cy="28" r="5"/></g>
<g fill="#ffd166"><circle cx="122" cy="20" r="5"/><circle cx="160" cy="70" r="5"/><circle cx="82" cy="158" r="6"/><circle cx="16" cy="114" r="5"/></g>
<g fill="none" stroke-linecap="round">
<g stroke="#fff" stroke-width="15"><circle cx="232" cy="148" r="40"/><path d="M232 78 V110 M232 186 V218 M162 148 H194 M270 148 H302"/></g>
<g stroke="#1d1b26" stroke-width="7"><circle cx="232" cy="148" r="40"/><path d="M232 78 V110 M232 186 V218 M162 148 H194 M270 148 H302"/></g>
</g>
<circle cx="232" cy="148" r="5" fill="#1d1b26"/>
<path d="M44 262 L48 272 L58 276 L48 280 L44 290 L40 280 L30 276 L40 272 Z" fill="#fff" opacity=".8"/>
</svg>`;


})();

