// SPDX-License-Identifier: AGPL-3.0
// Copyright (C) 2026 Naoise McG
use crate::Plugin;
use crate::cache::{ExploreCache, Journeys};
use crate::config::Config;
use crate::overpass;
use crate::plugin::parse_journeys;
use crate::route::{
    Graph, OutgoingJourney, RouteError, RouteOptions, RouteSegment, SearchMode, SearchParams,
    SearchStats, Stations, parse_request_time, route_with_schedule,
};
use axum::Router;
use axum::body::{Body, Bytes};
use axum::extract::rejection::BytesRejection;
use axum::extract::{DefaultBodyLimit, State};
use axum::http::{HeaderName, HeaderValue, StatusCode, header};
use axum::middleware;
use axum::response::{IntoResponse, Response};
use axum::routing::{get, post};
use chrono::{DateTime, Utc};
use serde::Serialize;
use serde_json::{Value, json};
use std::collections::HashMap;
use std::sync::{Arc, OnceLock};
use std::time::Instant;

pub const OSM_ATTRIBUTION: &str = "Map data © OpenStreetMap contributors, ODbL.";

pub struct AppState {
    pub config: Config,
    pub graph: Arc<Graph>,
    pub cache: ExploreCache,
    pub overpass_address: String,
    started: Instant,
    network: OnceLock<Network>,
}

pub struct Network {
    pub plugins: Vec<Plugin>,
    pub stations: Stations,
}

impl AppState {
    pub fn new(config: Config, graph: Arc<Graph>) -> Self {
        AppState {
            cache: ExploreCache::new(std::time::Duration::from_secs(config.cache_ttl_s)),
            overpass_address: overpass::ADDRESS.to_string(),
            started: Instant::now(),
            config,
            graph,
            network: OnceLock::new(),
        }
    }

    pub fn set_ready(&self, plugins: Vec<Plugin>, stations: Stations) {
        let _ = self.network.set(Network { plugins, stations });
    }

    pub fn network(&self) -> Option<&Network> {
        self.network.get()
    }
}

pub struct ApiError {
    status: StatusCode,
    body: Value,
}

impl ApiError {
    fn new(status: StatusCode, body: Value) -> Self {
        ApiError { status, body }
    }

    fn bad_request(message: impl Into<String>) -> Self {
        ApiError::new(StatusCode::BAD_REQUEST, json!({ "error": message.into() }))
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        json_response(self.status, &self.body)
    }
}

impl From<RouteError> for ApiError {
    fn from(error: RouteError) -> Self {
        match error {
            RouteError::NoRoute { from, to } => ApiError::new(
                StatusCode::NOT_FOUND,
                json!({ "error": "no route", "failed_leg": [from, to] }),
            ),
            RouteError::LimitReached { limit } => ApiError::new(
                StatusCode::NOT_FOUND,
                json!({ "error": "no route within limits", "limit": limit }),
            ),
        }
    }
}

pub fn router(state: Arc<AppState>) -> Router {
    let max_body_bytes = state.config.max_body_bytes;
    Router::new()
        .route("/", post(plan).options(preflight))
        .route("/health", get(health))
        .fallback(not_found)
        .method_not_allowed_fallback(method_not_allowed)
        .layer(DefaultBodyLimit::max(max_body_bytes))
        .layer(middleware::map_response_with_state(
            state.clone(),
            common_headers,
        ))
        .with_state(state)
}

async fn not_found() -> ApiError {
    ApiError::new(StatusCode::NOT_FOUND, json!({ "error": "not found" }))
}

async fn method_not_allowed() -> ApiError {
    ApiError::new(
        StatusCode::METHOD_NOT_ALLOWED,
        json!({ "error": "method not allowed, use POST /" }),
    )
}

async fn health(State(state): State<Arc<AppState>>) -> Response {
    let overpass_up = overpass::answers(&state.overpass_address).await;
    let plugins: Vec<Value> = state
        .network()
        .map(|network| {
            network
                .plugins
                .iter()
                .map(|plugin| {
                    let stats = plugin.stats();
                    json!({
                        "name": plugin.name(),
                        "mode": plugin.mode(),
                        "alive": plugin.is_alive(),
                        "calls": stats.calls,
                        "errors": stats.errors,
                        "avg_ms": (stats.average_ms * 10.0).round() / 10.0,
                    })
                })
                .collect()
        })
        .unwrap_or_default();
    let ready = state.network().is_some();
    let healthy =
        ready && overpass_up && plugins.iter().all(|plugin| plugin["alive"] == json!(true));
    json_response(
        if healthy {
            StatusCode::OK
        } else {
            StatusCode::SERVICE_UNAVAILABLE
        },
        &json!({
            "status": if healthy { "ok" } else { "degraded" },
            "ready": ready,
            "uptime_s": state.started.elapsed().as_secs(),
            "graph": {"nodes": state.graph.node_count(), "edges": state.graph.edge_count()},
            "overpass": if overpass_up { "up" } else { "down" },
            "plugins": plugins,
        }),
    )
}

async fn preflight() -> Response {
    Response::builder()
        .status(StatusCode::NO_CONTENT)
        .header(header::ACCESS_CONTROL_ALLOW_ORIGIN, "*")
        .header(header::ACCESS_CONTROL_ALLOW_METHODS, "POST, OPTIONS")
        .header(header::ACCESS_CONTROL_ALLOW_HEADERS, "Content-Type")
        .header(header::ACCESS_CONTROL_MAX_AGE, "86400")
        .header(header::CONTENT_LENGTH, "0")
        .body(Body::empty())
        .unwrap_or_default()
}

async fn common_headers(State(state): State<Arc<AppState>>, mut response: Response) -> Response {
    let headers = response.headers_mut();
    if !headers.contains_key(header::ACCESS_CONTROL_ALLOW_ORIGIN) {
        headers.insert(
            header::ACCESS_CONTROL_ALLOW_ORIGIN,
            HeaderValue::from_static("*"),
        );
        headers.insert(
            header::ACCESS_CONTROL_EXPOSE_HEADERS,
            HeaderValue::from_static("Attribution, Source-Code"),
        );
        if let Ok(value) = HeaderValue::from_str(&format!("\"{}\"", state.config.source_url)) {
            headers.insert(HeaderName::from_static("source-code"), value);
        }
    }
    response
}

fn json_response(status: StatusCode, body: &Value) -> Response {
    (
        status,
        [(header::CONTENT_TYPE, "application/json")],
        body.to_string(),
    )
        .into_response()
}

async fn plan(State(state): State<Arc<AppState>>, body: Result<Bytes, BytesRejection>) -> Response {
    let body = match body {
        Ok(body) => body,
        Err(rejection) => {
            return ApiError::new(
                rejection.status(),
                json!({ "error": rejection.body_text() }),
            )
            .into_response();
        }
    };
    match tokio::task::spawn_blocking(move || compute(&state, &body)).await {
        Ok(Ok(response)) => response,
        Ok(Err(error)) => error.into_response(),
        Err(_) => ApiError::new(
            StatusCode::INTERNAL_SERVER_ERROR,
            json!({ "error": "internal error" }),
        )
        .into_response(),
    }
}

pub const DEFAULT_WALKING_SPEED: f64 = 0.00138;
const WALKING_SPEED_RANGE: (f64, f64) = (0.0003, 0.01);

#[derive(Debug)]
pub struct RouteRequest {
    pub targets: Targets,
    pub start_time: DateTime<Utc>,
    pub walking_speed: f64,
    pub mode: SearchMode,
    pub max_snap_m: f64,
    pub format: Format,
    pub min_transfer_s: Option<u64>,
    pub options: RouteOptions,
}

#[derive(Debug)]
pub enum Targets {
    Nodes(Vec<i64>),
    Points(Vec<(f64, f64)>),
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Format {
    Json,
    GeoJson,
}

pub const DEFAULT_MAX_SNAP_M: f64 = 500.0;

fn parse_nodes(nodes: &Value) -> Result<Vec<i64>, ApiError> {
    nodes
        .as_array()
        .ok_or_else(|| ApiError::bad_request("required_nodes must be an array of integers"))?
        .iter()
        .enumerate()
        .map(|(index, node)| {
            node.as_i64().ok_or_else(|| {
                ApiError::bad_request(format!(
                    "required_nodes[{}] must be an integer OSM ID, got {}",
                    index, node
                ))
            })
        })
        .collect()
}

fn parse_waypoints(points: &Value) -> Result<Vec<(f64, f64)>, ApiError> {
    points
        .as_array()
        .ok_or_else(|| {
            ApiError::bad_request("waypoints must be an array of [latitude, longitude] pairs")
        })?
        .iter()
        .enumerate()
        .map(|(index, point)| {
            let pair = point.as_array().filter(|pair| pair.len() == 2);
            let lat = pair.and_then(|pair| pair[0].as_f64());
            let lon = pair.and_then(|pair| pair[1].as_f64());
            match (lat, lon) {
                (Some(lat), Some(lon))
                    if (-90.0..=90.0).contains(&lat) && (-180.0..=180.0).contains(&lon) =>
                {
                    Ok((lat, lon))
                }
                _ => Err(ApiError::bad_request(format!(
                    "waypoints[{}] must be [latitude, longitude] in degrees, got {}",
                    index, point
                ))),
            }
        })
        .collect()
}

pub fn parse_request(body: &[u8], config: &Config) -> Result<RouteRequest, ApiError> {
    let data: Value = serde_json::from_slice(body)
        .map_err(|error| ApiError::bad_request(format!("invalid JSON: {}", error)))?;
    let fields = data
        .as_object()
        .ok_or_else(|| ApiError::bad_request("the body must be a JSON object"))?;
    let present = |key: &str| fields.get(key).filter(|value| !value.is_null());

    let targets = match (present("required_nodes"), present("waypoints")) {
        (Some(_), Some(_)) => {
            return Err(ApiError::bad_request(
                "send either required_nodes or waypoints, not both",
            ));
        }
        (None, None) => {
            return Err(ApiError::bad_request(
                "required_nodes is missing (or send waypoints)",
            ));
        }
        (Some(nodes), None) => Targets::Nodes(parse_nodes(nodes)?),
        (None, Some(points)) => Targets::Points(parse_waypoints(points)?),
    };
    let (count, field) = match &targets {
        Targets::Nodes(nodes) => (nodes.len(), "required_nodes"),
        Targets::Points(points) => (points.len(), "waypoints"),
    };
    if count < 2 {
        return Err(ApiError::bad_request(format!(
            "{} needs at least 2 nodes",
            field
        )));
    }
    if count > config.max_required_nodes {
        return Err(ApiError::bad_request(format!(
            "{} has {} nodes, the limit is {}",
            field, count, config.max_required_nodes
        )));
    }

    let max_snap_m = match present("max_snap_m") {
        None => DEFAULT_MAX_SNAP_M,
        Some(value) => value
            .as_f64()
            .filter(|metres| *metres > 0.0)
            .ok_or_else(|| {
                ApiError::bad_request(format!(
                    "max_snap_m must be a positive number of metres, got {}",
                    value
                ))
            })?,
    };

    let format = match present("format").map(|value| value.as_str()) {
        None | Some(Some("json")) => Format::Json,
        Some(Some("geojson")) => Format::GeoJson,
        Some(_) => {
            return Err(ApiError::bad_request(
                "format must be \"json\" or \"geojson\"",
            ));
        }
    };

    let start_time = match present("time") {
        None => Utc::now(),
        Some(time) => time.as_str().and_then(parse_request_time).ok_or_else(|| {
            ApiError::bad_request(format!(
                "time must be a UTC time like 20260808T131000 or 2026-08-08T13:10:00, got {}",
                time
            ))
        })?,
    };

    let walking_speed = match present("walking_speed") {
        None => DEFAULT_WALKING_SPEED,
        Some(speed) => speed
            .as_f64()
            .filter(|speed| (WALKING_SPEED_RANGE.0..=WALKING_SPEED_RANGE.1).contains(speed))
            .ok_or_else(|| {
                ApiError::bad_request(format!(
                    "walking_speed must be a number of km/s between {} and {}, got {}",
                    WALKING_SPEED_RANGE.0, WALKING_SPEED_RANGE.1, speed
                ))
            })?,
    };

    let estimate_off = match present("heuristic") {
        None => None,
        Some(Value::Bool(flag)) => Some(*flag),
        Some(Value::Number(number)) if number.is_i64() || number.is_u64() => {
            Some(number.as_f64() != Some(0.0))
        }
        Some(other) => {
            return Err(ApiError::bad_request(format!(
                "heuristic must be true, false or an integer, got {}",
                other
            )));
        }
    };
    let fast = match present("fast") {
        None => None,
        Some(Value::Bool(flag)) => Some(*flag),
        Some(other) => {
            return Err(ApiError::bad_request(format!(
                "fast must be true or false, got {}",
                other
            )));
        }
    };
    let mode = match (fast, estimate_off) {
        (Some(true), _) | (None, Some(false)) => SearchMode::Fast,
        _ => SearchMode::Exact,
    };

    let seconds_field = |key: &str, allow_zero: bool| -> Result<Option<f64>, ApiError> {
        match present(key) {
            None => Ok(None),
            Some(value) => value
                .as_f64()
                .filter(|seconds| {
                    (if allow_zero {
                        *seconds >= 0.0
                    } else {
                        *seconds > 0.0
                    }) && *seconds <= 86_400.0
                })
                .map(Some)
                .ok_or_else(|| {
                    ApiError::bad_request(format!(
                        "{} must be a number between {} and 86400, got {}",
                        key,
                        if allow_zero { "0" } else { "above 0" },
                        value
                    ))
                }),
        }
    };
    let min_transfer_s = match present("min_transfer_s") {
        None => None,
        Some(value) => Some(
            value
                .as_u64()
                .filter(|seconds| *seconds <= 86_400)
                .ok_or_else(|| {
                    ApiError::bad_request(format!(
                        "min_transfer_s must be a whole number of seconds between 0 and 86400, got {}",
                        value
                    ))
                })?,
        ),
    };
    let max_walk_m =
        match present("max_walk_m") {
            None => None,
            Some(value) => Some(value.as_f64().filter(|metres| *metres > 0.0).ok_or_else(
                || {
                    ApiError::bad_request(format!(
                        "max_walk_m must be a positive number of metres, got {}",
                        value
                    ))
                },
            )?),
        };
    let transfer_penalty_s = seconds_field("transfer_penalty_s", true)?.unwrap_or(0.0);
    let exclude_modes = match present("exclude_modes") {
        None => Vec::new(),
        Some(value) => value
            .as_array()
            .and_then(|modes| {
                modes
                    .iter()
                    .map(|mode| mode.as_str().map(str::to_string))
                    .collect::<Option<Vec<String>>>()
            })
            .ok_or_else(|| {
                ApiError::bad_request(format!(
                    "exclude_modes must be an array of mode names, got {}",
                    value
                ))
            })?,
    };
    let avoid_steps = match present("avoid_steps") {
        None => false,
        Some(Value::Bool(flag)) => *flag,
        Some(other) => {
            return Err(ApiError::bad_request(format!(
                "avoid_steps must be true or false, got {}",
                other
            )));
        }
    };

    Ok(RouteRequest {
        min_transfer_s,
        options: RouteOptions {
            max_walk_m,
            transfer_penalty: chrono::Duration::milliseconds((transfer_penalty_s * 1000.0) as i64),
            exclude_modes,
            avoid_steps,
        },
        targets,
        start_time,
        walking_speed,
        mode,
        max_snap_m,
        format,
    })
}

fn explore_with(
    plugin: &Plugin,
    index: usize,
    station: i64,
    time: DateTime<Utc>,
) -> Option<Vec<OutgoingJourney>> {
    match plugin.explore(station, time) {
        Ok(value) => Some(parse_journeys(
            plugin.name(),
            index,
            plugin.mode(),
            station,
            &value,
        )),
        Err(error) => {
            eprintln!(
                "Plugin {} could not explore station {}: {}",
                plugin.name(),
                station,
                error
            );
            None
        }
    }
}

fn explore_all(
    plugins: &[Plugin],
    indexes: &[usize],
    station: i64,
    time: DateTime<Utc>,
) -> Vec<(usize, Option<Vec<OutgoingJourney>>)> {
    let explore = |index: usize| {
        let journeys = plugins
            .get(index)
            .and_then(|plugin| explore_with(plugin, index, station, time));
        (index, journeys)
    };
    if indexes.len() < 2 {
        return indexes.iter().map(|&index| explore(index)).collect();
    }
    std::thread::scope(|scope| {
        let handles: Vec<_> = indexes
            .iter()
            .map(|&index| scope.spawn(move || explore(index)))
            .collect();
        handles
            .into_iter()
            .filter_map(|handle| handle.join().ok())
            .collect()
    })
}

#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Serialize)]
pub struct Credit {
    pub plugin: String,
    pub data_owner: String,
    pub data_license: String,
    pub plugin_owner: String,
    pub plugin_license: String,
}

fn attribution_for(state: &AppState, network: &Network, route: &[RouteSegment]) -> Vec<Credit> {
    let mut credits = vec![Credit {
        plugin: "OpenStreetMap".to_string(),
        data_owner: "[OpenStreetMap contributors](https://www.openstreetmap.org/copyright)"
            .to_string(),
        data_license: "[ODbL](https://opendatacommons.org/licenses/odbl/1-0/)".to_string(),
        plugin_owner: format!("[maps-server]({})", state.config.source_url),
        plugin_license: "[AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.html)".to_string(),
    }];
    credits.extend(
        route
            .iter()
            .filter_map(|segment| segment.plugin)
            .filter_map(|index| network.plugins.get(index))
            .map(|plugin| Credit {
                plugin: plugin.name().to_string(),
                data_owner: plugin.data_owner().to_string(),
                data_license: plugin.data_license().to_string(),
                plugin_owner: plugin.plugin_owner().to_string(),
                plugin_license: plugin.plugin_license().to_string(),
            }),
    );
    credits.sort();
    credits.dedup();
    credits
}

fn attribution_header(credits: &[Credit]) -> String {
    let lines = credits
        .iter()
        .map(|credit| {
            format!(
                "{}, provided under the {}, translated by {}, under the {}.",
                credit.data_owner, credit.data_license, credit.plugin_owner, credit.plugin_license
            )
        })
        .collect::<Vec<_>>()
        .join("\n");
    let text = format!(
        "{}\nRealtime and Schedule data has been provided by the following organisations, under various licenses. It has been provided as-is, and these organisations are not responsible for any errors or inaccuracies. The various data formats have been translated by various individuals. \n {}",
        OSM_ATTRIBUTION, lines
    );
    urlencoding::encode(&text).into_owned()
}

fn node_position(graph: &Graph, stations: &Stations, node: i64) -> Option<(f64, f64)> {
    graph.position(node).or_else(|| {
        stations
            .entrances_of(node)
            .iter()
            .find_map(|&entrance| graph.position(entrance))
    })
}

fn snap(
    graph: &Graph,
    points: &[(f64, f64)],
    max_snap_m: f64,
) -> Result<(Vec<i64>, Value), ApiError> {
    let mut nodes = Vec::with_capacity(points.len());
    let mut snapped = Vec::with_capacity(points.len());
    for (index, &(lat, lon)) in points.iter().enumerate() {
        let (node, metres) = graph
            .nearest_walkable(lat, lon)
            .filter(|&(_, metres)| metres <= max_snap_m)
            .ok_or_else(|| {
                ApiError::bad_request(format!(
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
    Ok((nodes, Value::Array(snapped)))
}

fn compute(state: &AppState, body: &[u8]) -> Result<Response, ApiError> {
    let request = parse_request(body, &state.config)?;
    let network = state.network().ok_or_else(|| {
        ApiError::new(
            StatusCode::SERVICE_UNAVAILABLE,
            json!({ "error": "starting: waiting for Overpass and the plugins" }),
        )
    })?;

    println!("Received request: {:?}", request);

    let (required_nodes, snapped) = match &request.targets {
        Targets::Nodes(nodes) => (nodes.clone(), None),
        Targets::Points(points) => {
            let (nodes, snapped) = snap(&state.graph, points, request.max_snap_m)?;
            (nodes, Some(snapped))
        }
    };

    let mut seen: HashMap<(i64, usize, DateTime<Utc>), Journeys> = HashMap::new();
    let mut fetch_outgoing = |station: i64, time: DateTime<Utc>| {
        let window = ExploreCache::window_start(time);
        let mut found = Vec::new();
        let mut missing = Vec::new();
        for &index in network.stations.plugins_serving(station) {
            if network.plugins.get(index).is_some_and(|plugin| {
                request
                    .options
                    .exclude_modes
                    .iter()
                    .any(|mode| mode == plugin.mode())
            }) {
                continue;
            }
            let cached = seen
                .get(&(station, index, window))
                .cloned()
                .or_else(|| state.cache.get(station, index, window));
            match cached {
                Some(journeys) => {
                    seen.insert((station, index, window), journeys.clone());
                    found.push(journeys);
                }
                None => missing.push(index),
            }
        }
        for (index, result) in explore_all(&network.plugins, &missing, station, window) {
            let succeeded = result.is_some();
            let journeys: Journeys = Arc::new(result.unwrap_or_default());
            if succeeded {
                state.cache.insert(station, index, window, journeys.clone());
            }
            seen.insert((station, index, window), journeys.clone());
            found.push(journeys);
        }
        let journeys = found
            .iter()
            .flat_map(|journeys| journeys.iter())
            .filter(|journey| journey.departure >= time)
            .cloned()
            .collect();
        (journeys, missing.len())
    };

    let params = SearchParams {
        stations: &network.stations,
        walking_speed: request.walking_speed,
        mode: request.mode,
        max_speed_kmh: state.config.max_speed_kmh,
        limits: state.config.search_limits(),
        min_transfer: chrono::Duration::seconds(
            request
                .min_transfer_s
                .unwrap_or(state.config.min_transfer_s) as i64,
        ),
        options: request.options.clone(),
    };
    let mut stats = SearchStats::default();
    let result = route_with_schedule(
        &state.graph,
        &params,
        &required_nodes,
        request.start_time,
        &mut fetch_outgoing,
        &mut stats,
    );
    println!(
        "Searched {} states with {} plugin calls; cache {} hits, {} misses since start",
        stats.expanded,
        stats.plugin_calls,
        state.cache.hits(),
        state.cache.misses()
    );
    let result = result?;

    let attribution = attribution_for(state, network, &result.route);
    let header = attribution_header(&attribution);

    let positions: Vec<Vec<(f64, f64)>> = result
        .route
        .iter()
        .map(|segment| {
            segment
                .nodes
                .iter()
                .filter_map(|&node| node_position(&state.graph, &network.stations, node))
                .collect()
        })
        .collect();
    let mut response = match request.format {
        Format::Json => {
            let route: Vec<Value> = result
                .route
                .iter()
                .zip(&positions)
                .map(|(segment, points)| {
                    let mut value = json!(segment);
                    value["coordinates"] = json!(
                        points
                            .iter()
                            .map(|&(lat, lon)| [lat, lon])
                            .collect::<Vec<_>>()
                    );
                    value
                })
                .collect();
            let mut body = json!({
                "route": route,
                "arrival_time": result.arrival_time,
                "attribution": attribution,
            });
            if let Some(snapped) = snapped {
                body["snapped"] = snapped;
            }
            json_response(StatusCode::OK, &body)
        }
        Format::GeoJson => {
            let features: Vec<Value> = result
                .route
                .iter()
                .zip(&positions)
                .map(|(segment, points)| {
                    let coordinates: Vec<[f64; 2]> =
                        points.iter().map(|&(lat, lon)| [lon, lat]).collect();
                    let geometry = match coordinates.len() {
                        0 => Value::Null,
                        1 => json!({"type": "Point", "coordinates": coordinates[0]}),
                        _ => json!({"type": "LineString", "coordinates": coordinates}),
                    };
                    json!({"type": "Feature", "geometry": geometry, "properties": segment})
                })
                .collect();
            let mut body = json!({
                "type": "FeatureCollection",
                "features": features,
                "arrival_time": result.arrival_time,
                "attribution": attribution,
            });
            if let Some(snapped) = snapped {
                body["snapped"] = snapped;
            }
            (
                StatusCode::OK,
                [(header::CONTENT_TYPE, "application/geo+json")],
                body.to_string(),
            )
                .into_response()
        }
    };
    if let Ok(value) = HeaderValue::from_str(&format!("\"{}\"", header)) {
        response
            .headers_mut()
            .insert(HeaderName::from_static("attribution"), value);
    }
    Ok(response)
}
