// SPDX-License-Identifier: AGPL-3.0
// Copyright (C) 2026 Naoise McG
use bollard::Docker;
use config::Config;
use http::AppState;
pub use plugin::Plugin;
use plugin::PluginSpec;
use route::{Graph, StationAccessMap, Stations};
use std::collections::HashMap;
use std::env;
use std::future::IntoFuture;
use std::path::{Path, PathBuf};
use std::process::{Command, ExitCode};
use std::sync::Arc;
use std::time::Instant;

mod config;
mod http;
mod overpass;
mod plugin;
mod route;

#[cfg(test)]
mod repro;
#[cfg(test)]
mod testkit;
#[cfg(test)]
mod tests;

fn missing_files(assets: &Path, files: &[String]) -> Vec<String> {
    files
        .iter()
        .filter(|file| !assets.join(file).is_file())
        .cloned()
        .collect()
}

fn load_graph(assets: &Path, files: &[String]) -> std::result::Result<Graph, String> {
    let missing = missing_files(assets, files);
    if !missing.is_empty() {
        let (subject, pronoun) = if missing.len() == 1 {
            ("This map file is", "it")
        } else {
            ("These map files are", "them")
        };
        return Err(format!(
            "{} missing from {}: {}. Download {} (for example from https://download.geofabrik.de/) or fix OSM_PBF_FILES.",
            subject,
            assets.display(),
            missing.join(", "),
            pronoun
        ));
    }
    let paths: Vec<PathBuf> = files.iter().map(|file| assets.join(file)).collect();
    Graph::from_pbfs(&paths).map_err(|error| {
        format!(
            "Could not read the map files {}: {}",
            files.join(", "),
            error
        )
    })
}

fn build_station_access_map(plugins: &[Plugin]) -> Stations {
    let mut station_access = StationAccessMap::new();
    let mut served_by: HashMap<i64, Vec<usize>> = HashMap::new();

    for (index, plugin) in plugins.iter().enumerate() {
        let Some(map) = plugin.available().as_object() else {
            eprintln!(
                "Plugin {} answered available with something other than an object",
                plugin.name()
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
                plugin.name(),
                skipped.len(),
                first
            );
        }
    }

    Stations::with_plugins(station_access, served_by)
}

fn plugin_names() -> Vec<String> {
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

    match parse_plugin_names(&output.stdout) {
        Ok(names) => names,
        Err(error) => {
            eprintln!("Could not read the plugin list from nix eval: {}", error);
            Vec::new()
        }
    }
}

fn parse_plugin_names(output: &[u8]) -> std::result::Result<Vec<String>, String> {
    serde_json::from_slice::<Vec<String>>(output)
        .map_err(|error| format!("{} in {:?}", error, String::from_utf8_lossy(output).trim()))
}

async fn shutdown_signal() {
    let interrupt = tokio::signal::ctrl_c();
    #[cfg(unix)]
    let terminate = async {
        match tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate()) {
            Ok(mut signal) => {
                signal.recv().await;
            }
            Err(_) => std::future::pending::<()>().await,
        }
    };
    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();
    tokio::select! {
        _ = interrupt => {}
        _ = terminate => {}
    }
}

#[tokio::main]
async fn main() -> ExitCode {
    match serve().await {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("Error: {}", error);
            ExitCode::FAILURE
        }
    }
}

async fn serve() -> std::result::Result<(), Box<dyn std::error::Error>> {
    let config = Config::from_env()?;
    let assets = env::current_dir()?.join("assets");

    println!(
        "Loading the walking graph from {} in {}...",
        config.osm_pbf_files.join(", "),
        assets.display()
    );
    let started = Instant::now();
    let files = config.osm_pbf_files.clone();
    let graph = tokio::task::spawn_blocking(move || load_graph(&assets, &files)).await??;
    println!(
        "Walking graph ready in {:.1} s.",
        started.elapsed().as_secs_f64()
    );

    let docker = Docker::connect_with_socket_defaults()?;
    let docker_signal = docker.clone();
    tokio::spawn(async move {
        shutdown_signal().await;
        println!("Shutting down...");
        plugin::stop_all();
        overpass::cleanup(&docker_signal).await;
        std::process::exit(0);
    });

    let bind = config.bind.clone();
    let state = Arc::new(AppState::new(config, Arc::new(graph)));
    let listener = tokio::net::TcpListener::bind(&bind).await?;
    println!(
        "Server listening on http://{}, answering 503 until Overpass and the plugins are ready",
        bind
    );
    let server = tokio::spawn(axum::serve(listener, http::router(state.clone())).into_future());

    overpass::start_overpass_container(&docker, &state.config).await?;
    overpass::wait_for_overpass_ready(&docker, &state.config).await?;

    let specs = plugin_names()
        .iter()
        .map(|name| PluginSpec::nix(name))
        .collect();
    let timeouts = state.config.plugin_timeouts();
    let plugins = tokio::task::spawn_blocking(move || plugin::start_all(specs, timeouts)).await?;
    let stations = build_station_access_map(&plugins);
    state.set_ready(plugins, stations);
    println!("Ready.");

    server.await??;

    Ok(())
}
