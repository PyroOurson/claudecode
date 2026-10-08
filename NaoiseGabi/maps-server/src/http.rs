// SPDX-License-Identifier: AGPL-3.0
// Copyright (C) 2026 Naoise McG
use crate::Plugin;
use crate::cache::{ExploreCache, Journeys};
use crate::config::Config;
use crate::overpass;
use crate::plugin::parse_journeys;
use crate::route::{
    Graph, OutgoingJourney, RouteError, SearchMode, SearchParams, SearchStats, Stations,
    parse_request_time, route_with_schedule,
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
use serde_json::{Value, json};
use std::collections::{HashMap, HashSet};
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
    pub required_nodes: Vec<i64>,
    pub start_time: DateTime<Utc>,
    pub walking_speed: f64,
    pub mode: SearchMode,
}

pub fn parse_request(body: &[u8], config: &Config) -> Result<RouteRequest, ApiError> {
    let data: Value = serde_json::from_slice(body)
        .map_err(|error| ApiError::bad_request(format!("invalid JSON: {}", error)))?;
    let fields = data
        .as_object()
        .ok_or_else(|| ApiError::bad_request("the body must be a JSON object"))?;
    let present = |key: &str| fields.get(key).filter(|value| !value.is_null());

    let nodes = present("required_nodes")
        .ok_or_else(|| ApiError::bad_request("required_nodes is missing"))?
        .as_array()
        .ok_or_else(|| ApiError::bad_request("required_nodes must be an array of integers"))?;
    let required_nodes = nodes
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
        .collect::<Result<Vec<i64>, ApiError>>()?;
    if required_nodes.len() < 2 {
        return Err(ApiError::bad_request(
            "required_nodes needs at least 2 nodes",
        ));
    }
    if required_nodes.len() > config.max_required_nodes {
        return Err(ApiError::bad_request(format!(
            "required_nodes has {} nodes, the limit is {}",
            required_nodes.len(),
            config.max_required_nodes
        )));
    }

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

    Ok(RouteRequest {
        required_nodes,
        start_time,
        walking_speed,
        mode,
    })
}

fn explore_with(
    plugin: &Plugin,
    station: i64,
    time: DateTime<Utc>,
) -> Option<Vec<OutgoingJourney>> {
    match plugin.explore(station, time) {
        Ok(value) => Some(parse_journeys(
            plugin.name(),
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
            .and_then(|plugin| explore_with(plugin, station, time));
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

fn compute(state: &AppState, body: &[u8]) -> Result<Response, ApiError> {
    let request = parse_request(body, &state.config)?;
    let network = state.network().ok_or_else(|| {
        ApiError::new(
            StatusCode::SERVICE_UNAVAILABLE,
            json!({ "error": "starting: waiting for Overpass and the plugins" }),
        )
    })?;

    println!("Received request: {:?}", request);

    let mut seen: HashMap<(i64, usize, DateTime<Utc>), Journeys> = HashMap::new();
    let mut fetch_outgoing = |station: i64, time: DateTime<Utc>| {
        let window = ExploreCache::window_start(time);
        let mut found = Vec::new();
        let mut missing = Vec::new();
        for &index in network.stations.plugins_serving(station) {
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
        min_transfer: chrono::Duration::seconds(60),
    };
    let mut stats = SearchStats::default();
    let result = route_with_schedule(
        &state.graph,
        &params,
        &request.required_nodes,
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

    let plugin_attributions = network
        .plugins
        .iter()
        .map(|plugin| {
            format!(
                "{}, provided under the {}, translated by {}, under the {}.",
                plugin.data_owner(),
                plugin.data_license(),
                plugin.plugin_owner(),
                plugin.plugin_license()
            )
        })
        .collect::<HashSet<String>>()
        .into_iter()
        .collect::<Vec<_>>()
        .join("\n");

    let attributions = format!(
        "{}\nRealtime and Schedule data has been provided by the following organisations, under various licenses. It has been provided as-is, and these organisations are not responsible for any errors or inaccuracies. The various data formats have been translated by various individuals. \n {}",
        OSM_ATTRIBUTION, plugin_attributions
    );
    let attributions = urlencoding::encode(attributions.as_str());

    let mut response = json_response(
        StatusCode::OK,
        &json!({
            "route": result.route,
            "arrival_time": result.arrival_time
        }),
    );
    if let Ok(value) = HeaderValue::from_str(&format!("\"{}\"", attributions)) {
        response
            .headers_mut()
            .insert(HeaderName::from_static("attribution"), value);
    }
    Ok(response)
}
