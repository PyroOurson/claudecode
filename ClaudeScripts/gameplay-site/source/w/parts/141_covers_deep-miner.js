
(() => {
  const S = Ameplay.covers;
  const F = 'font-family="Nunito, Arial Rounded MT Bold, Arial, sans-serif" font-weight="800"';



  S['chimp-test'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="chm-bg" cx="40%" cy="40%" r="75%"><stop offset="0" stop-color="#a3dd3f"/><stop offset="1" stop-color="#6fae17"/></radialGradient>
<g id="chm-t"><rect y="6" width="48" height="48" rx="10" fill="#4d7c0f" opacity=".45"/><rect width="48" height="48" rx="10" fill="#fff"/></g></defs>
<rect width="400" height="300" fill="url(#chm-bg)"/>
<g fill="#fff" opacity=".18"><rect x="20" y="24" width="48" height="48" rx="10"/><rect x="76" y="24" width="48" height="48" rx="10"/><rect x="132" y="24" width="48" height="48" rx="10"/><rect x="244" y="24" width="48" height="48" rx="10"/><rect x="76" y="80" width="48" height="48" rx="10"/><rect x="132" y="80" width="48" height="48" rx="10"/><rect x="188" y="80" width="48" height="48" rx="10"/><rect x="20" y="136" width="48" height="48" rx="10"/><rect x="76" y="136" width="48" height="48" rx="10"/><rect x="188" y="136" width="48" height="48" rx="10"/><rect x="244" y="136" width="48" height="48" rx="10"/><rect x="20" y="192" width="48" height="48" rx="10"/><rect x="132" y="192" width="48" height="48" rx="10"/><rect x="188" y="192" width="48" height="48" rx="10"/><rect x="244" y="192" width="48" height="48" rx="10"/></g>
<use href="#chm-t" x="132" y="136"/><use href="#chm-t" x="20" y="80"/><use href="#chm-t" x="188" y="24"/><use href="#chm-t" x="76" y="192"/><use href="#chm-t" x="244" y="80"/>
<g font-size="32" text-anchor="middle" fill="#1d1b26" ${F}><text x="156" y="171">1</text><text x="44" y="115">2</text><text x="212" y="59">3</text><text x="100" y="227">4</text><text x="268" y="115">5</text></g>
<circle cx="174" cy="176" r="14" fill="none" stroke="#fff" stroke-width="4" opacity=".8"/><circle cx="174" cy="176" r="26" fill="none" stroke="#fff" stroke-width="4" opacity=".4"/>
<path d="M282 310Q250 250 204 210" stroke="#6b4226" stroke-width="26" stroke-linecap="round" fill="none"/>
<path d="M200 206L178 180" stroke="#e0a877" stroke-width="11" stroke-linecap="round"/>
<circle cx="204" cy="210" r="15" fill="#e0a877"/><circle cx="214" cy="198" r="6" fill="#e0a877"/><path d="M196 216Q206 222 214 214" stroke="#b9805a" stroke-width="3" fill="none" stroke-linecap="round"/>
<ellipse cx="334" cy="306" rx="66" ry="34" fill="#6b4226"/>
<circle cx="282" cy="212" r="18" fill="#6b4226"/><circle cx="384" cy="212" r="18" fill="#6b4226"/><circle cx="282" cy="212" r="9" fill="#e0a877"/><circle cx="384" cy="212" r="9" fill="#e0a877"/>
<circle cx="333" cy="224" r="52" fill="#6b4226"/><path d="M316 178Q324 160 334 174Q342 162 350 178Z" fill="#6b4226"/>
<circle cx="314" cy="218" r="21" fill="#e0a877"/><circle cx="352" cy="218" r="21" fill="#e0a877"/><ellipse cx="333" cy="250" rx="33" ry="24" fill="#e0a877"/>
<circle cx="316" cy="220" r="7" fill="#1d1b26"/><circle cx="350" cy="220" r="7" fill="#1d1b26"/><circle cx="318" cy="217" r="2.5" fill="#fff"/><circle cx="352" cy="217" r="2.5" fill="#fff"/>
<ellipse cx="327" cy="242" rx="3" ry="2.5" fill="#6b4226"/><ellipse cx="339" cy="242" rx="3" ry="2.5" fill="#6b4226"/>
<path d="M317 256Q333 270 349 256" stroke="#6b4226" stroke-width="4" fill="none" stroke-linecap="round"/>
<circle cx="300" cy="244" r="7" fill="#ff8fa3" opacity=".45"/><circle cx="366" cy="244" r="7" fill="#ff8fa3" opacity=".45"/>
<path d="M360 40l4 12 12 4-12 4-4 12-4-12-12-4 12-4z" fill="#fff"/>
</svg>`;

  S['tetra'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="tet-bg" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#7577e0"/><stop offset="1" stop-color="#4a4cb8"/></radialGradient>
<g id="tet-b"><rect width="24" height="24" rx="4"/><rect y="17" width="24" height="7" rx="3" fill="#000" opacity=".2"/><rect x="3" y="3" width="18" height="5" rx="2.5" fill="#fff" opacity=".45"/></g></defs>
<rect width="400" height="300" fill="url(#tet-bg)"/>
<g fill="#8e90ec" opacity=".7"><g transform="rotate(-14 40 120)"><use href="#tet-b" x="28" y="60"/><use href="#tet-b" x="28" y="86"/><use href="#tet-b" x="28" y="112"/><use href="#tet-b" x="28" y="138"/></g><g transform="rotate(12 360 220)"><use href="#tet-b" x="330" y="200"/><use href="#tet-b" x="356" y="200"/><use href="#tet-b" x="356" y="226"/><use href="#tet-b" x="382" y="226"/></g></g>
<path d="M330 40l4 12 12 4-12 4-4 12-4-12-12-4 12-4z M50 236l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="#fff"/>
<rect x="94" y="20" width="228" height="300" rx="16" fill="#1d1b26" opacity=".25"/>
<rect x="86" y="10" width="228" height="310" rx="16" fill="#26277a" stroke="#8e90ec" stroke-width="5"/>
<g fill="#c77dff" opacity=".18"><use href="#tet-b" x="175" y="31"/><use href="#tet-b" x="201" y="31"/><use href="#tet-b" x="227" y="31"/><use href="#tet-b" x="201" y="57"/></g>
<path d="M188 20V70M214 24V80M240 20V70" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".35"/>
<g fill="#c77dff"><use href="#tet-b" x="175" y="91"/><use href="#tet-b" x="201" y="91"/><use href="#tet-b" x="227" y="91"/><use href="#tet-b" x="201" y="117"/></g>
<use href="#tet-b" x="97" y="197" fill="#ff5d8f"/><use href="#tet-b" x="97" y="223" fill="#ff5d8f"/><use href="#tet-b" x="123" y="223" fill="#ff5d8f"/>
<use href="#tet-b" x="175" y="223" fill="#ffd166"/><use href="#tet-b" x="201" y="223" fill="#ffd166"/><use href="#tet-b" x="279" y="197" fill="#4cc9f0"/><use href="#tet-b" x="279" y="223" fill="#4cc9f0"/><use href="#tet-b" x="253" y="223" fill="#4cc9f0"/>
<use href="#tet-b" x="97" y="275" fill="#ff9f1c"/><use href="#tet-b" x="123" y="275" fill="#ff9f1c"/><use href="#tet-b" x="149" y="275" fill="#4cc9f0"/><use href="#tet-b" x="175" y="275" fill="#4cc9f0"/><use href="#tet-b" x="227" y="275" fill="#80ed99"/><use href="#tet-b" x="253" y="275" fill="#80ed99"/><use href="#tet-b" x="279" y="275" fill="#ffd166"/>
<rect x="56" y="236" width="288" height="50" rx="25" fill="#fff" opacity=".22"/><rect x="80" y="242" width="240" height="38" rx="19" fill="#fff" opacity=".35"/>
<g fill="#fff"><rect x="97" y="249" width="24" height="24" rx="4"/><rect x="123" y="249" width="24" height="24" rx="4"/><rect x="149" y="249" width="24" height="24" rx="4"/><rect x="175" y="249" width="24" height="24" rx="4"/><rect x="201" y="249" width="24" height="24" rx="4"/><rect x="227" y="249" width="24" height="24" rx="4"/><rect x="253" y="249" width="24" height="24" rx="4"/><rect x="279" y="249" width="24" height="24" rx="4"/></g>
<path d="M50 262H76M324 262H350M66 244L78 252M334 244L322 252M66 280L78 272M334 280L322 272" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
</svg>`;

  S['bubble-pop'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="bub-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3aaed6"/><stop offset="1" stop-color="#6fd3f0"/></linearGradient>
<radialGradient id="bub-rg" cx="40%" cy="35%" r="65%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></radialGradient>
<g id="bub-h"><circle r="22" fill="url(#bub-rg)"/><ellipse cx="-8" cy="-9" rx="7" ry="4.5" fill="#fff" opacity=".8" transform="rotate(-40 -8 -9)"/></g></defs>
<rect width="400" height="300" fill="url(#bub-bg)"/>
<g><circle cx="22" cy="22" r="22" fill="#9b5de5"/><circle cx="66" cy="22" r="22" fill="#9b5de5"/><circle cx="110" cy="22" r="22" fill="#ffd166"/><circle cx="154" cy="22" r="22" fill="#ffd166"/><circle cx="198" cy="22" r="22" fill="#ff5d73"/><circle cx="242" cy="22" r="22" fill="#ff5d73"/><circle cx="286" cy="22" r="22" fill="#2ec4a0"/><circle cx="330" cy="22" r="22" fill="#2ec4a0"/><circle cx="374" cy="22" r="22" fill="#ffd166"/>
<circle cx="44" cy="60" r="22" fill="#ff9f43"/><circle cx="88" cy="60" r="22" fill="#9b5de5"/><circle cx="132" cy="60" r="22" fill="#ffd166"/><circle cx="176" cy="60" r="22" fill="#ff5d73"/><circle cx="220" cy="60" r="22" fill="#2ec4a0"/><circle cx="264" cy="60" r="22" fill="#2ec4a0"/><circle cx="308" cy="60" r="22" fill="#ffd166"/><circle cx="352" cy="60" r="22" fill="#ff9f43"/>
<circle cx="22" cy="98" r="22" fill="#2ec4a0"/><circle cx="66" cy="98" r="22" fill="#ff9f43"/><circle cx="242" cy="98" r="22" fill="#9b5de5"/><circle cx="286" cy="98" r="22" fill="#9b5de5"/><circle cx="374" cy="98" r="22" fill="#2ec4a0"/><circle cx="264" cy="136" r="22" fill="#9b5de5"/></g>
<use href="#bub-h" x="22" y="22"/><use href="#bub-h" x="66" y="22"/><use href="#bub-h" x="110" y="22"/><use href="#bub-h" x="154" y="22"/><use href="#bub-h" x="198" y="22"/><use href="#bub-h" x="242" y="22"/><use href="#bub-h" x="286" y="22"/><use href="#bub-h" x="330" y="22"/><use href="#bub-h" x="374" y="22"/><use href="#bub-h" x="44" y="60"/><use href="#bub-h" x="88" y="60"/><use href="#bub-h" x="132" y="60"/><use href="#bub-h" x="176" y="60"/><use href="#bub-h" x="220" y="60"/><use href="#bub-h" x="264" y="60"/><use href="#bub-h" x="308" y="60"/><use href="#bub-h" x="352" y="60"/><use href="#bub-h" x="22" y="98"/><use href="#bub-h" x="66" y="98"/><use href="#bub-h" x="242" y="98"/><use href="#bub-h" x="286" y="98"/><use href="#bub-h" x="374" y="98"/><use href="#bub-h" x="264" y="136"/>
<g stroke="#fff" stroke-width="5" stroke-linecap="round"><path d="M110 74V66M132 98H140M86 98H80M126 82L132 76M94 82L88 76M126 114L132 120M94 114L88 120M110 122V130"/><path d="M176 74V66M198 98H206M154 98H148M192 82L198 76M160 82L154 76M192 114L198 120M160 114L154 120M176 122V130"/></g>
<g fill="#ff5d73"><circle cx="110" cy="98" r="9"/><circle cx="176" cy="98" r="9"/><circle cx="96" cy="88" r="4"/><circle cx="124" cy="108" r="4"/><circle cx="188" cy="86" r="4"/><circle cx="164" cy="110" r="4"/></g>
<circle cx="110" cy="98" r="20" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="5 7" opacity=".8"/><circle cx="176" cy="98" r="20" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="5 7" opacity=".8"/>
<g fill="#fff"><circle cx="185" cy="214" r="6"/><circle cx="178" cy="196" r="6" opacity=".9"/><circle cx="171" cy="178" r="6" opacity=".8"/><circle cx="164" cy="160" r="6" opacity=".65"/><circle cx="157" cy="142" r="6" opacity=".5"/><circle cx="150" cy="124" r="6" opacity=".35"/></g>
<path d="M330 150V170M352 180V200M316 140V156" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6"/>
<circle cx="330" cy="196" r="18" fill="#ffd166"/><use href="#bub-h" transform="translate(330 196) scale(.82)"/><circle cx="356" cy="232" r="15" fill="#2ec4a0"/><use href="#bub-h" transform="translate(356 232) scale(.68)"/>
<ellipse cx="200" cy="304" rx="78" ry="44" fill="#1d6f96"/>
<g transform="rotate(-22 200 262)"><path d="M-9 -16L-9 -54L-20 -54L0 -84L20 -54L9 -54L9 -16Z" transform="translate(200 262)" fill="#fff"/></g>
<circle cx="200" cy="262" r="24" fill="#1d1b26" opacity=".25"/><circle cx="200" cy="260" r="22" fill="#ff5d73"/><use href="#bub-h" x="200" y="260"/>
<circle cx="124" cy="282" r="14" fill="#ffd166"/><use href="#bub-h" transform="translate(124 282) scale(.64)"/>
<path d="M60 160l4 11 11 4-11 4-4 11-4-11-11-4 11-4z M330 266l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#fff"/>
</svg>`;

  S['gem-swap'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="gem-bg" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#d63bbf"/><stop offset="1" stop-color="#8e0f7b"/></radialGradient>
<pattern id="gem-ck" width="100" height="100" patternUnits="userSpaceOnUse" x="50" y="50"><rect width="100" height="100" fill="#6e0f63"/><rect width="50" height="50" fill="#821676"/><rect x="50" y="50" width="50" height="50" fill="#821676"/></pattern>
<g id="gem-r"><path d="M0-19L17-9V9L0 19L-17 9V-9Z" fill="#ff4d6d"/><path d="M17 0V9L0 19L-17 9V0Z" fill="#000" opacity=".2"/><path d="M0-9L8-4V4L0 9L-8 4V-4Z" fill="#ff99ad"/><path d="M-13-7L0-15L3-12L-9-4Z" fill="#fff" opacity=".8"/></g>
<g id="gem-b"><path d="M0-20L18 0L0 20L-18 0Z" fill="#4cc9f0"/><path d="M18 0L0 20L-18 0Z" fill="#000" opacity=".2"/><path d="M0-9L8 0L0 9L-8 0Z" fill="#b5ecfb"/><path d="M-12-2L-2-14L1-10L-7-1Z" fill="#fff" opacity=".85"/></g>
<g id="gem-g"><path d="M-10-17H10L17-10V10L10 17H-10L-17 10V-10Z" fill="#3fd37f"/><path d="M17 0V10L10 17H-10L-17 10V0Z" fill="#000" opacity=".2"/><rect x="-8" y="-8" width="16" height="16" rx="2" fill="#a6f0c3"/><path d="M-13-8L-8-13H2L-9-4Z" fill="#fff" opacity=".8"/></g>
<g id="gem-y"><circle r="18" fill="#ffd23f"/><path d="M-18 0A18 18 0 0 0 18 0Z" fill="#000" opacity=".15"/><path d="M0-9L9 0L0 9L-9 0Z" fill="#fff1b0"/><path d="M-12-6A13 13 0 0 1-4-13" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/></g>
<g id="gem-p"><path d="M0 19L19-14L-19-14Z" fill="#b388ff"/><path d="M0 19L19-14L0-14Z" fill="#000" opacity=".2"/><path d="M0 6L7-7H-7Z" fill="#e2d1ff"/><path d="M-13-10H-2L-8 0Z" fill="#fff" opacity=".8"/></g></defs>
<rect width="400" height="300" fill="url(#gem-bg)"/>
<rect x="48" y="50" width="316" height="216" rx="18" fill="#1d1b26" opacity=".25"/>
<rect x="40" y="40" width="320" height="220" rx="18" fill="#4f0846"/><rect x="50" y="50" width="300" height="200" fill="url(#gem-ck)"/>
<use href="#gem-b" x="75" y="75"/><use href="#gem-g" x="125" y="75"/><use href="#gem-r" x="175" y="75"/><use href="#gem-y" x="225" y="75"/><use href="#gem-p" x="275" y="75"/><use href="#gem-b" x="325" y="75"/>
<use href="#gem-y" x="75" y="125"/><use href="#gem-r" x="125" y="125"/><use href="#gem-b" x="175" y="125"/><use href="#gem-p" x="225" y="125"/><use href="#gem-g" x="275" y="125"/><use href="#gem-r" x="325" y="125"/>
<use href="#gem-r" x="75" y="175"/><use href="#gem-b" x="125" y="175"/><use href="#gem-y" x="275" y="175"/><use href="#gem-y" x="325" y="175"/>
<use href="#gem-p" x="75" y="225"/><use href="#gem-g" x="125" y="225"/><use href="#gem-r" x="175" y="225"/><use href="#gem-b" x="225" y="225"/><use href="#gem-g" x="275" y="225"/><use href="#gem-p" x="325" y="225"/>
<rect x="148" y="148" width="104" height="54" rx="14" fill="#fff" opacity=".22" stroke="#fff" stroke-width="4"/>
<use href="#gem-y" transform="translate(186 168) scale(1.2)"/><use href="#gem-p" transform="translate(214 182) scale(1.2)"/>
<path d="M176 140Q200 124 224 140M224 210Q200 226 176 210" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M226 128L230 144L214 146Z M174 222L170 206L186 204Z" fill="#fff"/>
<path d="M372 22l4 12 12 4-12 4-4 12-4-12-12-4 12-4z M26 250l4 11 11 4-11 4-4 11-4-11-11-4 11-4z M300 150l3 8 8 3-8 3-3 8-3-8-8-3 8-3z M24 30l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#fff"/>
</svg>`;

  S['box-pusher'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="box-bg" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#c9a582"/><stop offset="1" stop-color="#957254"/></radialGradient>
<linearGradient id="box-bm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd166" stop-opacity="0"/><stop offset="1" stop-color="#ffd166" stop-opacity=".55"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#box-bg)"/>
<g transform="translate(200 150) scale(1.25) translate(-205 -145)">
<path d="M368 162L200 246L32 162V182L200 266L368 182Z" fill="#000" opacity=".15"/>
<path d="M368 144L200 228V246L368 162Z" fill="#7f5539"/><path d="M32 144L200 228V246L32 162Z" fill="#9c6644"/>
<path d="M200 60L368 144L200 228L32 144Z" fill="#f2e2cf"/>
<path d="M172 102L200 116L172 130L144 116ZM116 130L144 144L116 158L88 144ZM228 102L256 116L228 130L200 116ZM172 130L200 144L172 158L144 144ZM116 158L144 172L116 186L88 172ZM228 130L256 144L228 158L200 144ZM172 158L200 172L172 186L144 172ZM284 130L312 144L284 158L256 144ZM228 158L256 172L228 186L200 172ZM172 186L200 200L172 214L144 200ZM284 158L312 172L284 186L256 172ZM228 186L256 200L228 214L200 200Z" fill="#e3c9a8"/>
<path d="M200 28L368 112L340 126L172 42Z" fill="#c97b4a"/><path d="M172 42L340 126V158L172 74Z" fill="#a65a32"/><path d="M340 126L368 112V144L340 158Z" fill="#874425"/>
<path d="M172 58L340 142M200 50V82M256 78V110M312 106V138M228 80V112M284 108V140" stroke="#f2e2cf" stroke-width="3" opacity=".35"/>
<path d="M172 42L200 56L60 126L32 112Z" fill="#c97b4a"/><path d="M200 56L60 126V158L200 88Z" fill="#874425"/><path d="M32 112L60 126V158L32 144Z" fill="#a65a32"/>
<path d="M200 72L60 142M172 70V102M116 98V130M144 84V116M88 112V144" stroke="#f2e2cf" stroke-width="3" opacity=".35"/>
<rect x="234" y="62" width="44" height="68" fill="url(#box-bm)"/>
<ellipse cx="256" cy="130" rx="24" ry="12" fill="#ffd166" opacity=".45"/><ellipse cx="256" cy="130" rx="17" ry="8.5" fill="none" stroke="#f3722c" stroke-width="4"/><ellipse cx="256" cy="130" rx="6" ry="3" fill="#f3722c"/>
<path d="M252 142L276 130L224 104L184 118Z" fill="#000" opacity=".12"/>
<path d="M208 166L236 152L236 158L208 172Z" fill="#000" opacity=".15"/>
<g stroke="#6b3e16" stroke-width="3" stroke-linejoin="round"><path d="M208 98L232 110L208 122L184 110Z" fill="#f2b766"/><path d="M184 110L208 122V166L184 154Z" fill="#d98f3e"/><path d="M208 122L232 110V154L208 166Z" fill="#b8732c"/></g>
<g stroke="#8a5220" stroke-width="3" fill="none" stroke-linejoin="round"><path d="M188 117L204 125V158L188 150Z"/><path d="M212 125L228 117V150L212 158Z"/><path d="M188 150L204 125M212 158L228 117M196 104L220 116"/></g>
<g fill="#fff" opacity=".7"><circle cx="176" cy="164" r="6"/><circle cx="166" cy="170" r="4"/><circle cx="240" cy="160" r="4"/></g>
<path d="M118 186L136 177M110 172L128 163M126 200L144 191" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6"/>
<ellipse cx="160" cy="188" rx="17" ry="7" fill="#000" opacity=".2"/>
<g transform="translate(160 188) rotate(18)"><rect x="-11" y="-24" width="9" height="24" rx="4" fill="#264653"/><rect x="2" y="-24" width="9" height="24" rx="4" fill="#264653"/><path d="M0 -40L24 -40" stroke="#2f6fd6" stroke-width="8" stroke-linecap="round"/><rect x="-13" y="-52" width="26" height="32" rx="10" fill="#3a86ff"/><path d="M0 -46L24 -48" stroke="#3a86ff" stroke-width="8" stroke-linecap="round"/><circle cx="25" cy="-47" r="5" fill="#f4c095"/><circle cx="25" cy="-40" r="5" fill="#f4c095"/><circle cx="0" cy="-62" r="11" fill="#f4c095"/><circle cx="6" cy="-62" r="2" fill="#1d1b26"/><path d="M-12 -64A12 12 0 0 1 12 -64Z" fill="#ffd166"/><rect x="-12" y="-66" width="28" height="4" rx="2" fill="#f4a300"/></g>
</g>
<path d="M60 230l4 11 11 4-11 4-4 11-4-11-11-4 11-4z M350 40l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#fff"/>
</svg>`;

  S['pipe-connect'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="pip-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14a6d9"/><stop offset="1" stop-color="#0083b0"/></linearGradient>
<pattern id="pip-t" width="54" height="54" patternUnits="userSpaceOnUse" x="60" y="42"><rect x="2" y="2" width="50" height="50" rx="10" fill="#0a86b3"/></pattern></defs>
<rect width="400" height="300" fill="url(#pip-bg)"/>
<rect x="60" y="50" width="336" height="228" rx="18" fill="#003f5c" opacity=".3"/>
<rect x="52" y="34" width="340" height="232" rx="18" fill="#036a91"/><rect x="60" y="42" width="324" height="216" fill="url(#pip-t)"/>
<g fill="none" stroke-linecap="butt">
<path d="M87 42V96M114 69Q141 69 141 96M222 69Q195 69 195 96M168 123H222M303 96Q303 123 276 123M87 150Q87 177 114 177M303 150V204M357 150Q357 177 330 177M60 231H114M141 204Q141 231 168 231M195 204V258M222 231Q249 231 249 204M276 231H330M330 231Q357 231 357 258M316 69H330Q357 69 357 96V150" stroke="#023b55" stroke-width="30"/>
<path d="M87 42V96M114 69Q141 69 141 96M222 69Q195 69 195 96M168 123H222M303 96Q303 123 276 123M87 150Q87 177 114 177M303 150V204M357 150Q357 177 330 177M60 231H114M141 204Q141 231 168 231M195 204V258M222 231Q249 231 249 204M276 231H330M330 231Q357 231 357 258M316 69H330Q357 69 357 96V150" stroke="#dfe6eb" stroke-width="22"/>
<path d="M87 42V96M114 69Q141 69 141 96M222 69Q195 69 195 96M168 123H222M303 96Q303 123 276 123M87 150Q87 177 114 177M303 150V204M357 150Q357 177 330 177M60 231H114M141 204Q141 231 168 231M195 204V258M222 231Q249 231 249 204M276 231H330M330 231Q357 231 357 258M316 69H330Q357 69 357 96V150" stroke="#6b7a87" stroke-width="10"/>
<path d="M0 123H114Q141 123 141 150Q141 177 168 177H222Q249 177 249 150V96Q249 69 276 69H316" stroke="#023b55" stroke-width="30"/>
<path d="M0 123H114Q141 123 141 150Q141 177 168 177H222Q249 177 249 150V96Q249 69 276 69H316" stroke="#f1f5f8" stroke-width="22"/>
<path d="M0 123H114Q141 123 141 150Q141 177 168 177H222Q249 177 249 150V96Q249 69 276 69H316" stroke="#3ee0ff" stroke-width="13"/>
<path d="M0 123H114Q141 123 141 150Q141 177 168 177H222Q249 177 249 150V96Q249 69 276 69H316" stroke="#fff" stroke-width="4" stroke-dasharray="10 16" stroke-linecap="round" opacity=".9"/>
</g>
<g fill="#3ee0ff" stroke="#023b55" stroke-width="3"><circle cx="322" cy="69" r="9"/><circle cx="338" cy="56" r="5"/><circle cx="336" cy="84" r="4"/></g>
<rect x="84" y="104" width="8" height="38" rx="3" fill="#9aa8b4" stroke="#023b55" stroke-width="3"/><rect x="246" y="117" width="10" height="8" fill="none"/><rect x="230" y="120" width="38" height="8" rx="3" fill="#9aa8b4" stroke="#023b55" stroke-width="3"/>
<rect x="18" y="108" width="24" height="30" rx="5" fill="#adb5bd" stroke="#023b55" stroke-width="3"/><rect x="27" y="80" width="6" height="30" fill="#6c757d"/>
<circle cx="30" cy="78" r="20" fill="none" stroke="#ef476f" stroke-width="7"/><path d="M30 58V98M10 78H50" stroke="#ef476f" stroke-width="5"/><circle cx="30" cy="78" r="7" fill="#c9184a"/>
<path d="M6 54A30 30 0 0 1 40 46" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/><path d="M40 38L50 48L36 54Z" fill="#fff"/>
<path d="M372 16l3 8 8 3-8 3-3 8-3-8-8-3 8-3z M22 250l4 11 11 4-11 4-4 11-4-11-11-4 11-4z" fill="#fff"/>
</svg>`;

  S['sudoku'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="sdk-bg" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#6aaaf3"/><stop offset="1" stop-color="#2f7ae0"/></radialGradient>
<pattern id="sdk-g" width="28" height="28" patternUnits="userSpaceOnUse" x="60" y="24"><path d="M0 1.5H28M1.5 0V28" stroke="#c9d7ee" stroke-width="3"/></pattern></defs>
<rect width="400" height="300" fill="url(#sdk-bg)"/>
<g transform="rotate(-4 186 150)">
<rect x="54" y="20" width="280" height="280" rx="16" fill="#1d4f9c" opacity=".35"/>
<rect x="46" y="10" width="280" height="280" rx="16" fill="#fff"/>
<rect x="60" y="136" width="252" height="28" fill="#dbe9ff"/><rect x="172" y="24" width="28" height="252" fill="#dbe9ff"/><rect x="172" y="136" width="28" height="28" fill="#ffd166"/>
<rect x="60" y="24" width="252" height="252" fill="url(#sdk-g)"/>
<path d="M144 24V276M228 24V276M60 108H312M60 192H312" stroke="#1d3557" stroke-width="4"/><rect x="60" y="24" width="252" height="252" rx="4" fill="none" stroke="#1d3557" stroke-width="5"/>
<g font-size="22" text-anchor="middle" fill="#1d1b26" ${F}><text x="74" y="46">5</text><text x="102" y="46">3</text><text x="186" y="46">7</text><text x="74" y="74">6</text><text x="158" y="74">1</text><text x="186" y="74">9</text><text x="214" y="74">5</text><text x="102" y="102">9</text><text x="130" y="102">8</text><text x="270" y="102">6</text><text x="74" y="130">8</text><text x="186" y="130">6</text><text x="298" y="130">3</text><text x="74" y="158">4</text><text x="158" y="158">8</text><text x="214" y="158">3</text><text x="298" y="158">1</text><text x="74" y="186">7</text><text x="186" y="186">2</text><text x="298" y="186">6</text><text x="102" y="214">6</text><text x="242" y="214">2</text><text x="270" y="214">8</text><text x="158" y="242">4</text><text x="186" y="242">1</text><text x="214" y="242">9</text><text x="298" y="242">5</text><text x="186" y="270">8</text><text x="270" y="270">7</text><text x="298" y="270">9</text></g>
<text x="186" y="158" font-size="22" text-anchor="middle" fill="#2f6fd6" ${F}>5</text>
</g>
<g transform="translate(206 172) rotate(-40)" fill="#1d4f9c" opacity=".3"><path d="M0 0L36 -13H240V13H36Z"/></g>
<g transform="translate(196 162) rotate(-40)"><path d="M0 0L36 -13V13Z" fill="#f4c98b"/><path d="M0 0L12 -4.5V4.5Z" fill="#1d1b26"/><rect x="36" y="-13" width="160" height="26" fill="#ffbe0b"/><rect x="36" y="-13" width="160" height="8" fill="#ffd166"/><rect x="36" y="5" width="160" height="8" fill="#f59e0b"/><rect x="196" y="-14" width="22" height="28" fill="#ced4da"/><path d="M204 -14V14M211 -14V14" stroke="#9aa5b1" stroke-width="3"/><rect x="216" y="-14" width="28" height="28" rx="7" fill="#ff8fab"/></g>

<path d="M368 240l4 12 12 4-12 4-4 12-4-12-12-4 12-4z M24 40l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="#fff"/>
</svg>`;

  S['chess'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="chs-bg" cx="48%" cy="38%" r="65%"><stop offset="0" stop-color="#8d96a0"/><stop offset=".6" stop-color="#495057"/><stop offset="1" stop-color="#2b3035"/></radialGradient>
<radialGradient id="chs-vg" cx="45%" cy="40%" r="75%"><stop offset=".5" stop-color="#1d1b26" stop-opacity="0"/><stop offset="1" stop-color="#1d1b26" stop-opacity=".6"/></radialGradient>
<linearGradient id="chs-w" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#eef0f2"/><stop offset="1" stop-color="#9aa1a9"/></linearGradient>
<linearGradient id="chs-b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5f6470"/><stop offset=".45" stop-color="#2b2d36"/><stop offset="1" stop-color="#121218"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#chs-bg)"/>
<path d="M150 0H250L360 260H40Z" fill="#fff" opacity=".06"/>
<path d="M64 142H336L330 150H70Z" fill="#212529"/>
<path d="M70 150H330L483 326H-83Z" fill="#dee2e6"/>
<path d="M103 150L135 150L129 163L94 163ZM168 150L200 150L200 163L165 163ZM233 150L265 150L271 163L235 163ZM298 150L330 150L341 163L306 163ZM59 163L94 163L84 178L46 178ZM129 163L165 163L161 178L123 178ZM200 163L235 163L239 178L200 178ZM271 163L306 163L316 178L277 178ZM84 178L123 178L115 197L72 197ZM161 178L200 178L200 197L157 197ZM239 178L277 178L285 197L243 197ZM316 178L354 178L371 197L328 197ZM29 197L72 197L57 220L9 220ZM115 197L157 197L152 220L105 220ZM200 197L243 197L248 220L200 220ZM285 197L328 197L343 220L295 220ZM57 220L105 220L92 249L38 249ZM152 220L200 220L200 249L146 249ZM248 220L295 220L308 249L254 249ZM343 220L391 220L416 249L362 249ZM-16 249L38 249L15 284L-46 284ZM92 249L146 249L138 284L77 284ZM200 249L254 249L262 284L200 284ZM308 249L362 249L385 284L323 284ZM15 284L77 284L59 326L-12 326ZM138 284L200 284L200 326L129 326ZM262 284L323 284L341 326L271 326ZM385 284L446 284L483 326L412 326Z" fill="#3a3f45"/>
<rect width="400" height="300" fill="url(#chs-vg)"/>
<path d="M210 226L330 196L350 214L222 238Z" fill="#000" opacity=".3"/><ellipse cx="262" cy="226" rx="56" ry="10" fill="#000" opacity=".4"/>
<path d="M100 250L250 222L274 240L120 262Z" fill="#000" opacity=".3"/><ellipse cx="150" cy="252" rx="58" ry="11" fill="#000" opacity=".4"/>
<g transform="translate(262 226) scale(.92)" fill="url(#chs-b)"><path d="M-50 0Q-50 -16 -36 -18H36Q50 -16 50 0Z"/><rect x="-42" y="-32" width="84" height="16" rx="8"/><path d="M-28 -30C-30 -50 -22 -66 -12 -76L-38 -70Q-54 -68 -56 -80Q-57 -92 -46 -98L-16 -124Q-12 -136 -2 -140L0 -152L10 -140Q42 -132 40 -86Q38 -50 30 -30Z"/><circle cx="-20" cy="-110" r="4" fill="#ced4da"/><path d="M-46 -98L-16 -124Q-12 -136 -2 -140L0 -152" stroke="#e9ecef" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".85"/><path d="M12 -136Q36 -122 36 -88" stroke="#6c757d" stroke-width="4" stroke-linecap="round" fill="none"/><path d="M-50 -2H50" stroke="#868e96" stroke-width="3" opacity=".6"/></g>
<g fill="url(#chs-w)"><path d="M98 254Q98 238 112 236H188Q202 238 202 254Z"/><rect x="108" y="222" width="84" height="16" rx="8"/><path d="M120 224Q132 182 134 138H166Q168 182 180 224Z"/><rect x="122" y="124" width="56" height="16" rx="8"/><path d="M128 126Q118 104 132 92H168Q182 104 172 126Z"/><rect x="126" y="84" width="48" height="12" rx="6"/><path d="M144 86V70H134V58H144V46H156V58H166V70H156V86Z"/></g>
<path d="M112 238H188M122 140H178M126 96H174" stroke="#adb5bd" stroke-width="3" opacity=".7"/>
<path d="M138 28l4 12 12 4-12 4-4 12-4-12-12-4 12-4z" fill="#fff" opacity=".9"/>
</svg>`;

  S['checkers'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="chk-bg" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#bd3b3c"/><stop offset="1" stop-color="#7d1d1e"/></radialGradient>
<pattern id="chk-p" width="80" height="80" patternUnits="userSpaceOnUse" x="-140" y="-100"><rect x="40" width="40" height="40" fill="#6b2c22"/><rect y="40" width="40" height="40" fill="#6b2c22"/></pattern>
<g id="chk-r"><circle cx="3" cy="10" r="18" fill="#000" opacity=".3"/><circle cy="5" r="18" fill="#9d0208"/><circle r="18" fill="#e5383b"/><circle r="11" fill="none" stroke="#b5171b" stroke-width="3"/><path d="M-11 -8A13 13 0 0 1 4 -14" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".55"/></g>
<g id="chk-b"><circle cx="3" cy="10" r="18" fill="#000" opacity=".3"/><circle cy="5" r="18" fill="#0b0a10"/><circle r="18" fill="#34323f"/><circle r="11" fill="none" stroke="#1d1b26" stroke-width="3"/><path d="M-11 -8A13 13 0 0 1 4 -14" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".35"/></g></defs>
<rect width="400" height="300" fill="url(#chk-bg)"/>
<g transform="translate(200 156) rotate(-10)">
<rect x="-144" y="-100" width="304" height="224" rx="16" fill="#000" opacity=".25"/>
<rect x="-152" y="-112" width="304" height="224" rx="16" fill="#4a1112"/>
<rect x="-140" y="-100" width="280" height="200" fill="#f6e3c3"/><rect x="-140" y="-100" width="280" height="200" fill="url(#chk-p)"/>
<use href="#chk-b" x="-80" y="-80"/><use href="#chk-b" x="80" y="-80"/><use href="#chk-b" x="-120" y="-40"/><use href="#chk-b" x="-40" y="-40"/><use href="#chk-b" x="120" y="-40"/><use href="#chk-b" x="0" y="0"/>
<use href="#chk-r" x="-120" y="40"/><use href="#chk-r" x="120" y="40"/><use href="#chk-r" x="-80" y="80"/><use href="#chk-r" x="0" y="80"/><use href="#chk-r" x="80" y="80"/>
<circle cx="40" cy="-40" r="18" fill="none" stroke="#ffd166" stroke-width="4" stroke-dasharray="7 6"/>
<circle cx="-40" cy="40" r="16" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="5 6" opacity=".6"/>
<path d="M-40 40Q-30 -60 40 -40" stroke="#fff" stroke-width="4" stroke-dasharray="2 10" stroke-linecap="round" fill="none"/>
<ellipse cx="2" cy="8" rx="24" ry="10" fill="#000" opacity=".35"/>
<g transform="translate(-6 -50) scale(1.5)"><use href="#chk-r"/><path d="M-11 4L-13 -9L-5 -2L0 -12L5 -2L13 -9L11 4Z" fill="#ffd166" stroke="#a86b00" stroke-width="2.5" stroke-linejoin="round"/></g>
<path d="M-44 -30L-56 -22M-46 -14L-60 -10M-36 -46L-50 -42" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>
</g>
<path d="M360 30l4 12 12 4-12 4-4 12-4-12-12-4 12-4z M44 262l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="#fff"/>
</svg>`;

  S['reversi'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="rev-bg" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#3f8a66"/><stop offset="1" stop-color="#1f5139"/></radialGradient>
<radialGradient id="rev-bd" cx="45%" cy="40%" r="70%"><stop offset="0" stop-color="#5cb388"/><stop offset="1" stop-color="#3a8f66"/></radialGradient>
<g id="rev-b"><circle cx="3" cy="8" r="20" fill="#000" opacity=".3"/><circle cy="4" r="20" fill="#0b0a10"/><circle r="20" fill="#2e2c38"/><path d="M-12 -8A14 14 0 0 1 2 -15" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".35"/></g>
<g id="rev-w"><circle cx="3" cy="8" r="20" fill="#000" opacity=".3"/><circle cy="4" r="20" fill="#aab3bc"/><circle r="20" fill="#f8f9fa"/><circle r="13" fill="#e9ecef"/><path d="M-12 -8A14 14 0 0 1 2 -15" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/></g></defs>
<rect width="400" height="300" fill="url(#rev-bg)"/>
<rect x="46" y="21" width="324" height="274" rx="18" fill="#000" opacity=".25"/>
<rect x="38" y="13" width="324" height="274" rx="18" fill="#163b2a"/><rect x="50" y="25" width="300" height="250" rx="4" fill="url(#rev-bd)"/>
<path d="M100 25V275M150 25V275M200 25V275M250 25V275M300 25V275M50 75H350M50 125H350M50 175H350M50 225H350" stroke="#1b4332" stroke-width="4"/>
<g fill="#1b4332"><circle cx="150" cy="125" r="6"/><circle cx="250" cy="125" r="6"/><circle cx="150" cy="225" r="6"/><circle cx="250" cy="225" r="6"/></g>
<use href="#rev-w" x="175" y="100"/><use href="#rev-b" x="225" y="100"/><use href="#rev-b" x="125" y="150"/><use href="#rev-w" x="175" y="150"/><use href="#rev-w" x="225" y="150"/><use href="#rev-b" x="275" y="150"/><use href="#rev-w" x="125" y="200"/><use href="#rev-b" x="175" y="200"/><use href="#rev-w" x="175" y="250"/><use href="#rev-b" x="225" y="250"/><use href="#rev-w" x="275" y="50"/>
<circle cx="275" cy="200" r="27" fill="#ffd166" opacity=".35"/><use href="#rev-b" x="275" y="200"/><circle cx="275" cy="200" r="26" fill="none" stroke="#ffd166" stroke-width="4"/>
<ellipse cx="229" cy="206" rx="22" ry="8" fill="#000" opacity=".3"/>
<g transform="translate(225 176) rotate(-35)"><ellipse cy="5" rx="22" ry="10" fill="#0b0a10"/><ellipse rx="22" ry="10" fill="#f8f9fa"/><ellipse rx="13" ry="5.5" fill="#e3e7eb"/></g>
<g stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"><path d="M189 163A38 38 0 0 1 232 139"/><path d="M261 189A38 38 0 0 1 218 213"/></g><path d="M244 141L230 131L230 149ZM206 211L220 203L220 221Z" fill="#fff"/>
<path d="M312 228l4 11 11 4-11 4-4 11-4-11-11-4 11-4z M380 40l3 8 8 3-8 3-3 8-3-8-8-3 8-3z M18 250l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#fff"/>
</svg>`;

  S['solitaire'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="sol-bg" cx="55%" cy="45%" r="75%"><stop offset="0" stop-color="#4f8a5b"/><stop offset="1" stop-color="#26472d"/></radialGradient>
<pattern id="sol-pt" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="14" fill="#3d5a80"/><rect width="7" height="7" fill="#4f6f9b"/></pattern>
<path id="sol-sp" d="M0 -22C10 -10 22 -4 22 6C22 16 10 20 3 13L7 24H-7L-3 13C-10 20 -22 16 -22 6C-22 -4 -10 -10 0 -22Z"/>
<path id="sol-ht" d="M0 20C-12 10 -22 2 -22 -8C-22 -18 -10 -22 0 -12C10 -22 22 -18 22 -8C22 2 12 10 0 20Z"/></defs>
<rect width="400" height="300" fill="url(#sol-bg)"/>
<g stroke="#c8d3c0" stroke-width="3"><g transform="translate(166 56) rotate(-26)" opacity=".35"><rect x="-28" y="-39" width="56" height="78" rx="7" fill="#fff"/><use href="#sol-ht" transform="scale(.6)" fill="#d62839" stroke="none"/></g><g transform="translate(126 74) rotate(-16)" opacity=".5"><rect x="-28" y="-39" width="56" height="78" rx="7" fill="#fff"/><use href="#sol-ht" transform="scale(.6)" fill="#d62839" stroke="none"/></g><g transform="translate(94 106) rotate(-6)" opacity=".65"><rect x="-28" y="-39" width="56" height="78" rx="7" fill="#fff"/><use href="#sol-ht" transform="scale(.6)" fill="#d62839" stroke="none"/></g><g transform="translate(70 150) rotate(4)" opacity=".8"><rect x="-28" y="-39" width="56" height="78" rx="7" fill="#fff"/><use href="#sol-ht" transform="scale(.6)" fill="#d62839" stroke="none"/></g><g transform="translate(56 200) rotate(14)" opacity=".9"><rect x="-28" y="-39" width="56" height="78" rx="7" fill="#fff"/><use href="#sol-ht" transform="scale(.6)" fill="#d62839" stroke="none"/></g></g>
<g transform="translate(62 238) rotate(22)"><rect x="-24" y="-34" width="56" height="78" rx="7" fill="#1d1b26" opacity=".25"/><rect x="-28" y="-39" width="56" height="78" rx="7" fill="#fff" stroke="#c8d3c0" stroke-width="3"/><use href="#sol-ht" transform="scale(.75)" fill="#d62839"/></g>
<g transform="translate(272 316)">
<g transform="rotate(-26)"><rect x="-42" y="-192" width="96" height="134" rx="10" fill="#1d1b26" opacity=".25"/><rect x="-48" y="-200" width="96" height="134" rx="10" fill="#fff"/><rect x="-41" y="-193" width="82" height="120" rx="6" fill="url(#sol-pt)"/></g>
<g transform="rotate(-8)"><rect x="-42" y="-192" width="96" height="134" rx="10" fill="#1d1b26" opacity=".25"/><rect x="-48" y="-200" width="96" height="134" rx="10" fill="#fff"/><text x="-32" y="-170" font-size="24" text-anchor="middle" fill="#d62839" ${F}>K</text><use href="#sol-ht" transform="translate(-32 -152) scale(.3)" fill="#d62839"/><path d="M-22 -126L-24 -150L-11 -139L0 -156L11 -139L24 -150L22 -126Z" fill="#ffd166" stroke="#c98a00" stroke-width="3" stroke-linejoin="round"/><use href="#sol-ht" transform="translate(4 -100) scale(.7)" fill="#d62839"/></g>
<g transform="rotate(12)"><rect x="-42" y="-192" width="96" height="134" rx="10" fill="#1d1b26" opacity=".3"/><rect x="-48" y="-200" width="96" height="134" rx="10" fill="#fff"/><text x="-32" y="-170" font-size="24" text-anchor="middle" fill="#1d1b26" ${F}>A</text><use href="#sol-sp" transform="translate(-32 -152) scale(.3)" fill="#1d1b26"/><use href="#sol-sp" transform="translate(0 -128) scale(1.15)" fill="#1d1b26"/></g>
</g>
<path d="M370 40l4 12 12 4-12 4-4 12-4-12-12-4 12-4z M190 30l3 8 8 3-8 3-3 8-3-8-8-3 8-3z M372 230l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="#fff"/>
</svg>`;

  S['hangman'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="hgm-bd" cx="45%" cy="40%" r="75%"><stop offset="0" stop-color="#3a5c52"/><stop offset="1" stop-color="#26403a"/></radialGradient></defs>
<rect width="400" height="300" fill="#ffca3a"/>
<circle cx="200" cy="150" r="190" fill="#fff" opacity=".12"/>
<rect x="20" y="16" width="372" height="270" rx="20" fill="#c98a1f" opacity=".5"/>
<rect x="14" y="10" width="372" height="266" rx="18" fill="#a8642a"/><rect x="26" y="22" width="348" height="242" rx="10" fill="url(#hgm-bd)"/>

<g stroke="#f4f1e8" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".93"><path d="M48 196H140M74 196V44H158M74 80L110 44M158 44V62" stroke-width="8"/><circle cx="158" cy="84" r="21" stroke-width="6"/><path d="M158 106V150M158 120L182 102" stroke-width="6"/><path d="M148 88Q158 98 168 88" stroke-width="4"/></g>
<g fill="#f4f1e8"><circle cx="151" cy="79" r="3"/><circle cx="165" cy="79" r="3"/><circle cx="186" cy="98" r="5"/></g>
<g font-size="40" text-anchor="middle" fill="#f4f1e8" opacity=".9" ${F}><text x="240" y="112">A</text><text x="292" y="112">T</text><text x="344" y="112">R</text></g>
<path d="M220 104L260 86M272 104L312 86M324 104L364 86" stroke="#ff8fab" stroke-width="5" stroke-linecap="round"/>

<g stroke="#f4f1e8" stroke-width="6" stroke-linecap="round" opacity=".9"><path d="M45 248H85M99 248H139M153 248H193M207 248H247M261 248H301M315 248H355"/></g>
<g font-size="40" text-anchor="middle" fill="#fff" ${F}><text x="65" y="238">P</text><text x="173" y="238">Z</text><text x="227" y="238">Z</text><text x="335" y="238">E</text></g>
<rect x="40" y="272" width="320" height="14" rx="6" fill="#8a4f1e"/><rect x="92" y="263" width="30" height="10" rx="5" fill="#fff"/><rect x="130" y="264" width="22" height="9" rx="4.5" fill="#ffb3c6"/><rect x="270" y="258" width="54" height="16" rx="4" fill="#4a6fa5"/><rect x="270" y="268" width="54" height="6" rx="2" fill="#e9ecef"/>
</svg>`;

  S['true-false'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="tfq-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a9be0"/><stop offset="1" stop-color="#136ea8"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#tfq-bg)"/>
<circle cx="200" cy="200" r="150" fill="#fff" opacity=".06"/>
<g fill="#0b4f7c" opacity=".35"><rect x="46" y="30" width="240" height="100" rx="26"/><circle cx="342" cy="82" r="44"/></g>
<rect x="40" y="22" width="240" height="100" rx="26" fill="#fff"/><path d="M78 116L66 146L112 118Z" fill="#fff"/>
<circle cx="92" cy="72" r="30" fill="#ffca3a"/><text x="92" y="87" font-size="42" text-anchor="middle" fill="#1d1b26" ${F}>?</text>
<rect x="136" y="50" width="122" height="15" rx="7.5" fill="#cfe3f3"/><rect x="136" y="78" width="90" height="15" rx="7.5" fill="#cfe3f3"/>
<circle cx="336" cy="74" r="44" fill="#fff"/><rect x="328" y="22" width="16" height="12" rx="4" fill="#fff"/>
<circle cx="336" cy="74" r="31" fill="none" stroke="#d6e6f3" stroke-width="12"/>
<circle cx="336" cy="74" r="31" fill="none" stroke="#ffca3a" stroke-width="12" stroke-dasharray="125 200" stroke-linecap="round" transform="rotate(-90 336 74)"/>
<path d="M336 74L336 52" stroke="#1d1b26" stroke-width="5" stroke-linecap="round"/><circle cx="336" cy="74" r="5" fill="#1d1b26"/>
<g transform="rotate(-4 112 212)"><rect x="34" y="170" width="156" height="104" rx="26" fill="#2a9257"/><rect x="34" y="158" width="156" height="104" rx="26" fill="#4cc97a"/><rect x="50" y="168" width="124" height="12" rx="6" fill="#fff" opacity=".3"/><path d="M80 212L104 236L148 186" stroke="#fff" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>
<g transform="rotate(4 288 212)"><rect x="210" y="170" width="156" height="104" rx="26" fill="#c9304f"/><rect x="210" y="158" width="156" height="104" rx="26" fill="#ff5c7a"/><rect x="226" y="168" width="124" height="12" rx="6" fill="#fff" opacity=".3"/><path d="M262 188L314 234M314 188L262 234" stroke="#fff" stroke-width="18" stroke-linecap="round"/></g>
<path d="M22 150l4 11 11 4-11 4-4 11-4-11-11-4 11-4z M200 140l3 8 8 3-8 3-3 8-3-8-8-3 8-3z M380 150l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#fff"/>
</svg>`;
})();

