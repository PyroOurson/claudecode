const crypto = require('crypto');
const pass = (process.env.GATE_PASS || '').trim(), site = process.env.NEW_SITE_PASS || '';
if (!pass || !site) { console.error('gate_slot: set GATE_PASS (the build secret) and NEW_SITE_PASS (the password people type)'); process.exit(1); }
if (site.length < 6) { console.error('gate_slot: NEW_SITE_PASS must be at least 6 characters'); process.exit(1); }
const k = crypto.pbkdf2Sync(Buffer.from(pass, 'utf8'), Buffer.from('gameplay-gate-v1'), 310000, 32, 'sha256');
const s = crypto.randomBytes(16), i = crypto.randomBytes(12), n = 310000;
const kek = crypto.pbkdf2Sync(Buffer.from(site, 'utf8'), s, n, 32, 'sha256');
const c = crypto.createCipheriv('aes-256-gcm', kek, i);
const ct = Buffer.concat([c.update(k), c.final(), c.getAuthTag()]);
const d = crypto.createDecipheriv('aes-256-gcm', kek, i);
d.setAuthTag(ct.subarray(32));
if (!Buffer.concat([d.update(ct.subarray(0, 32)), d.final()]).equals(k)) { console.error('gate_slot: self check failed'); process.exit(1); }
const slot = JSON.stringify({ v: 1, s: s.toString('base64'), n, i: i.toString('base64'), c: ct.toString('base64') });
console.log("insert into public.site_gate (id, slot, updated_at, updated_by) values (1, '" + slot + "'::jsonb, now(), null) on conflict (id) do update set slot = excluded.slot, updated_at = excluded.updated_at, updated_by = excluded.updated_by;");
