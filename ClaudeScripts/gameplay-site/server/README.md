# gameplay server (gameplaygames.vitalang.net)

**Not in use yet.** The site does not contact this machine. When it should, run the setup below and add `https://gameplaygames.vitalang.net` to `SUPABASE_RELAYS` in `ClaudeScripts/gameplay-site/source/w/new/consts.js`, then rebuild. The Cloudflare Worker below does not need the machine and is used already.

Some school and office networks block `supabase.co`, where the accounts, friends, chat, statistics and site switches live. This server relays those requests: the site first talks to Supabase directly, and when that fails it uses `https://gameplaygames.vitalang.net` instead, with no setting for players to change. The online multiplayer server will be added behind the same address later.

It runs on Debian (or Raspberry Pi OS) on arm64 or x86, without Docker. It uses Caddy from the Debian packages, which also gets and renews the HTTPS certificate on its own.

## Before running it

1. **DNS**: `gameplaygames.vitalang.net` must point to the machine's public IPv4 address. It currently points to `176.146.110.90`. Leave the record as "DNS only" (grey cloud) in Cloudflare, so the certificate can be issued and the network filters see your own address.
2. **Router**: forward TCP ports **80** and **443** from the internet to the Debian machine. Give the machine a fixed local IP address in the router first.
3. Port 443 must not already be used by another web server on the machine. If Caddy is already installed, the script adds this site to your existing Caddyfile and saves a backup.

## Install or update

On the Debian machine:

```
curl -fsSL https://raw.githubusercontent.com/PyroOurson/claudecode/claude/upbeat-bell-n1e54q/ClaudeScripts/gameplay-site/server/setup.py | sudo python3 -
```

The script:

- installs Caddy;
- writes `/etc/caddy/gameplay.caddy`;
- starts Caddy at boot;
- opens ports 80 and 443 if `ufw` is on;
- checks that the site password, the site switches and the accounts service answer through the relay.

Run it again at any time; it changes nothing that is already right.

## Check it

- From a phone on mobile data: https://gameplaygames.vitalang.net/health shows `ok`.
- On the restricted network: open https://gameplaygames.web.app/check. Once it is added to the site, its relay lines should all say Works.
- Logs: `journalctl -u caddy -f` and `/var/log/caddy/gameplay.log`.

## Second relay: Cloudflare Worker (gameplay-api.vitalang.net)

This one runs on Cloudflare's network, so it keeps working when the home connection or the Debian machine is off. It also uses Cloudflare addresses, which school filters almost never block. It is free (100,000 requests a day), and the site only uses it when the other routes fail.

1. In the Cloudflare dashboard: **Workers & Pages** → **Create** → **Create Worker**, name it `gameplay-api`, press **Deploy**.
2. **Edit code**: replace everything with the content of `cloudflare-worker.js` (in this folder), then press **Deploy**.
3. **Settings** → **Domains & Routes** → **Add** → **Custom domain** → `gameplay-api.vitalang.net` → **Add domain**. Cloudflare creates the DNS record itself.
4. Check: https://gameplay-api.vitalang.net/health shows `ok`, and on https://gameplaygames.web.app/check the "relay 1 (gameplay-api.vitalang.net)" lines say Works.

## What it relays

Only the Supabase paths that the site uses: `/rest/v1/`, `/auth/v1/`, `/realtime/v1/` (websockets for friends, chat and live site switches), `/storage/v1/`, `/functions/v1/` and `/graphql/v1/`. They are forwarded unchanged to `uafouyvtcijptspjbsqf.supabase.co`, so every database rule still applies.

The machine stores nothing: no passwords, no keys, no player data. Supabase sees the relay's address for requests that pass through it, so Supabase's sign-in limits per address are shared by everyone using the relay.
