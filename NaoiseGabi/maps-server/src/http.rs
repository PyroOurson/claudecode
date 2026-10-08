// SPDX-License-Identifier: AGPL-3.0
// Copyright (C) 2026 Naoise McG
use crate::Plugin;
use crate::route::{
    Graph, Line, OutgoingJourney, SearchParams, Stations, parse_journey_departure,
    route_with_schedule,
};
use axum::Router;
use axum::body::{Body, Bytes};
use axum::extract::rejection::BytesRejection;
use axum::extract::{DefaultBodyLimit, State};
use axum::http::{HeaderName, HeaderValue, StatusCode, header};
use axum::middleware;
use axum::response::{IntoResponse, Response};
use axum::routing::post;
use chrono::{DateTime, NaiveDateTime, Utc};
use serde_json::Value;
use std::collections::{HashMap, HashSet};
use std::sync::{Arc, LazyLock, Mutex};

const SOURCE_URL: &str = "https://gitlab.com/buphagidae/buphagus";

pub struct AppState {
    pub graph: &'static LazyLock<Graph>,
    pub plugins: Mutex<Vec<Plugin>>,
    pub stations: Stations,
}

pub fn router(state: Arc<AppState>, max_body_bytes: usize) -> Router {
    Router::new()
        .route("/", post(plan).options(preflight))
        .layer(DefaultBodyLimit::max(max_body_bytes))
        .layer(middleware::map_response(common_headers))
        .with_state(state)
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
            return json_response(
                rejection.status(),
                &serde_json::json!({ "error": rejection.body_text() }),
            );
        }
    };
    match tokio::task::spawn_blocking(move || compute(&state, &body)).await {
        Ok(response) => response,
        Err(_) => json_response(
            StatusCode::INTERNAL_SERVER_ERROR,
            &serde_json::json!({ "error": "internal error" }),
        ),
    }
}

fn explore_station(
    plugins: &Mutex<Vec<Plugin>>,
    station: i64,
    time: DateTime<Utc>,
) -> Vec<OutgoingJourney> {
    let mut journeys = Vec::new();
    let mut plugins = plugins.lock().unwrap();

    for (p_idx, plugin) in plugins.iter_mut().enumerate() {
        if let Ok(value) = plugin.explore(station, time)
            && let Some(array) = value.as_array()
        {
            for entry in array {
                if let (Some(to_node), Some(cost), Some(time_str)) = (
                    entry.get("to").and_then(|v| v.as_i64()),
                    entry.get("cost").and_then(|v| v.as_i64()),
                    entry.get("time").and_then(|v| v.as_str()),
                ) {
                    let line = entry.get("line").and_then(|l| {
                        let id = l.get("id").and_then(|v| v.as_str()).map(|s| s.to_string());
                        let preferred_colour = l
                            .get("preferred_colour")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string());
                        if id.is_some() || preferred_colour.is_some() {
                            Some(Line {
                                id,
                                preferred_colour,
                            })
                        } else {
                            None
                        }
                    });
                    if let Ok(departure) = parse_journey_departure(time_str) {
                        journeys.push(OutgoingJourney {
                            target_station: to_node,
                            departure,
                            cost_seconds: cost as u64,
                            plugin_id: Some(p_idx),
                            mode: plugin.mode.clone(),
                            line,
                        });
                    }
                }
            }
        }
        if !journeys.is_empty() {
            break;
        }
    }
    journeys
}

fn compute(state: &AppState, body: &[u8]) -> Response {
    let data: Value = serde_json::from_slice(body).expect("No data");

    println!("Received payload: {:?}", data);

    let node_ids: Vec<i64> =
        serde_json::from_value(data["required_nodes"].clone()).expect("No data");
    let heuristic: bool = serde_json::from_value(data["heuristic"].clone()).unwrap_or(0) != 0;

    let mut cached_explorations: HashMap<(i64, DateTime<Utc>), Vec<OutgoingJourney>> =
        HashMap::new();
    let mut fetch_outgoing = |from_station: i64, time: DateTime<Utc>| -> Vec<OutgoingJourney> {
        cached_explorations
            .entry((from_station, time))
            .or_insert_with(|| explore_station(&state.plugins, from_station, time))
            .clone()
    };

    let params = SearchParams {
        stations: &state.stations,
        walking_speed: data["walking_speed"].as_f64().unwrap_or(0.00138),
        use_heuristic: heuristic,
        min_transfer: chrono::Duration::seconds(60),
    };
    let start_time = NaiveDateTime::parse_from_str(
        data["time"]
            .as_str()
            .unwrap_or(Utc::now().format("%Y%m%dT%H%M%S").to_string().as_str()),
        "%Y%m%dT%H%M%S",
    )
    .unwrap_or(Utc::now().naive_utc())
    .and_utc();
    let result = route_with_schedule(
        state.graph,
        &params,
        &node_ids,
        start_time,
        &mut fetch_outgoing,
    );

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
        &serde_json::json!({
            "route": result.route,
            "arrival_time": result.arrival_time
        }),
    );
    if let Ok(value) = HeaderValue::from_str(&format!("\"{}\"", attributions)) {
        response
            .headers_mut()
            .insert(HeaderName::from_static("attribution"), value);
    }
    response
}
