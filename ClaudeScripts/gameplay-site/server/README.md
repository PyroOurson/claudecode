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
curl -fsSL https://raw.githubusercontent.com/PyroOurson/claudecode/mainbranch-claude-code/ClaudeScripts/gameplay-site/server/setup.py | sudo python3 -
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

Deploy it from this folder with Wrangler (`wrangler.toml` holds the name `gameplay-api` and the custom domain): `npx wrangler login` once, then `npx wrangler deploy`. On Windows PowerShell use `npx.cmd`, because script execution is turned off.

Found on 13 November 2026: the name `gameplay-api.vitalang.net` had a plain DNS record (DNS only) pointing to the home address 176.146.110.90 instead of the Worker, so the relay did not answer (connection reset). Deploying with the custom domain needs that record removed first (Cloudflare dashboard, vitalang.net, DNS), then Cloudflare creates the right one itself.

Secrets (`npx wrangler secret put NAME`, never in git):

- `RELAY_KEY`: a long random value. The Worker sends it to the database with every request, together with the visitor's address (`X-GP-IP`) and country (`X-GP-Country`); the database trusts those only when the value matches the hash stored with `select private.set_relay_key('<the same value>');` in the SQL editor. Until a key is stored, the database keeps trusting the Worker's addresses as before. It also lets the Worker check address and device bans for sign-in, sign-up and uploads (the database checks every other request itself).
- `TURN_KEY_ID` and `TURN_KEY_API_TOKEN`: see the TURN section below.

Check: https://gameplay-api.vitalang.net/health shows `ok`, and on https://gameplaygames.web.app/check the "relay 1 (gameplay-api.vitalang.net)" lines say Works.

## TURN relay for online parties (same Worker, `/turn`)

Online parties connect players directly when they can. On networks where a direct link is impossible (strict firewalls, some school, hotel and mobile networks), the connection has to pass through a TURN relay. The Worker can hand out short-lived Cloudflare TURN credentials, so the site always has a working relay on ports 443 and 80. Cloudflare gives 1,000 GB of TURN traffic a month for free.

1. In the Cloudflare dashboard: **Realtime** → **TURN Server** → **Create**. Name it `gameplay`. Copy the **Turn Token ID** and the **API Token** (shown once).
2. Open the `gameplay-api` Worker → **Settings** → **Variables and Secrets** → add two **Secret** values: `TURN_KEY_ID` (the Turn Token ID) and `TURN_KEY_API_TOKEN` (the API Token). Press **Deploy**.
3. **Edit code**: replace everything with the current `cloudflare-worker.js` from this folder and press **Deploy**.
4. Check: open https://gameplaygames.web.app/check while signed in to the site in the same browser. The line "Relayed connections (site TURN 1)" should say Works. The endpoint only answers the site itself and only for signed-in players (it checks the player's session with the accounts server), so opening `/turn` directly in a browser shows `origin not allowed`: that is expected. Without the two secrets the site falls back to public STUN servers and the free Open Relay TURN service, which is less reliable.

The endpoint only answers the site's own addresses (`gameplaygames.web.app`, `gameplaygames.firebaseapp.com`, `pyroourson.github.io`) and signed-in players, caches one credential for an hour, and never exposes the API token. TURN traffic above the free 1,000 GB a month is billed by Cloudflare, which is why the endpoint is not open to everyone. The site asks every address in `SUPABASE_RELAYS` for `/turn` (see `NET_ICE_URLS` in `source/w/new/consts.js`).

## What it relays

Only the Supabase paths that the site uses: `/rest/v1/`, `/auth/v1/`, `/realtime/v1/` (websockets for friends, chat and live site switches), `/storage/v1/`, `/functions/v1/` and `/graphql/v1/`. They are forwarded unchanged to `uafouyvtcijptspjbsqf.supabase.co`, so every database rule still applies.

The machine stores nothing: no passwords, no keys, no player data. Supabase sees the relay's address for requests that pass through it, so Supabase's sign-in limits per address are shared by everyone using the relay.
