# maps-server review

Reviewed: `gitlab:buphagidae/maps-server` at commit `51779c0` (2026-09-24), which is identical to the uploaded `maps-server-main.zip`.

It compiles with no compiler warnings and 13 clippy warnings (all style). It has no tests. Dependencies have only minor updates available.

Every finding has an ID that matches `prompt.md`. The evidence column says how each one was checked:
- **Test**: a test in `repro/` fails on this commit, for the reason shown.
- **Ran**: reproduced by running something.
- **Read**: found by reading the code.

## Bugs

| ID | What goes wrong | Where | Evidence |
| --- | --- | --- | --- |
| B1 | On a fresh machine the server cannot create the Overpass container: the flake loads the image as `:v0.7.62.9`, but the code asks for `:latest`. The pinned image is also reloaded on every run. | `flake.nix:30-36,54`, `main.rs:190` | Read |
| B2 | A request is read with one 2 KB read. A body in a second TCP packet, or a request over 2 KB, crashes the handler. | `main.rs:220-222` | Test: 2 |
| B3 | Bad JSON, a missing `required_nodes`, or `walking_speed: 0` crash the handler, so the client gets no answer. A wrong `time` silently becomes "now". "No route" comes back as `200` with an empty route. | `main.rs:248,252,311`, `route.rs:204` | Test: 5 |
| B4 | IDs sent as strings (as the README shows) are dropped. A negative `cost` produces a journey that arrives 8 minutes before it leaves. | `main.rs:270,288,386` | Test: 3 |
| B5 | Only the first plugin with departures is asked. A train-to-bus change is impossible if the train plugin also departs from that station. | `main.rs:298-300` | Test: 1, plus a control |
| B6 | `"heuristic": 1` turns the shortcut off, and `true` is read as 0. The default search returned a 36-minute walk when a 20-minute train existed. | `route.rs:381,401`, `main.rs:253` | Test: 2, plus a control |
| B7 | Two trains in a row with no line ID are shown as one leg, which hides the change and the 8-minute wait. | `route.rs:347-349` | Test: 1 |
| B8 | You cannot change between two trains of the same plugin (TER to TGV) unless the station node lies on a footway. | `route.rs:253-258,289-293` | Test: 1, plus a control |
| B9 | The `Source-Code` header points to a repo that returns 404, which matters for the AGPL. OpenStreetMap, where all the map data comes from, is never credited. | `main.rs:334-337,352` | Ran: GitLab returns 404 |
| B10 | The README's example flake fails in Nix: `https://…git` needs `git+https://`. The README promises `available` is called first, but it is called third. It shows IDs as strings, but plugins use integers. | `README.md:25-28,68`, `main.rs:441-442` | Ran: `nix flake metadata`; Read |

All 15 failing tests fail for the stated reason, and all 4 controls pass. Run them yourself with `python3 repro/run_repro.py /path/to/maps-server`.

## Robustness

| ID | Issue | Where |
| --- | --- | --- |
| R1 | The map graph is built on the first request, so that user waits, and a failed load breaks every later request. | `route.rs:75` |
| R2 | Plugin calls have no timeout, and one lock covers all plugins: one stuck plugin freezes the server. Dead plugins are never restarted. | `main.rs:63-78,263` |
| R3 | The wait for Overpass never times out, even if the container has died. | `main.rs:463-484` |
| R4 | The "map files changed" check uses a hash that can change between Rust versions, which can force a re-import that takes hours. | `main.rs:36-49` |
| R5 | There are no search limits. An impossible route calls the plugins (and their API keys) at every station in the region. | `route.rs:182` |
| R6 | The plugin list is parsed by trimming brackets instead of as JSON. | `main.rs:419-425` |
| R7 | Bus-only roads (`busway`, `bus_guideway`) count as walkable, while station corridors (`indoor=corridor`) and trunk roads with sidewalks do not. | `route.rs:407-459` |

Overpass is also published on every network interface, when only localhost needs it (`main.rs:159`).

## Performance, measured

| Extract | Map points stored | Points walking uses | Share used | Peak memory |
| --- | --- | --- | --- | --- |
| Monaco | 13,739 | 4,721 | 34% | 11.1 MB |
| Andorra | 69,644 | 37,522 | 54% | 16.8 MB |
| Empty test map | 5 | 5 | 100% | 11.0 MB |

The graph costs about 85 bytes per point in the file and grows linearly, so a large region needs gigabytes. Storing only the points walking uses, in a compact structure, should at least halve it (P1).

The default shortcut explores 54% (Andorra) and 72% (Monaco) as many points as a plain search on walking routes, with identical answers. Getting the fastest route every time therefore costs at most about twice the work; that is question Q1 for the owner.

The plugin cache lives for one request and is keyed to the second, so it almost never hits (P2).

## Cleanup and docs

| ID | Issue |
| --- | --- |
| C1 | `serde` is missing its `derive` feature, so it only builds because another crate turns it on. `serde_core` and `ctrlc` are not needed. |
| C2 | Every example in `test` uses 2-digit years, which do not parse. |
| C3 | The HTTP API is undocumented. The README has typos (`http:localhost:12345`, "Delimitted"). |
| C4 | There is no changelog and no CI. |

## Feature ideas

Tier 1, additive and safe to build:

| ID | Feature |
| --- | --- |
| F1 | `/health` endpoint |
| F2 | Attribution that lists only the plugins actually used, plus OpenStreetMap |
| F3 | Latitude/longitude in, coordinates and GeoJSON out |
| F4 | Routing options: transfer time, max walk, avoid steps, exclude modes |
| F5 | A plugin checker command, plus JSON Schemas for the protocol |
| F6 | Config file |
| F7 | `/metrics` and structured logs |

Tier 2, proposals for the owner to approve first:

| ID | Feature |
| --- | --- |
| F8 | Plugin protocol v2: handshake, request IDs, batching, `trip_id`, realtime delays |
| F9 | Alternative routes |
| F10 | Arrive-by search |
| F11 | Isochrones |
| F12 | Station search |
| F13 | Graph cache on disk |
| F14 | Demo map page |
| F15 | Step-free routing |
| F16 | API key and rate limits |
