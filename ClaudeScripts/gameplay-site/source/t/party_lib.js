const { launch, visitor } = require('./site.js');
const P = 'Passw0rd123';
const USERS = { test: ['gp_tester@test.example.com', 'TestAcc0unt!'], test2: ['gp_tester2@test.example.com', 'TestAcc0unt!'], ann: ['ann@example.com', P], bob: ['bob@example.com', P], cat: ['cat@example.com', P], owner: ['tester1@example.com', P], dan: ['adm_dan@example.com', P], eve: ['adm_eve@example.com', P] };
const fs = require('fs'), path = require('path'), os = require('os');
const DIR = process.env.STATE_DIR || path.join(os.tmpdir(), 'gameplay-test-states');
const states = {};
const stateOf = who => { if (states[who]) return states[who]; try { return states[who] = JSON.parse(fs.readFileSync(path.join(DIR, who + '.json'), 'utf8')); } catch (e) { return null; } };
const keep = (who, st) => { states[who] = st; try { fs.mkdirSync(DIR, { recursive: true }); fs.writeFileSync(path.join(DIR, who + '.json'), JSON.stringify(st)); } catch (e) {} };
async function player(browser, who, o = {}) {
  const st = o.fresh ? null : stateOf(who);
  const v = await visitor(browser, Object.assign({}, o, st ? { storageState: st } : {}));
  if (o.setup) await o.setup(v);
  await v.goto('', 600);
  if (!(await v.signedIn())) {
    try { await v.login(USERS[who][0], USERS[who][1]); }
    catch (e) { const st = await v.page.evaluate(() => ({ modal: !document.querySelector('#aumodal').hidden, note: document.querySelector('#aunote').textContent, up: document.querySelector('#auupnote').textContent, email: document.querySelector('#auemail').value, signed: !!(window.Ameplay && Ameplay.account.signedIn), ck: !document.querySelector('#ckbar').hidden })).catch(() => null); throw new Error('login failed for ' + who + ': ' + String(e.message).slice(0, 200) + ' | ' + JSON.stringify(st) + ' | ' + v.log.slice(-5).join(' | ')); }
  }
  await v.page.waitForTimeout(500);
  keep(who, await v.ctx.storageState());
  v.who = who;
  v.lobby = () => v.page.evaluate(() => { const l = document.querySelector('.g-lobby'); if (!l) return null; const q = s => l.querySelector(s); return { text: l.innerText.replace(/\s+/g, ' ').slice(0, 700), card: (q('.gl-card') || {}).className || '', code: (q('.gl-codetxt') || {}).textContent || '', pubSwitch: !!q('[data-n="pub"]'), joinBox: !!q('.gl-code-in'), players: [...l.querySelectorAll('.gl-players .gl-pl:not(.gl-seat) .gl-who b i')].map(x => x.textContent), play: q('[data-n="play"]') ? !q('[data-n="play"]').disabled : null, hint: (q('.gl-hint') || {}).textContent || '' }; });
  v.net = () => v.page.evaluate(() => window.Ameplay && Ameplay.diag ? Ameplay.diag.dump().events.filter(e => e.k === 'net').map(e => e.d) : []);
  const tap = async (sel, text, ms = 90000) => { const t0 = Date.now(); for (;;) { const ok = await v.page.evaluate(([q, t]) => { const e = [...document.querySelectorAll(q)].find(x => (!t || (x.textContent || '').includes(t)) && x.getBoundingClientRect().width > 0 && !x.disabled); if (!e) return false; e.click(); return true; }, [sel, text || '']); if (ok) return true; if (Date.now() - t0 > ms) throw new Error('tap: not found ' + sel + ' ' + (text || '')); await v.page.waitForTimeout(250); } };
  v.tap = tap;
  v.toParty = async (game, btn) => { await v.openGame(game, 2000); await tap('#frame button', btn || 'Online party'); await v.page.waitForTimeout(500); if (!(await v.page.$('.g-lobby .gl-card'))) await tap('#frame button', 'Create or join a party', 8000).catch(() => {}); await v.page.waitForSelector('.g-lobby .gl-card', { timeout: 90000 }); await v.page.waitForTimeout(500); };
  v.click = async n => { await tap('.g-lobby [data-n="' + n + '"]'); await v.page.waitForTimeout(400); };
  v.waitLobby = async (n, ms = 120000) => { await v.page.waitForFunction(k => { const l = document.querySelector('.g-lobby .gl-lob'); return !!l && l.querySelectorAll('.gl-players .gl-pl:not(.gl-seat)').length >= k && !document.querySelector('.g-lobby .gl-codetxt.gl-pend'); }, n, { timeout: ms }); };
  v.ses = () => v.page.evaluate(() => sessionStorage.getItem('gameplay:netses'));
  return v;
}
module.exports = { launch, player, USERS };
