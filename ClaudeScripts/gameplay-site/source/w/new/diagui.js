const DG = { t: 0 };
async function diagCheck() {
  if (!SB.user) return;
  const uid = SB.user.id;
  DIAG.push = (sid, events, last) => sbRest('rpc/diag_push', { method: 'POST', body: { p_sid: sid, p_events: events }, keep: !!last });
  try {
    const r = await sbRest('rpc/diag_enabled', { method: 'POST', body: {} });
    if (!SB.user || SB.user.id !== uid) return;
    if (r === true) DIAG.arm(uid); else if (DIAG.on) DIAG.disarm();
  } catch (e) { if (sbMissing(e) && DIAG.on) DIAG.disarm(); }
  diagUi();
}
function diagStats() {
  const el = $('#diagchip');
  if (!el) return;
  const s = DIAG.stats();
  el.querySelector('.dg-s').textContent = s.events + ' events · ' + s.sent + ' saved · ' + s.queued + ' waiting' + (s.dropped ? ' · ' + s.dropped + ' dropped' : '');
  el.querySelector('.dg-id').textContent = 'Session ' + s.sid;
  el.querySelector('[data-dg="full"]').setAttribute('aria-checked', String(s.full));
}
function diagUi() {
  let el = $('#diagchip');
  if (!DIAG.on || !SB.user || DIAG.uid !== SB.user.id) { if (el) el.remove(); clearInterval(DG.t); return; }
  if (el) return;
  el = document.createElement('div');
  el.id = 'diagchip';
  el.setAttribute('translate', 'no');
  el.innerHTML = '<button type="button" class="dg-b" aria-expanded="false" aria-controls="diagpanel" title="Test account: diagnostics are being recorded"><i></i><span>REC</span></button><div class="dg-p" id="diagpanel" hidden><b>Test account diagnostics</b><p>Errors, logs, requests, packets and performance are recorded for this test account only.</p><span class="dg-s"></span><span class="dg-id"></span><div class="dg-r"><span>Full packet capture</span><button type="button" class="dg-sw" role="switch" aria-checked="false" data-dg="full" aria-label="Full packet capture"></button></div><div class="dg-a"><button type="button" class="btn2" data-dg="send">Save now</button><button type="button" class="btn2" data-dg="dl">Download log</button></div></div>';
  document.body.append(el);
  const b = el.querySelector('.dg-b'), p = el.querySelector('.dg-p');
  b.addEventListener('click', () => { p.hidden = !p.hidden; b.setAttribute('aria-expanded', String(!p.hidden)); diagStats(); });
  el.addEventListener('click', e => {
    const a = e.target.closest('[data-dg]');
    if (!a) return;
    const k = a.dataset.dg;
    if (k === 'full') { DIAG.setFull(a.getAttribute('aria-checked') !== 'true'); diagStats(); }
    else if (k === 'send') { DIAG.flush(); setTimeout(diagStats, 900); }
    else if (k === 'dl') {
      const d = DIAG.dump(), u = URL.createObjectURL(new Blob([JSON.stringify(d)], { type: 'application/json' })), l = document.createElement('a');
      l.href = u; l.download = 'gameplay-diagnostics-' + d.sid + '.json';
      document.body.append(l); l.click(); l.remove();
      setTimeout(() => URL.revokeObjectURL(u), 4000);
    }
  });
  clearInterval(DG.t);
  DG.t = setInterval(() => { if (!p.hidden) diagStats(); }, 1000);
}
Ameplay.diag = DIAG;
