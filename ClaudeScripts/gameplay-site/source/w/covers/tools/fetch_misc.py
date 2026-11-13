import urllib.request, os, time, json, sys
UA = {'User-Agent': 'Mozilla/5.0'}
O = os.path.dirname(os.path.abspath(__file__)) + '/official/'


def get(u, path):
    for a in range(5):
        try:
            r = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60)
            data = r.read()
            if r.status == 200 and len(data) > 1000:
                os.makedirs(os.path.dirname(path), exist_ok=True)
                open(path, 'wb').write(data)
                return True
            return False
        except urllib.error.HTTPError as e:
            if e.code in (403, 404):
                return False
            time.sleep(5)
        except Exception:
            time.sleep(5)
    return False


src = {}
steam = {'rocket-soccer': 252950, 'dash-cube': 322170, 'garden-defense': 3590, 'bean-royale': 1097150, 'cookie-baker': 1454400, 'gem-swap': 78000}
for k, app in steam.items():
    for f in ['library_hero.jpg', 'logo.png', 'header.jpg', 'capsule_616x353.jpg']:
        u = 'https://cdn.cloudflare.steamstatic.com/steam/apps/%d/%s' % (app, f)
        ok = get(u, O + k + '/' + f)
        print(k, f, ok)
        if ok:
            src.setdefault(k, {})[f] = u
    src.setdefault(k, {})['page'] = 'https://store.steampowered.com/app/%d/' % app
web = {
    'hoop-flop': 'https://imgs.crazygames.com/basket-random_16x9/20240617090207/basket-random_16x9-cover?metadata=none&quality=100&width=1200&height=675&fit=crop',
    'moto-stunts': 'https://imgs.crazygames.com/games/moto-x3m/cover_16x9-1700625476572.png?metadata=none&quality=100&width=1200&height=675&fit=crop',
    'block-roll': 'https://imgs.crazygames.com/games/bloxorz/cover-1669373098527.png?metadata=none&quality=100&width=1200&height=675&fit=crop',
    'tunnel-run': 'https://img.poki-cdn.com/cdn-cgi/image/q=78,scq=50,width=1200,height=1200,fit=cover,f=png/2094926076b7aa8264cace220ce5decc/tunnel-rush-logo.png',
    'slope-3d': 'https://cdn2.y8.com/cloudimage/384903/file/w380h285_retina_webp-2439f025ff9dbe192e31d23509c21375.webp',
}
pages = {'hoop-flop': 'https://www.crazygames.com/game/basket-random', 'moto-stunts': 'https://www.crazygames.com/game/moto-x3m', 'block-roll': 'https://www.crazygames.com/game/bloxorz', 'tunnel-run': 'https://poki.com/en/g/tunnel-rush', 'slope-3d': 'https://www.y8.com/games/slope'}
for k, u in web.items():
    ok = get(u, O + k + '/web.img')
    print(k, ok)
    if ok:
        src[k] = {'web.img': u, 'page': pages[k]}
json.dump(src, open(O + 'misc.json', 'w'), indent=1)
