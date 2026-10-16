import concurrent.futures
import hashlib
import json
import os
import re
import ssl
import subprocess
import sys
import time
import urllib.error
import urllib.request

REPO = "PyroOurson/claudecode"
DEFAULT_REF = "claude/upbeat-bell-n1e54q"
PROJECT = "claudecode-7e172"
SITE = "gameplaygames"
FOLDER = os.path.join(os.path.expanduser("~"), "gameplay-site")
ASSETS = "gameplay"
MANIFEST = ASSETS + "/manifest.txt"

CONFIG = {
    "hosting": {
        "site": SITE,
        "public": ".",
        "ignore": ["firebase.json"],
        "rewrites": [{"source": "**", "destination": "/index.html"}],
        "headers": [
            {
                "source": "**",
                "headers": [{"key": "Cache-Control", "value": "no-cache"}],
            },
            {
                "source": ASSETS + "/*.bin",
                "headers": [{"key": "Cache-Control", "value": "public, max-age=31536000, immutable"}],
            },
        ],
    }
}


def context():
    try:
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        return ssl.create_default_context()


CTX = context()


def fetch(url, timeout=120):
    request = urllib.request.Request(url, headers={"User-Agent": "gameplay-deploy", "Cache-Control": "no-cache"})
    with urllib.request.urlopen(request, timeout=timeout, context=CTX) as response:
        return response.read()


def resolve(ref):
    try:
        data = json.loads(fetch("https://api.github.com/repos/%s/commits/%s" % (REPO, ref), 30).decode("utf-8"))
        return data["sha"]
    except Exception as error:
        print("Could not resolve %s to a commit (%s), using the branch name" % (ref, error))
        return None


def raw_url(rev, path, bust):
    url = "https://raw.githubusercontent.com/%s/%s/%s" % (REPO, rev, path)
    return url + ("?t=%d" % int(time.time()) if bust else "")


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def download_asset(rev, bust, entry):
    path, size, digest = entry
    target = os.path.join(FOLDER, path)
    if os.path.exists(target):
        with open(target, "rb") as handle:
            if sha256(handle.read()) == digest:
                return path, False
    last = None
    for attempt in range(4):
        try:
            data = fetch(raw_url(rev, path, bust))
            if len(data) != size or sha256(data) != digest:
                raise ValueError("checksum mismatch")
            os.makedirs(os.path.dirname(target), exist_ok=True)
            with open(target + ".part", "wb") as handle:
                handle.write(data)
            os.replace(target + ".part", target)
            return path, True
        except Exception as error:
            last = error
            time.sleep(1 + attempt * 2)
    raise RuntimeError("%s: %s" % (path, last))


def sync_assets(rev, bust):
    try:
        text = fetch(raw_url(rev, MANIFEST, True)).decode("utf-8")
    except urllib.error.HTTPError as error:
        if error.code == 404:
            return None
        raise
    entries = []
    for line in text.splitlines():
        parts = line.split()
        if len(parts) == 3 and parts[0].startswith(ASSETS + "/") and ".." not in parts[0]:
            entries.append((parts[0], int(parts[1]), parts[2]))
    if not entries:
        print("The asset list is empty.")
        sys.exit(1)
    fresh = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        for path, new in pool.map(lambda e: download_asset(rev, bust, e), entries):
            fresh += 1 if new else 0
    keep = {os.path.normpath(os.path.join(FOLDER, e[0])) for e in entries} | {os.path.normpath(os.path.join(FOLDER, MANIFEST))}
    folder = os.path.join(FOLDER, ASSETS)
    removed = 0
    for name in os.listdir(folder):
        full = os.path.normpath(os.path.join(folder, name))
        if full not in keep and os.path.isfile(full):
            os.remove(full)
            removed += 1
    with open(os.path.join(FOLDER, MANIFEST), "w") as handle:
        handle.write(text)
    total = sum(e[1] for e in entries)
    print("Game files: %d (%.1f MB), %d downloaded, %d already up to date, %d old files removed" % (len(entries), total / 1e6, fresh, len(entries) - fresh, removed))
    return entries


def write_search_files(page, private):
    ids = [] if private else re.findall(rb'^\s*\["([a-z0-9-]+)", "', page, re.M)
    base = "https://%s.web.app/" % SITE
    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', "  <url><loc>%s</loc></url>" % base]
    for game in ids:
        lines.append("  <url><loc>%s%s</loc></url>" % (base, game.decode()))
    lines.append("</urlset>")
    with open(os.path.join(FOLDER, "sitemap.xml"), "w") as handle:
        handle.write("\n".join(lines) + "\n")
    with open(os.path.join(FOLDER, "robots.txt"), "w") as handle:
        if private:
            handle.write("User-agent: *\nDisallow: /\n")
        else:
            handle.write("User-agent: *\nAllow: /\nSitemap: %ssitemap.xml\n" % base)
    return len(ids)


def run(args):
    print("$ " + " ".join(args))
    return subprocess.run(args, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, universal_newlines=True)


def main():
    ref = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_REF
    sha = resolve(ref)
    rev = sha or ref
    bust = sha is None
    os.makedirs(FOLDER, exist_ok=True)
    print("Downloading index.html from " + ref + (" (" + sha[:10] + ")" if sha else ""))
    page = fetch(raw_url(rev, "index.html", True))
    private = b"gameplay:gate" in page
    if len(page) < 20000 or (b"Ameplay" not in page and not private):
        print("The download does not look like the gameplay site (%d bytes). Check the branch name." % len(page))
        sys.exit(1)
    try:
        entries = sync_assets(rev, bust)
    except Exception as error:
        print("Could not download the game files: %s" % error)
        sys.exit(1)
    if entries is None:
        stale = os.path.join(FOLDER, ASSETS)
        if os.path.isdir(stale):
            for name in os.listdir(stale):
                os.remove(os.path.join(stale, name))
            os.rmdir(stale)
        print("No game file list found: this is a single-file version of the site.")
    with open(os.path.join(FOLDER, "index.html"), "wb") as handle:
        handle.write(page)
    with open(os.path.join(FOLDER, "firebase.json"), "w") as handle:
        json.dump(CONFIG, handle, indent=2)
    lazy = b"Ameplay.lazy(" in page
    count = len(re.findall(rb'"lazy":"', page)) if lazy else len(re.findall(rb"Ameplay\.register\(", page))
    listed = write_search_files(page, private)
    stated = re.search(rb"<title>[^<]*?(\d+) free browser games", page)
    if private:
        print("The site is password protected; search engines are told not to index it.")
    elif stated and int(stated.group(1)) != count:
        print("Note: the page says %s games but %d are registered. Update the title, description and noscript list." % (stated.group(1).decode(), count))
    if not private:
        print("Downloaded %.1f MB, %d games, %d in the sitemap" % (len(page) / 1e6, count, listed))
    os.chdir(FOLDER)
    made = run(["firebase", "hosting:sites:create", SITE, "--project", PROJECT])
    if made.returncode != 0 and "already exists" not in made.stdout.lower():
        print(made.stdout.strip().splitlines()[-1] if made.stdout.strip() else "Could not create the site")
    for attempt in range(1, 5):
        deployed = run(["firebase", "deploy", "--only", "hosting", "--project", PROJECT])
        print(deployed.stdout)
        if deployed.returncode == 0 or "login" in deployed.stdout.lower() or attempt == 4:
            break
        print("Upload interrupted, retrying (%d of 3) in %d seconds..." % (attempt, 10 * attempt))
        time.sleep(10 * attempt)
    if deployed.returncode != 0:
        print("Deploy failed. If it asked you to log in, run: firebase login --no-localhost  and then run this command again.")
        sys.exit(deployed.returncode)
    print("Live at https://%s.web.app" % SITE)


if __name__ == "__main__":
    main()
