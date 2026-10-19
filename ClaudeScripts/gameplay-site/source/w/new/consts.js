const GENRES = ['Action', 'Arcade', 'Racing', 'Runner', 'Puzzle', 'Sports', 'Board', 'Brain', 'Skill', 'Strategy'];
const GENRE_NAME = { Board: 'Board & Cards', Strategy: 'Strategy & Idle' };
const GENRE_KW = {
  Action: 'action fight fighting combat battle enemies survive survival',
  Arcade: 'arcade classic retro score highscore',
  Racing: 'race racing speed track',
  Runner: 'run running runner endless dodge obstacles jump',
  Puzzle: 'puzzle logic solve think',
  Sports: 'sport sports ball match',
  Board: 'board card cards tabletop turn classic',
  Brain: 'brain memory quiz trivia words mental maths knowledge',
  Skill: 'skill reflex reflexes timing aim accuracy fast reaction',
  Strategy: 'strategy idle incremental tower defense manage resource upgrade'
};
const PL_KW = {
  s: 'solo single player alone',
  o: 'online multiplayer friend friends party room code remote lobby',
  4: '3 4 three four player players party lobby',
  6: '3 4 6 three four six player players party lobby',
  8: '3 4 6 8 three four six eight player players party lobby'
};
const STOP = new Set(['the', 'a', 'an', 'of', 'game', 'games', 'play', 'free', 'to', 'and', 'for', 'i', 'want']);
const CAT_TINT = { Action: '#d62828', Arcade: '#ff6b6b', Racing: '#3a86ff', Runner: '#ff7a59', Puzzle: '#4361ee', Sports: '#2a9d8f', Board: '#495057', Brain: '#06a77d', Skill: '#e08a00', Strategy: '#a8641c' };
const POPULAR = ['blockcraft-3d', 'dash-cube', 'sky-runner', 'slither', 'road-hopper', 'flap-bird', 'rocket-soccer', 'brick-bros'];
const FGROUPS = [
  { key: 'f', name: 'Favourites', opts: [['fav', 'My favourites']] },
  { key: 'g', name: 'Genre', opts: GENRES.map(k => [k, GENRE_NAME[k] || k]) },
  { key: 'p', name: 'Players', opts: [['s', 'Solo'], ['o', 'Online']] },
  { key: 'v', name: 'Look', opts: [['3d', '3D'], ['2d', '2D']] },
  { key: 'c', name: 'Controls', opts: [['kb', 'Keyboard'], ['tp', 'Mouse or touch']] },
  { key: 't', name: 'Length', opts: [['q', 'Quick'], ['m', 'Medium'], ['l', 'Long']] }
];
const SORTS = [['rel', 'Best match'], ['rec', 'Popular'], ['az', 'A to Z'], ['new', 'Newest'], ['played', 'Most played'], ['short', 'Shortest']];
const PATH_MODE = /(^|\.)(web\.app|firebaseapp\.com)$/i.test(location.hostname) || (() => { try { return sessionStorage.getItem('gameplay:paths') === '1'; } catch (e) { return false; } })();
const PAUSE = { on: false };
(() => { try { if (localStorage.getItem('gameplay:reset') !== '4') { const keep = k => k === 'gameplay:consent' || k === 'gameplay:lang' || k.indexOf('gameplay:gate') === 0 || k.indexOf('sb-') === 0; let o = {}; try { o = JSON.parse(localStorage.getItem('gameplay:v1') || '{}') || {}; } catch (e) {} const prefs = o.prefs; Object.keys(localStorage).forEach(k => { if (!keep(k)) localStorage.removeItem(k); }); localStorage.setItem('gameplay:v1', JSON.stringify(prefs ? { prefs } : {})); localStorage.setItem('gameplay:reset', '4'); try { indexedDB.deleteDatabase('gameplay-minecraft'); } catch (e) {} } } catch (e) {} })();
const SUPABASE_DIRECT = 'https://uafouyvtcijptspjbsqf.supabase.co';
const SUPABASE_RELAYS = ['https://gameplay-api.vitalang.net'];
const SUPABASE_URL = (typeof window.__gpSbUrl === 'string' && /^https:\/\//.test(window.__gpSbUrl) && window.__gpSbUrl) || SUPABASE_DIRECT;
const SBN = (() => {
  const K = 'gameplay:sb';
  const all = (window.__gpSbOnly ? [SUPABASE_URL] : [SUPABASE_URL, SUPABASE_DIRECT].concat(SUPABASE_RELAYS)).filter((x, i, a) => x && a.indexOf(x) === i);
  let best = SUPABASE_URL, wsB = null;
  const bad = {}, wsBad = {}, fresh = (m, b, ms) => (m[b] || 0) > Date.now() - ms;
  const strip = u => { u = String(u).replace(/^ws(s?):/, 'http$1:'); for (const b of all) if (u === b || u.indexOf(b + '/') === 0 || u.indexOf(b + '?') === 0) return u.slice(b.length); return null; };
  const order = () => [best].concat(all.filter(b => b !== best).sort((a, c) => (bad[a] || 0) - (bad[c] || 0)));
  const good = b => { delete bad[b]; window.__gpSbDown = false; if (best === b) return; best = b; try { sessionStorage.setItem(K, b); } catch (e) {} };
  const page = r => /text\/html/i.test(r.headers.get('content-type') || '');
  async function viaFetch(input, init) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : null;
    const path = url == null ? null : strip(url);
    if (path == null) return fetch(input, init);
    const o = Object.assign({}, init || {}), outer = o.signal;
    let last = null;
    for (const b of order()) {
      if (outer && outer.aborted) throw outer.reason || new DOMException('Aborted', 'AbortError');
      const ctl = new AbortController(), stop = () => ctl.abort(outer.reason);
      if (outer) outer.addEventListener('abort', stop, { once: true });
      const tm = setTimeout(() => ctl.abort(new DOMException('Timed out', 'TimeoutError')), b === best ? 15000 : 12000);
      try {
        const r = await fetch(b + path, Object.assign({}, o, { signal: ctl.signal }));
        if (page(r)) { bad[b] = Date.now(); last = new TypeError('The network answered with a web page'); continue; }
        good(b);
        return r;
      } catch (e) {
        if (outer && outer.aborted) throw e;
        bad[b] = Date.now(); last = e;
      } finally { clearTimeout(tm); if (outer) outer.removeEventListener('abort', stop); }
    }
    throw last || new TypeError('Failed to fetch');
  }
  const wsPick = () => (wsB && !fresh(wsBad, wsB, 60000)) ? wsB : (order().find(b => !fresh(wsBad, b, 60000)) || order()[0]);
  const WS = window.WebSocket ? class extends WebSocket {
    constructor(url, protocols) {
      const path = strip(url), b = path == null ? null : wsPick();
      if (protocols === undefined) super(b ? b.replace(/^http/, 'ws') + path : url); else super(b ? b.replace(/^http/, 'ws') + path : url, protocols);
      if (!b) return;
      let open = false;
      this.addEventListener('open', () => { open = true; wsB = b; delete wsBad[b]; });
      this.addEventListener('close', () => { if (!open) { wsBad[b] = Date.now(); if (wsB === b) wsB = null; } });
    }
  } : undefined;
  return { fetch: viaFetch, WS, best: () => best, ws: () => wsB, all: () => all.slice(), url: p => best + p };
})();
const GOOGLE_CLIENT_ID = '114405851703-b6u2jan6mapjucijipcecr6g8nbgf73s.apps.googleusercontent.com';
const SUPABASE_ANON_KEY = 'sb_publishable_Lry5e9J350lXelAUPHU1rg_3YYvTuAf';
const SUPABASE_JS_FILE = 'supabase-js-2.117.2.js';
const SUPABASE_JS = ['https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.js', 'https://unpkg.com/@supabase/supabase-js@2.117.2/dist/umd/supabase.js'];
const SUPABASE_SRI = 'sha384-Rj26LVGvoeRVR6+mwQmFfcR3QOBEwT+ZmuCWpuiqeTzJpCs0ER4ITAWGb4Hiy3Ok';
