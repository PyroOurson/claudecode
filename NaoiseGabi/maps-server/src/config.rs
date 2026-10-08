// SPDX-License-Identifier: AGPL-3.0
// Copyright (C) 2026 Naoise McG
use std::env;

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
    pub source_url: String,
}

impl Default for Config {
    fn default() -> Self {
        Config::from_lookup(&|_| None).unwrap_or_else(|error| panic!("{}", error))
    }
}

impl Config {
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
            source_url: text(lookup, "MAPS_SOURCE_URL", DEFAULT_SOURCE_URL),
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
