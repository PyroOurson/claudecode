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

#[test]
fn attribution_lists_only_the_plugins_the_route_used() {
    let credit = |owner: &str| json!({"data_owner": owner, "data_license": "CC-BY", "plugin_owner": "Tester", "plugin_license": "MIT"});
    let plugins = vec![
        plugin(
            "train",
            json!({"attribution": credit("Rail Co"), "available": {"300": [], "400": []},
                   "explore": {"300": [{"to": 400, "offset": 120, "cost": 600}]}}),
        ),
        plugin(
            "bus",
            json!({"attribution": credit("Bus Co"), "available": {"300": [], "400": []},
                   "explore": {"300": [{"to": 400, "offset": 2400, "cost": 600}]}}),
        ),
    ];
    let reply = send(
        plugins,
        vec![request(
            "POST",
            "/",
            &json!({"required_nodes": [300, 400], "time": "20260808T120000"}).to_string(),
        )],
    );
    assert_eq!(reply.status, 200, "{}", reply.raw);
    let names: Vec<&str> = reply.json["attribution"]
        .as_array()
        .unwrap()
        .iter()
        .filter_map(|credit| credit["plugin"].as_str())
        .collect();
    assert_eq!(names, vec!["OpenStreetMap", "train"]);
    assert_eq!(reply.json["attribution"][1]["data_owner"], "Rail Co");
    let header = urlencoding::decode(
        reply
            .header("Attribution")
            .unwrap_or_default()
            .trim_matches('"'),
    )
    .unwrap_or_default()
    .to_string();
    assert!(
        header.contains("Rail Co, provided under the CC-BY, translated by Tester, under the MIT."),
        "{}",
        header
    );
    assert!(header.contains("OpenStreetMap contributors"), "{}", header);
    assert!(!header.contains("Bus Co"), "{}", header);
}

#[test]
fn a_walk_is_credited_to_openstreetmap_only() {
    let reply = send(Vec::new(), vec![request("POST", "/", &walk())]);
    assert_eq!(reply.json["attribution"].as_array().map(Vec::len), Some(1));
    assert_eq!(reply.json["attribution"][0]["plugin"], "OpenStreetMap");
}

fn close(value: &serde_json::Value, expected: f64) -> bool {
    value
        .as_f64()
        .is_some_and(|actual| (actual - expected).abs() < 1e-6)
}

fn points(value: &serde_json::Value) -> Vec<(f64, f64)> {
    value
        .as_array()
        .unwrap()
        .iter()
        .map(|pair| (pair[0].as_f64().unwrap(), pair[1].as_f64().unwrap()))
        .collect()
}

fn same_points(actual: &[(f64, f64)], expected: &[(f64, f64)]) -> bool {
    actual.len() == expected.len()
        && actual
            .iter()
            .zip(expected)
            .all(|(a, b)| (a.0 - b.0).abs() < 1e-6 && (a.1 - b.1).abs() < 1e-6)
}

#[test]
fn waypoints_snap_to_the_nearest_walkable_node() {
    let reply = post_json(
        json!({"waypoints": [[0.0001, 0.0001], [0.0, 0.0269]], "time": "20260808T120000"}),
    );
    assert_eq!(reply.status, 200, "{}", reply.raw);
    let snapped = &reply.json["snapped"];
    assert_eq!(snapped[0]["node"], 1);
    assert_eq!(snapped[1]["node"], 2);
    assert_eq!(snapped[0]["input"], json!([0.0001, 0.0001]));
    assert!(close(&snapped[0]["distance_m"], 15.7), "{}", snapped);
    assert!(close(&snapped[1]["distance_m"], 11.1), "{}", snapped);
    assert_eq!(reply.json["route"][0]["nodes"], json!([1, 2]));
}

#[test]
fn waypoints_too_far_from_any_footway_get_400() {
    let far = json!({"waypoints": [[0.01, 0.01], [0.0, 0.0]], "time": "20260808T120000"});
    let reply = post_json(far.clone());
    assert_eq!(reply.status, 400, "{}", reply.raw);
    assert!(
        reply.json["error"]
            .as_str()
            .unwrap_or_default()
            .contains("waypoints[0]"),
        "{}",
        reply.raw
    );
    let mut generous = far;
    generous["max_snap_m"] = json!(2000);
    let reply = post_json(generous);
    assert_eq!(reply.status, 200, "{}", reply.raw);
    assert_eq!(reply.json["snapped"][0]["node"], 1);
}

#[test]
fn malformed_waypoint_requests_get_400() {
    for body in [
        json!({"waypoints": [[0.0, 0.0], [0.0, 0.027]], "required_nodes": [1, 2]}),
        json!({"waypoints": [[0.0, 0.0]]}),
        json!({"waypoints": [[0.0, 0.0], [91.0, 0.0]]}),
        json!({"waypoints": [[0.0, 0.0], [0.0]]}),
        json!({"waypoints": "0,0;0,0.027"}),
        json!({"waypoints": [[0.0, 0.0], [0.0, 0.027]], "max_snap_m": 0}),
        json!({"required_nodes": [1, 2], "format": "kml"}),
    ] {
        let reply = post_json(body.clone());
        assert_eq!(reply.status, 400, "{} -> {}", body, reply.raw);
    }
}

#[test]
fn every_segment_has_coordinates() {
    let reply = post_json(json!({"required_nodes": [3, 2], "time": "20260808T120000"}));
    assert_eq!(reply.status, 200, "{}", reply.raw);
    assert!(
        same_points(
            &points(&reply.json["route"][0]["coordinates"]),
            &[(0.0, -0.0027), (0.0, 0.0), (0.0, 0.027)]
        ),
        "{}",
        reply.raw
    );
}

#[test]
fn a_station_without_coordinates_is_placed_at_its_first_entrance() {
    let reply = arrival_with(json!({}));
    assert_eq!(reply.status, 200, "{}", reply.raw);
    let train = reply.json["route"]
        .as_array()
        .unwrap()
        .iter()
        .find(|segment| segment["mode"] == "train")
        .cloned()
        .unwrap();
    assert_eq!(train["nodes"], json!([100, 200]));
    assert!(
        same_points(
            &points(&train["coordinates"]),
            &[(0.0, -0.0027), (0.0, 0.027)]
        ),
        "{}",
        train
    );
}

#[test]
fn geojson_output_is_a_valid_feature_collection() {
    let reply = arrival_with(json!({"format": "geojson"}));
    assert_eq!(reply.status, 200, "{}", reply.raw);
    assert_eq!(reply.header("Content-Type"), Some("application/geo+json"));
    let body = &reply.json;
    assert_eq!(body["type"], "FeatureCollection");
    assert!(body["arrival_time"].is_string() && body["attribution"].is_array());
    let features = body["features"].as_array().unwrap();
    assert_eq!(features.len(), 3, "{}", body);
    for feature in features {
        assert_eq!(feature["type"], "Feature");
        let geometry = &feature["geometry"];
        assert_eq!(geometry["type"], "LineString", "{}", feature);
        let coordinates = geometry["coordinates"].as_array().unwrap();
        assert!(coordinates.len() >= 2);
        for position in coordinates {
            let position = position.as_array().unwrap();
            assert_eq!(position.len(), 2);
            let (lon, lat) = (position[0].as_f64().unwrap(), position[1].as_f64().unwrap());
            assert!((-180.0..=180.0).contains(&lon) && (-90.0..=90.0).contains(&lat));
        }
        assert!(feature["properties"]["mode"].is_string());
        assert!(feature["properties"]["departure_time"].is_string());
    }
    assert!(
        same_points(
            &points(&features[1]["geometry"]["coordinates"]),
            &[(-0.0027, 0.0), (0.027, 0.0)]
        ),
        "longitude comes first in GeoJSON: {}",
        features[1]
    );
}

mod options {
    use super::*;
    use crate::route::{
        Graph, OutgoingJourney, RouteOptions, SearchMode, SearchParams, SearchStats, Stations,
        route_with_schedule,
    };
    use chrono::{DateTime, Duration, NaiveDateTime, Utc};

    fn start() -> DateTime<Utc> {
        NaiveDateTime::parse_from_str("20260808T120000", "%Y%m%dT%H%M%S")
            .unwrap()
            .and_utc()
    }

    fn leg(to: i64, departure: i64, cost: u64, plugin: usize, mode: &str) -> OutgoingJourney {
        OutgoingJourney {
            target_station: to,
            departure: start() + Duration::seconds(departure),
            cost_seconds: cost,
            plugin,
            mode: mode.to_string(),
            line: None,
        }
    }

    fn timetable(station: i64) -> Vec<OutgoingJourney> {
        match station {
            300 => vec![
                leg(400, 120, 600, 0, "train"),
                leg(500, 600, 1800, 2, "coach"),
            ],
            400 => vec![leg(500, 900, 600, 1, "bus")],
            100 => vec![leg(200, 900, 3000, 0, "train")],
            _ => Vec::new(),
        }
    }

    fn arrival(
        graph: &Graph,
        stations: &[(i64, &[i64])],
        nodes: &[i64],
        min_transfer_s: i64,
        options: RouteOptions,
    ) -> Option<i64> {
        let stations = Stations::new(
            stations
                .iter()
                .map(|(station, entrances)| (*station, entrances.to_vec()))
                .collect(),
        );
        let params = SearchParams {
            stations: &stations,
            walking_speed: 0.00138,
            mode: SearchMode::Exact,
            max_speed_kmh: 300.0,
            min_transfer: Duration::seconds(min_transfer_s),
            limits: Default::default(),
            options,
        };
        let mut fetch = |station: i64, _time: DateTime<Utc>| (timetable(station), 1);
        route_with_schedule(
            graph,
            &params,
            nodes,
            start(),
            &mut fetch,
            &mut SearchStats::default(),
        )
        .ok()
        .map(|itinerary| (itinerary.arrival_time - start()).num_seconds())
    }

    fn network(min_transfer_s: i64, options: RouteOptions) -> Option<i64> {
        let graph = Graph::from_parts(&[], &[]);
        arrival(
            &graph,
            &[(300, &[]), (400, &[]), (500, &[])],
            &[300, 500],
            min_transfer_s,
            options,
        )
    }

    #[test]
    fn min_transfer_decides_whether_a_tight_change_is_made() {
        assert_eq!(network(60, RouteOptions::default()), Some(1500));
        assert_eq!(network(300, RouteOptions::default()), Some(2400));
    }

    #[test]
    fn a_transfer_penalty_prefers_a_direct_vehicle() {
        let penalty = |seconds| RouteOptions {
            transfer_penalty: Duration::seconds(seconds),
            ..Default::default()
        };
        assert_eq!(network(60, penalty(600)), Some(1500));
        assert_eq!(network(60, penalty(1200)), Some(2400));
    }

    #[test]
    fn excluded_modes_are_never_boarded() {
        let excluding = |modes: &[&str]| RouteOptions {
            exclude_modes: modes.iter().map(|mode| mode.to_string()).collect(),
            ..Default::default()
        };
        assert_eq!(network(60, excluding(&["bus"])), Some(2400));
        assert_eq!(network(60, excluding(&["bus", "coach"])), None);
    }

    #[test]
    fn max_walk_limits_each_walk() {
        let graph = Graph::from_parts(
            &[(1, 0.0, 0.0), (2, 0.0, 0.027), (3, 0.0, -0.0027)],
            &[(3, 1), (1, 2)],
        );
        let walk_limit = |metres| RouteOptions {
            max_walk_m: metres,
            ..Default::default()
        };
        let stations: &[(i64, &[i64])] = &[(100, &[3]), (200, &[2])];
        assert_eq!(
            arrival(&graph, stations, &[1, 2], 60, walk_limit(None)),
            Some(2175)
        );
        assert_eq!(
            arrival(&graph, stations, &[1, 2], 60, walk_limit(Some(1000.0))),
            Some(3900)
        );
        assert_eq!(
            arrival(&graph, stations, &[1, 2], 60, walk_limit(Some(200.0))),
            None
        );
    }

    #[test]
    fn avoid_steps_takes_the_level_detour() {
        let graph = Graph::from_parts_with_steps(
            &[(10, 0.0, 0.0), (11, 0.0, 0.001), (12, 0.0005, 0.0005)],
            &[(10, 11, true), (10, 12, false), (12, 11, false)],
        );
        let stations = Stations::new(Default::default());
        let route = |avoid_steps| {
            let params = SearchParams {
                stations: &stations,
                walking_speed: 0.00138,
                mode: SearchMode::Exact,
                max_speed_kmh: 300.0,
                min_transfer: Duration::seconds(60),
                limits: Default::default(),
                options: RouteOptions {
                    avoid_steps,
                    ..Default::default()
                },
            };
            let mut fetch = |_: i64, _: DateTime<Utc>| (Vec::new(), 0);
            route_with_schedule(
                &graph,
                &params,
                &[10, 11],
                start(),
                &mut fetch,
                &mut SearchStats::default(),
            )
            .unwrap()
            .route[0]
                .nodes
                .clone()
        };
        assert_eq!(route(false), vec![10, 11]);
        assert_eq!(route(true), vec![10, 12, 11]);
    }

    #[test]
    fn excluded_plugins_are_not_even_asked() {
        let (train_log, bus_log) = (CallLog::new("exclude-train"), CallLog::new("exclude-bus"));
        let reply = send(
            logged_train_and_bus(&train_log, &bus_log),
            vec![request(
                "POST",
                "/",
                &json!({"required_nodes": [300, 500], "time": "20260808T120000", "exclude_modes": ["bus"]})
                    .to_string(),
            )],
        );
        assert_eq!(reply.status, 404, "{}", reply.raw);
        assert!(bus_log.explored_stations().is_empty());
        assert_eq!(train_log.explored_stations(), vec![300, 400]);
    }

    #[test]
    fn malformed_options_get_400() {
        for options in [
            json!({"min_transfer_s": -1}),
            json!({"min_transfer_s": 1.5}),
            json!({"max_walk_m": 0}),
            json!({"transfer_penalty_s": -5}),
            json!({"exclude_modes": "bus"}),
            json!({"exclude_modes": [1]}),
            json!({"avoid_steps": "yes"}),
        ] {
            let mut body = json!({"required_nodes": [1, 2]});
            body.as_object_mut()
                .unwrap()
                .extend(options.as_object().unwrap().clone());
            let reply = post_json(body.clone());
            assert_eq!(reply.status, 400, "{} -> {}", body, reply.raw);
        }
    }

    #[test]
    fn options_with_their_defaults_change_nothing() {
        let plain = post_json(json!({"required_nodes": [3, 2], "time": "20260808T120000"}));
        let explicit = post_json(json!({"required_nodes": [3, 2], "time": "20260808T120000",
            "min_transfer_s": 60, "transfer_penalty_s": 0, "exclude_modes": [], "avoid_steps": false}));
        assert_eq!(plain.json, explicit.json);
    }
}

mod checker {
    use super::*;
    use crate::checker::{Level, check};
    use crate::plugin::PluginSpec;

    fn fake(scenario: serde_json::Value) -> PluginSpec {
        PluginSpec {
            name: "fake".to_string(),
            program: "python3".to_string(),
            args: vec![
                "-I".to_string(),
                kit().join("fake_plugin.py").to_string_lossy().to_string(),
                scenario.to_string(),
            ],
        }
    }

    fn run(scenario: serde_json::Value) -> crate::checker::Report {
        check(&fake(scenario), short_timeouts(), chrono::Utc::now())
    }

    #[test]
    fn a_correct_plugin_passes() {
        let report = run(json!({
            "available": {"300": [3], "400": [2]},
            "explore": {"300": [{"to": 400, "offset": 120, "cost": 600,
                                 "line": {"id": "TER", "preferred_colour": "#0055A5", "ways": [10]}}]}
        }));
        assert!(report.passed(), "{}", report);
        assert_eq!(report.count(Level::Warning), 0, "{}", report);
    }

    #[test]
    fn a_broken_plugin_is_flagged() {
        let report = run(json!({
            "replies": {"attribution": {"data_owner": "Somebody"}},
            "available": {"300": [3, "4"], "400": [], "bus-stop": []},
            "explore": {"300": [
                {"to": 400, "offset": 120, "cost": -500},
                {"to": 999, "offset": 120, "cost": 600},
                {"to": 400, "offset": 120, "cost": 600, "time": "tomorrow"},
                {"to": 400, "offset": 120, "cost": 600, "line": {"preferred_colour": "red"}}
            ]}
        }));
        let text = report.to_string();
        assert!(!report.passed(), "{}", text);
        for expected in [
            "attribution needs a non-empty string data_license",
            "station key \"bus-stop\" is not an integer ID",
            "entrance \"4\" is a string",
            "cost -500 is negative",
            "to 999 is not a station listed by available",
            "time must be YYYYmmddTHHMMSS",
            "preferred_colour must be a hex colour",
        ] {
            assert!(
                text.contains(expected),
                "missing {:?} in:\n{}",
                expected,
                text
            );
        }
    }

    #[test]
    fn a_plugin_that_never_answers_is_a_problem() {
        let report = run(json!({"hang": ["explore"], "available": {"300": []}}));
        assert!(!report.passed());
        assert!(
            report
                .to_string()
                .contains("explore: no answer within the timeout"),
            "{}",
            report
        );
    }

    #[test]
    fn a_missing_program_is_reported() {
        let spec = PluginSpec {
            name: "missing".to_string(),
            program: "/nonexistent/plugin".to_string(),
            args: Vec::new(),
        };
        let report = check(&spec, short_timeouts(), chrono::Utc::now());
        assert!(!report.passed());
    }

    #[test]
    fn the_protocol_schemas_are_valid_json() {
        let folder = kit().join("..").join("docs").join("plugin-protocol");
        for name in [
            "request",
            "mode-reply",
            "attribution-reply",
            "available-reply",
            "explore-reply",
            "error-reply",
        ] {
            let path = folder.join(format!("{}.schema.json", name));
            let text = std::fs::read_to_string(&path).unwrap();
            let schema: serde_json::Value = serde_json::from_str(&text).unwrap();
            assert_eq!(
                schema["$schema"], "https://json-schema.org/draft/2020-12/schema",
                "{}",
                name
            );
            assert!(schema["title"].is_string(), "{}", name);
        }
    }

    #[test]
    fn the_command_line_picks_nix_or_a_command() {
        let args = |items: &[&str]| {
            items
                .iter()
                .map(|item| item.to_string())
                .collect::<Vec<_>>()
        };
        let nix = crate::checked_spec(&args(&[".#plugins.sncf-plugin"])).unwrap();
        assert_eq!(
            (nix.program.as_str(), nix.args),
            ("nix", args(&["run", ".#plugins.sncf-plugin"]))
        );
        let direct = crate::checked_spec(&args(&["--", "python3", "main.py"])).unwrap();
        assert_eq!(
            (direct.program.as_str(), direct.args),
            ("python3", args(&["main.py"]))
        );
        assert!(crate::checked_spec(&[]).is_none());
        assert!(crate::checked_spec(&args(&["a", "b"])).is_none());
    }
}

#[test]
fn the_flake_pins_the_image_the_server_uses_by_default() {
    let flake = std::fs::read_to_string(kit().join("..").join("flake.nix")).unwrap();
    let field = |name: &str| {
        flake
            .lines()
            .find_map(|line| {
                line.trim()
                    .strip_prefix(&format!("{} = \"", name))
                    .and_then(|rest| rest.strip_suffix("\";"))
            })
            .unwrap_or_default()
            .to_string()
    };
    let pinned = format!(
        "{}:{}",
        field("overpassImageName"),
        field("overpassImageTag")
    );
    assert_eq!(pinned, crate::config::DEFAULT_OVERPASS_IMAGE);
}
