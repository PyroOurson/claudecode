(() => {
  'use strict';

  const ROLE = {
    villager: { n: 'Villager', team: 'village', c: '#7cb342', d: 'No special power. Find the werewolves in the day discussion and vote them out.' },
    werewolf: { n: 'Werewolf', team: 'wolves', c: '#c0392b', d: 'Each night the pack picks one villager to devour. Chat privately with your pack and blend in by day.' },
    alpha: { n: 'Alpha Werewolf', team: 'wolves', c: '#8e1f2f', d: 'Leads the pack. Once per game, bite instead of kill: the victim becomes a werewolf. The Seer sees a plain Werewolf.' },
    seer: { n: 'Seer', team: 'village', c: '#7e57c2', d: 'Each night, inspect one player and learn their exact role.' },
    doctor: { n: 'Doctor', team: 'village', c: '#26a69a', d: 'Each night, protect one player from the werewolves. Never the same player twice in a row; you may protect yourself once.' },
    witch: { n: 'Witch', team: 'village', c: '#8e44ad', d: 'One healing potion saves tonight\'s victim, one poison kills anyone. Each can be used once per game.' },
    hunter: { n: 'Hunter', team: 'village', c: '#e67e22', d: 'When you die, for any reason, you shoot one player and take them with you.' },
    bodyguard: { n: 'Bodyguard', team: 'village', c: '#3f6fb5', d: 'Each night, guard another player. If the werewolves attack them, you die in their place.' },
    jester: { n: 'Jester', team: 'solo', c: '#e91e8c', d: 'You win if the village lynches you. Act suspicious, but not too suspicious. The game goes on for everyone else.' },
    cupid: { n: 'Cupid', team: 'village', c: '#ec407a', d: 'On the first night, link two players as lovers. When one dies, the other dies of heartbreak. A wolf and villager couple wins only as the last two alive.' },
    littlegirl: { n: 'Little Girl', team: 'village', c: '#d84315', d: 'You secretly read the werewolves\' night chat, but you never see who is speaking.' }
  };
  const RKEYS = Object.keys(ROLE);
  const TEAM = { village: 'Village', wolves: 'Werewolves', solo: 'Solo' };
  const isWolf = r => r === 'werewolf' || r === 'alpha';
  const CAUSE = { wolves: 'was killed by the werewolves', poison: 'was poisoned', lynch: 'was lynched', hunter: 'was shot by the Hunter', heartbreak: 'died of a broken heart', guard: 'died protecting someone' };
  const SPECIALS = ['seer', 'doctor', 'hunter', 'witch', 'bodyguard', 'jester', 'cupid', 'littlegirl'];
  const NAMES = ['Aria', 'Bram', 'Cleo', 'Dax', 'Elin', 'Finn', 'Gwen', 'Hugo', 'Iris', 'Jonas', 'Kira', 'Leo', 'Mina', 'Nico', 'Olga', 'Pablo', 'Quinn', 'Rosa', 'Sven', 'Tara', 'Uma', 'Vik', 'Wren', 'Xavi', 'Yara', 'Zed', 'Ivy', 'Otto', 'Lena', 'Milo', 'Nora', 'Ravi'];
  const SPEED = { Fast: { night: 20, disc: 30, vote: 20 }, Normal: { night: 30, disc: 45, vote: 30 }, Slow: { night: 40, disc: 90, vote: 40 } };

  const wolvesFor = n => Math.max(1, Math.round(n / 4.2));
  function autoRoles(n) {
    const w = wolvesFor(n), rest = n - w, v = Math.max(1, Math.round(rest * 0.3)), k = Math.min(SPECIALS.length, rest - v);
    const out = [];
    for (let i = 0; i < w; i++) out.push(i === 0 && w >= 3 ? 'alpha' : 'werewolf');
    for (let i = 0; i < k; i++) out.push(SPECIALS[i]);
    while (out.length < n) out.push('villager');
    return out;
  }
  function customRoles(n, cnt) {
    const out = [];
    for (const r of RKEYS) if (r !== 'villager') for (let i = 0; i < (cnt[r] | 0); i++) out.push(r);
    if (!out.some(isWolf)) return autoRoles(n);
    while (out.length > n) {
      const j = out.findIndex(r => !isWolf(r) && r !== 'villager');
      if (j < 0) break;
      out.splice(j, 1);
    }
    if (out.length > n) out.length = n;
    while (out.length < n) out.push('villager');
    return out;
  }
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const rnd = (a, b) => a + Math.random() * (b - a);

  const L = {
    hello: () => ['Hello everyone!', 'Good morning, village.', 'Okay, who has information?', 'No clues yet. Let us listen carefully.', 'Anyone want to claim a role?', 'Morning all. Let us be careful today.', 'Alright, talk to me. Who saw something?', 'First day, so nothing to go on. Speak up, everyone.', 'Hi! Please do not vote on a coin flip.', 'Let us hear from everybody before we vote.', 'Quiet start. Who wants to go first?', 'I am listening. Convince me.'],
    idle: () => ['I am just a villager.', 'Let us not rush into a vote.', 'I do not have anything yet.', 'Who is quiet? Wolves usually are.', 'Think about who accused whom.', 'Watch how people vote today, it says a lot.', 'I would rather skip than lynch a villager.', 'Has anyone noticed who keeps changing their story?', 'Be careful about bandwagons.', 'Somebody here is lying to us.', 'If nobody has proof, I will not vote someone random.', 'Let us compare what everyone said last night and today.', 'The wolves want us to fight each other.', 'I keep an eye on whoever pushes too hard.'],
    sus: s => [`I am suspicious of ${s}.`, `${s} is my main suspect.`, `I think ${s} might be a werewolf.`, `Something is off about ${s}.`, `${s}, care to explain yourself?`, `${s} has been too quiet for my taste.`, `Does anyone else find ${s} fishy?`, `My gut says ${s}.`, `I would look closely at ${s}.`, `${s} dodged a question earlier. Just saying.`, `Why has ${s} not said anything useful?`, `If I had to pick right now, it would be ${s}.`],
    dead: d => [`Poor ${d}. The wolves are among us.`, `We lost ${d}. Let us be smart today.`, `${d} did not deserve that. Find the wolves.`, `Rest in peace, ${d}. Who benefits from this?`, `${d} is gone. Think about who wanted that.`, `Losing ${d} hurts. We cannot waste today's vote.`],
    push: t => [`${t} feels off to me. Anyone else?`, `I am suspicious of ${t}.`, `Has ${t} said anything useful? Not really.`, `I do not like how ${t} talks.`, `Let us look at ${t} today.`, `${t} keeps dodging. Vote ${t}?`, `Funny how ${t} always agrees with the crowd.`, `I would start with ${t}.`],
    defW: a => ['Me? Come on, I am just a villager!', `That's a stretch, ${a}. Look elsewhere.`, 'Why me? I have been helpful all day!', `${a}, you are throwing names around with no proof.`, 'I have done nothing wrong. Check the quiet ones.', `Funny that ${a} points at me so fast.`, 'You are wasting a vote on me, and the wolves love it.', 'Seriously? Think about who gains from this.'],
    defV: a => ['It is not me! I am a villager.', `${a}, why do you say that? I am innocent.`, 'I am with the village, I swear!', `What did I do, ${a}? Give me one reason.`, 'Lynching me helps the wolves. Please think.', `I will answer anything, ${a}. Ask me.`, 'I have been on your side since the start.', 'Wrong target. I want the wolves gone as much as you.'],
    counter: a => [`Interesting that ${a} is the one accusing me.`, `Why is ${a} so eager? Look at ${a}.`, `If anyone is acting strange, it is ${a}.`],
    vote: t => [`I vote ${t}.`, `${t} for me.`, `Voting ${t}.`, `My vote goes to ${t}.`, `Sorry ${t}, it is you.`, `${t}. Final answer.`, `Going with ${t}.`],
    hunter: () => ['Careful, I am the Hunter. Lynch me and I take someone with me.', 'Just so you know, I am the Hunter. Think before you vote me.'],
    jester: () => ['I have a feeling about someone, but I am not sure yet.', 'Hmm, I do not trust the quiet ones.', 'Someone here is hiding something.', 'Honestly I am just trying to read the room.', 'Do not look at me, I just got here.'],
    bait: () => ['Vote me, I dare you. What could go wrong?', 'I am definitely the wolf. Totally. Trust me.', 'Honestly I want to be lynched, it is boring here.', 'Lynch me, I will make it worth your while.', 'Kill me now, I am the wolf, obviously.', 'Go on, vote me. You know you want to.'],
    wary: j => [`${j} is begging to be lynched. That smells like a Jester. Ignore them.`, `Do not fall for ${j}. Nobody confesses that loudly unless they are the Jester.`, `${j} wants the rope. Let us not hand it over.`],
    believe: (f, t) => [`Thanks ${f}. I will vote ${t}.`, `That is useful, ${f}. ${t} is my target now.`, `If ${f} is the Seer, ${t} is done.`, `Good to hear it, ${f}. ${t}, any defence?`],
    doubt: f => [`Prove it, ${f}. Anyone else claim Seer?`, `${f} claims Seer. Hmm. Let us see who backs that.`, `A Seer claim is easy to make, ${f}.`, `I want to hear a second opinion on ${f}.`],
    clear: (f, t) => [`Good to know ${t} is clean, ${f}.`, `Noted, ${f}. ${t} is safe.`, `So ${t} is not a wolf. That narrows it down.`],
    agree: (f, j) => [`I agree with ${f} about ${j}.`, `${f} has a point about ${j}.`, `I was thinking the same about ${j}.`],
    wolfAgree: () => ['Agreed.', 'Good choice.', 'Fine by me.', 'Let us do it.', 'Works for me.', 'Same here.'],
    last: w => w ? ['I am innocent. You are making a mistake.', 'Fine. But you will regret this, villagers.', 'You got it wrong. Enjoy the next night.', 'Remember this when the sun sets.'] : ['I am a villager. You are making a terrible mistake.', 'Please, think about who pushed this vote.', 'I forgive you all. Watch each other carefully.', 'I hope you find them. Goodbye.', 'Look at who voted first. That is your wolf.']
  };

  const JW = [0.8, 0.65];
  function Game(cfg) {
    const S = cfg.snap ? JSON.parse(cfg.snap) : null;
    const n = S ? S.P.length : cfg.roles.length;
    const P = S ? S.P : cfg.roles.map((r, i) => ({ i, name: cfg.names[i], role: r, alive: true, bot: !!cfg.bots[i], av: cfg.avs[i], lover: -1, cause: '', mem: null }));
    const G = { n, P, T: cfg.T, phase: 'deal', day: 0, t: 0, dl: 0, dur: 0, chat: [], vt: [], skip: {}, N: null, over: null, defd: -1, lyn: -1, hq: [], hunter: -1, cont: '', tq: [], doc: { last: -1, self: false }, wit: { heal: true, poison: true }, bite: true, jw: -1, dirty: true, rs: {}, sent: {}, rate: {}, comp: {}, voteLog: [], lastVoters: [], push: -1, ver: 0 };
    if (S) { Object.assign(G, S.G, { P, tq: [], rs: {}, sent: {}, dirty: true }); G.vt = Array.from(G.vt, x => (x === null ? undefined : x)); }
    else P.forEach(p => { G.comp[p.role] = (G.comp[p.role] || 0) + 1; });
    const alive = () => P.filter(p => p.alive);
    const humansAlive = () => P.some(p => p.alive && !p.bot);
    const dirty = () => { G.dirty = true; };
    const later = (ms, fn) => { G.tq.push({ at: G.t + ms, ph: G.phase, day: G.day, fn }); };
    const initMem = p => { p.mem = { sus: Array(n).fill(0).map(() => Math.random() * 0.2), known: {}, claim: {}, said: 0, inspected: {}, defended: -1 }; };
    P.forEach(p => { if (p.bot && !p.mem) initMem(p); });

    function setPhase(ph, secs) {
      G.phase = ph; G.tq = [];
      const f = humansAlive() || ph === 'deal' ? 1 : 0.25;
      G.dur = secs * 1000 * f; G.dl = G.t + G.dur; dirty();
    }
    function say(ch, f, x, to, m) {
      const e = { i: G.chat.length, ch, f, x, to: to || null, d: G.day, m: m || null };
      G.chat.push(e); dirty();
      if (ch === 'day' || ch === 'last') hear(e);
      return e;
    }
    const sys = (x, to) => say('sys', -1, x, to);
    const nm = i => P[i].name;

    function kill(i, cause) {
      const p = P[i];
      if (!p.alive) return;
      p.alive = false; p.cause = cause; p.dday = G.day; G.rs[i] = 1;
      if (p.role === 'hunter') G.hq.push(i);
      P.forEach(b => { if (b.bot && b.mem) b.mem.known[i] = p.role; });
      if (p.lover >= 0 && P[p.lover].alive) {
        sys(`${nm(p.lover)} cannot live without ${nm(i)}...`);
        kill(p.lover, 'heartbreak');
      }
      dirty();
    }

    function winCheck() {
      const a = alive(), w = a.filter(p => isWolf(p.role));
      if (!a.length) return { team: 'draw', win: [] };
      if (a.length === 2 && a[0].lover === a[1].i && isWolf(a[0].role) !== isWolf(a[1].role)) return { team: 'lovers', win: [a[0].i, a[1].i] };
      if (!w.length) return { team: 'village', win: P.filter(p => !isWolf(p.role) && p.role !== 'jester').map(p => p.i) };
      if (w.length >= a.length - w.length) return { team: 'wolves', win: P.filter(p => isWolf(p.role)).map(p => p.i) };
      return null;
    }
    function finish(w) {
      if (G.jw >= 0 && !w.win.includes(G.jw)) w.win = w.win.concat(G.jw);
      G.over = w; setPhase('over', 3600);
      const t = { village: 'The village wins!', wolves: 'The werewolves win!', lovers: 'The lovers win!', draw: 'Nobody is left. It is a draw.' }[w.team];
      sys(t);
      if (G.jw >= 0) sys(`${nm(G.jw)} the Jester also wins!`);
    }
    function after(cont) {
      const w = winCheck();
      if (w) return finish(w);
      if (G.hq.length) {
        G.hunter = G.hq.shift(); G.cont = cont; setPhase('hunter', 15);
        sys(`${nm(G.hunter)} is the Hunter and takes aim...`);
        if (P[G.hunter].bot) later(rnd(2000, 5000), () => botShoot(G.hunter));
        return;
      }
      if (cont === 'discuss') startDiscuss(); else startNight();
    }

    function startNight() {
      G.day++; G.N = { wv: {}, bite: false, guard: -1, heal: -1, save: false, poison: -1, seer: -1, cp: null, done: {} };
      setPhase('night', G.day === 1 ? G.T.night + 6 : G.T.night);
      sys(`Night ${G.day} has started.`);
      Object.keys(G.rs).forEach(k => { G.rs[k] = 1; });
      P.forEach(p => { if (p.alive && p.bot) botNight(p); });
      wolfChatBots();
    }
    function wolfTarget() {
      const N = G.N; if (!N) return -1;
      const ws = P.filter(p => p.alive && isWolf(p.role));
      const cnt = {};
      ws.forEach(w => { const t = N.wv[w.i]; if (t >= 0 && P[t].alive) cnt[t] = (cnt[t] || 0) + 1; });
      let best = -1, bc = 0;
      ws.forEach(w => { const t = N.wv[w.i]; if (t >= 0 && cnt[t] > bc) { bc = cnt[t]; best = t; } });
      return best;
    }
    function ctl(q) {
      const p = P[q];
      if (!p.alive || G.phase !== 'night') return null;
      const N = G.N, done = !!N.done[q], al = alive().map(x => x.i), o = al.filter(i => i !== q);
      switch (p.role) {
        case 'werewolf': case 'alpha':
          return { k: 'wolf', valid: al.filter(i => !isWolf(P[i].role)), t: q in N.wv ? N.wv[q] : -2, bite: p.role === 'alpha' && G.bite ? (N.bite ? 2 : 1) : 0, done };
        case 'seer': return { k: 'seer', valid: o, t: N.seer, done };
        case 'doctor': return { k: 'doctor', valid: al.filter(i => i !== G.doc.last && (i !== q || !G.doc.self)), t: N.heal, done };
        case 'bodyguard': return { k: 'guard', valid: o, t: N.guard, done };
        case 'witch': return { k: 'witch', valid: o, heal: G.wit.heal, poison: G.wit.poison, victim: wolfTarget(), save: N.save, pt: N.poison, done };
        case 'cupid': return G.day === 1 ? { k: 'cupid', valid: al, sel: N.cp || [], done } : null;
      }
      return null;
    }
    function checkNightDone() {
      if (G.phase !== 'night') return;
      const N = G.N;
      const acts = alive().filter(p => ctl(p.i));
      const ws = acts.filter(p => isWolf(p.role));
      const ts = new Set(ws.map(w => N.wv[w.i]).filter(t => t >= 0));
      if (acts.every(p => N.done[p.i]) && ts.size <= 1 && G.dl - G.t > 1600) { G.dl = G.t + 1500; dirty(); }
    }

    function resolveNight() {
      const N = G.N, T = wolfTarget();
      let converted = -1;
      const seer = P.find(p => p.alive && p.role === 'seer');
      if (seer && N.seer >= 0) {
        const t = P[N.seer], r = t.role === 'alpha' ? 'werewolf' : t.role;
        sys(`${t.name} is a ${ROLE[r].n}.`, [seer.i]);
        if (seer.bot) seer.mem.inspected[t.i] = r;
        if (seer.bot) { seer.mem.known[t.i] = r; seer.mem.sus[t.i] = isWolf(r) ? 9 : -9; }
      }
      const doc = P.find(p => p.alive && p.role === 'doctor');
      if (doc) { if (N.heal >= 0) { G.doc.last = N.heal; if (N.heal === doc.i) G.doc.self = true; } else G.doc.last = -1; }
      const wit = P.find(p => p.alive && p.role === 'witch');
      let witSave = false;
      if (wit && N.save && G.wit.heal && T >= 0) { witSave = true; G.wit.heal = false; }
      const dead = [];
      if (T >= 0) {
        const bg = P.find(p => p.alive && p.role === 'bodyguard' && N.guard === T);
        if (N.heal === T) { if (doc) sys(`You protected ${nm(T)} from the werewolves.`, [doc.i]); }
        else if (witSave) { if (wit) sys(`Your potion saved ${nm(T)}.`, [wit.i]); }
        else if (bg) { dead.push([bg.i, 'guard']); sys(`${nm(T)} was attacked, but you gave your life for them.`, [bg.i]); }
        else if (N.bite && G.bite && !isWolf(P[T].role)) {
          converted = T; G.bite = false;
        } else dead.push([T, 'wolves']);
      }
      if (wit && N.poison >= 0 && G.wit.poison && P[N.poison].alive) { G.wit.poison = false; if (!dead.some(d => d[0] === N.poison)) dead.push([N.poison, 'poison']); }
      if (converted >= 0) {
        const c = P[converted], old = c.role;
        c.role = 'werewolf'; G.rs[converted] = 1; P.forEach(p => { if (isWolf(p.role)) G.rs[p.i] = 1; });
        if (c.bot) { initMem(c); }
        sys(`The Alpha bit you. You are now a Werewolf, no matter what you were (${ROLE[old].n}).`, [converted]);
        P.filter(p => isWolf(p.role) && p.i !== converted).forEach(w => sys(`${c.name} was turned into a werewolf.`, [w.i]));
      }
      dead.forEach(([i, c]) => kill(i, c));
      setPhase('dawn', 5);
      sys(`Day ${G.day} has started.`);
      if (!dead.length) sys('Nobody died last night.');
      else dead.forEach(([i, c]) => { if (!P[i].alive) sys(`${nm(i)} ${CAUSE[c]}. They were a ${ROLE[P[i].role].n}.`); });
      P.filter(p => !p.alive && p.cause === 'heartbreak' && p.dday === G.day && !dead.some(d => d[0] === p.i)).forEach(p => sys(`${p.name} ${CAUSE.heartbreak}. They were a ${ROLE[p.role].n}.`));
      P.forEach(b => { if (b.bot && b.alive) { b.mem.said = 0; if (converted >= 0 && b.i === converted) b.mem.sus.fill(0); } });
    }

    function startDiscuss() {
      G.skip = {}; setPhase('discuss', G.T.disc);
      P.forEach(b => { if (b.bot && b.alive) botTalk(b); });
    }
    function startVote() {
      G.vt = []; G.voteLog = []; setPhase('vote', G.T.vote);
      sys('Voting has started. Choose who to lynch.');
      P.forEach(b => { if (b.bot && b.alive) botVote(b); });
    }
    function endVote() {
      const a = alive(), cnt = {};
      let voted = 0;
      a.forEach(p => { const t = G.vt[p.i]; if (t >= 0 && P[t].alive) { cnt[t] = (cnt[t] || 0) + 1; voted++; } });
      let best = -1, bc = 0, tie = false;
      Object.keys(cnt).forEach(k => { if (cnt[k] > bc) { bc = cnt[k]; best = +k; tie = false; } else if (cnt[k] === bc) tie = true; });
      G.lastVoters = a.map(p => p.i).filter(i => G.vt[i] >= 0).map(i => [i, G.vt[i]]);
      G.lyn = -1;
      if (best >= 0 && !tie && voted * 2 >= a.length) {
        G.defd = best;
        sys(`${nm(best)} received the most votes (${bc}) and is brought to the gallows. Any last words?`);
        setPhase('defense', 10);
        if (P[best].bot) later(rnd(1500, 4000), () => botLast(P[best]));
      } else {
        sys(tie ? 'The vote is tied. Nobody is lynched.' : voted * 2 < a.length ? 'Not enough players voted. Nobody is lynched.' : 'Nobody is lynched.');
        learnVotes(-1);
        setPhase('exec', 3);
      }
    }
    function reportHeart(before) {
      P.forEach(q => { if (before[q.i] && !q.alive && q.cause === 'heartbreak') sys(`${q.name} ${CAUSE.heartbreak}. They were a ${ROLE[q.role].n}.`); });
    }
    function execute() {
      const i = G.defd; G.lyn = i; G.defd = -1;
      const p = P[i], before = P.map(x => x.alive);
      kill(i, 'lynch');
      sys(`${p.name} was lynched. They were a ${ROLE[p.role].n}.`);
      reportHeart(before);
      if (p.role === 'jester') { G.jw = i; sys(`${p.name} was the Jester and wins! The game goes on.`); }
      learnVotes(i);
      setPhase('exec', 4.5);
    }
    function learnVotes(i) {
      if (i < 0) return;
      const wolf = isWolf(P[i].role);
      P.forEach(b => {
        if (!b.bot || !b.alive || isWolf(b.role)) return;
        G.lastVoters.forEach(([v, t]) => { if (t === i && v !== b.i) b.mem.sus[v] += wolf ? -0.6 : 0.7; });
      });
    }
    function hunterShot(t) {
      const before = P.map(x => x.alive);
      kill(t, 'hunter');
      sys(`${nm(G.hunter)} shot ${nm(t)}. ${nm(t)} was a ${ROLE[P[t].role].n}.`);
      reportHeart(before);
      setPhase('hshot', 4);
    }

    function advance() {
      switch (G.phase) {
        case 'deal': startNight(); break;
        case 'night': resolveNight(); break;
        case 'dawn': after('discuss'); break;
        case 'discuss': startVote(); break;
        case 'vote': endVote(); break;
        case 'defense': execute(); break;
        case 'exec': after('night'); break;
        case 'hunter': sys(`${nm(G.hunter)} hesitates and shoots nobody.`); setPhase('hshot', 2); break;
        case 'hshot': after(G.cont); break;
      }
    }

    function chatOK(q, ch) {
      const p = P[q], ph = G.phase;
      if (ph === 'over') return ch === 'day';
      if (!p.alive) return ch === 'dead';
      if (ch === 'wolf') return isWolf(p.role) && ph === 'night';
      if (ch === 'last') return ph === 'defense' && G.defd === q;
      if (ch === 'day') return ph === 'dawn' || ph === 'discuss' || ph === 'vote' || ph === 'exec' || ph === 'hshot';
      return false;
    }
    function act(q, a) {
      if (!a || typeof a !== 'object') return false;
      const p = P[q]; if (!p) return false;
      const ph = G.phase, N = G.N;
      if (a.k === 'chat') {
        let x = String(a.x || '').replace(/[\u0000-\u001f<>]/g, ' ').trim().slice(0, 200);
        if (!x || !chatOK(q, a.ch)) return false;
        if (G.t - (G.rate[q] || -9999) < 700) return false;
        G.rate[q] = G.t;
        say(a.ch, q, x);
        return true;
      }
      if (ph === 'night' && p.alive) {
        const c = ctl(q); if (!c) return false;
        const ok = t => c.valid && c.valid.includes(t);
        if (a.k === 'skip') { N.done[q] = true; if (c.k === 'wolf' && !(q in N.wv)) N.wv[q] = -1; checkNightDone(); dirty(); return true; }
        if (a.k === 't' && c.k !== 'witch' && c.k !== 'cupid') {
          if (!ok(a.t)) return false;
          if (c.k === 'wolf') N.wv[q] = a.t; else if (c.k === 'seer') N.seer = a.t; else if (c.k === 'doctor') N.heal = a.t; else if (c.k === 'guard') N.guard = a.t;
          N.done[q] = true; checkNightDone(); dirty(); return true;
        }
        if (a.k === 'bite' && c.k === 'wolf' && c.bite) { N.bite = !!a.on; dirty(); return true; }
        if (a.k === 'w' && c.k === 'witch') {
          if (a.o === 'save' && G.wit.heal) N.save = !N.save;
          else if (a.o === 'poison' && G.wit.poison && ok(a.t)) N.poison = N.poison === a.t ? -1 : a.t;
          else if (a.o === 'done') N.done[q] = true;
          else return false;
          checkNightDone(); dirty(); return true;
        }
        if (a.k === 'cp' && c.k === 'cupid') {
          const x = a.a, y = a.b;
          if (x === y || !ok(x) || !ok(y)) return false;
          N.cp = [x, y]; N.done[q] = true;
          if (P[x].lover < 0 && P[y].lover < 0) {
            P[x].lover = y; P[y].lover = x;
            sys(`Cupid linked you with ${nm(y)}, a ${ROLE[P[y].role].n}. If one of you dies, the other follows.`, [x]);
            sys(`Cupid linked you with ${nm(x)}, a ${ROLE[P[x].role].n}. If one of you dies, the other follows.`, [y]);
            [x, y].forEach(i => { if (P[i].bot) { const o = P[i].lover; P[i].mem.sus[o] = -9; if (isWolf(P[o].role)) P[i].mem.known[o] = P[o].role; } });
          }
          checkNightDone(); dirty(); return true;
        }
        return false;
      }
      if (ph === 'hunter' && G.hunter === q && a.k === 'shot') {
        if (a.t === -1) { G.dl = G.t; return true; }
        if (!P[a.t] || !P[a.t].alive || a.t === q) return false;
        hunterShot(a.t); return true;
      }
      if (ph === 'vote' && p.alive && a.k === 'vote') {
        const t = a.t;
        if (t !== -1 && (!P[t] || !P[t].alive || t === q)) return false;
        if (G.vt[q] === t) return false;
        const had = G.vt[q] !== undefined;
        G.vt[q] = t;
        if (t === -1) sys(`${p.name} abstains.`); else sys(`${p.name} ${had ? 'changed their vote to' : 'voted for'} ${nm(t)}.`);
        P.forEach(b => { if (b.bot && b.alive && b.i !== q) { if (t === b.i) b.mem.sus[q] += 0.6; else if (t >= 0 && b.mem.sus[t] < 0) b.mem.sus[q] += 0.25; } });
        if (alive().every(x => G.vt[x.i] !== undefined) && G.dl - G.t > 2200) G.dl = G.t + 2000;
        dirty(); return true;
      }
      if (ph === 'discuss' && p.alive && a.k === 'skipd') {
        G.skip[q] = !G.skip[q]; dirty();
        const hs = alive().filter(x => !x.bot);
        if (hs.length && hs.every(x => G.skip[x.i]) && G.dl - G.t > 1200) G.dl = G.t + 800;
        return true;
      }
      return false;
    }

    const FRESH = (b, arr) => {
      const recent = new Set(G.chat.slice(-14).map(e => e.x)), rec = b.mem.rec || (b.mem.rec = []);
      let c = arr.filter(x => !recent.has(x) && !rec.includes(x));
      if (!c.length) c = arr.filter(x => !recent.has(x));
      const r = pick(c.length ? c : arr);
      rec.push(r); if (rec.length > 10) rec.shift();
      return r;
    };
    function hear(e) {
      const f = e.f, txt = String(e.x).toLowerCase(), sender = P[f];
      if (!sender) return;
      const selfBad = /\b(vote|lynch|kill) me\b|\bi(?: am|'m|m) (?:the |a )?(?:wolf|werewolf)\b/.test(txt);
      P.forEach(b => {
        if (!b.bot || !b.alive || b.i === f) return;
        const m = b.mem;
        if (selfBad) {
          m.sus[f] -= 2; (m.jw || (m.jw = {}))[f] = 1;
          if (!isWolf(b.role) && !m['w' + f] && Math.random() < 0.4) { m['w' + f] = 1; later(rnd(1500, 4000), () => botSay(b, FRESH(b, L.wary(sender.name)))); }
          return;
        }
        const react = (t, wolf) => {
          const k = 'r' + f + ':' + G.day;
          if (m[k] || Math.random() < 0.4) return;
          m[k] = 1;
          later(rnd(1500, 4000), () => botSay(b, FRESH(b, t === b.i ? L.defV(sender.name) : t === undefined ? L.doubt(sender.name) : wolf ? L.believe(sender.name, nm(t)) : L.clear(sender.name, nm(t)))));
        };
        if (e.m && e.m.k === 'claim') {
          if (isWolf(b.role)) { if (e.m.role === 'seer') G.push = G.push >= 0 && P[G.push].alive ? G.push : f; return; }
          const t = e.m.t, rival = P.find(p => p.alive && p.i !== f && m.claim[p.i] === 'seer');
          m.claim[f] = 'seer';
          if (rival) { m.sus[f] += 0.8; m.sus[rival.i] += 0.8; }
          if (t === b.i && !isWolf(b.role)) m.sus[f] += 3;
          else if (e.m.wolf) m.sus[t] += 2.2; else m.sus[t] -= 0.6;
          react(t, e.m.wolf);
          return;
        }
        if (/\b(i am|i'm|im) the (seer|doctor|hunter|witch)\b/.test(txt)) {
          m.claim[f] = (txt.match(/(seer|doctor|hunter|witch)/) || [])[1];
          if (m.claim[f] === 'seer') { if (isWolf(b.role)) G.push = f; else { m.sus[f] -= 0.3; react(undefined); } }
        }
        let mentioned = false, accused = -1;
        P.forEach(j => {
          if (!j.alive || j.i === f) return;
          if (!txt.includes(j.name.toLowerCase())) return;
          if (j.i === b.i) mentioned = true;
          if (/(wolf|sus|suspect|suspicious|lynch|vote|liar|kill|guilty|fishy|evil)/.test(txt) && !/(not|n't|innocent|trust)/.test(txt)) { m.sus[j.i] += 0.7 * (isWolf(P[f].role) ? 0.8 : 1); accused = j.i; }
          else if (/(innocent|trust|safe|villager|good|not a wolf|not the wolf)/.test(txt)) m.sus[j.i] -= 0.5;
        });
        const acc = /(wolf|sus|suspect|suspicious|lynch|vote|liar|guilty|fishy|evil|kill)/.test(txt);
        if (mentioned && acc && m.defended !== f + ':' + G.day + ':' + G.phase) {
          m.defended = f + ':' + G.day + ':' + G.phase;
          later(rnd(1500, 4500), () => {
            botSay(b, FRESH(b, isWolf(b.role) ? L.defW(sender.name) : L.defV(sender.name)));
            if (Math.random() < 0.3 && sender.alive) { m.sus[f] += 0.4; later(rnd(2000, 4000), () => botSay(b, FRESH(b, L.counter(sender.name)))); }
          });
        } else if (accused >= 0 && !mentioned && m.sus[accused] > 0.5 && Math.random() < 0.2 && !isWolf(b.role)) {
          later(rnd(2000, 5000), () => botSay(b, FRESH(b, L.agree(sender.name, nm(accused)))));
        }
      });
    }

    function botSay(b, x, m) {
      if (!b.alive || G.phase === 'over') return;
      if (G.phase !== 'discuss' && G.phase !== 'vote' && G.phase !== 'dawn' && G.phase !== 'defense') return;
      if (G.chat.slice(-8).some(e => e.x === x)) return;
      say('day', b.i, x, null, m);
    }
    function botLast(b) {
      if (!b.alive || G.phase !== 'defense' || G.defd !== b.i) return;
      say('last', b.i, FRESH(b, L.last(isWolf(b.role))));
    }
    function suspects(b, k) {
      return alive().filter(p => p.i !== b.i && p.i !== b.lover && !(isWolf(b.role) && isWolf(p.role))).sort((x, y) => b.mem.sus[y.i] - b.mem.sus[x.i] + (Math.random() - 0.5) * 0.4).slice(0, k || 1);
    }
    function botTalk(b) {
      const lines = G.day === 1 ? 2 : 3, span = (G.dur - 6000);
      for (let k = 0; k < lines; k++) {
        later(rnd(2500, Math.max(4000, span)) * (0.3 + 0.7 * (k + 1) / lines) * (G.dur < 15000 ? 0.4 : 1), () => botLine(b));
      }
      if (b.bot) later(G.dur * 0.55, () => { if (!P.some(p => p.alive && !p.bot)) G.skip[b.i] = true; });
    }
    function botLine(b) {
      if (!b.alive) return;
      const m = b.mem, role = b.role;
      const dead = P.filter(p => !p.alive && p.dday === G.day - 0);
      if (role === 'seer') {
        const wolf = Object.keys(m.inspected).map(Number).find(i => isWolf(m.inspected[i]) && P[i].alive);
        if (wolf !== undefined && !m.claimed) { m.claimed = true; return botSay(b, `I am the Seer! I checked ${nm(wolf)} and they are a werewolf. Vote ${nm(wolf)}!`, { k: 'claim', role: 'seer', t: wolf, wolf: true }); }
        const good = Object.keys(m.inspected).map(Number).find(i => !isWolf(m.inspected[i]) && P[i].alive && !m['g' + i]);
        if (good !== undefined && G.day >= 2 && Math.random() < 0.5) { m['g' + good] = 1; return botSay(b, `I am the Seer. ${nm(good)} is not a wolf, I checked.`, { k: 'claim', role: 'seer', t: good, wolf: false }); }
      }
      if (role === 'hunter' && m.sus.some(v => v > 2) && Math.random() < 0.2) return botSay(b, FRESH(b, L.hunter()));
      if (role === 'jester' && Math.random() < JW[0]) return botSay(b, FRESH(b, Math.random() < JW[1] ? L.bait() : L.jester()));
      if (isWolf(role)) {
        if (G.push < 0 || !P[G.push].alive || isWolf(P[G.push].role)) { const c = alive().filter(p => !isWolf(p.role) && p.i !== b.lover && !(b.mem.jw && b.mem.jw[p.i])); G.push = c.length ? pick(c).i : -1; }
        if (G.push >= 0 && Math.random() < 0.6) return botSay(b, FRESH(b, L.push(nm(G.push))));
      }
      if (G.day === 1 && m.said === 0) { m.said++; return botSay(b, FRESH(b, L.hello())); }
      m.said++;
      if (dead.length && Math.random() < 0.3 && G.day > 1) return botSay(b, FRESH(b, L.dead(nm(dead[0].i))));
      const s = suspects(b, 2)[0];
      if (s && m.sus[s.i] > 0.5) return botSay(b, FRESH(b, L.sus(s.name)));
      return botSay(b, FRESH(b, L.idle()));
    }
    function botVoteTarget(b) {
      const a = alive().filter(p => p.i !== b.i);
      if (!a.length) return -1;
      if (isWolf(b.role)) {
        const c = a.filter(p => !isWolf(p.role) && p.i !== b.lover && !(b.mem.jw && b.mem.jw[p.i]));
        if (!c.length) return -1;
        const tally = {};
        P.forEach(p => { if (p.alive && G.vt[p.i] >= 0) tally[G.vt[p.i]] = (tally[G.vt[p.i]] || 0) + 1; });
        return c.map(p => [p.i, (tally[p.i] || 0) * 1.5 + (p.i === G.push ? 2.5 : 0) + Math.random()]).sort((x, y) => y[1] - x[1])[0][0];
      }
      if (b.role === 'jester' && Math.random() < 0.25) return pick(a).i;
      const sc = a.filter(p => p.i !== b.lover).map(p => [p.i, b.mem.sus[p.i] + (Math.random() - 0.5) * 0.5 + (b.mem.claim[p.i] === 'seer' && b.mem.sus[p.i] < 3 ? -1 : 0)]).sort((x, y) => y[1] - x[1]);
      if (!sc.length) return -1;
      return sc[0][0];
    }
    function botVote(b) {
      const f = G.dur < 12000 ? 0.4 : 1;
      later(rnd(3000, Math.max(4500, G.dur - 8000)) * f, () => {
        const t = botVoteTarget(b);
        if (t >= 0) { act(b.i, { k: 'vote', t }); if (Math.random() < 0.7) say('day', b.i, FRESH(b, L.vote(nm(t)))); }
        else act(b.i, { k: 'vote', t: -1 });
      });
      if (Math.random() < 0.4) later(G.dur * 0.8, () => {
        const tally = {};
        P.forEach(p => { if (p.alive && G.vt[p.i] >= 0) tally[G.vt[p.i]] = (tally[G.vt[p.i]] || 0) + 1; });
        const top = Object.keys(tally).sort((x, y) => tally[y] - tally[x])[0];
        if (top !== undefined && +top !== b.i && +top !== b.lover && G.vt[b.i] !== +top && (isWolf(b.role) ? !isWolf(P[+top].role) : b.mem.sus[+top] > -1) && Math.random() < 0.5) act(b.i, { k: 'vote', t: +top });
      });
    }
    function botShoot(i) {
      const b = P[i];
      if (G.phase !== 'hunter' || G.hunter !== i) return;
      const c = alive().filter(p => p.i !== i && p.i !== b.lover).sort((x, y) => b.mem.sus[y.i] - b.mem.sus[x.i] + (Math.random() - 0.5) * 0.3);
      if (c.length) act(i, { k: 'shot', t: c[0].i }); else act(i, { k: 'shot', t: -1 });
    }
    function wolfPickFor(b) {
      const c = alive().filter(p => !isWolf(p.role) && p.i !== b.lover);
      if (!c.length) return -1;
      const human = P.filter(p => p.alive && !p.bot && isWolf(p.role) && G.N.wv[p.i] >= 0).map(p => G.N.wv[p.i]);
      if (human.length) return human[0];
      const seerC = c.find(p => b.mem.claim[p.i] === 'seer');
      if (seerC) return seerC.i;
      if (!G.wolfPlan || G.wolfPlan.day !== G.day || !P[G.wolfPlan.t].alive) G.wolfPlan = { day: G.day, t: pick(c).i };
      return G.wolfPlan.t;
    }
    function wolfChatBots() {
      const bw = P.filter(p => p.alive && p.bot && isWolf(p.role));
      if (!bw.length) return;
      later(rnd(3000, 6000), () => {
        const lead = bw[0], t = wolfPickFor(lead);
        if (t >= 0) say('wolf', lead.i, pick([`Let us take ${nm(t)} tonight.`, `I say we kill ${nm(t)}.`, `${nm(t)} is dangerous. Eat them.`]));
        bw.slice(1).forEach(w => later(rnd(1500, 4000), () => say('wolf', w.i, FRESH(w, L.wolfAgree()))));
      });
    }
    function botNight(b) {
      const m = b.mem, N = G.N, al = alive().map(p => p.i), o = al.filter(i => i !== b.i);
      const go = (ms, fn) => later(ms, () => { if (b.alive) fn(); });
      switch (b.role) {
        case 'werewolf': case 'alpha':
          go(rnd(4500, 9000), () => {
            const t = wolfPickFor(b);
            if (b.role === 'alpha' && G.bite && G.day >= 2 && Math.random() < 0.45) act(b.i, { k: 'bite', on: true });
            if (t >= 0) act(b.i, { k: 't', t }); else act(b.i, { k: 'skip' });
          });
          break;
        case 'seer':
          go(rnd(3000, 8000), () => {
            const c = o.filter(i => !(i in m.inspected)).sort((x, y) => m.sus[y] - m.sus[x] + (Math.random() - 0.5) * 0.6);
            if (c.length) act(b.i, { k: 't', t: c[0] }); else act(b.i, { k: 'skip' });
          });
          break;
        case 'doctor':
          go(rnd(3000, 8000), () => {
            const sc = al.filter(i => i !== G.doc.last && (i !== b.i || !G.doc.self));
            const s = sc.find(i => m.claim[i] === 'seer' && m.sus[i] < 2);
            act(b.i, { k: 't', t: s !== undefined ? s : (!G.doc.self && Math.random() < 0.2 ? b.i : pick(sc.length ? sc : o)) });
          });
          break;
        case 'bodyguard':
          go(rnd(3000, 8000), () => { const s = o.find(i => m.claim[i] === 'seer' && m.sus[i] < 2); act(b.i, { k: 't', t: s !== undefined ? s : (b.lover >= 0 && Math.random() < 0.5 ? b.lover : pick(o)) }); });
          break;
        case 'witch':
          go(rnd(9000, Math.max(10000, G.dur - 5000)), () => {
            const v = wolfTarget();
            if (v >= 0 && G.wit.heal && m.sus[v] < 1 && (G.day <= 2 || Math.random() < 0.6)) act(b.i, { k: 'w', o: 'save' });
            const hot = o.filter(i => m.sus[i] > 2.2 && i !== b.lover).sort((x, y) => m.sus[y] - m.sus[x])[0];
            if (G.wit.poison && ((hot !== undefined && Math.random() < 0.6) || (G.day >= 4 && Math.random() < 0.3))) act(b.i, { k: 'w', o: 'poison', t: hot !== undefined ? hot : pick(o) });
            act(b.i, { k: 'w', o: 'done' });
          });
          break;
        case 'cupid':
          if (G.day === 1) go(rnd(3000, 6000), () => {
            const a = shuffle(al.slice());
            const x = Math.random() < 0.4 ? b.i : a[0], y = a.find(i => i !== x);
            act(b.i, { k: 'cp', a: x, b: y });
          });
          break;
      }
    }

    function tick(dt) {
      G.t += dt;
      for (let i = 0; i < G.tq.length; i++) {
        const e = G.tq[i];
        if (e.at <= G.t) { G.tq.splice(i--, 1); if (e.ph === G.phase && e.day === G.day) try { e.fn(); } catch (x) { console.error(x); } }
      }
      let guard = 0;
      while (G.phase !== 'over' && G.t >= G.dl && guard++ < 4) advance();
      if (!humansAlive() && G.phase === 'discuss' && alive().every(p => G.skip[p.i]) && G.dl - G.t > 800) G.dl = G.t + 600;
    }

    function visible(e, q) {
      const me = P[q];
      if (e.to) return e.to.includes(q);
      if (e.ch === 'dead') return !me.alive || G.phase === 'over';
      if (e.ch === 'wolf') return isWolf(me.role) || !me.alive || G.phase === 'over' || me.role === 'littlegirl';
      return true;
    }
    function view(q) {
      const me = P[q], showAll = G.phase === 'over' || !me.alive, mateW = isWolf(me.role);
      const full = G.rs[q] || G.sent[q] === undefined;
      G.rs[q] = 0;
      const from = full ? 0 : G.sent[q];
      const ch = [];
      for (let i = from; i < G.chat.length; i++) {
        const e = G.chat[i];
        if (!visible(e, q)) continue;
        if (e.ch === 'wolf' && me.role === 'littlegirl' && me.alive && !isWolf(me.role)) ch.push({ i: e.i, ch: 'wolf', f: -2, x: e.x, d: e.d });
        else ch.push({ i: e.i, ch: e.ch, f: e.f, x: e.x, d: e.d, p: e.to ? 1 : 0 });
      }
      G.sent[q] = G.chat.length;
      const showV = G.phase === 'vote' || G.phase === 'defense' || G.phase === 'exec';
      const players = P.map(p => {
        const o = { i: p.i, name: p.name, av: p.av, a: p.alive ? 1 : 0, b: p.bot ? 1 : 0 };
        if (showAll || !p.alive || p.i === q || (mateW && isWolf(p.role))) { o.r = p.role; }
        if (!p.alive) o.c = p.cause;
        if (p.lover >= 0 && (showAll || p.i === q || me.lover === p.i)) o.h = 1;
        if (showV && G.vt[p.i] !== undefined) o.v = G.vt[p.i];
        if (mateW && G.phase === 'night' && me.alive && isWolf(p.role) && G.N.wv[p.i] !== undefined) o.wv = G.N.wv[p.i];
        return o;
      });
      return {
        q, ph: G.phase, day: G.day, left: Math.max(0, G.dl - G.t), dur: G.dur, n, comp: G.comp, players, defd: G.defd, lyn: G.lyn, hunter: G.hunter, over: G.over, jw: G.jw,
        me: { role: me.role, alive: me.alive ? 1 : 0, ctl: ctl(q), lover: me.lover, skip: !!G.skip[q], shot: G.phase === 'hunter' && G.hunter === q },
        skips: G.phase === 'discuss' ? [alive().filter(p => !p.bot && G.skip[p.i]).length, alive().filter(p => !p.bot).length] : null,
        full, chat: ch, ver: ++G.ver
      };
    }
    function toBot(q) {
      const p = P[q]; if (!p || p.bot) return;
      p.bot = true; p.name += ' (Bot)'; initMem(p); dirty();
      P.forEach(b => { if (b.bot && b.alive && b.i !== q) { b.mem.sus[q] = Math.max(b.mem.sus[q], 0); } });
      if (p.alive && G.phase === 'night') botNight(p);
      if (p.alive && G.phase === 'vote') botVote(p);
      if (p.alive && G.phase === 'hunter' && G.hunter === q) later(2000, () => botShoot(q));
      if (G.phase === 'defense' && G.defd === q) later(1500, () => botLast(p));
      sys(`${p.name.replace(' (Bot)', '')} left. A bot takes over.`);
    }
    function start() {
      setPhase('deal', 7);
      dirty();
    }
    function snap() { const g = Object.assign({}, G); delete g.P; delete g.tq; delete g.rs; delete g.sent; delete g.dirty; return JSON.stringify({ G: g, P }); }
    if (S) {
      const ph = G.phase, bots = P.filter(p => p.bot && p.alive);
      if (ph === 'night') { bots.forEach(b => { if (!G.N.done[b.i]) botNight(b); }); wolfChatBots(); }
      else if (ph === 'discuss') bots.forEach(botTalk);
      else if (ph === 'vote') bots.forEach(b => { if (G.vt[b.i] === undefined) botVote(b); });
      else if (ph === 'hunter' && P[G.hunter].bot) later(2000, () => botShoot(G.hunter));
      else if (ph === 'defense' && P[G.defd].bot) later(1500, () => botLast(P[G.defd]));
    }
    return { G, P, snap, sys, tick, act, view, start, toBot, wolfTarget, get over() { return G.over; } };
  }

  const _t = { Game, autoRoles, customRoles, ROLE, isWolf, wolvesFor };

  const SKIN = ['#f6d3b3', '#eab98e', '#d79a6a', '#b5754a', '#8d5a3a', '#5e3b27'];
  const HAIRC = ['#2b1d14', '#5a3825', '#8b5a2b', '#c9a14a', '#e8c75a', '#b5391f', '#7d7d86', '#ece9e2', '#6a3fa0', '#2a6fb5', '#e0558f', '#1a1a1f'];
  const SHIRT = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22', '#1abc9c', '#34495e', '#ec407a', '#8d6e63', '#26a69a', '#ff7043'];
  const seedRng = s => { let a = (s * 2654435761 + 12345) >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const avCache = {};
  function avatar(seed) {
    if (avCache[seed]) return avCache[seed];
    const r = seedRng(seed * 7 + 13), pk = a => a[Math.floor(r() * a.length)];
    r(); r(); r();
    const skin = pk(SKIN), hc = pk(HAIRC), sh = pk(SHIRT), style = Math.floor(r() * 9), eye = Math.floor(r() * 3), mouth = Math.floor(r() * 3), acc = Math.floor(r() * 6), fem = r() < 0.5;
    const dk = '#2a2230';
    let back = '', front = '';
    const hl = `fill="${hc}"`;
    if (style === 0) front = `<path d="M28 42 Q26 17 50 17 Q74 17 72 42 Q66 29 50 29 Q34 29 28 42Z" ${hl}/>`;
    if (style === 1) { back = `<path d="M26 40 Q24 14 50 14 Q76 14 74 40 L78 82 L64 82 L64 50 L36 50 L36 82 L22 82Z" ${hl}/>`; front = `<path d="M28 40 Q30 24 50 22 Q70 24 72 40 Q60 30 50 31 Q38 30 28 40Z" ${hl}/>`; }
    if (style === 2) { back = `<path d="M27 40 Q25 15 50 15 Q75 15 73 40 L74 62 L26 62Z" ${hl}/>`; front = `<path d="M28 40 Q32 22 50 22 Q68 22 72 40 Q60 28 50 33 Q40 28 28 40Z" ${hl}/>`; }
    if (style === 3) front = `<path d="M28 42 L26 24 L36 30 L38 14 L46 26 L54 12 L58 26 L68 16 L68 32 L74 26 L72 42 Q64 30 50 30 Q36 30 28 42Z" ${hl}/>`;
    if (style === 4) front = `<g ${hl}><circle cx="34" cy="26" r="11"/><circle cx="48" cy="20" r="12"/><circle cx="63" cy="24" r="12"/><circle cx="72" cy="36" r="8"/><circle cx="28" cy="38" r="8"/></g>`;
    if (style === 5) front = `<path d="M28 42 Q26 18 50 18 Q74 18 72 42 Q64 30 50 30 Q36 30 28 42Z" ${hl}/><circle cx="50" cy="12" r="9" ${hl}/>`;
    if (style === 6) front = `<ellipse cx="42" cy="26" rx="8" ry="4" fill="#fff" opacity=".28"/>`;
    if (style === 7) { const cc = pk(SHIRT); front = `<path d="M27 38 Q27 14 50 14 Q73 14 73 38Z" fill="${cc}"/><path d="M22 38 L78 38 L80 43 L20 43Z" fill="${cc}"/><path d="M22 38 L78 38 L78 40 L22 40Z" fill="#000" opacity=".15"/>`; }
    if (style === 8) { back = `<path d="M60 20 Q86 26 80 60 Q76 76 70 74 Q76 54 70 42Z" ${hl}/>`; front = `<path d="M27 42 Q24 16 50 16 Q76 16 73 42 Q68 28 52 28 Q38 28 27 42Z" ${hl}/>`; }
    let e = '';
    if (eye === 0) e = `<circle cx="41" cy="46" r="4.6" fill="#fff"/><circle cx="59" cy="46" r="4.6" fill="#fff"/><circle cx="41.8" cy="46.4" r="2.4" fill="${dk}"/><circle cx="59.8" cy="46.4" r="2.4" fill="${dk}"/>`;
    if (eye === 1) e = `<circle cx="41" cy="46" r="3.2" fill="${dk}"/><circle cx="59" cy="46" r="3.2" fill="${dk}"/><circle cx="42" cy="45" r="1" fill="#fff"/><circle cx="60" cy="45" r="1" fill="#fff"/>`;
    if (eye === 2) e = `<path d="M36 47 Q41 42 46 47" stroke="${dk}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M54 47 Q59 42 64 47" stroke="${dk}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    const brow = `<path d="M36 39 Q41 36 46 39M54 39 Q59 36 64 39" stroke="${hc}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    let mo = '';
    if (mouth === 0) mo = `<path d="M43 57 Q50 63 57 57" stroke="${dk}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    if (mouth === 1) mo = `<path d="M42 56 Q50 66 58 56Z" fill="#7a2a3a"/>`;
    if (mouth === 2) mo = `<path d="M44 58 L56 58" stroke="${dk}" stroke-width="2.2" stroke-linecap="round"/>`;
    let ac = '';
    if (acc === 0) ac = `<g fill="none" stroke="${dk}" stroke-width="1.8"><circle cx="41" cy="46" r="6.4"/><circle cx="59" cy="46" r="6.4"/><path d="M47.4 46 L52.6 46"/></g>`;
    if (acc === 1 && !fem) ac = `<path d="M33 54 Q36 74 50 74 Q64 74 67 54 Q60 62 50 62 Q40 62 33 54Z" ${hl} opacity=".92"/>`;
    if (acc === 2) ac = `<g><circle cx="30" cy="22" r="4" fill="#ff8fb1"/><circle cx="35" cy="18" r="4" fill="#ffd166"/><circle cx="33" cy="22" r="2" fill="#fff"/></g>`;
    if (acc === 3) ac = `<circle cx="29.6" cy="54" r="2.4" fill="#ffd166"/><circle cx="70.4" cy="54" r="2.4" fill="#ffd166"/>`;
    const body = `<path d="M10 100 Q12 70 50 68 Q88 70 90 100Z" fill="${sh}"/><path d="M40 69 Q50 80 60 69Z" fill="${skin}"/><path d="M40 69 Q50 80 60 69" fill="none" stroke="#000" stroke-opacity=".12"/>`;
    const head = `<rect x="43" y="60" width="14" height="12" fill="${skin}"/><ellipse cx="29.5" cy="48" rx="4" ry="5.5" fill="${skin}"/><ellipse cx="70.5" cy="48" rx="4" ry="5.5" fill="${skin}"/><ellipse cx="50" cy="46" rx="21" ry="23.5" fill="${skin}"/><ellipse cx="36" cy="55" rx="4" ry="2.4" fill="#e8636f" opacity=".22"/><ellipse cx="64" cy="55" rx="4" ry="2.4" fill="#e8636f" opacity=".22"/>`;
    const s = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${back}${body}${head}${front}${brow}${e}${mo}${ac}</svg>`;
    return (avCache[seed] = s);
  }

  const RI = {
    villager: '<ellipse cx="32" cy="38" rx="25" ry="8" fill="#e8c46a"/><path d="M16 36 Q18 16 32 16 Q46 16 48 36Z" fill="#f2d78a"/><path d="M17 33 L47 33 L47 37 L17 37Z" fill="#c0392b"/><path d="M10 38 Q32 46 54 38" stroke="#b58a2e" stroke-width="2" fill="none"/>',
    werewolf: '<path d="M10 8 L24 20 Q32 17 40 20 L54 8 L52 34 Q50 44 40 52 L36 58 L32 54 L28 58 L24 52 Q14 44 12 34Z" fill="#6b6f7a"/><path d="M10 8 L22 21 L13 26Z M54 8 L42 21 L51 26Z" fill="#3b3e47"/><path d="M20 34 L28 37 L26 41Z M44 34 L36 37 L38 41Z" fill="#ffd54a"/><path d="M27 46 L32 51 L37 46 Q32 44 27 46Z" fill="#23232a"/><path d="M26 52 L28 57 L30 52Z M34 52 L36 57 L38 52Z" fill="#fff"/>',
    alpha: '<path d="M10 12 L24 24 Q32 21 40 24 L54 12 L52 36 Q50 46 40 54 L36 60 L32 56 L28 60 L24 54 Q14 46 12 36Z" fill="#4b4452"/><path d="M10 12 L22 25 L13 30Z M54 12 L42 25 L51 30Z" fill="#2a2430"/><path d="M20 38 L28 41 L26 45Z M44 38 L36 41 L38 45Z" fill="#ff5252"/><path d="M26 56 L28 61 L30 56Z M34 56 L36 61 L38 56Z" fill="#fff"/><path d="M18 14 L24 4 L28 10 L32 2 L36 10 L40 4 L46 14Z" fill="#f4c430"/>',
    seer: '<path d="M3 32 Q32 6 61 32 Q32 58 3 32Z" fill="#fff" stroke="#4a2a8a" stroke-width="3"/><circle cx="32" cy="32" r="13" fill="#7e57c2"/><circle cx="32" cy="32" r="6" fill="#1e1236"/><circle cx="36" cy="27" r="3" fill="#fff"/><path d="M32 4 L33.6 9 L39 9 L34.6 12 L36.4 17 L32 14 L27.6 17 L29.4 12 L25 9 L30.4 9Z" fill="#ffd54a"/>',
    doctor: '<rect x="8" y="8" width="48" height="48" rx="12" fill="#fff" stroke="#26a69a" stroke-width="3"/><path d="M26 14 H38 V26 H50 V38 H38 V50 H26 V38 H14 V26 H26Z" fill="#e53935"/>',
    witch: '<path d="M4 50 Q32 40 60 50 Q58 56 32 56 Q6 56 4 50Z" fill="#5e2d91"/><path d="M18 46 Q26 20 36 4 Q38 26 46 46Z" fill="#7e3fb8"/><path d="M19 42 Q32 36 45 42 L46 47 Q32 41 18 47Z" fill="#f4c430"/><rect x="29" y="39" width="7" height="8" rx="1" fill="none" stroke="#5e2d91" stroke-width="2"/>',
    hunter: '<circle cx="32" cy="32" r="20" fill="none" stroke="#e67e22" stroke-width="4"/><circle cx="32" cy="32" r="6" fill="none" stroke="#e67e22" stroke-width="3"/><path d="M32 4 V18 M32 46 V60 M4 32 H18 M46 32 H60" stroke="#e67e22" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="32" r="1.8" fill="#c0392b"/>',
    bodyguard: '<path d="M32 4 L56 12 V32 Q56 50 32 60 Q8 50 8 32 V12Z" fill="#3f6fb5" stroke="#1f3f7a" stroke-width="3"/><path d="M32 12 L48 18 V32 Q48 44 32 52Z" fill="#5b8fd6"/><path d="M32 20 L35 28 L43 28 L37 33 L39 41 L32 36 L25 41 L27 33 L21 28 L29 28Z" fill="#ffd54a"/>',
    jester: '<path d="M6 44 Q4 20 14 8 Q18 24 24 30 Q26 14 32 4 Q38 14 40 30 Q46 24 50 8 Q60 20 58 44Z" fill="#e91e8c"/><path d="M6 44 H58 V52 H6Z" fill="#ffd54a"/><circle cx="14" cy="8" r="4.4" fill="#ffd54a"/><circle cx="32" cy="4" r="4.4" fill="#ffd54a"/><circle cx="50" cy="8" r="4.4" fill="#ffd54a"/><path d="M24 30 Q32 40 40 30 Q40 44 32 44 Q24 44 24 30Z" fill="#7e1fa0" opacity=".6"/>',
    cupid: '<path d="M32 56 Q4 38 8 20 Q12 6 24 10 Q30 12 32 18 Q34 12 40 10 Q52 6 56 20 Q60 38 32 56Z" fill="#ec407a"/><path d="M6 58 L58 6" stroke="#8a5a2b" stroke-width="3.4" stroke-linecap="round"/><path d="M58 6 L48 8 L56 16Z" fill="#8a5a2b"/><path d="M6 58 L10 46 L18 54Z" fill="#f4c430"/>',
    littlegirl: '<path d="M10 58 Q8 24 32 8 Q56 24 54 58Z" fill="#d84315"/><ellipse cx="32" cy="36" rx="14" ry="16" fill="#f6d3b3"/><path d="M16 34 Q20 14 32 12 Q44 14 48 34 Q42 22 32 24 Q22 22 16 34Z" fill="#b5391f"/><circle cx="27" cy="38" r="2" fill="#2a2230"/><circle cx="37" cy="38" r="2" fill="#2a2230"/><path d="M28 45 Q32 48 36 45" stroke="#2a2230" stroke-width="1.8" fill="none" stroke-linecap="round"/>'
  };
  const roleIcon = (r, cls) => `<svg class="${cls || 'ww-ri'}" viewBox="0 0 64 64">${RI[r] || ''}</svg>`;
  const ICON = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M32 6 A22 22 0 1 0 54 36 A17 17 0 0 1 32 6Z"/><path d="M14 52 L22 40 L30 46 L42 30 L52 48"/><path d="M42 12 L44 17 L49 18 L45 22 L46 27 L42 24 L38 27 L39 22 L35 18 L40 17Z" fill="currentColor" stroke="none"/></svg>';

  const TOMB = '<svg class="ww-tomb" viewBox="0 0 64 64"><path d="M14 58 V28 Q14 8 32 8 Q50 8 50 28 V58Z" fill="#8a8f9a" stroke="#4b505b" stroke-width="3"/><path d="M26 22 H38 M32 16 V36" stroke="#4b505b" stroke-width="4" stroke-linecap="round"/><path d="M8 58 H56" stroke="#3a3f48" stroke-width="4" stroke-linecap="round"/></svg>';

  const pines = (xs, y, s, col) => xs.map(x => `<path d="M${x} ${y} l${-9 * s} ${22 * s} h${18 * s}Z M${x} ${y + 10 * s} l${-11 * s} ${22 * s} h${22 * s}Z M${x} ${y + 20 * s} l${-13 * s} ${24 * s} h${26 * s}Z" fill="${col}"/>`).join('');
  const sceneSvg = night => {
    const sky = night ? ['#101a38', '#25356a'] : ['#7fc0e6', '#bfe3f4'], hill = night ? '#0e1424' : '#3b4458', hill2 = night ? '#1a2238' : '#515b75', tree = night ? '#090d18' : '#2b3345';
    const stars = night ? '<g fill="#fff"><circle cx="20" cy="14" r="1.2"/><circle cx="62" cy="26" r="1"/><circle cx="98" cy="12" r="1.3"/><circle cx="130" cy="30" r="1"/><circle cx="148" cy="10" r="1.2"/><circle cx="44" cy="40" r=".9"/></g><circle cx="112" cy="26" r="11" fill="#f4ecc2"/><circle cx="118" cy="22" r="10" fill="#25356a"/>' : '<circle cx="116" cy="26" r="12" fill="#ffe27a" opacity=".9"/><ellipse cx="40" cy="22" rx="18" ry="6" fill="#fff" opacity=".8"/><ellipse cx="52" cy="18" rx="12" ry="6" fill="#fff" opacity=".8"/>';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 130" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs><rect width="160" height="130" fill="url(#g)"/>${stars}<path d="M0 84 Q40 62 80 80 Q120 96 160 70 V130 H0Z" fill="${hill2}"/>${pines([14, 30, 150, 138, 124], 56, 0.7, tree)}<path d="M0 100 Q50 82 90 98 Q130 110 160 92 V130 H0Z" fill="${hill}"/>${pines([8, 24, 144, 130], 76, 0.9, tree)}</svg>`;
  };
  const svgUrl = s => 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s) + '")';

  function drawVillage(ctx, w, h, t, nt) {
    const L = (a, b, k) => a + (b - a) * k, hex = (a, b, k) => {
      const p = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16));
      const x = p(a), y = p(b);
      return `rgb(${x.map((v, i) => Math.round(L(v, y[i], k))).join(',')})`;
    };
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, hex('#6cb4e4', '#0b1230', nt)); g.addColorStop(0.65, hex('#cbe9f7', '#2a3b78', nt)); g.addColorStop(1, hex('#f3e6c4', '#3a4a80', nt));
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    if (nt > 0.05) {
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 40; i++) {
        const x = (i * 97.3) % w, y = (i * 53.7) % (h * 0.55), tw = 0.5 + 0.5 * Math.sin(t * 0.002 + i * 1.7);
        ctx.globalAlpha = nt * (0.35 + 0.65 * tw); ctx.beginPath(); ctx.arc(x, y, 0.8 + (i % 3) * 0.4, 0, 6.3); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    const arc = (k, r) => [w * (0.12 + 0.76 * k), h * 0.62 - Math.sin(Math.PI * k) * h * r];
    const [sx, sy0] = arc(0.7, 0.5), sunY = L(sy0, h * 1.05, Math.min(1, nt * 1.3)), [mx, my0] = arc(0.3, 0.46), my = L(h * 1.05, my0, Math.min(1, nt * 1.3));
    if (nt < 0.98) {
      ctx.globalAlpha = 1 - nt;
      const rg = ctx.createRadialGradient(sx, sunY, 2, sx, sunY, 30);
      rg.addColorStop(0, 'rgba(255,236,150,.9)'); rg.addColorStop(1, 'rgba(255,236,150,0)');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(sx, sunY, 30, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#ffe27a'; ctx.beginPath(); ctx.arc(sx, sunY, 11, 0, 6.3); ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (nt > 0.02) {
      ctx.globalAlpha = Math.min(1, nt * 1.4);
      const rg = ctx.createRadialGradient(mx, my, 4, mx, my, 34);
      rg.addColorStop(0, 'rgba(240,240,200,.45)'); rg.addColorStop(1, 'rgba(240,240,200,0)');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(mx, my, 34, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#f4ecc2'; ctx.beginPath(); ctx.arc(mx, my, 12, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#e0d8a8'; ctx.beginPath(); ctx.arc(mx - 4, my - 3, 2.4, 0, 6.3); ctx.arc(mx + 3, my + 4, 1.8, 0, 6.3); ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = 'rgba(255,255,255,' + (0.85 - nt * 0.6) + ')';
    for (let i = 0; i < 3; i++) {
      const cx = ((t * 0.008 * (1 + i * 0.3) + i * w * 0.4) % (w + 80)) - 40, cy = h * (0.14 + i * 0.1);
      ctx.beginPath(); ctx.ellipse(cx, cy, 24, 6, 0, 0, 6.3); ctx.ellipse(cx + 14, cy - 5, 14, 6, 0, 0, 6.3); ctx.ellipse(cx - 12, cy - 3, 12, 5, 0, 0, 6.3); ctx.fill();
    }
    const fy = h;
    ctx.fillStyle = hex('#7aa0a8', '#1a2447', nt);
    ctx.beginPath(); ctx.moveTo(0, fy * 0.7); ctx.quadraticCurveTo(w * 0.25, fy * 0.5, w * 0.5, fy * 0.68); ctx.quadraticCurveTo(w * 0.78, fy * 0.82, w, fy * 0.6); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
    const pine = (x, y, s, c) => { ctx.fillStyle = c; ctx.beginPath(); for (let k = 0; k < 3; k++) { ctx.moveTo(x, y + k * 9 * s); ctx.lineTo(x - (9 + k * 2) * s, y + (k * 9 + 15) * s); ctx.lineTo(x + (9 + k * 2) * s, y + (k * 9 + 15) * s); } ctx.fill(); };
    const tc = hex('#3a5a58', '#0a1020', nt);
    [0.05, 0.12, 0.3, 0.62, 0.9, 0.97].forEach((x, i) => pine(w * x, fy * (0.5 + (i % 2) * 0.04), 0.72, tc));
    ctx.fillStyle = hex('#5f8a66', '#121c38', nt);
    ctx.beginPath(); ctx.moveTo(0, fy * 0.84); ctx.quadraticCurveTo(w * 0.4, fy * 0.72, w * 0.7, fy * 0.84); ctx.quadraticCurveTo(w * 0.88, fy * 0.9, w, fy * 0.82); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
    const house = (x, y, s, wall, roof, k) => {
      const ww = 26 * s, hh = 18 * s;
      ctx.fillStyle = hex(wall, '#2a2f4a', nt); ctx.fillRect(x - ww / 2, y - hh, ww, hh);
      ctx.fillStyle = hex(roof, '#3a2230', nt); ctx.beginPath(); ctx.moveTo(x - ww / 2 - 3 * s, y - hh); ctx.lineTo(x, y - hh - 14 * s); ctx.lineTo(x + ww / 2 + 3 * s, y - hh); ctx.fill();
      ctx.fillStyle = hex('#5a3b25', '#1a1018', nt); ctx.fillRect(x - 3 * s, y - 9 * s, 6 * s, 9 * s);
      const lit = nt > 0.35 && (k % 3 !== 2 || nt > 0.8);
      ctx.fillStyle = lit ? `rgba(255,214,110,${0.6 + 0.4 * nt})` : hex('#cfe6f2', '#3a4568', nt);
      ctx.fillRect(x - ww / 2 + 3 * s, y - hh + 4 * s, 6 * s, 6 * s); ctx.fillRect(x + ww / 2 - 9 * s, y - hh + 4 * s, 6 * s, 6 * s);
      if (lit) { const gl = ctx.createRadialGradient(x, y - 10 * s, 1, x, y - 10 * s, 24 * s); gl.addColorStop(0, 'rgba(255,200,90,.28)'); gl.addColorStop(1, 'rgba(255,200,90,0)'); ctx.fillStyle = gl; ctx.fillRect(x - 24 * s, y - 34 * s, 48 * s, 48 * s); }
      if (k % 2 === 0) {
        ctx.fillStyle = hex('#8a7468', '#1a1420', nt); ctx.fillRect(x + ww / 4, y - hh - 12 * s, 4 * s, 8 * s);
        ctx.fillStyle = `rgba(220,220,230,${0.35 - nt * 0.15})`;
        for (let q = 0; q < 3; q++) { const u = ((t * 0.0006 + q / 3 + k * 0.2) % 1); ctx.beginPath(); ctx.arc(x + ww / 4 + 2 * s + Math.sin(u * 6 + k) * 3 * s, y - hh - 14 * s - u * 18 * s, (2 + u * 3) * s, 0, 6.3); ctx.fill(); }
      }
    };
    const hy = fy * 0.9;
    house(w * 0.2, hy - 6, 1.1, '#e9d6b0', '#b5503a', 0); house(w * 0.4, hy + 2, 1.25, '#d8c4a0', '#7a4a8a', 1); house(w * 0.62, hy - 4, 1.05, '#e6dcc0', '#3f7a8a', 2); house(w * 0.82, hy + 1, 1.2, '#dcc9a6', '#a8553a', 3);
    pine(w * 0.5, fy * 0.7, 0.9, hex('#2f5a50', '#080e1c', nt)); pine(w * 0.74, fy * 0.72, 0.8, hex('#2f5a50', '#080e1c', nt));
    if (nt > 0.5) {
      for (let i = 0; i < 9; i++) {
        const x = (w * (0.1 + i * 0.1) + Math.sin(t * 0.0007 + i * 2) * 20 + w) % w, y = fy * 0.9 + Math.sin(t * 0.001 + i * 1.3) * 8 - 8;
        ctx.fillStyle = `rgba(200,255,130,${nt * (0.35 + 0.35 * Math.sin(t * 0.004 + i))})`; ctx.beginPath(); ctx.arc(x, y, 1.6, 0, 6.3); ctx.fill();
      }
    }
    if (nt > 0.7) {
      const bx = w * 0.88, by = fy * 0.58;
      ctx.fillStyle = `rgba(8,10,20,${(nt - 0.7) * 3})`;
      ctx.beginPath(); ctx.moveTo(bx - 7, by + 12); ctx.lineTo(bx - 5, by - 4); ctx.lineTo(bx - 9, by - 12); ctx.lineTo(bx - 2, by - 7); ctx.lineTo(bx + 2, by - 8); ctx.lineTo(bx + 8, by - 13); ctx.lineTo(bx + 6, by - 3); ctx.lineTo(bx + 9, by + 12); ctx.fill();
    }
  }

  const CSS = `
.gm-werewolf{gap:0}
.gm-werewolf [hidden]{display:none!important}
.gm-werewolf button{font-family:var(--sans);cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;color:inherit}
.gm-werewolf .ww-wrap{position:relative;max-width:100%;border-radius:18px;overflow:hidden;background:#2a2d34;box-shadow:0 12px 34px rgba(10,14,30,.35);font-family:var(--sans)}
.gm-werewolf .ww-stage{position:absolute;left:0;top:0;transform-origin:0 0;font-size:14px;line-height:1.25;--bg:#e3e6eb;--pn:#f7f8fa;--pn2:#ebeef2;--ink:#242831;--mut:#6a7280;--ln:#d4d9e1;--pk:#e0245e;--tx:#fff;--pat:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140' fill='none' stroke='%23000' stroke-opacity='.07' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='22' cy='24' r='9'/%3E%3Cpath d='M86 14l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z'/%3E%3Cpath d='M30 92a14 14 0 1 0 16 18 11 11 0 0 1-16-18z'/%3E%3Cpath d='M100 86l8 14h-16z M112 118h12 M118 112v12'/%3E%3Cpath d='M64 62q6-8 12 0t-12 14q-18-14-12-14t12 0'/%3E%3C/svg%3E");background:var(--bg) var(--pat);color:var(--ink);transition:background 1.4s,color 1.4s}
.gm-werewolf .ww-stage.night{--bg:#23262d;--pn:#30343c;--pn2:#292c33;--ink:#e9ecf2;--mut:#98a1b0;--ln:#444a55;--pk:#ff4d86;--pat:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140' fill='none' stroke='%23fff' stroke-opacity='.06' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='22' cy='24' r='9'/%3E%3Cpath d='M86 14l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z'/%3E%3Cpath d='M30 92a14 14 0 1 0 16 18 11 11 0 0 1-16-18z'/%3E%3Cpath d='M100 86l8 14h-16z M112 118h12 M118 112v12'/%3E%3Cpath d='M64 62q6-8 12 0t-12 14q-18-14-12-14t12 0'/%3E%3C/svg%3E")}
.gm-werewolf .ww-stage::before{content:'';position:absolute;inset:0;opacity:.5;background:radial-gradient(circle at 20% 10%,rgba(255,255,255,.35),transparent 50%),repeating-linear-gradient(45deg,rgba(0,0,0,.025) 0 12px,transparent 12px 24px);pointer-events:none}
.gm-werewolf .ww-stage.night::before{opacity:.25}
.gm-werewolf .ww-p{position:absolute;background:var(--pn);border-radius:12px;box-shadow:0 2px 0 rgba(0,0,0,.06),0 6px 16px rgba(0,0,0,.1);transition:background 1.4s,color 1.4s;overflow:hidden}
.gm-werewolf .ww-head{display:flex;flex-direction:column;justify-content:flex-end;color:#fff;background:#223}
.gm-werewolf .ww-head canvas{position:absolute;inset:0;width:100%;height:100%}
.gm-werewolf .ww-head .tt{position:absolute;left:14px;top:10px;font:900 22px/1.1 var(--sans);text-shadow:0 2px 6px rgba(0,0,0,.5);letter-spacing:-.2px}
.gm-werewolf .ww-head .st{position:absolute;left:14px;top:38px;font:800 12px var(--sans);text-shadow:0 1px 4px rgba(0,0,0,.6);opacity:.92}
.gm-werewolf .ww-head .tm{position:absolute;right:56px;top:8px;font:900 26px var(--sans);font-variant-numeric:tabular-nums;text-shadow:0 2px 6px rgba(0,0,0,.55)}
.gm-werewolf .ww-head .bar{position:absolute;left:0;right:0;bottom:0;height:5px;background:rgba(0,0,0,.35)}
.gm-werewolf .ww-head .bar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#ffd54a,#ff7043);transform-origin:0 0}
.gm-werewolf .ww-ib{position:absolute;top:8px;width:38px;height:38px;border-radius:12px;border:0;background:rgba(0,0,0,.38);color:#fff;display:grid;place-items:center;padding:0;backdrop-filter:blur(4px)}
.gm-werewolf .ww-ib svg{width:20px;height:20px}
.gm-werewolf .ww-ib:hover{background:rgba(0,0,0,.55)}
.gm-werewolf .ww-roles{display:flex;flex-wrap:wrap;gap:4px 2px;padding:8px 8px;align-content:flex-start}
.gm-werewolf .ww-rl{position:relative;width:calc(16.66% - 2px);display:flex;flex-direction:column;align-items:center;font:700 9.5px/1.1 var(--sans);color:var(--ink);text-align:center;background:none;border:0;padding:2px 0;border-radius:8px}
.gm-werewolf .ww-rl .ww-ri{width:30px;height:30px}
.gm-werewolf .ww-rl b{position:absolute;right:4px;top:-2px;min-width:16px;height:16px;border-radius:8px;background:var(--pk);color:#fff;font:900 10px/16px var(--sans);text-align:center;padding:0 3px}
.gm-werewolf .ww-rl.gone{opacity:.32}
.gm-werewolf .ww-rl.mine{background:rgba(224,36,94,.14);outline:2px solid var(--pk)}
.gm-werewolf .ww-chat{display:flex;flex-direction:column}
.gm-werewolf .ww-tabs{display:flex;border-bottom:1px solid var(--ln);flex:none}
.gm-werewolf .ww-tabs button{flex:1;height:36px;background:var(--pn2);border:0;border-bottom:3px solid transparent;font:800 13px var(--sans);color:var(--mut);position:relative}
.gm-werewolf .ww-tabs button.on{background:var(--pn);color:var(--ink);border-bottom-color:var(--pk)}
.gm-werewolf .ww-tabs button i{position:absolute;right:8px;top:8px;width:8px;height:8px;border-radius:50%;background:var(--pk)}
.gm-werewolf .ww-log{flex:1;overflow-y:auto;padding:8px 12px;font:600 14px/1.38 var(--sans);overscroll-behavior:contain;scrollbar-width:thin;user-select:text;-webkit-user-select:text}
.gm-werewolf .ww-log .ln{margin:0 0 4px;word-break:break-word}
.gm-werewolf .ww-log .sys{color:var(--pk);font-weight:800}
.gm-werewolf .ww-log .priv{color:#8e44ad;font-style:italic}
.gm-werewolf .night .ww-log .priv{color:#c79bff}
.gm-werewolf .ww-log .ph{display:flex;align-items:center;justify-content:space-between;padding:7px 10px;margin:8px 0;border-radius:8px;background:var(--pn2);border:1px solid var(--ln);color:var(--pk);font-weight:900}
.gm-werewolf .ww-log .ph svg{width:22px;height:22px}
.gm-werewolf .ww-log .wolf{color:#c0392b}
.gm-werewolf .night .ww-log .wolf{color:#ff7a6b}
.gm-werewolf .ww-log .dead{color:var(--mut);font-style:italic}
.gm-werewolf .ww-log .last{color:#b5651d}
.gm-werewolf .ww-log .ln b{font-weight:900}
.gm-werewolf .ww-in{display:flex;gap:6px;padding:8px;border-top:1px solid var(--ln);flex:none}
.gm-werewolf .ww-in input{flex:1;min-width:0;height:40px;border-radius:10px;border:2px solid var(--ln);background:var(--pn2);color:var(--ink);padding:0 12px;font:600 14px var(--sans);outline:0}
.gm-werewolf .ww-in input:focus{border-color:var(--pk)}
.gm-werewolf .ww-in input:disabled{opacity:.55}
.gm-werewolf .ww-in button{width:44px;height:40px;border-radius:10px;border:0;background:var(--pk);color:#fff;display:grid;place-items:center;padding:0}
.gm-werewolf .ww-in button:disabled{opacity:.4}
.gm-werewolf .ww-in button svg{width:20px;height:20px}
.gm-werewolf .ww-grid{display:grid;gap:8px;background:none;box-shadow:none;overflow:visible}
.gm-werewolf .ww-c{position:relative;border-radius:11px;overflow:hidden;background:var(--sc) center/cover;box-shadow:0 3px 0 rgba(0,0,0,.18);transition:transform .15s,box-shadow .2s,filter .6s;cursor:default;min-height:0}
.gm-werewolf .ww-c .av{position:absolute;left:50%;bottom:-3%;height:84%;aspect-ratio:1;transform:translateX(-50%);transition:filter .6s,opacity .6s}
.gm-werewolf .ww-c .av svg{width:100%;height:100%;display:block}
.gm-werewolf .ww-c .nm{position:absolute;left:50%;top:5px;transform:translateX(-50%);max-width:94%;padding:2px 9px;border-radius:7px;background:rgba(80,120,150,.72);color:#fff;font:800 13px/1.25 var(--sans);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;z-index:3}
.gm-werewolf .ww-c .nm b{opacity:.75;margin-right:4px}
.gm-werewolf .ww-c.me .nm{background:rgba(224,36,94,.85)}
.gm-werewolf .ww-c.tg{cursor:pointer;animation:ww-pulse 1.1s infinite alternate}
.gm-werewolf .ww-c.tg:hover{transform:translateY(-3px) scale(1.02)}
.gm-werewolf .ww-c.vic{box-shadow:0 0 0 4px #e53935,0 0 22px rgba(229,57,53,.75)}
.gm-werewolf .ww-c.vic.sel{box-shadow:0 0 0 4px var(--pk),0 0 22px rgba(224,36,94,.65)}
.gm-werewolf .ww-c.sel{box-shadow:0 0 0 4px var(--pk),0 0 22px rgba(224,36,94,.65);animation:none}
.gm-werewolf .ww-c.dock{box-shadow:0 0 0 4px #ffb300,0 0 24px rgba(255,179,0,.7)}
@keyframes ww-pulse{from{box-shadow:0 0 0 2px rgba(255,255,255,.35),0 3px 0 rgba(0,0,0,.18)}to{box-shadow:0 0 0 4px rgba(255,213,74,.9),0 3px 0 rgba(0,0,0,.18)}}
.gm-werewolf .ww-c.dead .av{filter:grayscale(1) brightness(.6);opacity:.55}
.gm-werewolf .ww-c.dead{filter:grayscale(.85) brightness(.75)}
.gm-werewolf .ww-c .tb{position:absolute;left:50%;bottom:6%;width:42%;transform:translateX(-50%);opacity:0;transition:opacity .5s;z-index:2}
.gm-werewolf .ww-c.dead .tb{opacity:.95}
.gm-werewolf .ww-c .tb svg{width:100%;display:block}
.gm-werewolf .ww-c .rb{position:absolute;left:5px;bottom:5px;width:38px;height:38px;border-radius:50%;background:rgba(20,22,30,.78);padding:6px;z-index:3;display:none;box-shadow:0 0 0 2px rgba(255,255,255,.7)}
.gm-werewolf .ww-c .rb svg{width:100%;height:100%;display:block}
.gm-werewolf .ww-c .rb.on{display:block}
.gm-werewolf .ww-c .vb{position:absolute;right:5px;top:5px;min-width:26px;height:26px;border-radius:13px;background:var(--pk);color:#fff;font:900 15px/26px var(--sans);text-align:center;padding:0 7px;z-index:4;display:none;box-shadow:0 2px 6px rgba(0,0,0,.4)}
.gm-werewolf .ww-c .vb.on{display:block;animation:ww-pop .35s}
.gm-werewolf .ww-c .vb.wv{background:#7a1020}
@keyframes ww-pop{from{transform:scale(1.7)}to{transform:scale(1)}}
.gm-werewolf .ww-c .vt{position:absolute;left:50%;bottom:5px;transform:translateX(-50%);max-width:88%;padding:1px 7px;border-radius:7px;background:rgba(0,0,0,.62);color:#fff;font:800 11px/1.5 var(--sans);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;z-index:4;display:none}
.gm-werewolf .ww-c .vt.on{display:block}
.gm-werewolf .ww-c .hr{position:absolute;left:5px;top:30px;width:22px;z-index:4;display:none}
.gm-werewolf .ww-c .hr.on{display:block;animation:ww-beat 1s infinite}
@keyframes ww-beat{50%{transform:scale(1.2)}}
.gm-werewolf .ww-c .mk{position:absolute;right:5px;top:34px;width:34px;height:34px;border-radius:50%;background:rgba(20,22,30,.82);padding:5px;z-index:4;display:none;box-shadow:0 0 0 2px #fff}
.gm-werewolf .ww-c .mk.on{display:block}
.gm-werewolf .ww-c .bub{position:absolute;left:6px;right:6px;top:28px;padding:5px 8px;border-radius:10px;background:#fff;color:#222;font:700 12px/1.25 var(--sans);z-index:6;opacity:0;transform:translateY(6px);transition:opacity .25s,transform .25s;pointer-events:none;max-height:56px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,.3)}
.gm-werewolf .ww-c .bub.on{opacity:1;transform:none}
.gm-werewolf .ww-c .bub.wf{background:#4b1017;color:#ffd7d3}
.gm-werewolf .ww-bar{display:flex;align-items:center;gap:12px;padding:10px 14px}
.gm-werewolf .ww-bar .pr{flex:1;min-width:0;font:800 15px/1.3 var(--sans)}
.gm-werewolf .ww-bar .pr small{display:block;font:600 12.5px var(--sans);color:var(--mut);margin-top:3px}
.gm-werewolf .ww-bar .ac{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
.gm-werewolf .ww-b{height:44px;padding:0 18px;border-radius:22px;border:2px solid var(--ln);background:var(--pn2);color:var(--ink);font:900 14px var(--sans);white-space:nowrap}
.gm-werewolf .ww-b.pk{background:var(--pk);border-color:var(--pk);color:#fff}
.gm-werewolf .ww-b.on{background:#ffb300;border-color:#ffb300;color:#2a1c00}
.gm-werewolf .ww-b.dg{background:#6b2fa0;border-color:#6b2fa0;color:#fff}
.gm-werewolf .ww-b:hover:not(:disabled){filter:brightness(1.08);transform:translateY(-1px)}
.gm-werewolf .ww-b:disabled{opacity:.4;cursor:default}
.gm-werewolf .ww-fx{position:absolute;inset:0;pointer-events:none;z-index:20;overflow:hidden}
.gm-werewolf .ww-ban{position:absolute;left:0;right:0;top:36%;display:flex;align-items:center;justify-content:center;gap:16px;padding:18px 0;background:linear-gradient(90deg,transparent,rgba(10,12,30,.82) 18%,rgba(10,12,30,.82) 82%,transparent);color:#fff;font:900 46px/1 var(--sans);letter-spacing:-.5px;text-shadow:0 3px 10px rgba(0,0,0,.6);animation:ww-ban 2.2s forwards}
.gm-werewolf .ww-ban svg{width:62px;height:62px}
.gm-werewolf .ww-ban.day{background:linear-gradient(90deg,transparent,rgba(255,170,40,.88) 18%,rgba(255,170,40,.88) 82%,transparent)}
@keyframes ww-ban{0%{opacity:0;transform:translateX(-80px)}15%{opacity:1;transform:none}80%{opacity:1;transform:none}100%{opacity:0;transform:translateX(80px)}}
.gm-werewolf .ww-death{position:absolute;left:50%;top:50%;width:320px;margin:-150px 0 0 -160px;padding:18px 16px 16px;border-radius:18px;background:linear-gradient(#2c2f3a,#16181f);color:#fff;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.6);border:3px solid #ff4d86;animation:ww-death 3.6s forwards}
.gm-werewolf .ww-death .ww-tomb{width:70px;display:block;margin:0 auto 6px}
.gm-werewolf .ww-death .av{width:90px;height:90px;margin:-6px auto 4px;border-radius:50%;overflow:hidden;background:#8aa;filter:grayscale(.8)}
.gm-werewolf .ww-death h4{margin:6px 0 2px;font:900 22px var(--sans)}
.gm-werewolf .ww-death p{margin:3px 0;font:700 14px var(--sans);color:#cfd3dc}
.gm-werewolf .ww-death .rr{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:8px;font:900 17px var(--sans)}
.gm-werewolf .ww-death .rr svg{width:38px;height:38px}
@keyframes ww-death{0%{opacity:0;transform:translateY(40px) scale(.8) rotate(-4deg)}10%{opacity:1;transform:none}88%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-20px) scale(.95)}}
.gm-werewolf .ww-pane{position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(8,10,22,.62);backdrop-filter:blur(3px);overflow:auto;color:#fff}
.gm-werewolf .ww-pane.solid{background:#10162e;backdrop-filter:none;padding:0}
.gm-werewolf .ww-pane canvas.tcv{position:absolute;inset:0;width:100%;height:100%}
.gm-werewolf .ww-box{position:relative;width:100%;max-width:440px;margin:auto;padding:18px 18px 16px;border-radius:20px;background:linear-gradient(#2d3250,#171b33);border:3px solid rgba(255,255,255,.14);box-shadow:0 20px 50px rgba(0,0,0,.5);text-align:center;animation:ww-in .3s}
.gm-werewolf .ww-box.wide{max-width:640px}
@keyframes ww-in{from{transform:scale(.92);opacity:0}to{transform:none;opacity:1}}
.gm-werewolf .ww-box h3{margin:2px 0 8px;font:900 24px var(--sans)}
.gm-werewolf .ww-box p{margin:6px 0;font:600 14px/1.45 var(--sans);color:rgba(255,255,255,.85)}
.gm-werewolf .ww-kick{display:inline-block;margin:0 0 4px;font:900 11px var(--sans);letter-spacing:1.5px;text-transform:uppercase;color:#ffd54a}
.gm-werewolf .ww-big{display:block;width:100%;min-height:52px;margin:9px 0;border:0;border-radius:16px;color:#fff;font:900 19px var(--sans);box-shadow:inset 0 -5px 0 rgba(0,0,0,.22),0 6px 14px rgba(0,0,0,.3)}
.gm-werewolf .ww-big small{display:block;font:700 12px var(--sans);opacity:.85}
.gm-werewolf .ww-big.pk{background:linear-gradient(#ff5a8a,#d81b60)}
.gm-werewolf .ww-big.bl{background:linear-gradient(#4a8cf0,#2158b8)}
.gm-werewolf .ww-big.gr{background:linear-gradient(#4cc26c,#23893f)}
.gm-werewolf .ww-big.gy{background:linear-gradient(#5a6178,#3b4157)}
.gm-werewolf .ww-sm{height:40px;padding:0 16px;border-radius:12px;border:2px solid rgba(255,255,255,.25);background:rgba(255,255,255,.1);color:#fff;font:800 13px var(--sans);margin:3px}
.gm-werewolf .ww-row{display:flex;justify-content:center;flex-wrap:wrap;gap:4px}
.gm-werewolf .ww-opt{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:8px 0;text-align:left;font:800 13px var(--sans);color:rgba(255,255,255,.9)}
.gm-werewolf .ww-seg{display:flex;gap:4px}
.gm-werewolf .ww-seg button{min-width:56px;height:36px;border-radius:10px;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);font:900 13px var(--sans);padding:0 8px}
.gm-werewolf .ww-seg button.on{background:#ffd54a;border-color:#fff;color:#1d1a10}
.gm-werewolf .ww-step{display:flex;align-items:center;gap:8px}
.gm-werewolf .ww-step button{width:34px;height:34px;border-radius:10px;border:2px solid rgba(255,255,255,.25);background:rgba(255,255,255,.1);font:900 18px var(--sans);padding:0}
.gm-werewolf .ww-step span{min-width:28px;text-align:center;font:900 17px var(--sans)}
.gm-werewolf .ww-cust{display:grid;grid-template-columns:1fr 1fr;gap:2px 16px;margin-top:6px}
.gm-werewolf .ww-cust .ww-opt{margin:3px 0}
.gm-werewolf .ww-cust .ww-opt>span{display:flex;align-items:center;gap:6px}
.gm-werewolf .ww-cust .ww-ri{width:24px;height:24px}
.gm-werewolf .ww-logo{font:900 56px/1 var(--sans);letter-spacing:-2px;color:#fff;text-shadow:0 4px 0 #8b1a3c,0 8px 22px rgba(0,0,0,.55);margin:6px 0 2px}
.gm-werewolf .ww-logo em{font-style:normal;color:#ff4d86}
.gm-werewolf .ww-tag{font:700 14px var(--sans);color:rgba(255,255,255,.88);margin:0 0 12px;text-shadow:0 1px 4px rgba(0,0,0,.6)}
.gm-werewolf .ww-card{position:relative;width:250px;height:350px;margin:6px auto 10px;perspective:900px}
.gm-werewolf .ww-card>div{position:absolute;inset:0;border-radius:18px;backface-visibility:hidden;transition:transform .9s cubic-bezier(.3,1.3,.5,1);box-shadow:0 18px 40px rgba(0,0,0,.55)}
.gm-werewolf .ww-card .bk{background:repeating-linear-gradient(45deg,#3b2b6a 0 10px,#2d2154 10px 20px);border:6px solid #f4c430;display:grid;place-items:center}
.gm-werewolf .ww-card .bk svg{width:90px;opacity:.9}
.gm-werewolf .ww-card .fr{transform:rotateY(180deg);border:6px solid var(--rc);background:linear-gradient(#fff6e2,#f0dcae);color:#2b2118;display:flex;flex-direction:column;align-items:center;padding:12px 12px 10px}
.gm-werewolf .ww-card.flip .bk{transform:rotateY(180deg)}
.gm-werewolf .ww-card.flip .fr{transform:none}
.gm-werewolf .ww-card .fr .art{width:130px;height:130px;border-radius:50%;background:radial-gradient(circle,#fff,var(--rc));display:grid;place-items:center;box-shadow:inset 0 0 0 4px rgba(0,0,0,.1);margin-top:2px}
.gm-werewolf .ww-card .fr .art svg{width:92px;height:92px}
.gm-werewolf .ww-card .fr h4{margin:8px 0 0;font:900 24px var(--sans);color:var(--rc);filter:brightness(.8)}
.gm-werewolf .ww-card .fr .tm{font:900 11px var(--sans);letter-spacing:1.2px;text-transform:uppercase;color:#8a6a2b;margin:2px 0 6px}
.gm-werewolf .ww-card .fr p{margin:0;font:700 12.5px/1.35 var(--sans);color:#3d3224}
.gm-werewolf .ww-tbl{width:100%;border-collapse:collapse;margin:8px 0;font:700 13px var(--sans)}
.gm-werewolf .ww-tbl td{padding:2px 4px;font-size:12px;border-bottom:1px solid rgba(255,255,255,.1);text-align:left;vertical-align:middle}
.gm-werewolf .ww-tbl tr.win td{color:#ffd54a}
.gm-werewolf .ww-tbl .ww-ri{width:20px;height:20px;vertical-align:middle;margin-right:6px}
.gm-werewolf .ww-tbl .ava{width:24px;height:24px;border-radius:50%;overflow:hidden;background:#7ab;display:inline-block;vertical-align:middle;margin-right:6px}
.gm-werewolf .ww-tbl .ava svg{width:100%;height:100%;display:block}
.gm-werewolf .ww-tbl tr.dd td:first-child{opacity:.7}
.gm-werewolf .ww-rules{text-align:left;max-height:380px;overflow:auto;padding-right:6px}
.gm-werewolf .ww-rules .ww-rr{display:flex;gap:10px;align-items:flex-start;margin:7px 0}
.gm-werewolf .ww-rules .ww-ri{width:38px;height:38px;flex:none}
.gm-werewolf .ww-rules p{margin:0;font:600 12.5px/1.35 var(--sans)}
.gm-werewolf .ww-rules b{font:900 14px var(--sans)}
.gm-werewolf .ww-net{position:absolute;right:56px;top:14px;display:none}
.gm-werewolf .ww-stage.port .ww-head .tt{font-size:18px}
.gm-werewolf .ww-stage.port .ww-head .tm{font-size:22px}
.gm-werewolf .ww-stage.port .ww-c .nm{font-size:10.5px;padding:1px 5px;top:3px}
.gm-werewolf .ww-stage.port .ww-c .vb{min-width:20px;height:20px;font-size:12px;line-height:20px;top:3px;right:3px}
.gm-werewolf .ww-stage.port .ww-c .vt{font-size:9px}
.gm-werewolf .ww-stage.port .ww-c .mk{width:24px;height:24px;padding:3px;top:24px}
.gm-werewolf .ww-stage.port .ww-c .rb{width:26px;height:26px;padding:4px}
.gm-werewolf .ww-stage.port .ww-c .hr{width:16px;top:22px}
.gm-werewolf .ww-stage.port .ww-c .bub{font-size:10px;padding:3px 5px;top:20px;max-height:42px}
.gm-werewolf .ww-stage.port .ww-bar{padding:8px 10px;gap:8px;flex-wrap:wrap}
.gm-werewolf .ww-stage.port .ww-bar .pr{font-size:13px;flex-basis:100%}
.gm-werewolf .ww-stage.port .ww-b{height:38px;padding:0 13px;font-size:12.5px}
.gm-werewolf .ww-stage.port .ww-ban{font-size:30px}
.gm-werewolf .ww-stage.port .ww-ban svg{width:40px;height:40px}
.gm-werewolf .ww-stage.port .ww-log{font-size:13px}
@media (prefers-reduced-motion:reduce){.gm-werewolf *{animation-duration:.01s!important;transition-duration:.01s!important}}
`;

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const HEART = '<svg viewBox="0 0 32 32"><path d="M16 29 C2 20 3 8 10 7 C13 7 15 9 16 11 C17 9 19 7 22 7 C29 8 30 20 16 29Z" fill="#ff4d86" stroke="#fff" stroke-width="2"/></svg>';
  const SEND = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 20 L22 12 L3 4 L3 10 L16 12 L3 14Z"/></svg>';
  const GEAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  const INFO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>';
  const SUNI = '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="13" fill="#ffe27a"/><g stroke="#ffe27a" stroke-width="5" stroke-linecap="round"><path d="M32 6v8M32 50v8M6 32h8M50 32h8M13 13l6 6M45 45l6 6M13 51l6-6M45 19l6-6"/></g></svg>';
  const MOONI = '<svg viewBox="0 0 64 64"><path d="M40 8 A24 24 0 1 0 56 44 A19 19 0 0 1 40 8Z" fill="#f4ecc2"/><circle cx="46" cy="14" r="2.5" fill="#fff"/><circle cx="54" cy="26" r="1.8" fill="#fff"/></svg>';
  const FRAME = [['land', 1100, 660], ['port', 420, 940]];
  const LAY = {
    land: { W: 1100, H: 660, head: [10, 10, 372, 108], roles: [10, 126, 372, 84], chat: [10, 218, 372, 432], grid: [394, 10, 696, 516], bar: [394, 534, 696, 116] },
    port: { W: 420, H: 940, head: [6, 6, 408, 76], roles: null, chat: [6, 652, 408, 282], grid: [6, 88, 408, 450], bar: [6, 544, 408, 100] }
  };
  const PHT = { deal: 'Get ready', night: 'Night', dawn: 'Day', discuss: 'Discussion', vote: 'Voting', defense: 'Last words', exec: 'Judgement', hunter: 'Hunter\'s shot', hshot: 'Hunter\'s shot', over: 'Game over' };

  const HOW = `<div class="ww-rules"><p><b>The game.</b> A village hides werewolves. Each night the wolves eat one villager. Each day everybody discusses and votes to lynch one suspect. The village wins when all wolves are dead. The wolves win when they equal or outnumber everyone else.</p>
<p style="margin-top:8px"><b>Night.</b> Roles with powers pick a target secretly. Wolves chat privately in the Wolves tab and must agree on a victim.</p>
<p style="margin-top:8px"><b>Day.</b> The dead are announced with their roles. Discuss, then vote: click a player to vote, click again to change. Most votes goes to the gallows for last words and is lynched. A tie or fewer than half of the living voting means nobody is lynched.</p>
<p style="margin-top:8px"><b>Solo winners.</b> The Jester wins if lynched, and the game goes on. Lovers of different teams win only as the last two alive.</p>
<div style="margin-top:12px">${RKEYS.map(r => `<div class="ww-rr">${roleIcon(r)}<div><b>${ROLE[r].n}</b> <span style="opacity:.6;font-size:11px">${TEAM[ROLE[r].team]}</span><p>${esc(ROLE[r].d)}</p></div></div>`).join('')}</div></div>`;

  Ameplay.register({
    id: 'werewolf',
    title: 'Werewolf',
    category: 'Strategy',
    tint: '#3b2a6b',
    blurb: 'Wolvesville-style social deduction. Villagers, wolves, a Seer, Doctor, Witch, Hunter and more. Night actions, day votes, wolf chat, smart bots and online parties of 5 to 16.',
    help: 'Click a player to act or vote · type in the chat to talk · Wolves chat privately at night · Enter sends',
    width: 1100,
    format: v => v + (v === 1 ? ' win' : ' wins'),
    icon: ICON,
    _t,
    css: CSS,
    mount(root, api) {
      const opt = Object.assign({ n: 8, speed: 'Normal', rm: 'auto', cust: { seer: 1, doctor: 1, hunter: 1, witch: 0, bodyguard: 0, jester: 0, cupid: 0, littlegirl: 0, werewolf: 2, alpha: 0 }, wins: 0, played: 0 }, api.load() || {});
      const saveOpt = () => api.save(opt);
      const M = { mode: 'solo', role: 'local', eng: null, seat: 0, pids: [], players: [], v: null, tok: 0, size: 8, bots: false, hooked: false, dlLocal: 0, chat: [], tab: 'day', unread: {}, dq: [], dbusy: false, roleShown: false, overShown: false, bub: {}, wpick: false, cpA: null, nt: 0, paneFn: null, title: false, ptab: '' };
      let K = 1, port = null, cards = [], lastTick = performance.now();

      const wrap = document.createElement('div'); wrap.className = 'ww-wrap';
      wrap.innerHTML = `<div class="ww-stage"><div class="ww-p ww-head"><canvas></canvas><div class="tt"></div><div class="st"></div><div class="tm"></div><button class="ww-ib" data-u="menu" style="right:8px" aria-label="Menu">${GEAR}</button><div class="bar"><i></i></div></div><div class="ww-p ww-roles"></div><div class="ww-p ww-chat"><div class="ww-tabs"></div><div class="ww-log"></div><div class="ww-in"><input maxlength="200" placeholder="Type your message" autocomplete="off"><button aria-label="Send">${SEND}</button></div></div><div class="ww-p ww-grid"></div><div class="ww-p ww-bar"><div class="pr"></div><div class="ac"></div></div><div class="ww-fx"></div><div class="ww-pane" hidden></div></div>`;
      root.append(wrap);
      const stage = wrap.firstChild, $ = s => stage.querySelector(s);
      const headEl = $('.ww-head'), cv = headEl.querySelector('canvas'), cx = cv.getContext('2d'), rolesEl = $('.ww-roles'), chatEl = $('.ww-chat'), tabsEl = $('.ww-tabs'), logEl = $('.ww-log'), inEl = $('.ww-in input'), sendEl = $('.ww-in button'), gridEl = $('.ww-grid'), barEl = $('.ww-bar'), fxEl = $('.ww-fx'), paneEl = $('.ww-pane');
      stage.style.setProperty('--scd', svgUrl(sceneSvg(false))); stage.style.setProperty('--scn', svgUrl(sceneSvg(true))); stage.style.setProperty('--sc', 'var(--scd)');

      let ac = null;
      function snd(k) {
        if (api.muted) return;
        try {
          ac = ac || new (window.AudioContext || window.webkitAudioContext)();
          if (ac.state === 'suspended') ac.resume();
          const tone = (f, d, type, vol, at, f2) => {
            const t = ac.currentTime + (at || 0), o = ac.createOscillator(), g = ac.createGain();
            o.type = type; o.frequency.setValueAtTime(f, t);
            if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
            g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(.05, d / 3)); g.gain.exponentialRampToValueAtTime(.0001, t + d);
            o.connect(g).connect(ac.destination); o.start(t); o.stop(t + d + .05);
          };
          if (k === 'night') { tone(196, 1.4, 'sine', .08); tone(147, 1.6, 'sine', .07, .2); tone(98, 1.8, 'triangle', .05, .1); }
          else if (k === 'day') { [523, 659, 784, 1046].forEach((f, i) => tone(f, .5, 'sine', .07, i * .12)); }
          else if (k === 'howl') { tone(260, 1.6, 'sawtooth', .035, 0, 640); tone(640, 1.2, 'sawtooth', .03, 1.2, 380); }
          else if (k === 'death') { tone(150, .5, 'triangle', .1, 0, 50); tone(80, .6, 'sine', .08, .1); }
          else if (k === 'vote') tone(900, .06, 'square', .03);
          else if (k === 'win') [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, .35, 'sine', .07, i * .13));
          else if (k === 'lose') [392, 330, 262, 196].forEach((f, i) => tone(f, .4, 'triangle', .07, i * .2));
          else if (k === 'flip') { tone(300, .25, 'sine', .06, 0, 900); tone(1200, .3, 'sine', .04, .25); }
          else tone(520, .05, 'sine', .05);
        } catch (e) {}
      }

      function fit() {
        const p = (root.clientWidth || 1000) < 720;
        if (p !== port) layout(p);
        const L = p ? LAY.port : LAY.land, w = wrap.clientWidth;
        if (!w) return;
        K = w / L.W; stage.style.transform = `scale(${K})`;
      }
      function layout(p) {
        port = p; const L = p ? LAY.port : LAY.land;
        stage.className = 'ww-stage' + (p ? ' port' : '') + (M.nightOn ? ' night' : '');
        stage.style.width = L.W + 'px'; stage.style.height = L.H + 'px';
        const place = (e, r) => { if (!r) { e.style.display = 'none'; return; } e.style.display = ''; e.style.left = r[0] + 'px'; e.style.top = r[1] + 'px'; e.style.width = r[2] + 'px'; e.style.height = r[3] + 'px'; };
        place(headEl, L.head); place(rolesEl, L.roles); place(chatEl, L.chat); place(gridEl, L.grid); place(barEl, L.bar);
        wrap.style.aspectRatio = L.W + ' / ' + L.H;
        wrap.style.width = p ? 'min(100%, 560px)' : `min(100%, ${L.W}px, calc((100dvh - var(--goff, 250px)) * ${(L.W / L.H).toFixed(4)}))`;
        cv.width = L.head[2] * 2; cv.height = L.head[3] * 2;
        gridCols();
      }
      function gridCols() {
        const n = cards.length || 8, c = n <= 6 ? 3 : 4, r = Math.ceil(n / c);
        gridEl.style.gridTemplateColumns = `repeat(${c},1fr)`; gridEl.style.gridTemplateRows = `repeat(${r},1fr)`;
      }
      api.on(window, 'resize', fit);
      if (window.ResizeObserver) { const ro = new ResizeObserver(() => fit()); ro.observe(root); ro.observe(wrap); api.timeout(() => {}, 0); }

      function buildCards(n) {
        gridEl.innerHTML = ''; cards = [];
        for (let i = 0; i < n; i++) {
          const el = document.createElement('div'); el.className = 'ww-c'; el.dataset.i = i;
          el.innerHTML = `<div class="av"></div><div class="tb">${TOMB}</div><div class="nm"></div><div class="rb"></div><div class="vb"></div><div class="vt"></div><div class="hr">${HEART}</div><div class="mk"></div><div class="bub"></div>`;
          const q = s => el.querySelector(s);
          cards.push({ el, av: q('.av'), nm: q('.nm'), rb: q('.rb'), vb: q('.vb'), vt: q('.vt'), hr: q('.hr'), mk: q('.mk'), bub: q('.bub'), seed: -1, ck: '' });
          gridEl.append(el);
        }
        gridCols();
      }

      const sendAct = a => {
        if (M.role === 'guest') api.net.send({ t: 'a', a });
        else if (M.eng) { M.eng.act(M.seat, a); flush(); }
      };

      function modeOf(v) {
        const me = v.me, c = me.ctl;
        if (me.shot) return { k: 'shot', valid: v.players.filter(p => p.a && p.i !== v.q).map(p => p.i) };
        if (!me.alive) return null;
        if (v.ph === 'vote') return { k: 'vote', valid: v.players.filter(p => p.a && p.i !== v.q).map(p => p.i) };
        if (v.ph === 'night' && c) {
          if (c.k === 'witch') return M.wpick && c.poison ? { k: 'poison', valid: c.valid } : null;
          if (c.k === 'cupid') return { k: 'cupid', valid: c.valid.filter(i => i !== M.cpA) };
          return { k: 't', valid: c.valid };
        }
        return null;
      }
      function onCard(i) {
        const v = M.v; if (!v) return;
        const m = modeOf(v);
        if (!m || !m.valid.includes(i)) return;
        snd('click');
        if (m.k === 'shot') sendAct({ k: 'shot', t: i });
        else if (m.k === 'vote') { sendAct({ k: 'vote', t: v.players[v.q].v === i ? -1 : i }); snd('vote'); }
        else if (m.k === 'poison') { M.wpick = false; sendAct({ k: 'w', o: 'poison', t: i }); }
        else if (m.k === 'cupid') {
          if (M.cpA === null) { M.cpA = i; render(); } else { const a = M.cpA; M.cpA = null; sendAct({ k: 'cp', a, b: i }); }
        } else sendAct({ k: 't', t: i });
      }
      gridEl.addEventListener('click', e => { const c = e.target.closest('.ww-c'); if (c) onCard(+c.dataset.i); });

      function lineEl(e) {
        const v = M.v, d = document.createElement('div');
        const nmOf = f => f === -2 ? 'Werewolf' : f >= 0 && v ? `${f + 1} ${v.players[f].name}` : '';
        if (e.ch === 'sys') {
          if (/^(Night|Day) \d+ has started\.$/.test(e.x)) { d.className = 'ln ph'; d.innerHTML = `<span></span>${/^Night/.test(e.x) ? MOONI : SUNI}`; d.firstChild.textContent = e.x; }
          else { d.className = 'ln sys' + (e.p ? ' priv' : ''); d.textContent = e.x; }
        } else {
          d.className = 'ln ' + (e.ch === 'wolf' ? 'wolf' : e.ch === 'dead' ? 'dead' : e.ch === 'last' ? 'last' : '');
          const b = document.createElement('b'); b.textContent = nmOf(e.f) + (e.ch === 'last' ? ' (last words): ' : ': ');
          d.append(b, document.createTextNode(e.x));
        }
        return d;
      }
      const tabOf = e => e.ch === 'wolf' ? 'wolf' : e.ch === 'dead' ? 'dead' : 'day';
      function addChat(e) {
        M.chat.push(e);
        const tb = tabOf(e);
        if (tb === M.tab) { const atEnd = logEl.scrollTop + logEl.clientHeight > logEl.scrollHeight - 40; logEl.append(lineEl(e)); if (atEnd) logEl.scrollTop = logEl.scrollHeight; } else M.unread[tb] = true;
      }
      function rebuildLog() {
        logEl.innerHTML = '';
        M.chat.forEach(e => { if (tabOf(e) === M.tab) logEl.append(lineEl(e)); });
        logEl.scrollTop = logEl.scrollHeight;
      }
      tabsEl.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; M.tab = b.dataset.t; M.unread[M.tab] = false; rebuildLog(); render(); });
      function sendChat() {
        const x = inEl.value.trim(), v = M.v;
        if (!x || !v) return;
        const ch = M.tab === 'wolf' ? 'wolf' : M.tab === 'dead' ? 'dead' : (v.ph === 'defense' && v.defd === v.q ? 'last' : 'day');
        sendAct({ k: 'chat', ch, x }); inEl.value = '';
      }
      sendEl.addEventListener('click', sendChat);
      inEl.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); sendChat(); } });
      inEl.addEventListener('keyup', e => e.stopPropagation());

      function canTalk(v) {
        const ph = v.ph, me = v.me;
        if (M.tab === 'dead') return !me.alive;
        if (M.tab === 'wolf') return me.alive && isWolf(me.role) && ph === 'night';
        if (!me.alive) return false;
        if (ph === 'over') return true;
        if (ph === 'defense') return v.defd === v.q;
        return ['dawn', 'discuss', 'vote', 'exec', 'hshot'].includes(ph);
      }

      function bubble(f, x, wf) {
        const c = cards[f]; if (!c) return;
        c.bub.textContent = x.length > 70 ? x.slice(0, 68) + '…' : x; c.bub.classList.toggle('wf', !!wf); c.bub.classList.add('on');
        clearTimeout(M.bub[f]); M.bub[f] = setTimeout(() => c.bub.classList.remove('on'), 4200);
      }
      function banner(text, day, ico) {
        const d = document.createElement('div'); d.className = 'ww-ban' + (day ? ' day' : '');
        d.innerHTML = `${ico}<span></span>`; d.lastChild.textContent = text; fxEl.append(d);
        setTimeout(() => d.remove(), 2300);
      }
      function popDeath(d) {
        const el = document.createElement('div'); el.className = 'ww-death';
        const me = d.i === M.v.q;
        el.innerHTML = `${TOMB}<div class="av">${avatar(d.av)}</div><h4></h4><p></p><div class="rr">${roleIcon(d.r)}<span>${esc(ROLE[d.r].n)}</span></div>`;
        el.querySelector('h4').textContent = me ? 'You died' : d.name;
        el.querySelector('p').textContent = me ? ('You ' + CAUSE[d.c]).replace('You was', 'You were') : (CAUSE[d.c] || 'died');
        fxEl.append(el); snd('death');
        setTimeout(() => { el.remove(); M.dbusy = false; runDq(); }, 3700);
      }
      function runDq() { if (M.dbusy || !M.dq.length) return; M.dbusy = true; popDeath(M.dq.shift()); }

      function pane(html, cls, fn) {
        paneEl.className = 'ww-pane ' + (cls || ''); paneEl.innerHTML = html; paneEl.hidden = false; M.paneFn = fn || null; M.title = cls === 'solid';
        paneEl.scrollTop = 0;
      }
      function hidePane() { paneEl.hidden = true; paneEl.innerHTML = ''; M.paneFn = null; M.title = false; }
      paneEl.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b && M.paneFn) { snd('click'); M.paneFn(b.dataset.a, b, e); } });

      function rolesFor(n) { return opt.rm === 'custom' ? customRoles(n, opt.cust) : autoRoles(n); }
      function compText(n) {
        const c = {}; rolesFor(n).forEach(r => { c[r] = (c[r] || 0) + 1; });
        return RKEYS.filter(r => c[r]).map(r => `${c[r]} ${ROLE[r].n}${c[r] > 1 ? 's' : ''}`).join(' · ');
      }
      function showTitle() {
        M.mode = 'solo'; M.role = 'local'; M.eng = null; M.v = null; M.cust = M.cust || false;
        const stp = (id, val, lo, hi) => `<div class="ww-step"><button data-a="${id}-">-</button><span>${val}</span><button data-a="${id}+">+</button></div>`;
        const custom = opt.rm === 'custom' ? `<div class="ww-cust">${['werewolf', 'alpha', 'seer', 'doctor', 'witch', 'hunter', 'bodyguard', 'jester', 'cupid', 'littlegirl'].map(r => `<div class="ww-opt"><span>${roleIcon(r)}${ROLE[r].n}</span>${stp('c' + r, opt.cust[r] | 0)}</div>`).join('')}</div><p style="font-size:11.5px;opacity:.7">Villagers fill the remaining seats.</p>` : '';
        pane(`<canvas class="tcv"></canvas><div class="ww-box wide" style="background:rgba(14,18,40,.78)"><div class="ww-logo">Were<em>wolf</em></div><p class="ww-tag">Find the wolves before they find you.${opt.wins ? ' · ' + opt.wins + (opt.wins === 1 ? ' win' : ' wins') : ''}</p>
<div class="ww-row" style="gap:12px;flex-wrap:nowrap"><button class="ww-big pk" data-a="solo" style="flex:1">Play vs bots<small>You and ${opt.n - 1} bots</small></button><button class="ww-big bl" data-a="online" style="flex:1">Play online<small>5 to 16 players, bots fill seats</small></button></div>
<div class="ww-opt"><span>Players (solo)</span>${stp('n', opt.n)}</div>
<div class="ww-opt"><span>Timers</span><div class="ww-seg">${Object.keys(SPEED).map(k => `<button data-a="sp-${k}" class="${opt.speed === k ? 'on' : ''}">${k}</button>`).join('')}</div></div>
<div class="ww-opt"><span>Roles</span><div class="ww-seg"><button data-a="rm-auto" class="${opt.rm === 'auto' ? 'on' : ''}">Balanced</button><button data-a="rm-custom" class="${opt.rm === 'custom' ? 'on' : ''}">Custom</button></div></div>${custom}
<p style="font-size:12px;opacity:.75;margin-top:6px">${compText(opt.n)}${opt.rm === 'auto' ? ' · villagers fill the rest' : ''}</p>
<div class="ww-row"><button class="ww-sm" data-a="how">How to play</button></div></div>`, 'solid', a => {
          if (a === 'solo') { opt.played = opt.played | 0; saveOpt(); newMatch(null); }
          else if (a === 'online') { saveOpt(); startOnline(); }
          else if (a === 'how') pane(`<div class="ww-box wide"><p class="ww-kick">Werewolf</p><h3>How to play</h3>${HOW}<div class="ww-row"><button class="ww-big gy" data-a="back" style="max-width:240px">Back</button></div></div>`, '', () => showTitle());
          else if (a === 'n-' || a === 'n+') { opt.n = Math.max(5, Math.min(16, opt.n + (a === 'n+' ? 1 : -1))); saveOpt(); showTitle(); }
          else if (a.startsWith('sp-')) { opt.speed = a.slice(3); saveOpt(); showTitle(); }
          else if (a.startsWith('rm-')) { opt.rm = a.slice(3); saveOpt(); showTitle(); }
          else if (a[0] === 'c' && /[+-]$/.test(a)) { const r = a.slice(1, -1); opt.cust[r] = Math.max(0, Math.min(r === 'cupid' || r === 'witch' ? 1 : 4, (opt.cust[r] | 0) + (a.endsWith('+') ? 1 : -1))); saveOpt(); showTitle(); }
        });
      }

      const myName = () => { try { const p = JSON.parse(localStorage.getItem('gameplay:profile')); return String((p && (p.username || p.displayName)) || 'You').slice(0, 16); } catch (e) { return 'You'; } };
      function resetUI() {
        M.chat = []; M.unread = {}; M.tab = 'day'; M.dq = []; M.dbusy = false; M.roleShown = false; M.overShown = false; M.wpick = false; M.cpA = null; M.v = null; M.prevPh = null;
        logEl.innerHTML = ''; fxEl.innerHTML = ''; cards = []; gridEl.innerHTML = ''; M.nightOn = false; stage.classList.remove('night');
      }
      function newMatch(r) {
        M.tok++;
        let humans, n;
        if (r) {
          humans = r.players.slice(0, 16);
          n = Math.max(5, r.bots ? Math.max(+r.size || 0, humans.length) : humans.length);
          M.mode = 'online'; M.role = 'host';
        } else { humans = [{ id: 'me', name: myName() }]; n = opt.n; M.mode = 'solo'; M.role = 'local'; }
        const seats = shuffle([...Array(n).keys()]), names = Array(n), bots = Array(n).fill(true), pids = Array(n).fill(null);
        const taken = new Set(humans.map(h => h.name.toLowerCase()));
        const pool = shuffle(NAMES.slice()).filter(x => !taken.has(x.toLowerCase()));
        humans.forEach((h, i) => { const s = seats[i]; names[s] = h.name; bots[s] = false; pids[s] = h.id; if (!r || h.id === r.id) M.seat = s; });
        for (let s = 0; s < n; s++) if (bots[s]) names[s] = pool.pop() || 'Bot' + s;
        const roles = shuffle(rolesFor(n));
        const avs = names.map(() => Math.floor(Math.random() * 99999));
        M.pids = r ? pids.map((id, s) => (id === r.id ? null : id)) : []; M.players = humans;
        resetUI(); hidePane();
        M.eng = Game({ roles, names, bots, avs, T: SPEED[opt.speed] || SPEED.Normal });
        M.eng.start();
        M.over = false;
        api.score(opt.wins); lastTick = performance.now();
        flush();
      }

      function applyView(v) {
        const pv = M.v; M.v = v;
        M.dlLocal = performance.now() + v.left;
        if (!pv || pv.n !== v.n || cards.length !== v.n) buildCards(v.n);
        if (v.full) { M.chat = []; logEl.innerHTML = ''; }
        const wasEmpty = !M.chat.length;
        v.chat.forEach(e => {
          addChat(e);
          if (!v.full && (e.ch === 'day' || e.ch === 'last') && e.f >= 0) bubble(e.f, e.x, false);
          else if (!v.full && e.ch === 'wolf' && e.f >= 0) bubble(e.f, e.x, true);
        });
        if (pv && pv.n === v.n && v.ph !== 'over') v.players.forEach((p, i) => { if (pv.players[i].a && !p.a && p.r) M.dq.push({ i, name: p.name, av: p.av, r: p.r, c: p.c }); });
        runDq();
        const night = v.ph === 'night' || (v.ph === 'hunter' && false);
        const ph = v.ph;
        if (!pv || pv.ph !== ph || pv.day !== v.day) onPhase(pv, v);
        M.nightOn = night; stage.classList.toggle('night', night);
        stage.style.setProperty('--sc', night ? 'var(--scn)' : 'var(--scd)');
        if (ph !== 'night' && M.wpick) M.wpick = false;
        if (ph !== 'night') M.cpA = null;
        render();
      }
      function onPhase(pv, v) {
        const ph = v.ph;
        if (ph === 'deal' && !M.roleShown && !v.full) { M.roleShown = true; showRoleCard(v); }
        else if (ph === 'deal' && !M.roleShown) { M.roleShown = true; showRoleCard(v); }
        if (ph !== 'deal' && M.roleShownPane) { M.roleShownPane = false; hidePane(); }
        if (ph === 'night') {
          banner(`Night ${v.day}`, false, MOONI); snd('night'); if (v.day > 1 || true) api.timeout(() => snd('howl'), 900);
          if (v.me.alive && (isWolf(v.me.role))) M.tab = 'wolf'; else if (M.tab === 'wolf' && v.me.alive) M.tab = 'day';
          rebuildLog();
        } else if (ph === 'dawn') {
          banner(`Day ${v.day}`, true, SUNI); snd('day');
          if (M.tab === 'wolf' && v.me.alive) { M.tab = 'day'; rebuildLog(); }
        } else if (ph === 'vote') { banner('Voting', true, SUNI); snd('click'); }
        else if (ph === 'defense') banner('Last words', false, TOMB);
        else if (ph === 'hunter') banner('The Hunter takes aim', false, roleIcon('hunter', 'x'));
        if (ph === 'over' && !M.overShown) {
          M.overShown = true;
          api.timeout(() => { if (M.v && M.v.over) showOver(M.v); }, 2400);
          const mine = v.over && v.over.win.includes(v.q);
          api.timeout(() => snd(mine ? 'win' : 'lose'), 600);
          if (mine && M.role !== 'guest') { opt.wins++; opt.played++; saveOpt(); api.score(opt.wins); api.submit(opt.wins); }
          else if (M.role !== 'guest') { opt.played++; saveOpt(); }
          if (M.role === 'guest' && mine) { opt.wins++; saveOpt(); api.score(opt.wins); api.submit(opt.wins); }
        }
      }
      function showRoleCard(v) {
        const r = v.me.role, R = ROLE[r];
        let extra = '';
        if (isWolf(r)) { const mates = v.players.filter(p => p.r && isWolf(p.r) && p.i !== v.q); extra = mates.length ? `<p style="margin-top:6px">Your pack: <b>${mates.map(p => esc(p.name)).join(', ')}</b></p>` : '<p style="margin-top:6px">You are the only wolf. Be careful.</p>'; }
        M.roleShownPane = true;
        pane(`<div class="ww-box"><p class="ww-kick">Your role</p><div class="ww-card" style="--rc:${R.c}"><div class="bk">${roleIcon('seer', 'x')}</div><div class="fr"><div class="art">${roleIcon(r, 'x')}</div><h4>${R.n}</h4><div class="tm">${TEAM[R.team]}</div><p>${esc(R.d)}</p></div></div>${extra}<button class="ww-big pk" data-a="ok" style="margin-bottom:0">Got it</button></div>`, '', () => { M.roleShownPane = false; hidePane(); });
        api.timeout(() => { const c = paneEl.querySelector('.ww-card'); if (c) { c.classList.add('flip'); snd('flip'); } }, 700);
      }
      function showOver(v) {
        const o = v.over, mine = o.win.includes(v.q);
        const T = { village: 'The Village wins!', wolves: 'The Werewolves win!', lovers: 'The Lovers win!', draw: 'Draw' }[o.team];
        const rows = v.players.map(p => `<tr class="${o.win.includes(p.i) ? 'win' : ''} ${p.a ? '' : 'dd'}"><td><span class="ava">${avatar(p.av)}</span>${p.i + 1} ${esc(p.name)}${p.i === v.q ? ' (you)' : ''}</td><td>${roleIcon(p.r)}${esc(ROLE[p.r].n)}</td><td>${p.a ? 'Survived' : esc((CAUSE[p.c] || 'died').replace('was ', '').replace('died of', 'died of'))}</td><td>${o.win.includes(p.i) ? '&#9733;' : ''}</td></tr>`).join('');
        const guest = M.role === 'guest';
        pane(`<div class="ww-box wide"><p class="ww-kick">${mine ? 'Victory' : 'Defeat'}</p><h3>${T}</h3>${v.jw >= 0 ? `<p>${esc(v.players[v.jw].name)} the Jester also won!</p>` : ''}<div style="max-height:340px;overflow:auto"><table class="ww-tbl">${rows}</table></div>${guest ? '<p>Waiting for the host to start another game...</p>' : '<button class="ww-big pk" data-a="again">Play again</button>'}<button class="ww-big gy" data-a="menu">${guest ? 'Leave' : 'Menu'}</button><button class="ww-sm" data-a="close">Close</button></div>`, '', a => {
          if (a === 'again') { if (M.mode === 'online') startOnline(); else newMatch(null); }
          else if (a === 'menu') leave();
          else if (a === 'close') hidePane();
        });
      }
      function leave() {
        M.tok++; if (M.mode === 'online') { try { sessionStorage.removeItem(SK()); } catch (x) {} api.net.close(); }
        M.mode = 'solo'; M.role = 'local'; M.eng = null; M.v = null; resetUI(); layout(port); showTitle();
      }
      function showMenu() {
        if (M.title) return;
        const v = M.v;
        pane(`<div class="ww-box"><p class="ww-kick">Werewolf</p><h3>Menu</h3><button class="ww-big pk" data-a="res">Resume</button><button class="ww-big bl" data-a="role">My role</button><button class="ww-big gy" data-a="how">How to play</button><button class="ww-big gy" data-a="leave">Leave game</button></div>`, '', a => {
          if (a === 'res') hidePane();
          else if (a === 'role' && v) { showRoleCard(M.v); }
          else if (a === 'how') pane(`<div class="ww-box wide"><h3>How to play</h3>${HOW}<button class="ww-big gy" data-a="back" style="max-width:240px;margin:10px auto 0">Back</button></div>`, '', () => hidePane());
          else if (a === 'leave') leave();
        });
      }
      headEl.querySelector('[data-u=menu]').addEventListener('click', showMenu);
      rolesEl.addEventListener('click', e => { const b = e.target.closest('.ww-rl'); if (!b || !M.v) return; const r = b.dataset.r, R = ROLE[r]; pane(`<div class="ww-box"><div class="ww-card flip" style="--rc:${R.c}"><div class="bk"></div><div class="fr"><div class="art">${roleIcon(r, 'x')}</div><h4>${R.n}</h4><div class="tm">${TEAM[R.team]}</div><p>${esc(R.d)}</p></div></div><button class="ww-big gy" data-a="ok" style="margin-bottom:0">Close</button></div>`, '', () => hidePane()); });

      function barInfo(v) {
        const me = v.me, c = me.ctl, ph = v.ph, nm = i => esc(v.players[i].name);
        let pr = '', sm = '', b = [];
        if (ph === 'over') { pr = 'The game is over.'; b.push(['results', 'Results', 'pk']); }
        else if (me.shot) { pr = 'You are the Hunter. Choose someone to shoot.'; b.push(['noshot', 'Do not shoot', '']); }
        else if (!me.alive) { pr = 'You are dead. Watch the game and talk with the other ghosts.'; sm = ph === 'night' ? 'You can read the wolves chat.' : ''; }
        else if (ph === 'deal') pr = 'The village gathers. Look at your role card.';
        else if (ph === 'night') {
          if (!c) { pr = 'Night falls. You sleep...'; sm = me.role === 'littlegirl' ? 'You peek at the wolves chat. Names are hidden.' : 'Wait for the dawn.'; }
          else if (c.k === 'wolf') {
            pr = c.t >= 0 ? `Your pick: ${nm(c.t)}.` : c.t === -1 ? 'You skipped the kill.' : 'Choose a victim for the pack.'; sm = 'Agree with your pack in the Wolves tab. A tie goes to the lowest seat.';
            if (c.bite) b.push(['bite', c.bite === 2 ? 'Bite: ON' : 'Bite', c.bite === 2 ? 'on' : '']);
            b.push(['skip', 'Skip', '']);
          } else if (c.k === 'seer') { pr = c.t >= 0 ? `Inspecting ${nm(c.t)}.` : 'Choose a player to inspect.'; sm = 'You will learn their role at dawn.'; b.push(['skip', 'Skip', '']); }
          else if (c.k === 'doctor') { pr = c.t >= 0 ? `Protecting ${nm(c.t)}.` : 'Choose a player to protect.'; sm = 'Not the same player twice in a row. You may protect yourself once.'; b.push(['skip', 'Skip', '']); }
          else if (c.k === 'guard') { pr = c.t >= 0 ? `Guarding ${nm(c.t)}.` : 'Choose a player to guard.'; sm = 'If they are attacked, you die instead.'; b.push(['skip', 'Skip', '']); }
          else if (c.k === 'witch') {
            pr = c.victim >= 0 ? `The wolves are attacking ${nm(c.victim)}.` : 'The wolves have not chosen a victim yet.';
            sm = M.wpick ? 'Click a player to poison.' : c.pt >= 0 ? `Poisoning ${nm(c.pt)}.` : 'Heal saves tonight\'s victim. Poison kills anyone. Once each.';
            b.push(['heal', c.save ? 'Heal: ON' : 'Heal potion', c.save ? 'on' : ''], ['poison', c.pt >= 0 ? 'Undo poison' : M.wpick ? 'Cancel' : 'Poison', c.pt >= 0 || M.wpick ? 'dg' : ''], ['wdone', c.done ? 'Done' : 'Done', 'pk']);
            const bs = b.slice(0, 2); if (!c.heal) bs[0] = ['', 'Heal used', '']; if (!c.poison && c.pt < 0) bs[1] = ['', 'Poison used', '']; b = bs.concat([b[2]]);
          } else if (c.k === 'cupid') { pr = M.cpA !== null ? `First lover: ${nm(M.cpA)}. Choose the second.` : c.sel.length ? `Linked ${nm(c.sel[0])} and ${nm(c.sel[1])}.` : 'Choose two players to fall in love.'; b.push(['skip', 'Skip', '']); }
        } else if (ph === 'dawn' || ph === 'discuss') {
          pr = 'Discuss. Who are the wolves?'; sm = 'Chat on the left. Then vote.';
          if (ph === 'discuss') b.push(['skipd', me.skip ? 'Skipping...' : 'Skip discussion', me.skip ? 'on' : '']);
          if (v.skips && ph === 'discuss') sm = `Skip votes: ${v.skips[0]}/${v.skips[1]}`;
        } else if (ph === 'vote') {
          const mv = v.players[v.q].v;
          pr = mv >= 0 ? `You voted for ${nm(mv)}.` : mv === -1 ? 'You abstained.' : 'Click a player to vote to lynch them.'; sm = 'Click the same player again to retract. Ties and low turnout lynch nobody.';
          b.push(['abst', 'Abstain', mv === -1 ? 'on' : '']);
        } else if (ph === 'defense') { pr = `${nm(v.defd)} stands on the gallows.`; sm = 'Last words...'; }
        else if (ph === 'exec') pr = v.lyn >= 0 ? `${nm(v.lyn)} was lynched.` : 'Nobody was lynched.';
        else if (ph === 'hunter' || ph === 'hshot') pr = 'The Hunter takes a shot...';
        return { pr, sm, b };
      }
      barEl.querySelector('.ac').addEventListener('click', e => {
        const b = e.target.closest('[data-b]'); if (!b || !M.v) return;
        const k = b.dataset.b, c = M.v.me.ctl; snd('click');
        if (k === 'skip') sendAct({ k: 'skip' });
        else if (k === 'bite') sendAct({ k: 'bite', on: !(c && c.bite === 2) });
        else if (k === 'heal') sendAct({ k: 'w', o: 'save' });
        else if (k === 'poison') { if (c && c.pt >= 0) sendAct({ k: 'w', o: 'poison', t: c.pt }); else M.wpick = !M.wpick; render(); }
        else if (k === 'wdone') sendAct({ k: 'w', o: 'done' });
        else if (k === 'skipd') sendAct({ k: 'skipd' });
        else if (k === 'abst') sendAct({ k: 'vote', t: -1 });
        else if (k === 'noshot') sendAct({ k: 'shot', t: -1 });
        else if (k === 'results') showOver(M.v);
      });

      let rk = '';
      function render() {
        const v = M.v; if (!v) return;
        const ph = v.ph, me = v.me, alive = v.players.filter(p => p.a).length;
        headEl.querySelector('.tt').textContent = ph === 'night' || ph === 'dawn' ? `${PHT[ph]} ${v.day}` : ph === 'discuss' ? `Day ${v.day} · Discussion` : PHT[ph];
        headEl.querySelector('.st').textContent = `${ROLE[me.role].n} · ${alive} alive${me.alive ? '' : ' · dead'}`;
        const comp = v.comp;
        const rhtml = RKEYS.filter(r => comp[r]).map(r => { const gone = v.players.filter(p => !p.a && p.r === r).length >= comp[r] && r !== 'villager' || false; return `<button class="ww-rl${gone ? ' gone' : ''}${r === me.role ? ' mine' : ''}" data-r="${r}" title="${esc(ROLE[r].d)}">${roleIcon(r)}${comp[r] > 1 ? `<b>${comp[r]}</b>` : ''}<span>${ROLE[r].n.replace('Alpha Werewolf', 'Alpha')}</span></button>`; }).join('');
        if (rhtml !== rk) { rk = rhtml; rolesEl.innerHTML = rhtml; }
        const m = modeOf(v), valid = new Set(m ? m.valid : []), c = me.ctl;
        const sel = new Set();
        if (c && v.ph === 'night') { if (c.t >= 0) sel.add(c.t); if (c.pt >= 0) sel.add(c.pt); if (c.sel) c.sel.forEach(i => sel.add(i)); if (M.cpA !== null) sel.add(M.cpA); }
        const mv = v.players[v.q].v; if (v.ph === 'vote' && mv >= 0) sel.add(mv);
        const cnt = {}, wc = {};
        v.players.forEach(p => { if (p.v >= 0) cnt[p.v] = (cnt[p.v] || 0) + 1; if (p.wv >= 0) wc[p.wv] = (wc[p.wv] || 0) + 1; });
        const mkI = c ? roleIcon(me.role === 'alpha' ? 'werewolf' : me.role, 'x') : '';
        v.players.forEach((p, i) => {
          const k = cards[i]; if (!k) return;
          if (k.seed !== p.av) { k.seed = p.av; k.av.innerHTML = avatar(p.av); }
          const cl = k.el.classList;
          cl.toggle('dead', !p.a); cl.toggle('me', i === v.q); cl.toggle('tg', valid.has(i)); cl.toggle('sel', sel.has(i)); cl.toggle('dock', v.defd === i && (ph === 'defense'));
          const nm = `${i + 1} ${p.name}`; if (k.nmT !== nm) { k.nmT = nm; k.nm.innerHTML = `<b>${i + 1}</b>`; k.nm.append(document.createTextNode(p.name)); }
          const rkk = p.r ? p.r : ''; if (k.rk !== rkk) { k.rk = rkk; k.rb.innerHTML = rkk ? roleIcon(rkk, 'x') : ''; k.rb.classList.toggle('on', !!rkk); k.rb.title = rkk ? ROLE[rkk].n : ''; }
          const vc = ph === 'vote' || ph === 'defense' || ph === 'exec' ? (cnt[i] || 0) : (wc[i] || 0);
          k.vb.textContent = vc; k.vb.classList.toggle('on', vc > 0 && p.a); k.vb.classList.toggle('wv', ph === 'night');
          const vt = p.v === undefined || !p.a ? '' : p.v >= 0 ? '> ' + v.players[p.v].name : 'abstains';
          if (k.vtT !== vt) { k.vtT = vt; k.vt.textContent = vt; k.vt.classList.toggle('on', !!vt); }
          k.hr.classList.toggle('on', !!p.h);
          const vic = !!(c && c.k === 'witch' && c.victim === i && v.ph === 'night' && !c.done);
          cl.toggle('vic', vic);
          const mk = sel.has(i) && v.ph === 'night' && !(c && c.k === 'cupid') ? 1 : vic ? 2 : 0;
          if (k.mkT !== mk) { k.mkT = mk; k.mk.innerHTML = mk === 2 ? roleIcon('werewolf', 'x') : mk ? mkI : ''; k.mk.classList.toggle('on', !!mk); }
        });
        const bi = barInfo(v);
        const key = JSON.stringify(bi) + (m ? 1 : 0);
        if (barEl._k !== key) {
          barEl._k = key;
          barEl.querySelector('.pr').innerHTML = `${bi.pr}${bi.sm ? `<small>${esc(bi.sm)}</small>` : ''}`;
          barEl.querySelector('.ac').innerHTML = bi.b.map(([id, t, cls]) => `<button class="ww-b ${cls}" data-b="${id}"${id ? '' : ' disabled'}>${esc(t)}</button>`).join('');
        }
        const dead = !me.alive || ph === 'over', wolfTab = isWolf(me.role) || dead || me.role === 'littlegirl';
        const tabs = [['day', 'Day chat']]; if (wolfTab) tabs.push(['wolf', 'Wolves']); if (!me.alive) tabs.push(['dead', 'Dead']);
        if (!tabs.some(t => t[0] === M.tab)) { M.tab = 'day'; rebuildLog(); }
        const th = tabs.map(([id, l]) => `<button data-t="${id}" class="${M.tab === id ? 'on' : ''}">${l}${M.unread[id] ? '<i></i>' : ''}</button>`).join('');
        if (tabsEl._k !== th) { tabsEl._k = th; tabsEl.innerHTML = th; }
        const ct = canTalk(v);
        inEl.disabled = !ct; sendEl.disabled = !ct;
        const ph2 = ct ? (M.tab === 'wolf' ? 'Message your pack' : M.tab === 'dead' ? 'Chat with the dead' : v.ph === 'defense' ? 'Say your last words' : 'Type your message') : (!me.alive ? 'Use the Dead tab to talk' : v.ph === 'night' ? 'Night: villagers sleep' : M.tab === 'wolf' ? 'Wolves talk at night only' : 'You cannot talk right now');
        if (inEl.placeholder !== ph2) inEl.placeholder = ph2;
      }

      function left() {
        const v = M.v; if (!v) return 0;
        if (M.eng && M.role !== 'guest') return Math.max(0, M.eng.G.dl - M.eng.G.t);
        return Math.max(0, M.dlLocal - performance.now());
      }
      const SK = () => 'gm-werewolf-' + api.net.code;
      let savedAt = 0;
      function saveGame(force) {
        const e = M.eng, now = Date.now();
        if (M.mode !== 'online' || M.role !== 'host' || !e || (!force && e.G.phase !== 'over' && now - savedAt < 800)) return;
        savedAt = now;
        try { if (e.G.phase === 'over') sessionStorage.removeItem(SK()); else sessionStorage.setItem(SK(), JSON.stringify({ code: api.net.code, at: now, seat: M.seat, ph: e.G.phase, day: e.G.day, snap: e.snap() })); } catch (x) {}
      }
      const onHide = () => saveGame(true);
      window.addEventListener('pagehide', onHide);
      function askResume(r) {
        let sv = null;
        try { sv = JSON.parse(sessionStorage.getItem(SK()) || 'null'); } catch (x) {}
        if (!sv || sv.code !== api.net.code || !sv.snap || sv.ph === 'over' || Date.now() - sv.at > 432e5) return newMatch(r);
        const S = JSON.parse(sv.snap), map = {}, used = {};
        const guests = r.players.filter(p => p.id !== r.id);
        for (const g of guests) {
          const q = S.P.findIndex((p, i) => i !== sv.seat && !p.bot && !used[i] && p.name.toLowerCase() === g.name.toLowerCase());
          if (q < 0) return newMatch(r);
          used[q] = 1; map[q] = g.id;
        }
        const alive = S.P.filter(p => p.alive).length, miss = S.P.filter((p, i) => i !== sv.seat && !p.bot && !used[i]).length;
        pane(`<div class="ww-box"><p class="ww-kick">Online</p><h3>Game in progress</h3><p>Saved game: day ${sv.day}, ${alive} alive.${miss ? ` ${miss} missing player${miss > 1 ? 's' : ''} will be replaced by bots.` : ''}</p><button class="ww-big pk" data-a="go">Resume game</button><button class="ww-big bl" data-a="new">New game</button><button class="ww-big gy" data-a="leave">Leave</button></div>`, '', a => {
          if (a === 'go') resumeOnline(sv, map, r);
          else if (a === 'new') { try { sessionStorage.removeItem(SK()); } catch (x) {} newMatch(r); }
          else leave();
        });
      }
      function resumeOnline(sv, map, r) {
        M.tok++;
        const e = Game({ snap: sv.snap }), n = e.P.length;
        M.pids = Array(n).fill(null); M.seat = sv.seat; M.players = r.players; M.size = n;
        e.P.forEach((p, q) => { if (p.bot || q === sv.seat) return; if (map[q]) M.pids[q] = map[q]; else e.toBot(q); });
        M.mode = 'online'; M.role = 'host'; M.over = false;
        resetUI(); hidePane();
        M.eng = e; e.sys('The host is back. The game resumes.');
        api.score(opt.wins); lastTick = performance.now();
        flush();
      }
      function flush() {
        const e = M.eng; if (!e) return;
        e.G.dirty = false;
        saveGame();
        applyView(e.view(M.seat));
        if (M.mode === 'online') M.pids.forEach((id, q) => { if (id && q !== M.seat && !e.P[q].bot) api.net.sendTo(id, { t: 'v', v: e.view(q) }); });
      }
      api.interval(() => {
        const now = performance.now();
        let dt = Math.min(5000, now - lastTick); lastTick = now;
        if (!M.eng || M.role === 'guest') return;
        if (api.paused) return;
        while (dt > 0) { const s = Math.min(dt, 400); M.eng.tick(s); dt -= s; }
        if (M.eng.G.dirty) flush();
      }, 100);
      let lastTm = '';
      api.loop((dt, t) => {
        const tgt = M.nightOn ? 1 : 0;
        M.nt += (tgt - M.nt) * Math.min(1, dt * 1.2);
        if (M.title) {
          const tc = paneEl.querySelector('canvas.tcv');
          if (tc) {
            if (tc.width !== 1100) { tc.width = 1100; tc.height = 660; }
            drawVillage(tc.getContext('2d'), 1100, 660, t, (Math.sin(t * 0.0002) + 1) / 2);
          }
        }
        const L = port ? LAY.port : LAY.land;
        cx.setTransform(2, 0, 0, 2, 0, 0);
        drawVillage(cx, L.head[2], L.head[3], t, M.nt);
        const v = M.v;
        if (v) {
          const l = left(), s = Math.ceil(l / 1000), tm = v.ph === 'over' || v.ph === 'deal' && false ? '' : Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
          const txt = v.ph === 'over' ? '' : tm;
          if (txt !== lastTm) { lastTm = txt; headEl.querySelector('.tm').textContent = txt; }
          headEl.querySelector('.bar i').style.transform = `scaleX(${v.ph === 'over' || !v.dur ? 0 : Math.min(1, l / v.dur)})`;
        }
      });

      function hookNet() {
        if (M.hooked) return;
        M.hooked = true;
        api.net.on('data', (d, from) => {
          if (!d || !api.alive || M.mode !== 'online') return;
          if (api.net.role === 'host') {
            if (M.role !== 'host' || !M.eng || d.t !== 'a') return;
            const q = M.pids.indexOf(from);
            if (q < 0) return;
            if (M.eng.act(q, d.a)) flush();
          } else if (d.t === 'v' && d.v) {
            if (M.role !== 'guest') return;
            if (!M.v && !cards.length) { resetUI(); hidePane(); layout(port); }
            applyView(d.v);
          }
        });
        api.net.on('leave', p => { if (M.mode === 'online' && M.role === 'host' && M.eng && p) { const q = M.pids.indexOf(p.id); if (q >= 0) { M.pids[q] = null; M.eng.toBot(q); flush(); } } });
        api.net.on('rejoin', p => { if (M.mode === 'online' && M.role === 'host' && M.eng && p) { const q = M.pids.indexOf(p.id); if (q >= 0) { M.eng.G.rs[q] = 1; M.eng.G.dirty = true; } } });
        api.net.on('lobby', () => { if (M.mode === 'online' && M.role === 'guest') startOnline(); });
        api.net.on('close', reason => {
          if (M.mode !== 'online' || M.role !== 'guest') return;
          M.tok++; M.role = 'local'; snd('lose');
          const h = reason === 'kicked' ? 'You were removed' : reason === 'host-left' ? 'The host left' : 'Connection lost';
          pane(`<div class="ww-box"><p class="ww-kick">Online</p><h3>${h}</h3><p>The game has ended for you.</p><button class="ww-big gr" data-a="room">Online lobby</button><button class="ww-big pk" data-a="solo">Play vs bots</button></div>`, '', a => { if (a === 'room') startOnline(); else { api.net.close(); M.mode = 'solo'; resetUI(); layout(port); showTitle(); } });
        });
      }
      async function startOnline() {
        M.tok++; const tok = M.tok;
        hookNet();
        hidePane(); M.mode = 'online'; M.role = null; M.eng = null; resetUI(); layout(port);
        const r = await api.net.room({ title: 'Werewolf', sizes: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], defaultSize: 8, min: 5, max: 16, bots: true });
        if (!api.alive || tok !== M.tok) return;
        if (!r) { M.mode = 'solo'; M.role = 'local'; return showTitle(); }
        if (r.role === 'host') { M.role = 'host'; M.size = +r.size || r.players.length; askResume(r); }
        else { M.role = 'guest'; pane(`<div class="ww-box"><p class="ww-kick">Online</p><h3>Connected!</h3><p>Dealing the roles...</p><button class="ww-sm" data-a="leave">Leave</button></div>`, '', () => leave()); }
      }

      layout(root.clientWidth < 720); fit();
      root._ww = { M, opt, get eng() { return M.eng; }, view: () => M.v, cards: () => cards, act: sendAct, left };
      if (api.net.invite) startOnline(); else showTitle();
      return { destroy() { M.tok++; window.removeEventListener('pagehide', onHide); try { if (ac) ac.close(); } catch (e) {} } };
    }
  });

  Ameplay.covers.werewolf = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="wwc-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1230"/><stop offset="1" stop-color="#3a4a90"/></linearGradient></defs><rect width="400" height="300" fill="url(#wwc-s)"/><g fill="#fff"><circle cx="40" cy="40" r="1.6"/><circle cx="120" cy="24" r="1.2"/><circle cx="300" cy="50" r="1.6"/><circle cx="360" cy="110" r="1.2"/><circle cx="70" cy="110" r="1.2"/></g><circle cx="290" cy="82" r="38" fill="#f4ecc2"/><circle cx="276" cy="70" r="6" fill="#e0d8a8"/><circle cx="304" cy="98" r="4" fill="#e0d8a8"/><path d="M0 210 Q100 160 200 205 Q300 245 400 180 V300 H0Z" fill="#1a2447"/><path d="M0 250 Q120 215 220 245 Q320 275 400 235 V300 H0Z" fill="#0e1430"/><g fill="#080d1c"><path d="M40 170 l-20 60 h40z M40 195 l-26 50 h52z"/><path d="M350 160 l-22 64 h44z M350 188 l-28 56 h56z"/></g><g fill="#0a0c18"><path d="M232 198 L238 168 L228 152 L246 162 L256 160 L270 150 L268 172 L276 198Z"/><path d="M240 152 L236 140 L246 150Z M266 152 L272 140 L270 154Z"/></g><circle cx="244" cy="168" r="2.6" fill="#ffd54a"/><circle cx="260" cy="167" r="2.6" fill="#ffd54a"/><g><rect x="90" y="206" width="46" height="32" fill="#2a2f4a"/><path d="M84 207 L113 182 L142 207Z" fill="#3a2230"/><rect x="98" y="214" width="9" height="9" fill="#ffd66e"/><rect x="120" y="214" width="9" height="9" fill="#ffd66e"/></g><text x="200" y="272" text-anchor="middle" font-family="Nunito,Arial Rounded MT Bold,sans-serif" font-weight="900" font-size="46" fill="#fff" stroke="#8b1a3c" stroke-width="2.5" paint-order="stroke">Werewolf</text></svg>`;
})();
