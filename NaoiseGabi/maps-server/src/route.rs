// SPDX-License-Identifier: AGPL-3.0
// Copyright (C) 2026 Naoise McG
use chrono::{DateTime, Duration, NaiveDateTime, Utc};
use osmpbf::{Element, ElementReader, Way};
use serde::{Deserialize, Serialize};
use std::{
    cmp::Ordering,
    collections::{BinaryHeap, HashMap, HashSet},
    sync::LazyLock,
};

pub type StationAccessMap = HashMap<i64, Vec<i64>>;
type StateKey = (i64, bool);

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Line {
    pub id: Option<String>,
    pub preferred_colour: Option<String>,
}

#[derive(Clone, Debug)]
struct TransitionEdge {
    from_key: StateKey,
    mode: String,
    line: Option<Line>,
    departure: DateTime<Utc>,
    arrival: DateTime<Utc>,
}

#[derive(Clone, Debug)]
pub struct OutgoingJourney {
    pub target_station: i64,
    pub departure: DateTime<Utc>,
    pub cost_seconds: u64,
    pub plugin_id: Option<usize>,
    pub mode: String,
    pub line: Option<Line>,
}

#[derive(Clone, Debug, Serialize)]
pub struct RouteSegment {
    pub mode: String,
    pub line: Option<Line>,
    pub nodes: Vec<i64>,
    pub departure_time: DateTime<Utc>,
    pub arrival_time: DateTime<Utc>,
}

#[derive(Clone, PartialEq)]
struct SearchState {
    estimated_total: f64,
    node: i64,
    arrival_time: DateTime<Utc>,
    last_plugin_id: Option<usize>,
}

impl Eq for SearchState {}

impl Ord for SearchState {
    fn cmp(&self, other: &Self) -> Ordering {
        other
            .estimated_total
            .partial_cmp(&self.estimated_total)
            .unwrap_or(Ordering::Equal)
    }
}

impl PartialOrd for SearchState {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

pub static GRAPH: LazyLock<Graph> = LazyLock::new(|| {
    let file_paths: Vec<String> = crate::OSM_PBF_FILES
        .iter()
        .map(|f| format!("assets/{}", f))
        .collect();

    Graph::from_pbfs(&file_paths).expect("Failed to load OSM PBF files")
});

pub fn route_with_schedule<F>(
    required_nodes: Vec<i64>,
    station_access: &StationAccessMap,
    fetch_outgoing: &mut F,
    start_time: DateTime<Utc>,
    walking_speed: f64,
    use_heuristic: bool,
) -> (Vec<RouteSegment>, HashSet<i64>, DateTime<Utc>)
where
    F: FnMut(i64, DateTime<Utc>) -> Vec<OutgoingJourney>,
{
    let mut full_route = Vec::new();
    let mut explored_nodes = HashSet::new();
    let mut current_time = start_time;
    let context = SearchContext {
        station_access,
        entrance_map: build_entrance_map(station_access),
        walking_speed,
        use_heuristic,
    };

    if required_nodes.is_empty() {
        return (full_route, explored_nodes, current_time);
    }

    for window in required_nodes.windows(2) {
        let start_node = window[0];
        let end_node = window[1];

        match a_star_time_dependent(
            start_node,
            end_node,
            &context,
            fetch_outgoing,
            current_time,
            &mut explored_nodes,
        ) {
            Some((segment, arrival_time)) => {
                full_route.extend(segment);
                current_time = arrival_time;
            }
            None => return (Vec::new(), explored_nodes, current_time),
        }
    }

    (full_route, explored_nodes, current_time)
}

pub fn parse_journey_departure(value: &str) -> Result<DateTime<Utc>, chrono::ParseError> {
    NaiveDateTime::parse_from_str(value, "%Y%m%dT%H%M%S")
        .or_else(|_| NaiveDateTime::parse_from_str(value, "%Y-%m-%dT%H:%M:%S"))
        .map(|naive| naive.and_utc())
}

fn build_entrance_map(station_access: &StationAccessMap) -> HashMap<i64, Vec<i64>> {
    let mut entrance_map: HashMap<i64, Vec<i64>> = HashMap::new();
    for (&station, entrances) in station_access {
        for &entry in entrances {
            entrance_map.entry(entry).or_default().push(station);
        }
    }
    entrance_map
}

struct SearchContext<'a> {
    station_access: &'a StationAccessMap,
    entrance_map: HashMap<i64, Vec<i64>>,
    walking_speed: f64,
    use_heuristic: bool,
}

fn a_star_time_dependent<F>(
    start_node: i64,
    end_node: i64,
    context: &SearchContext,
    fetch_outgoing: &mut F,
    start_time: DateTime<Utc>,
    explored_nodes: &mut HashSet<i64>,
) -> Option<(Vec<RouteSegment>, DateTime<Utc>)>
where
    F: FnMut(i64, DateTime<Utc>) -> Vec<OutgoingJourney>,
{
    let graph = &*GRAPH;
    let station_access = context.station_access;
    let entrance_map = &context.entrance_map;
    let walking_speed = context.walking_speed;
    let use_heuristic = context.use_heuristic;
    let mut open_set = BinaryHeap::new();
    let mut best_arrival: HashMap<StateKey, DateTime<Utc>> = HashMap::new();
    let mut predecessors: HashMap<StateKey, TransitionEdge> = HashMap::new();

    let start_key = (start_node, false);
    let start_heuristic = heuristic_seconds(
        start_node,
        end_node,
        station_access,
        walking_speed,
        use_heuristic,
    );
    open_set.push(SearchState {
        estimated_total: start_time.timestamp() as f64 + start_heuristic,
        node: start_node,
        arrival_time: start_time,
        last_plugin_id: None,
    });
    best_arrival.insert(start_key, start_time);

    if start_node == end_node {
        explored_nodes.insert(start_node);
        return Some((Vec::new(), start_time));
    }

    while let Some(state) = open_set.pop() {
        let current_node = state.node;
        explored_nodes.insert(current_node);

        let current_time = state.arrival_time;
        let current_is_transit = state.last_plugin_id.is_some();
        let current_key = (current_node, current_is_transit);

        if let Some(&best_time) = best_arrival.get(&current_key)
            && current_time > best_time
        {
            continue;
        }

        if current_node == end_node {
            let path = reconstruct_path(&predecessors, start_key, current_key);
            return Some((path, current_time));
        }

        if let Some(neighbors) = graph.ways_from_node(current_node) {
            for (&next_node, &distance) in neighbors {
                let travel_seconds = distance / walking_speed;
                let arrival_time =
                    current_time + Duration::milliseconds((travel_seconds * 1000.0).round() as i64);
                let next_key = (next_node, false);

                if is_better_arrival(&best_arrival, next_key, arrival_time) {
                    best_arrival.insert(next_key, arrival_time);
                    predecessors.insert(
                        next_key,
                        TransitionEdge {
                            from_key: current_key,
                            mode: "walking".to_string(),
                            line: None,
                            departure: current_time,
                            arrival: arrival_time,
                        },
                    );
                    let estimated_total = arrival_time.timestamp() as f64
                        + heuristic_seconds(
                            next_node,
                            end_node,
                            station_access,
                            walking_speed,
                            use_heuristic,
                        );
                    open_set.push(SearchState {
                        estimated_total,
                        node: next_node,
                        arrival_time,
                        last_plugin_id: None,
                    });
                }
            }
        }

        if let Some(entrances) = station_access.get(&current_node) {
            for &entrance_node in entrances {
                let next_key = (entrance_node, false);
                if is_better_arrival(&best_arrival, next_key, current_time) {
                    best_arrival.insert(next_key, current_time);
                    predecessors.insert(
                        next_key,
                        TransitionEdge {
                            from_key: current_key,
                            mode: "walking".to_string(),
                            line: None,
                            departure: current_time,
                            arrival: current_time,
                        },
                    );
                    let estimated_total = current_time.timestamp() as f64
                        + heuristic_seconds(
                            entrance_node,
                            end_node,
                            station_access,
                            walking_speed,
                            use_heuristic,
                        );
                    open_set.push(SearchState {
                        estimated_total,
                        node: entrance_node,
                        arrival_time: current_time,
                        last_plugin_id: None,
                    });
                }
            }
        }

        if let Some(stations) = entrance_map.get(&current_node) {
            let prev_node = predecessors.get(&current_key).map(|k| k.from_key.0);
            for &station_node in stations {
                if Some(station_node) == prev_node {
                    continue;
                }

                let next_key = (station_node, false);
                if is_better_arrival(&best_arrival, next_key, current_time) {
                    best_arrival.insert(next_key, current_time);
                    predecessors.insert(
                        next_key,
                        TransitionEdge {
                            from_key: current_key,
                            mode: "walking".to_string(),
                            line: None,
                            departure: current_time,
                            arrival: current_time,
                        },
                    );
                    let estimated_total = current_time.timestamp() as f64
                        + heuristic_seconds(
                            station_node,
                            end_node,
                            station_access,
                            walking_speed,
                            use_heuristic,
                        );
                    open_set.push(SearchState {
                        estimated_total,
                        node: station_node,
                        arrival_time: current_time,
                        last_plugin_id: None,
                    });
                }
            }
        }

        if station_access.contains_key(&current_node) {
            let journeys = fetch_outgoing(current_node, current_time + Duration::seconds(60));
            for journey in journeys {
                if journey.target_station == current_node {
                    continue;
                }

                if let (Some(last_p), Some(leg_p)) = (state.last_plugin_id, journey.plugin_id)
                    && last_p == leg_p
                {
                    continue;
                }

                if journey.departure < current_time {
                    continue;
                }

                let arrival_time =
                    journey.departure + Duration::seconds(journey.cost_seconds as i64);
                let next_key = (journey.target_station, true);

                if is_better_arrival(&best_arrival, next_key, arrival_time) {
                    best_arrival.insert(next_key, arrival_time);
                    predecessors.insert(
                        next_key,
                        TransitionEdge {
                            from_key: current_key,
                            mode: journey.mode.clone(),
                            line: journey.line.clone(),
                            departure: journey.departure,
                            arrival: arrival_time,
                        },
                    );
                    let estimated_total = arrival_time.timestamp() as f64
                        + heuristic_seconds(
                            journey.target_station,
                            end_node,
                            station_access,
                            walking_speed,
                            use_heuristic,
                        );
                    open_set.push(SearchState {
                        estimated_total,
                        node: journey.target_station,
                        arrival_time,
                        last_plugin_id: journey.plugin_id,
                    });
                }
            }
        }
    }

    None
}

fn reconstruct_path(
    predecessors: &HashMap<StateKey, TransitionEdge>,
    start_key: StateKey,
    end_key: StateKey,
) -> Vec<RouteSegment> {
    let mut edges = Vec::new();
    let mut curr = end_key;

    while curr != start_key {
        if let Some(edge) = predecessors.get(&curr) {
            edges.push((curr.0, edge.clone()));
            curr = edge.from_key;
        } else {
            return Vec::new();
        }
    }
    edges.reverse();

    let mut segments: Vec<RouteSegment> = Vec::new();
    for (to_node, edge) in edges {
        let match_last = segments
            .last_mut()
            .map(|s| {
                s.mode == edge.mode
                    && s.line.as_ref().map(|l| &l.id) == edge.line.as_ref().map(|l| &l.id)
            })
            .unwrap_or(false);

        if match_last {
            let last = segments.last_mut().unwrap();
            last.nodes.push(to_node);
            last.arrival_time = edge.arrival;
        } else {
            let from_node = edge.from_key.0;
            segments.push(RouteSegment {
                mode: edge.mode,
                line: edge.line,
                nodes: vec![from_node, to_node],
                departure_time: edge.departure,
                arrival_time: edge.arrival,
            });
        }
    }
    segments
}

fn is_better_arrival(
    best_arrival: &HashMap<StateKey, DateTime<Utc>>,
    key: StateKey,
    arrival_time: DateTime<Utc>,
) -> bool {
    match best_arrival.get(&key) {
        Some(best_time) => arrival_time < *best_time,
        None => true,
    }
}

fn heuristic_seconds(
    origin: i64,
    target: i64,
    station_access: &StationAccessMap,
    walking_speed: f64,
    use_heuristic: bool,
) -> f64 {
    if use_heuristic {
        return 0f64;
    }
    let graph = &*GRAPH;
    let origin_coords = graph.coords_from_id(origin).or_else(|| {
        station_access
            .get(&origin)
            .and_then(|entrances| entrances.iter().find_map(|&e| graph.coords_from_id(e)))
    });
    let target_coords = graph.coords_from_id(target).or_else(|| {
        station_access
            .get(&target)
            .and_then(|entrances| entrances.iter().find_map(|&e| graph.coords_from_id(e)))
    });

    match (origin_coords, target_coords) {
        (Some((lat1, lon1)), Some((lat2, lon2))) => {
            let dlat = lat2 - lat1;
            let dlon = lon2 - lon1;
            let h = ((dlat / 2.0).sin().powi(2)
                + lat1.cos() * lat2.cos() * (dlon / 2.0).sin().powi(2))
            .clamp(0.0, 1.0);
            (6371.0 * 2.0 * h.sqrt().atan2((1.0 - h).sqrt())) / walking_speed
        }
        _ => 0.0,
    }
}

fn is_pedestrian_accessible(way: &Way) -> bool {
    let mut highway_type = None;
    let mut foot_tag = None;
    let mut access_tag = None;
    let mut railway_tag = None;
    let mut public_transport_tag = None;
    let mut is_building = false;

    for (key, value) in way.tags() {
        match key {
            "highway" => highway_type = Some(value),
            "foot" => foot_tag = Some(value),
            "access" => access_tag = Some(value),
            "railway" => railway_tag = Some(value),
            "public_transport" => public_transport_tag = Some(value),
            "building" if value != "no" => is_building = true,
            _ => {}
        }
    }

    if let Some(foot) = foot_tag {
        match foot {
            "no" | "private" | "use_sidepath" => return false,
            "yes" | "designated" | "permissive" | "official" => return true,
            _ => {}
        }
    }

    if is_building && highway_type.is_none() && railway_tag.is_none() {
        return false;
    }

    if let Some(access) = access_tag
        && (access == "no" || access == "private")
    {
        return false;
    }

    if railway_tag == Some("platform") || public_transport_tag == Some("platform") {
        return true;
    }

    let Some(highway) = highway_type else {
        return false;
    };

    !matches!(
        highway,
        "motorway"
            | "motorway_link"
            | "trunk"
            | "trunk_link"
            | "construction"
            | "proposed"
            | "raceway"
            | "abandoned"
    )
}

pub struct Graph {
    coordinates: HashMap<i64, (f64, f64)>,
    adjacency: HashMap<i64, HashMap<i64, f64>>,
}

impl Graph {
    pub fn from_pbfs<P: AsRef<std::path::Path>>(paths: &[P]) -> Result<Self, osmpbf::Error> {
        let mut coordinates = HashMap::new();

        for path in paths {
            ElementReader::from_path(path)?.for_each(|element| match element {
                Element::Node(node) => {
                    coordinates.insert(
                        node.id(),
                        (node.lat().to_radians(), node.lon().to_radians()),
                    );
                }
                Element::DenseNode(dense_node) => {
                    coordinates.insert(
                        dense_node.id(),
                        (dense_node.lat().to_radians(), dense_node.lon().to_radians()),
                    );
                }
                _ => {}
            })?;
        }

        let mut adjacency: HashMap<i64, HashMap<i64, f64>> = HashMap::new();

        for path in paths {
            ElementReader::from_path(path)?.for_each(|element| {
                if let Element::Way(way) = element {
                    if !is_pedestrian_accessible(&way) {
                        return;
                    }

                    let refs: Vec<i64> = way.refs().collect();

                    for pair in refs.windows(2) {
                        let a = pair[0];
                        let b = pair[1];

                        let Some(&(lat1, lon1)) = coordinates.get(&a) else {
                            continue;
                        };
                        let Some(&(lat2, lon2)) = coordinates.get(&b) else {
                            continue;
                        };

                        let dlat = lat2 - lat1;
                        let dlon = lon2 - lon1;
                        let h = ((dlat / 2.0).sin().powi(2)
                            + lat1.cos() * lat2.cos() * (dlon / 2.0).sin().powi(2))
                        .clamp(0.0, 1.0);

                        let distance = 6371.0 * 2.0 * h.sqrt().atan2((1.0 - h).sqrt());

                        adjacency.entry(a).or_default().insert(b, distance);
                        adjacency.entry(b).or_default().insert(a, distance);
                    }
                }
            })?;
        }

        println!(
            "Loaded graph with {} coordinates and {} pedestrian nodes across {} file(s).",
            coordinates.len(),
            adjacency.len(),
            paths.len()
        );

        Ok(Graph {
            coordinates,
            adjacency,
        })
    }

    pub fn coords_from_id(&self, node: i64) -> Option<(f64, f64)> {
        self.coordinates.get(&node).copied()
    }

    pub fn ways_from_node(&self, node: i64) -> Option<&HashMap<i64, f64>> {
        self.adjacency.get(&node)
    }
}
