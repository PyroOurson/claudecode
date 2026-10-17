        const hud = el('div', 'hud', wrap);
        if (!document.querySelector('link[data-gmrs-f]')) { try { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Saira+Semi+Condensed:wght@300;400;500;600;800&display=swap'; l.setAttribute('data-gmrs-f', '1'); document.head.append(l); } catch (e) {   } }
        const uiCSR = { fov: [60, 110, 1], dist: [100, 400, 5], height: [40, 200, 5], angle: [-15, 0, 1], stiff: [0, 1, 0.05], swivel: [1, 10, 0.1], trans: [1, 2, 0.1] };
        const uiCSN = { fov: 'Field of View', dist: 'Distance', height: 'Height', angle: 'Angle', stiff: 'Stiffness', swivel: 'Swivel Speed', trans: 'Transition Speed' };
        const uiCSD = Object.assign({}, fxCam);
        if (saved.cs) for (const k in uiCSR) { const x = +saved.cs[k], r = uiCSR[k]; if (Number.isFinite(x)) fxCam[k] = clamp(x, r[0], r[1]); }
        const uiQCN = ['Information (Team)', 'Compliments', 'Reactions', 'Apologies', 'Post Game'];
        const uiQCP = [
          ['I got it!', 'Need boost!', 'Take the shot!', 'Defending...', 'Go for it!', 'Centering!', 'All yours.', 'In position.', 'Incoming!', 'Bumping!', 'Passing!', 'Rotating back!'],
          ['Nice shot!', 'Great pass!', 'Thanks!', 'What a save!', 'Nice one!', 'What a play!', 'Great clear!', 'Nice block!', 'Nice bump!', 'Nice demo!'],
          ['OMG!', 'Noooo!', 'Wow!', 'Close one!', 'Siiiick!', 'Whew.', 'Calculated.', 'Savage!', 'Okay.', 'Holy cow!'],
          ['$#@%!', 'No problem.', 'Whoops...', 'Sorry!', 'My bad...', 'Oops!', 'My fault.'],
          ['gg', 'Well played.', 'That was fun!', 'Rematch!', 'One. More. Game.', 'What a game!', 'Nice moves!', 'Everybody dance!']
        ];
        const uiQT = (cat, k) => { const s = saved.qc && saved.qc[cat] && saved.qc[cat][k]; return uiQCP[cat].includes(s) ? s : uiQCP[cat][k]; };
        const uiSZ = ['', 'Duel', 'Doubles', 'Standard'], uiDNM = { rookie: 'Rookie', semipro: 'Semi-Pro', pro: 'Pro', veteran: 'Veteran', allstar: 'All-Star' };
        const uiDIds = () => (typeof DIFF_IDS !== 'undefined' && Array.isArray(DIFF_IDS) ? DIFF_IDS : Object.keys(DIFF)).filter(k => DIFF[k]);
        const uiDName = k => (typeof DIFF_NAMES !== 'undefined' && DIFF_NAMES && DIFF_NAMES[k]) || (DIFF[k] && DIFF[k].name) || uiDNM[k] || String(k || '');
        const uiF = x => Math.round(x * 100) / 100;
        const uiD = 'fill="none" stroke="#6a2e00" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round"';
        const uiBall = (x, y, r) => { let p = '', q = ''; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 0.4, px = uiF(x + Math.cos(a) * r * 0.42), py = uiF(y + Math.sin(a) * r * 0.42); p += (i ? 'L' : 'M') + px + ' ' + py; q += 'M' + px + ' ' + py + 'L' + uiF(x + Math.cos(a) * r) + ' ' + uiF(y + Math.sin(a) * r); } return `<circle cx="${x}" cy="${y}" r="${r}"/><path d="${p}Z${q}" ${uiD}/><circle cx="${x}" cy="${y}" r="${r}" ${uiD}/>`; };
        const uiStarP = (x, y, R, r, n) => { let d = ''; for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, k = i % 2 ? r : R; d += (i ? 'L' : 'M') + uiF(x + Math.cos(a) * k) + ' ' + uiF(y + Math.sin(a) * k); } return d + 'Z'; };
        const uiSvg = s => `<svg viewBox="0 0 24 24">${s}</svg>`;
        const uiIC = {
          goal: uiSvg(`<path d="${uiStarP(12, 12, 11.8, 8.4, 12)}"/>${uiBall(12, 12, 6.2)}`),
          shot: uiSvg(`<path d="M1 2.5C5 3.2 8.3 5 10.8 7.8 10.2 5.4 11 3.2 12.9 1.4c.3 2.6 1.6 4.3 3.6 5.6L8.4 18C6 14 3.8 9 1 2.5z"/>${uiBall(14.6, 14.6, 7.6)}`),
          save: uiSvg(`<path d="M12 1.2l9 3.3v6.8c0 5.8-3.9 9.9-9 11.5-5.1-1.6-9-5.7-9-11.5V4.5z"/><path d="M12 3.6l6.8 2.5v5.3c0 4.4-2.9 7.6-6.8 8.9-3.9-1.3-6.8-4.5-6.8-8.9V6.1z" ${uiD}/>`),
          epic: uiSvg(`<path d="M12 1.2l9 3.3v6.8c0 5.8-3.9 9.9-9 11.5-5.1-1.6-9-5.7-9-11.5V4.5z"/><path d="${uiStarP(12, 11.6, 6.2, 2.6, 5)}" ${uiD}/>`),
          assist: uiSvg(`${uiBall(8.6, 15.4, 6.8)}<path d="M12.6 2.2h9.2v9.2l-3.3-3.3-4.6 4.6-2.6-2.6 4.6-4.6z"/>`),
          clear: uiSvg(`${uiBall(12, 15.6, 6.8)}<path d="M4.4 7.6L12 .8l7.6 6.8h-4.4L12 4.7 8.8 7.6z"/>`),
          center: uiSvg(`${uiBall(12, 12, 6.4)}<path d="M.4 12l4.2-4.4v8.8zM23.6 12l-4.2-4.4v8.8z"/>`),
          aerial: uiSvg(`${uiBall(15.4, 8.6, 6.8)}<path d="M.8 22.2l7.8-9.6 1.9 1.7-7.8 9.6zM5.4 23.4l6.2-7.6 1.7 1.5-6.2 7.6z"/>`),
          demo: uiSvg(`<path d="${uiStarP(12, 12, 11.8, 5.4, 9)}"/><circle cx="12" cy="12" r="3.4" ${uiD}/>`),
          flip: uiSvg(`<path d="M19.4 12.2a7.4 7.4 0 1 1-2.2-5.4" fill="none" stroke="currentColor" stroke-width="3.2"/><path d="M21.6 2.6v7.6h-7.6z"/>`),
          star: uiSvg(`<circle cx="12" cy="12" r="11.4"/><circle cx="12" cy="12" r="9" fill="#7a3a00" opacity=".45"/><path d="${uiStarP(12, 12.4, 7.6, 3.2, 5)}"/>`),
          trophy: uiSvg(`<path d="M6 2.5h12v3h3.6v2.6c0 2.8-2.1 4.8-4.8 5-1 1.7-2.5 2.8-3.9 3.1v2.6h3.8v2.7H7.3v-2.7h3.8v-2.6c-1.4-.3-2.9-1.4-3.9-3.1-2.7-.2-4.8-2.2-4.8-5V5.5H6z"/><path d="M6 7.7H4.6v.6c0 1.4.8 2.5 2 2.9M18 7.7h1.4v.6c0 1.4-.8 2.5-2 2.9" ${uiD}/>`),
          clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="13.5" r="8.6" fill="#1d7fe0" stroke="#bfe6ff" stroke-width="1.6"/><path d="M12 13.5V8.4M12 13.5l3.4 2" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><path d="M9.4 2.2h5.2M12 2.2v2.6M18.6 5.4l1.6 1.6" stroke="#bfe6ff" stroke-width="1.8" stroke-linecap="round"/></svg>',
          ballk: '<svg viewBox="0 0 24 24"><path d="M1 9.5h6M2.5 13h5M1.5 16.5h6" stroke="#5fb6ff" stroke-width="1.6" stroke-linecap="round"/><circle cx="15" cy="12" r="8" fill="#1d7fe0" stroke="#bfe6ff" stroke-width="1.6"/><path d="M15 7.6l3.3 2.4-1.3 3.9h-4l-1.3-3.9zM15 4v3.6M18.3 10l3.3-1M17 13.9l2 3M13 13.9l-2 3M11.7 10l-3.3-1" fill="none" stroke="#bfe6ff" stroke-width="1.1"/></svg>',
          check: '<svg viewBox="0 0 24 24"><path d="M3.5 12.8l5.6 5.6L21 5.6"/></svg>',
          sig: '<svg viewBox="0 0 16 16"><rect x="1" y="11" width="2.4" height="4" fill="currentColor"/><rect x="4.8" y="8" width="2.4" height="7" fill="currentColor"/><rect x="8.6" y="5" width="2.4" height="10" fill="currentColor"/><rect x="12.4" y="2" width="2.4" height="13" fill="currentColor"/></svg>',
          chat: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H10l-5 4v-4H4z"/></svg>'
        };
        const uiPK = [[/EPIC/i, 'epic'], [/SHOT/i, 'shot'], [/GOAL/i, 'goal'], [/ASSIST/i, 'assist'], [/SAVE/i, 'save'], [/CLEAR/i, 'clear'], [/CENTER/i, 'center'], [/AERIAL/i, 'aerial'], [/DEMO/i, 'demo'], [/FLIP/i, 'flip']];
        const uiCarW = '<svg viewBox="0 0 64 32"><path d="M4 24l2-8 12-3 10-8h16l9 8 7 2 1 9z" fill="#fff"/><circle cx="15" cy="25" r="5.4" fill="#fff" stroke="#2a5a96" stroke-width="2.4"/><circle cx="50" cy="25" r="5.4" fill="#fff" stroke="#2a5a96" stroke-width="2.4"/></svg>';
        const uiShield = '<svg class="shd" viewBox="0 0 100 100"><path d="M12 12C38 7 64 6 90 11C92 45 86 71 62 90C58 93 54 96 50 98C34 88 21 75 14 58C10 44 10 28 12 12Z" fill="#fff"/><path d="M18.5 17.5C41 13.5 63 12.5 84.5 16.5C85.5 45 79.5 66 59 83C56 85.5 53 87.5 50 89.5C37 81 26 70 20 55C17 44 17 30 18.5 17.5Z" fill="#1f6fe0"/><path d="M18.5 17.5C41 13.5 63 12.5 84.5 16.5C85 28 84 38 82 47C64 39 40 37 18 43C17.4 34 17.6 26 18.5 17.5Z" fill="#3b90f4"/><path d="M21 56.5C33 49.5 50 47 64 50.5C71 52.3 76 54.6 80.6 51.5C77.5 63 70.5 73.5 59 83C56 85.5 53 87.5 50 89.5C37.5 81 27.5 70.5 21 56.5Z" fill="#0b3a92"/><path d="M20.5 55.5C33.5 48 51 45.6 65 49.4C71.5 51.2 76 52.8 81 49.4" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><g transform="rotate(-13 57 36)"><path d="M32 33.5C27 34.5 23.5 37 21.5 41M33 37.5C28.5 39 25.5 41.6 24 45" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><path d="M34 41L35.6 34L45 31.6L52.5 25.6H66L72.8 31.4L80.4 33L81 41Z" fill="#fff"/><path d="M54.2 27.6H64.2L68.6 31.6H50.4Z" fill="#1f6fe0"/><circle cx="42.2" cy="41.4" r="4.9" fill="#fff" stroke="#1f6fe0" stroke-width="1.8"/><circle cx="73.8" cy="41.4" r="4.9" fill="#fff" stroke="#1f6fe0" stroke-width="1.8"/></g><circle cx="16" cy="14.5" r="11" fill="#8e959f" stroke="#fff" stroke-width="3.2"/><circle cx="13" cy="11.5" r="4.4" fill="#d6dae0"/></svg>';
        const uiWM = '<div class="wm"><span>Rocket</span><span>League</span></div>';
        const uiAv = (c, t) => {
          const tm = c ? c.team : t || 0, bot = !!(c && c.bot), fg = bot ? '#d6dfef' : '#eaf2ff';
          const bg = tm ? '<rect width="40" height="40" fill="#8a3306"/><rect width="40" height="24" fill="#d8641e" opacity=".6"/>' : '<rect width="40" height="40" fill="#0c3480"/><rect width="40" height="24" fill="#2f74e0" opacity=".6"/>';
          const fig = bot ? `<rect x="10" y="9" width="20" height="16" rx="4" fill="${fg}"/><circle cx="16" cy="17" r="2.5" fill="#0b1830"/><circle cx="24" cy="17" r="2.5" fill="#0b1830"/><path d="M20 9V4.6" stroke="${fg}" stroke-width="2"/><circle cx="20" cy="4" r="2" fill="#ffb02e"/><path d="M8 40c1-8 6-11.5 12-11.5S31 32 32 40z" fill="${fg}"/>` : `<circle cx="20" cy="15" r="7.2" fill="${fg}"/><path d="M6 40c1-9 7-13.5 14-13.5S33 31 34 40z" fill="${fg}"/>`;
          return `<svg viewBox="0 0 40 40">${bg}${fig}</svg>`;
        };
        const uiRankSh = '<svg viewBox="0 0 52 58"><path d="M26 2L49 9.5V27C49 42 39 51 26 56 13 51 3 42 3 27V9.5z" fill="rgba(30,110,200,.55)" stroke="#9fe6ff" stroke-width="2.4"/><path d="M26 7.5L44 13.4V27C44 39 36 46.5 26 50.5 16 46.5 8 39 8 27V13.4z" fill="none" stroke="rgba(190,240,255,.45)" stroke-width="1.2"/></svg>';
        const uiGL = { 0: '0,0 10,0 10,18 0,18 z', 1: '2,3.5 5.5,0 5.5,18', 2: '0,0 10,0 10,9 0,9 0,18 10,18', 3: '0,0 10,0 10,18 0,18|2.5,9 10,9', 4: '0,0 0,10 10,10|10,0 10,18', 5: '10,0 0,0 0,9 10,9 10,18 0,18', 6: '10,0 0,0 0,18 10,18 10,9 0,9', 7: '0,0 10,0 10,18', 8: '0,0 10,0 10,18 0,18 z|0,9 10,9', 9: '10,9 0,9 0,0 10,0 10,18 0,18', ':': '0,5 0,6|0,12 0,13', '+': '5,4.5 5,13.5|.5,9 9.5,9', '-': '1,9 9,9' };
        const uiGP = {};
        for (const k in uiGL) uiGP[k] = uiGL[k].split('|').map(s => ({ z: / z$/.test(s), p: s.replace(/ z$/, '').split(' ').map(q => q.split(',').map(Number)) }));
        const uiPoly = (p, z, ox, r) => {
          const n = p.length, at = i => p[(i + n) % n];
          const cn = i => {
            const a = at(i - 1), b = at(i), c = at(i + 1), l1 = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, l2 = Math.hypot(c[0] - b[0], c[1] - b[1]) || 1, k = Math.min(r, l1 / 2, l2 / 2);
            return 'L' + uiF(ox + b[0] + (a[0] - b[0]) * k / l1) + ' ' + uiF(b[1] + (a[1] - b[1]) * k / l1) + 'L' + uiF(ox + b[0] + (c[0] - b[0]) * k / l2) + ' ' + uiF(b[1] + (c[1] - b[1]) * k / l2);
          };
          if (z) { let d = 'M' + uiF(ox + (p[0][0] + p[1][0]) / 2) + ' ' + uiF((p[0][1] + p[1][1]) / 2); for (let i = 1; i <= n; i++) d += cn(i); return d + 'Z'; }
          let d = 'M' + uiF(ox + p[0][0]) + ' ' + p[0][1];
          for (let i = 1; i < n - 1; i++) d += cn(i);
          return d + 'L' + uiF(ox + p[n - 1][0]) + ' ' + p[n - 1][1];
        };
        const uiNum = s => { let x = 0, d = ''; for (const ch of String(s)) { const g = uiGP[ch]; if (!g) continue; for (const q of g) d += uiPoly(q.p, q.z, x, 1.5); x += (ch === ':' ? 0 : 10) + 5; } return [d || 'M0 0', Math.max(0, x - 5)]; };
        const uiDig = (svg, s) => { const [d, wd] = uiNum(s); svg.setAttribute('viewBox', '-3 -3 ' + (wd + 6) + ' 24'); svg.style.width = ((wd + 6) / 24).toFixed(3) + 'em'; for (const p of svg.children) p.setAttribute('d', d); };
        const uiDigHtml = (s, two) => { const [d, wd] = uiNum(s); return `<svg class="dg" viewBox="-3 -3 ${wd + 6} 24" style="width:${((wd + 6) / 24).toFixed(3)}em">${two ? `<path class="o" d="${d}"/><path class="n" d="${d}"/>` : `<path d="${d}"/>`}</svg>`; };
        const uiBN = 44, uiBS = 158, uiBA = 254;
        const uiBP = (deg, r) => { const a = deg * Math.PI / 180; return uiF(60 + Math.sin(a) * r) + ' ' + uiF(60 - Math.cos(a) * r); };
        const uiBTC = t => { const L = (a, b, k) => a.map((x, j) => Math.round(x + (b[j] - x) * k)); return 'rgb(' + (t < 0.5 ? L([255, 92, 0], [255, 166, 26], t / 0.5) : t < 0.8 ? L([255, 166, 26], [255, 226, 140], (t - 0.5) / 0.3) : L([255, 226, 140], [255, 255, 255], (t - 0.8) / 0.2)) + ')'; };
        const uiBT = (v, bo) => { const n = Math.round(bo / 100 * uiBN); if (!v.bdTk) v.bdTk = v.bd.querySelectorAll('.tk path'); for (let k = 0; k < v.bdTk.length; k++) v.bdTk[k].classList.toggle('on', k < n); };
        const uiKL = {}, uiKn = c => uiKL[c] || c.replace(/^Key|^Digit/, '');
        try { if (navigator.keyboard && navigator.keyboard.getLayoutMap) navigator.keyboard.getLayoutMap().then(m => { if (dead) return; m.forEach((x, k) => { if (/^Key[A-Z]$/.test(k) && /^\S$/.test(x)) uiKL[k] = x.toUpperCase(); }); for (const v of views) if (v.cbk) v.cbk.textContent = uiKn('KeyC'); }).catch(() => {}); } catch (e) {}
        const uiZ = n => n ? String(n) : 'Ø';
        const uiNeed = l => Math.min(5000, 1000 + 250 * (l - 1));
        const uiLvl = xp => { let l = 1; while (xp >= uiNeed(l) && l < 500) { xp -= uiNeed(l); l++; } return { l, x: xp, n: uiNeed(l) }; };
        let uiGoal = null, uiBotNext = 0, uiTabOn = false, uiTabT = 0, uiTabHtml = '';
        const uiEpic = new WeakMap(), uiLog = [];
        const uiEvent = e => {
          const t = e.type;
          if ((t === 'goal' || t === 'tgoal') && !crGXN()) { const c = t === 'goal' ? e.scorer : e.car; if (c && c.cos && c.cos.gx && c.cos.gx !== 'classic' && e.p) crGXPlay(c.cos.gx, e.p, c.team); }
          if (t === 'goal') { e.clk = W.ot ? '+' + mmss(W.otT) : mmss(Math.ceil(W.clock)); uiGoal = e; uiReactGoal(e); }
          else if (t === 'countdown') uiGoal = null;
          else if (t === 'go') { uiGoal = null; for (let tm = 0; tm < 2; tm++) { const k = W.kicker && W.kicker[tm]; if (k && k.bot && W.cars.some(c => c.team === tm && !c.bot)) uiBot(k, 0, 0.18); } }
          else if (t === 'epicsave') {
            const now = performance.now();
            uiEpic.set(e.car, now);
            for (const v of active()) if (v.car === e.car) for (const d of [...v.pops.children]) if (d.dataset.k === 'SAVE' && now - +d.dataset.t < 800) d.remove();
            popMsg(e.car, 'EPIC SAVE +75'); uiReactSave(e.car, true);
            if (e.car) feedMsg(`${nm(e.car)}<span class="ic">${uiIC.epic}</span>`);
          }
          else if (t === 'save') uiReactSave(e.car, false);
          else if (t === 'shot') { if (e.car) feedMsg(`${nm(e.car)}<span class="ic">${uiIC.shot}</span>`); }
          else if (t === 'clear') popMsg(e.car, 'CLEAR +20');
          else if (t === 'center') popMsg(e.car, 'CENTER BALL +10');
          else if (t === 'aerial') popMsg(e.car, 'AERIAL HIT +25');
          else if (t === 'flipreset') popMsg(e.car, 'FLIP RESET');
          else if (t === 'bounce') uiReactPost();
          else if (t === 'demo') { if (e.b && e.b.bot) uiBot(e.b, Math.random() < 0.6 ? 12 : 9, 0.2); }
          else if (t === 'end') { for (const v of views) uiQcClose(v); uiTab(false); }
        };
        const KS = {
          all: { up: ['KeyW', 'ArrowUp'], dn: ['KeyS', 'ArrowDown'], lf: ['KeyA', 'ArrowLeft'], rt: ['KeyD', 'ArrowRight'], boost: ['ShiftLeft', 'ShiftRight'], jump: ['Space'], slide: ['KeyX', 'ControlLeft', 'ControlRight'], rl: ['KeyQ'], rr: ['KeyE'], cam: ['KeyC'] }
        };
        let mode = 'cpu', split = false, online = null, netGen = 0, netBound = false;
        const BDS = i => {
          let tk = '';
          for (let k = 0; k < uiBN; k++) { const a = uiBS + (k + 0.5) / uiBN * uiBA; tk += `<path d="M${uiBP(a, 50.5)}L${uiBP(a, 58.5)}" style="stroke:${uiBTC(k / (uiBN - 1))}"/>`; }
          return `<svg viewBox="0 0 120 120"><defs><radialGradient id="gmrs-bf${i}"><stop offset="0" style="stop-color:var(--bdF0)"/><stop offset=".6" style="stop-color:var(--bdF1)"/><stop offset="1" style="stop-color:var(--bdF2)"/></radialGradient></defs><circle cx="60" cy="60" r="47" fill="url(#gmrs-bf${i})"/><path class="dec" d="M${uiBP(300, 40)}L${uiBP(300, 47)}M${uiBP(0, 40)}L${uiBP(0, 47)}M${uiBP(60, 40)}L${uiBP(60, 47)}" fill="none" stroke-width=".9"/><circle cx="60" cy="60" r="47" fill="none" style="stroke:var(--bdD)" stroke-width=".7"/><path d="M${uiBP(uiBS, 48.6)}A48.6 48.6 0 1 1 ${uiBP(uiBS + uiBA, 48.6)}" fill="none" stroke="rgba(255,236,200,.45)" stroke-width=".7"/><g class="tk" fill="none" stroke-width="3.9">${tk}</g></svg>`;
        };
        const uiDGH = '<svg class="dg"><path/></svg>';
        const makeView = i => {
          const v = { i, el: el('div', 'vh', hud), camera: i ? new THREE.PerspectiveCamera(78, 1, 10, 90000) : camera, cam: { p: new THREE.Vector3(0, -7000, 1600), look: new THREE.Vector3(0, 1, 0), up: new THREE.Vector3(0, 0, 1), dir: new THREE.Vector3(0, 1, 0), orbit: 0 }, camBall: saved.cam !== false, car: null, flip: false, tall: portrait, rect: [0, 0, 1, 1], banT: 0, banDur: 0, key: '', bkey: -1, ssKey: '', qcCat: -1, qcT: 0, qcLog: [], qcBan: 0, latch: false, T: { boost: false, jump: false, slide: false, id: null, ox: 0, oy: 0, x: 0, y: 0 } };
          v.camera.up.set(0, 0, 1);
          v.el.innerHTML = `<div class="sb"><div class="sq c0">${uiDGH}</div><div class="clk">${uiDGH}</div><div class="sq r c1">${uiDGH}</div></div><div class="bd">${BDS(i)}<div class="bn"><svg class="dg"><path class="o"/><path class="n"/></svg></div><b class="bl">BOOST</b></div><div class="ban"></div><div class="feed"></div><div class="pops"></div><div class="ss"></div><div class="ping"></div><div class="chat"></div><div class="qc"></div><div class="trn"></div><button class="cb"><b><i></i>Ball Cam</b><small>Press<kbd>${uiKn('KeyC')}</kbd>to toggle</small></button><div class="tl">${i ? '' : '<button class="pb" aria-label="Pause">II</button>'}<button class="cbt">BALL CAM</button><button class="qb" aria-label="Quick chat">${uiIC.chat}</button><button class="trb" data-tr="ball">Reset</button><button class="trb" data-tr="shot">Shot</button></div><div class="tc"><div class="jz"><div class="joy"><i></i></div></div><button class="tb boost">BOOST</button><button class="tb jump">JUMP</button><button class="tb slide">SLIDE</button></div>`;
          const q = s => v.el.querySelector(s);
          Object.assign(v, { sb: q('.sb'), sbL: q('.sb .c0'), sbR: q('.sb .c1'), sbC: q('.clk'), bd: q('.bd'), bdNum: q('.bn svg'), ban: q('.ban'), feed: q('.feed'), pops: q('.pops'), ss: q('.ss'), ping: q('.ping'), chat: q('.chat'), qc: q('.qc'), trn: q('.trn'), trKey: '', cb: q('.cb'), cbk: q('.cb kbd'), tl: q('.tl'), pb: q('.pb'), cbt: q('.cbt'), qb: q('.qb'), tc: q('.tc'), jz: q('.jz'), joy: q('.joy'), knob: q('.joy i') });
          v.sbLd = v.sbL.firstChild; v.sbRd = v.sbR.firstChild; v.sbCd = v.sbC.firstChild;
          v.ban.hidden = true; v.joy.hidden = true; v.qc.hidden = true;
          return v;
        };
        const views = [makeView(0), makeView(1)];
        views[0].camera.layers.enable(1); views[0].camera.layers.enable(3);
        views[1].camera.layers.enable(1); views[1].camera.layers.enable(2);
        const active = () => split ? views : [views[0]];
        const isLocal = c => !!c && active().some(v => v.car === c);
        const humanOf = t => W.cars.find(c => c.team === t && c.slot === 0);
        const uiFov = () => {
          for (const v of views) {
            const asp = v.camera.aspect;
            v.camera.fov = asp < 1 ? 78 * fxCam.fov / 110 : Math.min(92, 2 * Math.atan(Math.tan(fxCam.fov * Math.PI / 360) / asp) * 180 / Math.PI);
            v.camera.updateProjectionMatrix();
          }
        };
        const setLayout = () => {
          split = false; wrap.classList.remove('split'); views[1].el.hidden = true;
          const v = views[0];
          v.rect = [0, 0, 1, 1]; v.flip = false; v.el.classList.remove('flip');
          Object.assign(v.el.style, { left: '0%', top: '0%', width: '100%', height: '100%' });
          v.tall = w < h; v.camera.aspect = w / h;
          uiFov();
        };
        const label = c => views[0].car === c ? 'You' : c.name;
        const uiNm = c => c.name;
        const uiTabEl = el('div', 'tab', hud);
        const menu = el('div', 'menu', wrap), endEl = el('div', 'end', wrap), pz = el('div', 'pz', wrap);
        const uiTtl = el('div', 'ttl', wrap, `<div class="tlg">${uiShield}${uiWM}</div><div class="tpa">${coarse ? 'Tap anywhere' : 'Press any button'} to start</div><div class="tft">Fan-made tribute · not affiliated with Psyonix</div>`);
        const uiLd = el('div', 'ld', wrap), uiLbEl = el('div', 'lob', wrap), uiOptEl = el('div', 'opw', wrap), uiDlg = el('div', 'dlg', wrap);
        uiTabEl.hidden = endEl.hidden = pz.hidden = uiLd.hidden = uiLbEl.hidden = uiOptEl.hidden = uiDlg.hidden = true;
        const uiBanAll = (html, cls, color, dur) => {
          for (const v of active()) {
            v.ban.className = 'ban' + cls; v.ban.innerHTML = html; v.ban.style.setProperty('--gl', color || 'rgba(80,170,255,.9)');
            void v.ban.offsetWidth; v.ban.classList.add('pop'); v.ban.hidden = false; v.banT = 0; v.banDur = dur;
          }
        };
        const banner = (txt, sub, color, dur = 1.6) => {
          txt = String(txt);
          const g = uiGoal && (/GOAL/i.test(txt) || W.state === 'goal') ? uiGoal : null;
          if (g) uiGoal = null;
          let html, cls = '';
          if (g) { cls = ' gol t' + g.team; html = `<div class="gn">${esc(g.scorer ? g.scorer.name : TEAMN[g.team])} scored!</div>`; }
          else if (/^\d$/.test(txt)) cls = ' cdn', html = `<div class="cd">${uiDigHtml(txt, 1)}</div>${sub && !/kickoff/i.test(sub) ? `<div class="bs">${esc(sub)}</div>` : ''}`;
          else cls = txt === 'GO!' ? ' cdn' : '', html = `<div class="bt">${esc(txt)}</div>${sub ? `<div class="bs">${esc(sub)}</div>` : ''}`;
          uiBanAll(html, cls, color, dur);
        };
        const uiFI = [[/\s*demolished\s*/i, 'demo'], [/\s*scored!?/i, 'goal'], [/\s*saved it!?/i, 'save']];
        const feedMsg = html => {
          let hh = String(html);
          for (const [re, k] of uiFI) hh = hh.replace(re, `<span class="ic">${uiIC[k]}</span>`);
          for (const v of active()) { const d = el('div', /<i/.test(hh) ? '' : 'tx', v.feed, hh); api.timeout(() => d.remove(), 5000); while (v.feed.children.length > 4) v.feed.firstChild.remove(); }
        };
        const popMsg = (car, txt) => {
          if (!car || !txt) return;
          const m = /^(.*?)\s*(\+\d+)$/.exec(String(txt)), lab = m ? m[1] : String(txt), pts = m ? m[2] : '', now = performance.now();
          if (/^SAVE/i.test(lab) && now - (uiEpic.get(car) || -1e9) < 800) return;
          const k = uiPK.find(p => p[0].test(lab)), np = /^GOAL$/i.test(lab);
          for (const v of active()) if (v.car === car) {
            for (const o of v.pops.children) o.classList.add('old');
            const d = el('div', np ? 'np' : '', v.pops, `<span class="ic">${uiIC[k ? k[1] : 'star']}</span>${np ? '' : `<b>${esc(lab)}</b>`}${pts ? `<em>${pts}</em>` : ''}`);
            d.dataset.k = lab.toUpperCase(); d.dataset.t = now;
            api.timeout(() => d.remove(), 2500);
            while (v.pops.children.length > 3) v.pops.firstChild.remove();
          }
        };
        const nm = c => `<i class="p${c.team}">${esc(label(c))}</i>`;
        const setCam = (v, on) => { v.camBall = on; v.cb.classList.toggle('on', on); v.cbt.classList.toggle('on', on); if (!v.i) { saved.cam = on; api.save(saved); } };
        views.forEach(v => setCam(v, v.camBall));
        const resetCam = v => {
          const c = v.car; if (!c) return;
          v.cam.dir.set(c.f.x, c.f.y, 0).normalize(); v.cam.up.set(0, 0, 1);
          v.cam.p.set(c.p.x - v.cam.dir.x * 300, c.p.y - v.cam.dir.y * 300, 140); v.cam.look.copy(v.cam.dir);
        };


        const uiLine = (v, html) => { const d = el('div', '', v.chat, html); api.timeout(() => d.remove(), 7000); while (v.chat.children.length > 6) v.chat.firstChild.remove(); };
        const uiSay = (c, m, send, tx) => {
          const cat = m >> 2, k = m & 3;
          if (!c || cat > 4 || !uiQCP[cat]) return;
          const txt = tx || (c.bot ? uiQCP[cat][k] : uiQT(cat, k)), team = cat === 0, loc = isLocal(c);
          if (team && !loc && !active().some(v => v.car && v.car.team === c.team) && ui === 'play') return;
          const html = `${team ? '<b class="tmg">[TEAM]</b> ' : ''}<i class="p${c.team}">${esc(c.name)}</i>: ${esc(txt)}`;
          const ok = loc || saved.chatf === 'all' || (saved.chatf === 'team' && team);
          let shown = false;
          if (ok) { uiLog.push(html); while (uiLog.length > 40) uiLog.shift(); }
          if (ok && ui === 'play') for (const v of active()) if (v.car && (!team || v.car.team === c.team)) { uiLine(v, html); shown = true; }
          if (ok && ui === 'end') { uiEndChat(); shown = true; }
          if (shown) tone(team ? 980 : 760, 0.07, 'sine', 0.035);
          if (send && online && !online.left) api.net.send({ t: 'qc', c: W.cars.indexOf(c), m, x: txt });
        };
        const uiSend = (v, m) => {
          if (!v.car || (ui !== 'play' && !(ui === 'end' && m >= 16))) return;
          const now = performance.now();
          if (now < v.qcBan) return;
          v.qcLog = v.qcLog.filter(t => now - t < 4000);
          if (v.qcLog.length >= 4) { v.qcBan = now + 3000; v.qcLog = []; if (ui === 'play') uiLine(v, '<span class="sy">Chat disabled for 3 seconds.</span>'); else { uiLog.push('<span class="sy">Chat disabled for 3 seconds.</span>'); uiEndChat(); } return; }
          v.qcLog.push(now);
          uiSay(v.car, m, true);
          if (ui === 'end' && !online) uiBotPost();
        };
        const uiQcOpen = (v, cat) => {
          v.qcCat = cat; v.qcT = 0;
          const items = cat === 9 ? uiQCN.slice(0, 4) : [0, 1, 2, 3].map(k => uiQT(cat, k));
          v.qc.innerHTML = `<h4>${cat === 9 ? 'Quick Chat' : uiQCN[cat]}</h4>${items.map((t, j) => `<button data-q="${j}"><kbd>${j + 1}</kbd>${esc(t)}</button>`).join('')}`;
          v.qc.hidden = false;
        };
        const uiQcClose = v => { v.qcCat = -1; v.qc.hidden = true; };
        const uiQcKey = (v, k) => {
          if (!v || !v.car || ui !== 'play') return;
          if (v.qcCat >= 0 && v.qcCat < 4) { uiSend(v, v.qcCat * 4 + k); uiQcClose(v); } else uiQcOpen(v, k);
        };
        const uiBot = (c, m, p) => {
          if (!c || !c.bot || ui !== 'play' || (online && online.role === 'guest') || Math.random() > p) return false;
          const now = performance.now();
          if (now < uiBotNext) return false;
          uiBotNext = now + 7000;
          const w0 = W;
          api.timeout(() => { if (!dead && W === w0 && ui === 'play') uiSay(c, m, true); }, 500 + Math.random() * 1000);
          return true;
        };
        const uiBotPost = () => {
          const bots = W.cars.filter(c => c.bot);
          if (!bots.length || Math.random() > 0.7) return;
          const c = bots[Math.floor(Math.random() * bots.length)], w0 = W;
          api.timeout(() => { if (!dead && W === w0 && ui === 'end') uiSay(c, Math.random() < 0.65 ? 16 : 17, false); }, 700 + Math.random() * 1500);
        };
        const uiTeamBot = (tm, not) => { const l = W.cars.filter(c => c.bot && c.team === tm && c !== not && c.demoT <= 0); return l.length ? l[Math.floor(Math.random() * l.length)] : null; };
        const uiReactGoal = e => {
          const tm = e.team, s = e.scorer, a = e.assist;
          if (!s) {
            const og = W.lastTouch && W.lastTouch.team !== tm ? W.lastTouch : null;
            if (og && og.bot) uiBot(og, [14, 15, 12][Math.floor(Math.random() * 3)], 0.6);
            else if (og) uiBot(uiTeamBot(tm), 6, 0.35);
            return;
          }
          if (a && s.bot && uiBot(s, 6, 0.4)) return;
          if (a && a.bot && uiBot(a, 4, 0.45)) return;
          if (uiBot(uiTeamBot(tm, s), Math.random() < 0.6 ? 4 : 10, 0.4)) return;
          uiBot(uiTeamBot(1 - tm), Math.random() < 0.5 ? 9 : 8, 0.2);
        };
        const uiReactSave = (c, epic) => {
          if (!c) return;
          if (uiBot(uiTeamBot(1 - c.team), epic && Math.random() < 0.4 ? 10 : 7, epic ? 0.55 : 0.3)) return;
          uiBot(uiTeamBot(c.team, c), 7, epic ? 0.4 : 0.2);
        };
        const uiReactPost = () => {
          const B = W.ball.p;
          if (W.state !== 'play' || Math.abs(B.y) < 4950 || Math.abs(B.x) > 1150 || B.z < 120 || B.z > 900) return;
          uiBot(uiTeamBot(Math.random() < 0.5 ? 0 : 1), Math.random() < 0.7 ? 11 : 8, 0.35);
        };


        const uiHD = ['Score', 'Goals', 'Assists', 'Saves', 'Shots', 'Ping'];
        const uiTeamHtml = (t, o) => {
          const cs = W.cars.filter(c => c.team === t).sort((a, b) => b.st.score - a.st.score), me = o.me || [];
          const rows = cs.map(c => {
            const ttl = o.titles && o.titles.get(c), rd = o.ready && o.ready.has(c), ping = c.bot ? '<span class="sv pn bt c6">BOT</span>' : `<span class="sv pn c6">${uiIC.sig}${uiPing(c)}</span>`;
            return `<div class="sbr${me.includes(c) ? ' me' : ''}"><i class="ck">${rd ? uiIC.check : ''}</i><span class="av">${uiAv(c)}</span><span class="snm"><b>${esc(uiNm(c))}</b>${ttl ? `<small>${esc(ttl)}</small>` : ''}</span><span class="mv">${c === o.mvp ? `<span class="ic">${uiIC.star}</span>` : ''}</span><span class="sv">${c.st.score}</span><span class="sv">${uiZ(c.st.goals)}</span><span class="sv">${uiZ(c.st.assists)}</span><span class="sv">${uiZ(c.st.saves)}</span><span class="sv">${uiZ(c.st.shots)}</span>${ping}</div>`;
          }).join('');
          return `<div class="stm t${t}"><div class="sth"><div class="tn">${o.win === t ? '<small>Winner</small>' : ''}<div>${uiDigHtml(W.score[t])}<span>${TEAMN[t]}</span></div></div>${uiHD.map((x, j) => `<span${j === 5 ? ' class="c6"' : ''}>${x}</span>`).join('')}</div>${rows}</div>`;
        };
        const uiTabRender = () => {
          const o = { me: active().map(v => v.car) }, clk = W.ot ? '+' + mmss(W.otT) : mmss(Math.ceil(W.clock));
          const right = W.ot ? 'Overtime' : mode === 'online' ? 'Private Match' : W.cars.some(c => c.bot) ? uiDName(W.diff) + ' Bots' : 'Exhibition';
          const hh = `<div class="tm${W.ot ? ' ot' : ''}"><span>${uiSZ[W.size]} · Exhibition</span>${uiDigHtml(clk)}<span>${right}</span></div><div class="sbd">${uiTeamHtml(0, o)}${uiTeamHtml(1, o)}</div>`;
          if (hh !== uiTabHtml) { uiTabHtml = hh; uiTabEl.innerHTML = hh; }
        };
        const uiTab = on => {
          on = !!on && ui === 'play';
          if (on === uiTabOn) return;
          uiTabOn = on; uiTabEl.hidden = !on; uiTabT = 0.25; uiTabHtml = '';
          if (on) uiTabRender();
        };


        const uiCD = { octane: 'The fan favourite. Balanced in every way.', fennec: 'Boxy and precise, built on the Octane hitbox.', dominus: 'Long and flat. Great for flicks and power shots.', breakout: 'Long, low and pointy for sharp aerial touches.', merc: 'Tall and tanky. A wall on wheels.', venom: 'Light and curvy, with the Hybrid hitbox.', paladin: 'The flattest hitbox in the game. Wide, low and made for dribbles.' };
        const uiTips = [
          'Hold Jump longer for a higher jump. Press Jump again in the air to double jump, or tilt the stick while you press it to flip.',
          'At supersonic speed you demolish any opponent you drive into.',
          'Ball Cam keeps the ball in view. Turn it off when you need to look around for boost or opponents.',
          'Large boost pads give you 100 boost and come back after 10 seconds. Small pads give 12.',
          'Powerslide to turn sharper and keep your speed through tight corners.',
          'Use air roll to land on your wheels after an aerial and keep your speed.',
          'Flip into the ball for a powerful shot. Flips also give you a quick burst of speed.',
          'Wait for the ball to come down off the wall instead of chasing it up there.',
          'After you take a shot, rotate back toward your own goal so a teammate can follow up.',
          'The Camera options let you change your field of view, distance, height and stiffness.',
          'In overtime the next goal wins the match.',
          'Check the scoreboard at any time during a match to see everyone\'s stats.',
          'Every match earns Rocket Pass XP. Goals, saves, assists and wins give extra XP.',
          'Free Play is the best place to practise aerials: turn on unlimited boost and reset the ball with R.',
          'Paint your car any colour in the Garage. Your primary colour can be different for the Blue and Orange team.'
        ];
        let uiLoadT = 0, uiTipI = Math.floor(Math.random() * uiTips.length), uiScr = 'main', uiFm = 'play', uiFs = null, uiFo = 'go', uiPrev = null, uiTC = 0, uiCamSnap = true;
        let uiGc = 'body', uiGf = 'cat', uiGi = '', uiPt = 'p', uiPv = null, uiGarA = 0, uiGarAT = 0, uiGarZ = 1, uiGxT = 0, uiPf = 1, uiPT = 0, uiDrag = null, uiTrKey = '';
        const uiHSV = [0.6, 0.9, 0.9];
        for (const id of BODY_IDS) saved.ld[id] = crLdClean(saved.ld[id], id);
        for (const k in saved.ld) if (!BODIES[k]) delete saved.ld[k];
        const uiLO = body => saved.ld[body] || (saved.ld[body] = crLdClean(null, body));
        const uiTier = () => Math.min(crTierN, 1 + Math.floor(saved.pxp / crTierXP));
        const uiOwn = (k, it) => !!it && (k === 'body' || it.t === 0 || it.t <= uiTier());
        const uiSpot = { x: -1500, y: -800, yaw: 0.42 };
        const uiCS = [0, 0, 0, 0, 0, 0, 60];
        const uiCamSpot = k => {
          const o = uiCS, tall = w < h;
          if (k === 'title') { o[0] = -420; o[1] = -2950; o[2] = 200; o[3] = 140; o[4] = -5120; o[5] = tall ? 230 : 380; o[6] = tall ? 74 : 58; return o; }
          if (k === 'load') {
            const c = views[0].car || W.cars[0], M = c.p, fx = c.f.x, fy = c.f.y, sx = -fy, sy = fx;
            o[0] = M.x + fx * 300 + sx * 190; o[1] = M.y + fy * 300 + sy * 190; o[2] = 62; o[3] = M.x - fx * 30 - sx * (tall ? 0 : 110); o[4] = M.y - fy * 30 - sy * (tall ? 0 : 110); o[5] = 40; o[6] = tall ? 66 : 50; return o;
          }
          const g = k === 'garage', ps = !g && ui === 'menu' && uiScr === 'pass', z = g ? uiGarZ : 1, a = uiSpot.yaw + (g ? 0.6 + uiGarA : ps ? 0.95 : 0.78), d = (tall ? (g ? 420 : 560) : g ? 360 : ps ? 520 : 330) * z, hh = g ? 75 + (z - 1) * 140 : ps ? 150 : 92, sh = tall ? 0 : g ? 118 * z : ps ? 175 : 112, cx = uiSpot.x + Math.cos(uiSpot.yaw) * 12, cy = uiSpot.y + Math.sin(uiSpot.yaw) * 12;
          o[0] = cx + Math.cos(a) * d; o[1] = cy + Math.sin(a) * d; o[2] = hh;
          o[3] = cx + Math.sin(a) * sh; o[4] = cy - Math.cos(a) * sh; o[5] = tall ? (g ? -110 * z : -150) : g ? 24 + (z - 1) * 60 : ps ? -25 : 50; o[6] = tall ? 64 : g ? 46 : 48;
          return o;
        };
        const uiGarCos = (body, team) => {
          const L = Object.assign({}, uiLO(body)), P = uiPv;
          if (P && P.k !== 'title' && P.k !== 'body') { const it = P.k === 'decal' ? crItem('decal', P.id) : null; if (P.k !== 'decal' || !it || !it.b || it.b === body) L[P.k] = P.id; }
          return crCosOf(L, team);
        };
        const uiPose = () => {
          if (W.state !== 'menu' || W.cars.length < 2) return;
          const show = ui !== 'title', gar = ui === 'menu' && (uiScr === 'garage' || uiScr === 'pass');
          for (const c of W.cars) {
            if (show && c.team === uiTC && c.slot === 0) {
              c.body = uiPrev || saved.car; c.cos = uiGarCos(c.body, c.team); placeCar(c, uiSpot.x, uiSpot.y, uiSpot.yaw);
              c.boosting = gar && (uiScr === 'garage' && uiGc === 'boost' && !uiPv || !!(uiPv && uiPv.k === 'boost')); c.prevTrail = gar && (uiScr === 'garage' && uiGc === 'trail' && !uiPv || !!(uiPv && uiPv.k === 'trail'));
            }
            else { placeCar(c, 0, 3000 + c.team * 400, 0); c.demoT = 1e9; c.prevTrail = false; }
          }
          const B = W.ball;
          vset(B.v, 0, 0, 0); vset(B.w, 0, 0, 0);
          if (ui === 'title') { vset(B.p, -600, -4300, CFG.ballRest); B.hidden = false; } else B.hidden = true;
        };
        const uiPlb = () => { const L = uiLvl(saved.xp); return `<div class="plb" title="Change name"><div class="pav">${uiAv(null, 0)}<b class="plv">${L.l}</b></div><div class="pnm"><span>${esc(saved.name)}<small>${esc(saved.ttl || 'Rocket Pass Tier ' + uiTier())}</small></span>${uiCarW}</div><i class="pxp"><u style="width:${(L.x / L.n * 100).toFixed(1)}%"></u></i></div>`; };
        const uiK = (k, cls) => coarse ? '' : `<kbd${cls ? ` class="${cls}"` : ''}>${k}</kbd>`;
        const uiMD = { play: 'Play matches against bots, practise in Free Play or challenge your friends online.', garage: 'Customize your car: body, decals, paint, wheels, boost, goal explosion, trail and topper.', pass: 'Rocket Pass: earn XP in every match and unlock new items for your car.', opts: 'Change camera, controls, audio and chat settings.', cred: 'Model credits and licences.', exit: 'Return to the title screen.', cpu: 'Exhibition match against bots: Duel, Doubles or Standard, five difficulty levels.', train: 'Free Play: drive around with the ball and practise shots, aerials and saves. No clock, no score.', online: 'Create a party, invite friends with the code or link and play 1v1, 2v2 or 3v3. Turn on bots in the party to fill the empty seats.' };
        const uiOS = { size: [[1, 'Duel'], [2, 'Doubles'], [3, 'Standard']], diff: uiDIds().map(k => [k, uiDName(k)]), len: [[180, '3 Minutes'], [300, '5 Minutes'], [600, '10 Minutes']] };
        const uiOD = { size: 'Duel 1v1, Doubles 2v2 or Standard 3v3. Empty seats are filled with bots.', diff: 'How good the bots are: ' + uiOS.diff.map(x => x[1]).join(', ') + '.', len: 'Match length. A tie at 0:00 goes to overtime.', go: 'Start the match.' };
        const uiGC = [['body', 'Body'], ['decal', 'Decal'], ['paint', 'Paint'], ['wheel', 'Wheels'], ['boost', 'Rocket Boost'], ['gx', 'Goal Explosion'], ['trail', 'Trail'], ['top', 'Topper']];
        const uiCatN = k => ({ body: 'Body', decal: 'Decal', paint: 'Paint', wheel: 'Wheels', boost: 'Rocket Boost', gx: 'Goal Explosion', trail: 'Trail', top: 'Topper', fin: 'Paint Finish', title: 'Player Title' })[k] || '';
        const uiGItems = k => k === 'body' ? BODY_IDS.filter(id => crModel(id) || crModel(BODIES[id].mdl) || !crM.octane).map(id => ({ id, n: BODIES[id].name, t: 0, r: 0 })) : k === 'decal' ? crCat.decal.filter(d => !d.b || d.b === saved.car) : k === 'paint' ? crCat.fin : crList(k);
        const uiEq = k => k === 'body' ? saved.car : uiLO(saved.car)[k === 'paint' ? 'fin' : k];
        const uiEqName = k => { if (k === 'paint') { const L = uiLO(saved.car); return (crItem('fin', L.fin) || crCat.fin[0]).n + ' · ' + L['p' + uiTC].toUpperCase(); } const it = uiGItems(k).find(x => x.id === uiEq(k)); return it ? it.n : ''; };
        const uiHex = n => '#' + ((n >>> 0) & 0xffffff).toString(16).padStart(6, '0');
        const uiRgb = a => `rgb(${a.map(x => Math.round(Math.pow(Math.min(1, Math.max(0, x)), 1 / 2.2) * 255)).join(',')})`;
        const uiHsvHex = (hh, s, v) => { const f = n => { const k = (n + hh * 6) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); }; return '#' + [f(5), f(3), f(1)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join(''); };
        const uiHexHsv = hx => { const n = parseInt(String(hx).slice(1), 16) || 0, r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let hh = 0; if (d) hh = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [hh / 6, mx ? d / mx : 0, mx]; };
        const uiPal = (() => { const L = [], hs = [0, 12, 24, 36, 48, 60, 80, 110, 140, 165, 185, 200, 215, 230, 250, 270, 290, 310, 330, 345]; for (const [s, v] of [[0.3, 1], [0.62, 1], [1, 1], [1, 0.7], [1, 0.42]]) for (const x of hs) L.push(uiHsvHex(x / 360, s, v)); for (let i = 0; i < 10; i++) L.push(uiHsvHex(0, 0, i / 9)); return L; })();
        const uiThumbOf = (k, it, body) => {
          const t = uiTC, b = body || saved.car;
          if (k === 'body') return `<img src="${crThumb(it.id, t, crCosOf(uiLO(it.id), t))}" alt="">`;
          if (k === 'decal') return `<img src="${crThumb(b, t, Object.assign(crCosOf(uiLO(b), t), { decal: it.id, top: 'none' }))}" alt="">`;
          if (k === 'wheel') return `<img src="${crIcon('wheel', it.id, t)}" alt="">`;
          if (k === 'top') return it.id === 'none' ? '<i class="gsw no"></i>' : `<img src="${crIcon('top', it.id, t)}" alt="">`;
          if (k === 'boost') { const o = it.o || [[0x1d58ff, 0xe8f6ff, 0x5a9cff], [0xff5208, 0xfff2b8, 0xff9a40]][t]; return `<i class="gsw bo${it.rb ? ' rbw' : ''}" style="--a:${uiHex(o[0])};--b:${uiHex(o[1])};--c:${uiHex(o[2])}"></i>`; }
          if (k === 'trail') { const c = it.c ? uiRgb(it.c) : it.glow ? uiLO(b)['p' + t] : t ? '#ffc890' : '#a8d4ff'; return `<i class="gsw tr${it.rb ? ' rbw' : ''}${it.j ? ' jt' : ''}" style="--a:${c}"></i>`; }
          if (k === 'gx') return `<i class="gsw gx" style="--a:${(crRar[it.r] || crRar[0])[1]}">${uiIC.goal}</i>`;
          if (k === 'fin' || k === 'paint') return `<i class="gsw fn f-${it.id}" style="--a:${uiLO(b)['p' + t]}"></i>`;
          if (k === 'title') return `<i class="gsw tl">${uiIC.star}</i>`;
          return '';
        };
        const uiTile = (k, it, sel) => {
          const own = uiOwn(k, it), eq = uiEq(k) === it.id, nw = own && it.t > 0 && !saved.seen.includes(k + ':' + it.id), R = crRar[it.r] || crRar[0];
          return `<button class="gi${sel ? ' on' : ''}${eq ? ' eq' : ''}${own ? '' : ' lk'}" data-gi="${esc(it.id)}" style="--rc:${R[1]}"><span class="gim">${uiThumbOf(k, it)}</span><b>${esc(it.n)}</b><small>${own ? esc(it.t ? R[0] : k === 'body' ? BODIES[it.id].hitbox + ' hitbox' : 'Default') : 'Tier ' + it.t}</small>${eq ? `<i class="geq">${uiIC.check}</i>` : ''}${own ? '' : '<i class="glk"></i>'}${nw ? '<em class="gnw">New</em>' : ''}</button>`;
        };
        const uiGDesc = () => {
          if (uiGc === 'paint' && uiPt !== 'fin') return uiPt === 'a' ? 'Accent colour: used on the trim, the skirts and the decals. Any colour you like.' : 'Primary colour of the body for the ' + (uiTC ? 'Orange' : 'Blue') + ' team. Press V to paint the other team\'s car. Nameplates and decal highlights keep the team colour.';
          const k = uiGc === 'paint' ? 'fin' : uiGc, L = uiGItems(uiGc), it = L.find(x => x.id === (uiGf === 'grid' && uiGi ? uiGi : uiEq(uiGc)));
          if (!it) return '';
          if (k === 'body') return BODIES[it.id].name + ' · ' + BODIES[it.id].hitbox + ' hitbox. ' + (uiCD[it.id] || '');
          const R = crRar[it.r] || crRar[0];
          return it.n + ' · ' + (it.t ? R[0] : 'Default') + (uiOwn(k, it) ? uiEq(uiGc) === it.id ? ' · Equipped' : ' · ' + (coarse ? 'Tap' : 'Click or press Enter') + ' to equip' : ' · Unlocks at Rocket Pass tier ' + it.t) + (k === 'gx' ? ' · ' + (coarse ? 'Tap Preview' : 'Press P') + ' to preview' : '');
        };
        const uiPaintKey = () => uiPt === 'a' ? 'a' : 'p' + uiTC;
        const uiPaintHtml = () => {
          const L = uiLO(saved.car), tabs = [['p', 'Primary · ' + (uiTC ? 'Orange' : 'Blue')], ['a', 'Accent'], ['fin', 'Finish']].map(([k, t]) => `<button class="gpt${uiPt === k ? ' on' : ''}" data-pt="${k}">${t}</button>`).join('');
          if (uiPt === 'fin') return `<div class="gpts">${tabs}</div><div class="gg">${crCat.fin.map(it => uiTile('paint', it, uiGf === 'grid' && uiGi === it.id)).join('')}</div>`;
          const hx = L[uiPaintKey()], q = uiHexHsv(hx);
          if (uiHsvHex(uiHSV[0], uiHSV[1], uiHSV[2]) !== hx) { uiHSV[0] = q[0]; uiHSV[1] = q[1]; uiHSV[2] = q[2]; }
          return `<div class="gpts">${tabs}</div><div class="gcw"><div class="cwh" data-cw="1"><i class="cwv"></i><b class="cwm"></b></div><div class="cws"><label class="cwl">Brightness<input type="range" data-cv="1" min="0" max="100" value="${Math.round(uiHSV[2] * 100)}"></label><div class="cwx"><i></i><input type="text" data-hx="1" value="${hx}" maxlength="7" spellcheck="false" autocomplete="off"></div><button class="gpd" data-pd="1">${uiPt === 'a' ? 'Default Accent' : 'Team Default'}</button></div></div><div class="gpl">${uiPal.map(c => `<button class="pls" data-pc="${c}" style="background:${c}"></button>`).join('')}</div>`;
        };
        const uiPaintSync = () => {
          const hx = uiLO(saved.car)[uiPaintKey()], [hh, s, v] = uiHSV, a = hh * TAU, m = menu.querySelector('.cwm');
          if (m) { m.style.left = (50 + Math.sin(a) * s * 50).toFixed(2) + '%'; m.style.top = (50 - Math.cos(a) * s * 50).toFixed(2) + '%'; m.style.background = hx; }
          const cv = menu.querySelector('.cwv'); if (cv) cv.style.opacity = (1 - v).toFixed(3);
          const rg = menu.querySelector('[data-cv]'); if (rg) { if (document.activeElement !== rg) rg.value = Math.round(v * 100); rg.style.setProperty('--c', uiHsvHex(hh, s, 1)); }
          const hi = menu.querySelector('[data-hx]'); if (hi && document.activeElement !== hi) hi.value = hx;
          const xi = menu.querySelector('.cwx i'); if (xi) xi.style.background = hx;
          for (const b of menu.querySelectorAll('.gpl .pls')) b.classList.toggle('on', b.dataset.pc === hx);
          const cs = menu.querySelector('[data-gc="paint"] small'); if (cs) cs.textContent = uiEqName('paint');
        };
        const uiPaintSet = (hx, save, keep) => {
          hx = crHex(hx); if (!hx) return;
          uiLO(saved.car)[uiPaintKey()] = hx;
          if (!keep) { const q = uiHexHsv(hx); uiHSV[0] = q[1] > 0.01 ? q[0] : uiHSV[0]; uiHSV[1] = q[1]; uiHSV[2] = q[2]; }
          uiPose(); uiPaintSync();
          if (save) api.save(saved);
        };
        const uiCwPick = (cw, e) => {
          const r = cw.getBoundingClientRect(), dx = (e.clientX - r.left - r.width / 2) / (r.width / 2), dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
          uiHSV[0] = (Math.atan2(dx, -dy) / TAU + 1) % 1; uiHSV[1] = Math.min(1, Math.hypot(dx, dy));
          if (uiHSV[2] < 0.08) uiHSV[2] = 0.85;
          uiPaintSet(uiHsvHex(uiHSV[0], uiHSV[1], uiHSV[2]), false, true);
        };
        const uiGarHtml = () => {
          const cats = uiGC.map(([k, t]) => `<button class="rb gcb${uiGc === k ? uiGf === 'cat' ? ' on' : ' act' : ''}" data-gc="${k}"><span>${t}</span><small>${esc(uiEqName(k))}</small></button>`).join('');
          const body = uiGc === 'paint' ? uiPaintHtml() : `<div class="gg">${uiGItems(uiGc).map(it => uiTile(uiGc, it, uiGf === 'grid' && uiGi === it.id)).join('')}</div>`;
          return `<div class="gsx"><h2 class="bt">Garage</h2><div class="gcl">${cats}</div></div><div class="gpn pnl"><h3 class="gph">${esc(uiCatN(uiGc))}<small>${esc(BODIES[saved.car].name)} · ${uiTC ? 'Orange' : 'Blue'} car</small></h3>${body}<div class="md gmd">${esc(uiGDesc())}</div></div><div class="hk ghk"><span data-m="back">${uiK('Esc', 'kb')}Back</span><span data-m="tc">${uiK('V')}${uiTC ? 'Blue' : 'Orange'} Car</span>${uiGc === 'gx' ? `<span data-m="gxp">${uiK('P')}Preview</span>` : ''}<span class="gdr">${coarse ? 'Drag the car to rotate' : 'Drag or ' + uiKn('KeyQ') + ' / ' + uiKn('KeyE') + ' to rotate'}</span></div>`;
        };
        const uiGarAfter = () => {
          if (uiGc === 'paint' && uiPt !== 'fin') uiPaintSync();
          let ch = false;
          for (const it of uiGItems(uiGc)) { const key = (uiGc === 'paint' ? 'paint' : uiGc) + ':' + it.id; if (it.t > 0 && uiOwn(uiGc, it) && !saved.seen.includes(key)) { saved.seen.push(key); ch = true; } }
          if (ch) api.save(saved);
          const on = menu.querySelector('.gg .gi.on'); if (on) uiScrollTo(on);
        };
        const uiScrollTo = b => { const p = b.parentElement; if (!p) return; if (b.offsetTop < p.scrollTop) p.scrollTop = b.offsetTop - 4; else if (b.offsetTop + b.offsetHeight > p.scrollTop + p.clientHeight) p.scrollTop = b.offsetTop + b.offsetHeight - p.clientHeight + 4; if (b.offsetLeft < p.scrollLeft) p.scrollLeft = b.offsetLeft - 8; else if (b.offsetLeft + b.offsetWidth > p.scrollLeft + p.clientWidth) p.scrollLeft = b.offsetLeft + b.offsetWidth - p.clientWidth + 8; };
        const uiGCols = () => { const t = [...menu.querySelectorAll('.gg .gi')]; let n = 0; for (const x of t) { if (x.offsetTop !== t[0].offsetTop) break; n++; } return n || 1; };
        const uiGarHover = (id, scroll) => {
          uiGi = id; uiGf = 'grid';
          for (const b of menu.querySelectorAll('.gg .gi')) b.classList.toggle('on', b.dataset.gi === id);
          for (const b of menu.querySelectorAll('.gcb')) { b.classList.toggle('on', false); b.classList.toggle('act', b.dataset.gc === uiGc); }
          if (uiGc === 'body') { uiPrev = id; uiPv = null; } else { uiPrev = null; uiPv = { k: uiGc === 'paint' ? 'fin' : uiGc, id }; }
          uiPose();
          const md = menu.querySelector('.gmd'); if (md) md.textContent = uiGDesc();
          const b = menu.querySelector('.gg .gi.on'); if (b && scroll) uiScrollTo(b);
        };
        const uiGarLeave = () => { uiPv = null; uiPrev = null; uiPose(); if (uiGf === 'grid') { uiGi = uiEq(uiGc); for (const b of menu.querySelectorAll('.gg .gi')) b.classList.toggle('on', b.dataset.gi === uiGi); const md = menu.querySelector('.gmd'); if (md) md.textContent = uiGDesc(); } };
        const uiGxPrev = id => {
          const now = performance.now(), c = W.cars.find(x => x.team === uiTC && x.slot === 0);
          if (!c || now < uiGxT || typeof fxGoalBlast !== 'function') return;
          uiGxT = now + 1400;
          try { const q = { x: c.p.x + c.f.x * 30, y: c.p.y + c.f.y * 30, z: c.p.z + 110 }; if (crGXN() || id === 'classic') fxGoalBlast(q, uiTC, id); else crGXPlay(id, q, uiTC); if (typeof fxBoom === 'function') fxBoom(0.45, 1.6, 1, 0); } catch (e) {   }
        };
        const uiEquip = (k, id) => {
          if (k === 'body') { if (!BODIES[id]) return false; saved.car = id; }
          else {
            const kk = k === 'paint' ? 'fin' : k, it = uiGItems(k).find(x => x.id === id);
            if (!it) return false;
            if (!uiOwn(k, it)) { tone(220, 0.14, 'square', 0.025, 180); return false; }
            uiLO(saved.car)[kk] = id;
          }
          api.save(saved); uiPv = null; uiPrev = null; uiPose(); tone(880, 0.12, 'triangle', 0.03, 1320);
          if (k === 'gx') { uiGxT = 0; uiGxPrev(id); }
          return true;
        };
        const uiGarCat = k => { if (k) uiGc = k; uiPv = null; uiPrev = null; uiGi = uiEq(uiGc); uiPose(); renderMenu(); };
        const uiGarKey = e => {
          const c = e.code, up = c === 'ArrowUp' || c === 'KeyW', dn = c === 'ArrowDown' || c === 'KeyS', lf = c === 'ArrowLeft' || c === 'KeyA', rt = c === 'ArrowRight' || c === 'KeyD', ok = c === 'Enter' || c === 'NumpadEnter' || c === 'Space';
          if (c === 'KeyQ' || c === 'KeyE') { uiGarAT += c === 'KeyQ' ? 0.4 : -0.4; return; }
          if (c === 'KeyP' && uiGc === 'gx') { uiGxT = 0; uiGxPrev(uiGf === 'grid' && uiGi ? uiGi : uiEq('gx')); return; }
          if (uiGf === 'cat') {
            const i = uiGC.findIndex(x => x[0] === uiGc);
            if (up || dn) { uiGarCat(uiGC[(i + (up ? uiGC.length - 1 : 1)) % uiGC.length][0]); uiTick(); }
            else if (rt || ok) { uiGf = 'grid'; uiGi = uiEq(uiGc); renderMenu(); if (uiGc !== 'paint' || uiPt === 'fin') uiGarHover(uiGi, true); uiTick(); }
            return;
          }
          if (uiGc === 'paint' && uiPt !== 'fin') {
            if (lf && uiHSV[1] < 0.02) { uiGf = 'cat'; renderMenu(); return; }
            if (lf || rt) { uiHSV[0] = (uiHSV[0] + (rt ? 1 : -1) / 72 + 1) % 1; if (uiHSV[1] < 0.25) uiHSV[1] = 0.85; if (uiHSV[2] < 0.1) uiHSV[2] = 0.8; uiPaintSet(uiHsvHex(uiHSV[0], uiHSV[1], uiHSV[2]), true, true); }
            else if (up || dn) { uiHSV[2] = clamp(uiHSV[2] + (up ? 0.05 : -0.05), 0, 1); uiPaintSet(uiHsvHex(uiHSV[0], uiHSV[1], uiHSV[2]), true, true); }
            else if (ok) { uiPt = uiPt === 'p' ? 'a' : 'fin'; renderMenu(); uiTick(); }
            return;
          }
          const L = uiGItems(uiGc), cols = uiGCols(), j = Math.max(0, L.findIndex(x => x.id === uiGi));
          if (ok) { if (uiEquip(uiGc, L[j].id)) renderMenu(); return; }
          let n = j;
          if (lf) { if (j % cols === 0) { uiGf = 'cat'; uiPv = null; uiPrev = null; uiPose(); renderMenu(); uiTick(); return; } n = j - 1; }
          if (rt) n = Math.min(L.length - 1, j + 1);
          if (up) { if (j - cols >= 0) n = j - cols; else if (uiGc === 'paint') { uiPt = 'a'; renderMenu(); return; } }
          if (dn) n = Math.min(L.length - 1, j + cols);
          if (n !== j) { uiGarHover(L[n].id, true); uiTick(); }
        };
        const uiRwThumb = r => r.k === 'title' ? uiThumbOf('title', r.it) : uiThumbOf(r.k, r.it, r.k === 'decal' ? r.it.b : null);
        const uiPassEqd = r => r.k === 'title' ? saved.ttl === r.id : r.k === 'decal' ? uiLO(r.it.b).decal === r.id && saved.car === r.it.b : uiLO(saved.car)[r.k] === r.id;
        const uiPassHtml = () => {
          const T = crPass(), tier = uiTier(), px = saved.pxp - (tier - 1) * crTierXP, mx = tier >= crTierN && px >= crTierXP, f = clamp(uiPf, 1, crTierN), r = T[f - 1], R = crRar[r.it.r] || crRar[2], own = f <= tier;
          const tiles = T.map((q, i) => { const n = i + 1, o = n <= tier, Q = crRar[q.it.r] || crRar[2]; return `<button class="pti${n === f ? ' on' : ''}${o ? ' own' : ''}${n === tier ? ' cur' : ''}" data-tier="${n}" style="--rc:${Q[1]}"><small>${n}</small><span class="gim">${uiRwThumb(q)}</span><b>${esc(q.it.n)}</b>${o ? `<i class="geq">${uiIC.check}</i>` : '<i class="glk"></i>'}</button>`; }).join('');
          return `<div class="psx"><div class="psh"><h2 class="bt">Rocket Pass</h2><small>Season 1 · Free Track · ${crTierN} tiers</small></div><div class="pst"><span class="ptb"><small>Tier</small><b>${tier}</b></span><div class="ptx"><i><u style="width:${(mx ? 100 : Math.min(100, px / crTierXP * 100)).toFixed(1)}%"></u></i><span>${tier >= crTierN ? 'All tiers unlocked · ' + saved.pxp + ' XP' : px + ' / ' + crTierXP + ' XP to tier ' + (tier + 1)}</span></div></div><div class="pdt" style="--rc:${R[1]}"><span class="gim">${uiRwThumb(r)}</span><div><small>Tier ${f} · ${uiCatN(r.k)} · ${R[0]}</small><b>${esc(r.it.n)}</b><p>${own ? 'Unlocked' + (r.k === 'decal' ? ' · decal for the ' + esc(BODIES[r.it.b] ? BODIES[r.it.b].name : '') : '') : 'Reach tier ' + f + ' to unlock · ' + Math.max(0, (f - 1) * crTierXP - saved.pxp) + ' XP to go'}</p></div>${own ? `<button class="rb pbe${uiPassEqd(r) ? ' act' : ''}" data-pe="1">${uiPassEqd(r) ? 'Equipped' : 'Equip'}</button>` : ''}</div><div class="ptr">${tiles}</div><div class="pxs">Earn XP: 2 per second played · Goal 50 · Assist 30 · Save 40 · Win 150 · MVP 50 · Free Play 1 per second</div><div class="hk"><span data-m="back">${uiK('Esc', 'kb')}Back</span><span>${uiK('←')}${uiK('→')}Browse</span>${own ? `<span data-pe="1">${uiK('Enter', 'ka')}Equip</span>` : ''}</div></div>`;
        };
        const uiPassFocus = n => {
          uiPf = clamp(n, 1, crTierN);
          const r = crPass()[uiPf - 1], tr = menu.querySelector('.ptr'), sl = tr ? tr.scrollLeft : 0;
          uiPv = r.k === 'title' ? null : { k: r.k, id: r.id }; uiPrev = r.k === 'decal' ? r.it.b : null; uiPose();
          renderMenu();
          const t2 = menu.querySelector('.ptr'), b = menu.querySelector('.pti.on'); if (t2) { t2.scrollLeft = sl; if (b) uiScrollTo(b); }
        };
        const uiPassEquip = () => {
          const r = crPass()[uiPf - 1];
          if (!r || uiPf > uiTier()) return;
          if (r.k === 'title') saved.ttl = saved.ttl === r.id ? '' : r.id;
          else if (r.k === 'decal') { if (BODIES[r.it.b]) { saved.car = r.it.b; uiLO(r.it.b).decal = r.id; } }
          else uiLO(saved.car)[r.k] = r.id;
          api.save(saved); tone(880, 0.12, 'triangle', 0.03, 1320); uiPassFocus(uiPf);
        };
        const uiRvEl = el('div', 'rvl', wrap);
        uiRvEl.hidden = true;
        const uiRvQ = [];
        let uiRvT = 0;
        const uiRvShow = () => {
          const n = uiRvQ.shift();
          if (!n) { uiRvEl.hidden = true; return false; }
          const r = crPass()[n - 1], R = crRar[r.it.r] || crRar[2];
          uiRvEl.innerHTML = `<div class="rvb" style="--rc:${R[1]}"><i class="rvr"></i><small class="rvs">Rocket Pass · Tier Up</small><h2 class="rvh">Tier ${n}</h2><div class="rvc"><div class="rvf">${uiShield}</div><div class="rvk"><span class="gim">${uiRwThumb(r)}</span><b>${esc(r.it.n)}</b><small>${uiCatN(r.k)} · ${R[0]}</small></div></div><p class="rvp">${uiRvQ.length ? uiRvQ.length + ' more · ' : ''}${coarse ? 'Tap' : 'Press any button'} to continue</p></div>`;
          uiRvEl.hidden = false; uiRvT = performance.now();
          tone(392, 0.25, 'triangle', 0.04, 784); api.timeout(() => { if (!dead && !uiRvEl.hidden) { tone(784, 0.6, 'triangle', 0.05, 1568, 0, 0.2); noise(0.5, 3000, 0.05, 'bandpass', 0.8, 6000); } }, 820);
          return true;
        };
        const uiRvNext = () => { if (performance.now() - uiRvT < 1000) return; api.sfx('tap'); if (!uiRvShow() && ui === 'menu') renderMenu(); };
        api.on(uiRvEl, 'pointerdown', e => { e.preventDefault(); e.stopPropagation(); uiRvNext(); });
        const uiPassAdd = xp => { const a = uiTier(); saved.pxp += Math.max(0, Math.round(xp)); const b = uiTier(); for (let n = a + 1; n <= b; n++) uiRvQ.push(n); saved.tier = b; api.save(saved); return [a, b]; };
        const renderMenu = () => {
          let hh = '<div class="mvg"></div>';
          menu.classList.toggle('gar', uiScr === 'garage'); menu.classList.toggle('pas', uiScr === 'pass');
          if (uiScr === 'garage') hh += uiGarHtml();
          else if (uiScr === 'pass') hh += uiPassHtml();
          else if (uiScr === 'setup') {
            const f = uiFo || 'go';
            const row = (k, t) => { const L = uiOS[k], it = L.find(x => x[0] === saved[k]) || L[0]; return `<button class="rb so${f === k ? ' on' : ''}" data-o="${k}" data-d="${esc(uiOD[k])}"><span>${t}</span><i data-dd="-1">‹</i><b>${it[1]}</b><i data-dd="1">›</i></button>`; };
            hh += `<div class="msx"><h2 class="bt">Exhibition</h2><div class="sl">${row('size', 'Playlist')}${row('diff', 'Bot Difficulty')}${row('len', 'Match Length')}<button class="rb sgo${f === 'go' ? ' on' : ''}" data-st="1" data-d="${esc(uiOD.go)}">Start Match</button></div><div class="md">${esc(f === 'go' ? uiOD.go : uiOD[f])}</div><div class="hk"><span data-m="back">${uiK('Esc', 'kb')}Back</span><span data-st="1">${uiK('Enter', 'ka')}Start</span></div></div>`;
          } else {
            const mb = (k, t) => `<button class="rb${!uiFs && uiFm === k ? ' on' : ''}${uiFs && k === 'play' ? ' act' : ''}" data-m="${k}" data-d="${esc(uiMD[k])}">${t}</button>`;
            const sb = (k, t, s) => `<button class="rb${uiFs === k ? ' on' : ''}" data-p="${k}" data-d="${esc(uiMD[k])}">${t}${s ? `<small>${s}</small>` : ''}</button>`;
            const nw = crPass().some((r, i) => i < uiTier() && r.k !== 'title' && !saved.seen.includes((r.k === 'fin' ? 'paint' : r.k) + ':' + r.id));
            hh += `<div class="mm"><div class="mcol"><div class="ml">${mb('pass', 'Rocket Pass<small>Tier ' + uiTier() + '</small>')}${mb('play', 'Play')}${mb('garage', 'Garage' + (nw ? '<em class="gnw">New</em>' : ''))}${mb('train', 'Training')}${mb('opts', 'Options')}${mb('cred', 'Credits')}${mb('exit', 'Exit Game')}</div><div class="ms"${uiFm === 'play' ? '' : ' hidden'}>${sb('cpu', 'Play vs Bots', 'Exhibition')}${sb('train', 'Free Play', 'Training')}${sb('online', 'Play Online', 'Party · up to 3v3')}</div></div><div class="md">${esc(uiMD[uiFs || uiFm])}</div></div>`;
          }
          menu.innerHTML = hh + uiPlb();
          if (uiScr === 'garage') uiGarAfter();
          if (uiScr === 'pass') { const b = menu.querySelector('.pti.on'); if (b) uiScrollTo(b); }
        };
        const uiOnFocus = b => {
          const d = b.dataset, box = b.closest('.mm,.gsx,.msx'), md = box && box.querySelector('.md');
          if (md && d.d != null) md.textContent = d.d;
          if (ui !== 'menu' || !b.closest('.menu')) return;
          if (d.m && b.closest('.ml')) { uiFm = d.m; uiFs = null; const ms = menu.querySelector('.ms'); if (ms) ms.hidden = d.m !== 'play'; for (const x of menu.querySelectorAll('.ml .act')) x.classList.remove('act'); }
          if (d.p) { uiFs = d.p; const pb = menu.querySelector('.ml [data-m="play"]'); if (pb) pb.classList.add('act'); }
          if (d.o || d.st) uiFo = d.o || 'go';
        };
        const uiItems = root => [...root.querySelectorAll('.rb')].filter(b => b.offsetParent !== null && !b.classList.contains('dis'));
        const uiSetOn = (root, b) => { for (const x of root.querySelectorAll('.rb.on')) if (x !== b) x.classList.remove('on'); if (b && !b.classList.contains('on')) { b.classList.add('on'); uiOnFocus(b); } };
        const uiTick = () => tone(1500, 0.035, 'sine', 0.016, 0, 0, 0);
        const uiNav = (root, e) => {
          const c = e.code, it = uiItems(root), cur = root.querySelector('.rb.on');
          const up = c === 'ArrowUp' || c === 'KeyW', dn = c === 'ArrowDown' || c === 'KeyS', lf = c === 'ArrowLeft' || c === 'KeyA', rt = c === 'ArrowRight' || c === 'KeyD';
          if (!cur && (up || dn || lf || rt)) { if (it[0]) { uiSetOn(root, it[0]); uiTick(); } return true; }
          const col = cur && cur.parentElement, hz = col && col.dataset.h;
          if (up || dn || (hz && (lf || rt))) {
            const list = it.filter(b => b.parentElement === col), n = list.length, j = list.indexOf(cur);
            if (!n) return true;
            if (hz && (up || dn)) { const o = it.filter(b => b.parentElement !== col); if (o.length) { uiSetOn(root, dn ? o[0] : o[o.length - 1]); uiTick(); } return true; }
            const nb = list[(j + (up || lf ? n - 1 : 1)) % n];
            if (!hz && j === 0 && up) { const o = it.filter(b => b.parentElement !== col && b.parentElement.dataset.h); if (o.length) { uiSetOn(root, o[0]); uiTick(); return true; } }
            uiSetOn(root, nb); uiTick(); return true;
          }
          if (lf || rt) {
            if (cur.dataset.o) { uiOptStep(cur.dataset.o, lf ? -1 : 1); uiTick(); return true; }
            if (cur.closest('.ml') && rt && cur.dataset.m === 'play') { const s = root.querySelector('.ms .rb'); if (s) { uiSetOn(root, s); uiTick(); } return true; }
            if (cur.closest('.ms') && lf) { const s = root.querySelector('.ml [data-m="play"]'); if (s) { uiSetOn(root, s); uiTick(); } return true; }
            return true;
          }
          if (c === 'Enter' || c === 'NumpadEnter' || c === 'Space') { if (cur) cur.click(); return true; }
          return false;
        };
        const uiOptStep = (k, d) => { const L = uiOS[k], i = L.findIndex(x => x[0] === saved[k]); saved[k] = L[(Math.max(0, i) + d + L.length) % L.length][0]; uiFo = k; api.save(saved); renderMenu(); };
        const uiBack = () => {
          if (uiScr === 'garage') { if (uiGf === 'grid') { uiGf = 'cat'; uiPv = null; uiPrev = null; uiPose(); renderMenu(); return; } uiPrev = null; uiPv = null; uiScr = 'main'; uiFm = 'garage'; uiFs = null; uiTC = 0; uiGarAT = 0; uiPose(); renderMenu(); return; }
          if (uiScr === 'pass') { uiPv = null; uiPrev = null; uiScr = 'main'; uiFm = 'pass'; uiFs = null; uiPose(); renderMenu(); return; }
          if (uiScr === 'setup') { uiScr = 'main'; uiFm = 'play'; uiFs = saved.play; renderMenu(); return; }
          if (uiFs) { uiFs = null; uiFm = 'play'; renderMenu(); }
        };
        const launch = () => { if (ui !== 'menu') return; audio(); if (saved.play === 'online') startOnline(); else startGame(saved.play === 'train' ? 'train' : 'cpu'); };
        api.on(menu, 'click', e => {
          if (ui !== 'menu') return;
          const b = e.target.closest('button,[data-m],[data-st],[data-pe]'); if (!b || b.closest('.plb')) return;
          const d = b.dataset;
          audio(); api.sfx('tap');
          if (d.st) { launch(); return; }
          if (d.m === 'play') { uiFm = 'play'; uiFs = null; renderMenu(); return; }
          if (d.m === 'garage') { uiScr = 'garage'; uiPrev = null; uiPv = null; uiTC = 0; uiGc = 'body'; uiGf = 'cat'; uiGarAT = uiGarA = 0; renderMenu(); uiPose(); return; }
          if (d.m === 'pass') { uiScr = 'pass'; uiPf = Math.min(crTierN, uiTier() + (uiTier() < crTierN ? 1 : 0)); uiTC = 0; uiPassFocus(uiPf); return; }
          if (d.m === 'opts') { uiFm = 'opts'; if (uiOptTab === 'cred') uiOptTab = 'cam'; uiOptOpen(null); return; }
          if (d.m === 'cred') { uiFm = 'cred'; uiOptTab = 'cred'; uiOptOpen(null); return; }
          if (d.m === 'exit') { showTitle(); return; }
          if (d.m === 'train') { saved.play = 'train'; api.save(saved); launch(); return; }
          if (d.m === 'back') { uiBack(); return; }
          if (d.m === 'tc') { uiTC = 1 - uiTC; uiPose(); renderMenu(); return; }
          if (d.m === 'gxp') { uiGxT = 0; uiGxPrev(uiGf === 'grid' && uiGi ? uiGi : uiEq('gx')); return; }
          if (d.p) { saved.play = d.p; api.save(saved); if (d.p === 'cpu') { uiScr = 'setup'; uiFo = 'go'; renderMenu(); } else launch(); return; }
          if (d.gc) { uiGf = 'cat'; uiGarCat(d.gc); return; }
          if (d.gi != null) { if (uiEquip(uiGc, d.gi)) { uiGf = 'grid'; uiGi = d.gi; renderMenu(); } return; }
          if (d.pt) { uiPt = d.pt; uiGf = 'grid'; uiGi = uiEq('paint'); renderMenu(); return; }
          if (d.pc) { uiPaintSet(d.pc, true); return; }
          if (d.pd) { uiPaintSet(uiPt === 'a' ? crTeam[0].a : crTeam[uiTC].p, true); return; }
          if (d.tier) { uiPassFocus(+d.tier); return; }
          if (d.pe) { uiPassEquip(); return; }
          if (d.o) { const dd = e.target.closest('[data-dd]'); uiOptStep(d.o, dd ? +dd.dataset.dd : 1); }
        });
        api.on(menu, 'pointerdown', e => {
          if (ui !== 'menu' || uiScr !== 'garage') return;
          const cw = e.target.closest('[data-cw]');
          if (cw) { e.preventDefault(); uiDrag = { cw, id: e.pointerId }; try { cw.setPointerCapture(e.pointerId); } catch (er) {   } uiCwPick(cw, e); return; }
          if (!e.target.closest('button,input,label,.gpn,.gsx,.plb,.hk')) uiDrag = { rot: true, id: e.pointerId, x: e.clientX };
        });
        api.on(menu, 'pointermove', e => {
          if (!uiDrag || e.pointerId !== uiDrag.id) return;
          if (uiDrag.cw) uiCwPick(uiDrag.cw, e); else { uiGarAT -= (e.clientX - uiDrag.x) * 0.012; uiDrag.x = e.clientX; }
        });
        api.on(window, 'pointerup', e => { if (uiDrag && e.pointerId === uiDrag.id) { if (uiDrag.cw) api.save(saved); uiDrag = null; } });
        api.on(window, 'pointercancel', () => { uiDrag = null; });
        api.on(menu, 'input', e => {
          const t = e.target, d = t.dataset;
          if (d.cv) { uiHSV[2] = clamp(+t.value / 100, 0, 1); uiPaintSet(uiHsvHex(uiHSV[0], uiHSV[1], uiHSV[2]), false, true); }
          else if (d.hx) { const v = t.value.trim(); if (crHex(v)) uiPaintSet(v, false); }
        });
        api.on(menu, 'change', e => { const t = e.target, d = t.dataset; if (d.cv) api.save(saved); else if (d.hx) { if (crHex(t.value.trim())) uiPaintSet(t.value.trim(), true); else t.value = uiLO(saved.car)[uiPaintKey()]; } });
        api.on(menu, 'keydown', e => { const t = e.target; if (t && t.dataset && t.dataset.hx && e.code === 'Enter') t.blur(); });
        api.on(menu, 'pointerover', e => {
          if (ui !== 'menu' || (e.pointerType && e.pointerType !== 'mouse')) return;
          const g = e.target.closest && e.target.closest('.gg .gi'); if (g && uiScr === 'garage' && g.dataset.gi !== uiGi) { uiGarHover(g.dataset.gi); return; }
          const p = e.target.closest && e.target.closest('.pti'); if (p && uiScr === 'pass' && +p.dataset.tier !== uiPf) uiPassFocus(+p.dataset.tier);
        });
        api.on(menu, 'pointerout', e => {
          if (ui !== 'menu' || uiScr !== 'garage' || (!uiPv && !uiPrev)) return;
          const a = e.target.closest && e.target.closest('.gg'), r = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.gg');
          if (!a || r) return;
          uiGarLeave();
        });
        api.on(wrap, 'pointerover', e => {
          if (e.pointerType && e.pointerType !== 'mouse') return;
          const b = e.target.closest && e.target.closest('.rb'); if (!b || b.classList.contains('on') || b.classList.contains('dis') || b.classList.contains('gcb') || b.classList.contains('pbe')) return;
          const root = b.closest('.dlg,.opw,.menu,.pz,.end,.lob'); if (root) uiSetOn(root, b);
        });
        api.on(wrap, 'click', e => {
          const p = e.target.closest && e.target.closest('.plb');
          if (!p || !uiDlg.hidden || !uiOptEl.hidden) return;
          if (ui === 'menu' || ui === 'end' || (paused && ui === 'play')) { api.sfx('tap'); uiOptTab = 'game'; uiOptOpen(null); }
        });


        let uiOptTab = 'cam', uiOptBack = null;
        const uiTabs = [['game', 'Gameplay'], ['cam', 'Camera'], ['ctl', 'Controls'], ['aud', 'Audio'], ['chat', 'Chat'], ['cred', 'Credits']];
        const uiCred = () => `<div class="ocr">${(typeof crCredits !== 'undefined' && Array.isArray(crCredits) ? crCredits : []).map(c => `<p>${esc(String(c)).replace(/(https?:\/\/[^\s,]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')}</p>`).join('')}<p>Fan-made tribute. Not affiliated with, endorsed or sponsored by Psyonix. Rocket League is a trademark of Psyonix LLC.</p></div>`;
        const uiTg = (k, vals, cur) => `<div class="tg2">${vals.map(([v, t]) => `<button data-${k}="${v}" class="${String(cur) === String(v) ? 'on' : ''}">${t}</button>`).join('')}</div>`;
        const uiRange = (k, lab, v, r, key) => `<div class="orw"><span>${lab}</span><input type="range" data-${key}="${k}" min="${r[0]}" max="${r[1]}" step="${r[2]}" value="${v}" style="--p:${((v - r[0]) / (r[1] - r[0]) * 100).toFixed(1)}%"><b>${uiF(v)}</b></div>`;
        const uiOptBody = () => {
          const t = uiOptTab;
          if (t === 'game') return `<div class="orw"><span>Player Name</span><input type="text" data-name="1" maxlength="16" value="${esc(saved.name)}" spellcheck="false" autocomplete="off"></div><div class="orw"><span>Quick Chat</span>${uiTg('cf', [['all', 'All'], ['team', 'Team Only'], ['off', 'Off']], saved.chatf)}</div><div class="orw"><span>Level ${uiLvl(saved.xp).l} · ${saved.games} matches · ${saved.wins} wins</span></div>`;
          if (t === 'cam') return `<div class="orw"><span>Camera Shake</span>${uiTg('sh', [[1, 'On'], [0, 'Off']], saved.shake ? 1 : 0)}</div>${Object.keys(uiCSR).map(k => uiRange(k, uiCSN[k], fxCam[k], uiCSR[k], 'cs')).join('')}<div class="orw"><span>Ball Camera</span>${uiTg('bc', [[1, 'On'], [0, 'Off']], saved.cam !== false ? 1 : 0)}</div>`;
          if (t === 'cred') return uiCred();
          if (t === 'aud') return `${uiRange('vol', 'Master Volume', saved.vol, [0, 100, 1], 'vol')}<div class="orw"><span>Game Audio</span>${uiTg('mu', [[0, 'On'], [1, 'Muted']], saved.mute ? 1 : 0)}</div>`;
          if (t === 'chat') return uiQCN.map((n, cat) => `<div class="og"><h5><i></i>${n}</h5><div class="oq">${[0, 1, 2, 3].map(k => `<select data-qs="${cat},${k}">${uiQCP[cat].map(s => `<option${s === uiQT(cat, k) ? ' selected' : ''}>${esc(s)}</option>`).join('')}</select>`).join('')}</div></div>`).join('');
          const R = [['Drive / Reverse', uiKn('KeyW') + ' / ' + uiKn('KeyS') + ' · ↑ / ↓', 'Stick'], ['Steer', uiKn('KeyA') + ' / ' + uiKn('KeyD') + ' · ← / →', 'Stick'], ['Boost', 'Shift · Left click', 'Boost'], ['Jump / Flip', 'Space · Right click', 'Jump'], ['Powerslide / Air roll', uiKn('KeyX') + ' · Ctrl', 'Slide'], ['Air roll left / right', uiKn('KeyQ') + ' / ' + uiKn('KeyE'), 'Slide + stick'], ['Ball cam', uiKn('KeyC'), 'Ball cam'], ['Scoreboard', 'Tab', 'Tap the clock'], ['Quick chat', '1 – 4', 'Chat button'], ['Free Play: reset ball / car', 'R / T', 'Reset'], ['Free Play: boost, shots, spawn', 'B / P / 1 – 5', 'Pause menu'], ['Pause / Back', 'Esc · P', 'II']];
          return `<table class="okt"><tr><th>Action</th><th>Keyboard</th><th>Touch</th></tr>${R.map(r => `<tr>${r.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}</table>`;
        };
        const uiOptRender = () => {
          const st = uiOptEl.querySelector('.ob'), sc = st ? st.scrollTop : 0;
          uiOptEl.innerHTML = `<div class="op pnl"><h2 class="pt">Options</h2><div class="otb">${uiK(uiKn('KeyQ'))}${uiTabs.map(([k, t]) => `<button class="ot${k === uiOptTab ? ' on' : ''}" data-tab="${k}">${t}</button>`).join('')}${uiK(uiKn('KeyE'))}</div><div class="ob">${uiOptBody()}</div><div class="hk"><span data-m="oback">${uiK('Esc', 'kb')}Back</span><span data-m="odef">${uiK(uiKn('KeyX'), 'kx')}Default</span></div></div>`;
          const nb = uiOptEl.querySelector('.ob'); if (nb && st) nb.scrollTop = sc;
        };
        const uiOptOpen = back => { uiOptBack = back; uiOptRender(); uiOptEl.hidden = false; };
        const uiOptClose = () => {
          uiOptEl.hidden = true; api.save(saved);
          const f = uiOptBack; uiOptBack = null;
          if (ui === 'menu') renderMenu(); else if (ui === 'end') uiEndRefresh(); else if (paused && !pz.hidden && ui === 'play') uiPzRender();
          if (f) f();
        };
        const uiSaveCam = () => { saved.cs = {}; for (const k in uiCSR) saved.cs[k] = fxCam[k]; api.save(saved); };
        const uiOptDef = () => {
          const t = uiOptTab;
          if (t === 'cam') { Object.assign(fxCam, uiCSD); saved.cs = null; saved.shake = true; for (const v of views) setCam(v, true); uiFov(); }
          else if (t === 'aud') { saved.vol = 85; saved.mute = false; }
          else if (t === 'chat') saved.qc = null;
          else if (t === 'game') saved.chatf = 'all';
          api.save(saved); uiOptRender();
        };
        api.on(uiOptEl, 'click', e => {
          const b = e.target.closest('button,[data-m]'); if (!b) return;
          const d = b.dataset; api.sfx('tap');
          if (d.tab) { uiOptTab = d.tab; uiOptRender(); return; }
          if (d.m === 'oback') { uiOptClose(); return; }
          if (d.m === 'odef') { uiOptDef(); return; }
          if (d.cf) saved.chatf = d.cf;
          else if (d.sh != null) saved.shake = d.sh === '1';
          else if (d.bc != null) { const on = d.bc === '1'; saved.cam = on; for (const v of views) setCam(v, on); }
          else if (d.mu != null) saved.mute = d.mu === '1';
          else return;
          api.save(saved); uiOptRender();
        });
        api.on(uiOptEl, 'input', e => {
          const t = e.target, d = t.dataset;
          if (d.cs || d.vol) {
            const r = d.cs ? uiCSR[d.cs] : [0, 100], v = clamp(+t.value, r[0], r[1]);
            t.style.setProperty('--p', ((v - r[0]) / (r[1] - r[0]) * 100).toFixed(1) + '%');
            const lb = t.nextElementSibling; if (lb) lb.textContent = uiF(v);
            if (d.cs) { fxCam[d.cs] = v; if (d.cs === 'fov' && ui === 'play') uiFov(); } else saved.vol = v;
          }
        });
        api.on(uiOptEl, 'change', e => {
          const t = e.target, d = t.dataset;
          if (d.cs) uiSaveCam();
          else if (d.vol) api.save(saved);
          else if (d.name) { const s = t.value.replace(/[^\w .\-!?]/g, '').trim().slice(0, 16); saved.name = s || 'Player'; t.value = saved.name; api.save(saved); }
          else if (d.qs) { const [cat, k] = d.qs.split(',').map(Number); if (!saved.qc) saved.qc = uiQCP.map((p, i) => [0, 1, 2, 3].map(j => uiQT(i, j))); if (uiQCP[cat] && uiQCP[cat].includes(t.value)) saved.qc[cat][k] = t.value; api.save(saved); }
        });
        api.on(uiOptEl, 'keydown', e => { if (e.target && e.target.dataset && e.target.dataset.name && e.code === 'Enter') e.target.blur(); });


        let uiDlgFn = null;
        const uiConfirm = (t, msg, fn) => { uiDlgFn = fn; uiDlg.innerHTML = `<div class="dp pnl"><h2 class="pt">${t}</h2><div class="dq"><i>?</i><p>${msg}</p></div><div class="db" data-h="1"><button class="rb" data-y="1">Yes</button><button class="rb on" data-y="0">No</button></div></div>`; uiDlg.hidden = false; };
        const uiDlgClose = () => { uiDlg.hidden = true; uiDlgFn = null; };
        api.on(uiDlg, 'click', e => {
          const b = e.target.closest('[data-y]'); if (!b) return;
          api.sfx('tap');
          const f = b.dataset.y === '1' ? uiDlgFn : null; uiDlgClose(); if (f) f();
        });
        const uiExitAsk = () => uiConfirm('Exit to Main Menu', 'Are you sure you want to exit to the main menu?', () => showMenu());


        const uiLoadShow = (txt, ttl) => { uiLd.innerHTML = `<div class="mlg">${uiShield}${uiWM}</div><div class="lt"><b>${ttl || 'Pro Tip'}</b><p>${esc(txt)}</p></div><div class="ll">Loading<i></i></div>`; uiLd.hidden = false; };
        const hideViews = () => {
          for (const v of views) { v.ban.hidden = true; v.tc.hidden = v.tl.hidden = v.bd.hidden = v.sb.hidden = v.cb.hidden = true; uiQcClose(v); v.trn.textContent = ''; v.trKey = ''; v.feed.textContent = v.pops.textContent = v.ss.textContent = v.ping.textContent = v.chat.textContent = ''; v.ssKey = ''; }
          uiTab(false);
        };
        const uiShowWorld = () => { W = makeWorld({ size: 1, human: false, bodies: [saved.car, saved.car] }); views[0].car = views[1].car = null; bindCars(); syncPads(); api.score('—'); uiPose(); uiCamSnap = true; };
        const uiHideAll = () => { wrap.classList.remove('pzo'); menu.hidden = endEl.hidden = pz.hidden = uiLd.hidden = uiLbEl.hidden = uiTtl.hidden = uiOptEl.hidden = true; uiDlgClose(); uiEnd.on = false; };
        const uiTrainLeave = () => { if (mode !== 'train' || uiPT < 5) return; const T = W.train || {}; uiPassAdd(Math.min(900, Math.floor(uiPT) + (T.goals || 0) * 15 + (T.saves || 0) * 10)); uiPT = 0; };
        const showMenu = scr => {
          leaveOnline(); uiTrainLeave();
          ui = 'menu'; mode = 'cpu'; paused = false; setLayout(); uiHideAll(); wrap.classList.remove('train');
          uiScr = scr || 'main'; uiFs = null; uiPrev = null; uiPv = null; if (uiScr === 'main') uiFm = 'play';
          hideViews(); uiShowWorld(); renderMenu(); menu.hidden = false;
          if (uiRvQ.length) uiRvShow();
        };
        const showTitle = () => {
          leaveOnline();
          ui = 'title'; mode = 'cpu'; paused = false; setLayout(); uiHideAll(); wrap.classList.remove('train');
          hideViews(); uiShowWorld(); uiTtl.hidden = false;
        };
        const uiGoMenu = () => { if (ui !== 'title') return; audio(); api.sfx('tap'); tone(660, 0.18, 'triangle', 0.05, 1320); ui = 'menu'; uiScr = 'main'; uiFm = 'play'; uiFs = null; uiTtl.hidden = true; uiPose(); renderMenu(); menu.hidden = false; };
        api.on(uiTtl, 'pointerdown', e => { e.preventDefault(); uiGoMenu(); });
        const beginPlay = () => {
          ui = 'play'; paused = false; submitted = false; uiHideAll();
          setLayout(); hideViews(); wrap.classList.toggle('train', mode === 'train');
          for (const v of active()) { v.tc.hidden = v.tl.hidden = v.bd.hidden = v.sb.hidden = v.cb.hidden = false; v.key = ''; v.bkey = -1; v.latch = false; v.qcLog = []; v.qcBan = 0; v.cbk.textContent = uiKn('KeyC'); v.trKey = ''; resetCam(v); }
          uiPT = 0;
          views[0].pb.hidden = false;
          uiGoal = null; uiBotNext = performance.now() + 5000;
          bindCars(); syncPads(); lastPts = -1; acc = 0;
        };
        const uiJoinLog = () => { uiLog.length = 0; for (const c of W.cars) uiLog.push(`<i class="p${c.team}">${esc(c.name)}</i> joined the match`); };
        const startGame = m => {
          saved.name = uiProfName() || saved.name;
          mode = m === 'train' ? 'train' : 'cpu'; setLayout();
          W = mode === 'train' ? makeWorld({ mode: 'training', size: 1, bodies: [saved.car], names: [saved.name] }) : makeWorld({ size: saved.size, diff: saved.diff, len: saved.len, names: [saved.name], bodies: [saved.car, saved.car] });
          views[0].car = W.cars.find(c => !c.bot) || W.cars[0]; views[1].car = null;
          for (const c of W.cars) c.cos = c.bot ? crBotCos(c.team, c.body) : crCosOf(uiLO(c.body), c.team);
          if (W.train) { W.train.unlimited = saved.tbo; W.train.shots = saved.tsh; if (uiTrSpawns().includes(saved.tsp)) W.train.spawn = saved.tsp; }
          startMatch(W); uiJoinLog();
          ui = 'load'; paused = false; uiHideAll(); hideViews(); uiCamSnap = true;
          bindCars(); syncPads();
          uiTipI = (uiTipI + 1) % uiTips.length; uiLoadShow(uiTips[uiTipI]);
          uiLoadT = 0;
        };
        const uiTrSpawns = () => typeof TRAIN_SPAWNS !== 'undefined' && Array.isArray(TRAIN_SPAWNS) && TRAIN_SPAWNS.length ? TRAIN_SPAWNS : ['center'];
        const uiTrSN = k => ({ center: 'Center', random: 'Random', roll: 'Rolling', air: 'Aerial', wall: 'Wall' })[k] || String(k);
        const uiTrOn = () => mode === 'train' && !!W.train;
        const uiTrAct = a => {
          if (!uiTrOn()) return;
          const T = W.train, rs = typeof trainReset === 'function';
          if (a === 'ball' || a === 'car' || a === 'all') { if (rs) trainReset(W, a); }
          else if (a === 'shot') { if (typeof trainShot === 'function') trainShot(W); }
          else if (a === 'boost') { T.unlimited = !T.unlimited; saved.tbo = T.unlimited; api.save(saved); }
          else if (a === 'shots') { T.shots = !T.shots; saved.tsh = T.shots; api.save(saved); }
          else if (a === 'spawn') { const L = uiTrSpawns(), i = L.indexOf(T.spawn); uiTrAct('sp:' + L[(i + 1) % L.length]); return; }
          else if (/^sp:/.test(a)) { const k = a.slice(3); if (uiTrSpawns().includes(k)) { T.spawn = k; saved.tsp = k; api.save(saved); if (rs) trainReset(W, 'ball'); } }
          for (const v of views) v.trKey = '';
          tone(980, 0.06, 'sine', 0.03);
        };
        const uiPzRender = () => {
          const on = pz.querySelector('.rb.on'), a = on ? on.dataset.a : 'r', T = uiTrOn() ? W.train : null;
          const it = T ? [['r', 'Resume'], ['tb', 'Reset Ball'], ['tc', 'Reset Car'], ['tu', 'Unlimited Boost: ' + (T.unlimited ? 'On' : 'Off')], ['tp', 'Shot Practice: ' + (T.shots ? 'On' : 'Off')], ['ts', 'Ball Spawn: ' + uiTrSN(T.spawn)], ['o', 'Options'], ['m', 'Exit Free Play']] : [['r', 'Resume Game'], ...(mode === 'online' ? [] : [['s', 'Restart Match']]), ['o', 'Options'], ['m', 'Exit to Main Menu']];
          pz.innerHTML = `<div class="pzp pnl"><h2 class="pt">${T ? 'Free Play' : 'Paused'}</h2>${it.map(([k, t]) => `<button class="rb${k === a ? ' on' : ''}" data-a="${k}">${t}</button>`).join('')}</div>${uiPlb()}`;
        };
        const togglePause = () => {
          if (ui !== 'play' || W.state === 'end') return;
          const open = pz.hidden;
          pz.hidden = !open; paused = open && mode !== 'online'; wrap.classList.toggle('pzo', open);
          if (open) { uiTab(false); for (const v of views) uiQcClose(v); pz.innerHTML = ''; uiPzRender(); }
          else { uiDlgClose(); uiOptEl.hidden = true; }
        };
        api.on(pz, 'click', e => {
          const b = e.target.closest('[data-a]'); if (!b) return;
          api.sfx('tap');
          const a = b.dataset.a;
          if (ui === 'left' || a === 'm' && ui !== 'play') { showMenu(); return; }
          if (a === 'r') togglePause(); else if (a === 's') startGame(mode); else if (a === 'o') uiOptOpen(null); else if (a === 'm') { if (mode === 'train') showMenu(); else uiExitAsk(); }
          else if (a === 'tb' || a === 'tc') { uiTrAct(a === 'tb' ? 'ball' : 'car'); togglePause(); }
          else if (a === 'tu' || a === 'tp' || a === 'ts') { uiTrAct(a === 'tu' ? 'boost' : a === 'tp' ? 'shots' : 'spawn'); uiPzRender(); }
        });


        const uiEnd = { on: false, ph: 0, t: 0, cd: 40, votes: new Set(), ready: new Set(), bt: [], xp: null, titles: new Map(), mvp: null, win: 0, hid: false, ck: -1, nb: false };
        const uiTitlesOf = () => {
          const m = new Map();
          for (const c of W.cars) {
            const s = c.st, t = s.goals >= 3 ? 'Hat Trick' : s.saves >= 3 ? 'Savior' : s.assists >= 2 ? 'Playmaker' : s.saves >= 2 ? 'Goalkeeper' : c.bot ? uiDName(typeof diffOf === 'function' ? diffOf(W, c) || W.diff : c.ai && c.ai.D === DIFF.rookie ? 'rookie' : c.ai && c.ai.D === DIFF.allstar ? 'allstar' : W.diff) : '';
            if (t) m.set(c, t);
          }
          return m;
        };
        const uiXpCalc = () => {
          const me = views[0].car;
          if (!me) return null;
          const won = me.team === uiEnd.win, lines = [['Match Complete', 100 + Math.round(W.len / 60) * 90], ['Score', Math.round(me.st.score / 10)]];
          if (won) lines.push(['Win', 100]);
          if (me === uiEnd.mvp) lines.push(['MVP', 50]);
          if (uiEnd.nb) lines.push(['New Best Score', 0]);
          let tot = 0; for (const l of lines) tot += l[1];
          const a = uiLvl(saved.xp); saved.xp += tot; const b = uiLvl(saved.xp), w0 = saved.wins;
          saved.games++; if (won) saved.wins++;
          api.save(saved);
          const s = me.st, ch = s.goals >= 2 ? ['Score 2 Goals', 'goal'] : s.saves >= 1 ? ['Make a Save', 'save'] : s.goals >= 1 ? ['Score a Goal', 'shot'] : won ? ['Win a Match', 'trophy'] : null;
          const pl = [['Time Played', Math.round(Math.min(uiPT, 1500) * 2)], ['Goals', (s.goals | 0) * 50], ['Assists', (s.assists | 0) * 30], ['Saves', (s.saves | 0) * 40]];
          if (won) pl.push(['Win', 150]);
          if (me === uiEnd.mvp) pl.push(['MVP', 50]);
          let pt = 0; for (const l of pl) pt += l[1];
          const p0 = saved.pxp, [ta, tb] = uiPassAdd(pt);
          return { lines, tot, a, b, w0, won, ch, pass: { lines: pl.filter(l => l[1] > 0), tot: pt, p0, p1: saved.pxp, ta, tb } };
        };
        const showEnd = newBest => {
          if (dead) return;
          ui = 'end'; uiTab(false); setLayout(false); uiDlgClose(); uiOptEl.hidden = true; pz.hidden = true; paused = false;
          for (const v of views) { uiQcClose(v); v.tc.hidden = v.ban.hidden = v.sb.hidden = v.bd.hidden = v.cb.hidden = v.tl.hidden = true; v.pops.textContent = v.ss.textContent = v.feed.textContent = v.chat.textContent = ''; v.ssKey = ''; }
          const win = W.score[0] > W.score[1] ? 0 : 1;
          let mvp = null;
          for (const c of W.cars) if (c.team === win && (!mvp || c.st.score > mvp.st.score)) mvp = c;
          Object.assign(uiEnd, { on: true, ph: 0, t: 0, cd: 40, votes: new Set(), ready: new Set(), win, mvp, hid: false, ck: -1, nb: !!newBest });
          uiEnd.titles = uiTitlesOf();
          uiEnd.bt = W.cars.filter(c => c.bot).map(c => ({ c, v: Math.random() < 0.7 ? 3 + Math.random() * 9 : 1e9, r: 4 + Math.random() * 14 }));
          uiEnd.xp = uiXpCalc();
          endEl.innerHTML = `<div class="mvg"></div>${online ? '' : '<div class="nmx"><small>Next match in</small><span></span></div>'}<div class="pg"></div><div class="ps" hidden></div>${uiPlb()}`;
          endEl.hidden = false;
          uiPgRender(); uiEndClock();
          if (!online) { const bots = W.cars.filter(c => c.bot).sort(() => Math.random() - 0.5).slice(0, 2), w0 = W; bots.forEach((c, i) => api.timeout(() => { if (!dead && W === w0 && ui === 'end') uiSay(c, Math.random() < 0.7 ? 16 : 17, false); }, 1800 + i * 1700 + Math.random() * 1200)); }
        };
        const uiPgRender = () => {
          const pg = endEl.querySelector('.pg'), X = uiEnd.xp;
          if (!pg) return;
          if (!X) { uiEndShowBoard(); return; }
          const a = X.a, b = X.b, p0 = a.x / a.n * 100, up = b.l > a.l;
          pg.innerHTML = `<div class="xpb"><b class="l0">${a.l}</b><i class="xb"><u class="x0" style="width:${p0}%"></u><u class="x1" style="width:${p0}%"></u><em style="left:${p0}%"></em></i><b class="l1">${a.l + 1}</b><small class="xn">${a.x}/${a.n}</small></div><div class="xl">${X.lines.map((l, i) => `<div style="animation-delay:${0.4 + i * 0.45}s"><span>${l[0]}</span><b>${l[1] ? '+' + l[1] + ' XP' : ''}</b></div>`).join('')}</div><div class="pak">${coarse ? 'Tap' : 'Press any button'} to continue</div>`;
          const w0 = W, set = (p, l0, n) => { const x1 = pg.querySelector('.x1'), em = pg.querySelector('.xb em'), xn = pg.querySelector('.xn'); if (x1) x1.style.width = p + '%'; if (em) em.style.left = p + '%'; if (xn && n) xn.textContent = n; if (l0) { pg.querySelector('.l0').textContent = l0; pg.querySelector('.l1').textContent = l0 + 1; } };
          api.timeout(() => { if (W !== w0 || ui !== 'end' || uiEnd.ph) return; set(up ? 100 : b.x / b.n * 100, 0, up ? '' : b.x + '/' + b.n); }, 450);
          if (up) api.timeout(() => {
            if (W !== w0 || ui !== 'end' || uiEnd.ph) return;
            const x0 = pg.querySelector('.x0'), x1 = pg.querySelector('.x1'), em = pg.querySelector('.xb em');
            if (x0) x0.style.width = '0%'; if (x1) { x1.style.transition = 'none'; x1.style.width = '0%'; } if (em) { em.style.transition = 'none'; em.style.left = '0%'; }
            void pg.offsetWidth; if (x1) x1.style.transition = ''; if (em) em.style.transition = '';
            set(b.x / b.n * 100, b.l, b.x + '/' + b.n); el('div', 'xlu', pg.querySelector('.xpb'), 'Level Up!'); tone(784, 0.4, 'triangle', 0.05, 1568);
          }, 2350);
        };
        const uiRankRender = () => {
          const pg = endEl.querySelector('.pg'), X = uiEnd.xp;
          if (!pg || !X) return;
          const P = X.pass, f0 = P.ta >= crTierN ? 100 : (P.p0 - (P.ta - 1) * crTierXP) / crTierXP * 100, f1 = P.tb >= crTierN ? 100 : (P.p1 - (P.tb - 1) * crTierXP) / crTierXP * 100, up = P.tb > P.ta;
          pg.innerHTML = `<div class="rk">${X.ch ? `<div class="rkc"><small>Challenge Complete</small><div><span class="ic">${uiIC[X.ch[1]]}</span><b>${X.ch[0]}</b></div></div>` : ''}<div class="rpp"><small>Rocket Pass</small><div class="rpb"><span class="ptb"><small>Tier</small><b>${P.ta}</b></span><i class="xb"><u class="x0" style="width:${f0.toFixed(1)}%"></u><u class="x1" style="width:${f0.toFixed(1)}%"></u></i><span class="ptb sm"><small>Tier</small><b>${Math.min(crTierN, P.ta + 1)}</b></span></div><div class="rpl">${P.lines.map(l => `<span>${l[0]} <b>+${l[1]}</b></span>`).join('')}<span class="tt">Total <b>+${P.tot} XP</b></span></div></div></div><div class="pak">${coarse ? 'Tap' : 'Press any button'} to continue</div>`;
          const w0 = W;
          api.timeout(() => {
            if (W !== w0 || ui !== 'end' || uiEnd.ph !== 1) return;
            const x1 = pg.querySelector('.x1'); if (x1) x1.style.width = (up ? 100 : f1).toFixed(1) + '%';
            if (up) api.timeout(() => {
              if (W !== w0 || ui !== 'end' || uiEnd.ph !== 1) return;
              const b = pg.querySelectorAll('.rpb .ptb b'); if (b[0]) b[0].textContent = P.tb; if (b[1]) b[1].textContent = Math.min(crTierN, P.tb + 1);
              const x0 = pg.querySelector('.x0'); if (x0) x0.style.width = '0%'; if (x1) { x1.style.transition = 'none'; x1.style.width = '0%'; void x1.offsetWidth; x1.style.transition = ''; x1.style.width = f1.toFixed(1) + '%'; }
              el('div', 'xlu', pg.querySelector('.rpp'), 'Tier Up!'); tone(784, 0.4, 'triangle', 0.05, 1568);
              api.timeout(() => { if (W === w0 && ui === 'end' && uiEnd.ph === 1 && uiRvQ.length && uiRvEl.hidden) uiRvShow(); }, 1100);
            }, 1700);
          }, 350);
        };
        const uiEndShowBoard = () => {
          if (uiEnd.ph === 2) return;
          uiEnd.ph = 2;
          const pg = endEl.querySelector('.pg'), ps = endEl.querySelector('.ps');
          if (pg) pg.hidden = true;
          if (!ps) return;
          ps.innerHTML = `<div class="clg"></div><div class="pqc">${[0, 1, 2, 3].map(k => `<button data-pq="${k}">${uiK(k + 1)}${esc(uiQT(4, k))}</button>`).join('')}</div><div class="pml"><div class="vt"><span>Votes <b class="vn"></b></span><i><u></u></i></div><button class="rb on" data-a="vote">Vote Rematch<em></em></button>${online ? (online.role === 'host' ? '<button class="rb" data-a="lobby">Back to Lobby</button>' : '') : '<button class="rb" data-a="ready">Ready</button>'}<button class="rb" data-a="opts">Options</button><button class="rb" data-a="exit">Exit to Main Menu</button></div><button class="hs" data-a="hide">Hide Scoreboard</button><div class="sbd"></div>`;
          ps.hidden = false;
          uiEndRefresh(); uiEndChat();
        };
        const uiEndChat = () => { const c = endEl.querySelector('.clg'); if (c) c.innerHTML = uiLog.slice(-9).map(x => `<div>${x}</div>`).join(''); };
        const uiVotes = () => {
          if (online) { const hum = uiHumans(); return [online.votes.size, Math.max(1, hum.length), online.votes.has(online.id)]; }
          const hum = W.cars.filter(c => !c.bot);
          return [uiEnd.votes.size, W.cars.length, hum.some(c => uiEnd.votes.has(c))];
        };
        const uiEndClock = () => {
          const s = Math.max(0, Math.ceil(uiEnd.cd));
          if (s === uiEnd.ck) return;
          uiEnd.ck = s;
          const n = endEl.querySelector('.nmx span'); if (n) n.innerHTML = uiDigHtml(s);
          const em = endEl.querySelector('[data-a="vote"] em'); if (em) em.textContent = online ? '' : mmss(s);
        };
        const uiEndRefresh = () => {
          if (ui !== 'end') return;
          const ps = endEl.querySelector('.ps'); if (!ps || uiEnd.ph !== 2) return;
          const [n, tot, mine] = uiVotes(), vb = ps.querySelector('[data-a="vote"]');
          ps.querySelector('.vn').textContent = n + '/' + tot; ps.querySelector('.vt u').style.width = (n / tot * 100) + '%';
          if (vb) { vb.firstChild.textContent = online ? (mine ? 'Waiting…' : 'Vote Rematch') : mine ? 'Cancel Vote' : 'Vote Rematch'; }
          const rb = ps.querySelector('[data-a="ready"]'), me = views[0].car; if (rb) rb.firstChild.textContent = me && uiEnd.ready.has(me) ? 'Not Ready' : 'Ready';
          ps.classList.toggle('hid', uiEnd.hid); ps.querySelector('.hs').textContent = uiEnd.hid ? 'Show Scoreboard' : 'Hide Scoreboard';
          const me2 = [views[0].car];
          ps.querySelector('.sbd').innerHTML = uiTeamHtml(uiEnd.win, { me: me2, mvp: uiEnd.mvp, win: uiEnd.win, titles: uiEnd.titles, ready: uiEnd.ready }) + uiTeamHtml(1 - uiEnd.win, { me: me2, mvp: uiEnd.mvp, win: uiEnd.win, titles: uiEnd.titles, ready: uiEnd.ready });
          uiEnd.ck = -1; uiEndClock();
        };
        const uiEndTick = dt => {
          if (!uiEnd.on) return;
          uiEnd.t += dt;
          if (!uiRvEl.hidden) { uiEnd.cd = Math.max(uiEnd.cd, 4); return; }
          if (uiEnd.ph === 0 && uiEnd.t > 3.9 && uiEnd.xp) { uiEnd.ph = 1; uiRankRender(); }
          if (uiEnd.ph < 2 && uiEnd.t > (uiEnd.xp && uiEnd.xp.pass.tb > uiEnd.xp.pass.ta ? 11 : 8.2)) uiEndShowBoard();
          endEl.classList.toggle('dim', uiEnd.ph < 2);
          if (online) return;
          let ch = false;
          for (const b of uiEnd.bt) {
            if (uiEnd.t > b.v && !uiEnd.votes.has(b.c)) { uiEnd.votes.add(b.c); ch = true; }
            if (uiEnd.t > b.r && !uiEnd.ready.has(b.c)) { uiEnd.ready.add(b.c); ch = true; }
          }
          if (uiEnd.votes.size >= W.cars.length) uiEnd.cd = Math.min(uiEnd.cd, 1.2);
          else if (uiEnd.ready.size >= W.cars.length) uiEnd.cd = Math.min(uiEnd.cd, 3);
          if (!uiOptEl.hidden || !uiDlg.hidden) uiEnd.cd = Math.max(uiEnd.cd, 0.5);
          uiEnd.cd -= dt;
          if (ch) uiEndRefresh(); else uiEndClock();
          if (uiEnd.cd <= 0) { uiEnd.on = false; startGame(mode); }
        };
        const uiEndAct = a => {
          if (a === 'vote') {
            if (online) { rematch(); return; }
            const hum = W.cars.filter(c => !c.bot), mine = hum.some(c => uiEnd.votes.has(c));
            for (const c of hum) { if (mine) uiEnd.votes.delete(c); else uiEnd.votes.add(c); }
            if (!mine) for (const b of uiEnd.bt) b.v = Math.min(b.v, uiEnd.t + 0.5 + Math.random() * 1.6);
            uiEndRefresh(); return;
          }
          if (a === 'ready') { const me = views[0].car; if (me) { if (uiEnd.ready.has(me)) uiEnd.ready.delete(me); else uiEnd.ready.add(me); } uiEndRefresh(); return; }
          if (a === 'opts') { uiOptOpen(null); return; }
          if (a === 'lobby') { uiLbBack(); return; }
          if (a === 'exit') { uiExitAsk(); return; }
          if (a === 'hide') { uiEnd.hid = !uiEnd.hid; uiEndRefresh(); }
        };
        api.on(endEl, 'click', e => {
          if (ui !== 'end') return;
          if (uiEnd.ph < 2) { if (!e.target.closest('.plb')) uiEndShowBoard(); return; }
          const q = e.target.closest('[data-pq]');
          if (q) { api.sfx('tap'); uiSend(views[0], 16 + +q.dataset.pq); return; }
          const b = e.target.closest('[data-a]'); if (!b) return;
          api.sfx('tap'); uiEndAct(b.dataset.a);
        });
        const uiWinner = win => {
          const mine = views[0].car;
          const wl = win ? '#ffc890' : '#a8d4ff', wg = win ? 'rgba(255,120,20,.95)' : 'rgba(50,130,255,.95)';
          uiBanAll(`<div class="wn" style="--wl:${wl};--wg:${wg}"><small>${mine ? (mine.team === win ? 'Win' : 'Loss') : '&nbsp;'}</small><em>Winner</em><b>${TEAMN[win]}</b></div>`, '', null, 3.6);
          let mvp = null; for (const c of W.cars) if (c.team === win && (!mvp || c.st.score > mvp.st.score)) mvp = c;
          const w0 = W;
          W.cars.filter(c => c.team === win).slice(0, 3).forEach((c, i) => api.timeout(() => { if (W === w0) feedMsg(`${nm(c)}<span class="ic">${uiIC.trophy}</span>`); }, 300 + i * 250));
          if (mvp) api.timeout(() => { if (W === w0) feedMsg(`${nm(mvp)}<span class="ic">${uiIC.star}</span>`); }, 1200);
        };


        let mBoost = false, mJump = false, lastPts = -1;
        const touchOn = () => { if (!wrap.classList.contains('touch')) wrap.classList.add('touch'); };
        const has = l => { for (const k of l) if (keys.has(k)) return true; return false; };
        const schemeOf = () => KS.all;
        const uiTyping = e => { const t = e.target; return !!(t && (t.tagName === 'INPUT' && t.type === 'text' || t.tagName === 'SELECT')); };
        api.on(window, 'keydown', e => {
          if (dead) return;
          audio();
          const c = e.code;
          if (uiTyping(e)) { if (c === 'Escape') e.target.blur(); return; }
          if (!uiRvEl.hidden) { e.preventDefault(); if (!e.repeat && !/^(Shift|Control|Alt|Meta|Tab)/.test(c)) uiRvNext(); return; }
          if (/^(Space|Arrow|Shift|Control|Slash|Numpad)/.test(c) || (e.ctrlKey && /^Key[WASDQEXC]$/.test(c)) || (c === 'Backspace' && ui !== 'play') || (c === 'Tab' && ui === 'play')) e.preventDefault();
          if (!uiDlg.hidden) { if (e.repeat) return; if (c === 'Escape' || c === 'Backspace') uiDlgClose(); else uiNav(uiDlg, e); return; }
          if (!uiOptEl.hidden) {
            if (e.repeat) return;
            if (c === 'Escape' || c === 'Backspace') uiOptClose();
            else if (c === 'KeyQ' || c === 'KeyE') { const i = uiTabs.findIndex(t => t[0] === uiOptTab); uiOptTab = uiTabs[(i + (c === 'KeyQ' ? uiTabs.length - 1 : 1)) % uiTabs.length][0]; uiOptRender(); uiTick(); }
            else if (c === 'KeyX') uiOptDef();
            return;
          }
          if (ui === 'title') { if (!e.repeat && !/^(Shift|Control|Alt|Meta|Tab)/.test(c)) uiGoMenu(); return; }
          if (ui === 'menu') {
            if (e.repeat && !/^Arrow/.test(c)) return;
            if (c === 'Escape' || c === 'Backspace') { uiBack(); return; }
            if (c === 'KeyV' && uiScr === 'garage') { uiTC = 1 - uiTC; uiPose(); renderMenu(); return; }
            if (uiScr === 'garage') { uiGarKey(e); return; }
            if (uiScr === 'pass') { if (/^(ArrowLeft|KeyA|ArrowRight|KeyD|ArrowUp|ArrowDown)$/.test(c)) { uiPassFocus(uiPf + (/Left|KeyA|ArrowUp/.test(c) ? -1 : 1)); uiTick(); } else if (c === 'Enter' || c === 'NumpadEnter' || c === 'Space') uiPassEquip(); return; }
            uiNav(menu, e); return;
          }
          if (ui === 'lobby') {
            if (uiLbEl.hidden || (e.repeat && !/^Arrow/.test(c))) return;
            if (c === 'Escape' || c === 'Backspace') { uiConfirm('Leave Lobby', 'Are you sure you want to leave this private match?', () => showMenu()); return; }
            uiNav(uiLbEl, e); return;
          }
          if (ui === 'end') {
            if (e.repeat) return;
            if (uiEnd.ph < 2) { if (!/^(Shift|Control|Alt|Meta)/.test(c)) uiEndShowBoard(); return; }
            const dg = /^(Digit|Numpad)([1-4])$/.exec(c);
            if (dg) { uiSend(views[0], 16 + +dg[2] - 1); return; }
            if (c === 'Escape') { uiExitAsk(); return; }
            const pml = endEl.querySelector('.pml'); if (pml) uiNav(pml, e);
            return;
          }
          if (ui === 'left') { if (!e.repeat && (c === 'Enter' || c === 'Escape')) showMenu(); return; }
          if (ui !== 'play') return;
          if (!pz.hidden) {
            if (e.repeat) return;
            if (c === 'Escape' || c === 'KeyP' || c === 'Backspace') { togglePause(); return; }
            uiNav(pz, e); return;
          }
          if (c === 'Tab') { e.preventDefault(); uiTab(true); return; }
          if (c === 'Escape' && !e.repeat && active().some(v => v.qcCat >= 0)) { for (const v of views) uiQcClose(v); return; }
          if (c === 'KeyP' && mode === 'train' && !e.repeat) { uiTrAct('shots'); return; }
          if ((c === 'KeyP' || c === 'Escape') && !e.repeat) { togglePause(); return; }
          if (e.repeat) return;
          if (mode === 'train') {
            const dt = /^(Digit|Numpad)([1-9])$/.exec(c), map = { KeyR: 'ball', KeyT: 'car', KeyB: 'boost', KeyG: 'shot' };
            if (dt) { const L = uiTrSpawns(), k = L[+dt[2] - 1]; if (k) uiTrAct('sp:' + k); return; }
            if (map[c]) { uiTrAct(map[c]); return; }
          } else {
            const dg = /^(Digit|Numpad)([1-4])$/.exec(c);
            if (dg) { uiQcKey(views[0], +dg[2] - 1); return; }
          }
          for (const v of active()) { const sc = schemeOf(v); if (sc.cam.includes(c)) setCam(v, !v.camBall); if (sc.jump.includes(c)) v.latch = true; }
        });
        api.on(window, 'keyup', e => { if (e.code === 'Tab') uiTab(false); });
        api.on(window, 'blur', () => uiTab(false));
        api.on(canvas, 'contextmenu', e => e.preventDefault());
        api.on(wrap, 'contextmenu', e => e.preventDefault());
        api.on(canvas, 'pointerdown', e => {
          audio();
          if (e.pointerType === 'touch') { touchOn(); return; }
          if (ui !== 'play' || paused) return;
          if (e.button === 0) mBoost = true;
          if (e.button === 2) { mJump = true; views[0].latch = true; }
        });
        api.on(window, 'pointerup', e => { if (e.pointerType === 'touch') return; if (e.button === 0) mBoost = false; if (e.button === 2) mJump = false; });
        api.on(uiTabEl, 'pointerdown', e => { e.preventDefault(); uiTab(false); });
        for (const v of views) {
          const T = v.T;
          if (v.pb) api.on(v.pb, 'pointerdown', e => { e.preventDefault(); e.stopPropagation(); audio(); togglePause(); });
          const camBtn = e => { e.preventDefault(); e.stopPropagation(); audio(); setCam(v, !v.camBall); };
          api.on(v.cb, 'pointerdown', camBtn); api.on(v.cbt, 'pointerdown', camBtn);
          api.on(v.qb, 'pointerdown', e => { e.preventDefault(); e.stopPropagation(); audio(); if (ui !== 'play') return; if (v.qcCat >= 0) uiQcClose(v); else uiQcOpen(v, 9); });
          api.on(v.qc, 'pointerdown', e => {
            e.preventDefault(); e.stopPropagation();
            const b = e.target.closest('[data-q]'); if (!b) return;
            const j = +b.dataset.q;
            if (v.qcCat === 9) uiQcOpen(v, j); else if (v.qcCat >= 0) { uiSend(v, v.qcCat * 4 + j); uiQcClose(v); }
          });
          api.on(v.sb, 'pointerdown', e => { if (!wrap.classList.contains('touch') || ui !== 'play') return; e.preventDefault(); e.stopPropagation(); uiTab(!uiTabOn); });
          for (const b of v.el.querySelectorAll('.trb')) api.on(b, 'pointerdown', e => { e.preventDefault(); e.stopPropagation(); audio(); if (ui === 'play' && !paused) uiTrAct(b.dataset.tr); });
          const holdBtn = (b, key) => {
            api.on(b, 'pointerdown', e => { e.preventDefault(); touchOn(); audio(); T[key] = true; if (key === 'jump') v.latch = true; b.classList.add('dn'); try { b.setPointerCapture(e.pointerId); } catch (er) {   } });
            const up = () => { T[key] = false; b.classList.remove('dn'); };
            api.on(b, 'pointerup', up); api.on(b, 'pointercancel', up); api.on(b, 'lostpointercapture', up);
          };
          holdBtn(v.el.querySelector('.tb.boost'), 'boost'); holdBtn(v.el.querySelector('.tb.jump'), 'jump'); holdBtn(v.el.querySelector('.tb.slide'), 'slide');
          const jz = v.jz, sg = () => v.flip ? -1 : 1;
          api.on(jz, 'pointerdown', e => {
            e.preventDefault(); touchOn(); audio();
            if (T.id !== null) return;
            T.id = e.pointerId; T.ox = e.clientX; T.oy = e.clientY; T.x = T.y = 0;
            const r = jz.getBoundingClientRect(), s = r.width / jz.offsetWidth || 1;
            v.joy.style.left = (v.flip ? r.right - e.clientX : e.clientX - r.left) / s + 'px'; v.joy.style.top = (v.flip ? r.bottom - e.clientY : e.clientY - r.top) / s + 'px';
            v.knob.style.transform = ''; v.joy.hidden = false;
            try { jz.setPointerCapture(e.pointerId); } catch (er) {   }
          });
          api.on(jz, 'pointermove', e => {
            if (e.pointerId !== T.id) return;
            const rr = Math.max(40, jz.getBoundingClientRect().width * 0.18);
            let dx = (e.clientX - T.ox) / rr * sg(), dy = (e.clientY - T.oy) / rr * sg();
            const l = Math.hypot(dx, dy);
            if (l > 1) { dx /= l; dy /= l; }
            T.x = dx; T.y = dy; v.knob.style.transform = `translate(${dx * 30}px,${dy * 30}px)`;
          });
          const joyUp = e => { if (e.pointerId !== T.id) return; T.id = null; T.x = T.y = 0; v.joy.hidden = true; };
          api.on(jz, 'pointerup', joyUp); api.on(jz, 'pointercancel', joyUp);
        }
        const dz = v => Math.abs(v) < 0.15 ? 0 : (v - Math.sign(v) * 0.15) / 0.85;
        const readInput = (v, k) => {
          const sc = schemeOf(v), T = v.T, m0 = v.i === 0;
          let thr = (has(sc.up) ? 1 : 0) - (has(sc.dn) ? 1 : 0), str = (has(sc.rt) ? 1 : 0) - (has(sc.lf) ? 1 : 0);
          if (T.id !== null) { thr = clamp(-dz(T.y) * 1.25, -1, 1); str = clamp(dz(T.x) * 1.25, -1, 1); }
          const slide = has(sc.slide) || T.slide;
          k.throttle = thr; k.steer = str; k.pitch = -thr;
          if (slide) { k.yaw = 0; k.roll = str; } else { k.yaw = str; k.roll = 0; }
          k.roll = clamp(k.roll + (has(sc.rr) ? 1 : 0) - (has(sc.rl) ? 1 : 0), -1, 1);
          k.boost = has(sc.boost) || (m0 && mBoost) || T.boost;
          k.jump = has(sc.jump) || (m0 && mJump) || T.jump || v.latch;
          k.slide = slide; v.latch = false;
        };


        const r1 = x => Math.round(x * 10) / 10;
        const CARK = ['car', 'a', 'b', 'scorer', 'assist'];
        const ser = e => {
          const o = {};
          for (const k in e) { const x = e[k]; if (CARK.includes(k)) o[k] = x ? W.cars.indexOf(x) : -1; else if (k === 'pad') o.pad = W.pads.indexOf(x); else if (k === 'p') o.p = [r1(x.x), r1(x.y), r1(x.z)]; else if (typeof x !== 'object' || x === null) o[k] = x; }
          if (e.type === 'end') o.st = W.cars.map(c => c.st);
          return o;
        };
        const deser = o => {
          if (!o || typeof o !== 'object' || typeof o.type !== 'string') return null;
          const e = {};
          for (const k in o) { const x = o[k]; if (CARK.includes(k)) e[k] = x >= 0 ? W.cars[x] || null : null; else if (k === 'pad') e.pad = W.pads[x] || W.pads[0]; else if (k === 'p') e.p = Array.isArray(x) ? v3(+x[0] || 0, +x[1] || 0, +x[2] || 0) : v3(); else e[k] = x; }
          return e;
        };
        const applyStats = ss => { if (Array.isArray(ss)) ss.forEach((st, i) => { if (W.cars[i] && st && typeof st === 'object') W.cars[i].st = Object.assign({}, W.cars[i].st, st); }); };
        const uiNeutral = k => { k.throttle = k.steer = k.pitch = k.yaw = k.roll = 0; k.boost = k.jump = k.slide = false; return k; };
        const uiLT = new Set(['jump', 'djump', 'dodge', 'land', 'flipreset', 'touch', 'pad']);
        const uiNetRoom = () => !!(api.net && typeof api.net.room === 'function');
        const uiNetName = s => typeof s === 'string' && s.trim() ? s.replace(/[^\w .\-!?]/g, '').trim().slice(0, 16) || null : null;
        const uiPlClean = l => (Array.isArray(l) ? l : []).filter(p => p && typeof p.id === 'string').slice(0, 6).map(p => ({ id: p.id, name: uiNetName(p.name) || 'Player', host: !!p.host }));
        const uiRoomOpts = () => ({ title: 'Rocket League', sizes: [2, 4, 6], defaultSize: 2, min: 2, max: 6, bots: true, name: saved.name });
        const leaveOnline = () => { uiLbEl.hidden = true; if (!online) return; online = null; netGen++; try { api.net.close(); } catch (e) {   } };
        const uiPing = c => {
          if (!online || !online.ids) return 0;
          const id = online.ids[W.cars.indexOf(c)];
          if (!id) return 0;
          if (online.role === 'guest' && id === online.id) return api.net.rtt || 0;
          const p = (api.net.players || []).find(x => x.id === id);
          return p ? Math.round(+p.ping || 0) : 0;
        };
        const friendLeft = (msg, ttl) => {
          if (!online) return;
          online.left = true; paused = true; ui = 'left'; uiDlgClose(); uiOptEl.hidden = true; uiLd.hidden = true; uiLbEl.hidden = true;
          pz.innerHTML = `<div class="dp pnl"><h2 class="pt">${esc(ttl || 'Disconnected')}</h2><div class="dq"><i>!</i><p>${esc(msg)}</p></div><div class="db"><button class="rb on" data-a="m">Main Menu</button></div></div>`;
          pz.hidden = false; endEl.hidden = true;
        };
        const uiLbFix = () => {
          const o = online, L = o && o.L;
          if (!L) return;
          const ids = o.pl.map(p => p.id);
          L.size = clamp(Math.max(L.bots ? Math.ceil((o.psz || 2) / 2) : 1, Math.ceil(ids.length / 2)), 1, 3);
          L.tm = {}; ids.forEach((id, i) => { L.tm[id] = i % 2; });
        };
        const uiLbRender = () => {
          const o = online;
          if (!o || ui !== 'lobby') return;
          const host = o.role === 'host', code = api.net.code ? `<span class="lbc">Party<b>${esc(api.net.code)}</b></span>` : '';
          const L = o.L, n = o.pl.length, sz = L ? uiSZ[L.size] + ' · ' + (L.bots ? 'Bots fill empty seats' : 'Players only') : '';
          uiLbEl.innerHTML = `<div class="lbx pnl"><div class="lbh"><h2 class="pt">Private Match</h2>${code}</div><div class="md">${host ? 'Starting the match' : 'Waiting for the host to start the match'} · ${n} player${n === 1 ? '' : 's'}${sz ? ' · ' + esc(sz) : ''}<i class="lbw"></i></div><div class="lbb" data-h="1"><button class="rb${coarse ? '' : ' on'}" data-la="leave">Leave</button></div></div>`;
          uiLbEl.hidden = false;
        };
        let uiLbT = 0;
        const uiLbTry = force => {
          const o = online;
          if (!o || o.role !== 'host' || ui !== 'lobby' || !o.L) return;
          if (force || o.pl.every(p => o.info[p.id])) hostStart();
        };
        const uiLbEnter = () => {
          const o = online;
          if (!o) return;
          ui = 'lobby'; mode = 'online'; paused = false; uiHideAll(); hideViews(); setLayout(false); uiShowWorld();
          Object.assign(o, { G: null, H: null, votes: new Set(), left: false, evq: [] });
          if (o.role === 'host') {
            for (const k in o.info) delete o.info[k];
            o.info[o.id] = { car: saved.car, name: saved.name, ld: uiLO(saved.car) };
            o.L = { size: 1, diff: saved.diff, len: saved.len, auto: true, bots: !!o.rb, tm: {} };
            uiLbFix();
          } else api.net.send({ t: 'hi', car: saved.car, name: saved.name, ld: uiLO(saved.car) });
          uiLbRender();
          if (o.role === 'host') { const k = ++uiLbT, w0 = o; uiLbTry(); api.timeout(() => { if (!dead && k === uiLbT && online === w0) uiLbTry(true); }, 2500); }
        };
        const uiRoomAgain = async () => {
          const o = online;
          if (!o || !uiNetRoom()) return;
          const gen = netGen;
          ui = 'lobby'; mode = 'online'; paused = false; uiHideAll(); hideViews(); setLayout(false); uiShowWorld(); uiLbEl.hidden = true;
          Object.assign(o, { G: null, H: null });
          let r = null;
          try { r = await api.net.room(uiRoomOpts()); } catch (e) { r = null; }
          if (dead || gen !== netGen || online !== o) return;
          if (!r) { online = null; showMenu(); return; }
          o.pl = uiPlClean(r.players); o.psz = clamp(r.size | 0 || o.pl.length, 2, 6); o.rb = !!r.bots;
          if (ui === 'lobby') uiLbEnter();
        };
        const uiStartMsg = () => { const o = online; return { t: 'start', mid: o.mid, size: o.L.size, diff: o.L.diff, len: o.L.len, seed: o.seed, roster: o.roster, ids: o.ids }; };
        const hostStart = () => {
          const o = online;
          if (!o || o.role !== 'host' || !o.L) return;
          uiLbFix();
          const L = o.L, roster = [], ids = [], pool = BOTNAMES.filter(n => !o.pl.some(p => p.name === n));
          for (let t = 0; t < 2; t++) {
            const hs = o.pl.filter(p => L.tm[p.id] === t);
            for (let i = 0; i < (L.bots ? L.size : Math.min(3, hs.length)); i++) {
              const p = hs[i];
              if (p) { const inf = o.info[p.id] || {}, body = BODIES[inf.car] ? inf.car : 'octane'; roster.push({ team: t, slot: i, name: uiNetName(p.name) || uiNetName(inf.name) || 'Player', body, bot: false, cos: crCosOf(crLdClean(inf.ld, body), t) }); ids.push(p.id); }
              else { const body = BODY_IDS[Math.floor(Math.random() * BODY_IDS.length)]; roster.push({ team: t, slot: i, name: pool.splice(Math.floor(Math.random() * pool.length), 1)[0] || 'Bot', body, bot: true, cos: crBotCos(t, body) }); ids.push(null); }
            }
          }
          o.mid++; o.roster = roster; o.ids = ids; o.seed = Math.floor(Math.random() * 2147483647);
          W = makeWorld({ size: Math.max(1, ...[0, 1].map(t => roster.filter(r => r.team === t).length)), diff: L.diff, len: L.len, roster, seed: o.seed });
          W.cars.forEach((c, i) => { c.cos = roster[i] && roster[i].cos || crCosOf(null, c.team); });
          const H = netHost(W);
          ids.forEach((id, i) => { if (id && id !== o.id) H.seat(id, W.cars[i]); });
          H.every = ids.filter(x => x).length > 3 ? 3 : 2;
          Object.assign(o, { H, G: null, out: [], lastK: -9, sk: 0, votes: new Set(), left: false });
          mode = 'online'; setLayout(false); uiLbEl.hidden = true;
          views[0].car = W.cars[ids.indexOf(o.id)] || null; views[1].car = null;
          startMatch(W); uiJoinLog(); beginPlay();
          api.net.send(uiStartMsg());
        };
        const guestStart = m => {
          const o = online;
          if (!o || !Array.isArray(m.roster) || !Array.isArray(m.ids) || m.roster.length !== m.ids.length || m.roster.length < 2 || m.roster.length > 6) return;
          const roster = m.roster.map(r => { const team = r && r.team ? 1 : 0, body = r && BODIES[r.body] ? r.body : 'octane'; return { team, slot: clamp((r && r.slot) | 0, 0, 2), name: uiNetName(r && r.name) || 'Player', body, bot: !!(r && r.bot), cos: crCosClean(r && r.cos, team, body) }; });
          const mi = m.ids.indexOf(o.id);
          if (mi < 0) return;
          W = makeWorld({ size: clamp(m.size | 0, 1, 3), diff: DIFF[m.diff] ? m.diff : 'pro', len: [180, 300, 600].includes(m.len) ? m.len : 300, roster, seed: Number.isFinite(m.seed) ? m.seed : undefined });
          W.cars.forEach((c, i) => { c.cos = roster[i].cos; });
          startMatch(W); W.events.length = 0;
          const me = W.cars[mi];
          Object.assign(o, { mid: m.mid, ids: m.ids.map(x => typeof x === 'string' ? x : null), roster, G: netGuest(W, me), H: null, evq: [], votes: new Set(), sent: -1, lt: -1e9, left: false });
          mode = 'online'; setLayout(false); uiLbEl.hidden = true;
          views[0].car = me; views[1].car = null;
          uiJoinLog(); beginPlay();
        };
        const uiHumans = () => online && online.ids ? online.ids.filter(x => x) : [];
        const uiVoteSync = () => {
          const o = online;
          if (!o || o.role !== 'host') return;
          const hum = uiHumans();
          for (const v of [...o.votes]) if (!hum.includes(v)) o.votes.delete(v);
          api.net.send({ t: 'vt', ids: [...o.votes] });
          if (ui === 'end') uiEndRefresh();
          if (ui === 'end' && hum.length && hum.every(id => o.votes.has(id))) hostStart();
        };
        const rematch = () => {
          const o = online;
          if (!o || o.votes.has(o.id)) return;
          o.votes.add(o.id);
          if (o.role === 'host') uiVoteSync(); else { api.net.send({ t: 'rm' }); uiEndRefresh(); }
        };
        const uiLbBack = () => { if (online && online.role === 'host') uiRoomAgain(); };
        const uiNetLeave = p => {
          const o = online;
          if (!o || o.role !== 'host' || !p || typeof p.id !== 'string') return;
          o.pl = o.pl.filter(x => x.id !== p.id); delete o.info[p.id];
          if (o.L) delete o.L.tm[p.id];
          o.votes.delete(p.id);
          const i = o.ids ? o.ids.indexOf(p.id) : -1;
          if (i >= 0 && (ui === 'play' || ui === 'end' || ui === 'left') && W.cars[i]) {
            const c = W.cars[i];
            netBot(c, true); if (o.H) o.H.unseat(p.id); o.ids[i] = null;
            const msg = `<i class="p${c.team}">${esc(c.name)}</i> left the match · a bot takes the seat`;
            if (ui === 'play') feedMsg(msg); uiLog.push(msg); if (ui === 'end') uiEndChat();
          }
          if (ui === 'lobby') { uiLbFix(); uiLbRender(); uiLbTry(); }
          if (ui === 'end') uiVoteSync();
        };
        const uiNetRejoin = p => {
          const o = online;
          if (!o || o.role !== 'host' || !p) return;
          const i = o.ids ? o.ids.indexOf(p.id) : -1;
          if (i >= 0 && o.H && (ui === 'play' || ui === 'end')) { o.H.seat(p.id, W.cars[i]); api.net.sendTo(p.id, uiStartMsg()); }
        };
        const onNet = (m, from) => {
          if (!online || !m || typeof m !== 'object' || online.left) return;
          const o = online, fid = typeof from === 'string' ? from : o.role === 'host' ? 'g' : 'h';
          if (m.t === 'qc') {
            const c = W.cars[m.c | 0];
            if (!c || isLocal(c) || !(ui === 'play' || ui === 'end') || !(m.m >= 0 && m.m < 20)) return;
            if (o.role === 'host') { if (o.ids[m.c | 0] !== fid) return; if (api.net.sendTo) for (const p of o.pl) if (p.id !== fid && p.id !== o.id) api.net.sendTo(p.id, m); }
            const cat = m.m >> 2, x = typeof m.x === 'string' && uiQCP[cat].includes(m.x) ? m.x : uiQCP[cat][m.m & 3];
            uiSay(c, m.m | 0, false, x);
            return;
          }
          if (o.role === 'host') {
            if (m.t === 'i') { if (m.m === o.mid && o.H) o.H.input(fid, m); return; }
            if (m.t === 'hi') {
              o.info[fid] = { car: BODIES[m.car] ? m.car : 'octane', name: uiNetName(m.name) || 'Player', ld: crLdClean(m.ld, BODIES[m.car] ? m.car : 'octane') };
              if (!o.room) { const p = o.pl.find(x => x.id === fid); if (p) p.name = o.info[fid].name; }
              if (ui === 'lobby') uiLbTry();
              if (o.ids && o.ids.includes(fid) && o.H && (ui === 'play' || ui === 'end')) api.net.sendTo(fid, uiStartMsg());
              return;
            }
            if (m.t === 'rm') { if (ui === 'end' && uiHumans().includes(fid)) { o.votes.add(fid); uiVoteSync(); } return; }
            return;
          }
          if (m.t === 's') { if (m.m === o.mid && o.G) { o.G.snap(m); if (Array.isArray(m.e)) for (const x of m.e) o.evq.push(x); if (m.ss) applyStats(m.ss); } return; }
          if (m.t === 'start') { guestStart(m); return; }
          if (m.t === 'vt') { o.votes = new Set(Array.isArray(m.ids) ? m.ids.filter(x => typeof x === 'string') : []); if (ui === 'end') uiEndRefresh(); }
        };
        const bindNet = () => {
          if (netBound) return;
          netBound = true;
          api.net.on('data', onNet);
          api.net.on('close', r => {
            if (!online) return;
            if (online.role === 'host') { if (!online.room) uiNetLeave({ id: 'g' }); return; }
            friendLeft(r === 'kicked' ? 'The host removed you from the lobby.' : r === 'host-left' ? 'The host left the match.' : 'The connection to the host was lost.', r === 'host-left' ? 'Host Left' : 'Disconnected');
          });
          if (uiNetRoom()) {
            api.net.on('leave', uiNetLeave);
            api.net.on('rejoin', uiNetRejoin);
            api.net.on('lobby', () => { if (online && online.role === 'guest') uiRoomAgain(); });
          }
        };
        const startOnline = async () => {
          leaveOnline(); saved.name = uiProfName() || saved.name;
          const n = api.net, gen = ++netGen;
          if (!n) { showMenu(); return; }
          bindNet();
          ui = 'lobby'; mode = 'online'; uiHideAll();
          online = { role: null, gen, room: uiNetRoom(), id: null, mid: 0, pl: [], info: {}, L: null, H: null, G: null, ids: [], roster: [], evq: [], out: [], votes: new Set(), lastK: -9, sk: 0, left: false, sent: -1, lt: -1e9, ctl: uiNeutral({}) };
          let r = null;
          try {
            if (online.room) r = await n.room(uiRoomOpts());
            else {
              const role = await n.lobby({ title: 'Rocket League · Private Match', text: 'Create a room and send the code or invite link to a friend on another device, or type their code to join.' });
              r = role === 'host' || role === 'guest' ? { role, id: role === 'host' ? 'h' : 'g', players: [{ id: 'h', name: role === 'host' ? saved.name : 'Host', host: true }, { id: 'g', name: role === 'guest' ? saved.name : 'Guest', host: false }] } : null;
            }
          } catch (e) { r = null; }
          if (dead || gen !== netGen || !online) return;
          if (!r || (r.role !== 'host' && r.role !== 'guest')) { online = null; showMenu(); return; }
          online.role = r.role; online.id = r.id; online.pl = uiPlClean(r.players); online.psz = clamp(r.size | 0 || online.pl.length, 2, 6); online.rb = !!r.bots;
          if (ui === 'lobby') uiLbEnter();
        };
        const hostSend = () => {
          const o = online;
          for (const e of W.events) o.out.push(ser(e));
          if (W.tick - o.lastK < o.H.every && W.tick >= o.lastK) return;
          o.lastK = W.tick;
          const s = o.H.snap();
          s.m = o.mid;
          if (o.out.length) s.e = o.out.splice(0);
          if (++o.sk % 30 === 0) s.ss = W.cars.map(c => c.st);
          api.net.send(s);
        };
        const guestFrame = dt => {
          const o = online, G = o.G, me = G.me, k = o.ctl, now = performance.now();
          G.rtt = clamp((api.net.rtt || 80) / 1000, 0.01, 0.6);
          G.frame(dt, () => { if (ui === 'play' && pz.hidden && uiOptEl.hidden) readInput(views[0], k); else uiNeutral(k); return netInEnc(k); }, e => {
            if (e.type === 'bounce') return true;
            if (e.car !== me || !uiLT.has(e.type)) return false;
            if (e.type === 'touch') o.lt = now;
            return true;
          });
          for (const x of o.evq) {
            const e = deser(x);
            if (!e || e.type === 'bounce') continue;
            if (e.car === me && uiLT.has(e.type) && !(e.type === 'touch' && now - o.lt > 600)) continue;
            W.events.push(e);
          }
          o.evq.length = 0;
          if (G.seq !== o.sent) { const im = G.inputs(o.mid); if (im) api.net.send(im); o.sent = G.seq; }
        };
        api.on(uiLbEl, 'click', e => {
          if (ui !== 'lobby' || !online) return;
          const b = e.target.closest('[data-la]');
          if (!b) return;
          audio(); api.sfx('tap');
          const d = b.dataset;
          if (d.la === 'leave') showMenu();
        });
