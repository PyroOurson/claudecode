const lib = require('../lib.js');
const { launch } = lib;
let PL = [];
const player = async (b, who, o) => { const v = await lib.player(b, who, o); PL.push(v); return v; };
const GAME = process.env.PARTY_GAME || 'last-card';
const only = (process.env.ONLY || '').split(',').filter(Boolean);
const results = [];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const via = async v => { const e = (await v.net()).filter(x => x.a === 'join-ok').pop(); return e ? e.via : null; };
const noPeerJs = async v => { await v.ctx.route(/peerjs\.com/, r => r.abort()); await v.ctx.routeWebSocket(/peerjs\.com/, ws => ws.close()); };
const noWebRtc = v => v.ctx.addInitScript(() => { try { Object.defineProperty(window, 'RTCPeerConnection', { value: undefined, writable: true, configurable: true }); window.webkitRTCPeerConnection = undefined; } catch (e) {} });
const hostParty = async (h, pub) => { await h.toParty(GAME); await h.click('gohost'); await h.click(pub ? 'mkpub' : 'mkpriv'); await h.waitLobby(1); return (await h.lobby()).code; };
const joinCode = async (g, code) => { await g.toParty(GAME); await g.click('gojoin'); await g.page.fill('.g-lobby .gl-code-in', code); await g.tap('.g-lobby .gl-jbtn'); };
const reload = async v => { await v.page.reload({ timeout: 180000, waitUntil: 'domcontentloaded' }); await v.ready(); };
async function scenario(name, fn) {
  if (only.length && !only.some(k => name.indexOf(k) === 0)) return;
  const b = await launch();
  const t0 = Date.now();
  let err = null, info = '';
  PL = [];
  try { info = (await fn(b)) || ''; }
  catch (e) {
    err = String(e && e.message || e).split('\n')[0].slice(0, 300);
    for (const v of PL) {
      try { const l = await v.lobby(), n = await v.net(); err += '\n       ' + v.who + ': ' + (l ? l.text.slice(0, 200) : 'no party screen') + '\n       ' + v.who + ' net: ' + n.slice(-7).map(x => x.a + (x.type ? ':' + x.type : '') + (x.via ? ':' + x.via : '') + (x.why ? ':' + x.why : '')).join(' > ') + (v.log.length ? '\n       ' + v.who + ' log: ' + v.log.slice(-3).join(' | ').slice(0, 300) : ''); } catch (x) {}
    }
  }
  await b.close().catch(() => {});
  results.push([name, err]);
  console.log((err ? 'FAIL ' : 'PASS ') + name + ' (' + Math.round((Date.now() - t0) / 1000) + ' s)' + (err ? ': ' + err : info ? ': ' + info : ''));
}
const must = (c, m) => { if (!c) throw new Error(m); };
(async () => {
  await scenario('A public party: listed for others, joined from the list, no code and no public switch', async b => {
    const h = await player(b, 'test');
    const code = await hostParty(h, true);
    const hl = await h.lobby();
    must(code === 'Public' && !/[A-Z0-9]{4}\b/.test(hl.text.replace(/UNO|PARTY|HOST/g, '').slice(0, 40)), 'the public lobby shows a code: ' + code);
    must(!hl.pubSwitch, 'the lobby still has a public/private switch');
    const g = await player(b, 'test2');
    await g.toParty(GAME); await g.click('gojoin');
    await g.page.waitForSelector('.g-lobby [data-n="pubjoin"]', { timeout: 60000 });
    must(!(await g.page.$('.g-lobby .gl-lob')), 'Join a party showed the current-party screen');
    await g.click('pubjoin');
    await g.waitLobby(2); await h.waitLobby(2);
    return 'route ' + await via(g);
  });
  await scenario('B private party: code shown to the host, guest joins by typing it, chat goes both ways, Play starts the game for both', async b => {
    const h = await player(b, 'test');
    const code = await hostParty(h, false);
    must(/^[A-Z0-9]{4}$/.test(code), 'no 4-character code: ' + code);
    const g = await player(b, 'test2');
    await joinCode(g, code);
    await g.waitLobby(2); await h.waitLobby(2);
    await g.page.fill('.g-lobby .gl-chat-in', 'hello from guest'); await g.tap('.g-lobby .gl-go');
    await h.page.waitForFunction(() => /hello from guest/.test(document.querySelector('.g-lobby .gl-msgs').innerText), null, { timeout: 30000 });
    await h.page.fill('.g-lobby .gl-chat-in', 'hello from host'); await h.tap('.g-lobby .gl-go');
    await g.page.waitForFunction(() => /hello from host/.test(document.querySelector('.g-lobby .gl-msgs').innerText), null, { timeout: 30000 });
    await h.click('play');
    await h.page.waitForFunction(() => !document.querySelector('.g-lobby.gl-on'), null, { timeout: 30000 });
    await g.page.waitForFunction(() => !document.querySelector('.g-lobby.gl-on'), null, { timeout: 30000 });
    return 'route ' + await via(g);
  });
  await scenario('C signalling server blocked for the guest: connects through the second route', async b => {
    const h = await player(b, 'test');
    const code = await hostParty(h, false);
    const g = await player(b, 'test2', { setup: noPeerJs });
    await joinCode(g, code);
    await g.waitLobby(2); await h.waitLobby(2);
    const r = await via(g);
    must(r === 'rt-p2p' || r === 'rt-relay', 'unexpected route ' + r);
    return 'route ' + r;
  });
  await scenario('D signalling blocked and WebRTC unavailable for the guest: relayed connection, chat and game start still work', async b => {
    const h = await player(b, 'test');
    const code = await hostParty(h, false);
    const g = await player(b, 'test2', { setup: async v => { await noPeerJs(v); await noWebRtc(v); } });
    await joinCode(g, code);
    await g.waitLobby(2); await h.waitLobby(2);
    const r = await via(g);
    must(r === 'rt-relay', 'expected the relay route, got ' + r);
    await g.page.fill('.g-lobby .gl-chat-in', 'relay hello'); await g.tap('.g-lobby .gl-go');
    await h.page.waitForFunction(() => /relay hello/.test(document.querySelector('.g-lobby .gl-msgs').innerText), null, { timeout: 30000 });
    await h.click('play');
    await g.page.waitForFunction(() => !document.querySelector('.g-lobby.gl-on'), null, { timeout: 30000 });
    await sleep(4000);
    must(!(await g.page.$('.g-lobby.gl-on')), 'guest fell back to the lobby after the game started');
    return 'route ' + r;
  });
  await scenario('E host without the signalling server and guest without WebRTC: party still works', async b => {
    const h = await player(b, 'test', { setup: noPeerJs });
    const code = await hostParty(h, false);
    const hn = (await h.net()).filter(x => x.a === 'host-ready').pop();
    must(hn && hn.rt && !hn.peer, 'host should be listening on the second route only: ' + JSON.stringify(hn));
    const g = await player(b, 'test2', { setup: noWebRtc });
    await joinCode(g, code);
    await g.waitLobby(2); await h.waitLobby(2);
    return 'route ' + await via(g);
  });
  await scenario('F unknown code: clear error quickly, and a refresh does not try again', async b => {
    const g = await player(b, 'test2');
    const t0 = Date.now();
    await joinCode(g, 'ZZ99');
    await g.page.waitForSelector('.g-lobby .gl-jst .gl-bad', { timeout: 60000 });
    const jf = (await g.net()).filter(x => x.a === 'join-fail').pop();
    must(jf && jf.ms < 20000, 'the page took too long to give up: ' + JSON.stringify(jf));
    const secs = Math.round(jf.ms / 100) / 10, msg = await g.page.textContent('.g-lobby .gl-jst .gl-bad');
    must(/not found/i.test(msg), 'unclear message: ' + msg);
    must(await g.ses() === null, 'a session was kept after a failed join');
    await reload(g); await sleep(6000);
    const st = await g.page.evaluate(() => ({ lobby: !!document.querySelector('.g-lobby'), ses: sessionStorage.getItem('gameplay:netses') }));
    must(!st.lobby && !st.ses, 'after a refresh the site tried to connect again: ' + JSON.stringify(st));
    return 'error after ' + secs + ' s: "' + msg + '"';
  });
  await scenario('G cancel while joining: back to the list at once, nothing keeps trying, refresh is clean', async b => {
    const g = await player(b, 'test2', { setup: async v => { await noPeerJs(v); await v.ctx.routeWebSocket(/realtime\/v1\/websocket/, ws => { ws.onMessage(() => {}); }); } });
    await joinCode(g, 'QQ77');
    await g.page.waitForSelector('.g-lobby [data-n="jcancel"]', { timeout: 30000 });
    await sleep(1500);
    await g.click('jcancel');
    await g.page.waitForSelector('.g-lobby .gl-code-in', { timeout: 15000 });
    const before = (await g.net()).length;
    await sleep(8000);
    const after = await g.net();
    must(!after.slice(before).some(x => /^join-|^peer-open/.test(x.a)), 'connection activity continued after Cancel: ' + JSON.stringify(after.slice(before)));
    must(await g.ses() === null, 'a session was kept after Cancel');
    await reload(g); await sleep(5000);
    must(!(await g.page.$('.g-lobby')), 'after a refresh the site tried to connect again');
  });
  await scenario('H refresh during a join attempt that is failing: the new page does not resume it', async b => {
    const g = await player(b, 'test2', { setup: async v => { await noPeerJs(v); await v.ctx.routeWebSocket(/realtime\/v1\/websocket/, ws => { ws.onMessage(() => {}); }); } });
    await joinCode(g, 'QQ78');
    await g.page.waitForSelector('.g-lobby [data-n="jcancel"]', { timeout: 30000 });
    await sleep(2500);
    await reload(g); await sleep(7000);
    const st = await g.page.evaluate(() => ({ lobby: !!document.querySelector('.g-lobby'), ses: sessionStorage.getItem('gameplay:netses') }));
    must(!st.lobby && !st.ses, 'the refreshed page resumed the attempt: ' + JSON.stringify(st));
  });
  await scenario('I guest refreshes inside a party: comes back to the same seat', async b => {
    const h = await player(b, 'test');
    const code = await hostParty(h, false);
    const g = await player(b, 'test2');
    await joinCode(g, code);
    await g.waitLobby(2); await h.waitLobby(2);
    await reload(g);
    await g.waitLobby(2, 150000);
    await sleep(3000);
    const hl = await h.lobby();
    must(hl.players.length === 2, 'host sees ' + hl.players.length + ' players after the guest refresh: ' + hl.players.join(','));
  });
  await scenario('J host refreshes inside a party: same code, the guest reconnects by itself', async b => {
    const h = await player(b, 'test');
    const code = await hostParty(h, false);
    const g = await player(b, 'test2');
    await joinCode(g, code);
    await g.waitLobby(2); await h.waitLobby(2);
    await reload(h);
    await h.waitLobby(2, 180000);
    const hl = await h.lobby();
    must(hl.code === code, 'the code changed from ' + code + ' to ' + hl.code);
    await g.page.waitForFunction(() => { const l = document.querySelector('.g-lobby .gl-lob'); return !!l && !/Reconnecting/.test(l.innerText) && l.querySelectorAll('.gl-players .gl-pl:not(.gl-seat)').length === 2; }, null, { timeout: 120000 });
  });
  await scenario('K guest closes the tab: the host sees the seat free up', async b => {
    const h = await player(b, 'test');
    const code = await hostParty(h, false);
    const g = await player(b, 'test2');
    await joinCode(g, code);
    await g.waitLobby(2); await h.waitLobby(2);
    await g.page.close();
    await h.page.waitForFunction(() => { const l = document.querySelector('.g-lobby .gl-players'); return !!l && (l.querySelectorAll('.gl-pl:not(.gl-seat)').length === 1 || !!l.querySelector('.gl-pl.gl-away, .gl-pl.away')); }, null, { timeout: 30000 });
    await h.page.waitForFunction(() => document.querySelectorAll('.g-lobby .gl-players .gl-pl:not(.gl-seat)').length === 1, null, { timeout: 90000 });
  });
  await scenario('L guest goes offline for a few seconds: reconnects without leaving the party', async b => {
    const h = await player(b, 'test');
    const code = await hostParty(h, false);
    const g = await player(b, 'test2');
    await joinCode(g, code);
    await g.waitLobby(2); await h.waitLobby(2);
    await g.ctx.setOffline(true); await sleep(9000); await g.ctx.setOffline(false);
    await g.page.waitForFunction(() => { const l = document.querySelector('.g-lobby .gl-lob'); return !!l && !/Reconnecting/.test(l.innerText) && l.querySelectorAll('.gl-players .gl-pl:not(.gl-seat)').length === 2; }, null, { timeout: 150000 });
    await sleep(4000);
    const hl = await h.lobby();
    must(hl.players.length === 2, 'host sees ' + hl.players.length + ' players');
    return 'route after reconnect ' + await via(g);
  });
  const bad = results.filter(r => r[1]);
  console.log(bad.length ? bad.length + ' of ' + results.length + ' failing' : 'all ' + results.length + ' passing');
  process.exit(bad.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
