const lib = require('../lib.js');
const { execFileSync } = require('child_process');
const DBC = process.env.STAGE_DB || 'supabase_db_staging';
const sql = q => execFileSync('docker', ['exec', '-i', DBC, 'psql', '-U', 'postgres', '-d', 'postgres', '-Atqc', q]).toString().trim();
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const id = u => sql("select id from public.profiles where username = '" + u + "'");
  const own = id('tester1'), bob = id('bob_player'), ann = id('ann_player'), N = 40;
  sql("insert into public.friends (user_id, friend_id) values ('" + own + "','" + bob + "'),('" + bob + "','" + own + "') on conflict do nothing");
  sql("delete from public.dms where from_id = '" + bob + "' and to_id in ('" + own + "', '" + ann + "')");
  sql("insert into public.dms (from_id, to_id, kind, body) select '" + bob + "', t, 'text', 'unread check ' || g from (values ('" + own + "'::uuid), ('" + ann + "'::uuid)) v(t), generate_series(1, " + N + ") g");
  const unread = t => +sql("select count(*) from public.dms where from_id = '" + bob + "' and to_id = '" + t + "' and read_at is null");
  const b = await lib.launch();
  let fail = null, note = '';
  try {
    const o = await lib.player(b, 'owner', { init: `try { localStorage.setItem('gameplay:dock:${own}', JSON.stringify({ v: 'conv', u: '${bob}', o: true })); } catch (e) {}` });
    await o.page.goto(new URL('#/admin', lib.BASE).href);
    await o.page.waitForSelector('#adt tbody tr[data-uid]', { timeout: 60000 });
    await o.page.fill('#adq', 'bob_player');
    await o.page.click('#adt tr[data-uid="' + bob + '"]');
    await o.page.waitForSelector('#adpanel:not([hidden])', { timeout: 20000 });
    await o.page.waitForFunction(() => document.querySelectorAll('#chat .ch-m [data-mid]').length > 0, null, { timeout: 30000 }).catch(() => {});
    const dock = await o.page.evaluate(() => !!document.querySelector('#chat') && !document.querySelector('#chat').hidden);
    for (let i = 0; i < 12; i++) { await o.page.mouse.move(500, 450); await o.page.mouse.wheel(0, 500); await sleep(250); }
    const cl = await o.page.$('#adcl'); const bx = cl && await cl.boundingBox();
    if (bx) { await o.page.mouse.move(bx.x + 20, bx.y + 20); for (let i = 0; i < 8; i++) { await o.page.mouse.wheel(0, 400); await sleep(250); } }
    await sleep(4000);
    const a1 = unread(own), n1 = unread(ann);
    note = 'dock restored: ' + dock + '; after scrolling the card: ' + a1 + ' of ' + N + ' unread for the owner, ' + n1 + ' of ' + N + ' for ann';
    if (a1 !== N || n1 !== N) fail = 'staff scrolling a player card changed read marks (' + note + ')';
    if (!fail && dock) {
      const m = await o.page.$('#chat .ch-m');
      const mb = await m.boundingBox();
      await o.page.mouse.click(mb.x + mb.width / 2, mb.y + mb.height / 2);
      await sleep(2500);
      const a2 = unread(own);
      note += '; after clicking into the open conversation: ' + a2 + ' unread';
      if (!(a2 < N && a2 > 0)) fail = 'clicking into the conversation should mark only the messages on screen (' + note + ')';
    }
  } catch (e) { fail = String(e && e.message || e).split('\n')[0]; }
  sql("delete from public.dms where from_id = '" + bob + "' and to_id in ('" + own + "', '" + ann + "')");
  await b.close();
  console.log(fail ? 'FAIL read marks: ' + fail : 'PASS read marks: ' + note);
  process.exit(fail ? 1 : 0);
})();
