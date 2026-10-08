# buphagus

A routing engine designed with public transport in mind. Each public transport provider will have a plugin written allowing the engine to communicate with the API of said provider.

## Installation

### Prerequisites

* Nix Flakes: Ensure experimental features are enabled (`nix.settings.experimental-features = ["nix-command" "flakes"]`).
* Docker: Add your user to the Docker group (`users.users.<user>.extraGroups = ["docker"]`) and ensure the Docker daemon is running.
* SSH Access (only for private plugins): every input below is public and fetched over HTTPS. If you add a private plugin through a `git+ssh://` URL, configure an SSH key for that host.

### Flake Configuration (`flake.nix`)

Save the following configuration as `flake.nix` in your root directory:

```
{
    inputs = {
        nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
        flake-utils.url = "github:numtide/flake-utils";

        maps-server.url = "gitlab:buphagidae/maps-server";
        
        sncf-plugin.url = "git+https://gitlab.com/buphagidae/plugins/sncf-plugin.git";
        dublin-bus-bus-eireann-go-ahead-plugin.url = "git+https://gitlab.com/buphagidae/plugins/tfi-plugins/dublin-bus-bus-eireann-go-ahead-plugin.git";
        cam-plugin.url = "git+https://gitlab.com/buphagidae/plugins/camonaco-plugin.git";
        tri-rail-plugin.url = "git+https://gitlab.com/vitras21-group/trirail-plugin.git";
    };

    outputs = { self, nixpkgs, maps-server, sncf-plugin, dublin-bus-bus-eireann-go-ahead-plugin, cam-plugin, tri-rail-plugin, flake-utils }:
        flake-utils.lib.eachSystem [ "x86_64-linux" "aarch64-linux" "aarch64-darwin" ] (system:
            let
                pkgs = nixpkgs.legacyPackages.${system};
            in {
                packages.default = maps-server.packages.${system}.default;

                apps = {
                    default = {
                        type = "app";
                        program = "${pkgs.writeShellScriptBin "maps-server-configured" ''
                            export OSM_PBF_FILES="provence-alpes-cote-d-azur-260718.osm.pbf,florida-260819.osm.pbf"
                            exec ${maps-server.apps.${system}.default.program} "$@"
                        ''}/bin/maps-server-configured";
                    };

                    plugins = {
                        sncf-plugin = sncf-plugin.apps.${system}.default;
                        cam-plugin-bus = cam-plugin.apps.${system}.default;
                    };
                };
            }
        );
}
```

### Setup & Execution Steps

1. Prepare Map Assets: Create an `./assets` folder in your project root directory and download the corresponding `.osm.pbf` files (e.g., from [Geofabrik](https://download.geofabrik.de/)) into it. Ensure filenames match those exported in `OSM_PBF_FILES`.
2. Add API Keys: Add any required API keys, always check plugins for environment variable reads, if they are required, the plugin's README will specify what variables should be set and what values to set them to.
3. Run the Server: Launch the configured server using Nix:
```
nix run
```

## Plugin requirements:

Plugins must be persistent background processes run via `nix run`. Communication occurs over stdin/stdout using Newline Delimitted JSON. Every request is formatted as a single-line json object followed by a newline. Responses are expected to be the same. Make sure stdout is flushed with each response. The server calls `mode`, then `attribution`, then `available`, and only then `explore`, so `mode` and `attribution` must answer without any initialisation; do the slow initialisation when `available` arrives. An example plugin is available at https://gitlab.com/buphagidae/plugins/sncf-plugin. For any queries to an overpass instance, please use the local one available at `http:localhost:12345/api/interpreter`.

Requests:
- Mode: Requests the mode of transportation the current plugin provides data for. Request looks like: {"action": "mode"}.
- Attribution: Requests some information on the data and the plugin. Request looks like: {"action": "attribution"}.
- Available: Requests all nodes that are members of the transport network. Request looks like: {"action": "available"}.
- Explore: Requests outgoing trips from a specific station node. Request looks like: {"action": "explore", "data": {"station": 123456, "datetime": "19700101T120000"}}.
    - station: (integer) Main OSM ID of the origin station.
    - datetime: (string) Search window start time formatted as (YYYYmmddTHHMMSS), always in utc time.
    - optional duration: (integer) Search window duration in seconds. The server does not send it today, so pick an appropriate default for the transport network (the SNCF plugin uses 7200).

Responses:
- Success:
    - Mode: A string describing the mode of transport. Response looks like: {"response": "train"}
    - Attribution: A json object containing some info. Response looks like: {"response": {"data_owner": "\[SNCF](https://sncf.fr/)", "data_license": "\[ODbL](https://opendatacommons.org/licenses/odbl/1.0/) and \[Extra Usage Conditions](https://doc.transport.data.gouv.fr/presentation-et-mode-demploi-du-pan/conditions-dutilisation-des-donnees/licence-odbl)", "plugin_owner": "Naoise McG", "plugin_license": "\[BSD 3-clause, new/revised](https://gitlab.com/buphagidae/plugins/sncf-plugin/-/raw/main/LICENSE)"}}
    - Available: Map of main station node IDs to arrays of associated walkable node IDs. The keys are strings because JSON keys always are; the entrance IDs are integers. Response looks like: {"response": {"123456": [789123, 456789]}}. Numeric strings are also accepted.
    - Explore: List of journeys departing from origin station during window. Try to use as few API requests as possible, these plugins are speed bottle neck for the routing engine, and this should be minimised. Also make sure that for a single train, each station it passes through gets an entry in the response, departing the origin at the same time, but arriving in different places along the route. Response looks like: {"response": [{"to": 654321, "cost": 1800, "time": "19700101T120000", "line": {"id": "4", "preferred_colour": "#FF0000", "ways": [123456]}}]}
        - to (integer): OSM node ID of target station. A numeric string is also accepted.
        - cost (int): Journey duration in seconds, 0 or more. Journeys with a negative or non-integer cost are skipped.
        - time (string): Departure time (YYYYmmddTHHMMSS).
        - line (json object): Currently has no effect, but will be implemented in the future.
            - id (optional str): Usual public facing identifier of the transit line. Currently has no effect, but may be implemented in the future.
            - preferred_colour (optional str): Hex colour code of the preferred colour of the line. Currently has no effect, but may be implemented in the future.
            - ways (array[integer]): OSM IDs of ways the line passes through. Currently has no effect, but will be implemented in the future.
- Error:
    - In the event of an error, make sure the process does not exit, and return a json object that looks like this: {"error": "Bla bla bla"}.
