// SPDX-License-Identifier: AGPL-3.0
// Copyright (C) 2026 Naoise McG
use crate::plugin::Timeouts;
use crate::route::SearchLimits;
use std::collections::HashMap;
use std::env;
use std::path::Path;
use std::time::Duration;

pub const CONFIG_FILE: &str = "maps-server.toml";

pub const KEYS: [&str; 16] = [
    "OSM_PBF_FILES",
    "MAPS_BIND",
    "MAPS_MAX_BODY_BYTES",
    "MAPS_MAX_REQUIRED_NODES",
    "MAPS_MIN_TRANSFER_S",
    "MAPS_MAX_SPEED_KMH",
    "MAPS_MAX_EXPANDED",
    "MAPS_MAX_PLUGIN_CALLS",
    "MAPS_HORIZON_H",
    "MAPS_CACHE_TTL_S",
    "MAPS_PLUGIN_TIMEOUT_S",
    "MAPS_PLUGIN_STARTUP_TIMEOUT_S",
    "MAPS_OVERPASS_IMAGE",
    "MAPS_OVERPASS_READY_TIMEOUT_S",
    "MAPS_SOURCE_URL",
    "OSM_PBF_FILE_NAME",
];

pub type Lookup<'a> = &'a dyn Fn(&str) -> Option<String>;

pub fn file_key(name: &str) -> Option<&'static str> {
    let upper = name.to_uppercase();
    KEYS.iter().copied().find(|key| {
        *key == upper
            || key
                .strip_prefix("MAPS_")
                .is_some_and(|short| short == upper)
    })
}

pub fn file_values(text: &str, origin: &str) -> Result<HashMap<String, String>, String> {
    let table: toml::Table = text
        .parse()
        .map_err(|error| format!("{} is not valid TOML: {}", origin, error))?;
    let mut values = HashMap::new();
    for (name, value) in table {
        let key = file_key(&name).ok_or_else(|| {
            format!(
                "{} has an unknown setting {:?}; the settings are {}",
                origin,
                name,
                KEYS.iter()
                    .map(|key| key.strip_prefix("MAPS_").unwrap_or(key).to_lowercase())
                    .collect::<Vec<_>>()
                    .join(", ")
            )
        })?;
        let text = match value {
            toml::Value::String(text) => text,
            toml::Value::Integer(number) => number.to_string(),
            toml::Value::Float(number) => number.to_string(),
            toml::Value::Array(items) if key.starts_with("OSM_PBF_FILE") => items
                .iter()
                .map(|item| item.as_str().map(str::to_string))
                .collect::<Option<Vec<String>>>()
                .ok_or_else(|| format!("{} in {} must be a list of file names", name, origin))?
                .join(","),
            other => {
                return Err(format!(
                    "{} in {} must be a string or a number, got a {}",
                    name,
                    origin,
                    other.type_str()
                ));
            }
        };
        values.insert(key.to_string(), text);
    }
    Ok(values)
}

pub struct Loaded {
    pub config: Config,
    pub sources: HashMap<&'static str, String>,
}

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
    pub min_transfer_s: u64,
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
        Self::load().map(|loaded| loaded.config)
    }

    pub fn load() -> Result<Loaded, String> {
        let (text, origin) = match env::var("MAPS_CONFIG") {
            Ok(path) => (
                std::fs::read_to_string(&path)
                    .map_err(|error| format!("cannot read MAPS_CONFIG {}: {}", path, error))?,
                path,
            ),
            Err(_) if Path::new(CONFIG_FILE).is_file() => (
                std::fs::read_to_string(CONFIG_FILE)
                    .map_err(|error| format!("cannot read {}: {}", CONFIG_FILE, error))?,
                CONFIG_FILE.to_string(),
            ),
            Err(_) => (String::new(), CONFIG_FILE.to_string()),
        };
        let file = file_values(&text, &origin)?;
        let environment = |key: &str| env::var(key).ok().filter(|value| !value.trim().is_empty());
        Self::from_layers(&environment, &file, &origin)
    }

    pub fn from_layers(
        environment: Lookup,
        file: &HashMap<String, String>,
        origin: &str,
    ) -> Result<Loaded, String> {
        let layered = |key: &str| environment(key).or_else(|| file.get(key).cloned());
        let config = Self::from_lookup(&layered)?;
        let sources = KEYS
            .iter()
            .map(|&key| {
                let source = if environment(key).is_some() {
                    "environment".to_string()
                } else if file.contains_key(key) {
                    origin.to_string()
                } else {
                    "default".to_string()
                };
                (key, source)
            })
            .collect();
        Ok(Loaded { config, sources })
    }

    pub fn describe(&self) -> Vec<(&'static str, String)> {
        vec![
            ("OSM_PBF_FILES", self.osm_pbf_files.join(",")),
            ("MAPS_BIND", self.bind.clone()),
            ("MAPS_MAX_BODY_BYTES", self.max_body_bytes.to_string()),
            (
                "MAPS_MAX_REQUIRED_NODES",
                self.max_required_nodes.to_string(),
            ),
            ("MAPS_MIN_TRANSFER_S", self.min_transfer_s.to_string()),
            ("MAPS_MAX_SPEED_KMH", self.max_speed_kmh.to_string()),
            ("MAPS_MAX_EXPANDED", self.max_expanded.to_string()),
            ("MAPS_MAX_PLUGIN_CALLS", self.max_plugin_calls.to_string()),
            ("MAPS_HORIZON_H", self.horizon_h.to_string()),
            ("MAPS_CACHE_TTL_S", self.cache_ttl_s.to_string()),
            ("MAPS_PLUGIN_TIMEOUT_S", self.plugin_timeout_s.to_string()),
            (
                "MAPS_PLUGIN_STARTUP_TIMEOUT_S",
                self.plugin_startup_timeout_s.to_string(),
            ),
            ("MAPS_OVERPASS_IMAGE", self.overpass_image.clone()),
            (
                "MAPS_OVERPASS_READY_TIMEOUT_S",
                self.overpass_ready_timeout_s.to_string(),
            ),
            ("MAPS_SOURCE_URL", self.source_url.clone()),
        ]
    }

    pub fn from_lookup(lookup: Lookup) -> Result<Self, String> {
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
            min_transfer_s: number(lookup, "MAPS_MIN_TRANSFER_S", 60)?,
            max_expanded: number(lookup, "MAPS_MAX_EXPANDED", 5_000_000)?,
            max_plugin_calls: number(lookup, "MAPS_MAX_PLUGIN_CALLS", 1000)?,
            horizon_h: non_negative(number(lookup, "MAPS_HORIZON_H", 24.0)?, "MAPS_HORIZON_H")?,
            cache_ttl_s: number(lookup, "MAPS_CACHE_TTL_S", 120)?,
            plugin_timeout_s: number(lookup, "MAPS_PLUGIN_TIMEOUT_S", 30)?,
            plugin_startup_timeout_s: number(lookup, "MAPS_PLUGIN_STARTUP_TIMEOUT_S", 900)?,
        })
    }
}

fn text(lookup: Lookup, key: &str, default: &str) -> String {
    lookup(key)
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| default.to_string())
}

fn number<T: std::str::FromStr>(lookup: Lookup, key: &str, default: T) -> Result<T, String> {
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

pub fn is_secret(key: &str) -> bool {
    ["KEY", "TOKEN", "SECRET", "PASSWORD"]
        .iter()
        .any(|word| key.contains(word))
}

impl Loaded {
    pub fn summary(&self) -> String {
        let mut lines = vec!["Configuration:".to_string()];
        for (key, value) in self.config.describe() {
            let shown = if is_secret(key) {
                "(hidden)".to_string()
            } else {
                value
            };
            let source = self
                .sources
                .get(key)
                .map(String::as_str)
                .unwrap_or("default");
            lines.push(format!("  {} = {} ({})", key, shown, source));
        }
        lines.join("\n")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn environment_beats_file_beats_defaults() {
        let file = file_values(
            "bind = \"127.0.0.1:7000\"\nmax_expanded = 1000\ncache_ttl_s = 30\nosm_pbf_files = [\"a.osm.pbf\", \"b.osm.pbf\"]\n",
            "maps-server.toml",
        )
        .unwrap();
        let environment = |key: &str| match key {
            "MAPS_BIND" => Some("0.0.0.0:9000".to_string()),
            "MAPS_HORIZON_H" => Some("6".to_string()),
            _ => None,
        };
        let loaded = Config::from_layers(&environment, &file, "maps-server.toml").unwrap();
        let config = &loaded.config;
        assert_eq!(config.bind, "0.0.0.0:9000");
        assert_eq!(config.max_expanded, 1000);
        assert_eq!(config.cache_ttl_s, 30);
        assert_eq!(config.horizon_h, 6.0);
        assert_eq!(config.max_plugin_calls, 1000);
        assert_eq!(config.osm_pbf_files, vec!["a.osm.pbf", "b.osm.pbf"]);
        assert_eq!(loaded.sources["MAPS_BIND"], "environment");
        assert_eq!(loaded.sources["MAPS_MAX_EXPANDED"], "maps-server.toml");
        assert_eq!(loaded.sources["MAPS_MAX_PLUGIN_CALLS"], "default");
        let summary = loaded.summary();
        assert!(
            summary.contains("MAPS_BIND = 0.0.0.0:9000 (environment)"),
            "{}",
            summary
        );
        assert!(
            summary.contains("MAPS_CACHE_TTL_S = 30 (maps-server.toml)"),
            "{}",
            summary
        );
        assert!(
            summary
                .contains("MAPS_SOURCE_URL = https://gitlab.com/buphagidae/maps-server (default)"),
            "{}",
            summary
        );
    }

    #[test]
    fn file_keys_may_also_be_written_in_full() {
        let file = file_values(
            "MAPS_BIND = \"127.0.0.1:7000\"\nMAPS_MAX_SPEED_KMH = 350.5",
            "x",
        )
        .unwrap();
        assert_eq!(file["MAPS_BIND"], "127.0.0.1:7000");
        assert_eq!(file["MAPS_MAX_SPEED_KMH"], "350.5");
    }

    #[test]
    fn mistakes_in_the_file_are_reported() {
        let unknown = file_values("max_expandid = 5", "maps-server.toml").unwrap_err();
        assert!(
            unknown.contains("unknown setting \"max_expandid\""),
            "{}",
            unknown
        );
        assert!(unknown.contains("max_expanded"), "{}", unknown);
        assert!(file_values("bind = [1, 2]", "f").is_err());
        assert!(file_values("bind = true", "f").is_err());
        assert!(
            file_values("bind = ", "f")
                .unwrap_err()
                .contains("not valid TOML")
        );
        let bad_number = Config::from_layers(
            &|_| None,
            &file_values("max_expanded = \"lots\"", "f").unwrap(),
            "f",
        );
        assert!(bad_number.is_err());
    }

    #[test]
    fn secrets_are_hidden() {
        assert!(is_secret("MAPS_API_KEY"));
        assert!(is_secret("SNCF_TOKEN"));
        assert!(!is_secret("MAPS_BIND"));
    }
}
