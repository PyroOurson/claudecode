// SPDX-License-Identifier: AGPL-3.0
// Copyright (C) 2026 Naoise McG
use crate::plugin::Timeouts;
use crate::route::SearchLimits;
use std::env;
use std::time::Duration;

pub const DEFAULT_OVERPASS_IMAGE: &str = "wiktorn/overpass-api:v0.7.62.9";
pub const DEFAULT_OSM_PBF_FILE: &str = "provence-alpes-cote-d-azur-260718.osm.pbf";
pub const DEFAULT_SOURCE_URL: &str = "https://gitlab.com/buphagidae/maps-server";

pub struct Config {
    pub osm_pbf_files: Vec<String>,
    pub bind: String,
    pub max_body_bytes: usize,
    pub max_required_nodes: usize,
    pub max_speed_kmh: f64,
    pub overpass_image: String,
    pub overpass_ready_timeout_s: u64,
    pub source_url: String,
    pub max_expanded: usize,
    pub max_plugin_calls: usize,
    pub horizon_h: f64,
    pub cache_ttl_s: u64,
    pub plugin_timeout_s: u64,
    pub plugin_startup_timeout_s: u64,
}

impl Default for Config {
    fn default() -> Self {
        Config::from_lookup(&|_| None).unwrap_or_else(|error| panic!("{}", error))
    }
}

impl Config {
    pub fn search_limits(&self) -> SearchLimits {
        SearchLimits {
            max_expanded: self.max_expanded,
            max_plugin_calls: self.max_plugin_calls,
            horizon: chrono::Duration::milliseconds((self.horizon_h * 3_600_000.0) as i64),
        }
    }

    pub fn plugin_timeouts(&self) -> Timeouts {
        Timeouts {
            call: Duration::from_secs(self.plugin_timeout_s.max(1)),
            startup: Duration::from_secs(self.plugin_startup_timeout_s.max(1)),
        }
    }

    pub fn from_env() -> Result<Self, String> {
        Self::from_lookup(&|key| env::var(key).ok())
    }

    pub fn from_lookup(lookup: &dyn Fn(&str) -> Option<String>) -> Result<Self, String> {
        let files = lookup("OSM_PBF_FILES")
            .or_else(|| lookup("OSM_PBF_FILE_NAME"))
            .unwrap_or_default();
        let mut osm_pbf_files: Vec<String> = files
            .split(',')
            .map(|item| item.trim().to_string())
            .filter(|item| !item.is_empty())
            .collect();
        if osm_pbf_files.is_empty() {
            osm_pbf_files.push(DEFAULT_OSM_PBF_FILE.to_string());
        }
        Ok(Config {
            osm_pbf_files,
            bind: text(lookup, "MAPS_BIND", "0.0.0.0:6767"),
            max_body_bytes: number(lookup, "MAPS_MAX_BODY_BYTES", 65536)?,
            max_required_nodes: number(lookup, "MAPS_MAX_REQUIRED_NODES", 25)?,
            max_speed_kmh: non_negative(
                number(lookup, "MAPS_MAX_SPEED_KMH", 300.0)?,
                "MAPS_MAX_SPEED_KMH",
            )?,
            overpass_image: text(lookup, "MAPS_OVERPASS_IMAGE", DEFAULT_OVERPASS_IMAGE),
            overpass_ready_timeout_s: number(lookup, "MAPS_OVERPASS_READY_TIMEOUT_S", 21600)?,
            source_url: text(lookup, "MAPS_SOURCE_URL", DEFAULT_SOURCE_URL),
            max_expanded: number(lookup, "MAPS_MAX_EXPANDED", 5_000_000)?,
            max_plugin_calls: number(lookup, "MAPS_MAX_PLUGIN_CALLS", 1000)?,
            horizon_h: non_negative(number(lookup, "MAPS_HORIZON_H", 24.0)?, "MAPS_HORIZON_H")?,
            cache_ttl_s: number(lookup, "MAPS_CACHE_TTL_S", 120)?,
            plugin_timeout_s: number(lookup, "MAPS_PLUGIN_TIMEOUT_S", 30)?,
            plugin_startup_timeout_s: number(lookup, "MAPS_PLUGIN_STARTUP_TIMEOUT_S", 900)?,
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

fn non_negative(value: f64, key: &str) -> Result<f64, String> {
    if value.is_finite() && value >= 0.0 {
        Ok(value)
    } else {
        Err(format!(
            "{} must be a number of at least 0, got {}",
            key, value
        ))
    }
}
