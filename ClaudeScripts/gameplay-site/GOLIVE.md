# Going live with the overhaul

Nothing in the `claude/platform-overhaul` branch is live until you do the steps below. Do them in this order. Each step says what it changes and how to check it.

## 1. Database (Supabase SQL editor)

Open the project at https://supabase.com/dashboard, **SQL Editor** > **New query**. Paste each file, press **Run**, and wait for "Success" before the next one. All of them are safe to run twice and none deletes user data.

| Order | File (in `source/w/supabase/`) | What it adds |
|---|---|---|
| 1 | `round16_moderation.sql` | Only if you have not run it before (chat moderation log). Running it again is harmless |
| 2 | `round17_platform.sql` | Diagnostics for test accounts, role-based rate limits, online-status heartbeat, 4-character usernames |
| 3 | `round18_ideas.sql` | Idea box, file attachments in ideas, messages and tickets (three private storage buckets with size and type limits) |
| 4 | `round19_analytics.sql` | Dashboard live numbers, new analytics, duplicate protection for new events |

Keep this order. Some later files replace functions from earlier ones, so if you ever re-run one file, re-run the files after it too. All four were applied twice in this order on the staging copy without errors.

Alternative: `schema.sql` now contains all four rounds at its end and can be run as one file on the live database (checked on the staging copy: it applies from top to bottom without errors on a database that is already up to date; before this work it stopped at the first function whose shape had changed since).

None of these four files deletes or rewrites existing rows of yours. `round19` only adds flags to existing analytics rows (which events came before login, which belong to staff or test accounts) so the dashboard can leave them out.

Two things that do remove data are separate and are your decision:

- **One-time clean-up of old analytics, optional:** `round19b_analytics_cleanup.sql`. It deletes exact duplicate analytics rows (the old site stored the last batch of every visit twice; on staging 1,198 rows became 590) and removes fields the site no longer collects (city, internet provider, battery, device counts and similar) from old events. Without it, historical dashboard numbers stay inflated by the duplicates. It cannot be undone, so export the `analytics_events` table first if you want a copy.
- **Automatic deletion of old records, off by default:** to switch it on, run `update private.housekeep set retention = true where id = 1;`. Once a day it then deletes analytics events older than 400 days, chat moderation log entries older than 365 days, online-status history older than 400 days (samples older than 2 years) and test-account diagnostics older than 30 days. The Privacy Policy states these periods, so either switch this on or tell me the periods you want and I will change the policy text to match. To switch it off again set it to `false`.

What changes for players as soon as `round17` runs, even before the new site is deployed: ordinary rate limits are three times higher, owners and admins are no longer rate limited (except on the security-sensitive actions), and new usernames need at least 4 characters (existing shorter ones keep working).

Check: in the SQL editor run `select private.username_ok('abc'), private.username_ok('abcd');` and expect `false, true`.

## 2. Cloudflare worker (party relay)

Follow "TURN relay for online parties" in `server/README.md`: create a TURN key, add the two secrets to the `gameplay-api` worker, paste the new `cloudflare-worker.js`, deploy.

Check: https://gameplay-api.vitalang.net/health shows `ok`. After the new site is deployed, https://gameplaygames.web.app/check (opened while signed in) shows "Relayed connections (site TURN 1): Works". From my test machine the worker answers but, as designed, refuses pages that are not served from the site's own addresses, so I could not exercise it; check `/health` yourself before and after pasting the new code.

What I could check without touching anything: the final build, served from my machine and opened as a brand-new anonymous visitor, reads the real backend the same way the live page does, shows the sign-up page with the Google button and the cookie notice in about two seconds, lists 168 games and loads the Terms on demand. Nothing was written.

## 3. Preview before production

In Cloud Shell:

```bash
curl -fsSL https://raw.githubusercontent.com/PyroOurson/claudecode/claude/platform-overhaul/ClaudeScripts/gameplay-site/deploy.py | python3 - claude/platform-overhaul --preview
```

It prints a temporary address (valid 7 days) and does not touch the live site. Open it, sign in, and try: a refresh (no password or login flash), hosting a public party and joining it from a second device on mobile data, the idea box, a file in a direct message, the settings window, the admin dashboard.

Google sign-in will not work on the preview address unless you add that address to the Google client's authorised origins; that is expected.

## 4. A test account on production

In the admin dashboard, create an ordinary account for testing, then switch on **Diagnostics** for it (Diagnostics tab). Only accounts with that switch on record full diagnostics (errors, requests, connection steps, packets, frame rate), shown by a red REC chip at the bottom left when signed in with them. Every other account is never recorded: the server refuses it. Accounts you created in the dashboard for real people are not recorded unless you switch it on for them, so do not.

Optional clean-up, recommended: accounts created in the dashboard keep a readable copy of their password in `public.test_accounts` so you can hand it out. For staff accounts that copy is a risk. To remove the copies kept for admin and owner accounts, run `delete from public.test_accounts t using public.profiles p where p.id = t.user_id and p.role <> 'user';` in the SQL editor (new staff accounts no longer keep one).

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
