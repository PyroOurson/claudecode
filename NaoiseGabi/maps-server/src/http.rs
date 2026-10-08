// SPDX-License-Identifier: AGPL-3.0
// Copyright (C) 2026 Naoise McG
use crate::Plugin;
use crate::config::Config;
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
use axum::routing::post;
use chrono::{DateTime, Utc};
use serde_json::{Value, json};
use std::collections::{HashMap, HashSet};
use std::sync::{Arc, LazyLock, Mutex};

const SOURCE_URL: &str = "https://gitlab.com/buphagidae/buphagus";

pub struct AppState {
    pub config: Config,
    pub graph: &'static LazyLock<Graph>,
    pub plugins: Mutex<Vec<Plugin>>,
    pub stations: Stations,
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
        }
    }
}

pub fn router(state: Arc<AppState>) -> Router {
    let max_body_bytes = state.config.max_body_bytes;
    Router::new()
        .route("/", post(plan).options(preflight))
        .fallback(not_found)
        .method_not_allowed_fallback(method_not_allowed)
        .layer(DefaultBodyLimit::max(max_body_bytes))
        .layer(middleware::map_response(common_headers))
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

async fn common_headers(mut response: Response) -> Response {
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
        if let Ok(value) = HeaderValue::from_str(&format!("\"{}\"", SOURCE_URL)) {
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
    plugins: &Mutex<Vec<Plugin>>,
    index: usize,
    station: i64,
    time: DateTime<Utc>,
) -> Vec<OutgoingJourney> {
    let mut plugins = plugins.lock().unwrap();
    let Some(plugin) = plugins.get_mut(index) else {
        return Vec::new();
    };
    match plugin.explore(station, time) {
        Ok(value) => parse_journeys(&plugin.name, index, &plugin.mode, station, &value),
        Err(_) => Vec::new(),
    }
}

fn compute(state: &AppState, body: &[u8]) -> Result<Response, ApiError> {
    let request = parse_request(body, &state.config)?;

    println!("Received request: {:?}", request);

    let mut cached_explorations: HashMap<(i64, usize, DateTime<Utc>), Vec<OutgoingJourney>> =
        HashMap::new();
    let mut fetch_outgoing = |station: i64, time: DateTime<Utc>, exclude: Option<usize>| {
        let mut journeys = Vec::new();
        for &index in state.stations.plugins_serving(station) {
            if Some(index) == exclude {
                continue;
            }
            journeys.extend_from_slice(
                cached_explorations
                    .entry((station, index, time))
                    .or_insert_with(|| explore_with(&state.plugins, index, station, time)),
            );
        }
        journeys
    };

    let params = SearchParams {
        stations: &state.stations,
        walking_speed: request.walking_speed,
        mode: request.mode,
        max_speed_kmh: state.config.max_speed_kmh,
        min_transfer: chrono::Duration::seconds(60),
    };
    let mut stats = SearchStats::default();
    let result = route_with_schedule(
        state.graph,
        &params,
        &request.required_nodes,
        request.start_time,
        &mut fetch_outgoing,
        &mut stats,
    )?;

    let plugin_attributions = state
        .plugins
        .lock()
        .unwrap()
        .iter()
        .map(|plugin| {
            format!(
                "{}, provided under the {}, translated by {}, under the {}.",
                plugin.data_attribution,
                plugin.data_license,
                plugin.plugin_attribution,
                plugin.plugin_license
            )
        })
        .collect::<HashSet<String>>()
        .into_iter()
        .collect::<Vec<_>>()
        .join("\n");

    let attributions = format!(
        "Realtime and Schedule data has been provided by the following organisations, under various licenses. It has been provided as-is, and these organisations are not responsible for any errors or inaccuracies. The various data formats have been translated by various individuals. \n {}",
        plugin_attributions
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
