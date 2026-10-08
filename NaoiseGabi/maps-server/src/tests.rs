// SPDX-License-Identifier: AGPL-3.0
// Copyright (C) 2026 Naoise McG
use crate::testkit::{exchange, request, send, serve, serve_state, state};
use serde_json::json;

fn walk() -> String {
    json!({"required_nodes": [1, 2], "time": "20260808T120000"}).to_string()
}

#[test]
fn preflight_is_answered_as_before() {
    let reply = send(Vec::new(), vec![request("OPTIONS", "/", "")]);
    assert_eq!(reply.status, 204, "{}", reply.raw);
    assert_eq!(reply.header("Access-Control-Allow-Origin"), Some("*"));
    assert_eq!(
        reply.header("Access-Control-Allow-Methods"),
        Some("POST, OPTIONS")
    );
    assert_eq!(
        reply.header("Access-Control-Allow-Headers"),
        Some("Content-Type")
    );
    assert_eq!(reply.header("Access-Control-Max-Age"), Some("86400"));
    assert_eq!(reply.header("Content-Length").unwrap_or("0"), "0");
}

#[test]
fn routes_carry_cors_attribution_and_source_headers() {
    let reply = send(Vec::new(), vec![request("POST", "/", &walk())]);
    assert_eq!(reply.status, 200, "{}", reply.raw);
    assert_eq!(reply.header("Content-Type"), Some("application/json"));
    assert_eq!(reply.header("Access-Control-Allow-Origin"), Some("*"));
    assert_eq!(
        reply.header("Access-Control-Expose-Headers"),
        Some("Attribution, Source-Code")
    );
    assert!(
        reply
            .header("Attribution")
            .is_some_and(|value| value.starts_with('"'))
    );
    assert!(
        reply
            .header("Source-Code")
            .is_some_and(|value| value.starts_with("\"https://"))
    );
}

#[test]
fn bodies_over_the_limit_get_413_with_cors_headers() {
    let address = serve_state(state(Vec::new()), 64);
    let reply = exchange(address, vec![request("POST", "/", &walk().repeat(4))]);
    assert_eq!(reply.status, 413, "{}", reply.raw);
    assert!(reply.json["error"].is_string(), "{}", reply.raw);
    assert_eq!(reply.header("Access-Control-Allow-Origin"), Some("*"));
}

#[test]
fn other_methods_get_405() {
    let reply = exchange(serve(Vec::new()), vec![request("GET", "/", "")]);
    assert_eq!(reply.status, 405, "{}", reply.raw);
}
