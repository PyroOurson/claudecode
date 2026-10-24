        return () => {
          uiRlLog(true);
          dead = true;
          try { if (AC) AC.close(); } catch (e) {   }
          AC = null;
          scene.traverse(o => { if (o.isMesh || o.isSprite || o.isPoints) {   } });
          for (const o of bin) { try { o.dispose(); } catch (e) {   } }
          bin.length = 0;
        };
      }
    }
  });

  Ameplay.covers[ID] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="rsc-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a6fe0"/><stop offset="1" stop-color="#8cc4ff"/></linearGradient><linearGradient id="rsc-pitch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f9a3c"/><stop offset="1" stop-color="#2f7d2e"/></linearGradient><linearGradient id="rsc-crowd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22305a"/><stop offset="1" stop-color="#2f4378"/></linearGradient><radialGradient id="rsc-ball" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#c9d1dc"/><stop offset="1" stop-color="#7d8898"/></radialGradient><radialGradient id="rsc-gl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff9a3c" stop-opacity=".9"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient><linearGradient id="rsc-fl" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#fff6c8"/><stop offset=".35" stop-color="#7fc4ff"/><stop offset="1" stop-color="#2f7bff" stop-opacity="0"/></linearGradient><linearGradient id="rsc-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f95ff"/><stop offset="1" stop-color="#1f5fd6"/></linearGradient><pattern id="rsc-hex" width="36" height="20.8" patternUnits="userSpaceOnUse"><path d="M0 10.4L6 0h12l6 10.4-6 10.4H6zM24 10.4h12" fill="none" stroke="#fff" stroke-width="1" opacity=".35"/></pattern><pattern id="rsc-net" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M0 5L5 0 10 5 5 10z" fill="none" stroke="#ffd2a0" stroke-width="1"/></pattern></defs>
<rect width="400" height="300" fill="url(#rsc-sky)"/>
<rect width="400" height="122" fill="url(#rsc-hex)"/>
<path d="M0 64Q200 20 400 64" fill="none" stroke="#fff" stroke-width="2" opacity=".45"/>
<circle cx="56" cy="34" r="20" fill="#fff" opacity=".3"/><circle cx="56" cy="34" r="9" fill="#fff" opacity=".85"/><circle cx="344" cy="34" r="20" fill="#fff" opacity=".3"/><circle cx="344" cy="34" r="9" fill="#fff" opacity=".85"/>
<rect x="0" y="80" width="400" height="34" fill="url(#rsc-crowd)"/>
<g fill="#ff9a3c" opacity=".8"><circle cx="12" cy="88" r="2"/><circle cx="40" cy="96" r="2"/><circle cx="70" cy="86" r="2"/><circle cx="98" cy="102" r="2"/><circle cx="128" cy="90" r="2"/><circle cx="262" cy="94" r="2"/><circle cx="294" cy="86" r="2"/><circle cx="322" cy="100" r="2"/><circle cx="352" cy="90" r="2"/><circle cx="384" cy="98" r="2"/></g>
<g fill="#8fb8ff" opacity=".8"><circle cx="26" cy="100" r="2"/><circle cx="56" cy="92" r="2"/><circle cx="84" cy="94" r="2"/><circle cx="114" cy="98" r="2"/><circle cx="142" cy="86" r="2"/><circle cx="250" cy="86" r="2"/><circle cx="278" cy="100" r="2"/><circle cx="308" cy="92" r="2"/><circle cx="338" cy="96" r="2"/><circle cx="368" cy="88" r="2"/></g>
<rect x="0" y="112" width="200" height="12" fill="#13306e"/><rect x="200" y="112" width="200" height="12" fill="#5a2a10"/>
<g fill="none" stroke-width="2.4" stroke-linejoin="round"><path d="M18 114l5 4-5 4M30 114l5 4-5 4M42 114l5 4-5 4" stroke="#7fb2ff"/><path d="M382 114l-5 4 5 4M370 114l-5 4 5 4M358 114l-5 4 5 4" stroke="#ffb15c"/></g>
<rect x="0" y="123" width="200" height="3" fill="#3f8cff"/><rect x="200" y="123" width="200" height="3" fill="#ff8a2a"/>
<polygon points="0,126 400,126 400,300 0,300" fill="url(#rsc-pitch)"/>
<polygon points="0,140 400,140 400,156 0,156" fill="#55b04e" opacity=".55"/><polygon points="0,176 400,176 400,200 0,200" fill="#55b04e" opacity=".55"/><polygon points="0,232 400,232 400,270 0,270" fill="#55b04e" opacity=".55"/>
<ellipse cx="200" cy="112" rx="74" ry="32" fill="url(#rsc-gl)"/>
<rect x="160" y="92" width="80" height="34" fill="#ff7a1a" opacity=".35"/><rect x="160" y="92" width="80" height="34" fill="url(#rsc-net)" opacity=".8"/><path d="M160 126V92h80v34" fill="none" stroke="#ffb35c" stroke-width="5" stroke-linejoin="round"/>
<path d="M0 136Q200 128 400 136" fill="none" stroke="#ffb15c" stroke-width="2.5" opacity=".8"/>
<ellipse cx="200" cy="250" rx="152" ry="40" fill="none" stroke="#fff" stroke-width="4" opacity=".7"/><path d="M0 250H400" stroke="#fff" stroke-width="4" opacity=".7"/>
<g transform="translate(308 152) rotate(-6) scale(.34)"><path d="M-86-6L-90-34Q-92-46-80-50L-66-50-44-68 2-70 32-42 62-34Q86-28 88-14L86-4 30-6z" fill="#ff7a1a"/><path d="M-38-62L0-64 24-42-34-42z" fill="#1b2638"/><circle cx="-55" cy="0" r="26" fill="#1b1c22"/><circle cx="52" cy="3" r="22" fill="#1b1c22"/></g>
<ellipse cx="272" cy="226" rx="44" ry="9" fill="#123a12" opacity=".35"/>
<g transform="translate(266 132)"><circle r="44" fill="url(#rsc-ball)"/><path d="M-10-30l15-3 9 13-9 13-15-2-6-11z" fill="#4a5363"/><path d="M-40-4l13-7 9 11-7 13-13-2z" fill="#4a5363"/><path d="M17 15l15-4 7 13-11 11-13-4z" fill="#4a5363"/><path d="M-16 6l13-2 7 12-8 10-12-2-5-9z" fill="#4a5363"/><path d="M22-26l12 4 3 13-9 6-10-7z" fill="#4a5363"/><circle r="44" fill="none" stroke="#e9f6ff" stroke-width="3" opacity=".9"/><path d="M-30 30A44 44 0 0 0 38 22" fill="none" stroke="#fff" stroke-width="5" opacity=".9"/><circle cx="-14" cy="-20" r="9" fill="#fff" opacity=".55"/></g>
<path d="M120 252L86 262 -6 306-6 270 96 236z" fill="url(#rsc-fl)" opacity=".95"/>
<circle cx="70" cy="262" r="6" fill="#bfe2ff" opacity=".9"/><circle cx="44" cy="276" r="5" fill="#7fc4ff" opacity=".8"/><circle cx="92" cy="272" r="4" fill="#fff"/><circle cx="24" cy="290" r="4" fill="#4f95ff" opacity=".7"/>
<path d="M160 156h-44M168 176h-62M176 138h-34" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".65"/>
<g transform="translate(176 232) rotate(-14)"><ellipse cx="0" cy="34" rx="98" ry="12" fill="#0d2a0c" opacity=".28"/><path d="M-86-6L-90-34Q-92-46-80-50L-66-50-44-68 2-70 32-42 62-34Q86-28 88-14L86-4 30-6z" fill="url(#rsc-body)"/><path d="M-70-50l-8-12 34-6 2 8z" fill="#14254a"/><path d="M-38-62L0-64 24-42-34-42z" fill="#16233a"/><path d="M-36-42h62l-2 4h-58z" fill="#0d1626"/><path d="M-90-26h118l34 8 24 2-2 6-56-6H-88z" fill="#fff" opacity=".9"/><path d="M-92-30h8v14h-8z" fill="#1b2638"/><path d="M80-24l8 4-2 6-8-3z" fill="#eaf4ff"/><path d="M-90-36h6v6h-6z" fill="#ff3d4a"/><path d="M-82-4a28 28 0 0 1 54 0z" fill="#0e1830"/><path d="M26-4a26 26 0 0 1 52 0z" fill="#0e1830"/><path d="M22-8Q30-40 54-36 78-32 86-8z" fill="url(#rsc-body)"/><path d="M28-10Q36-34 54-32 72-30 80-10" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/><circle cx="-55" cy="0" r="26" fill="#1b1c22"/><circle cx="-55" cy="0" r="14" fill="#d6dbe4"/><path d="M-55-14v28M-69 0h28M-65-10l20 20M-65 10l20-20" stroke="#8d96a6" stroke-width="3"/><circle cx="-55" cy="0" r="4" fill="#4a5363"/><circle cx="52" cy="3" r="22" fill="#1b1c22"/><circle cx="52" cy="3" r="12" fill="#d6dbe4"/><path d="M52-9v24M40 3h24M44-5l16 16M44 11l16-16" stroke="#8d96a6" stroke-width="3"/><circle cx="52" cy="3" r="3.5" fill="#4a5363"/></g>
</svg>`;
})();

