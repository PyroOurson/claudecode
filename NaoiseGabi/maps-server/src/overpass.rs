// SPDX-License-Identifier: AGPL-3.0
// Copyright (C) 2026 Naoise McG
use crate::config::Config;
use bollard::Docker;
use bollard::models::{ContainerCreateBody, HostConfig, PortBinding};
use bollard::query_parameters::{
    CreateContainerOptionsBuilder, LogsOptionsBuilder, RemoveVolumeOptions, StartContainerOptions,
    StopContainerOptions,
};
use futures_util::StreamExt;
use std::collections::HashMap;
use std::collections::hash_map::DefaultHasher;
use std::env;
use std::fs;
use std::future::Future;
use std::hash::{Hash, Hasher};
use std::path::Path;
use std::time::{Duration, Instant};
use tokio::io::{AsyncReadExt, AsyncWriteExt};

pub const CONTAINER: &str = "overpass_api";
pub const ADDRESS: &str = "127.0.0.1:12345";

fn calculate_pbf_hash(assets_path: &Path, files: &[String]) -> String {
    let mut hasher = DefaultHasher::new();
    for file_name in files {
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

const OVERPASS_HOST_IP: &str = "127.0.0.1";

pub async fn start_overpass_container(
    docker: &Docker,
    config: &Config,
) -> std::result::Result<(), Box<dyn std::error::Error>> {
    let container_name = CONTAINER;
    let current_dir = env::current_dir()?;
    let assets_dir = current_dir.join("assets");
    let current_hash = calculate_pbf_hash(&assets_dir, &config.osm_pbf_files);

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

    let input_paths = config
        .osm_pbf_files
        .iter()
        .map(|f| format!("/assets/{}", f))
        .collect::<Vec<_>>()
        .join(" ");

    let planet_url = format!(
        "OVERPASS_PLANET_URL=file:///assets/{}",
        config.osm_pbf_files[0]
    );
    let planet_preprocess = format!(
        "OVERPASS_PLANET_PREPROCESS=rm -f /db/planet.osm.bz2 && osmium merge {} -o /db/planet.osm.bz2 && chmod -R 777 /db",
        input_paths
    );

    let mut labels = HashMap::new();
    labels.insert("pbf_hash".to_string(), current_hash);

    let container = ContainerCreateBody {
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

    docker.create_container(Some(options), container).await?;
    docker
        .start_container(container_name, None::<StartContainerOptions>)
        .await?;

    Ok(())
}

async fn stop_overpass_container(
    docker: &Docker,
) -> std::result::Result<(), Box<dyn std::error::Error>> {
    docker
        .stop_container(CONTAINER, None::<StopContainerOptions>)
        .await?;
    Ok(())
}

#[derive(Debug, PartialEq)]
pub enum ContainerState {
    Running,
    Exited(String),
}

pub async fn answers(address: &str) -> bool {
    let probe = async {
        let mut stream = tokio::net::TcpStream::connect(address).await.ok()?;
        let request = "GET /api/interpreter?data=%5Bout%3Ajson%5D%3Bnode(1)%3Bout%3B HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n";
        stream.write_all(request.as_bytes()).await.ok()?;
        let mut buffer = [0u8; 1024];
        let read = stream.read(&mut buffer).await.ok()?;
        let head = String::from_utf8_lossy(&buffer[..read]);
        Some(head.starts_with("HTTP/1.1 200") || head.starts_with("HTTP/1.0 200"))
    };
    matches!(
        tokio::time::timeout(Duration::from_secs(10), probe).await,
        Ok(Some(true))
    )
}

pub async fn wait_until_ready<P, PF, S, SF>(
    probe: P,
    state: S,
    timeout: Duration,
    interval: Duration,
    progress_every: Duration,
) -> Result<Duration, String>
where
    P: Fn() -> PF,
    PF: Future<Output = bool>,
    S: Fn() -> SF,
    SF: Future<Output = ContainerState>,
{
    let started = Instant::now();
    let mut next_progress = progress_every;
    loop {
        if probe().await {
            return Ok(started.elapsed());
        }
        if let ContainerState::Exited(logs) = state().await {
            let logs = if logs.trim().is_empty() {
                "(it wrote no logs)".to_string()
            } else {
                logs
            };
            return Err(format!(
                "The Overpass container stopped before it was ready. Its last log lines:\n{}",
                logs.trim_end()
            ));
        }
        let elapsed = started.elapsed();
        if elapsed >= timeout {
            return Err(format!(
                "Overpass was not ready after {} s (MAPS_OVERPASS_READY_TIMEOUT_S). Check `docker logs {}`.",
                timeout.as_secs(),
                CONTAINER
            ));
        }
        if elapsed >= next_progress {
            println!(
                "Still waiting for Overpass after {} min; the first import of a large region can take hours.",
                elapsed.as_secs() / 60
            );
            next_progress += progress_every;
        }
        tokio::time::sleep(interval).await;
    }
}

async fn last_logs(docker: &Docker, lines: usize) -> String {
    let options = LogsOptionsBuilder::default()
        .stdout(true)
        .stderr(true)
        .tail(&lines.to_string())
        .build();
    let chunks: Vec<String> = docker
        .logs(CONTAINER, Some(options))
        .filter_map(|chunk| async move { chunk.ok().map(|chunk| chunk.to_string()) })
        .collect()
        .await;
    chunks.concat()
}

async fn container_state(docker: &Docker) -> ContainerState {
    let running = docker
        .inspect_container(CONTAINER, None)
        .await
        .ok()
        .and_then(|inspect| inspect.state)
        .and_then(|state| state.running)
        .unwrap_or(false);
    if running {
        ContainerState::Running
    } else {
        ContainerState::Exited(last_logs(docker, 20).await)
    }
}

pub async fn wait_for_overpass_ready(docker: &Docker, config: &Config) -> Result<(), String> {
    println!("Waiting for Overpass API initialization to complete...");
    let elapsed = wait_until_ready(
        || answers(ADDRESS),
        || container_state(docker),
        Duration::from_secs(config.overpass_ready_timeout_s),
        Duration::from_secs(3),
        Duration::from_secs(60),
    )
    .await?;
    println!("Overpass API is operational after {} s.", elapsed.as_secs());
    Ok(())
}

pub async fn cleanup(docker: &Docker) {
    let _ = stop_overpass_container(docker).await;
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicUsize, Ordering};

    fn fast(timeout_ms: u64) -> (Duration, Duration, Duration) {
        (
            Duration::from_millis(timeout_ms),
            Duration::from_millis(10),
            Duration::from_millis(50),
        )
    }

    #[tokio::test]
    async fn ready_once_the_probe_answers() {
        let attempts = AtomicUsize::new(0);
        let (timeout, interval, progress) = fast(5000);
        let result = wait_until_ready(
            || async { attempts.fetch_add(1, Ordering::SeqCst) >= 3 },
            || async { ContainerState::Running },
            timeout,
            interval,
            progress,
        )
        .await;
        assert!(result.is_ok(), "{:?}", result);
        assert_eq!(attempts.load(Ordering::SeqCst), 4);
    }

    #[tokio::test]
    async fn an_exited_container_stops_the_wait_with_its_logs() {
        let (timeout, interval, progress) = fast(5000);
        let started = Instant::now();
        let result = wait_until_ready(
            || async { false },
            || async { ContainerState::Exited("osmium: file not found\n".to_string()) },
            timeout,
            interval,
            progress,
        )
        .await;
        let error = result.err().unwrap_or_default();
        assert!(error.contains("osmium: file not found"), "{}", error);
        assert!(started.elapsed() < Duration::from_secs(1));
    }

    #[tokio::test]
    async fn the_wait_gives_up_after_the_timeout() {
        let (timeout, interval, progress) = fast(200);
        let result = wait_until_ready(
            || async { false },
            || async { ContainerState::Running },
            timeout,
            interval,
            progress,
        )
        .await;
        let error = result.err().unwrap_or_default();
        assert!(error.contains("MAPS_OVERPASS_READY_TIMEOUT_S"), "{}", error);
    }

    async fn fake_overpass(status: &'static str) -> String {
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let address = listener.local_addr().unwrap().to_string();
        tokio::spawn(async move {
            while let Ok((mut stream, _)) = listener.accept().await {
                let mut buffer = [0u8; 1024];
                let _ = stream.read(&mut buffer).await;
                let reply = format!("HTTP/1.1 {}\r\nContent-Length: 0\r\n\r\n", status);
                let _ = stream.write_all(reply.as_bytes()).await;
            }
        });
        address
    }

    #[tokio::test]
    async fn the_probe_needs_a_200() {
        assert!(answers(&fake_overpass("200 OK").await).await);
        assert!(!answers(&fake_overpass("504 Gateway Timeout").await).await);
        let closed = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let address = closed.local_addr().unwrap().to_string();
        drop(closed);
        assert!(!answers(&address).await);
    }
}
