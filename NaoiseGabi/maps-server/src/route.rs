// SPDX-License-Identifier: AGPL-3.0
// Copyright (C) 2026 Naoise McG
use chrono::{DateTime, Duration, NaiveDateTime, Utc};
use osmpbf::{Element, ElementReader, Way};
use serde::{Deserialize, Serialize};
use std::{
    cmp::Ordering,
    collections::{BinaryHeap, HashMap},
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
    transit: bool,
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
    transit: bool,
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

pub struct Stations {
    access: StationAccessMap,
    entrances: HashMap<i64, Vec<i64>>,
    served_by: HashMap<i64, Vec<usize>>,
}

impl Stations {
    #[cfg(test)]
    pub fn new(access: StationAccessMap) -> Self {
        Stations::with_plugins(access, HashMap::new())
    }

    pub fn with_plugins(access: StationAccessMap, served_by: HashMap<i64, Vec<usize>>) -> Self {
        let mut entrances: HashMap<i64, Vec<i64>> = HashMap::new();
        for (&station, station_entrances) in &access {
            for &entrance in station_entrances {
                entrances.entry(entrance).or_default().push(station);
            }
        }
        Stations {
            access,
            entrances,
            served_by,
        }
    }

    pub fn plugins_serving(&self, station: i64) -> &[usize] {
        self.served_by.get(&station).map_or(&[], Vec::as_slice)
    }

    pub fn is_station(&self, node: i64) -> bool {
        self.access.contains_key(&node)
    }

    pub fn is_known(&self, node: i64) -> bool {
        self.access.contains_key(&node) || self.entrances.contains_key(&node)
    }

    pub fn entrances_of(&self, station: i64) -> &[i64] {
        self.access.get(&station).map_or(&[], Vec::as_slice)
    }

    pub fn stations_at(&self, entrance: i64) -> &[i64] {
        self.entrances.get(&entrance).map_or(&[], Vec::as_slice)
    }
}

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum SearchMode {
    #[default]
    Exact,
    Fast,
}

pub struct SearchParams<'a> {
    pub stations: &'a Stations,
    pub walking_speed: f64,
    pub mode: SearchMode,
    pub max_speed_kmh: f64,
    pub min_transfer: Duration,
    pub limits: SearchLimits,
}

pub struct Itinerary {
    pub route: Vec<RouteSegment>,
    pub arrival_time: DateTime<Utc>,
}

#[derive(Debug, PartialEq)]
pub enum RouteError {
    NoRoute { from: i64, to: i64 },
    LimitReached { limit: &'static str },
}

#[derive(Default)]
pub struct SearchStats {
    pub expanded: usize,
    pub plugin_calls: usize,
}

#[derive(Clone, Copy, Debug)]
pub struct SearchLimits {
    pub max_expanded: usize,
    pub max_plugin_calls: usize,
    pub horizon: Duration,
}

impl Default for SearchLimits {
    fn default() -> Self {
        SearchLimits {
            max_expanded: 5_000_000,
            max_plugin_calls: 1000,
            horizon: Duration::hours(24),
        }
    }
}

enum Stop {
    Exhausted,
    Limit(&'static str),
}

pub fn route_with_schedule<F>(
    graph: &Graph,
    params: &SearchParams,
    required_nodes: &[i64],
    start_time: DateTime<Utc>,
    fetch_outgoing: &mut F,
    stats: &mut SearchStats,
) -> Result<Itinerary, RouteError>
where
    F: FnMut(i64, DateTime<Utc>) -> (Vec<OutgoingJourney>, usize),
{
    let mut itinerary = Itinerary {
        route: Vec::new(),
        arrival_time: start_time,
    };

    for window in required_nodes.windows(2) {
        let (from, to) = (window[0], window[1]);
        let known = |node: i64| graph.contains(node) || params.stations.is_known(node);
        if !known(from) || !known(to) {
            return Err(RouteError::NoRoute { from, to });
        }
        let (segment, arrival_time) = a_star_time_dependent(
            graph,
            params,
            from,
            to,
            itinerary.arrival_time,
            fetch_outgoing,
            stats,
        )
        .map_err(|stop| match stop {
            Stop::Exhausted => RouteError::NoRoute { from, to },
            Stop::Limit(limit) => RouteError::LimitReached { limit },
        })?;
        itinerary.route.extend(segment);
        itinerary.arrival_time = arrival_time;
    }

    Ok(itinerary)
}

pub fn parse_journey_departure(value: &str) -> Result<DateTime<Utc>, chrono::ParseError> {
    NaiveDateTime::parse_from_str(value, "%Y%m%dT%H%M%S")
        .or_else(|_| NaiveDateTime::parse_from_str(value, "%Y-%m-%dT%H:%M:%S"))
        .map(|naive| naive.and_utc())
}

pub fn parse_request_time(value: &str) -> Option<DateTime<Utc>> {
    parse_journey_departure(value).ok().or_else(|| {
        DateTime::parse_from_rfc3339(value)
            .ok()
            .map(|time| time.with_timezone(&Utc))
    })
}

fn a_star_time_dependent<F>(
    graph: &Graph,
    params: &SearchParams,
    start_node: i64,
    end_node: i64,
    start_time: DateTime<Utc>,
    fetch_outgoing: &mut F,
    stats: &mut SearchStats,
) -> Result<(Vec<RouteSegment>, DateTime<Utc>), Stop>
where
    F: FnMut(i64, DateTime<Utc>) -> (Vec<OutgoingJourney>, usize),
{
    let stations = params.stations;
    let estimate = |node: i64| heuristic_seconds(graph, params, node, end_node);
    let mut open_set = BinaryHeap::new();
    let mut best_arrival: HashMap<StateKey, DateTime<Utc>> = HashMap::new();
    let mut predecessors: HashMap<StateKey, TransitionEdge> = HashMap::new();

    let start_key = (start_node, false);
    open_set.push(SearchState {
        estimated_total: seconds(start_time) + estimate(start_node),
        node: start_node,
        arrival_time: start_time,
        transit: false,
    });
    best_arrival.insert(start_key, start_time);

    if start_node == end_node {
        stats.expanded += 1;
        return Ok((Vec::new(), start_time));
    }

    let deadline = start_time + params.limits.horizon;
    let mut pruned_by_horizon = false;

    while let Some(state) = open_set.pop() {
        let current_node = state.node;
        let current_time = state.arrival_time;
        let current_is_transit = state.transit;
        let current_key = (current_node, current_is_transit);

        if let Some(&best_time) = best_arrival.get(&current_key)
            && current_time > best_time
        {
            continue;
        }
        if current_time > deadline {
            pruned_by_horizon = true;
            continue;
        }
        if stats.expanded >= params.limits.max_expanded {
            return Err(Stop::Limit("max_expanded"));
        }
        stats.expanded += 1;

        if current_node == end_node {
            let path = reconstruct_path(&predecessors, start_key, current_key);
            return Ok((path, current_time));
        }

        for (next_node, distance) in graph.neighbours(current_node) {
            let travel_seconds = distance / params.walking_speed;
            let arrival_time =
                current_time + Duration::milliseconds((travel_seconds * 1000.0).round() as i64);
            let next_key = (next_node, false);

            if is_better_arrival(&best_arrival, next_key, arrival_time) {
                best_arrival.insert(next_key, arrival_time);
                predecessors.insert(
                    next_key,
                    TransitionEdge {
                        from_key: current_key,
                        transit: false,
                        mode: "walking".to_string(),
                        line: None,
                        departure: current_time,
                        arrival: arrival_time,
                    },
                );
                open_set.push(SearchState {
                    estimated_total: seconds(arrival_time) + estimate(next_node),
                    node: next_node,
                    arrival_time,
                    transit: false,
                });
            }
        }

        for &entrance_node in stations.entrances_of(current_node) {
            let next_key = (entrance_node, false);
            if is_better_arrival(&best_arrival, next_key, current_time) {
                best_arrival.insert(next_key, current_time);
                predecessors.insert(
                    next_key,
                    TransitionEdge {
                        from_key: current_key,
                        transit: false,
                        mode: "walking".to_string(),
                        line: None,
                        departure: current_time,
                        arrival: current_time,
                    },
                );
                open_set.push(SearchState {
                    estimated_total: seconds(current_time) + estimate(entrance_node),
                    node: entrance_node,
                    arrival_time: current_time,
                    transit: false,
                });
            }
        }

        let prev_node = predecessors.get(&current_key).map(|k| k.from_key.0);
        for &station_node in stations.stations_at(current_node) {
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
                        transit: false,
                        mode: "walking".to_string(),
                        line: None,
                        departure: current_time,
                        arrival: current_time,
                    },
                );
                open_set.push(SearchState {
                    estimated_total: seconds(current_time) + estimate(station_node),
                    node: station_node,
                    arrival_time: current_time,
                    transit: false,
                });
            }
        }

        if stations.is_station(current_node) {
            if stats.plugin_calls >= params.limits.max_plugin_calls {
                return Err(Stop::Limit("max_plugin_calls"));
            }
            let (journeys, calls) =
                fetch_outgoing(current_node, current_time + params.min_transfer);
            stats.plugin_calls += calls;
            for journey in journeys {
                if journey.target_station == current_node {
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
                            transit: true,
                            mode: journey.mode.clone(),
                            line: journey.line.clone(),
                            departure: journey.departure,
                            arrival: arrival_time,
                        },
                    );
                    open_set.push(SearchState {
                        estimated_total: seconds(arrival_time) + estimate(journey.target_station),
                        node: journey.target_station,
                        arrival_time,
                        transit: true,
                    });
                }
            }
        }
    }

    if pruned_by_horizon {
        Err(Stop::Limit("horizon_h"))
    } else {
        Err(Stop::Exhausted)
    }
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
    let mut last_was_walking = false;
    for (to_node, edge) in edges {
        let walking = !edge.transit;
        if walking
            && last_was_walking
            && let Some(last) = segments.last_mut()
        {
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
        last_was_walking = walking;
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

fn position(graph: &Graph, stations: &Stations, node: i64) -> Option<(f64, f64)> {
    graph.coords_from_id(node).or_else(|| {
        stations
            .entrances_of(node)
            .iter()
            .find_map(|&e| graph.coords_from_id(e))
    })
}

fn haversine_km((lat1, lon1): (f64, f64), (lat2, lon2): (f64, f64)) -> f64 {
    let dlat = lat2 - lat1;
    let dlon = lon2 - lon1;
    let h = ((dlat / 2.0).sin().powi(2) + lat1.cos() * lat2.cos() * (dlon / 2.0).sin().powi(2))
        .clamp(0.0, 1.0);
    6371.0 * 2.0 * h.sqrt().atan2((1.0 - h).sqrt())
}

fn seconds(time: DateTime<Utc>) -> f64 {
    time.timestamp_millis() as f64 / 1000.0
}

fn heuristic_seconds(graph: &Graph, params: &SearchParams, origin: i64, target: i64) -> f64 {
    let speed_km_per_s = match params.mode {
        SearchMode::Fast => params.walking_speed,
        SearchMode::Exact => params.max_speed_kmh / 3600.0,
    };
    if speed_km_per_s <= 0.0 {
        return 0.0;
    }
    match (
        position(graph, params.stations, origin),
        position(graph, params.stations, target),
    ) {
        (Some(from), Some(to)) => haversine_km(from, to) / speed_km_per_s,
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

                        let (Some(&from), Some(&to)) = (coordinates.get(&a), coordinates.get(&b))
                        else {
                            continue;
                        };
                        let distance = haversine_km(from, to);

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

    #[cfg(test)]
    pub fn from_parts(nodes: &[(i64, f64, f64)], edges: &[(i64, i64)]) -> Self {
        let coordinates: HashMap<i64, (f64, f64)> = nodes
            .iter()
            .map(|&(id, lat, lon)| (id, (lat.to_radians(), lon.to_radians())))
            .collect();
        let mut adjacency: HashMap<i64, HashMap<i64, f64>> = HashMap::new();
        for &(a, b) in edges {
            let (Some(&from), Some(&to)) = (coordinates.get(&a), coordinates.get(&b)) else {
                continue;
            };
            let distance = haversine_km(from, to);
            adjacency.entry(a).or_default().insert(b, distance);
            adjacency.entry(b).or_default().insert(a, distance);
        }
        Graph {
            coordinates,
            adjacency,
        }
    }

    pub fn contains(&self, node: i64) -> bool {
        self.coordinates.contains_key(&node) || self.adjacency.contains_key(&node)
    }

    pub fn coords_from_id(&self, node: i64) -> Option<(f64, f64)> {
        self.coordinates.get(&node).copied()
    }

    pub fn neighbours(&self, node: i64) -> impl Iterator<Item = (i64, f64)> + '_ {
        self.adjacency
            .get(&node)
            .into_iter()
            .flat_map(|edges| edges.iter().map(|(&next, &distance)| (next, distance)))
    }
}
