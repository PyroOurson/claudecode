import json, sys, urllib.request, urllib.parse, time
UA = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) covers-script'}


def q(params):
    params.update({'format': 'json'})
    u = 'https://en.wikipedia.org/w/api.php?' + urllib.parse.urlencode(params)
    for a in range(5):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA)))
        except Exception as e:
            time.sleep(10)
    raise SystemExit('fail')


titles = sys.argv[1:]
d = q({'action': 'query', 'titles': '|'.join(titles), 'prop': 'pageprops', 'redirects': 1})
files = {}
red = {r['from']: r['to'] for r in d['query'].get('redirects', [])}
norm = {r['from']: r['to'] for r in d['query'].get('normalized', [])}
for p in d['query']['pages'].values():
    files[p['title']] = p.get('pageprops', {}).get('page_image')
fl = ['File:' + f for f in files.values() if f]
time.sleep(1)
d2 = q({'action': 'query', 'titles': '|'.join(fl), 'prop': 'imageinfo', 'iiprop': 'url|size'})
info = {}
for p in d2['query']['pages'].values():
    ii = p.get('imageinfo', [{}])[0]
    info[p['title']] = (ii.get('width'), ii.get('height'), ii.get('url'), ii.get('descriptionurl'))
n2 = {r['to']: r['from'] for r in d2['query'].get('normalized', [])}
for t in titles:
    tt = red.get(norm.get(t, t), norm.get(t, t))
    f = files.get(tt)
    key = None
    if f:
        for k in info:
            if k.replace(' ', '_').lower() == ('File:' + f).replace(' ', '_').lower():
                key = k
    print(t, '|', info.get(key) if key else None)
