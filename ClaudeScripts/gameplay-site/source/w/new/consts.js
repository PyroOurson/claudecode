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
const SUPABASE_RELAY = 'https://gameplaygames.vitalang.net';
const SUPABASE_URL = (typeof window.__gpSbUrl === 'string' && /^https:\/\//.test(window.__gpSbUrl) && window.__gpSbUrl) || SUPABASE_DIRECT;
const SB_VIA_RELAY = SUPABASE_URL !== SUPABASE_DIRECT;
const GOOGLE_CLIENT_ID = '114405851703-b6u2jan6mapjucijipcecr6g8nbgf73s.apps.googleusercontent.com';
const SUPABASE_ANON_KEY = 'sb_publishable_Lry5e9J350lXelAUPHU1rg_3YYvTuAf';
const SUPABASE_JS_FILE = 'supabase-js-2.117.2.js';
const SUPABASE_JS = ['https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.js', 'https://unpkg.com/@supabase/supabase-js@2.117.2/dist/umd/supabase.js'];
const SUPABASE_SRI = 'sha384-Rj26LVGvoeRVR6+mwQmFfcR3QOBEwT+ZmuCWpuiqeTzJpCs0ER4ITAWGb4Hiy3Ok';
