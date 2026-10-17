import urllib.request, os, time, json
UA = {'User-Agent': 'Mozilla/5.0 (compatible; covers-script/1.0)'}
O = os.path.dirname(os.path.abspath(__file__)) + '/official/'
F = {
    'flap-bird': ('en', 'Flappy_Bird_icon.png'), 'brick-bros': ('en', 'Super_Mario_Bros._box.png'), 'maze-muncher': ('en', 'Pac_flyer.png'),
    'breakout': ('en', 'BreakOut_arcadeflyer.png'), 'pipe-connect': ('en', 'Pipe_mania_cover_art.jpg'), 'connect-four': ('commons', 'Connect-four.jpg'),
    'cube-3d': ('commons', "Rubiks_cube_solved.jpg"),
}
src = {}
for k, (site, f) in F.items():
    host = 'en.wikipedia.org' if site == 'en' else 'commons.wikimedia.org'
    u = 'https://%s/wiki/Special:FilePath/%s?width=1400' % (host, urllib.request.quote(f))
    ok = False
    for a in range(4):
        try:
            r = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60)
            data = r.read()
            os.makedirs(O + k, exist_ok=True)
            open(O + k + '/wiki.img', 'wb').write(data)
            src[k] = {'img': r.geturl(), 'page': 'https://%s/wiki/File:%s' % (host, f)}
            ok = True
            break
        except Exception as e:
            err = e
            time.sleep(8)
    print(k, ok, '' if ok else err)
    time.sleep(2)
json.dump(src, open(O + 'wiki.json', 'w'), indent=1)
