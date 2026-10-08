// SPDX-License-Identifier: AGPL-3.0
// Copyright (C) 2026 Naoise McG
use bollard::Docker;
use bollard::models::{ContainerCreateBody, HostConfig, PortBinding};
use bollard::query_parameters::{
    CreateContainerOptionsBuilder, RemoveVolumeOptions, StartContainerOptions, StopContainerOptions,
};
use chrono::{DateTime, Utc};
use config::Config;
use http::AppState;
use route::{Graph, StationAccessMap, Stations};
use serde_core::de::Error;
use serde_json::{Result, Value};
use std::collections::HashMap;
use std::collections::hash_map::DefaultHasher;
use std::env;
use std::fs;
use std::hash::{Hash, Hasher};
use std::io::{BufRead, BufReader, Write};
use std::process::{ChildStdin, ChildStdout, Command, Stdio};
use std::sync::LazyLock;
use std::sync::{Arc, Mutex};

mod config;
mod http;
mod plugin;
mod route;

#[cfg(test)]
mod repro;
#[cfg(test)]
mod testkit;
#[cfg(test)]
mod tests;

pub static OSM_PBF_FILES: LazyLock<Vec<String>> = LazyLock::new(|| {
    env::var("OSM_PBF_FILES")
        .or_else(|_| env::var("OSM_PBF_FILE_NAME"))
        .map(|s| {
            s.split(',')
                .map(|item| item.trim().to_string())
                .filter(|item| !item.is_empty())
                .collect()
        })
        .unwrap_or_else(|_| vec!["provence-alpes-cote-d-azur-260718.osm.pbf".to_string()])
});

static GRAPH: LazyLock<Graph> = LazyLock::new(|| {
    let file_paths: Vec<String> = OSM_PBF_FILES
        .iter()
        .map(|f| format!("assets/{}", f))
        .collect();

    Graph::from_pbfs(&file_paths).expect("Failed to load OSM PBF files")
});

fn calculate_pbf_hash(assets_path: &std::path::Path) -> String {
    let mut hasher = DefaultHasher::new();
    for file_name in OSM_PBF_FILES.iter() {
        let path = assets_path.join(file_name);
        file_name.hash(&mut hasher);
        if let Ok(metadata) = fs::metadata(&path) {
            if let Ok(mtime) = metadata.modified() {
                mtime.hash(&mut hasher);
            }
            metadata.len().hash(&mut hasher);
        }
    }
    format!("{:x}", hasher.finish())
}

pub struct Plugin {
    pub name: String,
    pub mode: String,
    pub data_attribution: String,
    pub data_license: String,
    pub plugin_attribution: String,
    pub plugin_license: String,
    stdin: ChildStdin,
    stdout: BufReader<ChildStdout>,
}

impl Plugin {
    fn send_request(&mut self, action: &str, data: &str) -> String {
        let request = format!("{{\"action\": \"{}\", \"data\": {}}}\n", action, data);
        let _ = self.stdin.write_all(request.as_bytes());
        let _ = self.stdin.flush();

        let mut response = String::new();
        let n = self.stdout.read_line(&mut response);
        match n {
            Ok(0) => String::new(),
            Ok(_) => response,
            Err(e) => {
                eprintln!("Error reading line from plugin {}: {}", self.name, e);
                String::new()
            }
        }
    }

    pub fn available_nodes(&mut self) -> Result<Value> {
        let response = self.send_request("available", "[]");
        let response: Result<Value> = serde_json::from_str(response.as_str());

        match response {
            Ok(r) => {
                if r["response"] != serde_json::Value::Null {
                    Ok(r["response"].clone())
                } else {
                    eprintln!(
                        "Failed to fetch available nodes from plugin {}, received: {}",
                        self.name, r["error"]
                    );
                    Err(serde_json::error::Error::custom(
                        r["error"].as_str().unwrap_or("Unknown Error"),
                    ))
                }
            }
            Err(e) => {
                eprintln!(
                    "Failed to fetch available nodes from plugin {}, malformed response: {}",
                    self.name, e
                );
                Err(e)
            }
        }
    }

    pub fn explore(&mut self, station: i64, datetime: DateTime<Utc>) -> Result<Value> {
        let time_str = datetime.format("%Y%m%dT%H%M%S").to_string();
        let payload = format!(
            "{{\"station\": {}, \"datetime\": \"{}\"}}",
            station, time_str
        );
        let response = self.send_request("explore", &payload);
        let response: Result<Value> = serde_json::from_str(response.as_str());

        match response {
            Ok(r) => {
                if r["response"] != serde_json::Value::Null {
                    Ok(r["response"].clone())
                } else {
                    eprintln!(
                        "Failed to explore station {} from plugin {}, {}",
                        station, self.name, r["error"]
                    );
                    Err(serde_json::error::Error::custom(
                        r["error"].as_str().unwrap_or("Unknown Error"),
                    ))
                }
            }
            Err(e) => {
                eprintln!(
                    "Failed to explore station {} from plugin {}, malformed response: {}",
                    station, self.name, e
                );
                Err(e)
            }
        }
    }
}

const OVERPASS_HOST_IP: &str = "127.0.0.1";

async fn start_overpass_container(
    docker: &Docker,
    config: &Config,
) -> std::result::Result<(), Box<dyn std::error::Error>> {
    let container_name = "overpass_api";
    let current_dir = env::current_dir()?;
    let assets_dir = current_dir.join("assets");
    let current_hash = calculate_pbf_hash(&assets_dir);

    if let Ok(inspect) = docker.inspect_container(container_name, None).await {
        let existing_hash = inspect
            .config
            .as_ref()
            .and_then(|c| c.labels.as_ref())
            .and_then(|l| l.get("pbf_hash").cloned())
            .unwrap_or_default();
        let existing_image = inspect
            .config
            .as_ref()
            .and_then(|c| c.image.clone())
            .unwrap_or_default();
        let published_on = inspect
            .host_config
            .as_ref()
            .and_then(|h| h.port_bindings.as_ref())
            .and_then(|bindings| bindings.get("80/tcp").cloned().flatten())
            .and_then(|bindings| bindings.into_iter().find_map(|b| b.host_ip))
            .unwrap_or_default();

        if existing_hash != current_hash {
            println!(
                "Detected changes in PBF files. Removing container and database volume to force rebuild..."
            );
            let _ = docker
                .stop_container(container_name, None::<StopContainerOptions>)
                .await;
            let _ = docker.remove_container(container_name, None).await;
            let _ = docker
                .remove_volume("overpass_db", None::<RemoveVolumeOptions>)
                .await;
        } else if existing_image != config.overpass_image || published_on != OVERPASS_HOST_IP {
            println!(
                "Recreating the Overpass container with image {} on {}, keeping its database (it used {} on {}).",
                config.overpass_image, OVERPASS_HOST_IP, existing_image, published_on
            );
            let _ = docker
                .stop_container(container_name, None::<StopContainerOptions>)
                .await;
            docker.remove_container(container_name, None).await?;
        } else {
            let is_running = inspect.state.and_then(|s| s.running).unwrap_or(false);
            if !is_running {
                println!("Container exists but is stopped. Starting...");
                docker
                    .start_container(container_name, None::<StartContainerOptions>)
                    .await?;
            } else {
                println!("Container is already running and up to date.");
            }
            return Ok(());
        }
    }

    println!("Creating and starting Overpass container...");

    let mut port_bindings = HashMap::new();
    port_bindings.insert(
        "80/tcp".to_string(),
        Some(vec![PortBinding {
            host_ip: Some(OVERPASS_HOST_IP.to_string()),
            host_port: Some("12345".to_string()),
        }]),
    );

    let host_config = HostConfig {
        binds: Some(vec![
            format!("{}:/assets:ro", assets_dir.to_string_lossy()),
            "overpass_db:/db/db".to_string(),
        ]),
        port_bindings: Some(port_bindings),
        auto_remove: Some(false),
        ..Default::default()
    };

    let input_paths = OSM_PBF_FILES
        .iter()
        .map(|f| format!("/assets/{}", f))
        .collect::<Vec<_>>()
        .join(" ");

    let planet_url = format!("OVERPASS_PLANET_URL=file:///assets/{}", OSM_PBF_FILES[0]);
    let planet_preprocess = format!(
        "OVERPASS_PLANET_PREPROCESS=rm -f /db/planet.osm.bz2 && osmium merge {} -o /db/planet.osm.bz2 && chmod -R 777 /db",
        input_paths
    );

    let mut labels = HashMap::new();
    labels.insert("pbf_hash".to_string(), current_hash);

    let config = ContainerCreateBody {
        image: Some(config.overpass_image.clone()),
        labels: Some(labels),
        env: Some(vec![
            "OVERPASS_MODE=init".to_string(),
            planet_url,
            planet_preprocess,
            "OVERPASS_STOP_AFTER_INIT=false".to_string(),
            "OVERPASS_META=no".to_string(),
            "OVERPASS_USE_AREAS=false".to_string(),
        ]),
        host_config: Some(host_config),
        ..Default::default()
    };

    let options = CreateContainerOptionsBuilder::default()
        .name(container_name)
        .build();

    docker.create_container(Some(options), config).await?;
    docker
        .start_container(container_name, None::<StartContainerOptions>)
        .await?;

    Ok(())
}

async fn stop_overpass_container(
    docker: &Docker,
) -> std::result::Result<(), Box<dyn std::error::Error>> {
    docker
        .stop_container("overpass_api", None::<StopContainerOptions>)
        .await?;
    Ok(())
}

fn build_station_access_map(plugins: &mut [Plugin]) -> Stations {
    let mut station_access = StationAccessMap::new();
    let mut served_by: HashMap<i64, Vec<usize>> = HashMap::new();

    for (index, plugin) in plugins.iter_mut().enumerate() {
        println!("Fetching available nodes from plugin: {}", plugin.name);
        let Ok(value) = plugin.available_nodes() else {
            continue;
        };
        let Some(map) = value.as_object() else {
            eprintln!(
                "Plugin {} answered available with something other than an object",
                plugin.name
            );
            continue;
        };
        let mut skipped = Vec::new();
        for (key, value) in map {
            let (Ok(station_id), Some(entries)) = (key.trim().parse::<i64>(), value.as_array())
            else {
                skipped.push(format!("{}: {}", key, value));
                continue;
            };
            let mut entrance_nodes = Vec::with_capacity(entries.len());
            for entry in entries {
                match plugin::parse_id(entry) {
                    Some(id) => entrance_nodes.push(id),
                    None => skipped.push(format!("{}: entrance {}", key, entry)),
                }
            }
            station_access
                .entry(station_id)
                .or_default()
                .extend(entrance_nodes);
            let serving = served_by.entry(station_id).or_default();
            if !serving.contains(&index) {
                serving.push(index);
            }
        }
        if let Some(first) = skipped.first() {
            eprintln!(
                "Plugin {} listed {} invalid stations or entrances, skipped; the first one: {}",
                plugin.name,
                skipped.len(),
                first
            );
        }
    }

    Stations::with_plugins(station_access, served_by)
}

fn load_plugins() -> Vec<Plugin> {
    let output = Command::new("nix")
        .args([
            "eval",
            "--json",
            "--impure",
            ".#apps",
            "--apply",
            "apps: builtins.attrNames (apps.${builtins.currentSystem}.plugins)",
        ])
        .output();

    let output = match output {
        Ok(out) if out.status.success() => out,
        Ok(out) => {
            eprintln!("Nix error: {}", String::from_utf8_lossy(&out.stderr));
            return Vec::new();
        }
        Err(e) => {
            eprintln!("Failed to execute nix command: {}", e);
            return Vec::new();
        }
    };

    let stdout = String::from_utf8_lossy(&output.stdout);

    let plugins: Vec<&str> = stdout
        .trim()
        .trim_matches(|c| c == '[' || c == ']' || c == '\n' || c == ' ')
        .split(',')
        .map(|s| s.trim().trim_matches('"'))
        .filter(|s| !s.is_empty())
        .collect();

    let mut loaded_plugins: Vec<Plugin> = Vec::new();

    for plugin in plugins {
        let target = format!(".#plugins.{}", plugin);
        println!("Spawning plugin: nix run {}", target);

        match Command::new("nix")
            .args(["run", &target])
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .spawn()
        {
            Ok(mut child) => {
                let mut loaded_plugin = Plugin {
                    name: plugin.to_string(),
                    mode: "".to_string(),
                    plugin_attribution: "".to_string(),
                    plugin_license: "".to_string(),
                    data_attribution: "".to_string(),
                    data_license: "".to_string(),
                    stdin: child.stdin.take().expect(""),
                    stdout: BufReader::new(child.stdout.take().expect("")),
                };

                let mode_resp = loaded_plugin.send_request("mode", "[]");
                let attr_lice = loaded_plugin.send_request("attribution", "[]");
                if let Ok(r) = serde_json::from_str::<Value>(&attr_lice) {
                    loaded_plugin.plugin_attribution = r["response"]["plugin_owner"]
                        .as_str()
                        .unwrap_or("unknown")
                        .to_string();
                    loaded_plugin.plugin_license = r["response"]["plugin_license"]
                        .as_str()
                        .unwrap_or("unknown")
                        .to_string();
                    loaded_plugin.data_attribution = r["response"]["data_owner"]
                        .as_str()
                        .unwrap_or("unknown")
                        .to_string();
                    loaded_plugin.data_license = r["response"]["data_license"]
                        .as_str()
                        .unwrap_or("unknown")
                        .to_string();
                };

                if let Ok(r) = serde_json::from_str::<Value>(&mode_resp) {
                    loaded_plugin.mode = r["response"].as_str().unwrap_or("unknown").to_string();
                };

                loaded_plugins.push(loaded_plugin);
            }
            Err(e) => eprintln!("Failed to spawn plugin '{}': {}", plugin, e),
        }
    }

    loaded_plugins
}

async fn wait_for_overpass_ready() {
    println!("Waiting for Overpass API initialization to complete...");
    let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(3));

    loop {
        interval.tick().await;
        if let Ok(mut stream) = tokio::net::TcpStream::connect("127.0.0.1:12345").await {
            use tokio::io::{AsyncReadExt, AsyncWriteExt};
            let req = "GET /api/interpreter?data=%5Bout%3Ajson%5D%3Bnode(1)%3Bout%3B HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n";
            if stream.write_all(req.as_bytes()).await.is_ok() {
                let mut buf = [0u8; 1024];
                if let Ok(n) = stream.read(&mut buf).await {
                    let response = String::from_utf8_lossy(&buf[..n]);
                    if response.contains("200 OK") {
                        println!("Overpass API is operational!");
                        break;
                    }
                }
            }
        }
    }
}

async fn cleanup(docker: &Docker) {
    let _ = stop_overpass_container(docker).await;
}

#[tokio::main]
async fn main() -> std::result::Result<(), Box<dyn std::error::Error>> {
    let docker = Docker::connect_with_socket_defaults()?;
    let docker_signal = docker.clone();
    let runtime_handle = tokio::runtime::Handle::current();

    ctrlc::set_handler(move || {
        println!("Shutting down...");
        runtime_handle.block_on(cleanup(&docker_signal));
        std::process::exit(0);
    })?;

    let config = Config::from_env()?;
    start_overpass_container(&docker, &config).await?;
    wait_for_overpass_ready().await;

    let mut plugins = load_plugins();
    let stations = build_station_access_map(&mut plugins);
    let bind = config.bind.clone();
    let state = Arc::new(AppState {
        config,
        graph: &GRAPH,
        plugins: Mutex::new(plugins),
        stations,
    });
    let listener = tokio::net::TcpListener::bind(&bind).await?;

    println!("Server listening on http://{}", bind);

    axum::serve(listener, http::router(state)).await?;

    Ok(())
}
