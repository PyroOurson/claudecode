const lib = require('../party_lib.js');
const { execSync } = require('child_process');
const DBC = process.env.STAGE_DB || 'supabase_db_staging';
const sql = q => execSync('docker exec -i ' + DBC + ' psql -U postgres -d postgres -At -F "|" -c ' + JSON.stringify(q), { encoding: 'utf8' }).trim();
const must = (c, m) => { if (!c) throw new Error(m); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const until = async (fn, ms, step = 400) => { const t0 = Date.now(); for (;;) { const r = await fn(); if (r) return r; if (Date.now() - t0 > ms) return null; await sleep(step); } };
const openChat = async (v, name) => {
  await v.page.evaluate(() => { const c = document.querySelector('#chat'); if (!c || c.hidden) document.querySelector('#sodl').click(); });
  await v.page.waitForSelector('#chat [data-ch="so"]', { timeout: 30000 });
  await v.page.evaluate(n => { const r = [...document.querySelectorAll('#chat [data-ch="so"]')].find(x => x.innerText.indexOf(n) >= 0); if (!r) throw new Error('friend not listed: ' + n); r.click(); }, name);
  await v.page.waitForFunction(() => { const t = document.querySelector('#chat textarea'); return !!t && t.getBoundingClientRect().width > 0; }, null, { timeout: 30000 });
  await sleep(1200);
};
const say = async (v, text) => { await v.page.focus('#chat textarea'); await v.page.keyboard.type(text); await v.page.keyboard.press('Enter'); };
const sees = (v, text, ms = 20000) => until(() => v.page.evaluate(t => [...document.querySelectorAll('#chat .ch-m .ch-b')].some(b => b.innerText.indexOf(t) >= 0), text), ms);
const order = v => v.page.evaluate(() => [...document.querySelectorAll('#chat .ch-m .ch-b')].map(b => b.innerText.trim()).slice(-6));
(async () => {
  const b = await lib.launch();
  let fail = null;
  try {
    const tag = Date.now().toString(36);
    const ann = await lib.player(b, 'ann'), bob = await lib.player(b, 'bob');
    const ida = sql("select id from public.profiles where username = 'ann_player'"), idb = sql("select id from public.profiles where username = 'bob_player'");
    await openChat(bob, 'ann'); await openChat(ann, 'bob');
    const t0 = Date.now();
    await say(ann, 'one ' + tag);
    must(await sees(bob, 'one ' + tag), 'bob never received the first message');
    const lat = Date.now() - t0;
    await say(bob, 'reply ' + tag);
    must(await sees(ann, 'reply ' + tag), 'ann never received the reply');
    for (const w of ['a', 'b', 'c']) { await say(ann, 'burst ' + w + ' ' + tag); await sleep(150); }
    must(await sees(bob, 'burst c ' + tag), 'bob did not receive all three quick messages: ' + JSON.stringify(await order(bob)));
    const got = (await order(bob)).filter(x => x.indexOf('burst') === 0 && x.indexOf(tag) > 0);
    must(got.join('|') === ['a', 'b', 'c'].map(w => 'burst ' + w + ' ' + tag).join('|'), 'quick messages out of order or missing: ' + JSON.stringify(got));
    must(await sees(ann, 'burst c ' + tag, 8000), 'the sender does not see their own quick messages');
    await bob.page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
    await say(ann, 'while hidden ' + tag);
    await sleep(9000);
    const unread = sql("select count(*) from public.dms where from_id = '" + ida + "' and to_id = '" + idb + "' and body = 'while hidden " + tag + "' and read_at is null");
    must(unread === '1', 'a message was marked as read while the recipient’s tab was hidden (unread rows: ' + unread + ')');
    await bob.page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' }); Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
    must(await until(() => sql("select count(*) from public.dms where from_id = '" + ida + "' and to_id = '" + idb + "' and body = 'while hidden " + tag + "' and read_at is not null") === '1', 20000, 1000), 'the message was not marked as read after the tab became visible again');
    await ann.toParty('last-card'); await ann.click('gohost'); await ann.click('mkpriv'); await ann.waitLobby(1);
    await say(ann, 'from the lobby ' + tag);
    must(await sees(bob, 'from the lobby ' + tag), 'Enter in the chat box did not send while a party lobby was open');
    console.log('PASS direct messages: delivered both ways (first after ' + lat + ' ms), three quick messages arrive in order, not marked read while the tab is hidden, Enter still sends with a party lobby open');
  } catch (e) { fail = e; console.log('FAIL direct messages: ' + String(e && e.message || e).split('\n')[0].slice(0, 400)); }
  await b.close().catch(() => {});
  process.exit(fail ? 1 : 0);
})();
