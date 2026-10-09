use chrono::{DateTime, Utc};
use maps_demo_engine::api::Engine;
use maps_demo_engine::transit::{next_departure, utc_offset};
use serde_json::{Value, json};
use std::sync::OnceLock;

const MONACO: &[u8] = include_bytes!("../../monaco.osm.pbf");
const FONTVIEILLE: [f64; 2] = [43.7287, 7.4155];
const LARVOTTO: [f64; 2] = [43.7441, 7.4361];
const NOON: &str = "2026-10-08T10:00:00Z";

fn engine() -> &'static Engine {
    static ENGINE: OnceLock<Engine> = OnceLock::new();
    ENGINE.get_or_init(|| Engine::load(MONACO).expect("Monaco loads"))
}

fn plan(body: Value) -> (u16, Value) {
    engine().plan(body.to_string().as_bytes())
}

fn time(value: &Value) -> DateTime<Utc> {
    value
        .as_str()
        .expect("a time")
        .parse()
        .expect("an RFC 3339 time")
}

fn modes(body: &Value) -> Vec<String> {
    body["route"]
        .as_array()
        .expect("a route")
        .iter()
        .map(|segment| segment["mode"].as_str().unwrap_or("").to_string())
        .collect()
}

#[test]
fn monaco_has_a_walking_graph_and_its_bus_lines() {
    let info = engine().info();
    assert!(info["walkable_nodes"].as_u64().unwrap() > 4000);
    assert_eq!(info["patterns"].as_array().unwrap().len(), 10);
    let lines: Vec<&str> = info["patterns"]
        .as_array()
        .unwrap()
        .iter()
        .map(|pattern| pattern["line"].as_str().unwrap())
        .collect();
    assert_eq!(lines, ["1", "1", "2", "2", "4", "4", "5", "5", "6", "6"]);
    let bounds = &info["bounds"];
    assert!(bounds[0][0].as_f64().unwrap() > 43.7 && bounds[1][0].as_f64().unwrap() < 43.76);
}

#[test]
fn a_long_trip_at_noon_takes_a_bus_and_keeps_times_in_order() {
    let (status, body) = plan(json!({ "waypoints": [FONTVIEILLE, LARVOTTO], "time": NOON }));
    assert_eq!(status, 200, "{}", body);
    assert!(modes(&body).iter().any(|mode| mode == "bus"), "{}", body);
    let mut clock = time(&json!(NOON));
    for segment in body["route"].as_array().unwrap() {
        let departure = time(&segment["departure_time"]);
        let arrival = time(&segment["arrival_time"]);
        assert!(departure >= clock && arrival >= departure, "{}", segment);
        assert_eq!(
            segment["coordinates"].as_array().unwrap().len(),
            segment["nodes"].as_array().unwrap().len()
        );
        clock = arrival;
    }
    assert_eq!(time(&body["arrival_time"]), clock);
    let plugins: Vec<&str> = body["attribution"]
        .as_array()
        .unwrap()
        .iter()
        .map(|credit| credit["plugin"].as_str().unwrap())
        .collect();
    assert_eq!(plugins, ["OpenStreetMap", "sample-buses"]);
    assert_eq!(body["snapped"].as_array().unwrap().len(), 2);
}

#[test]
fn without_buses_the_same_trip_is_walked_and_takes_longer() {
    let (_, by_bus) = plan(json!({ "waypoints": [FONTVIEILLE, LARVOTTO], "time": NOON }));
    let (status, walked) = plan(json!({
        "waypoints": [FONTVIEILLE, LARVOTTO],
        "time": NOON,
        "exclude_modes": ["bus"],
    }));
    assert_eq!(status, 200);
    assert_eq!(modes(&walked), ["walking"]);
    assert_eq!(walked["stats"]["plugin_calls"], 0);
    assert!(time(&walked["arrival_time"]) > time(&by_bus["arrival_time"]));
}

#[test]
fn no_buses_run_late_at_night() {
    let (status, body) =
        plan(json!({ "waypoints": [FONTVIEILLE, LARVOTTO], "time": "2026-10-08T21:30:00Z" }));
    assert_eq!(status, 200);
    assert_eq!(modes(&body), ["walking"]);
}

#[test]
fn exact_search_is_never_slower_than_fast_search() {
    let (_, exact) = plan(json!({ "waypoints": [FONTVIEILLE, LARVOTTO], "time": NOON }));
    let (_, fast) =
        plan(json!({ "waypoints": [FONTVIEILLE, LARVOTTO], "time": NOON, "fast": true }));
    assert!(time(&exact["arrival_time"]) <= time(&fast["arrival_time"]));
}

#[test]
fn bad_requests_get_400_with_a_message() {
    let cases = [
        json!({ "waypoints": [FONTVIEILLE], "time": NOON }),
        json!({ "waypoints": [[48.85, 2.35], LARVOTTO], "time": NOON }),
        json!({ "waypoints": [FONTVIEILLE, LARVOTTO] }),
        json!({ "waypoints": [FONTVIEILLE, LARVOTTO], "time": "soon" }),
        json!({ "waypoints": [FONTVIEILLE, LARVOTTO], "time": NOON, "walking_speed": 1 }),
        json!({ "waypoints": [FONTVIEILLE, LARVOTTO], "time": NOON, "min_transfer_s": 60.5 }),
        json!({ "waypoints": [FONTVIEILLE, LARVOTTO], "time": NOON, "max_walk_m": -1 }),
        json!({ "waypoints": [FONTVIEILLE, LARVOTTO], "required_nodes": [1, 2], "time": NOON }),
        json!([1, 2]),
    ];
    for case in cases {
        let (status, body) = plan(case.clone());
        assert_eq!(status, 400, "{} -> {}", case, body);
        assert!(body["error"].as_str().is_some_and(|text| !text.is_empty()));
    }
    let (status, _) = engine().plan(b"{");
    assert_eq!(status, 400);
}

#[test]
fn unknown_nodes_get_404_with_the_failed_leg() {
    let (status, body) = plan(json!({ "required_nodes": [1, 2], "time": NOON }));
    assert_eq!(status, 404);
    assert_eq!(body["error"], "no route");
    assert_eq!(body["failed_leg"], json!([1, 2]));
}

#[test]
fn monaco_time_follows_european_summer_time() {
    let at = |value: &str| value.parse::<DateTime<Utc>>().unwrap();
    assert_eq!(utc_offset(at("2026-01-15T12:00:00Z")).num_hours(), 1);
    assert_eq!(utc_offset(at("2026-03-29T00:59:00Z")).num_hours(), 1);
    assert_eq!(utc_offset(at("2026-03-29T01:00:00Z")).num_hours(), 2);
    assert_eq!(utc_offset(at("2026-10-25T00:59:00Z")).num_hours(), 2);
    assert_eq!(utc_offset(at("2026-10-25T01:00:00Z")).num_hours(), 1);
}

#[test]
fn buses_leave_every_ten_minutes_from_six_to_ten_monaco_time() {
    let at = |value: &str| value.parse::<DateTime<Utc>>().unwrap();
    assert_eq!(
        next_departure(0, at("2026-01-15T04:59:00Z")),
        Some(at("2026-01-15T05:00:00Z"))
    );
    assert_eq!(
        next_departure(0, at("2026-07-15T03:59:00Z")),
        Some(at("2026-07-15T04:00:00Z"))
    );
    assert_eq!(
        next_departure(0, at("2026-07-15T10:01:00Z")),
        Some(at("2026-07-15T10:10:00Z"))
    );
    assert_eq!(
        next_departure(90, at("2026-07-15T10:01:00Z")),
        Some(at("2026-07-15T10:01:30Z"))
    );
    assert_eq!(
        next_departure(0, at("2026-07-15T20:00:00Z")),
        Some(at("2026-07-15T20:00:00Z"))
    );
    assert_eq!(
        next_departure(0, at("2026-07-15T20:00:01Z")),
        Some(at("2026-07-16T04:00:00Z"))
    );
}

#[test]
fn the_wasm_entry_points_load_the_map_and_answer_json() {
    use maps_demo_engine::ffi;
    let read = || {
        let bytes = unsafe { std::slice::from_raw_parts(ffi::output_ptr(), ffi::output_len()) };
        serde_json::from_slice::<Value>(bytes).unwrap()
    };
    let request = json!({ "waypoints": [FONTVIEILLE, LARVOTTO], "time": NOON }).to_string();
    unsafe {
        assert_eq!(ffi::plan(request.as_ptr(), request.len()), 503);
        assert_eq!(ffi::load(MONACO.as_ptr(), MONACO.len()), 200);
        assert_eq!(read()["patterns"].as_array().unwrap().len(), 10);
        assert_eq!(ffi::plan(request.as_ptr(), request.len()), 200);
        assert!(read()["route"].is_array());
        assert_eq!(ffi::load(b"not a map".as_ptr(), 9), 400);
        let pointer = ffi::alloc(16);
        ffi::dealloc(pointer, 16);
    }
}
