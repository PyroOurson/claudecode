use crate::graph::Graph;
use crate::route::{
    RouteError, RouteOptions, RouteSegment, SearchLimits, SearchMode, SearchParams, SearchStats,
    Stations, parse_request_time, route_with_schedule,
};
use crate::transit::{self, Network};
use chrono::{DateTime, Duration, Utc};
use serde::Deserialize;
use serde_json::{Map, Value, json};
use std::collections::BTreeMap;

pub const DEFAULT_WALKING_SPEED: f64 = 0.00138;
pub const WALKING_SPEED_RANGE: (f64, f64) = (0.0003, 0.01);
pub const MAX_REQUIRED_NODES: usize = 25;
pub const MAX_SPEED_KMH: f64 = 300.0;
pub const MIN_TRANSFER_S: u64 = 60;
pub const MAX_SNAP_M: f64 = 500.0;
pub const SOURCE_URL: &str = "https://github.com/PyroOurson/claudecode/tree/claude/peaceful-thompson-u1uxhi/NaoiseGabi/maps-server";

pub struct Engine {
    pub graph: Graph,
    pub network: Network,
    pub stations: Stations,
}

#[derive(Deserialize)]
struct Request {
    required_nodes: Option<Vec<i64>>,
    waypoints: Option<Vec<[f64; 2]>>,
    time: Option<String>,
    walking_speed: Option<f64>,
    fast: Option<bool>,
    min_transfer_s: Option<u64>,
    max_walk_m: Option<f64>,
    transfer_penalty_s: Option<f64>,
    exclude_modes: Option<Vec<String>>,
    avoid_steps: Option<bool>,
    max_snap_m: Option<f64>,
    format: Option<String>,
}

struct Plan {
    nodes: Vec<i64>,
    snapped: Option<Value>,
    start: DateTime<Utc>,
    walking_speed: f64,
    mode: SearchMode,
    min_transfer: Duration,
    options: RouteOptions,
}

fn bad(message: impl Into<String>) -> (u16, Value) {
    (400, json!({ "error": message.into() }))
}

fn positive(name: &str, value: Option<f64>) -> Result<Option<f64>, (u16, Value)> {
    match value {
        Some(value) if !(value.is_finite() && value > 0.0) => Err(bad(format!(
            "{} must be a positive number of metres, got {}",
            name, value
        ))),
        other => Ok(other),
    }
}

fn credit(plugin: &str, data_owner: &str, plugin_owner: &str, plugin_license: &str) -> Value {
    json!({
        "plugin": plugin,
        "data_owner": data_owner,
        "data_license": "[ODbL](https://opendatacommons.org/licenses/odbl/1-0/)",
        "plugin_owner": plugin_owner,
        "plugin_license": plugin_license,
    })
}

impl Engine {
    pub fn load(bytes: &[u8]) -> Result<Engine, String> {
        let graph = Graph::from_pbf_bytes(bytes).map_err(|error| error.to_string())?;
        if graph.walkable_node_count() == 0 {
            return Err("the map file has no walkable ways".to_string());
        }
        let (network, stations) =
            Network::read(bytes, &graph).map_err(|error| error.to_string())?;
        Ok(Engine {
            graph,
            network,
            stations,
        })
    }

    pub fn info(&self) -> Value {
        let mut stops: Vec<&transit::Stop> = self.network.stops.values().collect();
        stops.sort_by_key(|stop| stop.id);
        json!({
            "nodes": self.graph.node_count(),
            "walkable_nodes": self.graph.walkable_node_count(),
            "edges": self.graph.edge_count(),
            "graph_bytes": self.graph.heap_bytes(),
            "bounds": self.graph.walkable_bounds(),
            "stops": stops,
            "patterns": self.network.patterns,
            "timetable": {
                "plugin": transit::PLUGIN_NAME,
                "headway_min": transit::HEADWAY_MIN,
                "first": format!("{:02}:{:02}", transit::FIRST_MIN / 60, transit::FIRST_MIN % 60),
                "last": format!("{:02}:{:02}", transit::LAST_MIN / 60, transit::LAST_MIN % 60),
                "speed_kmh": transit::SPEED_KMH,
                "detour": transit::DETOUR,
                "dwell_s": transit::DWELL_S,
            },
            "defaults": {
                "walking_speed": DEFAULT_WALKING_SPEED,
                "min_transfer_s": MIN_TRANSFER_S,
                "max_snap_m": MAX_SNAP_M,
                "max_speed_kmh": MAX_SPEED_KMH,
            },
            "source_url": SOURCE_URL,
        })
    }

    fn parse(&self, body: &[u8]) -> Result<Plan, (u16, Value)> {
        let value: Value = serde_json::from_slice(body)
            .map_err(|error| bad(format!("invalid JSON: {}", error)))?;
        if !value.is_object() {
            return Err(bad("the body must be a JSON object"));
        }
        let request: Request = serde_json::from_value(value)
            .map_err(|error| bad(format!("invalid request: {}", error)))?;

        if let Some(format) = &request.format
            && format != "json"
        {
            return Err(bad("this demo answers \"format\": \"json\" only"));
        }
        let max_snap_m = positive("max_snap_m", request.max_snap_m)?.unwrap_or(MAX_SNAP_M);
        let (nodes, snapped) = match (request.required_nodes, request.waypoints) {
            (Some(_), Some(_)) => {
                return Err(bad("send either required_nodes or waypoints, not both"));
            }
            (None, None) => return Err(bad("required_nodes or waypoints is missing")),
            (Some(nodes), None) => {
                if !(2..=MAX_REQUIRED_NODES).contains(&nodes.len()) {
                    return Err(bad(format!(
                        "required_nodes must have 2 to {} entries, got {}",
                        MAX_REQUIRED_NODES,
                        nodes.len()
                    )));
                }
                (nodes, None)
            }
            (None, Some(points)) => {
                if !(2..=MAX_REQUIRED_NODES).contains(&points.len()) {
                    return Err(bad(format!(
                        "waypoints must have 2 to {} entries, got {}",
                        MAX_REQUIRED_NODES,
                        points.len()
                    )));
                }
                let mut nodes = Vec::new();
                let mut snapped = Vec::new();
                for (index, &[lat, lon]) in points.iter().enumerate() {
                    if !(-90.0..=90.0).contains(&lat) || !(-180.0..=180.0).contains(&lon) {
                        return Err(bad(format!(
                            "waypoints[{}] is not a valid [latitude, longitude]",
                            index
                        )));
                    }
                    let (node, metres) = self
                        .graph
                        .nearest_walkable(lat, lon)
                        .filter(|&(_, metres)| metres <= max_snap_m)
                        .ok_or_else(|| {
                            bad(format!(
                                "waypoints[{}] is more than {} m from any walkable node (max_snap_m)",
                                index, max_snap_m
                            ))
                        })?;
                    nodes.push(node);
                    snapped.push(json!({
                        "input": [lat, lon],
                        "node": node,
                        "distance_m": (metres * 10.0).round() / 10.0,
                    }));
                }
                (nodes, Some(Value::Array(snapped)))
            }
        };

        let time = request
            .time
            .ok_or_else(|| bad("time is missing: the demo has no clock of its own"))?;
        let start = parse_request_time(&time)
            .ok_or_else(|| bad(format!("time {:?} does not parse", time)))?;
        let walking_speed = request.walking_speed.unwrap_or(DEFAULT_WALKING_SPEED);
        if !(WALKING_SPEED_RANGE.0..=WALKING_SPEED_RANGE.1).contains(&walking_speed) {
            return Err(bad(format!(
                "walking_speed must be between {} and {} km/s, got {}",
                WALKING_SPEED_RANGE.0, WALKING_SPEED_RANGE.1, walking_speed
            )));
        }
        let min_transfer_s = request.min_transfer_s.unwrap_or(MIN_TRANSFER_S);
        if min_transfer_s > 86_400 {
            return Err(bad(format!(
                "min_transfer_s must be a whole number of seconds between 0 and 86400, got {}",
                min_transfer_s
            )));
        }
        let transfer_penalty_s = request.transfer_penalty_s.unwrap_or(0.0);
        if !(transfer_penalty_s.is_finite() && (0.0..=86_400.0).contains(&transfer_penalty_s)) {
            return Err(bad(format!(
                "transfer_penalty_s must be a number of seconds between 0 and 86400, got {}",
                transfer_penalty_s
            )));
        }

        Ok(Plan {
            nodes,
            snapped,
            start,
            walking_speed,
            mode: if request.fast.unwrap_or(false) {
                SearchMode::Fast
            } else {
                SearchMode::Exact
            },
            min_transfer: Duration::seconds(min_transfer_s as i64),
            options: RouteOptions {
                max_walk_m: positive("max_walk_m", request.max_walk_m)?,
                transfer_penalty: Duration::milliseconds((transfer_penalty_s * 1000.0) as i64),
                exclude_modes: request.exclude_modes.unwrap_or_default(),
                avoid_steps: request.avoid_steps.unwrap_or(false),
            },
        })
    }

    fn position(&self, node: i64) -> Option<(f64, f64)> {
        self.graph
            .position(node)
            .or_else(|| self.network.position(node))
            .or_else(|| {
                self.stations
                    .entrances_of(node)
                    .iter()
                    .find_map(|&entrance| self.graph.position(entrance))
            })
    }

    fn segment(&self, segment: &RouteSegment) -> Value {
        let mut value = json!(segment);
        value["coordinates"] = json!(
            segment
                .nodes
                .iter()
                .filter_map(|&node| self.position(node))
                .map(|(lat, lon)| [lat, lon])
                .collect::<Vec<_>>()
        );
        value
    }

    pub fn plan(&self, body: &[u8]) -> (u16, Value) {
        let plan = match self.parse(body) {
            Ok(plan) => plan,
            Err(error) => return error,
        };
        let params = SearchParams {
            stations: &self.stations,
            walking_speed: plan.walking_speed,
            mode: plan.mode,
            max_speed_kmh: MAX_SPEED_KMH,
            min_transfer: plan.min_transfer,
            limits: SearchLimits::default(),
            options: plan.options,
        };
        let buses_excluded = params
            .options
            .exclude_modes
            .iter()
            .any(|mode| mode == transit::MODE);
        let mut fetch = |station: i64, time: DateTime<Utc>| {
            if buses_excluded {
                (Vec::new(), 0)
            } else {
                (self.network.journeys(station, time), 1)
            }
        };
        let mut stats = SearchStats::default();
        let result = route_with_schedule(
            &self.graph,
            &params,
            &plan.nodes,
            plan.start,
            &mut fetch,
            &mut stats,
        );
        let stats_json = json!({ "expanded": stats.expanded, "plugin_calls": stats.plugin_calls });
        let itinerary = match result {
            Ok(itinerary) => itinerary,
            Err(RouteError::NoRoute { from, to }) => {
                return (
                    404,
                    json!({ "error": "no route", "failed_leg": [from, to], "stats": stats_json }),
                );
            }
            Err(RouteError::LimitReached { limit }) => {
                return (
                    404,
                    json!({ "error": "no route within limits", "limit": limit, "stats": stats_json }),
                );
            }
        };

        let mut attribution = vec![credit(
            "OpenStreetMap",
            "[OpenStreetMap contributors](https://www.openstreetmap.org/copyright)",
            &format!("[maps-server]({})", SOURCE_URL),
            "[AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.html)",
        )];
        if itinerary
            .route
            .iter()
            .any(|segment| segment.plugin.is_some())
        {
            attribution.push(credit(
                transit::PLUGIN_NAME,
                "Lines and stops: [OpenStreetMap contributors](https://www.openstreetmap.org/copyright). Departure times are made up for this demo.",
                "maps-server demo",
                "[AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.html)",
            ));
        }
        let stop_names: BTreeMap<String, String> = itinerary
            .route
            .iter()
            .flat_map(|segment| segment.nodes.iter())
            .filter_map(|node| self.network.stops.get(node))
            .map(|stop| (stop.id.to_string(), stop.name.clone()))
            .collect();

        let mut body = Map::new();
        body.insert(
            "route".to_string(),
            Value::Array(
                itinerary
                    .route
                    .iter()
                    .map(|segment| self.segment(segment))
                    .collect(),
            ),
        );
        body.insert("arrival_time".to_string(), json!(itinerary.arrival_time));
        body.insert("attribution".to_string(), Value::Array(attribution));
        if let Some(snapped) = plan.snapped {
            body.insert("snapped".to_string(), snapped);
        }
        body.insert("stop_names".to_string(), json!(stop_names));
        body.insert("stats".to_string(), stats_json);
        (200, Value::Object(body))
    }
}
