# Proposals

Design notes for the Tier 2 features the owner picked. They are proposals only: nothing here is built until the owner approves it. Each one has the same sections: goal, API sketch, protocol impact, algorithm, cost, risks and test plan.

| File | Feature | Key design choice |
| --- | --- | --- |
| [F9.md](F9.md) | Alternative routes | An opt-in label search keeping up to k+1 non-dominated labels per state on (arrival, boardings, walking metres); other requests keep today's search. |
| [F10.md](F10.md) | Arrive-by search | Repeated forward searches (back off, then bisect to 60 s, then shift the start later), so it works with today's plugins; an exact reverse search needs a new plugin action. |
| [F11.md](F11.md) | Isochrones | A search with no target that stops at `max_minutes`, plus an outline traced on a sparse grid into a MultiPolygon, with no new dependency. |
| [F12.md](F12.md) | Station search | Names fetched once in the background from the local Overpass for the stations the plugins list, folded for case and accents and ranked by match quality. |
| [F13.md](F13.md) | Graph cache on disk | A flat little-endian file keyed by the R4 map-file hash and a rules version, written atomically and fully checked on read. |
| [F14.md](F14.md) | Demo page | A static page with a vendored Leaflet compiled into the binary and served at `GET /`, with a strict Content-Security-Policy. |
| [F15.md](F15.md) | Step-free routing | Access flags per edge and per node from `wheelchair`, `highway=steps`, `incline` and `kerb`, with verified, limited and unknown metres reported per route. |
| [F16.md](F16.md) | Public deployment protection | One middleware, off by default: per-client rate limits, an API key, a plugin-call budget per client and a cap on concurrent searches. |

F8 (plugin protocol v2) was not selected. Where a proposal would gain from it, it says so and describes a fallback that works with today's protocol.

Decisions left to the owner:
- F11: whether a search cut short by a limit answers `200` with `"complete": false` (proposed) or `404` like routes.
- F12: names from the local Overpass (proposed) or from the map files while the graph loads.
- F14: `GET /` changes from `405` to the demo page; `MAPS_DEMO_PAGE=0` keeps the old answer.
- F15: whether to also block stiles, kissing gates and turnstiles, which goes slightly beyond the brief.
