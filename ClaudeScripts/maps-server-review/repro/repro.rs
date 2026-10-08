use super::{Plugin, build_station_access_map, handle_client};
use crate::route::{OutgoingJourney, RouteSegment, StationAccessMap, route_with_schedule};
use chrono::{DateTime, Duration, NaiveDateTime, Utc};
use serde_json::{Value, json};
use std::io::{BufReader, Read, Write};
use std::net::{TcpListener, TcpStream};
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;

const TIME_FORMAT: &str = "%Y%m%dT%H%M%S";
const START: &str = "20260808T120000";
const WALKING_SPEED: f64 = 0.00138;

fn start() -> DateTime<Utc> {
    NaiveDateTime::parse_from_str(START, TIME_FORMAT).unwrap().and_utc()
}

fn at(seconds: i64) -> DateTime<Utc> {
    start() + Duration::seconds(seconds)
}

fn access(entries: &[(i64, &[i64])]) -> StationAccessMap {
    entries.iter().map(|(station, entrances)| (*station, entrances.to_vec())).collect()
}

fn leg(to: i64, departure: i64, cost: u64, plugin: usize) -> OutgoingJourney {
    OutgoingJourney {
        target_station: to,
        departure: at(departure),
        cost_seconds: cost,
        plugin_id: Some(plugin),
        mode: "train".to_string(),
        line: None,
    }
}

fn plan(
    nodes: Vec<i64>,
    stations: &StationAccessMap,
    legs: fn(i64) -> Vec<OutgoingJourney>,
    estimate_off: bool,
) -> (Vec<RouteSegment>, DateTime<Utc>) {
    let mut fetch = |station: i64, _time: DateTime<Utc>| legs(station);
    let (route, _, arrival) = route_with_schedule(nodes, stations, &mut fetch, start(), WALKING_SPEED, estimate_off);
    (route, arrival)
}

fn train_behind_start(station: i64) -> Vec<OutgoingJourney> {
    if station == 100 { vec![leg(200, 900, 300, 0)] } else { Vec::new() }
}

fn two_plugins(station: i64) -> Vec<OutgoingJourney> {
    match station {
        300 => vec![leg(400, 120, 600, 0)],
        400 => vec![leg(500, 1200, 600, 1)],
        _ => Vec::new(),
    }
}

fn one_plugin(station: i64) -> Vec<OutgoingJourney> {
    match station {
        300 => vec![leg(400, 120, 600, 0)],
        400 => vec![leg(500, 1200, 600, 0)],
        600 => vec![leg(700, 120, 600, 0)],
        700 => vec![leg(800, 1200, 600, 0)],
        _ => Vec::new(),
    }
}

#[test]
fn default_search_takes_the_faster_train() {
    let stations = access(&[(100, &[3]), (200, &[2])]);
    let (_, arrival) = plan(vec![1, 2], &stations, train_behind_start, false);
    assert_eq!(arrival, at(1200), "walking 1 -> 2 takes 36 min, the train from station 100 (300 m behind the start) arrives at +20 min, but the default search returned the walk");
}

#[test]
fn control_search_without_estimate_takes_the_train() {
    let stations = access(&[(100, &[3]), (200, &[2])]);
    let (_, arrival) = plan(vec![1, 2], &stations, train_behind_start, true);
    assert_eq!(arrival, at(1200));
}

#[test]
fn a_change_between_vehicles_stays_visible() {
    let stations = access(&[(300, &[]), (400, &[]), (500, &[])]);
    let (route, _) = plan(vec![300, 500], &stations, two_plugins, true);
    let legs: Vec<&Vec<i64>> = route.iter().map(|segment| &segment.nodes).collect();
    assert_eq!(route.len(), 2, "two trains 300 -> 400 and 400 -> 500 with an 8 min wait were merged into {legs:?}");
}

#[test]
fn a_change_between_two_vehicles_of_one_plugin_is_possible() {
    let stations = access(&[(300, &[]), (400, &[]), (500, &[])]);
    let (route, arrival) = plan(vec![300, 500], &stations, one_plugin, true);
    assert!(!route.is_empty() && arrival == at(1800), "no route: train 1 reaches 400 at +12 min and train 2 of the same plugin leaves 400 at +20 min");
}

#[test]
fn control_same_plugin_change_works_when_the_station_node_is_on_a_footway() {
    let stations = access(&[(600, &[]), (700, &[]), (800, &[])]);
    let (route, arrival) = plan(vec![600, 800], &stations, one_plugin, true);
    assert!(!route.is_empty());
    assert_eq!(arrival, at(1800));
}

fn kit() -> PathBuf {
    PathBuf::from(std::env::var("REPRO_KIT").expect("set REPRO_KIT to the repro folder"))
}

fn plugin(name: &str, scenario: Value) -> Plugin {
    let python = std::env::var("REPRO_PYTHON").unwrap_or_else(|_| "python3".to_string());
    let mut child = Command::new(python)
        .arg("-I")
        .arg(kit().join("fake_plugin.py"))
        .arg(scenario.to_string())
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .expect("could not start fake_plugin.py");
    Plugin {
        name: name.to_string(),
        mode: scenario["mode"].as_str().unwrap_or("train").to_string(),
        data_attribution: "Fake data".to_string(),
        data_license: "CC0".to_string(),
        plugin_attribution: "maps-server-review".to_string(),
        plugin_license: "CC0".to_string(),
        stdin: child.stdin.take().unwrap(),
        stdout: BufReader::new(child.stdout.take().unwrap()),
    }
}

fn post(body: &str) -> Vec<u8> {
    format!(
        "POST / HTTP/1.1\r\nHost: localhost\r\nContent-Type: application/json\r\nContent-Length: {}\r\n\r\n{}",
        body.len(),
        body
    )
    .into_bytes()
}

fn walk_body(extra: Value) -> String {
    let mut body = json!({"required_nodes": [1, 2], "time": START});
    if let (Some(fields), Some(more)) = (body.as_object_mut(), extra.as_object()) {
        fields.extend(more.clone());
    }
    body.to_string()
}

struct Reply {
    status: u16,
    json: Value,
    raw: String,
}

fn send(mut plugins: Vec<Plugin>, chunks: Vec<Vec<u8>>) -> Reply {
    let stations = Arc::new(build_station_access_map(&mut plugins));
    let plugins = Arc::new(Mutex::new(plugins));
    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    let address = listener.local_addr().unwrap();
    let server = thread::spawn(move || {
        let (stream, _) = listener.accept().unwrap();
        handle_client(stream, plugins, stations);
    });
    let mut client = TcpStream::connect(address).unwrap();
    client.set_nodelay(true).unwrap();
    client.set_read_timeout(Some(std::time::Duration::from_secs(30))).unwrap();
    for (index, chunk) in chunks.iter().enumerate() {
        if index > 0 {
            thread::sleep(std::time::Duration::from_millis(300));
        }
        let _ = client.write_all(chunk);
    }
    let mut bytes = Vec::new();
    let _ = client.read_to_end(&mut bytes);
    let _ = server.join();
    let raw = String::from_utf8_lossy(&bytes).to_string();
    let status = raw.split(' ').nth(1).and_then(|code| code.parse().ok()).unwrap_or(0);
    let json = raw
        .split_once("\r\n\r\n")
        .and_then(|(_, body)| serde_json::from_str(body).ok())
        .unwrap_or(Value::Null);
    Reply { status, json, raw }
}

fn has_route(reply: &Reply) -> bool {
    reply.status == 200 && reply.json["route"].as_array().is_some_and(|route| !route.is_empty())
}

fn shared_station(train_also_leaves_400: bool) -> Vec<Plugin> {
    let back = if train_also_leaves_400 { json!([{"to": 300, "offset": 120, "cost": 600}]) } else { json!([]) };
    vec![
        plugin("train", json!({"mode": "train", "available": {"300": [], "400": []}, "explore": {"300": [{"to": 400, "offset": 120, "cost": 600}], "400": back}})),
        plugin("bus", json!({"mode": "bus", "available": {"400": [], "500": []}, "explore": {"400": [{"to": 500, "offset": 300, "cost": 600}]}})),
    ]
}

fn train_plugin_behind_start() -> Vec<Plugin> {
    vec![plugin("train", json!({"available": {"100": [3], "200": [2]}, "explore": {"100": [{"to": 200, "offset": 600, "cost": 300}]}}))]
}

#[test]
fn control_walking_route_works() {
    let reply = send(Vec::new(), vec![post(&walk_body(json!({})))]);
    assert!(has_route(&reply), "{}", reply.raw);
}

#[test]
fn every_plugin_serving_a_station_is_asked() {
    let reply = send(shared_station(true), vec![post(&json!({"required_nodes": [300, 500], "time": START}).to_string())]);
    assert!(has_route(&reply), "train to 400 then bus to 500 exists, but the train plugin also has departures from 400 so the bus plugin is never asked: {}", reply.raw);
}

#[test]
fn control_bus_plugin_is_asked_when_the_train_plugin_has_nothing() {
    let reply = send(shared_station(false), vec![post(&json!({"required_nodes": [300, 500], "time": START}).to_string())]);
    assert!(has_route(&reply), "{}", reply.raw);
}

#[test]
fn string_ids_from_plugins_are_accepted() {
    let plugins = vec![plugin("readme", json!({"available": {"300": [], "400": []}, "explore": {"300": [{"to": "400", "offset": 120, "cost": 600}]}}))];
    let reply = send(plugins, vec![post(&json!({"required_nodes": [300, 400], "time": START}).to_string())]);
    assert!(has_route(&reply), "a journey with \"to\": \"400\" (string, as the README shows) was dropped: {}", reply.raw);
}

#[test]
fn string_entrance_ids_from_plugins_are_accepted() {
    let mut plugins = vec![plugin("readme", json!({"available": {"100": ["3"]}}))];
    let stations = build_station_access_map(&mut plugins);
    assert_eq!(stations.get(&100), Some(&vec![3]), "entrances given as strings, as the README shows, were dropped");
}

#[test]
fn heuristic_true_and_heuristic_1_mean_the_same() {
    let number = send(train_plugin_behind_start(), vec![post(&walk_body(json!({"heuristic": 1})))]);
    let boolean = send(train_plugin_behind_start(), vec![post(&walk_body(json!({"heuristic": true})))]);
    assert_eq!(number.json["arrival_time"], boolean.json["arrival_time"], "\"heuristic\": 1 and \"heuristic\": true returned different routes");
}

#[test]
fn invalid_json_gets_400() {
    let reply = send(Vec::new(), vec![post("{")]);
    assert_eq!(reply.status, 400, "no proper answer, the handler panicked: {:?}", reply.raw);
}

#[test]
fn missing_required_nodes_gets_400() {
    let reply = send(Vec::new(), vec![post(&json!({"time": START}).to_string())]);
    assert_eq!(reply.status, 400, "no proper answer, the handler panicked: {:?}", reply.raw);
}

#[test]
fn zero_walking_speed_gets_400() {
    let reply = send(Vec::new(), vec![post(&walk_body(json!({"walking_speed": 0})))]);
    assert_eq!(reply.status, 400, "no proper answer, the handler panicked: {:?}", reply.raw);
}

#[test]
fn unparsable_time_gets_400() {
    let reply = send(Vec::new(), vec![post(&walk_body(json!({"time": "260808T131000"})))]);
    assert_eq!(reply.status, 400, "the time was silently replaced by the current time, arrival_time = {}", reply.json["arrival_time"]);
}

#[test]
fn unreachable_destination_gets_404() {
    let reply = send(Vec::new(), vec![post(&json!({"required_nodes": [1, 999], "time": START}).to_string())]);
    assert_eq!(reply.status, 404, "no route exists, the server answered: {}", reply.raw);
}

#[test]
fn a_body_sent_in_a_second_packet_is_read() {
    let request = post(&walk_body(json!({})));
    let split = request.windows(4).position(|w| w == b"\r\n\r\n").unwrap() + 4;
    let reply = send(Vec::new(), vec![request[..split].to_vec(), request[split..].to_vec()]);
    assert_eq!(reply.status, 200, "only the headers were read, the handler panicked: {:?}", reply.raw);
}

#[test]
fn long_headers_do_not_cut_the_body() {
    let body = walk_body(json!({"note": "x".repeat(300)}));
    let request = format!(
        "POST / HTTP/1.1\r\nHost: localhost\r\nX-Padding: {}\r\nContent-Type: application/json\r\nContent-Length: {}\r\n\r\n{}",
        "a".repeat(1850),
        body.len(),
        body
    );
    let reply = send(Vec::new(), vec![request.into_bytes()]);
    assert_eq!(reply.status, 200, "a 2.3 KB request was cut at 2048 bytes, the handler panicked: {:?}", reply.raw);
}

#[test]
fn negative_costs_never_arrive_before_departing() {
    let plugins = vec![plugin("broken", json!({"available": {"300": [], "400": []}, "explore": {"300": [{"to": 400, "offset": 120, "cost": -500}]}}))];
    let reply = send(plugins, vec![post(&json!({"required_nodes": [300, 400], "time": START}).to_string())]);
    let backwards: Vec<String> = reply.json["route"]
        .as_array()
        .into_iter()
        .flatten()
        .filter(|segment| {
            let departure: Option<DateTime<Utc>> = segment["departure_time"].as_str().and_then(|t| t.parse().ok());
            let arrival: Option<DateTime<Utc>> = segment["arrival_time"].as_str().and_then(|t| t.parse().ok());
            matches!((departure, arrival), (Some(d), Some(a)) if a < d)
        })
        .map(|segment| segment.to_string())
        .collect();
    assert!(backwards.is_empty(), "a journey with cost -500 arrives before it departs: {backwards:?}");
}
