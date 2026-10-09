import os
import ssl
import sys
import time
import urllib.parse
import urllib.request

BASE = "https://raw.githubusercontent.com/PyroOurson/claudecode/claude/peaceful-thompson-u1uxhi/"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = "files.txt"


def context():
    try:
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        return ssl.create_default_context()


def download(path):
    url = BASE + urllib.parse.quote(path) + "?nocache=" + str(int(time.time()))
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Cache-Control": "no-cache"})
    with urllib.request.urlopen(request, timeout=30, context=context()) as response:
        return response.read()


def read_local_manifest():
    try:
        with open(os.path.join(ROOT, MANIFEST), encoding="utf-8") as f:
            return {line.strip() for line in f if line.strip()}
    except OSError:
        return set()


def main():
    print(f"Updating {ROOT}")
    try:
        manifest = download(MANIFEST)
    except Exception as error:
        print(f"Could not reach GitHub ({error}). Nothing was changed.")
        sys.exit(1)
    wanted = [line.strip() for line in manifest.decode("utf-8").splitlines() if line.strip()]
    contents = {}
    for path in wanted:
        try:
            contents[path] = download(path)
        except Exception as error:
            print(f"Could not download {path} ({error}). Nothing was changed.")
            sys.exit(1)
    old = read_local_manifest()
    changed = 0
    for path, data in contents.items():
        target = os.path.join(ROOT, path)
        try:
            with open(target, "rb") as f:
                if f.read() == data:
                    continue
        except OSError:
            pass
        os.makedirs(os.path.dirname(target) or ROOT, exist_ok=True)
        with open(target, "wb") as f:
            f.write(data)
        print(f"  updated  {path}")
        changed += 1
    for path in sorted(old - set(wanted)):
        target = os.path.join(ROOT, path)
        if os.path.isfile(target):
            os.remove(target)
            print(f"  removed  {path}")
            changed += 1
            folder = os.path.dirname(target)
            while folder != ROOT and os.path.isdir(folder) and not os.listdir(folder):
                os.rmdir(folder)
                folder = os.path.dirname(folder)
    with open(os.path.join(ROOT, MANIFEST), "wb") as f:
        f.write(manifest)
    print("Already up to date." if changed == 0 else f"Done, {changed} file(s) changed.")


if __name__ == "__main__":
    main()
