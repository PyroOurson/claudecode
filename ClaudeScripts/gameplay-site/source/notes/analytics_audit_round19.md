# Analytics and dashboard audit (round 19)

Scope: every number on the admin dashboard, the collection code (`w/new/track.js`, the analytics queue in `w/new/tail.js`) and the SQL in `w/supabase/round19_analytics.sql`. Checked on staging on 12 Nov 2026 with two dedicated accounts (`adm_dan`, `adm_eve`), the owner account and a recorded test account.

## How it was checked

1. Known activity was generated with the browser driver: both accounts signed in, played 2048 for timed periods (20 s and 30 s of key presses), one launch was left after 4 s without input, two script errors were thrown, a search with no result was typed, a real two-player party was hosted and joined, and one join with a wrong code was left to fail.
2. The events were read back by hand. Active time recorded for the timed plays was 20 s and 30 s; the frame-rate sample, the visit id and the round and record counters arrived on the same `game_time` rows.
3. 37 dashboard figures were compared with SQL written independently of the dashboard functions (the queries are at the end of this file). All 37 agreed, with staff hidden and with staff counted.

| Figure | Hand SQL | Dashboard |
|---|---|---|
| Active today, players / accounts | 24 / 5 | 24 / 5 |
| Sessions today | 108 | 108 |
| Game launches / real plays / page opens | 41 / 5 / 44 | 41 / 5 / 44 |
| Seconds played (hours) | 961 (0.27) | 961 (0.27) |
| Errors / different errors / players / sessions affected | 6 / 3 / 2 / 5 | 6 / 3 / 2 / 5 |
| New accounts today, accounts in total | 7, 7 | 7, 7 |
| Sessions by device, desktop / phone | 96 / 10 | 96 / 10 |
| Searches (4 queries) | 2, 1, 1, 1 | 2, 1, 1, 1 |
| Parties created / joins / retries / games started | 1 / 2 / 2 / 1 | 1 / 2 / 2 / 1 |
| Join attempts, joined, gave up | 3, 2, 1 | 3, 2, 1 |
| Frame rate, weighted / slow frames | 41.5 / 4.4 % | 41.5 / 4.4 % |
| Requests / failed / rejected | 198 / 5 / 1 | 198 / 5 / 1 |
| Bounced launches / measured | 1 / 9 | 1 / 9 |
| Site ready, 3 of 4 visits | 1524 ms | 1524 ms |
| 2048: launches / real plays / players / seconds | 11 / 5 / 4 / 142 | 11 / 5 / 4 / 142 |
| Players today with staff counted | 26 | 26 |

## What was wrong and is fixed

| Problem | Effect before | Fix |
|---|---|---|
| The last batch of every visit was sent twice. On page close the queue is saved, then sent with a keep-alive request; the page dies before the sent rows are removed from the saved queue, so they are sent again on the next visit | On staging 1198 stored rows held only 590 different events. `session_end`, `game_quit`, `game_time`, `sess_sum`, `page_time`, launches and views were inflated | The insert trigger drops a row whose session, event, client time and properties already exist. The existing copies are removed once by the SQL file. Checked: a session with 25 rows was re-sent in full (29 rows posted) and ended with 28 rows and no duplicate |
| Test accounts and staff were counted | 776 of 1198 rows came from test accounts, 10 from staff. "Active today" said 44 with 4 real accounts in the data | Every event is flagged on arrival (`skip`: 2 test account, 1 staff), including the signed-out events of the same session and browser. All aggregates read through one filtered view. Test accounts are always left out; staff are left out unless the "Count staff activity" switch is on. The flags follow role changes |
| A player was a browser, not a person | One shared computer with five students was one player; one student on a phone and a laptop was two; every fresh log in added a phantom visitor for the events before the log in | A player is the account when signed in. Signed-out events of a session that signs in are attached to that session and no longer count as a separate visitor. Visitors who never sign in still count, by browser |
| Device and browser shares counted page loads | 319 "sessions" for 54 real sessions | Distinct sessions |
| "Sessions" in the Player data game table counted `game_quit`, which is lost when a tab is killed | 1 "session" for 23 launches on staging | Column renamed "Measured"; the new Games tab counts launches, real plays and active time, which do not depend on a clean close |
| Per-game errors were all-time under a "last 30 days" heading | Mixed periods on one card | Errors on the game card use the selected period |
| "Peak online" mixed samples taken only while an admin watched | Peaks depended on who had the dashboard open | Peaks come from the server-side activity ticks, without test accounts |
| Top searches were all-time and counted every pause while typing | Long tail of partial words | Selected period, one count per session and query |
| The funnel step "Created an account" could exceed the number of accounts | 44 of 44 visitors with 6 accounts | Follows from the new player identity: one account is one player |
| Hours played on the overview tiles used the old `game_time` sums | Could disagree with the charts | One source for play time everywhere (active-time beats, old sessions fall back to `game_time`) |
| The day test for "too early to tell" used the UTC date | Wrong between midnight and 2 am in Paris | The server sends its own date |
| The overview RPC recomputed all-time per-game totals on every refresh and threw them away | A full scan of the events table every 18 s per open dashboard | The overview builds only what it shows |
| `gameplay:sid` was written to session storage before any consent choice | Analytics item stored without consent | Written only once analytics are allowed; removed together with `gameplay:env`, `gameplay:geo`, `gameplay:hz` when analytics are refused or switched off. Checked in the browser: before a choice and after "Only essentials" nothing analytics-related is stored or sent and no location lookup is made |
| Events lost on page close | The final batch could exceed the keep-alive size limit and be dropped for session-only visitors | The closing flush sends the newest events that fit in 24 KB, also while another flush is in flight; the rest stays queued |

## New collection (consenting visitors only)

- `game_time` now carries the visit id, average frames per second, frames counted, slow frames (over 34 ms), freezes (over 100 ms), rounds finished and whether a personal best was beaten, as differences since the previous `game_time`, so nothing is counted twice and nothing depends on a clean close.
- `game_launch`, `game_play`, `game_quit`, `error`, `pause`, `restart` carry the visit id. Bounce is a launch left with under 10 s of active time and no input.
- `party_join` carries the time from the last click in the lobby to connected.
- `sess_sum` carries counts of requests to the accounts server: total, lost, server errors, rejected, rate limited and total response time.
- `vitals` carries the time until the site is usable.

## Collection removed

Not shown anywhere or not worth collecting from students: battery level and charging, number of microphones, cameras and speakers, speech voices, audio sample rate and channels, the speed test (it burned CPU on every visit), storage quota and use, memory limit, WebGPU adapter, texture size and WebGL extension count, video codecs, Bluetooth, USB, serial, HID, MIDI, VR, vibration, share, wake lock and PDF flags, Do Not Track and Global Privacy Control, notification permission, calendar, number system, hour cycle, first weekday, history length, platform, vendor, the full user agent string, cookies enabled, ad blocker detection (it inserted a bait element), all preferred languages but the first, screen and available size (the resolution string stays), local hour and weekday, network number, city and internet provider (country, region and the VPN or datacenter flag stay), mouse travel, wheel turns, scroll distance, copies and window resizes. The SQL file strips the same fields from stored rows.

## Cost of the one-second call

`public.admin_live` reads the presence table (a few rows per online player), four narrow index ranges on `analytics_events` (last minute by time, last 5 minutes of launches and errors, last hour of errors, last 30 minutes of party events, each through `analytics_created_idx` or `analytics_event_created_idx`), five minutes of `rate_hits` by its time index and three single-row lookups. `explain (analyze, buffers)` on staging: 1.1 to 1.4 ms, about 100 buffer hits, no sequential scan of a large table. The cost depends on the last minutes of traffic, not on the size of the table.

The client asks once per second while the dashboard is visible, never overlaps two calls, stops when the tab is hidden or the dashboard is closed and backs off to 2, 4, 8, 16 and 30 s when a call fails. Lists that are expensive to build reload only when a change counter returned by the live call moves (accounts, tickets, admin log) or on their own slower cadence (20 to 120 s), each with an "Updated N s ago" line.

## Hand SQL used for the comparison

```sql
create temp view a_bad as
  select user_id as id from public.test_accounts union select id from public.profiles where role in ('admin', 'owner');
create temp view a_first as
  select distinct on (session_id) session_id, user_id from public.analytics_events where user_id is not null order by session_id, id;
create temp view a_ev as
  select e.*,
    case when e.user_id is not null then e.user_id::text
         when exists (select 1 from a_first f where f.session_id = e.session_id) then null
         else coalesce(e.visitor_id, e.session_id) end as who2,
    (e.created_at at time zone 'Europe/Paris')::date as day2
  from public.analytics_events e
  where case
    when e.user_id is not null then e.user_id not in (select id from a_bad)
    else not exists (select 1 from a_first f where f.session_id = e.session_id and f.user_id in (select id from a_bad))
     and not exists (select 1 from public.analytics_events x where x.visitor_id = e.visitor_id and x.user_id in (select id from a_bad))
  end;
create temp view a_today as select * from a_ev where day2 = (now() at time zone 'Europe/Paris')::date;
select count(distinct who2), count(distinct user_id), count(distinct session_id) from a_today;
select count(*) filter (where event = 'game_launch'), count(*) filter (where event = 'game_play'), count(*) filter (where event = 'game_open') from a_today;
select sum(m) from (select session_id, props ->> 'v', max((props ->> 'sec')::numeric) as m from a_today where event = 'game_active' group by 1, 2) t;
select count(*), count(distinct who2), count(distinct session_id),
  count(distinct coalesce(game_id, '') || '|' || coalesce(props ->> 'where', '') || '|' || regexp_replace(left(coalesce(props ->> 'msg', ''), 160), '[0-9]+', '#', 'g'))
  from a_today where event = 'error';
select coalesce(device, 'unknown'), count(distinct session_id) from a_today where event = 'session' group by 1;
select event, count(*) from a_today where event like 'party_%' group by 1;
select round(sum((props ->> 'fr')::numeric) / sum((props ->> 'fr')::numeric / (props ->> 'fps')::numeric), 1),
  round(100 * sum((props ->> 'sl')::numeric) / sum((props ->> 'fr')::numeric), 1)
  from a_today where event = 'game_time' and (props ->> 'fr')::numeric >= 120;
select sum((props ->> 'rq')::numeric), sum((props ->> 'rqf')::numeric + (props ->> 'rq5')::numeric), sum((props ->> 'rq4')::numeric) from a_today where event = 'sess_sum' and props ? 'rq';
select count(*) from public.analytics_events e where (e.skip = 0) <> exists (select 1 from a_ev a where a.id = e.id);
select count(*) from public.analytics_events a join public.analytics_events b
  on a.session_id = b.session_id and a.event = b.event and a.client_at = b.client_at and a.props = b.props and a.id > b.id;
```

The last two return 0: the stored flags agree with the hand rule for every row, and no duplicate is left.

## Known limits

- A party that is refused at the first try (full, or refused by the host) sends no event, so it is missing from the attempts. The lobby code would need one more event for that.
- Time to connect is measured from the last click or Enter in the lobby; a join started from an invite outside the lobby has no time.
- Two tabs of one account write one presence row, so the game shown for that player follows the tab that reported last.
- Events with a name that is not on the allow-list (`private.an_events`) are dropped on arrival. A new event name needs a row in that table.
