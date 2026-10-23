
(() => {
  'use strict';
  const C = Ameplay.colors;
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const HUES = ['#ff5d73', '#ffbe0b', '#3a86ff', '#26b37a', '#a855f7', '#ff8a3d', '#4cc9f0'];

  const tap = (el, sel, fn, lazy) => {
    let tch = false;
    el.addEventListener('pointerdown', e => { if (e.button) return; tch = lazy && e.pointerType === 'touch'; if (tch) return; const b = e.target.closest(sel); if (b && !b.disabled && el.contains(b)) { e.preventDefault(); fn(b, e); } });
    el.addEventListener('click', e => { if (e.detail && !tch) return; const b = e.target.closest(sel); if (b && !b.disabled && el.contains(b)) fn(b, e); });
  };
  function segBar(groups, sel, onPick) {
    const bar = document.createElement('div');
    bar.className = 'seg-bar';
    bar.innerHTML = groups.map(([k, items]) => `<div class="seg" role="group">${items.map(([v, t]) => `<button type="button" tabindex="-1" data-k="${k}" data-v="${v}">${t}</button>`).join('')}</div>`).join('');
    const sync = () => bar.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(sel[b.dataset.k] === b.dataset.v)));
    tap(bar, 'button', b => { if (sel[b.dataset.k] === b.dataset.v) return; sel[b.dataset.k] = b.dataset.v; sync(); onPick(b.dataset.k); });
    sync();
    return bar;
  }
  const segCss = (id, bg = 'var(--sunk)', on = 'var(--accent)') => `
.gm-${id} .seg-bar{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.gm-${id} .seg{display:inline-flex;flex-wrap:wrap;justify-content:center;gap:2px;padding:4px;border-radius:999px;background:${bg}}
.gm-${id} .seg button{height:32px;padding:0 14px;border:0;border-radius:999px;background:none;font:800 13px/1 var(--sans);color:var(--muted);cursor:pointer;white-space:nowrap;font-variant-numeric:tabular-nums;touch-action:manipulation}
.gm-${id} .seg button:hover{color:var(--ink)}
.gm-${id} .seg button[aria-pressed="true"]{background:#fff;color:${on};box-shadow:0 1px 2px rgba(31,29,43,.08),0 4px 12px -6px rgba(31,29,43,.4)}
.gm-${id} .gm-fx{position:absolute;left:0;top:0;z-index:30;pointer-events:none}
@media (pointer:coarse){.gm-${id} .seg button{min-height:40px}}`;
  function confetti(root, api, n = 150) {
    const w = root.clientWidth, h = Math.max(root.clientHeight, 320), dpr = Math.min(window.devicePixelRatio || 1, 2);
    const c = document.createElement('canvas');
    c.className = 'gm-fx'; c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    c.style.width = w + 'px'; c.style.height = h + 'px';
    root.append(c);
    const g = c.getContext('2d'), P = [];
    for (let i = 0; i < n; i++) {
      const s = i % 2 ? 1 : -1;
      P.push({ x: w / 2 - s * w * .42, y: h * .62, vx: s * (160 + Math.random() * 560), vy: -(380 + Math.random() * 640), z: 6 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - .5) * 14, f: Math.random() * 6, col: HUES[i % HUES.length] });
    }
    let life = 0;
    const stop = api.loop(dt => {
      life += dt;
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, c.height);
      g.globalAlpha = life > 2.3 ? Math.max(0, (2.9 - life) / .6) : 1;
      for (const p of P) {
        p.vy += 900 * dt; p.vx *= 1 - 1.3 * dt; p.vy *= 1 - .5 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; p.f += dt * 9;
        const co = Math.cos(p.r) * dpr, si = Math.sin(p.r) * dpr, k = Math.cos(p.f);
        g.setTransform(co, si, -si * k, co * k, p.x * dpr, p.y * dpr);
        g.fillStyle = p.col; g.fillRect(-p.z / 2, -p.z * .3, p.z, p.z * .6);
      }
      if (life > 2.9) { stop(); c.remove(); }
    });
  }

  const WORDS = ('the be of and a to in he have it that for they with as not on she at by this we you do but from or which one would all will ' +
    'there say who make when can more if no man out other so what time up go about than into could state only new year some take come these know ' +
    'see use get like then first any work now may such give over think most even find day also after way many must look before great back through ' +
    'long where much should well people down own just because good each those feel seem how high too place little world very still nation hand old ' +
    'life tell write become here show house both between need mean call develop under last right move thing general school never same another begin ' +
    'while number part turn real leave might want point form off child few small since against ask late home interest large person end open public ' +
    'follow during present without again hold around possible head consider word program problem however lead system set order eye plan run keep ' +
    'face fact group play stand increase early course change help line city put close case force meet once water upon build hear light live every ' +
    'country bring center let side try provide continue name certain power pay result question study woman member until far night always service ' +
    'away report something company week toward start social room figure nature though young less enough almost read include nothing yet better big ' +
    'boy cost business value second why clear expect family complete act sense mind experience art next near direct car law industry important girl ' +
    'several matter usual rather often kind among white reason action return foot care simple within love human along appear doctor believe speak ' +
    'active student month drive concern best door hope example inform body ever least probable understand reach effect different idea whole control ' +
    'condition field pass fall note special talk particular today measure walk teach low hour type carry rate remain full street easy although record ' +
    'sit determine level local sure receive thus moment spirit train college perhaps music grow free cause serve age book board recent sound office ' +
    'cut step class true history position above strong friend necessary add court deal support party whether either land material happen education ' +
    'agree arm mother across quite anything town past view society manage answer break organize half fire lose money stop actual already effort wait ' +
    'department able learn voice air together cover common subject draw short treat limit road letter color behind produce send term total rise ' +
    'century success minute remember purpose test watch situation south ago difference stage father table rest bear entire market prepare explain ' +
    'offer plant charge ground west picture hard front modern dark surface rule regard dance peace observe future wall farm claim firm further ' +
    'pressure property morning amount top outside piece sometimes beauty trade demand wonder list accept judge paint mile soon allow heart union slow ' +
    'island drop collect').split(' ');

  const QUOTES = [
    ['It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.', 'Jane Austen, Pride and Prejudice'],
    ['It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness.', 'Charles Dickens, A Tale of Two Cities'],
    ['Happy families are all alike; every unhappy family is unhappy in its own way.', 'Leo Tolstoy, Anna Karenina'],
    ['Call me Ishmael. Some years ago, never mind how long precisely, having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.', 'Herman Melville, Moby-Dick'],
    ["All the world's a stage, and all the men and women merely players; they have their exits and their entrances, and one man in his time plays many parts.", 'William Shakespeare, As You Like It'],
    ['I went to the woods because I wished to live deliberately, to front only the essential facts of life, and see if I could not learn what it had to teach.', 'Henry David Thoreau, Walden'],
    ['Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal.', 'Abraham Lincoln, Gettysburg Address'],
    ['Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do.', 'Lewis Carroll, Alice in Wonderland'],
    ['Early to bed and early to rise, makes a man healthy, wealthy, and wise.', 'Benjamin Franklin, Poor Richard'],
    ["To be, or not to be, that is the question: whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles.", 'William Shakespeare, Hamlet'],
    ['Beware; for I am fearless, and therefore powerful.', 'Mary Shelley, Frankenstein'],
    ['I am no bird; and no net ensnares me; I am a free human being with an independent will.', 'Charlotte Brontë, Jane Eyre'],
    ['Work consists of whatever a body is obliged to do, and that Play consists of whatever a body is not obliged to do.', 'Mark Twain, Tom Sawyer'],
    ['The only way to get rid of a temptation is to yield to it.', 'Oscar Wilde, The Picture of Dorian Gray'],
    ['How often have I said to you that when you have eliminated the impossible, whatever remains, however improbable, must be the truth?', 'Arthur Conan Doyle, The Sign of the Four'],
    ['Marley was dead: to begin with. There is no doubt whatever about that.', 'Charles Dickens, A Christmas Carol'],
    ['There is no charm equal to tenderness of heart.', 'Jane Austen, Emma'],
    ['The fault, dear Brutus, is not in our stars, but in ourselves, that we are underlings.', 'William Shakespeare, Julius Caesar'],
    ['Once upon a midnight dreary, while I pondered, weak and weary, over many a quaint and curious volume of forgotten lore.', 'Edgar Allan Poe, The Raven'],
    ['There is nothing either good or bad, but thinking makes it so.', 'William Shakespeare, Hamlet'],
    ['It is a far, far better thing that I do, than I have ever done; it is a far, far better rest that I go to than I have ever known.', 'Charles Dickens, A Tale of Two Cities']
  ];
  const PARAS = [
    "The morning bus was late again, so Maya decided to walk. The air was cool and the streets were quiet, except for a baker who waved as he carried trays of warm bread into his shop. By the time she reached the school gate, she had forgotten all about the bus.",
    "Learning to type well is a lot like learning to ride a bike. At first, every key feels far away and you have to think about each finger. After a few weeks of practice, your hands simply know where to go, and you can focus on what you want to say.",
    "Our class planted a small vegetable garden behind the library. We grew tomatoes, beans, carrots and a few sunflowers that grew taller than the fence. Every Friday, two students checked the soil, pulled the weeds and wrote down how much each plant had grown.",
    "The museum opens at 9:30 and closes at 5:00, but the best time to visit is just after lunch. The crowds are smaller, the guides are less busy, and you can stand in front of the old maps for as long as you like without anyone pushing past you.",
    "When the power went out, the whole street seemed to hold its breath. Then someone lit a candle, a neighbour brought out a guitar, and soon there were twenty people sitting on the steps, singing songs that nobody had heard in years.",
    "A good recipe is clear and simple. First, read it all the way through. Next, gather every ingredient before you start: flour, sugar, two eggs, butter and a pinch of salt. Finally, follow each step in order, and do not open the oven too early!",
    "Have you ever wondered why the sky is blue? Sunlight is made of many colours, and the air scatters blue light much more than red light. That scattered blue light reaches our eyes from every direction, so the whole sky seems to glow.",
    "The library has a new rule: every book must be returned within three weeks. If you need more time, you can renew it online or at the front desk. Late books cost ten cents a day, which is not much, but it adds up quickly.",
    "Tom packed his bag the night before the trip. He brought a raincoat, a map, a bottle of water, some snacks and a small notebook for drawing. His sister laughed and said he was ready for a month, not a weekend, but he did not mind.",
    "Bees are much more important than most people think. As they move from flower to flower, they carry pollen that helps plants make fruit and seeds. Without them, many of the foods we enjoy, like apples, cherries and almonds, would be hard to grow.",
    "The final match was tied at two goals each with only a minute left. Sara took a deep breath, looked at the corner of the net and kicked. The ball curled past the keeper's fingers, and the crowd jumped to its feet with a roar.",
    "Writing a short story is easier when you start with a question. What if a dog could talk? What if the moon stopped rising? Once you have a question, ask who it happens to, where it happens and what they want, and the story starts to write itself.",
    "Rivers shape the land in slow but powerful ways. Over thousands of years, flowing water carves valleys, moves rocks and carries sand to the sea. Where a river meets the ocean, it often drops that sand and builds a wide, flat delta.",
    "My grandfather keeps an old radio on the kitchen shelf. It is heavy, scratched and missing one knob, but it still works. Every Sunday morning he turns it on, finds the same station and hums along while he makes pancakes for the whole family.",
    "Please remember to bring the following items to the meeting on Tuesday: your notes from last week, a pen, and any questions you would like to discuss. We will start at 4:15 sharp and should finish before 6:00.",
    "The city decided to turn an empty parking lot into a park. Volunteers painted benches, built a playground and planted forty young trees. Today, children play football where cars used to sit, and older people meet there every evening to talk.",
    "It takes about eight minutes for light from the Sun to reach Earth. That means when you look at the Sun, you see it as it was eight minutes ago. Light from the nearest stars takes years, so the night sky is really a picture of the past.",
    "Lena was nervous on her first day at the new job. She did not know where anything was, and everyone seemed to be in a hurry. At lunch, though, a coworker asked her to join their table, and by the afternoon she felt like part of the team.",
    "Recycling only works when we sort things correctly. Paper and cardboard go in the blue bin, glass in the green one, and plastic bottles in the yellow one. Food waste can be turned into compost, which is great for gardens and parks.",
    "The storm arrived faster than anyone expected. Dark clouds rolled over the hills, the wind bent the trees, and rain hammered on the roof for hours. In the morning, the sky was clear again, and the whole valley smelled fresh and green.",
    "Good sleep is one of the simplest ways to feel better. Most teenagers need eight to ten hours a night. Turning off screens an hour before bed, keeping the room dark and going to sleep at the same time each night can make a big difference.",
    "On the island, the ferry is the only way in or out. It leaves the harbour at 7:00, 12:00 and 18:00, and it is almost always on time. When the sea is rough, the captain waits, and everyone simply has another cup of tea.",
    "The first bicycles had no pedals at all. Riders pushed themselves along with their feet, like children on a balance bike. Later, pedals were added to the front wheel, and much later came chains, gears and the comfortable bikes we ride today.",
    "If you want to remember something, try explaining it to someone else. Teaching forces you to organise your ideas, find the gaps in what you know and put things into your own words. It is one of the best ways to really learn."
  ];
  const SHIFTK = {};
  [...'!@#$%^&*()_:"<>?'].forEach((c, i) => { SHIFTK[c] = "1234567890-;',./"[i]; });
  const keyOf = ch => { const l = ch.toLowerCase(); return SHIFTK[l] || l; };

  const plain = t => t.replace(/[\u2018\u2019\u201A\u201B\u2032]/g, "'").replace(/[\u201C\u201D\u201E\u2033]/g, '"').replace(/[\u2013\u2014]/g, '-').replace(/\u00A0/g, ' ');
  const esc = c => c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c === '"' ? '&quot;' : c;
  const spark = h => {
    const n = h.length, W = 300, H = 40, w = [];
    for (let s = 0; s < n; s++) w.push((h[s] - (s >= 3 ? h[s - 3] : 0)) / Math.min(s + 1, 3) * 12);
    const max = Math.max(20, ...w) * 1.1;
    const pts = w.map((v, i) => (n > 1 ? i / (n - 1) * W : 0).toFixed(1) + ',' + (H - v / max * H).toFixed(1));
    return `<svg viewBox="0 -4 ${W} ${H + 8}" width="${W}" style="display:block;max-width:100%;height:auto;margin:0 auto 8px;overflow:visible" aria-hidden="true"><path d="M0,${H}L${pts.join('L')}L${W},${H}Z" fill="rgba(108,92,231,.14)"/><polyline points="${pts.join(' ')}" fill="none" stroke="${C.accent}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
  };

  const heat = st => {
    const rows = ['1234567890-', 'qwertyuiop', "asdfghjkl;'", 'zxcvbnm,./'], K = 24, G = 3, off = [0, 10, 16, 26], W = 11 * (K + G) + 26;
    let h = '';
    rows.forEach((r, y) => [...r].forEach((ch, x) => {
      const s = st[ch], X = off[y] + x * (K + G), Y = y * (K + G);
      const fill = !s ? '#eeecf3' : `hsl(${Math.round(145 - Math.min(1, s[1] / s[0] / .25) * 145)} 68% 47%)`;
      h += `<rect x="${X}" y="${Y}" width="${K}" height="${K}" rx="6" fill="${fill}"/><text x="${X + K / 2}" y="${Y + K / 2 + 4.5}" text-anchor="middle" font-size="12" font-weight="900" fill="${s ? '#fff' : '#b3aec0'}">${esc(ch.toUpperCase())}</text>`;
    }));
    const sp = st[' '], Y = 4 * (K + G);
    h += `<rect x="${3 * (K + G) + 16}" y="${Y}" width="${5 * (K + G) - G}" height="${K - 4}" rx="6" fill="${!sp ? '#eeecf3' : `hsl(${Math.round(145 - Math.min(1, sp[1] / sp[0] / .25) * 145)} 68% 47%)`}"/>`;
    return `<svg viewBox="0 0 ${W} ${Y + K}" width="${W}" style="display:block;max-width:100%;height:auto;margin:2px auto 8px;font-family:Nunito,system-ui,sans-serif" aria-label="Per-key accuracy">${h}</svg>`;
  };
  const TY_MODES = [['text', 'Paragraphs'], ['quotes', 'Book quotes'], ['words', 'Common words']];

  Ameplay.register({
    id: 'typing',
    title: 'Typing Test',
    category: 'Skill',
    blurb: 'Type real paragraphs with capitals and punctuation, or classic book quotes. Type fast, type clean.',
    help: 'Type the text exactly, with capitals and punctuation · <kbd>Space</kbd> next word · <kbd>Backspace</kbd> fixes the current word · <kbd>Tab</kbd> restarts',
    better: 'high',
    format: v => v + ' wpm',
    width: 900,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="17" width="52" height="31" rx="6"/><path d="M14 26h2M22 26h2M30 26h2M38 26h2M46 26h4M14 33h4M24 33h2M32 33h2M40 33h2M48 33h2"/><path d="M21 40h22" opacity=".3"/></svg>',
    css: segCss('typing', 'rgba(255,255,255,.18)') + `
.gm-typing{--fs:25px;--lh:44px;align-items:stretch;justify-content:center;gap:16px;min-height:540px;padding:clamp(14px,2.6vw,24px);border-radius:20px;background:radial-gradient(120% 100% at 50% 0%,#a58be0 0%,#7d5fcf 55%,#634aaf 100%)}
.gm-typing .seg button{color:rgba(255,255,255,.85)}
.gm-typing .seg button:hover{color:#fff}
.gm-typing .ty-top{display:flex;align-items:center;justify-content:space-between;gap:12px 20px;flex-wrap:wrap}
.gm-typing .ty-stats{display:flex;gap:10px}
.gm-typing .g-stat{min-width:74px;padding:7px 12px;border-radius:14px;background:rgba(255,255,255,.16)}
.gm-typing .g-stat .k{color:rgba(255,255,255,.75)}
.gm-typing .g-stat .v{color:#fff}
.gm-typing .g-stat .ty-time{color:#ffd166}
.gm-typing .ty-box{position:relative;padding:22px 26px;border-radius:22px;background:#fff;box-shadow:0 8px 0 rgba(50,30,110,.35)}
.gm-typing .ty-win{position:relative;height:calc(var(--lh) * 3);overflow:hidden}
.gm-typing .ty-inner{position:relative;transition:transform .16s var(--ease)}
.gm-typing .ty-words{font-family:var(--mono);font-size:var(--fs);line-height:var(--lh);font-weight:500;color:#b4afc4;transition:filter .3s var(--ease),opacity .3s var(--ease)}
.gm-typing .ty-words .w{display:inline-block;white-space:nowrap}
.gm-typing .ty-words i{font-style:normal}
.gm-typing .ty-words .ok{color:var(--ink)}
.gm-typing .ty-words .no{color:var(--bad);text-decoration-line:underline;text-decoration-thickness:2px;text-underline-offset:6px}
.gm-typing .ty-words .x{color:var(--bad);opacity:.55}
.gm-typing .ty-words .m{text-decoration-line:underline;text-decoration-thickness:2px;text-decoration-color:rgba(239,79,79,.45);text-underline-offset:6px}
.gm-typing .ty-caret{position:absolute;left:0;top:0;z-index:1;width:3px;height:calc(var(--fs) * 1.2);margin:calc((var(--lh) - var(--fs) * 1.2) / 2) 0 0 -1px;border-radius:2px;background:#ff8a3d;will-change:transform}
.gm-typing .ty-caret.idle{animation:gmTyBlink 1.1s ease-in-out infinite}
.gm-typing .ty-caret.gone{opacity:0}
@keyframes gmTyBlink{50%{opacity:0}}
.gm-typing .ty-in{position:absolute;inset:0;z-index:2;width:100%;height:100%;margin:0;padding:0;border:0;opacity:0;font-size:16px;color:transparent;background:transparent;caret-color:transparent;cursor:text;outline:none;-webkit-user-select:text;user-select:text}
.gm-typing .ty-focus{position:absolute;inset:0;display:grid;place-items:center;font-size:15px;font-weight:800;color:var(--ink-2);pointer-events:none;opacity:0;transition:opacity .3s var(--ease)}
.gm-typing .ty-box.blur .ty-words{filter:blur(5px);opacity:.55}
.gm-typing .ty-box.blur .ty-focus{opacity:1}
.gm-typing .ty-box.blur .ty-caret{opacity:0}
.gm-typing .ty-src{min-height:18px;margin:-6px 0 0;text-align:center;font-size:13px;font-weight:800;color:rgba(255,255,255,.8);font-style:italic}
.gm-typing .ty-foot{display:flex;justify-content:center;align-items:center;gap:14px;color:rgba(255,255,255,.85);font-size:13px;font-weight:700}
.gm-typing .ty-foot .g-btn{background:#fff;color:var(--accent);border-color:#fff}
.gm-typing~.g-overlay .ty-sub{display:block;font-size:12.5px;color:var(--muted);font-variant-numeric:tabular-nums}
@media (max-width:640px){.gm-typing{--fs:19px;--lh:34px;min-height:600px}.gm-typing .ty-box{padding:16px}.gm-typing .ty-stats{gap:6px}.gm-typing .g-stat{min-width:0;padding:6px 9px}.gm-typing~.g-overlay{padding:12px}.gm-typing~.g-overlay .g-ov-title{font-size:32px;margin-bottom:8px}.gm-typing~.g-overlay .g-ov-text,.gm-typing~.g-overlay .g-ov-stats{margin-bottom:12px}}
@media (pointer:coarse){.gm-typing .ty-foot span{display:none}.gm-typing .ty-foot .g-btn{height:40px}}
@media (pointer:coarse) and (max-width:640px){.gm-typing.run .seg-bar{display:none}}`,
    mount(root, api) {
      const saved = api.load() || {};
      const bests = saved.bests && typeof saved.bests === 'object' ? saved.bests : {};
      const sel = { mode: TY_MODES.some(m => m[0] === saved.mode) ? saved.mode : 'text', dur: ['15', '30', '60', '120'].includes(saved.dur) ? saved.dur : '30' };
      const persist = () => api.save({ bests, mode: sel.mode, dur: sel.dur });
      root.innerHTML = `<div class="ty-top"><div class="ty-stats"><div class="g-stat"><span class="k">Time</span><span class="v ty-time">30</span></div><div class="g-stat"><span class="k">WPM</span><span class="v ty-wpm">0</span></div><div class="g-stat"><span class="k">Accuracy</span><span class="v ty-acc">100%</span></div></div></div>
<div class="ty-box blur"><div class="ty-win"><div class="ty-inner"><span class="ty-caret"></span><div class="ty-words"></div></div></div><input class="ty-in" type="text" aria-label="Type the words here" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" inputmode="text" enterkeyhint="next"><div class="ty-focus">Click or tap here to focus</div></div>
<p class="ty-src"></p>
<div class="ty-foot"><button type="button" class="g-btn ghost sm ty-new">New text</button><span><kbd>Tab</kbd> restarts</span></div>`;
      const q = s => root.querySelector(s);
      const box = q('.ty-box'), inner = q('.ty-inner'), wordsEl = q('.ty-words'), caret = q('.ty-caret'), input = q('.ty-in'), srcEl = q('.ty-src');
      const timeEl = q('.ty-time'), wpmEl = q('.ty-wpm'), accEl = q('.ty-acc');
      q('.ty-top').append(segBar([['mode', TY_MODES], ['dur', [['15', '15 s'], ['30', '30 s'], ['60', '60 s'], ['120', '120 s']]]], sel, () => { persist(); reset(); focusIn(); }));
      let dur = 30, words, srcs, els, typed, wi, running, done, t0, keys, okKeys, corrDone, hist, kst, qBuf = [], qSrc = '', pBag = [], shift = 0, shownSec = -1, lastIn = 0, lastLive = 0, ov = false;

      const nextWord = () => {
        if (sel.mode === 'text') {
          if (!qBuf.length) {
            if (!pBag.length) { pBag = PARAS.map((_, i) => i); for (let i = pBag.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [pBag[i], pBag[j]] = [pBag[j], pBag[i]]; } }
            qBuf = PARAS[pBag.pop()].split(' ').map(w => [w, '']);
          }
          return qBuf.shift();
        }
        if (sel.mode === 'quotes') {
          if (!qBuf.length) { let qq; do qq = pick(QUOTES); while (QUOTES.length > 1 && qq[1] + qq[0] === qSrc); qSrc = qq[1] + qq[0]; qBuf = qq[0].split(' ').map(w => [w, qq[1]]); }
          return qBuf.shift();
        }
        let w;
        do w = WORDS[Math.random() * WORDS.length | 0]; while (w === words[words.length - 1]);
        return [w, ''];
      };
      const addWords = n => {
        for (let k = 0; k < n; k++) {
          const [w, src] = nextWord();
          words.push(w); srcs.push(src);
          const el = document.createElement('span');
          el.className = 'w';
          el.innerHTML = [...w].map(c => `<i>${esc(c)}</i>`).join('');
          if (els.length) wordsEl.append(' ');
          wordsEl.append(el); els.push(el);
        }
      };
      const paint = i => {
        const w = words[i], t = typed[i] || '';
        let h = '';
        for (let j = 0; j < Math.max(w.length, t.length); j++) {
          if (j >= w.length) h += `<i class="x">${esc(t[j])}</i>`;
          else if (j >= t.length) h += i < wi ? `<i class="m">${esc(w[j])}</i>` : `<i>${esc(w[j])}</i>`;
          else h += `<i class="${t[j] === w[j] ? 'ok' : 'no'}">${esc(w[j])}</i>`;
        }
        els[i].innerHTML = h;
      };
      const correctOf = i => {
        const w = words[i], t = typed[i] || '';
        let c = 0;
        for (let j = 0; j < Math.min(w.length, t.length); j++) if (t[j] === w[j]) c++;
        return c;
      };
      const correctNow = () => corrDone + correctOf(wi);
      const caretTo = () => {
        const el = els[wi];
        if (!el) return;
        const t = typed[wi], L = el.children;
        let x;
        if (t.length < words[wi].length) x = L[t.length].offsetLeft;
        else { const l = L[L.length - 1]; x = l.offsetLeft + l.offsetWidth; }
        const y = el.offsetTop, lh = el.offsetHeight || 1, s = Math.max(0, Math.round(y / lh) - 1) * lh;
        caret.style.transform = `translate(${x}px,${y}px)`;
        if (s !== shift) { shift = s; inner.style.transform = `translateY(${-s}px)`; }
        const src = srcs[wi];
        if (srcEl.dataset.s !== src) { srcEl.dataset.s = src; srcEl.textContent = src ? 'from ' + src : ''; }
      };
      const setBlur = () => box.classList.toggle('blur', document.activeElement !== input && !done);
      const updAcc = () => { accEl.textContent = (keys ? Math.round(okKeys / keys * 100) : 100) + '%'; };
      const reset = () => {
        dur = +sel.dur;
        words = []; srcs = []; els = []; typed = ['']; wi = 0; running = false; done = false; qBuf = []; root.classList.remove('run');
        keys = okKeys = corrDone = 0; hist = []; kst = {}; shownSec = -1;
        wordsEl.textContent = ''; addWords(90);
        inner.style.transition = 'none';
        shift = 0; inner.style.transform = '';
        caretTo();
        void inner.offsetWidth;
        inner.style.transition = '';
        timeEl.textContent = dur; wpmEl.textContent = '0'; updAcc();
        input.value = ''; input.disabled = false;
        caret.classList.remove('gone');
        setBlur();
      };
      const focusIn = () => { if (done || ov) return; input.disabled = false; input.focus({ preventScroll: true }); setBlur(); };
      const commit = () => {
        const t = typed[wi], w = words[wi];
        corrDone += correctOf(wi) + (t === w ? 1 : 0);
        keys++; if (t === w) okKeys++;
        const st = kst[' '] || (kst[' '] = [0, 0]); st[0]++; if (t !== w) st[1]++;
        wi++; typed[wi] = '';
        paint(wi - 1);
        if (els.length - wi < 30) addWords(40);
      };
      const finish = () => {
        running = false; done = true; root.classList.remove('run');
        input.disabled = true; input.value = '';
        caret.classList.add('gone'); setBlur();
        while (hist.length < dur) hist.push(correctNow());
        const c = correctNow(), m = dur / 60, net = Math.round(c / 5 / m), raw = Math.round(keys / 5 / m);
        const acc = keys ? Math.round(okKeys / keys * 100) : 0, chart = spark(hist), map = heat(kst);
        timeEl.textContent = '0'; wpmEl.textContent = net; updAcc();
        api.score(net);
        const k = sel.mode + '|' + dur, prev = bests[k] || 0;
        if (net > prev) { bests[k] = net; persist(); }
        const nb = net > 0 && api.submit(net);
        api.sfx(nb ? 'win' : 'good');
        if (nb || (prev && net > prev)) confetti(root, api);
        api.timeout(() => {
          if (!done) return;
          ov = true;
          api.overlay({
            kicker: nb ? 'New best!' : `${TY_MODES.find(x => x[0] === sel.mode)[1]} · ${dur} s`,
            title: net + ' wpm',
            text: chart + map + `<span class="ty-sub">Key accuracy: green clean, red often missed · ${keys - okKeys} errors</span>`,
            stats: [['Raw', raw], ['Accuracy', acc + '%'], ['Mode best', Math.max(prev, net)]],
            button: 'Try again',
            onAction: () => { ov = false; reset(); focusIn(); }
          });
        }, 500);
      };

      input.addEventListener('input', () => {
        if (ov || done) { input.value = ''; return; }
        let v = plain(input.value), cap;
        for (;;) {
          const sp = v.indexOf(' '), head = sp < 0 ? v : v.slice(0, sp);
          const w = words[wi], old = typed[wi];
          cap = head.slice(0, w.length + 10);
          let k = 0;
          while (k < old.length && k < cap.length && old[k] === cap[k]) k++;
          if (cap.length > k && !running) { running = true; t0 = performance.now(); root.classList.add('run'); }
          for (let j = k; j < cap.length; j++) {
            const ok = cap[j] === w[j], key = j < w.length ? keyOf(w[j]) : ' ', st = kst[key] || (kst[key] = [0, 0]);
            keys++; st[0]++;
            if (ok) okKeys++; else st[1]++;
          }
          typed[wi] = cap;
          paint(wi);
          if (sp < 0) break;
          v = v.slice(sp + 1);
          if (cap.length) commit();
        }
        if (input.value !== cap) input.value = cap;
        caretTo(); updAcc();
        lastIn = performance.now();
      });
      input.addEventListener('keydown', e => {
        if (e.key === 'Escape') { e.preventDefault(); input.blur(); document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); }
        else if (e.key === 'Tab') { e.preventDefault(); reset(); focusIn(); }
        else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) e.preventDefault();
      });
      const toEnd = () => { const n = input.value.length; try { input.setSelectionRange(n, n); } catch (_) { } };
      input.addEventListener('pointerdown', () => focusIn());
      root.addEventListener('click', () => focusIn());
      input.addEventListener('click', toEnd);
      input.addEventListener('focus', () => { toEnd(); setBlur(); });
      input.addEventListener('blur', setBlur);
      api.on(window, 'keydown', e => {
        if (ov || done || document.activeElement === input || e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key && e.key.length === 1 && e.key !== ' ') focusIn();
      });
      tap(q('.ty-foot'), '.ty-new', () => { reset(); focusIn(); });
      api.on(window, 'resize', () => caretTo());
      if (document.fonts) document.fonts.ready.then(() => { if (api.alive) caretTo(); });

      let lastTick = 0;
      api.loop(() => {
        const now = performance.now(), gap = lastTick ? now - lastTick : 0;
        lastTick = now;
        if (running && gap > 400) t0 += gap;
        caret.classList.toggle('idle', !running || now - lastIn > 650);
        if (!running) return;
        const el = (now - t0) / 1000;
        while (hist.length < Math.min(dur, Math.floor(el))) hist.push(correctNow());
        const sec = Math.max(0, Math.ceil(dur - el));
        if (sec !== shownSec) timeEl.textContent = shownSec = sec;
        if (el > 1 && now - lastLive > 300) { lastLive = now; wpmEl.textContent = Math.round(correctNow() / 5 / (el / 60)); }
        if (el >= dur) finish();
      });

      reset();
      ov = true;
      api.overlay({
        kicker: 'Skill', title: 'Typing Test',
        text: 'Type real paragraphs, capitals and punctuation included, or classic book quotes or common words, for 15 to 120 seconds. Every letter turns green or red as you type, with live speed and accuracy. The clock starts on your first key, and at the end you get a per-key accuracy map.',
        button: 'Play', onAction: () => { ov = false; focusIn(); }
      });
    }
  });

})();

