# Gameplay Games

A browser game portal: about 170 games, accounts, friends, direct messages, online parties, an idea box and an admin dashboard.

- Live site: https://gameplaygames.web.app (Firebase Hosting, project `claudecode-7e172`)
- Copy on GitHub Pages: https://pyroourson.github.io/claudecode/ (served from the repository root: `index.html` and `gameplay/`)
- Backend: Supabase project `uafouyvtcijptspjbsqf` (database, accounts, live updates, file storage)
- Relay for filtered networks: Cloudflare Worker `gameplay-api` at https://gameplay-api.vitalang.net

## Where things are

| Path | What it is |
|---|---|
| `source/w/new/` | The portal: page markup, styles and scripts (accounts, parties, chat, admin, settings, legal texts) |
| `source/w/parts/` | One file per game or group of games. The voxel sandbox and the endless runner are generated from `source/w/agents2/*/src`, the car soccer game from `source/rl/seg` |
| `source/w/supabase/` | Database: `schema.sql` (everything, safe to run again) and the `roundNN_*.sql` steps |
| `source/t/` | Test tools: a local staging copy of the whole platform and browser tests |
| `server/` | Relay worker code and its setup notes |
| `deploy.py` | Publishes a branch to Firebase |
| `LEDGER.md` | Status of every item of the last brief and how each was checked |
| `GOLIVE.md` | The go-live steps for the last release |
| `NEXT_AI.md` | Briefing for the next AI that works on this site |

## Publish a change

1. Build the site from `source/` (see `source/BUILD.md`), copy `w/site/index.html` and `w/site/gameplay/` to the repository root, run `git ls-files > files.txt`, commit, open a pull request.
2. Merge the pull request into `mainbranch-claude-code` (this also updates GitHub Pages).
3. In Google Cloud Shell (https://shell.cloud.google.com/):

```bash
curl -fsSL https://raw.githubusercontent.com/PyroOurson/claudecode/mainbranch-claude-code/ClaudeScripts/gameplay-site/deploy.py | python3 - mainbranch-claude-code
```

Add `--preview` after the branch name to get a temporary address instead of changing the live site.

Database changes go first: open https://supabase.com/dashboard/project/uafouyvtcijptspjbsqf/sql/new and run the new round files in order.

## Status (13 November 2026)

The platform overhaul is live: database rounds 16 to 19b applied, pull request #6 merged, site deployed. Still open:

- Relay worker: paste the new `server/cloudflare-worker.js` and add its two secrets (`server/README.md`). Parties work without it.
- A test account with Diagnostics switched on, for checks on the real site.
- The owner decisions and the unfinished items listed in `LEDGER.md` and `NEXT_AI.md`.
