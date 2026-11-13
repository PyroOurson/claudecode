import json, urllib.request, time, os, sys
UA = {'User-Agent': 'Mozilla/5.0'}
O = os.path.dirname(os.path.abspath(__file__)) + '/official/'
M = {
    'blockcraft-3d': 479516143, 'sky-runner': 512939461, 'road-hopper': 924373886, 'slither': 1091944550, 'paper-land': 1423046460,
    'cell-feast': 995999703, 'hole-city': 1389111413, 'maze-tanks': 951971414, 'last-card': 1344700142, 'highway-3d': 547101139,
    'tetra': 1491074310, '2048': 840919914, 'pool': 543186831, 'helix-3d': 1345968745, 'fruit-slice': 403858572, 'bubble-pop': 604044220,
    'piano-tiles': 1027688889, 'knife-throw': 1336527043, 'stack': 1080487957, 'solitaire': 1103438575, 'chess': 329218549,
    'sudoku': 1193508329, 'sea-battle': 1336026283, 'invaders': 305608072, 'reversi': 466399294, 'snake': 438052745,
}
ids = sys.argv[1:] or [k for k in M if not os.path.exists(O + k + '/icon.png')]
out = {}
for k in ids:
    u = 'https://itunes.apple.com/lookup?id=%d&country=us' % M[k]
    for a in range(5):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA)))
            break
        except Exception:
            time.sleep(10)
    r = d['results'][0]
    art = r['artworkUrl512'].rsplit('/', 1)[0] + '/1024x1024bb.png'
    os.makedirs(O + k, exist_ok=True)
    data = None
    for a in range(6):
        try:
            data = urllib.request.urlopen(urllib.request.Request(art, headers=UA), timeout=60).read()
            break
        except Exception:
            time.sleep(6)
    if data is None:
        print(k, 'IMGFAIL')
        continue
    open(O + k + '/icon.png', 'wb').write(data)
    out[k] = {'name': r['trackName'], 'artist': r['artistName'], 'page': r['trackViewUrl'].split('?')[0], 'img': art, 'shots': r.get('ipadScreenshotUrls', [])[:2] + r.get('screenshotUrls', [])[:2]}
    print(k, r['trackName'], '|', r['artistName'])
    time.sleep(3)
old = json.load(open(O + 'itunes.json')) if os.path.exists(O + 'itunes.json') else {}
old.update(out)
json.dump(old, open(O + 'itunes.json', 'w'), indent=1)
