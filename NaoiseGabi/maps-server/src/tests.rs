// SPDX-License-Identifier: AGPL-3.0
// Copyright (C) 2026 Naoise McG
use crate::config::Config;
use crate::testkit::{
    CallLog, exchange, has_route, plugin, request, send, serve, serve_state, state_with,
};
use serde_json::json;

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
