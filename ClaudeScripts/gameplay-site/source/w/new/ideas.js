const FX = { IMG: 5242880, DOC: 8388608, MAX: 4, urls: new Map(), n: 0 };
const FX_EXT = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', pdf: 'application/pdf', txt: 'text/plain', log: 'text/plain', md: 'text/markdown', csv: 'text/csv', json: 'application/json', zip: 'application/zip' };
const FX_ACCEPT = Object.keys(FX_EXT).map(x => '.' + x).join(',') + ',image/png,image/jpeg,image/webp,image/gif,application/pdf,text/plain';
const FX_LIMITS = 'Pictures: PNG, JPEG, WebP or GIF, up to 5 MB each. Documents: PDF, TXT, MD, CSV, JSON, LOG or ZIP, up to 8 MB each.';
const FX_ICO = {
  bulb: '<svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/></svg>',
  clip: '<svg viewBox="0 0 24 24"><path d="M20 11.5 12.6 19a5 5 0 0 1-7.1-7.1l8-8a3.5 3.5 0 0 1 5 5l-8 8a2 2 0 0 1-2.9-2.9l7.4-7.4"/></svg>',
  file: '<svg viewBox="0 0 24 24"><path d="M6 2h9l4 4v16H6zM14 2v5h5"/></svg>',
  down: '<svg viewBox="0 0 24 24"><path d="M12 4v11M7 11l5 5 5-5M5 20h14"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  ok: '<svg viewBox="0 0 24 24"><path d="M5 12.5 9.5 17 19 7.5"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>',
  find: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  game: '<svg viewBox="0 0 24 24"><path d="M7 8h10a5 5 0 0 1 4.6 7l-.6 1.4a2.5 2.5 0 0 1-4.3.4L15 15H9l-1.7 1.8a2.5 2.5 0 0 1-4.3-.4L2.4 15A5 5 0 0 1 7 8z"/><path d="M8 11v3M6.5 12.5h3M16 12h.01M18 11h.01"/></svg>',
  improvement: '<svg viewBox="0 0 24 24"><path d="m11 3 1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9zM18.5 15l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z"/></svg>',
  bug: '<svg viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="13" rx="5"/><path d="M12 11v9M3 13h4M17 13h4M4 7l3 2M20 7l-3 2M4 19l3-2M20 19l-3-2M9 7a3 3 0 0 1 6 0"/></svg>',
  patch: '<svg viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/></svg>',
  other: '<svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/></svg>'
};
const fxSize = n => { n = +n || 0; const f = (v, u) => auT(u).replace('{n}', v.toLocaleString(adLang(), { maximumFractionDigits: v < 10 ? 1 : 0 })); return n >= 1048576 ? f(n / 1048576, '{n} MB') : n >= 1024 ? f(n / 1024, '{n} KB') : f(n, '{n} B'); };
const fxExt = p => (/\.([a-z0-9]{1,5})$/i.exec(p || '') || ['', ''])[1].toLowerCase();
const fxId = () => crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
function fxKind(f) {
  let ext = fxExt(f.name);
  if (!FX_EXT[ext]) ext = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'application/pdf': 'pdf' }[String(f.type || '').toLowerCase()] || '';
  if (!ext) return null;
  if (ext === 'jpeg') ext = 'jpg';
  return { ext, mime: FX_EXT[ext], img: /^image\//.test(FX_EXT[ext]) };
}
async function fxMagic(f, ext) {
  let b;
  try { b = new Uint8Array(await f.slice(0, 4096).arrayBuffer()); } catch (e) { return false; }
  const at = (s, o) => [...s].every((c, i) => b[(o || 0) + i] === c.charCodeAt(0));
  if (ext === 'png') return b[0] === 0x89 && at('PNG', 1);
  if (ext === 'jpg') return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  if (ext === 'gif') return at('GIF8');
  if (ext === 'webp') return at('RIFF') && at('WEBP', 8);
  if (ext === 'pdf') return at('%PDF');
  if (ext === 'zip') return at('PK') && b[2] < 9 && b[3] < 9;
  return (b[0] === 0xff && b[1] === 0xfe) || (b[0] === 0xfe && b[1] === 0xff) || !b.includes(0);
}
async function fxPrep(f) {
  const name = String(f.name || 'file').replace(/[\x00-\x1f\x7f/\\]/g, '').slice(0, 120) || 'file', k = fxKind(f);
  const no = m => ({ err: auT(m).replace('{n}', name).replace('{x}', k ? k.ext.toUpperCase() : '') });
  if (!k) return no('“{n}” cannot be attached. Use a picture (PNG, JPEG, WebP, GIF) or a document (PDF, TXT, MD, CSV, JSON, LOG, ZIP).');
  if (!f.size) return no('“{n}” is empty.');
  if (f.size > (k.img ? FX.IMG : FX.DOC)) return no(k.img ? '“{n}” is too big. Pictures can be up to 5 MB.' : '“{n}” is too big. Documents can be up to 8 MB.');
  if (!(await fxMagic(f, k.ext))) return no('“{n}” is not a real {x} file.');
  let blob = f, w = 0, h = 0;
  if (k.img) {
    try {
      const bm = await createImageBitmap(f);
      w = bm.width; h = bm.height;
      if (k.ext === 'jpg') {
        const s = Math.min(1, 4096 / Math.max(w, h)), cw = Math.max(1, Math.round(w * s)), ch = Math.max(1, Math.round(h * s));
        const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
        cv.getContext('2d').drawImage(bm, 0, 0, cw, ch);
        const out = await new Promise(r => cv.toBlob(r, 'image/jpeg', .9));
        if (out && out.type === 'image/jpeg' && out.size <= FX.IMG) { blob = out; w = cw; h = ch; }
      }
      if (bm.close) bm.close();
    } catch (e) { return no('“{n}” could not be opened as a picture.'); }
  }
  return { it: { id: ++FX.n, name, size: blob.size, ext: k.ext, mime: k.mime, img: k.img, w, h, blob, st: 'ready', pct: 0, path: null, err: '', url: k.img ? URL.createObjectURL(blob) : '' } };
}
async function fxPut(bucket, path, blob, mime, onp) {
  let tok = null;
  try { const c = await sbClient(), r = await c.auth.getSession(); tok = r && r.data && r.data.session ? r.data.session.access_token : null; } catch (e) {}
  if (!tok) throw new Error('Not signed in');
  return new Promise((res, rej) => {
    const x = new XMLHttpRequest();
    x.open('POST', SBN.url('/storage/v1/object/' + bucket + '/' + path));
    x.setRequestHeader('apikey', SUPABASE_ANON_KEY);
    x.setRequestHeader('Authorization', 'Bearer ' + tok);
    x.setRequestHeader('x-upsert', 'false');
    x.setRequestHeader('cache-control', 'max-age=3600');
    x.setRequestHeader('Content-Type', mime);
    x.timeout = 240000;
    x.upload.onprogress = e => { if (e.lengthComputable && onp) onp(e.loaded / e.total); };
    x.onload = () => {
      if (x.status >= 200 && x.status < 300) { res(); return; }
      let j = null;
      try { j = JSON.parse(x.responseText); } catch (e) {}
      const er = new Error((j && j.message) || 'HTTP ' + x.status);
      er.status = +(j && j.statusCode) || x.status;
      rej(er);
    };
    x.onerror = x.ontimeout = x.onabort = () => { const er = new Error('network'); er.status = 0; rej(er); };
    x.send(blob);
  });
}
function fxErr(e) {
  const s = e && e.status, m = String(e && e.message || '');
  if (s === 413 || /maximum allowed size|too large/i.test(m)) return auT('This file is too big for the server.');
  if (s === 415 || /mime type/i.test(m)) return auT('This file type is not allowed.');
  if (s === 403 || s === 401 || /row-level security|unauthorized/i.test(m)) return auT('You have sent a lot of files. Wait a while and try again.');
  if (/not signed in/i.test(m)) return auT('Log in again to send files.');
  return auT('The upload failed. Check your connection and try again.');
}
async function fxWhy(e) {
  const s = e && e.status;
  if (s !== 403 && s !== 401 && !/row-level security|unauthorized/i.test(String(e && e.message || ''))) return fxErr(e);
  try { const u = await adRpc('my_file_usage'); if (u && +u.bytes >= +u.cap) return auT('Your file space is full ({a} of {b}). Delete files you sent before to make room.').replace('{a}', fxSize(u.bytes)).replace('{b}', fxSize(u.cap)); }
  catch (x) { if (/locked/i.test(String(x && x.message || ''))) return auT('Your account is locked.'); }
  return fxErr(e);
}
function fxBox(host, o) {
  o = o || {};
  const B = { items: [], busy: false, max: o.max || FX.MAX, host };
  host.classList.add('fx');
  host.innerHTML = `<div class="fx-list" role="list" aria-label="Attached files"></div><div class="fx-zone"><button class="btn2 fx-add" type="button">${FX_ICO.clip}<span>Attach files</span></button><input type="file" multiple hidden tabindex="-1" accept="${FX_ACCEPT}"><small class="fx-hint"><b>Up to ${B.max} files.</b> <span>${FX_LIMITS}</span> <span class="fx-how">Drop them here, paste a picture, or use the button.</span></small></div><div class="note fx-note" role="alert"></div>`;
  const list = host.querySelector('.fx-list'), inp = host.querySelector('input'), note = host.querySelector('.fx-note'), zone = host.querySelector('.fx-zone');
  const say = m => { note.textContent = m || ''; note.className = 'note fx-note' + (m ? ' bad' : ''); };
  const row = it => {
    const st = it.st === 'up' ? auT('Uploading… {p}%').replace('{p}', Math.round(it.pct * 100)) : it.st === 'done' ? auT('Uploaded') : it.st === 'err' ? it.err : fxSize(it.size);
    return `<div class="fx-i ${it.st}${it.nw ? ' nw' : ''}" role="listitem" data-fi="${it.id}">${it.img ? `<img class="fx-th" src="${esc(it.url)}" alt="">` : `<span class="fx-ic" aria-hidden="true">${FX_ICO.file}<i>${esc(it.ext.toUpperCase())}</i></span>`}<span class="fx-nm"><b translate="no" title="${esc(it.name)}">${esc(it.name)}</b><small>${esc(st)}</small></span><button type="button" class="fx-rm" aria-label="${esc(auT('Remove {n}').replace('{n}', it.name))}" title="${esc(auT('Remove'))}">${FX_ICO.x}</button><i class="fx-bar" aria-hidden="true"><s style="width:${Math.round(it.pct * 100)}%"></s></i></div>`;
  };
  B.draw = () => { list.innerHTML = B.items.map(row).join(''); B.items.forEach(it => { it.nw = false; }); host.dataset.n = B.items.length; host.querySelector('.fx-add').disabled = B.busy || B.items.length >= B.max; if (o.change) o.change(B); };
  const tick = it => {
    const el = list.querySelector(`[data-fi="${it.id}"]`);
    if (!el) return;
    el.className = 'fx-i ' + it.st;
    el.querySelector('small').textContent = it.st === 'up' ? auT('Uploading… {p}%').replace('{p}', Math.round(it.pct * 100)) : it.st === 'done' ? auT('Uploaded') : it.st === 'err' ? it.err : fxSize(it.size);
    el.querySelector('.fx-bar s').style.width = Math.round(it.pct * 100) + '%';
  };
  B.add = async files => {
    if (B.busy) return;
    const L = [...(files || [])];
    if (!L.length) return;
    let bad = '';
    for (const f of L) {
      if (B.items.length >= B.max) { bad = bad || auT('You can attach up to {n} files.').replace('{n}', B.max); break; }
      const r = await fxPrep(f);
      if (r.err) { bad = bad || r.err; continue; }
      r.it.nw = true;
      B.items.push(r.it);
    }
    B.draw(); say(bad);
  };
  B.clear = () => { B.items.forEach(it => { if (it.url) URL.revokeObjectURL(it.url); }); B.items = []; B.busy = false; host.classList.remove('fx-busy'); B.draw(); say(''); };
  B.upload = async (bucket, prefix) => {
    if (!B.items.length) return [];
    B.busy = true; host.classList.add('fx-busy'); say(''); B.draw();
    try {
      for (const it of B.items) {
        if (it.path) continue;
        it.st = 'up'; it.pct = 0; it.err = ''; tick(it);
        const path = prefix + '/' + fxId() + '.' + it.ext;
        try { await fxPut(bucket, path, it.blob, it.mime, p => { it.pct = p; tick(it); }); }
        catch (e) { it.st = 'err'; it.pct = 0; it.err = await fxWhy(e); tick(it); const er = new Error(auT('“{n}” was not uploaded. {why}').replace('{n}', it.name).replace('{why}', it.err)); er.fx = true; throw er; }
        it.path = path; it.st = 'done'; it.pct = 1; tick(it);
      }
      return B.items.map(it => ({ path: it.path, name: it.name, w: it.w, h: it.h }));
    } finally { B.busy = false; host.classList.remove('fx-busy'); host.querySelector('.fx-add').disabled = B.items.length >= B.max; }
  };
  host.querySelector('.fx-add').addEventListener('click', () => inp.click());
  inp.addEventListener('change', () => { const L = [...inp.files]; inp.value = ''; B.add(L); });
  list.addEventListener('click', e => {
    const b = e.target.closest('.fx-rm');
    if (!b) return;
    e.stopPropagation();
    if (B.busy) return;
    const id = +b.closest('[data-fi]').dataset.fi, i = B.items.findIndex(x => x.id === id);
    if (i < 0) return;
    if (B.items[i].url) URL.revokeObjectURL(B.items[i].url);
    B.items.splice(i, 1); B.draw(); say('');
    host.querySelector('.fx-add').focus({ preventScroll: true });
  });
  const dz = o.drop || host, hasFiles = e => !!e.dataTransfer && [...(e.dataTransfer.types || [])].includes('Files');
  dz.addEventListener('dragover', e => { if (!hasFiles(e)) return; e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; zone.classList.add('over'); });
  dz.addEventListener('dragleave', e => { if (!dz.contains(e.relatedTarget)) zone.classList.remove('over'); });
  dz.addEventListener('drop', e => { if (!hasFiles(e)) return; e.preventDefault(); e.stopPropagation(); zone.classList.remove('over'); B.add(e.dataTransfer.files); });
  (o.paste || []).forEach(el => el.addEventListener('paste', e => { const L = [...(e.clipboardData && e.clipboardData.files || [])]; if (L.length) { e.preventDefault(); B.add(L); } }));
  B.draw();
  return B;
}
async function fxSign(bucket, paths, staff) {
  const now = Date.now(), need = paths.filter(p => { const u = FX.urls.get(bucket + ':' + p); return !u || u.t < now; });
  if (need.length) {
    if (FX.urls.size > 600) FX.urls.clear();
    if (staff) await adRpc('admin_files_open', { p_bucket: bucket, p_paths: need.slice(0, 40) });
    const c = await sbClient();
    const { data, error } = await c.storage.from(bucket).createSignedUrls(need, 3600);
    if (error) throw error;
    (data || []).forEach(d => { if (d && d.signedUrl && !d.error) FX.urls.set(bucket + ':' + d.path, { u: d.signedUrl, t: now + 3000000 }); });
  }
  return new Map(paths.map(p => [p, (FX.urls.get(bucket + ':' + p) || {}).u || null]));
}
function fxBad(im) { im.classList.add('bad'); im.removeAttribute('src'); im.alt = auT('Picture not available'); const b = im.closest('.fx-pic'); if (b) b.disabled = true; }
async function fxFill(root) {
  const G = {};
  if (!root) return;
  root.querySelectorAll('.fx-v[data-fxb] img[data-fxp]:not([src]):not(.bad)').forEach(im => { const v = im.closest('[data-fxb]'), k = v.dataset.fxb + (v.dataset.fxs ? '|s' : ''); (G[k] = G[k] || []).push(im); });
  for (const k of Object.keys(G)) {
    const b = k.split('|')[0];
    try {
      const U = await fxSign(b, [...new Set(G[k].map(im => im.dataset.fxp))], k !== b);
      G[k].forEach(im => { const u = U.get(im.dataset.fxp); if (!u) { fxBad(im); return; } im.onerror = () => { FX.urls.delete(b + ':' + im.dataset.fxp); fxBad(im); }; im.src = u; });
    } catch (e) { G[k].forEach(fxBad); }
  }
}
async function fxDown(b) {
  const v = b.closest('[data-fxb]');
  if (!v || b.classList.contains('is-busy')) return;
  b.classList.add('is-busy');
  try {
    if (v.dataset.fxs) await adRpc('admin_files_open', { p_bucket: v.dataset.fxb, p_paths: [b.dataset.fxd] });
    const c = await sbClient();
    const { data, error } = await c.storage.from(v.dataset.fxb).createSignedUrl(b.dataset.fxd, 120, { download: b.dataset.fxn || true });
    if (error || !data || !data.signedUrl) throw error || new Error('no url');
    const a = document.createElement('a');
    a.href = data.signedUrl; a.download = b.dataset.fxn || ''; a.rel = 'noopener';
    a.click();
    track('file', { act: 'download', from: v.dataset.fxb });
  } catch (e) { toast(auT('Could not download the file. Try again.')); }
  finally { setTimeout(() => b.classList.remove('is-busy'), 400); }
}
const fxDelBtn = p => `<button type="button" class="fx-x" data-fxx="${esc(p)}" aria-label="${esc(auT('Delete this file'))}" title="${esc(auT('Delete this file'))}">${FX_ICO.trash}</button>`;
function fxCard(a, del) {
  const ext = fxExt(a.path).toUpperCase(), name = a.name || auT('File');
  return `<div class="fx-card"><span class="fx-ic" aria-hidden="true">${FX_ICO.file}<i>${esc(ext)}</i></span><span class="fx-nm"><b translate="no" title="${esc(name)}">${esc(name)}</b><small>${esc(ext)}${a.size ? ' · ' + esc(fxSize(a.size)) : ''}</small></span>${del ? fxDelBtn(a.path) : ''}<button type="button" class="fx-dl" data-fxd="${esc(a.path)}" data-fxn="${esc(name)}" aria-label="${esc(auT('Download {n}').replace('{n}', name))}" title="${esc(auT('Download'))}">${FX_ICO.down}</button></div>`;
}
function fxAtts(L, bucket, o) {
  L = (Array.isArray(L) ? L : []).filter(a => a && typeof a.path === 'string');
  if (!L.length) return '';
  o = o || {};
  const P = L.filter(a => a.kind === 'image'), D = L.filter(a => a.kind !== 'image');
  return `<div class="fx-v" data-fxb="${esc(bucket)}"${o.staff ? ' data-fxs="1"' : ''}>${P.length ? `<div class="fx-pics">${P.map(a => `<span class="fx-pw"><button type="button" class="fx-pic" data-fxz aria-label="${esc(auT('Open picture {n}').replace('{n}', a.name || ''))}"><img data-fxp="${esc(a.path)}" alt="" width="${+a.w || 320}" height="${+a.h || 240}" loading="lazy" decoding="async"></button>${o.del ? fxDelBtn(a.path) : ''}</span>`).join('')}</div>` : ''}${D.map(a => fxCard(a, o.del)).join('')}</div>`;
}
async function fxDel(b) {
  const v = b.closest('[data-fxb]');
  if (!v || b.classList.contains('is-busy')) return;
  if (b.dataset.c && Date.now() - (b._at || 0) < 350) return;
  if (!b.dataset.c) {
    b.dataset.c = '1'; b._at = Date.now(); b.classList.add('sure');
    b.setAttribute('aria-label', auT('Click again to delete this file')); b.title = auT('Click again to delete this file');
    clearTimeout(b._ct); b._ct = setTimeout(() => { delete b.dataset.c; b.classList.remove('sure'); b.setAttribute('aria-label', auT('Delete this file')); b.title = auT('Delete this file'); }, 4000);
    return;
  }
  clearTimeout(b._ct); b.classList.add('is-busy');
  const path = b.dataset.fxx, bucket = v.dataset.fxb;
  try {
    await adRpc('my_file_delete', { p_bucket: bucket, p_path: path });
    FX.urls.delete(bucket + ':' + path);
    const row = b.closest('.ch-r'), it = b.closest('.fx-pw, .fx-card');
    if (row) { DM.msgs = DM.msgs.filter(m => !(m.meta && m.meta.path === path)); DM.urls.delete(path); row.remove(); }
    else if (it) { const box = it.parentNode; it.remove(); if (box.classList.contains('fx-pics') && !box.children.length) box.remove(); }
    toast(auT('File deleted'));
    track('file', { act: 'delete', from: bucket });
  } catch (e) { b.classList.remove('is-busy', 'sure'); delete b.dataset.c; toast(auT('Could not delete the file. Try again.')); }
}
addEventListener('keydown', e => { const lb = document.getElementById('soLight'); if (e.key === 'Escape' && lb && !lb.hidden && !lb.classList.contains('out')) { e.preventDefault(); e.stopImmediatePropagation(); vis(lb, false); } }, true);

const ID = { tab: 'new', kind: '', game: null, list: null, busy: false, uid: null, news: 0, at: 0, fx: null, done: false, seq: 0 };
const ID_KINDS = [['game', 'New game'], ['improvement', 'Improvement'], ['bug', 'Bug'], ['patch', 'Fix or patch'], ['other', 'Other']];
const ID_ST = { new: ['New', ''], seen: ['Seen', 'acc'], planned: ['Planned', 'warn'], done: ['Done', 'ok'], declined: ['Not planned', 'bad'] };
const ID_PH = { '': 'Tell us about your idea.', game: 'What is the game? How do you play it, and how do you win?', improvement: 'What should change, and why would it be better?', bug: 'What happened? What did you expect? Which game and which device?', patch: 'What should be fixed or changed, and how?', other: 'Tell us what is on your mind.' };
const idKindName = k => (ID_KINDS.find(x => x[0] === k) || ID_KINDS[4])[1];
const idKindPill = k => { const n = ID_KINDS.some(x => x[0] === k) ? k : 'other'; return `<span class="id-k id-k-${n}">${FX_ICO[n]}<span>${esc(auT(idKindName(n)))}</span></span>`; };
const idStPill = s => { const x = ID_ST[s] || ID_ST.new; return adPill(x[0], x[1]); };
const idNote = (m, k) => { const n = $('#idnote'); if (n) { n.textContent = m ? auT(m) : ''; n.className = 'note' + (k ? ' ' + k : ''); } };
const idWait = e => { const s = sbWait(e) || 60; return s >= 3600 ? auT('{n} h').replace('{n}', Math.ceil(s / 3600)) : s >= 60 ? auT('{n} min').replace('{n}', Math.ceil(s / 60)) : auT('{n} s').replace('{n}', s); };
function idErr(e) {
  const m = String(e && e.message || '');
  if (e && e.fx) return m;
  if (sbLimit(e)) return auT(e.details === 'idea_create_d' ? 'You have reached the limit of 20 ideas a day. You can send another one in {t}.' : 'You have reached the limit of 5 ideas an hour. You can send another one in {t}.').replace('{t}', idWait(e));
  if (/locked/i.test(m)) return auT('Your account is locked.');
  if (/attachment too large/i.test(m)) return auT('One of your files is too big. Remove it and try again.');
  if (/attachment|too many rows/i.test(m)) return auT('One of your files could not be attached. Remove it and try again.');
  if (/write a title/i.test(m)) return auT('Give your idea a title of at least 3 characters.');
  if (/write a description/i.test(m)) return auT('Describe your idea in at least 10 characters.');
  if (sbMissing(e)) return auT('The idea box is not open yet. Try again later.');
  return auT('Could not send your idea. Check your connection and try again.');
}
function idBadge() {
  const n = ID.news, s = n > 9 ? '9+' : String(n || '');
  document.querySelectorAll('#ibtn em, #idmi em, #idmodal [data-idtab="mine"] em').forEach(em => { em.textContent = s; em.hidden = !n; });
  const b = $('#ibtn');
  if (b) b.setAttribute('aria-label', auT('Idea box') + (n ? ' · ' + auT(n === 1 ? '1 new reply' : '{n} new replies').replace('{n}', n) : ''));
}
async function idNews() {
  ID.at = Date.now();
  if (!SB.user || AD.locked) return;
  const uid = SB.user.id;
  try { const n = await adRpc('my_idea_news'); if (SB.user && SB.user.id === uid) { ID.news = +n || 0; idBadge(); } } catch (e) {}
}
function idUser() {
  const on = !!ID.uid;
  ['#ibtn', '#idmi'].forEach(s => { const el = $(s); if (el) el.hidden = !on; });
  ID.list = null; ID.sig = ''; ID.news = 0; ID.done = false; ID.busy = false; ID.seq++;
  idBadge();
  if (ID.fx) { idReset(); idTab('new'); }
  if (!on && openK === 'mideas') closeAll();
  ID.at = on ? Date.now() - 294000 : 0;
  IDA.list = null; IDA.sel = null; IDA.at = 0; IDA.purged = 0;
  document.querySelectorAll('.tk').forEach(b => { const T = b._tk; if (T) [T.fx, T.fxn].forEach(x => { if (x) x.clear(); }); });
}
function idGame() {
  const g = ID.game && byId.get(ID.game), el = $('#idgame');
  if (!el) return;
  el.hidden = !g;
  if (g) el.querySelector('b').textContent = g.title;
}
function idPick(k) {
  ID.kind = k;
  document.querySelectorAll('#idform [data-idk]').forEach(b => { const on = b.dataset.idk === k; b.setAttribute('aria-checked', String(on)); b.tabIndex = on || (!k && b.dataset.idk === 'game') ? 0 : -1; });
  $('#idbo').placeholder = auT(ID_PH[k] || ID_PH['']);
  $('#idctx').hidden = k !== 'bug';
}
function idReset() {
  const f = $('#idform');
  if (!f) return;
  f.reset(); f.inert = false; f.removeAttribute('aria-busy');
  idPick(''); ID.fx.clear(); idNote(''); idCount();
  const b = $('#idsend'); b.disabled = false; b.classList.remove('is-busy');
}
function idCount() { const b = $('#idbo'), c = $('#idcnt'); if (b && c) { c.textContent = b.value.length + ' / 4000'; c.classList.toggle('near', b.value.length > 3800); } }
function idBuild() {
  const m = $('#idmodal .mb');
  m.innerHTML = `<form class="id-form" id="idform" novalidate role="tabpanel" aria-labelledby="idtn">
   <div class="fld"><span class="id-lb" id="idkl">What is it about?</span><div class="id-kinds" role="radiogroup" aria-labelledby="idkl">${ID_KINDS.map(([k, t]) => `<button type="button" class="id-kind" role="radio" aria-checked="false" data-idk="${k}">${FX_ICO[k]}<span>${t}</span></button>`).join('')}</div></div>
   <div class="id-game" id="idgame" hidden><span>About the game</span><b translate="no"></b><button type="button" id="idgx" aria-label="Do not mention this game" title="Do not mention this game">${FX_ICO.x}</button></div>
   <div class="fld"><label for="idti">Title</label><input id="idti" maxlength="100" autocomplete="off" enterkeyhint="next" placeholder="A short name for your idea"></div>
   <div class="fld"><label for="idbo">Description</label><textarea id="idbo" maxlength="4000" rows="5"></textarea><small class="id-cnt" id="idcnt" aria-hidden="true">0 / 4000</small></div>
   <div class="fld"><span class="id-lb">Pictures and files (optional)</span><div id="idfx"></div></div>
   <p class="id-ctx" id="idctx" hidden>Your browser name and screen size are added to a bug report, so we can find the problem faster.</p>
   <div class="note" id="idnote" role="alert"></div>
   <div class="id-foot"><small>You can send up to 5 ideas an hour.</small><button class="btn2 pri" type="submit" id="idsend">${FX_ICO.bulb}<span>Send idea</span></button></div>
  </form>
  <div class="id-done" id="iddone" hidden role="status"><span class="id-ok" aria-hidden="true">${FX_ICO.ok}</span><h4 tabindex="-1">Thank you! Your idea is in the box.</h4><p>We read every idea. You can follow yours, and see our answer, under My ideas.</p><div class="addrow"><button class="btn2" type="button" data-idgo="again">Send another idea</button><button class="btn2 pri" type="button" data-idgo="mine">See my ideas</button></div></div>
  <div class="id-mine" id="idmine" hidden role="tabpanel" aria-labelledby="idtm"></div>`;
  const f = $('#idform');
  ID.fx = fxBox($('#idfx'), { drop: $('#idmodal .mc'), paste: [f] });
  f.addEventListener('submit', e => { e.preventDefault(); idSend(); });
  f.addEventListener('input', e => { if (e.target.id === 'idbo') idCount(); if (ID.busy) return; idNote(''); });
  f.addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && e.target.tagName === 'TEXTAREA') { e.preventDefault(); idSend(); return; }
    const r = e.target.closest('[data-idk]');
    if (!r || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const L = [...f.querySelectorAll('[data-idk]')], i = L.indexOf(r), n = e.key === 'Home' ? 0 : e.key === 'End' ? L.length - 1 : (i + (e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? L.length - 1 : 1)) % L.length;
    idPick(L[n].dataset.idk); L[n].focus();
  });
  m.addEventListener('click', e => {
    const k = e.target.closest('[data-idk]');
    if (k) { if (!ID.busy) { idPick(k.dataset.idk); idNote(''); } return; }
    if (e.target.closest('#idgx')) { e.stopPropagation(); ID.game = null; ID.nogame = true; idGame(); $('#idti').focus({ preventScroll: true }); return; }
    const g = e.target.closest('[data-idgo]');
    if (g) { e.stopPropagation(); const a = g.dataset.idgo; if (a === 'mine') idTab('mine'); else if (a === 'retry') idMine(); else if (a === 'del') idDel(g); else { ID.done = false; idTab('new'); if (!auCoarse()) $('#idform [data-idk][tabindex="0"]').focus({ preventScroll: true }); } return; }
    const mo = e.target.closest('[data-idmore]');
    if (mo) { const c = mo.closest('.id-card'); const on = c.classList.toggle('open'); mo.textContent = auT(on ? 'Show less' : 'Show more'); mo.setAttribute('aria-expanded', String(on)); }
  });
  idPick('');
}
function idTab(t) {
  ID.tab = t;
  document.querySelectorAll('#idmodal [data-idtab]').forEach(b => { const on = b.dataset.idtab === t; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
  $('#idform').hidden = t !== 'new' || ID.done;
  $('#iddone').hidden = t !== 'new' || !ID.done;
  $('#idmine').hidden = t !== 'mine';
  if (t === 'mine') idMine();
}
function idOpen(tab) {
  if (!SB.user) { auOpen('main', '', '', 'in'); return; }
  if (openK !== 'mideas') setOpen('mideas');
  if (openK !== 'mideas') return;
  if (!ID.fx) idBuild();
  const g = (cur && cur.g) || pend;
  if (g && g.id !== ID.gameWas) ID.nogame = false;
  ID.gameWas = g ? g.id : null;
  ID.game = g && !ID.nogame ? g.id : null;
  ID.done = false;
  idGame();
  idTab(tab || (ID.news ? 'mine' : ID.tab));
}
async function idSend() {
  if (ID.busy || !SB.user) return;
  const f = $('#idform'), ti = $('#idti'), bo = $('#idbo'), t = ti.value.replace(/\s+/g, ' ').trim(), b = bo.value.trim();
  const bad = (m, el, fo) => { idNote(m, 'bad'); auShake(el); (fo || el).focus({ preventScroll: true }); el.scrollIntoView({ block: 'nearest', behavior: motionOK() ? 'smooth' : 'auto' }); };
  if (!ID.kind) return bad('Choose what your idea is about.', f.querySelector('.id-kinds'), f.querySelector('[data-idk][tabindex="0"]'));
  if (t.length < 3) return bad('Give your idea a title of at least 3 characters.', ti);
  if (b.length < 10) return bad('Describe your idea in at least 10 characters.', bo);
  const btn = $('#idsend'), seq = ++ID.seq, uid = SB.user.id, kind = ID.kind;
  ID.busy = true; btn.disabled = true; btn.classList.add('is-busy'); f.setAttribute('aria-busy', 'true');
  idNote(ID.fx.items.length ? 'Uploading your files…' : 'Sending your idea…');
  try {
    const files = await ID.fx.upload('ideas', uid);
    if (seq !== ID.seq) return;
    idNote('Sending your idea…');
    await adRpc('idea_create', { p_kind: kind, p_title: t, p_body: b, p_files: files, p_game: ID.game, p_ctx: kind === 'bug' ? { ua: navigator.userAgent, w: innerWidth, h: innerHeight, lang: adLang() } : null });
    if (seq !== ID.seq) return;
    track('idea', { act: 'send', kind, files: files.length });
    idReset(); ID.list = null; ID.sig = ''; ID.done = true; idTab('new');
    $('#iddone h4').focus({ preventScroll: true });
  } catch (e) { if (seq === ID.seq) { idNote(idErr(e), 'bad'); track('idea', { act: 'fail', why: sbLimit(e) ? 'limit' : e && e.fx ? 'upload' : 'error' }); } }
  finally { if (seq === ID.seq) { ID.busy = false; btn.disabled = false; btn.classList.remove('is-busy'); f.removeAttribute('aria-busy'); } }
}
function idCard(it, i) {
  const long = it.body.length > 280 || it.body.split('\n').length > 4;
  return `<article class="id-card${it.fresh ? ' fresh' : ''}" data-k="id:${+it.id}" style="--i:${Math.min(i, 10)}"><header>${idKindPill(it.kind)}${idStPill(it.status)}${it.fresh ? adPill('New reply', 'acc') : ''}<time title="${esc(adDate(it.created_at, 1))}">${esc(adAgo(it.created_at))}</time></header><h4 translate="no">${esc(it.title)}</h4>${it.game && byId.get(it.game) ? `<small class="id-about">${esc(auT('About {g}').replace('{g}', byId.get(it.game).title))}</small>` : ''}<p class="id-body${long ? ' clamp' : ''}" translate="no">${esc(it.body)}</p>${long ? `<button type="button" class="au-link id-more" data-idmore aria-expanded="false">${esc(auT('Show more'))}</button>` : ''}${fxAtts(it.attachments, 'ideas')}${it.reply ? `<div class="id-reply"><b>${esc(auT('Reply from the gameplay team'))}</b><p translate="no">${esc(it.reply)}</p>${it.reply_at ? `<small title="${esc(adDate(it.reply_at, 1))}">${esc(adAgo(it.reply_at))}</small>` : ''}</div>` : ''}<footer><button type="button" class="btn2 id-del" data-idgo="del" data-id="${+it.id}">${esc(auT('Delete idea'))}</button></footer></article>`;
}
async function idDel(b) {
  const id = +b.dataset.id;
  if (b.dataset.c && Date.now() - (b._at || 0) < 350) return;
  if (!b.dataset.c) b._at = Date.now();
  if (!adConfirm(b)) return;
  b.disabled = true; b.classList.add('is-busy');
  try {
    await adRpc('idea_delete', { p_id: id });
    ID.list = (ID.list || []).filter(x => x.id !== id); ID.sig = '';
    idMineDraw();
    toast(auT('Idea deleted'));
    track('idea', { act: 'delete' });
  } catch (e) { b.disabled = false; b.classList.remove('is-busy'); toast(auT('Could not delete the idea. Try again.')); }
}
function idMineDraw() {
  const box = $('#idmine'), sig = JSON.stringify(ID.list);
  if (sig === ID.sig && box.querySelector('.id-card, .id-empty')) return;
  ID.sig = sig;
  box.innerHTML = ID.list.length ? ID.list.map(idCard).join('') : `<div class="id-empty"><span aria-hidden="true">${FX_ICO.bulb}</span><b>No ideas yet</b><p>Send your first idea. It will show up here with its status and our answer.</p><button class="btn2 pri" type="button" data-idgo="again">Write an idea</button></div>`;
  fxFill(box);
}
async function idMine() {
  const box = $('#idmine'), uid = SB.user && SB.user.id;
  if (!box || !uid) return;
  if (!ID.list) box.innerHTML = '<i class="sk id-sk" aria-hidden="true"></i>'.repeat(3);
  try {
    const r = await adRpc('my_ideas');
    if (!SB.user || SB.user.id !== uid) return;
    ID.list = Array.isArray(r) ? r : [];
    ID.news = 0; idBadge();
    idMineDraw();
  } catch (e) {
    if (!ID.list) box.innerHTML = `<div class="id-empty"><b>${esc(auT(sbMissing(e) ? 'The idea box is not open yet. Try again later.' : 'Could not load your ideas. Check your connection and try again.'))}</b><button class="btn2" type="button" data-idgo="retry">Try again</button></div>`;
  }
}
function idBoot() {
  if ($('#idmodal') || !$('#abtn')) return;
  MENUS.mideas = ['#idmodal', '#ibtn'];
  if (typeof AL_T === 'object') Object.assign(AL_T, { idea_update: '{a} updated an idea from {t}', idea_delete: '{a} deleted an idea from {t}', idea_files: '{a} opened the files of an idea from {t}', ticket_files: '{a} opened the files of a ticket from {t}', files_cleanup: '{a} cleared files that were no longer used' });
  if (typeof AB_T === 'object') Object.assign(AB_T, { idea_create: 'Ideas per hour', idea_create_d: 'Ideas per day', dm_file: 'Files per minute', dm_file_d: 'Files per day' });
  $('#abtn').insertAdjacentHTML('afterend', `<button class="icon" id="ibtn" type="button" aria-label="Idea box" title="Idea box" aria-haspopup="dialog" aria-expanded="false" aria-controls="idmodal" data-au="in" hidden>${FX_ICO.bulb}<em hidden></em></button>`);
  const sup = document.querySelector('#pmenu [data-go="msupport"]');
  if (sup) sup.insertAdjacentHTML('afterend', `<button class="item" type="button" id="idmi" data-au="in" hidden>${FX_ICO.bulb}Idea box<em hidden></em></button>`);
  document.body.insertAdjacentHTML('beforeend', `<div class="modal" id="idmodal" hidden role="dialog" aria-modal="true" aria-labelledby="idt"><div class="mc wide idb"><div class="mh"><h3 id="idt">Idea box</h3><button class="x" type="button" data-close aria-label="Close">${FX_ICO.x}</button></div><div class="id-tabs" role="tablist" aria-label="Idea box sections"><button type="button" role="tab" id="idtn" data-idtab="new" aria-selected="true">New idea</button><button type="button" role="tab" id="idtm" data-idtab="mine" aria-selected="false" tabindex="-1">My ideas<em hidden></em></button></div><div class="mb"></div></div></div>`);
  const md = $('#idmodal');
  ['keydown', 'keyup'].forEach(t => md.addEventListener(t, e => { if (e.key !== 'Escape') e.stopPropagation(); }));
  md.querySelector('.id-tabs').addEventListener('click', e => { const b = e.target.closest('[data-idtab]'); if (b) { if (b.dataset.idtab === 'new') ID.done = false; idTab(b.dataset.idtab); } });
  md.querySelector('.id-tabs').addEventListener('keydown', e => { if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return; e.preventDefault(); const t = ID.tab === 'new' ? 'mine' : 'new'; idTab(t); md.querySelector(`[data-idtab="${t}"]`).focus(); });
  $('#ibtn').addEventListener('click', e => { e.stopPropagation(); if (openK === 'mideas') closeAll(); else idOpen(); });
  const mi = $('#idmi');
  if (mi) mi.addEventListener('click', e => { e.stopPropagation(); idOpen(); });
  document.addEventListener('click', e => {
    const t = e.target;
    if (!t || !t.closest) return;
    const d = t.closest('[data-fxd]');
    if (d) { e.preventDefault(); fxDown(d); return; }
    const x = t.closest('[data-fxx]');
    if (x) { e.preventDefault(); fxDel(x); return; }
    const z = t.closest('[data-fxz]');
    if (z) { const im = z.querySelector('img'); if (im && im.getAttribute('src') && !im.classList.contains('bad')) soLight(im.src); }
  });
  ['dragover', 'drop'].forEach(t => md.addEventListener(t, e => { if (e.dataTransfer && [...(e.dataTransfer.types || [])].includes('Files')) e.preventDefault(); }));
  const ref = $('#adref');
  if (ref) ref.addEventListener('click', () => idaLive());
  ID.uid = SB.user ? SB.user.id : null;
  idUser();
  setInterval(() => {
    const uid = SB.user ? SB.user.id : null;
    if (uid !== ID.uid) { ID.uid = uid; idUser(); }
    if (!uid || document.visibilityState === 'hidden') return;
    const now = Date.now();
    if (!AD.locked && now - ID.at > 300000) idNews();
    if (view === 'admin' && adIsAdmin()) { if (now - IDA.at > 20000) idaLive(); if (now - IDA.purged > 600000) idaPurge(); }
  }, 3000);
}
['DOMContentLoaded', 'load'].forEach(t => addEventListener(t, () => setTimeout(idBoot, 0)));
if (document.readyState !== 'loading') setTimeout(idBoot, 0);

const IDA = { list: null, sel: null, kind: '', st: '', q: '', seq: 0, more: false, at: 0, n: 0, purged: 0, qt: 0 };
const idaItem = id => (IDA.list || []).find(x => x.id === id) || null;
const idaWho = it => it.username ? '@' + it.username : it.display_name || auT('Deleted account');
const idaNote = (m, k) => { const n = $('#idanote'); if (n) { n.textContent = m ? auT(m) : ''; n.className = 'note' + (k ? ' ' + k : ''); } };
function idaBadge() { const em = $('#adin'); if (em) { em.textContent = IDA.n || ''; em.hidden = !IDA.n; } }
async function idaCount() {
  if (!adIsAdmin()) return;
  try { const r = await adRpc('admin_idea_count'); IDA.n = +(r && r.new) || 0; idaBadge(); } catch (e) {}
}
function idaLive() {
  IDA.at = Date.now();
  if (!adIsAdmin()) return;
  idaCount();
  if (AD.tab === 'ideas' && $('#adideas') && !$('#adideas').hidden) idaLoad(true);
}
function idaShell() {
  const s = $('#adideas');
  if (!s || s.firstElementChild) return;
  s.innerHTML = `<div class="ida"><div class="adm-tools ida-tools"><label class="search" for="idaq">${FX_ICO.find}<input id="idaq" type="search" placeholder="Search ideas by words or by player" autocomplete="off" spellcheck="false" aria-label="Search ideas"></label><select id="idak" aria-label="Filter by type"><option value="">All types</option>${ID_KINDS.map(([k, t]) => `<option value="${k}">${t}</option>`).join('')}</select><select id="idas" aria-label="Filter by status"><option value="">All statuses</option>${Object.keys(ID_ST).map(k => `<option value="${k}">${ID_ST[k][0]}</option>`).join('')}</select></div><div class="ida-grid"><div class="ida-side"><div class="ida-list" role="list"></div><button class="btn2 ida-more" type="button" data-ida="more" hidden>Show more</button></div><div class="ida-main" hidden></div></div></div>`;
  s.addEventListener('click', e => { const b = e.target.closest('[data-ida]'); if (b) idaAct(b.dataset.ida, b); });
  s.addEventListener('change', e => { if (e.target.id === 'idak') { IDA.kind = e.target.value; idaLoad(); } if (e.target.id === 'idas') { IDA.st = e.target.value; idaLoad(); } });
  s.addEventListener('input', e => { if (e.target.id !== 'idaq') return; clearTimeout(IDA.qt); IDA.qt = setTimeout(() => { IDA.q = e.target.value.trim(); idaLoad(); }, 300); });
  s.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && e.target.id === 'idare') { e.preventDefault(); idaAct('reply', $('#idarb')); } });
}
function idaTab() { idaShell(); idaLoad(!!IDA.list); idaCount(); }
async function idaLoad(quiet, more) {
  const s = $('#adideas');
  if (!s || !adIsAdmin()) return;
  idaShell();
  const lb = s.querySelector('.ida-list'), my = ++IDA.seq;
  if (!quiet && !more) lb.innerHTML = '<i class="sk sk-tk" aria-hidden="true"></i>'.repeat(5);
  try {
    const before = more && IDA.list && IDA.list.length ? IDA.list[IDA.list.length - 1].id : null;
    const r = await adRpc('admin_ideas', { p_kind: IDA.kind || null, p_status: IDA.st || null, p_q: IDA.q || null, p_before: before, p_limit: quiet && IDA.list ? Math.min(200, Math.max(60, IDA.list.length)) : 60 });
    if (my !== IDA.seq) return;
    const L = Array.isArray(r) ? r : [];
    IDA.list = more ? (IDA.list || []).concat(L) : L;
    if (!quiet || more) IDA.more = L.length >= 60;
    IDA.at = Date.now();
    idaList(quiet);
    if (IDA.sel && !idaItem(IDA.sel) && !quiet) idaShow(null);
  } catch (e) {
    if (my !== IDA.seq) return;
    if (!quiet || !IDA.list) lb.innerHTML = `<div class="adm-empty">${esc(auT(sbMissing(e) ? 'Run round18_ideas.sql in the Supabase SQL editor to see this part.' : 'Could not load the ideas. Check your connection and try again.'))}</div>`;
  }
}
function idaList(quiet) {
  const s = $('#adideas'), lb = s.querySelector('.ida-list'), L = IDA.list || [];
  const h = L.length ? L.map((it, i) => `<button type="button" class="ida-item${it.id === IDA.sel ? ' on' : ''}${it.status === 'new' ? ' nw' : ''}" data-ida="open" data-id="${+it.id}" data-k="ida:${+it.id}" role="listitem" style="--i:${Math.min(i, 12)}"><span class="ida-it"><b translate="no">${esc(it.title)}</b>${idStPill(it.status)}</span><span class="ida-is">${idKindPill(it.kind)}<span translate="no">${esc(idaWho(it))}</span><span>${esc(adAgo(it.created_at))}</span>${(it.attachments || []).length ? `<span class="ida-clip" title="${esc(auT((it.attachments || []).length === 1 ? '1 file' : '{n} files').replace('{n}', it.attachments.length))}">${FX_ICO.clip}${it.attachments.length}</span>` : ''}${it.reply ? `<span class="ida-re">${esc(auT('Replied'))}</span>` : ''}</span></button>`).join('') : `<div class="adm-empty">${esc(auT(IDA.q || IDA.kind || IDA.st ? 'No ideas match.' : 'No ideas yet. They show up here as soon as a player sends one.'))}</div>`;
  if (quiet && L.length && lb.querySelector('.ida-item')) adMorph(lb, h); else lb.innerHTML = h;
  s.querySelector('.ida-more').hidden = !IDA.more || !L.length;
}
function idaShow(id) {
  const s = $('#adideas'), main = s.querySelector('.ida-main'), it = id ? idaItem(id) : null;
  IDA.sel = it ? it.id : null;
  s.querySelector('.ida').classList.toggle('ida-in', !!it);
  s.querySelectorAll('.ida-item').forEach(b => b.classList.toggle('on', +b.dataset.id === IDA.sel));
  main.hidden = !it;
  if (!it) { main.innerHTML = ''; return; }
  const cx = it.ctx || {}, known = (AD.users || []).some(u => u.id === it.user_id), g = it.game && byId.get(it.game);
  main.innerHTML = `<div class="ida-h"><button class="back" type="button" data-ida="back">${FX_ICO.back}All ideas</button><div class="ida-ht"><b class="ida-title" translate="no">${esc(it.title)}</b><span class="ida-meta">${idKindPill(it.kind)}${known ? `<button type="button" class="al-u" data-alu="${esc(it.user_id)}" translate="no">${esc(idaWho(it))}</button>` : `<span translate="no">${esc(idaWho(it))}</span>`}<span title="${esc(adDate(it.created_at, 1))}">${esc(adDate(it.created_at, 1))}</span>${g ? `<span>${esc(auT('About {g}').replace('{g}', g.title))}</span>` : ''}</span></div><button class="btn2 danger ida-del" type="button" data-ida="del">Delete idea</button></div>
  <div class="ida-body" translate="no">${esc(it.body)}</div>
  ${fxAtts(it.attachments, 'ideas', { staff: true })}
  ${cx.ua ? `<p class="ida-ctx"><b>${esc(auT('Sent from'))}</b> <span translate="no">${esc(cx.ua)}${cx.w && cx.h ? ' · ' + (+cx.w) + '×' + (+cx.h) : ''}${cx.lang ? ' · ' + esc(adLangName(cx.lang)) : ''}</span></p>` : ''}
  <div class="ida-set"><span class="id-lb" id="idasl">Status</span><div class="ida-sts" role="radiogroup" aria-labelledby="idasl">${Object.keys(ID_ST).map(k => `<button type="button" role="radio" class="ida-st" data-ida="st" data-st="${k}" aria-checked="${it.status === k}">${ID_ST[k][0]}</button>`).join('')}</div></div>
  <div class="fld ida-rf"><label for="idare">Reply to the player</label><textarea id="idare" maxlength="2000" rows="3" placeholder="The player sees this reply under their idea.">${esc(it.reply || '')}</textarea><div class="ida-rb"><small class="ida-by">${it.reply && it.reply_at ? esc(auT('Replied {t}').replace('{t}', adAgo(it.reply_at)) + (it.reply_by ? ' · @' + it.reply_by : '')) : ''}</small><button class="btn2 pri" type="button" data-ida="reply" id="idarb">Save reply</button></div></div>
  <div class="note" id="idanote" role="status"></div>`;
  fxFill(main);
}
async function idaSet(id, patch, btn) {
  const it = idaItem(id);
  if (!it) return false;
  if (btn) { btn.disabled = true; btn.classList.add('is-busy'); }
  try {
    const r = await adRpc('admin_idea_update', Object.assign({ p_id: id }, patch));
    Object.assign(it, { status: r.status, reply: r.reply, reply_at: r.reply_at, reply_by: r.reply_by, updated_at: r.updated_at });
    idaList(true); idaCount();
    return true;
  } catch (e) { if (IDA.sel === id) idaNote(/not found/i.test(e.message || '') ? 'This idea was deleted.' : adErr(e), 'bad'); return false; }
  finally { if (btn) { btn.disabled = false; btn.classList.remove('is-busy'); } }
}
async function idaAct(k, b) {
  const s = $('#adideas'), id = IDA.sel;
  if (k === 'more') { b.disabled = true; await idaLoad(true, true); b.disabled = false; return; }
  if (k === 'back') { idaShow(null); return; }
  if (k === 'open') {
    const it = idaItem(+b.dataset.id);
    if (!it) return;
    idaShow(it.id);
    if (matchMedia('(max-width:900px)').matches) s.scrollIntoView({ block: 'start', behavior: motionOK() ? 'smooth' : 'auto' });
    if (it.status === 'new') { const ok = await idaSet(it.id, { p_status: 'seen' }); if (ok && IDA.sel === it.id) s.querySelectorAll('.ida-st').forEach(x => x.setAttribute('aria-checked', String(x.dataset.st === it.status))); }
    return;
  }
  if (!id) return;
  if (k === 'st') {
    if (b.getAttribute('aria-checked') === 'true') return;
    idaNote('');
    const ok = await idaSet(id, { p_status: b.dataset.st }, b);
    if (IDA.sel !== id) return;
    const it = idaItem(id);
    s.querySelectorAll('.ida-st').forEach(x => x.setAttribute('aria-checked', String(!!it && x.dataset.st === it.status)));
    if (ok) { idaNote('Status saved. The player can see it under My ideas.', 'ok'); track('idea', { act: 'status', st: b.dataset.st }); }
    return;
  }
  if (k === 'reply') {
    const ta = $('#idare'), it = idaItem(id);
    if (!ta || !it) return;
    if (ta.value.trim() === (it.reply || '')) { idaNote(ta.value.trim() ? 'This reply is already saved.' : 'Write a reply first.', 'bad'); auShake(ta); return; }
    idaNote('');
    const ok = await idaSet(id, { p_reply: ta.value }, b);
    if (IDA.sel !== id || !ok) return;
    ta.value = it.reply || '';
    s.querySelector('.ida-by').textContent = it.reply && it.reply_at ? auT('Replied {t}').replace('{t}', adAgo(it.reply_at)) + (it.reply_by ? ' · @' + it.reply_by : '') : '';
    idaNote(it.reply ? 'Reply saved. The player sees it under My ideas.' : 'Reply removed.', 'ok');
    track('idea', { act: 'reply' });
    return;
  }
  if (k === 'del') {
    if (!adConfirm(b)) return;
    b.disabled = true; b.classList.add('is-busy');
    try {
      await adRpc('admin_idea_delete', { p_id: id });
      IDA.list = (IDA.list || []).filter(x => x.id !== id);
      idaShow(null); idaList(true); idaCount();
      toast(auT('Idea deleted'));
    } catch (e) { b.disabled = false; b.classList.remove('is-busy'); idaNote(adErr(e), 'bad'); }
  }
}
async function idaPurge() {
  IDA.purged = Date.now();
  if (!adIsAdmin()) return;
  try { await adRpc('admin_files_cleanup'); } catch (e) {}
}
