# Handoff: fix, harden and extend maps-server

## 1. Mission

You are taking over improvement work on **maps-server**, also called buphagus. It is a public-transport routing engine written in Rust by Naoise McG, licensed AGPL-3.0, at https://gitlab.com/buphagidae/maps-server.

Your work, in order:
1. Fix the confirmed bugs.
2. Make the server robust and lighter on memory.
3. Document it.
4. Add the Tier 1 features.
5. Write proposals for the Tier 2 features.

Every bug below was reproduced on commit `51779c0` (2026-09-24). A reproduction kit comes with this prompt.

## 2. What you receive

- **The maps-server repository.** If your copy is newer than `51779c0`, re-check each finding before fixing it, because line numbers may have moved. Each reference also names the function it lives in, so you can find it again.
- **`maps-server-review/repro/`**, the reproduction kit:

  | File | What it is |
  | --- | --- |
  | `fixture.osm`, `fixture.osm.pbf` | A 5-node test map (layout below). The `.osm` file is the readable source; regenerate the PBF with `osmium cat -O fixture.osm -o fixture.osm.pbf`. |
  | `fake_plugin.py` | A scripted plugin that speaks the NDJSON protocol. Python 3.9+, standard library only. Its behaviour comes from a JSON scenario passed as `argv[1]`: `mode`, `available`, and `explore` (a map from station ID to a list of `{to, offset, cost, line?}`, where the departure is the requested time plus `offset` seconds). |
  | `repro.rs` | 19 tests that call the real code. 15 fail on `51779c0`, each for the reason given in its message. 4 `control_` tests pass and show that the fixture works. |
  | `run_repro.py` | Runs the tests on a copy of any checkout and prints one line per test: `python3 run_repro.py /path/to/maps-server`. It needs cargo, and never touches Docker or the network. |

- **Fixture layout.** Distances are along the equator, at the default walking speed of 1.38 m/s.
  - Footway `3 — 1 — 2`: node 3 is 300 m west of node 1, and node 2 is 3.0 km east of node 1 (a 36-minute walk).
  - Footway `700 — 701`, 11 m long, far away from the first footway.
  - Stations are virtual IDs (100, 200, 300, 400, 500, 600, 800) that exist only in station-access maps: station 100's entrance is node 3, and station 200's entrance is node 2. Node 700 is a station node that lies on a footway.

- **Real extracts for measurements.** These are old snapshots, which is fine for relative numbers. The data is ODbL, © OpenStreetMap contributors.
  - https://raw.githubusercontent.com/graphhopper/graphhopper/master/core/files/andorra.osm.pbf
  - https://raw.githubusercontent.com/graphhopper/graphhopper/master/core/files/monaco.osm.gz. Convert it with `osmium cat monaco.osm.gz -o monaco.osm.pbf`; osmium is in the dev shell.

## 3. How it works today

- **Startup** (`main`, main.rs:491):
  1. Create or reuse the Docker container `overpass_api`, which imports `./assets/<OSM_PBF_FILES>`.
  2. Wait until Overpass answers on port 12345.
  3. List the plugins with `nix eval .#apps.<system>.plugins` and start each one with `nix run`.
  4. Send each plugin `mode` and `attribution`, then send all of them `available`.
  5. Listen on `0.0.0.0:6767`, one thread per connection.

  The walking graph is built lazily, on the first request.
- **Plugin protocol.** One JSON object per line on stdin and stdout.
  - Requests: `{"action": "...", "data": ...}`.
  - Replies: `{"response": ...}` or `{"error": "..."}`.
  - `available` returns `{"<station id>": [entrance ids]}`.
  - `explore` receives `{"station": <int>, "datetime": "YYYYmmddTHHMMSS"}` and returns `[{"to", "cost", "time", "line": {"id", "preferred_colour", "ways"}}]`, with one entry for every later stop of each vehicle.
  - The server never sends the optional `duration`. The reference plugin, https://gitlab.com/buphagidae/plugins/sncf-plugin `main.py`, uses integer IDs and defaults `duration` to 7200 seconds.
- **HTTP API.** `POST /` with this body:

  | Field | Type, unit and default |
  | --- | --- |
  | `required_nodes` | array of OSM IDs, at least 2 |
  | `time` | `YYYYmmddTHHMMSS` in UTC, default now |
  | `walking_speed` | km/s, default `0.00138` |
  | `heuristic` | integer: 0 or absent turns the walking estimate on, non-zero turns it off |

  It returns `{"route": [{"mode", "line", "nodes", "departure_time", "arrival_time"}], "arrival_time"}`. Times in the response are RFC 3339. The response also carries `Attribution` and `Source-Code` headers, and CORS headers for any origin.
- **Search** (`a_star_time_dependent`, route.rs:148). It runs one A* per pair of consecutive required nodes. Each state is `(node, arrived_by_transit)`. The moves are:
  - Walking edges from the graph: distance divided by walking speed.
  - Station to entrance, 0 s.
  - Entrance to station, 0 s, except back to the node it came from.
  - From a station, legs returned by the plugins. The plugins are queried at arrival + 60 s (route.rs:283). Legs that depart before the arrival are dropped, and so are legs from the plugin the traveller arrived with.

  The A* estimate is straight-line distance divided by walking speed (route.rs:401).

## 4. Ground rules

- Keep the SPDX headers and match the existing style. The code has no comments besides the SPDX headers, so do not add any.
- Existing plugins must keep working unchanged: integer IDs, no handshake, no request IDs. Do not change the protocol in Tier 1.
- Existing request fields must keep working. Every change in behaviour goes into `CHANGELOG.md`.
- Tests must not need Docker, Nix or the network.
- Work on a branch. Make one commit per task, starting with its ID, for example `B3: return 400 for invalid requests`.
- Every commit from Phase 0 on must pass `cargo fmt --check`, `cargo clippy --all-targets -- -D warnings` and `cargo test`. If Nix is available, also run `nix build` and `nix flake check`. Report any check you could not run.
- Fixing a bug means its repro test passes. Until then, the test carries `#[ignore = "<bug ID>"]`; remove the ignore in the commit that fixes the bug. Never weaken or delete a repro test. If a decision changes what a test expects, update the assertion and say so in the commit message.
- Justify every new dependency in your final report.

## 5. Decisions already made

| Topic | Decision |
| --- | --- |
| Errors | Reply `{"error": "<message>"}` with `400` for bad input, `404` when there is no route, `503` when the server is not ready, and `500` for internal errors. Never drop a connection without an answer. |
| IDs | Plugins send integers. The server accepts integers and numeric strings, keeps sending integers, and the README is corrected. |
| HTTP layer | Move to `axum` on the existing tokio runtime. Run route computation and plugin calls in `spawn_blocking`. Keep the port, CORS behaviour and headers. |
| Configuration | Environment variables, each defaulting to today's behaviour: `MAPS_BIND=0.0.0.0:6767`, `MAPS_OVERPASS_IMAGE=wiktorn/overpass-api:v0.7.62.9`, `MAPS_OVERPASS_READY_TIMEOUT_S=21600`, `MAPS_PLUGIN_TIMEOUT_S=30`, `MAPS_MIN_TRANSFER_S=60`, `MAPS_MAX_PLUGIN_CALLS=1000`, `MAPS_MAX_EXPANDED=5000000`, `MAPS_HORIZON_H=24`, `MAPS_MAX_REQUIRED_NODES=25`, `MAPS_MAX_BODY_BYTES=65536`, `MAPS_SOURCE_URL=https://gitlab.com/buphagidae/maps-server`, `MAPS_MAX_SPEED_KMH=300`, `MAPS_CACHE_TTL_S=120`. Keep `OSM_PBF_FILES` and `OSM_PBF_FILE_NAME`. |
| Overpass port | Publish it on `127.0.0.1` only. |

## 6. Ask the owner first

Send these questions together in one message. If you cannot reach the owner, use the recommended option and list it in your final report.

- **Q1. Default search mode (B6).** Today the default uses the walking estimate, which can return a 36-minute walk when a 20-minute train exists (test `default_search_takes_the_faster_train`). Measured on walking-only routes, the estimate explores 54% as many nodes as plain Dijkstra on Andorra (an 8.5-hour walk: 15,764 nodes against 29,397) and 72% on Monaco (a 56-minute walk: 3,250 against 4,522), with identical answers. A safe estimate (distance divided by 300 km/h) prunes almost nothing, so exact search costs about as much as Dijkstra. **Recommended:** exact by default, with `"fast": true` to opt in to the walking estimate.
- **Q2. Changes between two vehicles of the same plugin (B8).** Is blocking them deliberate? **Recommended:** allow them, as described in B8. The long-term fix is `trip_id` in protocol v2 (F8).
- **Q3. Tier 2 features.** Which ones should get a design note (F8–F16)?

## 7. Task index

| ID | Task | Size | Needs | Repro tests that must pass afterwards |
| --- | --- | --- | --- | --- |
| T1 | Turn the repro kit into permanent tests | S | – | all 19 run in `cargo test` |
| T2 | Make `route.rs` testable without the global graph | M | T1 | – |
| T3 | Lint baseline | S | – | – |
| B1 | Overpass image never found on a fresh machine | S | – | – |
| B2 | Replace the hand-written HTTP handling | M | T1 | `a_body_sent_in_a_second_packet_is_read`, `long_headers_do_not_cut_the_body` |
| B3 | Validate input and return real errors | S | B2 | `invalid_json_gets_400`, `missing_required_nodes_gets_400`, `zero_walking_speed_gets_400`, `unparsable_time_gets_400`, `unreachable_destination_gets_404` |
| B4 | Validate plugin data | S | – | `negative_costs_never_arrive_before_departing`, `string_ids_from_plugins_are_accepted`, `string_entrance_ids_from_plugins_are_accepted` |
| B5 | Ask every plugin that serves a station | M | T2 | `every_plugin_serving_a_station_is_asked` |
| B6 | Fix the search default and the `heuristic` flag | S | Q1 | `default_search_takes_the_faster_train`, `heuristic_true_and_heuristic_1_mean_the_same` |
| B7 | Show changes between vehicles in the result | S | – | `a_change_between_vehicles_stays_visible` |
| B8 | Allow changes between two vehicles of one plugin | S | Q2, B5 | `a_change_between_two_vehicles_of_one_plugin_is_possible` |
| B9 | Fix the Source-Code header and add OpenStreetMap attribution | S | – | – |
| B10 | Make the README's protocol and setup true | S | – | – |
| R1 | Build the graph at startup and check the input files | S | T2 | – |
| R2 | Plugin timeouts, restarts and locking | M | B5 | – |
| R3 | Overpass readiness timeout | S | – | – |
| R4 | Stable PBF hash | S | – | – |
| R5 | Search limits | M | B5 | – |
| R6 | Parse `nix eval` output as JSON | S | – | – |
| R7 | Walkability rules | S | T2 | – |
| P1 | Graph memory | M | T2 | – |
| P2 | Exploration cache | M | B5 | – |
| C1 | Dependencies | S | – | – |
| C2 | Examples | S | – | – |
| C3 | README rewrite | M | all of B and R | – |
| C4 | CHANGELOG and CI | S | – | – |
| F1–F7 | Tier 1 features | – | phases 0–4 | – |
| F8–F16 | Tier 2 proposals | – | Q3 | – |

The 4 control tests must keep passing throughout.

## 8. Phase 0: foundation

### T1. Turn the repro kit into permanent tests
- Move `repro.rs` into the crate as a test module, `fixture.osm` and `fixture.osm.pbf` into `tests/fixtures/`, and `fake_plugin.py` into `tests/`. You may port the fake plugin to a small Rust binary instead; CI then needs no Python.
- Until T2 lands, the tests need the fixture in `assets/` and `OSM_PBF_FILES=fixture.osm.pbf`, which is what `run_repro.py` sets up. After T2, they build their own `Graph` and need neither.
- Mark each of the 15 failing tests `#[ignore = "<bug ID>"]`, using the IDs in the task index, so that `cargo test` stays green.
- The HTTP tests call `handle_client` on a real socket. After B2, port them so they start the real server on `127.0.0.1:0` and send raw bytes; the split-packet and long-header cases must stay.
- **Done when** `cargo test` passes with the 4 controls running and 15 tests ignored, and `cargo test -- --ignored` shows those 15 failing.

### T2. Make `route.rs` testable without the global graph
- `route_with_schedule`, `a_star_time_dependent` and `heuristic_seconds` take a `&Graph` parameter instead of reading `GRAPH` (route.rs:75).
- Add `Graph::from_parts(nodes, edges)` for in-memory test graphs.
- Group the A* inputs (stations, entrance map, walking speed, search mode, limits, minimum transfer time) into one struct. This also fixes clippy's `too_many_arguments`.
- Delete `explored_nodes` (computed, then discarded at main.rs:307), or expose it only to tests.

### T3. Lint baseline
- Run `cargo fmt` and fix the 13 clippy warnings: `collapsible_if` ×6, `needless_return` ×3, `ptr_arg`, `let_unit_value`, `match_like_matches_macro`, `too_many_arguments`.
- **Done when** `cargo clippy --all-targets -- -D warnings` is clean.

## 9. Phase 1: bugs

### B1. Overpass image never found on a fresh machine
- **Where:** `flake.nix:30-36` (`overpassImage`, tag `v0.7.62.9`), `flake.nix:54` (the wrapper), `main.rs:190` (`start_overpass_container`).
- **Now:** The wrapper checks `docker image inspect wiktorn/overpass-api`, which means `:latest`, so it reloads the pinned image on every run. The code then creates the container from `:latest`. The Docker create API does not pull images, so a machine without `:latest` fails with "No such image".
- **Change:**
  - The wrapper checks and loads the exact pinned reference, and exports `MAPS_OVERPASS_IMAGE`.
  - `start_overpass_container` reads `MAPS_OVERPASS_IMAGE`, with the pinned tag as the default.
  - If the container exists but was created from another image, recreate it and keep the `overpass_db` volume.
  - Check that `pullImage`'s `sha256` builds on every system the flake declares (`x86_64-linux`, `aarch64-linux`, `aarch64-darwin`, `armv7l-linux`). If one fails, give it its own hash or drop it from the list, and say which.
- **Done when** a machine with only the Nix-loaded image starts Overpass, and a second run skips `docker load`.

### B2. Replace the hand-written HTTP handling
- **Where:** `handle_client` (main.rs:219-372) and the listener (main.rs:507-524).
- **Now:** The request is read with one `read` into 2048 bytes (main.rs:220-222). A body that arrives in a second TCP packet, or a request over 2 KB, panics at main.rs:248.
- **Change:**
  - Use an axum router: `POST /`, plus `OPTIONS /` answered exactly as today (main.rs:233-237).
  - Enforce `MAPS_MAX_BODY_BYTES`.
  - Keep the `Attribution`, `Source-Code`, `Access-Control-Allow-Origin` and `Access-Control-Expose-Headers` headers byte-for-byte, except the changes from B9.
- **Done when** both repro tests pass and a browser `fetch` from another origin still works.

### B3. Validate input and return real errors
- **Where:** main.rs:248 and 252 (`expect` on bad JSON or a missing `required_nodes`), main.rs:311 (a bad `time` silently becomes now), main.rs:312 with route.rs:203-205 (`walking_speed` 0 overflows and panics), route.rs:123 with main.rs:340-343 (no route answers `200` with an empty route).
- **Change:** Return `400` with a precise message for:
  - invalid JSON;
  - `required_nodes` missing, not an array of integers, with fewer than 2 entries, or with more than `MAPS_MAX_REQUIRED_NODES`;
  - a `time` that does not parse (accept `YYYYmmddTHHMMSS`, and also `YYYY-mm-ddTHH:MM:SS` like `parse_journey_departure`);
  - a `walking_speed` that is not between 0.0003 and 0.01 km/s.

  Return `404` with `{"error": "no route", "failed_leg": [from, to]}` when a leg has no route.
- **Done when** the 5 repro tests pass.

### B4. Validate plugin data
- **Where:** main.rs:270 and main.rs:386 (`as_i64` drops string IDs), main.rs:288 (`cost as u64` turns negative costs into journeys that arrive before they depart).
- **Change:**
  - Add one helper that reads an ID from a JSON integer or numeric string. Use it for `to` and for the entrance lists.
  - Skip journeys whose `cost` is negative or not an integer, or whose `time` does not parse, logging the plugin name and the entry once per request.
- **Done when** the 3 repro tests pass.

### B5. Ask every plugin that serves a station
- **Where:** main.rs:298-300 (the `break` in the `fetch_outgoing` closure inside `handle_client`) and route.rs:289-293.
- **Now:**
  - The plugin loop stops at the first plugin that returns journeys.
  - Every plugin is asked about every station, even plugins that never listed it.
  - If the first plugin is the one the traveller arrived with, all its journeys are thrown away afterwards and the other plugins are never asked.
- **Change:**
  - `build_station_access_map` also returns `station → [plugin index]`.
  - `fetch_outgoing(station, time, exclude: Option<usize>)` asks only the plugins that serve the station, minus `exclude`, and merges their results.
  - Key the cache by (station, plugin, time).
- **Done when** `every_plugin_serving_a_station_is_asked` and its control pass, and a fake plugin that counts calls shows that plugins are not asked about stations they did not list.

### B6. Fix the search default and the `heuristic` flag
- **Where:** route.rs:380-381 (`heuristic_seconds` returns 0 when `use_heuristic` is true, so the flag is inverted), main.rs:253 (the field is read as an integer, so `true` becomes 0), route.rs:401 (the walking-speed estimate overestimates when transit is faster).
- **Change:**
  - Rename the internal flag so it says what it does.
  - Accept `heuristic` as a boolean or 0/1, with today's meaning: 1 or true turns the estimate off. Map it onto the new option.
  - Apply the Q1 decision. With the recommended option, the default is exact (no estimate, or distance divided by `MAPS_MAX_SPEED_KMH`, default 300), and `"fast": true` opts in to the walking estimate.
  - Document both modes and the trade-off.
- **Done when** both repro tests pass and the explored-node counts for both modes on Andorra appear in your report.

### B7. Show changes between vehicles in the result
- **Where:** `reconstruct_path`, route.rs:347-349.
- **Now:** Consecutive edges with the same mode and the same `line.id` (including `None`) are merged. Two trains with no line ID become one segment, and the change and the waiting time disappear.
- **Change:** Merge only consecutive walking edges. Each transit leg is its own segment.
- **Done when** `a_change_between_vehicles_stays_visible` passes.

### B8. Allow changes between two vehicles of one plugin
- **Where:** route.rs:289-293 (legs from the plugin the traveller arrived with are skipped) and route.rs:253-258 (no walking from an entrance back to its station).
- **Now:** After arriving at station B with plugin P, no other P vehicle can be taken from B. It works only if B's node lies on a footway (the control test proves this).
- **Recommended change (Q2):**
  - Drop the same-plugin skip. Pass `exclude = None` from transit states, and keep querying at arrival + `MAPS_MIN_TRANSFER_S`.
  - Staying on the same vehicle can never beat the direct leg that the earlier station already listed. Plugins list every later stop, and `is_better_arrival` uses a strict `<`, so the first leg wins. Results stay correct.
  - The cost is one extra plugin call per transit arrival, which the R5 limits bound.
- **Done when** the repro test and its control pass.

### B9. Fix the Source-Code header and add OpenStreetMap attribution
- **Where:** main.rs:352 and main.rs:334-337.
- **Now:** The header points to `https://gitlab.com/buphagidae/buphagus`, which returns 404 for anonymous users. Under the AGPL, this header is how network users are offered the source. The attribution text credits the plugins but not OpenStreetMap, which the walking graph and every node ID come from.
- **Change:** Use `MAPS_SOURCE_URL`, defaulting to the real repository. Add "Map data © OpenStreetMap contributors, ODbL" to the attribution.

### B10. Make the README's protocol and setup true
- The example flake's inputs (README.md:25-28) use `https://…git`, which Nix treats as an archive and rejects with "Unrecognized archive format". Use `git+https://…git`.
- README.md:68 says `available` is always called first, but `load_plugins` sends `mode` and `attribution` first (main.rs:441-442). Either send `available` first, or correct the README; prefer correcting the README, since existing plugins already cope.
- The README shows IDs as strings; plugins use integers. Fix it per the IDs decision in section 5.
- The README mentions SSH keys, but every URL is https. Mention SSH only for private inputs.

## 10. Phase 2: robustness

### R1. Build the graph at startup and check the input files
- Before touching Docker, check that every file in `OSM_PBF_FILES` exists in `./assets`, and list any missing ones.
- Build the graph before binding the listener (today it is built lazily, route.rs:75). A load failure must stop startup with a clear message instead of making every request panic.
- Return `503` until the server is ready.

### R2. Plugin timeouts, restarts and locking
- **Where:** `Plugin::send_request` (main.rs:63-78), the single lock at main.rs:263, spawning at main.rs:433-457, and shutdown at main.rs:496-500.
- **Change:**
  - Build requests with `serde_json`, not `format!`.
  - Read replies with a `MAPS_PLUGIN_TIMEOUT_S` timeout (a reader thread with a channel works).
  - On a timeout, EOF or broken pipe, mark the plugin dead, restart it, and replay `mode`, `attribution` and `available`.
  - Use one lock per plugin.
  - Log plugin stderr with the plugin's name.
  - Kill the children on shutdown, and handle SIGTERM as well as Ctrl-C.
- **Done when** a test with a fake plugin that sleeps forever gets an answer within the timeout, and the other plugins keep answering.

### R3. Overpass readiness timeout
- `wait_for_overpass_ready` (main.rs:463-484) loops forever.
- Stop with an error after `MAPS_OVERPASS_READY_TIMEOUT_S`, or as soon as the container exits; show the last log lines.
- Print elapsed time every minute.

### R4. Stable PBF hash
- `calculate_pbf_hash` (main.rs:36-49) uses `DefaultHasher`, which is not guaranteed to stay the same across Rust releases. A toolchain update can wipe and re-import the Overpass database, which takes hours for large regions.
- Hash a canonical string of name, size and modification time with a fixed algorithm (`sha2`, or FNV-1a written by hand).
- When an existing container has an old-format label, also compute the old `DefaultHasher` value and accept a match, so upgrading does not trigger a re-import.

### R5. Search limits
- The search loop at route.rs:182 has no bound. An unreachable destination walks the whole region and calls the plugins at every station it reaches.
- Enforce `MAPS_MAX_EXPANDED` states and `MAPS_MAX_PLUGIN_CALLS` per request, and stop expanding states that arrive more than `MAPS_HORIZON_H` hours after the start.
- When a limit is hit, reply `404` with `{"error": "no route within limits", "limit": "<name>"}`.
- **Done when** a test with an unreachable destination and a fake plugin that counts calls stays within the limits.

### R6. Parse `nix eval` output as JSON
- `load_plugins` (main.rs:403-425) runs `nix eval --json` but parses the output by trimming brackets. Use `serde_json::from_slice::<Vec<String>>`.

### R7. Walkability rules
- `is_pedestrian_accessible` (route.rs:407-459) treats `highway=bus_guideway`, `busway`, `razed`, `disused` and `no` as walkable. It also rejects `indoor=corridor` without a `highway` tag, which is how many station interiors are mapped, and rejects `trunk` roads that have sidewalks.
- Fix these cases. Add one fixture-based or `from_parts` test per rule.

## 11. Phase 3: performance

### P1. Graph memory
- **Where:** `Graph::from_pbfs`, route.rs:467-529.
- **Measured baseline:**

  | Extract | Coordinates stored | Used by walkable ways | Share used |
  | --- | --- | --- | --- |
  | Monaco | 13,739 | 4,721 | 34% |
  | Andorra | 69,644 | 37,522 | 54% |

  Peak memory for Andorra is 16.8 MB, against 11.0 MB for the empty fixture, so the graph takes about 5.8 MB (about 85 bytes per node in the file). Memory grows linearly with the extract.
- **Change:**
  - First pass: collect the node IDs used by walkable ways.
  - Second pass: store coordinates only for those nodes and for the nodes the stations and entrances need. Plugins report those after the graph is built, so either keep nodes tagged `public_transport`, `railway` or `entrance`, or load the extra coordinates later.
  - Use dense `u32` indices, `f32` coordinates, and CSR adjacency (offsets plus an edge array) instead of a `HashMap` of `HashMap`s.
  - Consider decoding with `osmpbf`'s `par_map_reduce`.
- **Done when** the graph's share of peak memory on Andorra is at most half of today's, load time does not regress, all tests pass, and the before and after numbers appear in your report.

### P2. Exploration cache
- The cache at main.rs:255-305 lives for one request and is keyed by the exact second, so it almost never hits.
- Share it across requests, keyed by (station, plugin, window start rounded down to 5 minutes), with a TTL of `MAPS_CACHE_TTL_S` (default 120) so realtime data stays fresh.
- Keep filtering departures before the requested time (route.rs:295).
- Report the hit rate on a repeated request.

## 12. Phase 4: cleanup and docs

### C1. Dependencies
- In `Cargo.toml`, add `features = ["derive"]` to `serde`. Today it builds only because another crate turns that feature on.
- Drop `serde_core` and use `serde::de::Error`.
- Replace `ctrlc` with `tokio::signal` (this goes with R2).
- Run `cargo update`.

### C2. Examples
- Replace the `test` file with an executable `examples/requests.sh`.
- Use 4-digit years: the current `260808T131000` examples do not parse.
- Write one request per line, with no commented-out lines, and include expected status codes.

### C3. README rewrite
Cover, in this order:
1. What it is.
2. Requirements, including RAM: measure and give a rule of thumb from P1.
3. First-run import time.
4. Setup, using the corrected flake.
5. Configuration: every `MAPS_*` variable.
6. The HTTP API: every field with its type, unit and default, the response shape, every error code, and the headers.
7. The plugin protocol: the true call order, integer IDs, `duration`, every later stop per vehicle, and error replies.
8. Attribution and licence.

Also fix the typos: "Delimitted", "bottle neck", `http:localhost:12345`, and the `http:6767` log line at main.rs:509.

### C4. CHANGELOG and CI
- `CHANGELOG.md` lists every behaviour change: the new default search mode, the new status codes, the Overpass bind address, and the new options.
- `.gitlab-ci.yml` runs fmt, clippy and test, with Python available if the fake plugin is still Python. An optional job runs `nix build`.

## 13. Phase 5: features

### Tier 1: build these after Phase 4, additive only

| ID | Feature | Specification | Done when |
| --- | --- | --- | --- |
| F1 | `GET /health` | `{"status": "ok"\|"degraded", "uptime_s", "graph": {"nodes", "edges"}, "overpass": "up"\|"down", "plugins": [{"name", "mode", "alive", "calls", "errors", "avg_ms"}]}`. `200` when everything is up, `503` otherwise. | A test with a killed fake plugin gets 503. |
| F2 | Accurate attribution | Add `"attribution": [{"plugin", "data_owner", "data_license", "plugin_owner", "plugin_license"}]` to the response body, sorted, listing only plugins used in the returned route, plus the OpenStreetMap entry. The header carries the same text. | A two-plugin test lists only the plugin that was used. |
| F3 | Coordinates in and out | Accept `"waypoints": [[lat, lon], ...]` as an alternative to `required_nodes`. Snap each one to the nearest walkable node with an R-tree (`rstar`), and reject snaps further than `max_snap_m` (default 500) with `400`. Add `"snapped": [{"input", "node", "distance_m"}]` to the response, and `"coordinates": [[lat, lon], ...]` to every segment (a station without its own coordinates uses its first entrance). With `"format": "geojson"`, return a FeatureCollection with one LineString per segment and the segment fields as properties. | Fixture tests for snapping, rejection and GeoJSON validity. |
| F4 | Routing options | `min_transfer_s` (overrides the 60 s at route.rs:283), `max_walk_m` per leg, `transfer_penalty_s` added per change, `exclude_modes: ["bus", ...]`, `avoid_steps: bool` (store a steps flag per edge, drop `highway=steps`). All optional, with defaults equal to today's behaviour. | One test per option. |
| F5 | Plugin checker | `maps-server check-plugin <flake attr>`: start the plugin, run `mode`, `attribution` and `available`, then `explore` on 3 stations at the current time. Check types, the time format, `cost >= 0`, that every `to` is in `available`, a line `id` or `preferred_colour` that is a valid hex colour, and response time. Print a report and exit non-zero on problems. Also publish JSON Schemas for every request and reply in `docs/plugin-protocol/`. | Passes on `fake_plugin.py` and flags a deliberately broken scenario. |
| F6 | Config file | Optional `maps-server.toml` holding every `MAPS_*` setting. Precedence: environment, then file, then defaults. Print the effective configuration at startup, with secrets hidden. | A test of the precedence order. |
| F7 | Observability | `GET /metrics` in Prometheus text format (requests by status, latency histogram, plugin calls, errors and latency by plugin, cache hit rate, expanded states). Use `tracing` with a request ID per request, replacing `println!`. | Metrics change after a request in a test. |

### Tier 2: proposals only

For each feature the owner picks in Q3, write `docs/proposals/F<n>.md`: goal, API sketch, protocol impact, algorithm, cost, risks and test plan. Do not build them without approval.

- **F8. Plugin protocol v2, backward compatible.**
  - A `hello` handshake returning `{"protocol": 2, "capabilities": [...]}`. A plugin that answers with an error is treated as v1.
  - `id` echoed in every reply, to detect replies that get out of step.
  - `explore_many` for batching several stations into one call.
  - `duration` honoured.
  - `trip_id` per journey, which gives B8 an exact same-vehicle rule.
  - Optional `delay_s` and `realtime` per journey.
- **F9. Alternatives.** Up to k routes (fastest, fewest changes, least walking) with Pareto labels of (arrival, changes, walking metres).
- **F10. Arrive-by search** (`arrive_by` instead of `time`). This needs reverse exploration in the protocol, or repeated forward searches.
- **F11. Isochrones.** `POST /isochrone {from, time, max_minutes}` returns the reachable nodes with arrival times, plus a concave hull as GeoJSON.
- **F12. Station search.** `GET /stations?q=&near=lat,lon`, with names read once from the local Overpass for the `available` IDs and cached.
- **F13. Graph cache on disk,** keyed by the R4 hash, so startup takes seconds.
- **F14. Demo page at `GET /`.** Leaflet: click two points, then draw the route coloured by `preferred_colour`. Builds on F3.
- **F15. Step-free routing** using `wheelchair=*`, `highway=steps`, `incline` and `kerb`.
- **F16. Public deployment protection.** An optional `MAPS_API_KEY`, and per-IP rate limits.

## 14. Final report

Reply with:
1. One table row per task: ID, commit hash, what changed, tests added.
2. The output of `cargo test` and clippy, plus any checks you could not run.
3. The measurements: explored nodes for both search modes (B6), memory and load time before and after (P1), and the cache hit rate (P2).
4. Every behaviour or protocol change, copied from `CHANGELOG.md`.
5. The decisions you made without the owner, and anything you skipped or are unsure about.
