# Stats audit (admin Stats tab: Overview and Player data)

Paths: client `w/new/*.js`, game `rl/seg/*.js`, SQL `w/supabase/*.sql`. Every event goes through `track()` (`tail.js`) → `sbSink` (`auth.js`) → `public.analytics_events` (one row per event, `props` jsonb). Player data events are only stored for visitors who accepted cookies.

Status: **works** = chain was complete; **fixed** = a link was broken and is repaired in this round (needs `round10_stats.sql` run for SQL fixes); **no data yet** = chain complete, but the thing has not happened yet (the dashboard now says why instead of an empty box).

## Overview (`admin_stats_v2` → `admin_stats()` + series)

| Metric | Emitted where | Stored | Aggregated | Status |
|---|---|---|---|---|
| Live now, games being played | Supabase realtime presence (`social.js`) | not stored (live) | client `stLive` | works |
| Active 7 / 30 days | every event | analytics_events | `admin.overview` | works |
| Active players / signed in per day | every event | analytics_events | `admin_stats_v2.series` | works |
| Peak online per day | `admin_presence_sample` while an admin has the dashboard open | presence_samples | `series.peak` | works (only sampled while an admin is on the page; caption says so) |
| Sessions per day | every event (`session_id`) | analytics_events | `series.sessions` | works |
| Hours played per day, share of playtime | `game_time` (`tail.js ttCommit`) | analytics_events | `series.hours`, `game_hours` | works |
| New accounts per day | Supabase auth sign-up | auth.users | `series.signups` | works |
| Game launches per day, per-game sparkline | `game_launch` | analytics_events | `series.launches`, `game_days` | works |
| Game card: launches, players, rounds, hours, avg min, accounts, errors, last launch, last error, top players | `game_launch`, `game_play`, `game_time`, `error`; `game_stats` sync | analytics_events, game_stats | `admin.most_played_games`, `most_time_played`, `account_game_totals` | works |
| Devices | `session` event | analytics_events | `device_split`, `admin.devices` | works |
| Recent errors | `error` | analytics_events | `admin.recent_errors` | works |
| Top searches | `search` | analytics_events | `admin.top_searches` | works; now bars, "no result" pill kept |
| Players coming back | every event | analytics_events | `admin.retention` | works; now a cohort table, "next day" shows "—" (too early) for today's cohort instead of a false 0% |

## Player data (`admin_insights` + `admin_insights_more`)

| Metric | Emitted where | Stored | Aggregated | Status |
|---|---|---|---|---|
| Coverage line | `env_dev`, `env_geo` | analytics_events | `coverage` | works |
| Stickiness, back next day / 7 / 30 days, at risk, streaks, top streaks, churn list | every event | analytics_events (`admin.events_who`) | `retention` | works. Back after 7 / 30 days: no data yet until the first visitors are 7 / 30 days old (tile now says so) |
| Funnel | `game_launch`, `game_time`, auth.users | | `retention.funnel` | works. The "686 %", "114 %" values were a display bug: count and percent were glued ("6" + "86 %"). **Fixed** in every list (`6 · 86%`) |
| Games table: sessions, quits < 30 s, avg session, FPS, input | `game_quit` (`track.js trEnd1`) | analytics_events | `games` | works |
| Games table: load | `game_launch` with `lazy`, `ms` | | `games.load` | works; "—" now explains the game is part of the page (nothing to download) |
| Games table: scores | `api.submit` (`sc`) and `api.score` (`last`) in `game_quit` | analytics_events | was `sc` only; most games only call `api.score` | **fixed**: `admin_insights_more.scores` uses `sc`, else the last score shown. Games that never report a score show "—" with an explanation |
| Games table: level | overlay stats named level / wave / stage / floor / round / lap | `game_quit.lv` | `games.lv_*` | **fixed** partly: also reads world / chapter / zone / tier / night / day. Games without a level show "—" with an explanation |
| Games table: votes | thumbs prompt (`track.js trAsk`) → `vote_game` | game_votes | `votes` | **fixed**: the prompt only appeared on game-over screens that have stats, which most games do not have. It now also appears on any game overlay after 90 seconds of play |
| Rocket League matches finished | `rl/seg/09_ui.js uiXpCalc` → `uiRlLog(false)` → `rl_match` | analytics_events | `rl.all`, `rl.by_diff` | works, but only fires when the clock runs out. Nobody had finished a match: no data yet (card says so) |
| Rocket League matches left early | **new** `rl_left` from `uiRlLog(true)` in `showMenu`, `showTitle`, `startGame` and the game's destroy | analytics_events | `admin_insights_more.rl_left` | **fixed** (was not tracked at all) |
| Controls players rebind | `input.js inCaptured` and RL Controls tab (`09_ui.js`) → `rebind` | analytics_events | `rebinds` | works; nobody rebound yet: no data yet (card says so) |
| Click rate per slot / per game | `impr` (IntersectionObserver) and `tile_click` | analytics_events | `behaviour.slots`, `ctr` | works; now a heatmap strip instead of a 14-row table |
| Scroll depth, page time and exits, rage clicks, dead clicks | `scroll`, `page_time`, `rage`, `dead` | analytics_events | `behaviour` | works |
| Web Vitals | `vitals` on hide / close | analytics_events | `vitals` | works |
| Countries, regions, cities, ISPs, time zones, VPN, datacenter, data saver, speed class, download, latency, play-hours heatmap | `env_geo` (geojs.io + navigator.connection) | analytics_events | `geo` | works |
| Connection type | `env_geo.ctype` | | `geo.ctype` | **fixed**: only Chrome on Android reports it, so the row was dropped. The client now sends `unknown`, and the SQL counts old rows without it as unknown ("Not reported") |
| Time zone differs from location | `env_geo.tzm` | | was never aggregated | **fixed** (`flags.tzm`) |
| OS, browser, GPU, cores, memory, refresh rate, keyboard layout, architecture, main language, WebGL 2, WebGPU, ad blocker | `env_dev` | | `dev`, `ads.adblock` | works |
| Phone models | `env_dev.model` (UA-CH) | | `dev.models` | **fixed**: Safari and Firefox never send a model. Phones and tablets now send `iPhone`, `iPad` or `Unknown model`; the SQL derives the same for old rows from the OS version |
| Controllers, controller models | `gamepadconnected` → `pad` | | `dev.pads`, `pad_ids` | works; nobody has pressed a controller button yet: no data yet (card says so) |
| Sessions: count, median length, longest 10 %, games per session, different games, sessions with a game, length buckets | every event per `session_id` + `sess_sum` | analytics_events | `admin_insights_more.sessions` | **fixed**: these were computed only from `sess_sum`, which started with round 9 ("Sessions measured 1"). They now come from all events of every session (span of the session, `game_launch` count), with `sess_sum` used when it is longer |
| Median time actually looking | `sess_sum.vis` | | `sessions.vis` | **fixed** (client bug): the visible time was counted in the `visibilitychange` listener that ran after the summary was sent, so most summaries said 0 s. `trVis()` now updates it before every summary; SQL ignores the old zero values |
| Keys, clicks, taps, mouse travel, wheel, scroll distance, tab switches, copies, resizes, went offline, JS errors, full screen, idle | `sess_sum` | | `sessions` | works (wheel, scroll, focus/blur, copies, resizes, offline were sent but never shown: **fixed**) |
| Account state, accounts-server route, theme | `sess_sum` | | `acct`, `route`, `theme` | works |
| Site language | `sess_sum.lang` | | was never aggregated | **fixed** (`slang`) |
| Arrived from | `env_caps.ref` | | `refs` | **fixed**: an empty referrer was dropped, so direct visits were invisible. The client sends `direct`, the SQL counts old rows without a referrer as direct |
| First page, page opened by | `env_caps.land`, `navt` | | `land`, `navt` | works |
| Why joining a party needed a retry | `net.js` → `party_retry` | | `retries` | **fixed** partly: failures to create the peer were retried without being recorded; they are now recorded as `peer-<reason>`. No retries happened yet: no data yet (card says so) |
| Screen resolution, window size, pixel density, pointer, touch points, orientation, colour range, depth, display mode, dark mode, reduced motion, HDR, hover, several screens | `env_scr` | | `admin_insights_more` | works |
| Browser zoom | `env_scr.zoom` | | `zoom` | **fixed**: it was `outerWidth / innerWidth`, which on phones compares device pixels with CSS pixels (4.14) and is also wrong with docked DevTools. Now measured on computers only, in the top window, snapped to a real zoom step and dropped if it is more than 3 % off; the SQL applies the same filter to old rows |
| More contrast, forced colours, reduced transparency | `env_scr` | | was never aggregated | **fixed** (`flags`) |
| Speed test, battery, charging, storage, JS memory, WebGPU adapter, texture size, platform, region, clock, notifications, mic, cam, voices, sample rate, bots, DNT, GPC, AV1, HEVC, VR, cross-origin isolation | `env_caps` | | `admin_insights_more` | works (battery, memory and WebGPU only exist in some browsers; rows say so) |
| WebAssembly, shared memory, service workers, vibration, Bluetooth, USB, serial, HID, MIDI, share menu, keep awake, PDF viewer, H.264, VP9, storage kept, cookies, accounts server down, speakers, audio channels, WebGL extensions, calendar, number system, first weekday, browser maker, history length | `env_caps` | | were never aggregated | **fixed** (`flags`, `extra`) |
| Ads: impressions, clicks, revenue | `Ameplay.ads.watch / revenue` | | `ads.slots` | no data yet: there are no ad slots on the site (section says so) |

## SQL

All SQL changes are in `w/supabase/round10_stats.sql` (also appended to `schema.sql`): it only replaces `public.admin_insights_more`. Run it once in the Supabase SQL editor. Until it runs, the dashboard still works with the round 9 data and shows a note in the Sessions section.
