# Feature ideas for maps-server

Ideas for what could be added to maps-server next. None of them is built. Sizes are rough: **S** is about a day, **M** a few days, **L** a week or more.

## What it is today

- maps-server is an HTTP API that runs on your own computer. It is not a web page.
- After `nix run` it answers on `http://localhost:6767`:
  - `POST /` returns routes;
  - `GET /health` and `GET /metrics` show its state.
- Opening `http://localhost:6767/` in a browser gives `405`, because there is no page to show yet. The demo page (F14) would add one.
- It has no public address. Anyone else could only use it if it ran on a machine that is always on, with Docker, the map files and the plugins, and with F16's protection in front.
- Its routing code can also be tried in a browser, with nothing to install, at https://pyroourson.github.io/claudecode/ClaudeScripts/maps-demo/: Monaco, real bus lines, made-up bus times (`ClaudeScripts/maps-demo/`).

## Top picks

1. **Demo page (F14).** Opening `http://localhost:6767/` shows a map. You click a start and a destination, and the route is drawn with each line in its own colour. This makes maps-server something you can open in a browser. **M**, already designed.
2. **Departure board.** `GET /departures?station=<id>&time=...` lists the next departures from a station, with line, mode and next stop. It reuses the answers plugins already give and the shared cache, so no plugin needs to change. **S to M**.
3. **Next trips.** `"count": 3` returns the next three ways to make the trip, each leaving later than the previous one, like a journey planner's "later departures" button. It repeats today's search, starting just after the previous route's first vehicle. **S to M**.
4. **Graph cache on disk (F13).** Big regions start in seconds instead of minutes. **M**, already designed.

## Already designed

These have full design notes in [`NaoiseGabi/maps-server/docs/proposals/`](../../NaoiseGabi/maps-server/docs/proposals/). Sizes come from the notes.

| Feature | What it adds | Size |
| --- | --- | --- |
| F8. Plugin protocol v2 | Exact same-vehicle rule, real-time delays, several stations per plugin call. Every plugin must be updated, so it was not selected. | L |
| F9. Alternative routes | Up to three routes: fastest, fewest changes, least walking. | M to L, 5 to 7 days |
| F10. Arrive-by search | "Arrive by 9:00" instead of "leave at 8:00". | S to M, 2 to 3 days |
| F11. Isochrones | A map shape of everywhere reachable within N minutes. | M, 4 to 5 days |
| F12. Station search | Find a station by name, or the ones near a point. | M, 3 to 4 days |
| F13. Graph cache on disk | Fast restarts on big regions. | S to M, 2 to 3 days |
| F14. Demo page | A map page at `GET /` to try routes in a browser. | S to M, 2 to 3 days |
| F15. Step-free routing | Routes for wheelchairs and prams: no steps, raised kerbs or steep slopes. | M, 4 to 5 days |
| F16. Public deployment protection | API key, rate limits and a cap on searches running at once, for a public server. | S to M, 2 to 3 days |

## New ideas

| Idea | What it adds | Size | Plugins must change? |
| --- | --- | --- | --- |
| Departure board | Next departures from one station. | S to M | No |
| Next trips | The next few ways to make the same trip. | S to M | No |
| Route summary | Total time, walking metres and number of changes in every answer, so apps do not have to add them up. | S | No |
| Local times | `"time_zone": "Europe/Paris"` returns times with the local offset instead of UTC. | S | No |
| GPX output | `"format": "gpx"`, to load a walk into a hiking app or a watch. | S | No |
| Avoid stations or lines | `avoid_stations` and `avoid_lines`, next to today's `exclude_modes`. | S | No |
| API description | `GET /openapi.json`, so client code can be generated and tried in tools like Swagger UI. | S | No |
| Travel-time matrix | `POST /matrix` with several starts and destinations, for example to compare flats by commute time. | M | No |
| Reload without restart | Pick up new map files or plugins on `SIGHUP`, without stopping the server. | M | No |
| Walking directions | Street names and turns ("left onto Rue Paradis, 120 m"). The graph must keep way names, which costs memory. | M to L | No |
| Fares | A price per journey and a total per route. | M | Yes |
| Bike and transit | Cycle to the station, then take the train. Needs a second graph for cycling. | L | No |
| Setup without Docker | Plugins ask maps-server for the station lookups they now ask Overpass for, so Docker and the long first import become optional. | L | Yes |
| Faster walking on big regions | Precomputed shortcuts for the walking part of the search. | L | No |
