// SPDX-License-Identifier: AGPL-3.0
// Copyright (C) 2026 Naoise McG
use std::env;

pub const DEFAULT_OVERPASS_IMAGE: &str = "wiktorn/overpass-api:v0.7.62.9";

pub struct Config {
    pub overpass_image: String,
}

impl Config {
    pub fn from_env() -> Result<Self, String> {
        Self::from_lookup(&|key| env::var(key).ok())
    }

    pub fn from_lookup(lookup: &dyn Fn(&str) -> Option<String>) -> Result<Self, String> {
        Ok(Config {
            overpass_image: lookup("MAPS_OVERPASS_IMAGE")
                .filter(|value| !value.trim().is_empty())
                .unwrap_or_else(|| DEFAULT_OVERPASS_IMAGE.to_string()),
        })
    }
}
