// SPDX-License-Identifier: AGPL-3.0
// Copyright (C) 2026 Naoise McG
use std::env;

pub const DEFAULT_OVERPASS_IMAGE: &str = "wiktorn/overpass-api:v0.7.62.9";

pub struct Config {
    pub bind: String,
    pub max_body_bytes: usize,
    pub overpass_image: String,
}

impl Config {
    pub fn from_env() -> Result<Self, String> {
        Self::from_lookup(&|key| env::var(key).ok())
    }

    pub fn from_lookup(lookup: &dyn Fn(&str) -> Option<String>) -> Result<Self, String> {
        Ok(Config {
            bind: text(lookup, "MAPS_BIND", "0.0.0.0:6767"),
            max_body_bytes: number(lookup, "MAPS_MAX_BODY_BYTES", 65536)?,
            overpass_image: text(lookup, "MAPS_OVERPASS_IMAGE", DEFAULT_OVERPASS_IMAGE),
        })
    }
}

fn text(lookup: &dyn Fn(&str) -> Option<String>, key: &str, default: &str) -> String {
    lookup(key)
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| default.to_string())
}

fn number<T: std::str::FromStr>(
    lookup: &dyn Fn(&str) -> Option<String>,
    key: &str,
    default: T,
) -> Result<T, String> {
    match lookup(key).map(|value| value.trim().to_string()) {
        Some(value) if !value.is_empty() => value
            .parse()
            .map_err(|_| format!("{} must be a number, got {:?}", key, value)),
        _ => Ok(default),
    }
}
