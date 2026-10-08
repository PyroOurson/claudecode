// SPDX-License-Identifier: AGPL-3.0
// Copyright (C) 2026 Naoise McG
use crate::config::Config;
use crate::http::AppState;
use crate::plugin::{PluginError, Timeouts};
use crate::testkit::{
    CallLog, exchange, has_route, plugin, plugin_with, request, send, serve, serve_state,
    state_with,
};
use crate::testkit::{FIXTURE, kit};
use serde_json::json;
use std::sync::Arc;
use std::time::{Duration, Instant};

fn walk() -> String {
    json!({"required_nodes": [1, 2], "time": "20260808T120000"}).to_string()
}

#[test]
fn preflight_is_answered_as_before() {
    let reply = send(Vec::new(), vec![request("OPTIONS", "/", "")]);
    assert_eq!(reply.status, 204, "{}", reply.raw);
    assert_eq!(reply.header("Access-Control-Allow-Origin"), Some("*"));
    assert_eq!(
        reply.header("Access-Control-Allow-Methods"),
        Some("POST, OPTIONS")
    );
    assert_eq!(
        reply.header("Access-Control-Allow-Headers"),
        Some("Content-Type")
    );
    assert_eq!(reply.header("Access-Control-Max-Age"), Some("86400"));
    assert_eq!(reply.header("Content-Length").unwrap_or("0"), "0");
}

#[test]
fn routes_carry_cors_attribution_and_source_headers() {
    let reply = send(Vec::new(), vec![request("POST", "/", &walk())]);
    assert_eq!(reply.status, 200, "{}", reply.raw);
    assert_eq!(reply.header("Content-Type"), Some("application/json"));
    assert_eq!(reply.header("Access-Control-Allow-Origin"), Some("*"));
    assert_eq!(
        reply.header("Access-Control-Expose-Headers"),
        Some("Attribution, Source-Code")
    );
    assert!(
        reply
            .header("Attribution")
            .is_some_and(|value| value.starts_with('"'))
    );
    assert!(
        reply
            .header("Source-Code")
            .is_some_and(|value| value.starts_with("\"https://"))
    );
}

#[test]
fn bodies_over_the_limit_get_413_with_cors_headers() {
    let config =
        Config::from_lookup(&|key| (key == "MAPS_MAX_BODY_BYTES").then(|| "64".to_string()))
            .unwrap();
    let address = serve_state(state_with(Vec::new(), config));
    let reply = exchange(address, vec![request("POST", "/", &walk().repeat(4))]);
    assert_eq!(reply.status, 413, "{}", reply.raw);
    assert!(reply.json["error"].is_string(), "{}", reply.raw);
    assert_eq!(reply.header("Access-Control-Allow-Origin"), Some("*"));
}

#[test]
fn other_methods_get_405() {
    let reply = exchange(serve(Vec::new()), vec![request("GET", "/", "")]);
    assert_eq!(reply.status, 405, "{}", reply.raw);
}

fn post_json(body: serde_json::Value) -> crate::testkit::Reply {
    send(Vec::new(), vec![request("POST", "/", &body.to_string())])
}

#[test]
fn malformed_required_nodes_get_400_with_a_precise_message() {
    let cases = [
        (json!({"required_nodes": "1,2"}), "array"),
        (json!({"required_nodes": [1, "2"]}), "required_nodes[1]"),
        (json!({"required_nodes": [1, 2.5]}), "required_nodes[1]"),
        (json!({"required_nodes": [1]}), "at least 2"),
        (
            json!({"required_nodes": (0..26).collect::<Vec<i64>>()}),
            "limit is 25",
        ),
        (json!([1, 2]), "JSON object"),
    ];
    for (body, expected) in cases {
        let reply = post_json(body.clone());
        assert_eq!(reply.status, 400, "{} -> {}", body, reply.raw);
        let message = reply.json["error"].as_str().unwrap_or_default();
        assert!(message.contains(expected), "{} -> {}", body, message);
    }
}

#[test]
fn walking_speed_outside_the_range_gets_400() {
    for speed in [json!(0.0002), json!(0.02), json!(-1), json!("fast")] {
        let reply = post_json(json!({"required_nodes": [1, 2], "walking_speed": speed}));
        assert_eq!(reply.status, 400, "{} -> {}", speed, reply.raw);
    }
    let reply = post_json(json!({"required_nodes": [1, 2], "walking_speed": 0.01}));
    assert_eq!(reply.status, 200, "{}", reply.raw);
}

#[test]
fn every_documented_time_format_is_accepted() {
    for time in [
        "20260808T120000",
        "2026-08-08T12:00:00",
        "2026-08-08T14:00:00+02:00",
    ] {
        let reply = post_json(json!({"required_nodes": [3, 1], "time": time}));
        assert_eq!(reply.status, 200, "{} -> {}", time, reply.raw);
        assert_eq!(
            reply.json["route"][0]["departure_time"], "2026-08-08T12:00:00Z",
            "{}",
            time
        );
    }
}

#[test]
fn a_leg_without_route_names_the_failed_leg() {
    let reply = post_json(json!({"required_nodes": [3, 2, 700], "time": "20260808T120000"}));
    assert_eq!(reply.status, 404, "{}", reply.raw);
    assert_eq!(
        reply.json,
        json!({"error": "no route", "failed_leg": [2, 700]})
    );
}

#[test]
fn unknown_paths_get_a_json_404() {
    let reply = exchange(
        serve(Vec::new()),
        vec![request("POST", "/nowhere", &walk())],
    );
    assert_eq!(reply.status, 404, "{}", reply.raw);
    assert!(reply.json["error"].is_string(), "{}", reply.raw);
}

#[test]
fn plugins_are_only_asked_about_stations_they_listed() {
    let train_log = CallLog::new("train");
    let bus_log = CallLog::new("bus");
    let plugins = vec![
        plugin(
            "train",
            json!({"mode": "train", "log": train_log.path(), "available": {"300": [], "400": []},
                   "explore": {"300": [{"to": 400, "offset": 120, "cost": 600}]}}),
        ),
        plugin(
            "bus",
            json!({"mode": "bus", "log": bus_log.path(), "available": {"400": [], "500": []},
                   "explore": {"400": [{"to": 500, "offset": 300, "cost": 600}]}}),
        ),
    ];
    let reply = send(
        plugins,
        vec![request(
            "POST",
            "/",
            &json!({"required_nodes": [300, 500], "time": "20260808T120000"}).to_string(),
        )],
    );
    assert!(has_route(&reply), "{}", reply.raw);
    let train = train_log.explored_stations();
    let bus = bus_log.explored_stations();
    assert!(
        train.iter().all(|s| [300, 400].contains(s)),
        "train asked about {:?}",
        train
    );
    assert!(
        bus.iter().all(|s| [400, 500].contains(s)),
        "bus asked about {:?}",
        bus
    );
    assert!(
        train.contains(&300) && bus.contains(&400),
        "train {:?}, bus {:?}",
        train,
        bus
    );
}

fn train_behind_start() -> Vec<crate::Plugin> {
    vec![plugin(
        "train",
        json!({"available": {"100": [3], "200": [2]},
               "explore": {"100": [{"to": 200, "offset": 600, "cost": 300}]}}),
    )]
}

fn arrival_with(extra: serde_json::Value) -> crate::testkit::Reply {
    let mut body = json!({"required_nodes": [1, 2], "time": "20260808T120000"});
    body.as_object_mut()
        .unwrap()
        .extend(extra.as_object().unwrap().clone());
    send(
        train_behind_start(),
        vec![request("POST", "/", &body.to_string())],
    )
}

#[test]
fn search_flags_map_onto_exact_and_fast_modes() {
    let train = "2026-08-08T12:15:00Z";
    let walk = "2026-08-08T12:36:15.553Z";
    let cases = [
        (json!({}), train),
        (json!({"heuristic": 1}), train),
        (json!({"heuristic": true}), train),
        (json!({"heuristic": 7}), train),
        (json!({"fast": false}), train),
        (json!({"fast": true}), walk),
        (json!({"heuristic": 0}), walk),
        (json!({"heuristic": false}), walk),
        (json!({"heuristic": 0, "fast": false}), train),
    ];
    for (flags, expected) in cases {
        let reply = arrival_with(flags.clone());
        assert_eq!(reply.status, 200, "{} -> {}", flags, reply.raw);
        assert_eq!(reply.json["arrival_time"], expected, "{}", flags);
    }
}

#[test]
fn malformed_search_flags_get_400() {
    for flags in [
        json!({"fast": 1}),
        json!({"fast": "yes"}),
        json!({"heuristic": "off"}),
        json!({"heuristic": 0.5}),
    ] {
        let reply = arrival_with(flags.clone());
        assert_eq!(reply.status, 400, "{} -> {}", flags, reply.raw);
    }
}

#[test]
fn consecutive_walking_edges_form_one_segment() {
    let reply = post_json(json!({"required_nodes": [3, 2], "time": "20260808T120000"}));
    assert_eq!(reply.status, 200, "{}", reply.raw);
    assert_eq!(
        reply.json["route"].as_array().map(Vec::len),
        Some(1),
        "{}",
        reply.raw
    );
    assert_eq!(reply.json["route"][0]["nodes"], json!([3, 1, 2]));
    assert_eq!(reply.json["route"][0]["mode"], "walking");
}

#[test]
fn two_vehicles_of_the_same_line_stay_two_segments() {
    let line = json!({"id": "4", "preferred_colour": "#FF0000"});
    let plugins = vec![
        plugin(
            "first",
            json!({"available": {"300": [], "400": []},
                   "explore": {"300": [{"to": 400, "offset": 120, "cost": 600, "line": line}]}}),
        ),
        plugin(
            "second",
            json!({"available": {"400": [], "500": []},
                   "explore": {"400": [{"to": 500, "offset": 300, "cost": 600, "line": line}]}}),
        ),
    ];
    let reply = send(
        plugins,
        vec![request(
            "POST",
            "/",
            &json!({"required_nodes": [300, 500], "time": "20260808T120000"}).to_string(),
        )],
    );
    assert_eq!(reply.status, 200, "{}", reply.raw);
    let nodes: Vec<&serde_json::Value> = reply.json["route"]
        .as_array()
        .unwrap()
        .iter()
        .map(|segment| &segment["nodes"])
        .collect();
    assert_eq!(nodes, vec![&json!([300, 400]), &json!([400, 500])]);
}

#[test]
fn a_plugin_can_carry_a_change_between_its_own_vehicles() {
    let plugins = vec![plugin(
        "sncf",
        json!({"available": {"300": [], "400": [], "500": []},
               "explore": {"300": [{"to": 400, "offset": 120, "cost": 600, "line": {"id": "TER"}}],
                           "400": [{"to": 500, "offset": 300, "cost": 600, "line": {"id": "TGV"}}]}}),
    )];
    let reply = send(
        plugins,
        vec![request(
            "POST",
            "/",
            &json!({"required_nodes": [300, 500], "time": "20260808T120000"}).to_string(),
        )],
    );
    assert_eq!(reply.status, 200, "{}", reply.raw);
    let lines: Vec<&serde_json::Value> = reply.json["route"]
        .as_array()
        .unwrap()
        .iter()
        .map(|segment| &segment["line"]["id"])
        .collect();
    assert_eq!(lines, vec![&json!("TER"), &json!("TGV")], "{}", reply.raw);
}

#[test]
fn source_code_points_to_the_real_repository_and_can_be_changed() {
    let reply = send(Vec::new(), vec![request("POST", "/", &walk())]);
    assert_eq!(
        reply.header("Source-Code"),
        Some("\"https://gitlab.com/buphagidae/maps-server\"")
    );
    let config = Config::from_lookup(&|key| {
        (key == "MAPS_SOURCE_URL").then(|| "https://example.org/fork".to_string())
    })
    .unwrap();
    let reply = exchange(
        serve_state(state_with(Vec::new(), config)),
        vec![request("POST", "/", "{")],
    );
    assert_eq!(reply.status, 400);
    assert_eq!(
        reply.header("Source-Code"),
        Some("\"https://example.org/fork\"")
    );
}

#[test]
fn attribution_credits_openstreetmap() {
    let reply = send(Vec::new(), vec![request("POST", "/", &walk())]);
    let header = reply.header("Attribution").unwrap_or_default();
    let decoded = urlencoding::decode(header.trim_matches('"')).unwrap_or_default();
    assert!(
        decoded.contains("Map data \u{a9} OpenStreetMap contributors, ODbL."),
        "{}",
        decoded
    );
}

#[test]
fn routes_get_503_until_the_plugins_are_ready() {
    let state = Arc::new(AppState::new(Config::default(), FIXTURE.clone()));
    let reply = exchange(serve_state(state), vec![request("POST", "/", &walk())]);
    assert_eq!(reply.status, 503, "{}", reply.raw);
    assert!(
        reply.json["error"]
            .as_str()
            .is_some_and(|e| e.contains("starting"))
    );
}

#[test]
fn missing_map_files_are_listed_before_anything_starts() {
    let assets = kit().join("fixtures");
    let files = vec![
        "fixture.osm.pbf".to_string(),
        "france.osm.pbf".to_string(),
        "belgium.osm.pbf".to_string(),
    ];
    assert_eq!(
        crate::missing_files(&assets, &files),
        vec!["france.osm.pbf".to_string(), "belgium.osm.pbf".to_string()]
    );
    let error = crate::load_graph(&assets, &files).err().unwrap_or_default();
    assert!(
        error.contains("france.osm.pbf, belgium.osm.pbf"),
        "{}",
        error
    );
}

#[test]
fn a_corrupt_map_file_stops_startup_with_a_clear_message() {
    let folder = std::env::temp_dir().join(format!("maps-server-corrupt-{}", std::process::id()));
    std::fs::create_dir_all(&folder).unwrap();
    std::fs::write(folder.join("broken.osm.pbf"), b"this is not a PBF file").unwrap();
    let result = crate::load_graph(&folder, &["broken.osm.pbf".to_string()]);
    let _ = std::fs::remove_dir_all(&folder);
    let error = result.err().unwrap_or_default();
    assert!(
        error.starts_with("Could not read the map files broken.osm.pbf"),
        "{}",
        error
    );
}

#[test]
fn the_fixture_loads_through_the_startup_path() {
    let graph =
        crate::load_graph(&kit().join("fixtures"), &["fixture.osm.pbf".to_string()]).unwrap();
    assert!(graph.contains(1) && graph.contains(701));
}

fn short_timeouts() -> Timeouts {
    Timeouts {
        call: Duration::from_secs(1),
        startup: Duration::from_secs(10),
    }
}

fn wait_until(condition: impl Fn() -> bool) -> bool {
    let deadline = Instant::now() + Duration::from_secs(15);
    while Instant::now() < deadline {
        if condition() {
            return true;
        }
        std::thread::sleep(Duration::from_millis(100));
    }
    false
}

#[test]
fn a_plugin_that_never_answers_times_out_and_the_others_keep_answering() {
    let stuck = plugin_with(
        "stuck",
        json!({"hang": ["explore"], "available": {"300": []}}),
        short_timeouts(),
    );
    let working = plugin_with(
        "working",
        json!({"available": {"300": [], "400": []},
               "explore": {"300": [{"to": 400, "offset": 120, "cost": 600}]}}),
        short_timeouts(),
    );
    let address = serve_state(state_with(vec![stuck, working], Config::default()));
    let body = json!({"required_nodes": [300, 400], "time": "20260808T120000"}).to_string();
    for attempt in 0..2 {
        let started = Instant::now();
        let reply = exchange(address, vec![request("POST", "/", &body)]);
        assert!(has_route(&reply), "attempt {}: {}", attempt, reply.raw);
        assert!(
            started.elapsed() < Duration::from_secs(5),
            "attempt {} took {:?}",
            attempt,
            started.elapsed()
        );
    }
}

#[test]
fn a_crashed_plugin_restarts_and_replays_its_handshake() {
    let log = CallLog::new("crash");
    let crashing = plugin_with(
        "crashing",
        json!({"crash": ["explore"], "log": log.path(), "available": {"300": []}}),
        short_timeouts(),
    );
    let time = chrono::Utc::now();
    assert_eq!(crashing.explore(300, time), Err(PluginError::Exited));
    assert_eq!(crashing.explore(300, time), Err(PluginError::Unavailable));
    assert!(
        wait_until(|| crashing.is_alive()),
        "the plugin never came back"
    );
    let actions = log.actions();
    assert_eq!(
        actions,
        vec![
            "mode",
            "attribution",
            "available",
            "explore",
            "mode",
            "attribution",
            "available"
        ],
    );
}

#[test]
fn an_error_reply_keeps_the_plugin_running() {
    let plugin = plugin_with("plain", json!({"available": {}}), short_timeouts());
    let reply = plugin.call("unknown", &json!([]));
    assert!(matches!(reply, Err(PluginError::Replied(_))), "{:?}", reply);
    assert!(plugin.is_alive());
    assert_eq!(plugin.explore(300, chrono::Utc::now()), Ok(json!([])));
}

fn config_with(pairs: &[(&str, &str)]) -> Config {
    let pairs: Vec<(String, String)> = pairs
        .iter()
        .map(|(key, value)| (key.to_string(), value.to_string()))
        .collect();
    Config::from_lookup(&|key| {
        pairs
            .iter()
            .find(|(name, _)| name == key)
            .map(|(_, value)| value.clone())
    })
    .unwrap()
}

fn big_network(log: &CallLog) -> crate::Plugin {
    let stations: Vec<i64> = (1000..1200).collect();
    let available: serde_json::Map<String, serde_json::Value> = stations
        .iter()
        .map(|station| (station.to_string(), json!([])))
        .collect();
    let explore: serde_json::Map<String, serde_json::Value> = stations
        .iter()
        .map(|station| {
            (
                station.to_string(),
                json!([{"to": station + 1, "offset": 300, "cost": 60},
                       {"to": station + 2, "offset": 300, "cost": 60}]),
            )
        })
        .collect();
    plugin(
        "network",
        json!({"log": log.path(), "available": available, "explore": explore}),
    )
}

fn unreachable_reply(config: Config, log: &CallLog) -> crate::testkit::Reply {
    exchange(
        serve_state(state_with(vec![big_network(log)], config)),
        vec![request(
            "POST",
            "/",
            &json!({"required_nodes": [1000, 700], "time": "20260808T120000"}).to_string(),
        )],
    )
}

#[test]
fn an_unreachable_destination_stays_within_the_plugin_call_limit() {
    let log = CallLog::new("limit");
    let reply = unreachable_reply(config_with(&[("MAPS_MAX_PLUGIN_CALLS", "10")]), &log);
    assert_eq!(reply.status, 404, "{}", reply.raw);
    assert_eq!(
        reply.json,
        json!({"error": "no route within limits", "limit": "max_plugin_calls"})
    );
    assert_eq!(log.explored_stations().len(), 10);
}

#[test]
fn without_a_limit_each_station_is_explored_once() {
    let log = CallLog::new("nolimit");
    let reply = unreachable_reply(Config::default(), &log);
    assert_eq!(reply.status, 404, "{}", reply.raw);
    assert_eq!(reply.json["error"], "no route");
    let explored = log.explored_stations();
    let mut unique = explored.clone();
    unique.sort();
    unique.dedup();
    assert!(
        explored.len() <= 2 * unique.len(),
        "{} calls for {} stations",
        explored.len(),
        unique.len()
    );
}

#[test]
fn the_expanded_state_limit_stops_the_search() {
    let address = serve_state(state_with(
        Vec::new(),
        config_with(&[("MAPS_MAX_EXPANDED", "2")]),
    ));
    let reply = exchange(address, vec![request("POST", "/", &walk())]);
    assert_eq!(reply.status, 404, "{}", reply.raw);
    assert_eq!(reply.json["limit"], "max_expanded");
}

#[test]
fn states_past_the_horizon_are_not_expanded() {
    let late_train = || {
        plugin(
            "late",
            json!({"available": {"300": [], "400": []},
                   "explore": {"300": [{"to": 400, "offset": 7200, "cost": 600}]}}),
        )
    };
    let body = json!({"required_nodes": [300, 400], "time": "20260808T120000"}).to_string();
    let short = serve_state(state_with(
        vec![late_train()],
        config_with(&[("MAPS_HORIZON_H", "1")]),
    ));
    let reply = exchange(short, vec![request("POST", "/", &body)]);
    assert_eq!(reply.status, 404, "{}", reply.raw);
    assert_eq!(reply.json["limit"], "horizon_h");
    let long = serve_state(state_with(
        vec![late_train()],
        config_with(&[("MAPS_HORIZON_H", "3")]),
    ));
    let reply = exchange(long, vec![request("POST", "/", &body)]);
    assert_eq!(reply.status, 200, "{}", reply.raw);
}

#[test]
fn the_plugin_list_is_read_as_json() {
    assert_eq!(
        crate::parse_plugin_names(b"[\"cam-plugin-bus\",\"sncf-plugin\"]\n"),
        Ok(vec![
            "cam-plugin-bus".to_string(),
            "sncf-plugin".to_string()
        ])
    );
    assert_eq!(crate::parse_plugin_names(b"[]"), Ok(Vec::new()));
    assert_eq!(
        crate::parse_plugin_names(b"[\"a,b\", \"c]d\"]"),
        Ok(vec!["a,b".to_string(), "c]d".to_string()])
    );
    assert!(crate::parse_plugin_names(b"error: flake has no apps").is_err());
}

static WALKABILITY: std::sync::LazyLock<crate::route::Graph> = std::sync::LazyLock::new(|| {
    crate::route::Graph::from_pbfs(&[kit().join("fixtures").join("walkability.osm.pbf")]).unwrap()
});

fn walkable(way: i64) -> bool {
    WALKABILITY.neighbours(way * 2 - 1).next().is_some()
}

#[test]
fn bus_only_and_dead_roads_are_not_walkable() {
    for (way, name) in [
        (1, "busway"),
        (2, "bus_guideway"),
        (3, "razed"),
        (4, "disused"),
        (5, "no"),
    ] {
        assert!(!walkable(way), "highway={} counted as walkable", name);
    }
}

#[test]
fn foot_yes_still_opens_a_bus_only_road() {
    assert!(walkable(6));
}

#[test]
fn station_corridors_without_a_highway_tag_are_walkable() {
    assert!(walkable(7), "indoor=corridor");
    assert!(!walkable(8), "indoor=corridor with access=private");
}

#[test]
fn trunk_roads_are_walkable_only_with_a_sidewalk() {
    assert!(walkable(9), "trunk with sidewalk=both");
    assert!(walkable(10), "trunk with sidewalk:left=yes");
    assert!(walkable(11), "trunk_link with sidewalk=right");
    assert!(!walkable(12), "trunk without sidewalk");
    assert!(!walkable(13), "trunk with sidewalk=separate");
    assert!(!walkable(14), "motorway with sidewalk=both");
}

#[test]
fn ordinary_footways_stay_walkable() {
    assert!(walkable(15));
}

fn logged_train_and_bus(train_log: &CallLog, bus_log: &CallLog) -> Vec<crate::Plugin> {
    vec![
        plugin(
            "train",
            json!({"mode": "train", "log": train_log.path(), "available": {"300": [], "400": []},
                   "explore": {"300": [{"to": 400, "offset": 120, "cost": 600}]}}),
        ),
        plugin(
            "bus",
            json!({"mode": "bus", "log": bus_log.path(), "available": {"400": [], "500": []},
                   "explore": {"400": [{"to": 500, "offset": 300, "cost": 600}]}}),
        ),
    ]
}

fn explore_calls(logs: &[&CallLog]) -> usize {
    logs.iter().map(|log| log.explored_stations().len()).sum()
}

#[test]
fn a_repeated_request_is_served_from_the_cache() {
    let (train_log, bus_log) = (CallLog::new("cache-train"), CallLog::new("cache-bus"));
    let state = state_with(
        logged_train_and_bus(&train_log, &bus_log),
        Config::default(),
    );
    let address = serve_state(state.clone());
    let body = json!({"required_nodes": [300, 500], "time": "20260808T120000"}).to_string();
    let first = exchange(address, vec![request("POST", "/", &body)]);
    let calls = explore_calls(&[&train_log, &bus_log]);
    let misses = state.cache.misses();
    let second = exchange(address, vec![request("POST", "/", &body)]);
    assert!(has_route(&first), "{}", first.raw);
    assert_eq!(first.json, second.json);
    assert!(calls > 0);
    assert_eq!(
        explore_calls(&[&train_log, &bus_log]),
        calls,
        "the second request called the plugins"
    );
    assert_eq!(state.cache.misses(), misses);
    assert_eq!(
        state.cache.hits(),
        misses,
        "every lookup of the second request should hit"
    );
}

#[test]
fn a_zero_ttl_asks_the_plugins_every_time() {
    let (train_log, bus_log) = (CallLog::new("nocache-train"), CallLog::new("nocache-bus"));
    let state = state_with(
        logged_train_and_bus(&train_log, &bus_log),
        config_with(&[("MAPS_CACHE_TTL_S", "0")]),
    );
    let address = serve_state(state);
    let body = json!({"required_nodes": [300, 500], "time": "20260808T120000"}).to_string();
    exchange(address, vec![request("POST", "/", &body)]);
    let calls = explore_calls(&[&train_log, &bus_log]);
    exchange(address, vec![request("POST", "/", &body)]);
    assert_eq!(explore_calls(&[&train_log, &bus_log]), 2 * calls);
}

#[test]
fn a_failed_exploration_is_not_cached() {
    let log = CallLog::new("crash-cache");
    let crashing = plugin_with(
        "crashing",
        json!({"crash": ["explore"], "log": log.path(), "available": {"300": [], "400": []}}),
        short_timeouts(),
    );
    let state = state_with(vec![crashing.clone()], Config::default());
    let address = serve_state(state);
    let body = json!({"required_nodes": [300, 400], "time": "20260808T120000"}).to_string();
    let first = exchange(address, vec![request("POST", "/", &body)]);
    assert_eq!(first.status, 404, "{}", first.raw);
    assert!(
        wait_until(|| crashing.is_alive()),
        "the plugin never came back"
    );
    exchange(address, vec![request("POST", "/", &body)]);
    assert_eq!(log.explored_stations(), vec![300, 300]);
}

fn health(address: std::net::SocketAddr) -> crate::testkit::Reply {
    exchange(address, vec![request("GET", "/health", "")])
}

#[test]
fn health_is_ok_when_everything_is_up() {
    let plugins = vec![plugin(
        "train",
        json!({"mode": "train", "available": {"300": []}}),
    )];
    let reply = health(serve_state(state_with(plugins, Config::default())));
    assert_eq!(reply.status, 200, "{}", reply.raw);
    assert_eq!(reply.json["status"], "ok");
    assert_eq!(reply.json["overpass"], "up");
    assert_eq!(reply.json["graph"], json!({"nodes": 5, "edges": 6}));
    assert!(reply.json["uptime_s"].is_u64());
    assert_eq!(
        reply.json["plugins"],
        json!([{"name": "train", "mode": "train", "alive": true, "calls": 0, "errors": 0, "avg_ms": 0.0}])
    );
}

#[test]
fn a_killed_plugin_makes_health_503() {
    let doomed = plugin("doomed", json!({"available": {"300": []}}));
    let address = serve_state(state_with(vec![doomed.clone()], Config::default()));
    let pid = doomed.process_id().expect("running");
    let killed = std::process::Command::new("kill")
        .args(["-9", &pid.to_string()])
        .status()
        .unwrap();
    assert!(killed.success());
    assert!(wait_until(|| !doomed.is_alive()));
    let reply = health(address);
    assert_eq!(reply.status, 503, "{}", reply.raw);
    assert_eq!(reply.json["status"], "degraded");
    assert_eq!(reply.json["plugins"][0]["alive"], false);
}

#[test]
fn health_counts_plugin_calls_and_errors() {
    let plugins = vec![plugin(
        "train",
        json!({"available": {"300": [], "400": []},
               "explore": {"300": [{"to": 400, "offset": 120, "cost": 600}]}}),
    )];
    let state = state_with(plugins, Config::default());
    let address = serve_state(state.clone());
    let body = json!({"required_nodes": [300, 400], "time": "20260808T120000"}).to_string();
    exchange(address, vec![request("POST", "/", &body)]);
    let _ = state.network().unwrap().plugins[0].call("unknown", &json!([]));
    let reply = health(address);
    assert_eq!(reply.json["plugins"][0]["calls"], 2, "{}", reply.raw);
    assert_eq!(reply.json["plugins"][0]["errors"], 1, "{}", reply.raw);
}

#[test]
fn health_is_503_while_starting_or_without_overpass() {
    let starting = Arc::new(AppState::new(Config::default(), FIXTURE.clone()));
    let reply = health(serve_state(starting));
    assert_eq!(reply.status, 503, "{}", reply.raw);
    assert_eq!(reply.json["ready"], false);
    let mut no_overpass = AppState::new(Config::default(), FIXTURE.clone());
    let closed = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
    no_overpass.overpass_address = closed.local_addr().unwrap().to_string();
    drop(closed);
    let no_overpass = Arc::new(no_overpass);
    no_overpass.set_ready(Vec::new(), crate::build_station_access_map(&[]));
    let reply = health(serve_state(no_overpass));
    assert_eq!(reply.status, 503, "{}", reply.raw);
    assert_eq!(reply.json["overpass"], "down");
    assert_eq!(reply.json["ready"], true);
}
