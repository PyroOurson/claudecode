import json
import os
import re
import sys
import urllib.error
import urllib.request

API = os.environ.get('SUPABASE_API_BASE', 'https://api.supabase.com').rstrip('/') + '/v1/projects/'
HERE = os.path.dirname(os.path.abspath(__file__))
SITE_URL = 'https://gameplaygames.web.app'
ALLOW = [
    'https://gameplaygames.web.app/**',
    'https://gameplaygames.firebaseapp.com/**',
    'https://pyroourson.github.io/claudecode/**',
]


def fail(msg):
    print('ERROR: ' + msg)
    sys.exit(1)


def call(token, method, path, body=None):
    data = None if body is None else json.dumps(body).encode('utf-8')
    req = urllib.request.Request(API + path, data=data, method=method, headers={
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'gameplay-setup/1.0',
    })
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            raw = r.read().decode('utf-8')
            return r.status, json.loads(raw) if raw.strip() else None
    except urllib.error.HTTPError as e:
        raw = e.read().decode('utf-8', 'replace')
        try:
            msg = json.loads(raw)
            msg = msg.get('message') or msg.get('error') or raw
        except ValueError:
            msg = raw
        return e.code, str(msg)[:2000]
    except urllib.error.URLError as e:
        fail('cannot reach api.supabase.com: %s' % e.reason)


def sql(token, ref, query, label):
    code, out = call(token, 'POST', ref + '/database/query', {'query': query})
    if code >= 300:
        fail('%s failed (HTTP %d): %s' % (label, code, out))
    return out


def run_schema(token, ref):
    path = os.path.join(HERE, 'schema.sql')
    with open(path, encoding='utf-8') as f:
        text = f.read()
    print('Running schema.sql (%d KB)...' % (len(text) // 1024))
    sql(token, ref, text, 'schema.sql')
    sql(token, ref, "notify pgrst, 'reload schema';", 'schema reload')
    rows = sql(token, ref, "select c.relname as name, c.relrowsecurity as rls from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r' order by 1;", 'table check') or []
    for r in rows:
        print('  table %-28s row level security: %s' % (r.get('name'), 'on' if r.get('rls') else 'OFF'))
    off = [r.get('name') for r in rows if not r.get('rls')]
    if off:
        fail('row level security is off for: ' + ', '.join(off))
    print('Database ready.')


def configure_auth(token, ref):
    body = {
        'site_url': SITE_URL,
        'uri_allow_list': ','.join(ALLOW),
        'external_email_enabled': True,
        'mailer_autoconfirm': os.environ.get('AUTOCONFIRM', '').strip() == '1',
        'mailer_secure_email_change_enabled': True,
        'password_min_length': 8,
        'security_update_password_require_reauthentication': False,
        'disable_signup': False,
    }
    gid = os.environ.get('GOOGLE_CLIENT_ID', '').strip()
    gsec = os.environ.get('GOOGLE_CLIENT_SECRET', '').strip()
    if gid and gsec:
        body.update({'external_google_enabled': True, 'external_google_client_id': gid, 'external_google_secret': gsec})
    elif gid or gsec:
        fail('set both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, or neither')
    smtp = {k: os.environ.get(e, '').strip() for k, e in [('smtp_host', 'SMTP_HOST'), ('smtp_port', 'SMTP_PORT'), ('smtp_user', 'SMTP_USER'), ('smtp_pass', 'SMTP_PASS'), ('smtp_admin_email', 'SMTP_SENDER'), ('smtp_sender_name', 'SMTP_NAME')]}
    if smtp['smtp_host']:
        missing = [k for k in ('smtp_port', 'smtp_user', 'smtp_pass', 'smtp_admin_email') if not smtp[k]]
        if missing:
            fail('custom email needs SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and SMTP_SENDER')
        smtp['smtp_sender_name'] = smtp['smtp_sender_name'] or 'gameplay'
        body.update(smtp)
        body['rate_limit_email_sent'] = int(os.environ.get('EMAIL_PER_HOUR', '30') or '30')
    print('Configuring Auth...')
    code, out = call(token, 'PATCH', ref + '/config/auth', body)
    if code >= 300:
        fail('auth config failed (HTTP %d): %s' % (code, out))
    print('  site URL: ' + str(out.get('site_url')))
    print('  redirect URLs: ' + str(out.get('uri_allow_list')))
    print('  email sign-in: %s, minimum password length: %s' % (out.get('external_email_enabled'), out.get('password_min_length')))
    print('  Google sign-in: %s' % ('on' if out.get('external_google_enabled') else 'off (no Google client given)'))
    print('  email confirmation: %s' % ('off (AUTOCONFIRM=1)' if out.get('mailer_autoconfirm') else 'on'))
    print('  custom email sender: %s' % (out.get('smtp_host') or 'none (built-in sender: team members only, about 2 emails per hour)'))


def show_keys(token, ref):
    code, out = call(token, 'GET', ref + '/api-keys')
    if code >= 300:
        fail('reading API keys failed (HTTP %d): %s' % (code, out))
    pub = [k for k in out if k.get('type') == 'publishable' and k.get('api_key')]
    anon = [k for k in out if k.get('type') == 'legacy' and k.get('name') == 'anon' and k.get('api_key')]
    key = (pub or anon or [{}])[0].get('api_key')
    print('')
    print('SUPABASE_URL = https://%s.supabase.co' % ref)
    print('SUPABASE_ANON_KEY = %s' % (key or '(not found, copy the publishable key from Project Settings > API Keys)'))
    print('Google redirect URI to paste in Google Cloud: https://%s.supabase.co/auth/v1/callback' % ref)
    return key


def write_consts(path, ref, key):
    with open(path, encoding='utf-8') as f:
        text = f.read()
    url = 'https://%s.supabase.co' % ref
    new = re.sub(r"const SUPABASE_URL = '[^']*';", "const SUPABASE_URL = '%s';" % url, text)
    new = re.sub(r"const SUPABASE_ANON_KEY = '[^']*';", "const SUPABASE_ANON_KEY = '%s';" % key, new)
    if new == text and url not in text:
        fail('could not find SUPABASE_URL and SUPABASE_ANON_KEY in ' + path)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new)
    print('Wrote the URL and key into ' + path)


def main():
    args = sys.argv[1:]
    if '-h' in args or '--help' in args:
        print('usage: SUPABASE_ACCESS_TOKEN=... SUPABASE_PROJECT_REF=... [GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=...] [AUTOCONFIRM=1] [SMTP_HOST=... SMTP_PORT=... SMTP_USER=... SMTP_PASS=... SMTP_SENDER=... SMTP_NAME=... EMAIL_PER_HOUR=30] python3 setup.py [--skip-sql] [--skip-auth] [--consts path/to/consts.js]')
        return
    token = os.environ.get('SUPABASE_ACCESS_TOKEN', '').strip()
    ref = os.environ.get('SUPABASE_PROJECT_REF', '').strip()
    m = re.match(r'^https://([a-z]{20})\.supabase\.co/?$', ref)
    if m:
        ref = m.group(1)
    if not token:
        fail('SUPABASE_ACCESS_TOKEN is not set (Account > Access Tokens in the Supabase dashboard)')
    if not re.match(r'^[a-z]{20}$', ref):
        fail('SUPABASE_PROJECT_REF must be the 20 letter project id (from the project URL)')
    code, proj = call(token, 'GET', ref)
    if code >= 300:
        fail('cannot open project %s (HTTP %d): %s' % (ref, code, proj))
    print('Project: %s (%s, %s)' % (proj.get('name'), proj.get('region'), proj.get('status')))
    if '--skip-sql' not in args:
        run_schema(token, ref)
    if '--skip-auth' not in args:
        configure_auth(token, ref)
    key = show_keys(token, ref)
    if '--consts' in args:
        i = args.index('--consts')
        if i + 1 >= len(args):
            fail('--consts needs a file path')
        if not key:
            fail('no key to write')
        write_consts(args[i + 1], ref, key)
    print('')
    print('Done. You can now revoke the access token in Account > Access Tokens.')


if __name__ == '__main__':
    main()
