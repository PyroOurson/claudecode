import os
import platform
import shutil
import ssl
import subprocess
import sys
import time
import urllib.error
import urllib.request

DOMAIN = os.environ.get("GAMEPLAY_DOMAIN", "gameplaygames.vitalang.net")
SUPABASE = os.environ.get("GAMEPLAY_SUPABASE", "uafouyvtcijptspjbsqf.supabase.co")
ANON_KEY = os.environ.get("GAMEPLAY_ANON_KEY", "sb_publishable_Lry5e9J350lXelAUPHU1rg_3YYvTuAf")
SITES = ["https://gameplaygames.web.app", "https://gameplaygames.firebaseapp.com", "https://pyroourson.github.io"]
CADDY_DIR = "/etc/caddy"
MAIN = os.path.join(CADDY_DIR, "Caddyfile")
SITE_FILE = os.path.join(CADDY_DIR, "gameplay.caddy")
IMPORT = "import " + SITE_FILE

SITE = """{domain} {{
	@supabase path /rest/v1/* /auth/v1/* /realtime/v1/* /storage/v1/* /functions/v1/* /graphql/v1/*
	handle @supabase {{
		reverse_proxy https://{supabase} {{
			header_up Host {supabase}
			header_up -X-Forwarded-Host
			transport http {{
				tls_server_name {supabase}
				dial_timeout 10s
			}}
		}}
	}}
	handle /health {{
		header Access-Control-Allow-Origin *
		header Cache-Control no-store
		respond "ok" 200
	}}
	handle {{
		respond "gameplay server" 200
	}}
	log {{
		output file /var/log/caddy/gameplay.log {{
			roll_size 10mb
			roll_keep 3
		}}
		format console
	}}
}}
"""


def say(text):
    print(text, flush=True)


def run(args, check=True, quiet=False):
    if not quiet:
        say("$ " + " ".join(args))
    done = subprocess.run(args, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, universal_newlines=True)
    if check and done.returncode != 0:
        say(done.stdout.strip())
        say("Failed: " + " ".join(args))
        sys.exit(1)
    return done


def apt_candidate(name):
    out = run(["apt-cache", "policy", name], check=False, quiet=True).stdout
    for line in out.splitlines():
        line = line.strip()
        if line.startswith("Candidate:"):
            value = line.split(":", 1)[1].strip()
            return value if value and value != "(none)" else None
    return None


def install_caddy():
    if shutil.which("caddy"):
        say("Caddy is already installed: " + run(["caddy", "version"], quiet=True).stdout.strip())
        return
    env = dict(os.environ, DEBIAN_FRONTEND="noninteractive")
    subprocess.run(["apt-get", "update"], env=env, check=True)
    if not apt_candidate("caddy"):
        say("Caddy is not in this Debian release's packages: adding the official Caddy package source.")
        subprocess.run(["apt-get", "install", "-y", "debian-keyring", "debian-archive-keyring", "apt-transport-https", "curl", "gnupg"], env=env, check=True)
        key = urllib.request.urlopen("https://dl.cloudsmith.io/public/caddy/stable/gpg.key", timeout=60, context=ssl.create_default_context()).read()
        dearmor = subprocess.run(["gpg", "--dearmor"], input=key, stdout=subprocess.PIPE, check=True)
        with open("/usr/share/keyrings/caddy-stable-archive-keyring.gpg", "wb") as handle:
            handle.write(dearmor.stdout)
        with open("/etc/apt/sources.list.d/caddy-stable.list", "w") as handle:
            handle.write("deb [signed-by=/usr/share/keyrings/caddy-stable-archive-keyring.gpg] https://dl.cloudsmith.io/public/caddy/stable/deb/debian any-version main\n")
        subprocess.run(["apt-get", "update"], env=env, check=True)
    subprocess.run(["apt-get", "install", "-y", "caddy"], env=env, check=True)


def write_config():
    os.makedirs(CADDY_DIR, exist_ok=True)
    os.makedirs("/var/log/caddy", exist_ok=True)
    try:
        shutil.chown("/var/log/caddy", "caddy", "caddy")
    except (LookupError, OSError):
        pass
    with open(SITE_FILE, "w") as handle:
        handle.write(SITE.format(domain=DOMAIN, supabase=SUPABASE))
    current = ""
    if os.path.exists(MAIN):
        with open(MAIN) as handle:
            current = handle.read()
    stock = "/usr/share/caddy" in current and DOMAIN not in current
    if IMPORT in current:
        return
    if current.strip() and not stock:
        stamp = time.strftime("%Y%m%d-%H%M%S")
        shutil.copy(MAIN, MAIN + ".before-gameplay-" + stamp)
        with open(MAIN, "a") as handle:
            handle.write("\n" + IMPORT + "\n")
        say("Added the gameplay site to your existing Caddyfile (backup saved next to it).")
        return
    if current.strip():
        shutil.copy(MAIN, MAIN + ".default")
    with open(MAIN, "w") as handle:
        handle.write(IMPORT + "\n")


def open_firewall():
    if shutil.which("ufw"):
        status = run(["ufw", "status"], check=False, quiet=True).stdout
        if "Status: active" in status:
            run(["ufw", "allow", "80/tcp"], check=False)
            run(["ufw", "allow", "443/tcp"], check=False)


def start():
    run(["caddy", "validate", "--config", MAIN, "--adapter", "caddyfile"])
    run(["systemctl", "enable", "caddy"], check=False)
    active = run(["systemctl", "is-active", "caddy"], check=False, quiet=True).stdout.strip() == "active"
    run(["systemctl", "reload" if active else "restart", "caddy"])


def probe(url, data=None, headers=None, origin=None):
    head = dict(headers or {})
    if origin:
        head["Origin"] = origin
    request = urllib.request.Request(url, data=data, headers=head, method="POST" if data is not None else "GET")
    try:
        with urllib.request.urlopen(request, timeout=20, context=ssl.create_default_context()) as response:
            return response.status, response.headers.get("Access-Control-Allow-Origin"), response.read(300).decode("utf-8", "replace")
    except urllib.error.HTTPError as error:
        return error.code, error.headers.get("Access-Control-Allow-Origin"), error.read(300).decode("utf-8", "replace")
    except Exception as error:
        return None, None, str(error)


def check():
    say("")
    say("Checking https://%s (the certificate can take up to a minute the first time)..." % DOMAIN)
    base = "https://" + DOMAIN
    status = None
    for attempt in range(12):
        status, _, body = probe(base + "/health")
        if status == 200:
            break
        time.sleep(5)
    if status != 200:
        say("Could not reach %s/health from this machine: %s" % (base, body))
        say("Check that the DNS record of %s points to this machine's public address, that ports 80 and 443 are forwarded to it, then run this script again." % DOMAIN)
        say("Some home routers cannot reach their own public address from inside; then test from a phone on mobile data: %s/health should show ok." % base)
        return False
    head = {"apikey": ANON_KEY, "Content-Type": "application/json"}
    good = True
    for name, path, data in [("site password", "/rest/v1/rpc/get_gate_slot", b"{}"), ("site switches", "/rest/v1/rpc/get_site_flags", b"{}"), ("accounts", "/auth/v1/settings", None)]:
        code, cors, body = probe(base + path, data, head, SITES[0])
        fine = code == 200 and cors in (SITES[0], "*")
        good = good and fine
        say("%s %s: HTTP %s, CORS %s" % ("OK  " if fine else "FAIL", name, code, cors))
        if not fine:
            say("     " + body[:200])
    return good


def main():
    if os.geteuid() != 0:
        say("Run this with sudo: curl -fsSL <url> | sudo python3 -")
        sys.exit(1)
    if not os.path.exists("/etc/debian_version"):
        say("This script is for Debian (or Debian based systems such as Raspberry Pi OS).")
        sys.exit(1)
    say("gameplay server setup for %s on %s (%s)" % (DOMAIN, platform.platform(), platform.machine()))
    install_caddy()
    write_config()
    open_firewall()
    start()
    ok = check()
    say("")
    if ok:
        say("Done. %s now relays the accounts server for networks that block supabase.co." % DOMAIN)
    else:
        say("Caddy is installed and configured. Fix the points above and run the script again to re-check.")
    say("Logs: journalctl -u caddy -f   and   /var/log/caddy/gameplay.log")


if __name__ == "__main__":
    main()
