import json, sys, urllib.request, urllib.parse, time
for term in sys.argv[1:]:
    u = 'https://itunes.apple.com/search?' + urllib.parse.urlencode({'term': term, 'entity': 'software', 'limit': 3, 'country': 'us'})
    for att in range(4):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})))
            break
        except Exception as e:
            time.sleep(8)
    else:
        print(term, 'FAIL')
        continue
    for r in d['results']:
        print(term, '|', r['trackName'], '|', r['artistName'], '|', r.get('userRatingCount'), '|', r['trackId'])
    time.sleep(3)
