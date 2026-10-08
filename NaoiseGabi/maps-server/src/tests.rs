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
    let train = "2026-08-08T12:19:37Z";
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
