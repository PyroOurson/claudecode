// SPDX-License-Identifier: AGPL-3.0
// Copyright (C) 2026 Naoise McG
pub use crate::graph::Graph;
use crate::graph::haversine_km;
use chrono::{DateTime, Duration, NaiveDateTime, Utc};
use serde::{Deserialize, Serialize};
use std::{
    cmp::Ordering,
    collections::{BinaryHeap, HashMap},
};

pub type StationAccessMap = HashMap<i64, Vec<i64>>;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
struct StateKey {
    node: i64,
    transit: bool,
    boarded: bool,
}

#[derive(Clone, Copy, Debug)]
struct Label {
    arrival: DateTime<Utc>,
    cost: DateTime<Utc>,
    walked_m: f64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Line {
    pub id: Option<String>,
    pub preferred_colour: Option<String>,
}

#[derive(Clone, Debug)]
struct TransitionEdge {
    from_key: StateKey,
    plugin: Option<usize>,
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
    pub plugin: usize,
    pub mode: String,
    pub line: Option<Line>,
}

#[derive(Clone, Debug, Serialize)]
pub struct RouteSegment {
    #[serde(skip)]
    pub plugin: Option<usize>,
    pub mode: String,
    pub line: Option<Line>,
    pub nodes: Vec<i64>,
    pub departure_time: DateTime<Utc>,
    pub arrival_time: DateTime<Utc>,
}

#[derive(Clone)]
struct SearchState {
    estimated_total: f64,
    key: StateKey,
    label: Label,
}

impl PartialEq for SearchState {
    fn eq(&self, other: &Self) -> bool {
        self.estimated_total == other.estimated_total
    }
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

#[derive(Clone, Debug, Default)]
pub struct RouteOptions {
    pub max_walk_m: Option<f64>,
    pub transfer_penalty: Duration,
    pub exclude_modes: Vec<String>,
    pub avoid_steps: bool,
}

pub struct SearchParams<'a> {
    pub stations: &'a Stations,
    pub walking_speed: f64,
    pub mode: SearchMode,
    pub max_speed_kmh: f64,
    pub min_transfer: Duration,
    pub limits: SearchLimits,
    pub options: RouteOptions,
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

struct Frontier {
    open: BinaryHeap<SearchState>,
    best: HashMap<StateKey, DateTime<Utc>>,
    predecessors: HashMap<StateKey, TransitionEdge>,
}

impl Frontier {
    fn offer(
        &mut self,
        key: StateKey,
        label: Label,
        edge: impl FnOnce() -> TransitionEdge,
        estimate: impl FnOnce() -> f64,
    ) {
        if self.best.get(&key).is_some_and(|&best| label.cost >= best) {
            return;
        }
        self.best.insert(key, label.cost);
        self.predecessors.insert(key, edge());
        self.open.push(SearchState {
            estimated_total: seconds(label.cost) + estimate(),
            key,
            label,
        });
    }
}

fn walk(from_key: StateKey, departure: DateTime<Utc>, arrival: DateTime<Utc>) -> TransitionEdge {
    TransitionEdge {
        from_key,
        plugin: None,
        mode: "walking".to_string(),
        line: None,
        departure,
        arrival,
    }
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
    let options = &params.options;
    let penalised = options.transfer_penalty > Duration::zero();
    let estimate = |node: i64| heuristic_seconds(graph, params, node, end_node);
    let mut frontier = Frontier {
        open: BinaryHeap::new(),
        best: HashMap::new(),
        predecessors: HashMap::new(),
    };

    let start_key = StateKey {
        node: start_node,
        transit: false,
        boarded: false,
    };
    let start_label = Label {
        arrival: start_time,
        cost: start_time,
        walked_m: 0.0,
    };
    frontier.best.insert(start_key, start_time);
    frontier.open.push(SearchState {
        estimated_total: seconds(start_time) + estimate(start_node),
        key: start_key,
        label: start_label,
    });

    if start_node == end_node {
        stats.expanded += 1;
        return Ok((Vec::new(), start_time));
    }

    let deadline = start_time + params.limits.horizon;
    let mut pruned_by_horizon = false;

    while let Some(SearchState { key, label, .. }) = frontier.open.pop() {
        if frontier
            .best
            .get(&key)
            .is_some_and(|&best| label.cost > best)
        {
            continue;
        }
        if label.arrival > deadline {
            pruned_by_horizon = true;
            continue;
        }
        if stats.expanded >= params.limits.max_expanded {
            return Err(Stop::Limit("max_expanded"));
        }
        stats.expanded += 1;

        if key.node == end_node {
            let path = reconstruct_path(&frontier.predecessors, start_key, key);
            return Ok((path, label.arrival));
        }

        for step in graph.neighbours(key.node) {
            if options.avoid_steps && step.steps {
                continue;
            }
            let walked_m = label.walked_m + step.length_m;
            if options.max_walk_m.is_some_and(|max| walked_m > max) {
                continue;
            }
            let travel = Duration::milliseconds(
                (step.length_m / 1000.0 / params.walking_speed * 1000.0).round() as i64,
            );
            let next = Label {
                arrival: label.arrival + travel,
                cost: label.cost + travel,
                walked_m,
            };
            let next_key = StateKey {
                node: step.node,
                transit: false,
                boarded: key.boarded,
            };
            frontier.offer(
                next_key,
                next,
                || walk(key, label.arrival, next.arrival),
                || estimate(step.node),
            );
        }

        let came_from = frontier
            .predecessors
            .get(&key)
            .map(|edge| edge.from_key.node);
        let moves = stations.entrances_of(key.node).iter().chain(
            stations
                .stations_at(key.node)
                .iter()
                .filter(|&&station| Some(station) != came_from),
        );
        for &next_node in moves {
            let next_key = StateKey {
                node: next_node,
                transit: false,
                boarded: key.boarded,
            };
            frontier.offer(
                next_key,
                label,
                || walk(key, label.arrival, label.arrival),
                || estimate(next_node),
            );
        }

        if stations.is_station(key.node) {
            if stats.plugin_calls >= params.limits.max_plugin_calls {
                return Err(Stop::Limit("max_plugin_calls"));
            }
            let query_time = label.arrival + params.min_transfer;
            let (journeys, calls) = fetch_outgoing(key.node, query_time);
            stats.plugin_calls += calls;
            let penalty = if key.boarded {
                options.transfer_penalty
            } else {
                Duration::zero()
            };
            for journey in journeys {
                if journey.target_station == key.node
                    || journey.departure < query_time
                    || options.exclude_modes.contains(&journey.mode)
                {
                    continue;
                }
                let arrival = journey.departure + Duration::seconds(journey.cost_seconds as i64);
                let next = Label {
                    arrival,
                    cost: arrival + (label.cost - label.arrival) + penalty,
                    walked_m: 0.0,
                };
                let next_key = StateKey {
                    node: journey.target_station,
                    transit: true,
                    boarded: penalised,
                };
                frontier.offer(
                    next_key,
                    next,
                    || TransitionEdge {
                        from_key: key,
                        plugin: Some(journey.plugin),
                        mode: journey.mode.clone(),
                        line: journey.line.clone(),
                        departure: journey.departure,
                        arrival,
                    },
                    || estimate(journey.target_station),
                );
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
            edges.push((curr.node, edge.clone()));
            curr = edge.from_key;
        } else {
            return Vec::new();
        }
    }
    edges.reverse();

    let mut segments: Vec<RouteSegment> = Vec::new();
    let mut last_was_walking = false;
    for (to_node, edge) in edges {
        let walking = edge.plugin.is_none();
        if walking
            && last_was_walking
            && let Some(last) = segments.last_mut()
        {
            last.nodes.push(to_node);
            last.arrival_time = edge.arrival;
        } else {
            segments.push(RouteSegment {
                plugin: edge.plugin,
                mode: edge.mode,
                line: edge.line,
                nodes: vec![edge.from_key.node, to_node],
                departure_time: edge.departure,
                arrival_time: edge.arrival,
            });
        }
        last_was_walking = walking;
    }
    segments
}

fn position(graph: &Graph, stations: &Stations, node: i64) -> Option<(f64, f64)> {
    graph.coords_from_id(node).or_else(|| {
        stations
            .entrances_of(node)
            .iter()
            .find_map(|&e| graph.coords_from_id(e))
    })
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
