# maps-server: final report

This is the report section 14 of `prompt.md` asks for. The work started from `gitlab:buphagidae/maps-server` at commit `51779c0`, imported unchanged into `NaoiseGabi/maps-server/` in this repository, and then followed the prompt with one commit per task, each starting with its ID.

To move the work to GitLab, `git subtree split --prefix=NaoiseGabi/maps-server` turns the folder's history into a branch that can be pushed to the maps-server repository.

The owner's answers to section 6:
- **Q1:** exact search by default, `"fast": true` to opt in to the walking estimate.
- **Q2:** allow changes between two vehicles of one plugin.
- **Q3:** design notes for F9 to F16, not F8.

## 1. Tasks

| ID | Commit | What changed | Tests added |
| --- | --- | --- | --- |
| – | `43a495f` | Import of `51779c0` and the review kit. The kit reports 15 bugs and 4 passing controls. | – |
| T3 | `8df175c` | `cargo fmt`, and the 13 clippy warnings fixed; the A* inputs move into a struct. Done before T1, so every later commit passes `clippy -D warnings`. | – |
| T1 | `d06114f`, `0d2dac8` | The 19 repro tests become `src/repro.rs`, with fixtures in `tests/fixtures/` and the fake plugin in `tests/`. The 15 failing ones were `#[ignore = "<bug>"]`. Python is added to `nix build`'s check phase, whose tests would otherwise fail. | The 19 repro tests |
| T2 | `4691673` | The search takes `&Graph` and `SearchParams`; `Graph::from_parts` added; `Stations` index; `explored_nodes` replaced by an expanded-state count. | – |
| B1 | `b53dc1a`, `35fa216`, `659d1a5` | The pinned image is used and loaded once; per-system `pullImage` hashes (amd64 keeps its hash, arm64 needs its own, armv7l has no image and is dropped); `nix flake check --all-systems` passes; Overpass is on 127.0.0.1 only. A recreated container keeps its import: the image keeps its "import finished" marker outside the volume, so the server carries it over. An unfinished import is redone cleanly. | Checked with Docker (see section 2) |
| B2 | `d450a97` | axum router on the tokio runtime; route work in `spawn_blocking`; `MAPS_BIND`, `MAPS_MAX_BODY_BYTES`. | 2 repro tests un-ignored; preflight, headers, 413, 405 |
| B3 | `a11c66b` | `parse_request` with precise `400`s; `404` with `failed_leg`; more time formats. | 5 repro tests un-ignored; validation table, time formats, 404 body, JSON 404 |
| B4 | `fdb7c7d` | `parse_id`, plus journey validation with one log line per plugin call. | 3 repro tests un-ignored; parser unit tests |
| B5 | `1912f4b` | Only plugins that serve a station are asked, and all of them are; cache keyed per plugin. | 1 repro test un-ignored; call-log test |
| B6 | `b57c5f7` | `SearchMode { Exact, Fast }`; exact by default with a 300 km/h estimate; `heuristic` accepts booleans; millisecond priorities. | 2 repro tests un-ignored; flag mapping table |
| B7 | `90e25ea` | Only walking edges merge; every vehicle leg is a segment. | 1 repro test un-ignored; walk and same-line tests |
| B8 | `5fd10b7` | The same-plugin skip is removed. | 1 repro test un-ignored; TER to TGV test |
| B9 | `d1b32f7` | `Source-Code` from `MAPS_SOURCE_URL` on every response; OpenStreetMap credit. | Header tests |
| B10 | `3a04bce` | README: `git+https://` inputs (checked with `nix flake metadata`), the real call order, integer IDs, SSH only for private inputs. | – |
| R1 | `327fece` | Map files are checked and the graph is built before anything else; `503` until ready. | 503, missing files, corrupt file, startup path |
| R2 | `3707e39` | Plugin processes with reply timeouts, restarts with replay, one lock per plugin, stderr logging, SIGTERM; `ctrlc` removed. | Hang, crash and restart, error reply |
| R3 | `7e004e4` | `overpass.rs`; readiness timeout, early stop with the container's logs, progress every minute; plain-text fatal errors. | Wait-loop and probe tests |
| R4 | `207fb63` | FNV-1a `pbf_hash`; old labels accepted, then relabelled while keeping the import. | Reference values, label tests |
| R5 | `208f271` | `MAPS_MAX_EXPANDED`, `MAPS_MAX_PLUGIN_CALLS`, `MAPS_HORIZON_H`; `404` naming the limit. | Unreachable destination stops at exactly 10 calls; the other limits |
| R6 | `284361a` | The `nix eval` plugin list is parsed with `serde_json`. | Parser test |
| R7 | `c1c8bb0` | Bus-only and dead roads are no longer walkable; corridors and trunk roads with sidewalks are. | `walkability.osm` fixture, one test per rule |
| P1 | `6325110` | `graph.rs`: two parallel passes, a CSR graph with `i32` coordinates, decode threads scaled to file size. | Existing tests; measurements in section 3 |
| P2 | `9cb22d8` | `cache.rs`: a cache shared across requests, keyed by (station, plugin, 5-minute window), with a TTL; failures are not cached. | Window, TTL, repeat request, TTL 0, crash |
| C1 | `3f480be` | `serde` derive feature, `serde_core` dropped, `cargo update`. | – |
| C2 | `558ffc6` | `examples/requests.sh` with expected status codes; the `test` file removed. | Run by hand |
| C3 | `97cf292` | README rewritten in the order asked. | – |
| C4 | `217f0bf` | CHANGELOG organised; `.gitlab-ci.yml`; `rust-version = 1.88`. | CI jobs run locally in the CI image |
| F1 | `1357867` | `GET /health`. | Up, killed plugin gives 503, counts, starting, no Overpass |
| F2 | `d08ede2` | The `attribution` list and header credit only the plugins the route used, plus OpenStreetMap. | Two-plugin test, walk test |
| F3 | `bc73d36` | `waypoints` snapped with an R-tree (`rstar`), `snapped`, per-segment `coordinates`, GeoJSON. | Snapping, rejection, input errors, coordinates, GeoJSON |
| F4 | `391ebc8`, `8c17659` | `min_transfer_s` (and `MAPS_MIN_TRANSFER_S`), `max_walk_m`, `transfer_penalty_s`, `exclude_modes`, `avoid_steps` (a steps flag per edge). | One test per option, plus validation and defaults |
| F5 | `604a7ed` | `maps-server check-plugin`; JSON Schemas in `docs/plugin-protocol/`. | A good plugin passes, a broken one is flagged, hang, missing program, arguments, schemas |
| F6 | `70def7d` | `maps-server.toml` (or `MAPS_CONFIG`); environment over file over defaults; effective configuration printed, secrets hidden. | Precedence, keys, errors, secrets, pinned image matches the default |
| F7 | `9804601` | `GET /metrics` (Prometheus); `tracing` with request IDs; `X-Request-Id`. | Metrics change after a request, format check, request IDs |
| F9–F16 | `7b34309` | Design notes in `docs/proposals/`, with an index. | – |
| – | `e06615f` | `run_repro.py` runs a checkout's own tests; READMEs list maps-server. | – |

## 2. Checks

All of these ran on the final commit:

```
$ cargo fmt --check                                  # no output
$ cargo clippy --all-targets -- -D warnings
    Finished `dev` profile [unoptimized + debuginfo] target(s)
$ cargo test
test result: ok. 103 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 1.53s
$ cargo test -- --ignored
test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 103 filtered out
$ nix build                                          # runs the 103 tests in its check phase
maps-server> test result: ok. 103 passed; 0 failed; 0 ignored
$ nix flake check --all-systems
all checks passed!
$ python3 ClaudeScripts/maps-server-review/repro/run_repro.py NaoiseGabi/maps-server
0 of 19 checks show a bug.        (the original 51779c0 still gives 15 of 19)
```

**Also checked by hand, with a Docker daemon and the Nix wrapper.** The test folder held the fixture map and the fake plugin packaged as a Nix app.
- On a Docker with no images, `nix run` loaded the pinned image, created the container from it on `127.0.0.1:12345`, and served routes; the second run skipped `docker load`.
- SIGTERM left no plugin process and stopped the container.
- An exiting image stops startup at once.
- A failed import is redone; switching to another image tag and back keeps the import; an old-format label is relabelled without a re-import.
- `maps-server.toml`, `/health`, `/metrics`, the logs, waypoints and GeoJSON work end to end.
- `examples/requests.sh` passes every error and CORS line; its `200` lines need the Provence extract they were written for.

**Could not run, or ran differently:**
- **GitLab CI itself.** Its fmt, clippy and test jobs ran locally in the same `rust:1.97` image, through Google's Docker Hub mirror because Docker Hub rate-limited the sandbox. The 1.88 check ran with `rustup` on the host.
- **`nix build` and `nix flake check`** ran with git-based `--override-input` for the four flake inputs, at the revisions in `flake.lock`, because this sandbox cannot download GitHub tarballs. The aarch64 packages were evaluated by `flake check --all-systems`, not built. The arm64 image hash was computed with `pullImage` and `arch = "arm64"` on x86_64.
- **Real plugins and real regions.** The SNCF plugin needs its upstream APIs, and Geofabrik is blocked here. Nothing was run against Provence data, and `check-plugin` was not run on a real plugin.

## 3. Measurements

All were taken with release builds on this 4-core sandbox, using the same node pairs as the review.

**B6, search modes** (walking only, identical answers in every mode):

| Extract and pair | Fast (walking estimate) | Exact (300 km/h estimate) | No estimate |
| --- | --- | --- | --- |
| Andorra 933698373 → 1407779212 (9 h 26 min walk) | 15,763 states | 29,319 states | 29,397 states |
| Monaco 25345350 → 1079750314 (56 min walk) | 2,600 | 4,532 | 4,535 |

On Andorra, exact mode took about 40 ms against about 20 ms for fast, after P1. The 300 km/h estimate prunes only 0.3% on walks, and `MAPS_MAX_SPEED_KMH=0` gives plain Dijkstra. F4's richer search states cost 10 to 20% on long exact searches, with identical expansions.

**P1, graph memory and load time.** The method is VmHWM before and after `Graph::from_pbfs` in a small harness; "share" is the review's method, peak minus the empty fixture's peak.

| Extract | Nodes stored, before → after | Graph size, before → after | Peak during load, before → after | Share, before → after | Load time, before → after |
| --- | --- | --- | --- | --- | --- |
| Andorra (69,644 nodes in the file) | 69,644 → 37,524 | about 12 MB retained → 1.3 MB | +13.8 MB → +5.0 MB | 13.3 MB → 4.4 MB (33%) | 56 ms → 36–42 ms |
| Monaco | 13,739 → 4,725 | → 0.2 MB | +2.9 MB → +2.0 MB | | 11 ms → 10–14 ms |
| North Bayreuth (58,631 nodes) | 58,631 → 13,366 | → 0.5 MB | +10.0 MB → +5.6 MB | | 54–58 ms → 45 ms |

My absolute peak numbers differ from the review's (5.8 MB for Andorra), because the review measured the whole server process. Both runs here used the same harness.

Decoding with all 4 cores loads Andorra in 28 ms but peaks at +9 MB, because each decoding thread holds a few MB of buffers. Threads are therefore scaled at one per 8 MB of PBF, so small extracts decode on one thread and large ones on all cores.

**P2, cache hit rate.** A repeated request (train and bus, 300 → 400 → 500) does 3 lookups with 3 misses and 3 plugin calls the first time, and 3 hits with 0 plugin calls the second time. That is 100% on the repeat and 50% over both. In the end-to-end run, `/metrics` showed `maps_cache_hit_ratio 0.5` after two identical requests.

## 4. Behaviour and protocol changes

The full list is the "Changed" section of `NaoiseGabi/maps-server/CHANGELOG.md`, and the new options are under "Added" there. In short:

- **Search.** The default search is exact, and `"fast": true` gives the old one. `heuristic` accepts booleans with its old meaning.
- **Status codes.** New: `400`, `404` (`no route` with `failed_leg`, or `no route within limits` with `limit`), `405`, `413`, `500` and `503`, all with a JSON `error`. A missing route used to be `200` with an empty route.
- **Overpass.** It is published on `127.0.0.1` only. The image is the pinned `MAPS_OVERPASS_IMAGE`, not `:latest`, and the `pbf_hash` label format changed (old labels are migrated without a re-import).
- **Response.** Every vehicle leg is its own segment. `Source-Code` points to the real repository and is on every response. `Attribution` credits OpenStreetMap and only the plugins the route used. Routes gain `attribution`, `coordinates` and, with waypoints, `snapped`.
- **HTTP details.** Connections are kept alive. Header names are lower case. The `204` preflight has no `Content-Length`. Every response has `X-Request-Id`.
- **Plugins.**
  - A plugin is asked only about stations it listed, and every plugin that listed a station is asked.
  - `explore`'s `datetime` is the requested time rounded down to 5 minutes.
  - Same-plugin changes are allowed.
  - Replies have timeouts, and broken plugins are restarted with `mode`, `attribution` and `available` replayed.
  - String IDs are accepted, and invalid journeys are dropped and logged.
- **Graph.** Walkability rules changed. Nodes that are neither walkable, station-like nor plugin stations are unknown and get `404` at once.
- **Startup.** The server listens before Overpass is ready and answers `503`. Map files are checked first. `armv7l-linux` is gone from the flake.

## 5. Decisions made without the owner, and open points

**Decisions:**
- **Where the code lives.** `NaoiseGabi/maps-server/` holds the owners' project; the review kit stays in `ClaudeScripts/maps-server-review/`. The import is a single commit, so GitLab history before `51779c0` is not carried over.
- **Licence headers.** New Rust, Python and shell files carry the project's SPDX header. They have no other comments, following both the handoff and this repository's rules.
- **Order.** T3 ran before T1 so that every commit passes clippy.
- **HTTP.** Oversized bodies get `413` rather than `400`, which is the standard code for it. Connections are kept alive, and header names are lower case (hyper, and allowed by HTTP).
- **`heuristic: 0`/`false`** keeps its old meaning, so it now selects fast mode.
- **New settings beyond section 5:**
  - `MAPS_PLUGIN_STARTUP_TIMEOUT_S` (900 s), because the SNCF plugin runs 90-second Overpass queries inside `available`, and a 30 s timeout would restart it forever.
  - `MAPS_CONFIG`, to name the config file.
  - `RUST_LOG`, to set the log level.
- **B5's `exclude` argument** was removed again in B8, because with Q2's answer it would always be empty.
- **B1.** Carrying `/db/init_done` into recreated containers was not in the prompt, but without it "keep the volume" re-runs the import, which then fails. The Nix wrapper no longer exports `MAPS_OVERPASS_IMAGE` (B1 asked it to), because with F6 an exported variable would override the config file. The server's default is the pinned tag, and a test keeps the two in step.
- **F4.** `max_walk_m` limits each single walk. `transfer_penalty_s` applies to each change between vehicles. The search keeps one best label per state, so with `max_walk_m` it can, rarely, miss a slower route that walks less; F9's label search would make it exact.
- **F1** adds a `ready` field, so that starting can be told apart from broken.
- **F3's R-tree** is built on the first waypoint request, so servers that never use waypoints pay nothing.

**New dependencies:**
- `axum` with only `http1` and `tokio`, the section 5 decision.
- `futures-util`, already in the build through bollard, to read Docker's log and archive streams.
- `rayon`, already in the build through osmpbf, for parallel PBF decoding.
- `rstar`, named in the F3 spec.
- `toml`, with only `parse` and `serde`, for F6.
- `tracing` and `tracing-subscriber`, with only `fmt` and `env-filter`, named in the F7 spec.

`ctrlc` and `serde_core` were removed.

**Open points:**
- **RAM and import time for a whole country** are estimates; only small extracts could be measured here.
- **Proposals.** The decisions left to the owner are listed in `NaoiseGabi/maps-server/docs/proposals/README.md`. In particular, F14 would change `GET /` from `405` to a page.
- **Real plugins.** `maps-server check-plugin` has only been run on the fake plugin. Running it on each real plugin is the quickest way to find protocol slips.
