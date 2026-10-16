# Turning on accounts for gameplay (Supabase + Google sign-in)

This guide is for you, the owner. You only need a web browser. It takes about 20 minutes.

When you are done, you give Claude **4 or 5 things** (listed at the end). Claude then switches on accounts. Until then the site keeps working exactly as it does today: everyone plays as a guest and nothing is sent anywhere.

What players get once it is on:

- Sign up with a username, an email and a password (a confirmation email is sent), then log in with the email or the username. Google sign-in appears as soon as you turn it on (Part C). Guests keep playing as before.
- A username that friends can find (the search shows matching usernames as you type), friend requests, and a display name.
- Records, play counts, time played and saved games kept in their account, on every device.
- Change email, change password, reset a forgotten password, sign out, download their data, delete their account.
- If they accept analytics cookies, anonymous usage counts are sent to your database so you can see which games are popular.

Keep a password manager (for example the one built into Chrome, Safari or 1Password) open: you will save a few secrets in it.

---

## Part A. Create the Supabase project

1. Go to **https://supabase.com** and click **Start your project**. Sign in with GitHub or with your email (gabriel06401@gmail.com).
2. If it asks you to create an **organization**, name it `gameplay`, type **Personal**, plan **Free**, and click **Create organization**.
3. Click **New project** and fill in the form:
   - **Project name:** `gameplay`
   - **Database password:** click **Generate a password**, then **copy it and save it in your password manager** (entry name: "Supabase gameplay database"). You will almost never need it, but it cannot be shown again.
   - **Region:** choose **Europe** (or the closest **West EU** option, for example *West EU (Ireland)* or *West EU (Paris)*). Europe keeps the data close to your players and under EU rules.
   - **Plan / instance:** Free (the smallest size is fine).
4. Open **Security options** (sometimes called *Advanced configuration*) if it is folded, and check these (the exact wording can differ a little):
   - **Data API:** on (the option that says *Data API + Connection string*).
   - **Use the public schema for the Data API:** yes (the default).
   - **Automatically expose new tables:** **off** (untick it). Our setup gives access table by table, which is safer.
   - **Enable automatic RLS** (Row Level Security on new tables): **on**.
5. Click **Create new project**. Wait 1 to 2 minutes until the dashboard says the project is ready (green).

## Part B. Find the 3 Supabase things for Claude

### B1. The project URL and the project ID

- Click **Project Settings** (the gear icon at the bottom of the left menu) > **General**. Copy the **Project ID**: 20 lowercase letters, for example `abcdefghijklmnopqrst`.
- The **project URL** is then `https://<Project ID>.supabase.co`. You can also see it in **Project Settings > Data API** (field *Project URL*) or by clicking the **Connect** button at the top of the dashboard.

### B2. The publishable key (public, safe to share)

- **Project Settings > API Keys**. Copy the **Publishable key** (it starts with `sb_publishable_`).
- If you only see a tab called **Legacy API Keys**, copy the **anon / public** key instead (a long text starting with `eyJ`).
- Never copy the **secret** key or the **service_role** key. Claude does not need them, and they must never be put on the website.

### B3. A personal access token (secret, temporary)

This lets Claude set everything up for you in one go (database tables, security rules and sign-in settings).

1. Click your avatar at the top right of the dashboard > **Account preferences** (or open **https://supabase.com/dashboard/account/tokens**).
2. Open **Access Tokens** and click **Generate new token**.
3. Name it `claude-setup`. If it asks for an expiry, choose the shortest one that gives you time (for example **1 day** or **7 days**).
4. Click **Generate token** and **copy it now** (it starts with `sbp_`); it is only shown once. Save it in your password manager.

This token can change any of your Supabase projects, so treat it like a password, give it only to Claude, and revoke it when Claude is done (Part D).

## Part C. Create the Google sign-in client (Google Cloud Console)

Do this after Part B, because you need the project ID.

### C1. Open the right Google Cloud project

1. Go to **https://console.cloud.google.com** and sign in with gabriel06401@gmail.com.
2. At the top left, click the project picker and choose **claudecode-7e172**.

### C2. Consent screen (what players see when they click "Continue with Google")

1. In the search bar at the top, type **Google Auth Platform** and open it (in older menus it is **APIs & Services > OAuth consent screen**). If you see **Get started**, click it.
2. **App information:** App name `gameplay`, User support email **gabriel06401@gmail.com**. Click **Next**.
3. **Audience:** choose **External**. Click **Next**.
4. **Contact information:** gabriel06401@gmail.com. Click **Next**, accept the policy, then **Continue** and **Create**.
5. Open **Branding** in the left menu (optional but nice):
   - Application home page: `https://gameplaygames.web.app`
   - Privacy policy: `https://gameplaygames.web.app/privacy`
   - Terms of service: `https://gameplaygames.web.app/terms`
   - **Authorized domains:** add `gameplaygames.web.app` and `supabase.co`.
   - Click **Save**.
6. Open **Data access** > **Add or remove scopes**. Tick these three, then **Update** and **Save**:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
   These are the basic scopes: Google only shares the player's email, name and profile picture. No Google review is needed for them.
7. Open **Audience**. You have two choices:
   - **Testing** (the start state): only the people you add under **Test users** (up to 100 Gmail addresses) can sign in. Good to try it with a few friends first.
   - **Publish app** > **Confirm**: anyone with a Google account can sign in. With only the basic scopes above this is immediate. Google may show the Supabase address on the sign-in screen until it has verified your branding; that is normal and harmless.

### C3. The client ID and secret

1. Open **Clients** in the left menu > **Create client**.
2. **Application type:** **Web application**. **Name:** `gameplay website`.
3. **Authorized JavaScript origins** > **Add URI**, add each of these (no slash at the end):
   - `https://gameplaygames.web.app`
   - `https://gameplaygames.firebaseapp.com`
   - `https://pyroourson.github.io`
4. **Authorized redirect URIs** > **Add URI**:
   - `https://<Project ID>.supabase.co/auth/v1/callback` (replace `<Project ID>` with the 20 letters from B1)
5. Click **Create**. A window shows the **Client ID** (ends with `.apps.googleusercontent.com`) and the **Client secret** (starts with `GOCSPX-`). **Copy both now** and save them in your password manager (Google may not show the secret again; click **Download JSON** as a backup).

## What to give Claude

Paste these in the chat:

1. Project URL: `https://<Project ID>.supabase.co`
2. Publishable key: `sb_publishable_...` (or the anon key `eyJ...`)
3. Personal access token: `sbp_...`
4. Google Client ID: `....apps.googleusercontent.com`
5. Google Client secret: `GOCSPX-...`

Never paste the database password, the secret key or the service_role key.

## Part D. What Claude does with the token, and how to revoke it

Claude runs one small script, `supabase/setup.py`, with your token. It:

1. Creates the database tables, the security rules (Row Level Security) and the dashboard views from `supabase/schema.sql`. Running it again is safe: it never deletes data.
2. Sets up sign-in: the site address `https://gameplaygames.web.app`, the allowed return addresses (`https://gameplaygames.web.app/**`, `https://gameplaygames.firebaseapp.com/**`, `https://pyroourson.github.io/claudecode/**`), email and password sign-in with a minimum password length of 8, email confirmation, and Google sign-in with your client ID and secret.
3. Reads the publishable key and puts the project URL and key into the website settings, then rebuilds the site. That is the moment accounts switch on.

When Claude says it is done, revoke the token:

1. Go to **https://supabase.com/dashboard/account/tokens**.
2. Next to `claude-setup`, click the **...** or trash icon > **Delete** / **Revoke**, and confirm.

The website keeps working: it only uses the publishable key, which is designed to be public. Security comes from the Row Level Security rules in the database: each player can only read and change their own data.

If you prefer not to create a token, you can do it by hand instead: open **SQL Editor** > **New query**, paste the whole content of `supabase/schema.sql`, click **Run**; then in **Authentication** set **URL Configuration** (Site URL and Redirect URLs as in step 2 above), **Sign In / Providers** > **Email** (enabled, confirm email on, minimum password length 8) and **Google** (enabled, paste the client ID and secret). Then give Claude only the project URL and publishable key.

## Part E. Where to see your data later

Open your project at **https://supabase.com/dashboard**.

- **Authentication > Users:** every account, with its email, sign-in method (Google or email) and last sign-in. You can delete a user here.
- **Table Editor** (schema `public`):
  - `profiles`: usernames and display names.
  - `game_stats`: plays, time played and best score per player and game.
  - `game_saves`: saved progress.
  - `analytics_events`: the raw usage events (only from players who accepted analytics cookies).
  - `friends`, `friend_requests`: who is friends with whom, and pending friend requests.
  - `account_deletion_requests`: normally empty (see below).
- **SQL Editor** > **New query**, paste one line and click **Run**. Ready-made dashboards (days use the Paris time zone):

| Paste this | What you see |
|---|---|
| `select * from admin.overview;` | Totals: accounts, active players today, last 7 and 30 days, launches and hours played this week |
| `select * from admin.daily_active_users;` | Players, signed-in players, sessions, launches and hours played per day |
| `select * from admin.most_played_games;` | Games ranked by launches, with plays, players and the last 7 and 30 days |
| `select * from admin.most_time_played;` | Games ranked by hours played |
| `select * from admin.top_games(7);` | Top games of the last 7 days (change 7 to any number of days) |
| `select * from admin.retention;` | For each first-visit day: how many new players, and the % who came back 1, 7 and 30 days later |
| `select * from admin.account_game_totals;` | Plays and hours per game for signed-in players |
| `select * from admin.signups_daily;` | New accounts per day, Google or email |
| `select * from admin.top_searches;` | What people type in the search box, and searches with no result |
| `select * from admin.devices;` | Phones, tablets and computers, by system and browser |
| `select * from admin.recent_errors;` | The last 500 errors seen by players |
| `select * from admin.pending_account_deletions;` | Accounts that asked to be deleted but could not be removed automatically |

Click **Save** in the SQL editor to keep a query in your list. The `admin` dashboards can only be opened from your dashboard, never from the website.

Analytics events are deleted automatically after two years.

## Part F. Emails on the free plan

Supabase sends the account emails itself (confirm your email, reset password, change email). On the free plan, the built-in sender is only for testing:

- it sends **only to the members of your Supabase organization** (for example you), not to your friends;
- it sends about **2 emails per hour** for the whole project.

So, without a custom email sender, **friends should use "Continue with Google"**, which needs no email. The site tells them so if an email cannot be sent.

To let everyone create an email account, add a free email service (optional, 10 minutes):

1. Create a free account at an email provider such as **Brevo** (300 emails per day free), **Resend** or **Mailgun**, and verify the sender address you want to use (for example gabriel06401@gmail.com, or an address on your own domain if you have one, which is delivered better).
2. In the provider, find its **SMTP** settings: host, port, user name and password (often called an SMTP key).
3. Either give them to Claude (Claude reruns the setup with them), or enter them yourself in Supabase: **Authentication > Emails > SMTP Settings** > **Enable custom SMTP**, fill in the fields, sender name `gameplay`, and **Save**. Then in **Authentication > Rate Limits**, raise the emails per hour (for example to 30).

Another option is to turn off email confirmation (Claude can do it), so people can sign up without an email. Then nobody can check that an address is real, and password reset emails still need a custom sender for non-members.

You can change the email texts in **Authentication > Emails > Templates**.

## Part G. What "passwords and emails" means here

- **Passwords are never stored by the website or by us.** When a player types a password, it goes over an encrypted connection straight to **Supabase Auth**, the sign-in service. Supabase keeps only a **hash** of it (a one-way scramble, bcrypt). Nobody can read a password back, not you, not Claude, not Supabase staff. If players forget it, they reset it by email.
- **Google sign-in** players have no password with us at all: Google confirms who they are and tells us only their email, name and profile picture.
- **Emails** are stored by Supabase Auth in its own protected area (`auth.users`). You can see them in **Authentication > Users**, but they are never shown to other players and never readable from the website. Players find each other by **username**, not by email. Logging in with a username works through a small database function (`login_email`) that only answers when the password is right, and is limited to 10 tries per username every 15 minutes; the friend search (`search_profiles`) only works for signed-in players, needs at least 2 letters, returns at most 20 usernames with display names and pictures (never emails), and is limited to 120 searches per minute per player.
- Our own tables only hold game data (username, display name, records, saves, friends) and, if players accept, anonymous usage counts.
- When a player deletes their account (Settings > Account > Delete my account), their account, profile, records, saves and friends are removed from the database, and their analytics events are made anonymous. If Supabase ever refuses the automatic removal, the request shows up in `admin.pending_account_deletions`: delete that user in **Authentication > Users**.
- Keep your own Supabase login safe: turn on two-factor authentication in **Account preferences > Security**.
