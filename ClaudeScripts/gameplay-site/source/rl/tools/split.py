import sys, os, json, re
src, out = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8', newline='').read()
parts = re.split(r'^//@@SEG (\S+) (\S+)\n', s, flags=re.M)
assert parts[0] == ''
os.makedirs(out, exist_ok=True)
own = []
for i in range(1, len(parts), 3):
    name, who, body = parts[i], parts[i + 1], parts[i + 2]
    open(os.path.join(out, name + '.js'), 'w', encoding='utf-8', newline='').write(body)
    own.append([name, who])
json.dump(own, open(os.path.join(out, '_owners.json'), 'w'), indent=1)
print(len(own), 'segments')
