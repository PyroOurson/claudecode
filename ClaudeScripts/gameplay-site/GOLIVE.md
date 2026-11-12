# Going live with the overhaul

Nothing in the `claude/platform-overhaul` branch is live until you do the steps below. Do them in this order. Each step says what it changes and how to check it.

## 1. Database (Supabase SQL editor)

Open the project at https://supabase.com/dashboard, **SQL Editor** > **New query**. Paste each file, press **Run**, and wait for "Success" before the next one. All of them are safe to run twice and none deletes user data.

| Order | File (in `source/w/supabase/`) | What it adds |
|---|---|---|
| 1 | `round16_moderation.sql` | Only if you have not run it before (chat moderation log). Running it again is harmless |
| 2 | `round17_platform.sql` | Diagnostics for test accounts, role-based rate limits, online-status heartbeat, 4-character usernames |
| 3 | `round18_ideas.sql` | Idea box, file attachments in messages and tickets |
| 4 | `round19_analytics.sql` | Dashboard live numbers, new analytics, retention clean-up |

What changes for players as soon as `round17` runs, even before the new site is deployed: ordinary rate limits are three times higher, owners and admins are no longer rate limited (except on the security-sensitive actions), and new usernames need at least 4 characters (existing shorter ones keep working).

Check: in the SQL editor run `select private.username_ok('abc'), private.username_ok('abcd');` and expect `false, true`.

## 2. Cloudflare worker (party relay)

Follow "TURN relay for online parties" in `server/README.md`: create a TURN key, add the two secrets to the `gameplay-api` worker, paste the new `cloudflare-worker.js`, deploy.

Check: https://gameplay-api.vitalang.net/health shows `ok`, and https://gameplay-api.vitalang.net/turn shows JSON containing `turn.cloudflare.com`. While testing from my side the worker's address did not answer at all, so check `/health` first: if it fails, the relay for school networks is down today, independent of this work.

## 3. Preview before production

In Cloud Shell:

```bash
curl -fsSL https://raw.githubusercontent.com/PyroOurson/claudecode/claude/platform-overhaul/ClaudeScripts/gameplay-site/deploy.py | python3 - claude/platform-overhaul --preview
```

It prints a temporary address (valid 7 days) and does not touch the live site. Open it, sign in, and try: a refresh (no password or login flash), hosting a public party and joining it from a second device on mobile data, the idea box, a file in a direct message, the settings window, the admin dashboard.

Google sign-in will not work on the preview address unless you add that address to the Google client's authorised origins; that is expected.

## 4. A test account on production

In the admin dashboard, create a test account (Users > New test account). After step 1, every test account automatically records full diagnostics (errors, requests, connection steps, packets, frame rate), shown by a red REC chip at the bottom left when signed in with it. Ordinary accounts are never recorded: the server refuses it.

Give me that account's email and password if you want me to run the production checks.

## 5. Production

Merge the pull request into `mainbranch-claude-code` (this updates the GitHub Pages copy), then deploy to Firebase as usual:

```bash
curl -fsSL https://raw.githubusercontent.com/PyroOurson/claudecode/mainbranch-claude-code/ClaudeScripts/gameplay-site/deploy.py | python3 - mainbranch-claude-code
```

## 6. After it is live

- https://gameplaygames.web.app/check on the school network: the "Online games" block now tests both party routes and the TURN relay, and says in one sentence what will work there.
- Admin dashboard > Diagnostics: sessions of the test account.
- If something is wrong, redeploying the previous commit of `mainbranch-claude-code` restores the old site; the database changes are additive and can stay.
