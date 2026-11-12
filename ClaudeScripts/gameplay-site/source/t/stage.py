import json
import os
import re
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
W = os.path.join(os.path.dirname(HERE), 'w')
PARTS = os.path.join(W, 'parts')
STAGE = os.path.join(W, 'parts_stage')
OUT = os.path.join(W, 'site_stage')
SECRET = os.environ.get('STAGE_GATE_PASS', 'stage-build-secret')
SITE_PASS = os.environ.get('STAGE_SITE_PASS', 'stagepass1')


def conf():
    f = os.environ.get('STAGE_JSON', '')
    o = json.load(open(f)) if f and os.path.exists(f) else {}
    url = os.environ.get('STAGE_SB_URL') or o.get('API_URL') or 'http://127.0.0.1:54321'
    key = os.environ.get('STAGE_SB_KEY') or o.get('PUBLISHABLE_KEY') or o.get('ANON_KEY')
    db = os.environ.get('STAGE_DB_URL') or o.get('DB_URL') or 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
    if not key:
        sys.exit('stage: set STAGE_JSON to the output of "supabase status -o json", or STAGE_SB_KEY')
    return url.rstrip('/'), key, db


def psql(db, sql):
    r = subprocess.run(['psql', db, '-v', 'ON_ERROR_STOP=1', '-Atqc', sql], stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True)
    if r.returncode != 0:
        sys.exit('stage: psql failed: ' + r.stderr.strip()[:400])
    return r.stdout.strip()


def gate(db, mode):
    env = dict(os.environ, GATE_PASS=SECRET, NEW_SITE_PASS=SITE_PASS)
    r = subprocess.run(['node', os.path.join(W, 'gate_slot.js')], env=env, stdout=subprocess.PIPE, universal_newlines=True)
    if r.returncode != 0:
        sys.exit('stage: gate_slot.js failed')
    if not psql(db, 'select count(*) from public.site_gate where id = 1') == '1' or os.environ.get('STAGE_RESEED') == '1':
        psql(db, r.stdout)
    key = subprocess.run(['node', '-e', "const c=require('crypto');process.stdout.write(c.pbkdf2Sync(Buffer.from(process.argv[1],'utf8'),Buffer.from('gameplay-gate-v1'),310000,32,'sha256').toString('base64'))", SECRET], stdout=subprocess.PIPE, universal_newlines=True).stdout
    if mode == 'open':
        psql(db, "update public.site_gate set open_key = '%s' where id = 1" % key)
    elif mode == 'locked':
        psql(db, 'update public.site_gate set open_key = null where id = 1')
    return psql(db, 'select public.get_gate_slot()')


def parts(url, key):
    r = subprocess.run([sys.executable, os.path.join(W, 'assemble.py')])
    if r.returncode != 0:
        sys.exit('stage: assemble.py failed')
    if os.path.isdir(STAGE):
        shutil.rmtree(STAGE)
    os.makedirs(STAGE)
    for f in os.listdir(PARTS):
        if f != '001_portal.js':
            os.symlink(os.path.join(PARTS, f), os.path.join(STAGE, f))
    s = open(os.path.join(PARTS, '001_portal.js'), encoding='utf-8', newline='').read()
    for pat, rep in [(r"const SUPABASE_DIRECT = '[^']*';", "const SUPABASE_DIRECT = '%s';" % url), (r"const SUPABASE_RELAYS = \[[^\]]*\];", 'const SUPABASE_RELAYS = %s;' % os.environ.get('STAGE_RELAYS', '[]')), (r"const SUPABASE_ANON_KEY = '[^']*';", "const SUPABASE_ANON_KEY = '%s';" % key)]:
        s, n = re.subn(pat, lambda m: rep, s, count=1)
        if n != 1:
            sys.exit('stage: could not patch ' + pat)
    open(os.path.join(STAGE, '001_portal.js'), 'w', encoding='utf-8', newline='').write(s)


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else 'keep'
    if mode not in ('open', 'locked', 'keep'):
        sys.exit('usage: stage.py [open|locked|keep]')
    url, key, db = conf()
    slot = gate(db, mode)
    parts(url, key)
    env = dict(os.environ, GATE_PASS=SECRET, GATE_SLOT=slot, GP_SB_URL=url, GP_SB_KEY=key, GP_SB_RELAYS=os.environ.get('STAGE_RELAYS', '[]'))
    env.pop('GATE_KEY', None)
    r = subprocess.run([sys.executable, os.path.join(W, 'build2.py'), STAGE, OUT], env=env)
    if r.returncode != 0:
        sys.exit('stage: build2.py failed')
    print('stage: built %s against %s (site password "%s", gate %s)' % (OUT, url, SITE_PASS, 'open' if '"o"' in slot else 'locked'))


if __name__ == '__main__':
    main()
