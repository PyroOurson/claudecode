import json
import os
import re
import subprocess
import sys
import time
import urllib.request

REPO = "PyroOurson/claudecode"
DEFAULT_REF = "claude/upbeat-bell-n1e54q"
PROJECT = "claudecode-7e172"
SITE = "gameplaygames"
FOLDER = os.path.join(os.path.expanduser("~"), "gameplay-site")

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
            }
        ],
    }
}


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
    url = "https://raw.githubusercontent.com/%s/%s/index.html?t=%d" % (REPO, ref, int(time.time()))
    os.makedirs(FOLDER, exist_ok=True)
    print("Downloading index.html from " + ref)
    with urllib.request.urlopen(url, timeout=120) as response:
        page = response.read()
    private = b"gameplay:gate" in page
    if len(page) < 1000000 or (b"Ameplay" not in page and not private):
        print("The download does not look like the gameplay site (%d bytes). Check the branch name." % len(page))
        sys.exit(1)
    with open(os.path.join(FOLDER, "index.html"), "wb") as handle:
        handle.write(page)
    with open(os.path.join(FOLDER, "firebase.json"), "w") as handle:
        json.dump(CONFIG, handle, indent=2)
    count = len(re.findall(rb"Ameplay\.register\(", page))
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
    deployed = run(["firebase", "deploy", "--only", "hosting", "--project", PROJECT])
    print(deployed.stdout)
    if deployed.returncode != 0:
        print("Deploy failed. If it asked you to log in, run: firebase login --no-localhost  and then run this command again.")
        sys.exit(deployed.returncode)
    print("Live at https://%s.web.app" % SITE)


if __name__ == "__main__":
    main()
