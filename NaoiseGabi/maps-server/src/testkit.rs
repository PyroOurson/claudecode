// SPDX-License-Identifier: AGPL-3.0
// Copyright (C) 2026 Naoise McG
use crate::config::Config;
use crate::http::{AppState, router};
use crate::route::Graph;
use crate::{Plugin, build_station_access_map};
use serde_json::Value;
use std::io::{BufReader, Read, Write};
use std::net::{SocketAddr, TcpListener, TcpStream};
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::sync::{Arc, LazyLock, Mutex};
use std::thread;

pub fn kit() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("tests")
}

pub fn plugin(name: &str, scenario: Value) -> Plugin {
    let python = std::env::var("REPRO_PYTHON").unwrap_or_else(|_| "python3".to_string());
    let mut child = Command::new(python)
        .arg("-I")
        .arg(kit().join("fake_plugin.py"))
        .arg(scenario.to_string())
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .expect("could not start fake_plugin.py");
    let plugin = Plugin {
        name: name.to_string(),
        mode: scenario["mode"].as_str().unwrap_or("train").to_string(),
        data_attribution: "Fake data".to_string(),
        data_license: "CC0".to_string(),
        plugin_attribution: "maps-server-review".to_string(),
        plugin_license: "CC0".to_string(),
        stdin: child.stdin.take().unwrap(),
        stdout: BufReader::new(child.stdout.take().unwrap()),
    };
    thread::spawn(move || child.wait());
    plugin
}

pub fn post(body: &str) -> Vec<u8> {
    request("POST", "/", body)
}

pub struct Reply {
    pub status: u16,
    pub json: Value,
    pub raw: String,
}

pub static FIXTURE: LazyLock<Graph> =
    LazyLock::new(|| Graph::from_pbfs(&[kit().join("fixtures").join("fixture.osm.pbf")]).unwrap());

pub fn state(plugins: Vec<Plugin>) -> Arc<AppState> {
    state_with(plugins, Config::default())
}

pub fn state_with(mut plugins: Vec<Plugin>, config: Config) -> Arc<AppState> {
    let stations = build_station_access_map(&mut plugins);
    Arc::new(AppState {
        config,
        graph: &FIXTURE,
        plugins: Mutex::new(plugins),
        stations,
    })
}

pub fn serve_state(state: Arc<AppState>) -> SocketAddr {
    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    listener.set_nonblocking(true).unwrap();
    let address = listener.local_addr().unwrap();
    thread::spawn(move || {
        let runtime = tokio::runtime::Builder::new_multi_thread()
            .worker_threads(2)
            .enable_all()
            .build()
            .unwrap();
        runtime.block_on(async move {
            let listener = tokio::net::TcpListener::from_std(listener).unwrap();
            axum::serve(listener, router(state)).await.unwrap();
        });
    });
    address
}

pub fn serve(plugins: Vec<Plugin>) -> SocketAddr {
    serve_state(state(plugins))
}

pub fn request(method: &str, path: &str, body: &str) -> Vec<u8> {
    format!(
        "{} {} HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\nContent-Type: application/json\r\nContent-Length: {}\r\n\r\n{}",
        method,
        path,
        body.len(),
        body
    )
    .into_bytes()
}

pub fn exchange(address: SocketAddr, chunks: Vec<Vec<u8>>) -> Reply {
    let mut client = TcpStream::connect(address).unwrap();
    client.set_nodelay(true).unwrap();
    client
        .set_read_timeout(Some(std::time::Duration::from_secs(30)))
        .unwrap();
    for (index, chunk) in chunks.iter().enumerate() {
        if index > 0 {
            thread::sleep(std::time::Duration::from_millis(300));
        }
        let _ = client.write_all(chunk);
    }
    let mut bytes = Vec::new();
    let _ = client.read_to_end(&mut bytes);
    let raw = String::from_utf8_lossy(&bytes).to_string();
    let status = raw
        .split(' ')
        .nth(1)
        .and_then(|code| code.parse().ok())
        .unwrap_or(0);
    let json = raw
        .split_once("\r\n\r\n")
        .and_then(|(_, body)| serde_json::from_str(body).ok())
        .unwrap_or(Value::Null);
    Reply { status, json, raw }
}

pub fn send(plugins: Vec<Plugin>, chunks: Vec<Vec<u8>>) -> Reply {
    exchange(serve(plugins), chunks)
}

impl Reply {
    pub fn header(&self, name: &str) -> Option<&str> {
        let head = self.raw.split("\r\n\r\n").next()?;
        head.lines().skip(1).find_map(|line| {
            let (key, value) = line.split_once(':')?;
            key.trim().eq_ignore_ascii_case(name).then(|| value.trim())
        })
    }
}

pub fn has_route(reply: &Reply) -> bool {
    reply.status == 200
        && reply.json["route"]
            .as_array()
            .is_some_and(|route| !route.is_empty())
}

pub struct CallLog {
    path: PathBuf,
}

impl CallLog {
    pub fn new(name: &str) -> Self {
        static COUNTER: std::sync::atomic::AtomicUsize = std::sync::atomic::AtomicUsize::new(0);
        let unique = COUNTER.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        let path = std::env::temp_dir().join(format!(
            "maps-server-{}-{}-{}.log",
            std::process::id(),
            name,
            unique
        ));
        let _ = std::fs::remove_file(&path);
        CallLog { path }
    }

    pub fn path(&self) -> String {
        self.path.to_string_lossy().to_string()
    }

    pub fn explored_stations(&self) -> Vec<i64> {
        std::fs::read_to_string(&self.path)
            .unwrap_or_default()
            .lines()
            .filter_map(|line| serde_json::from_str::<Value>(line).ok())
            .filter(|request| request["action"] == "explore")
            .filter_map(|request| request["data"]["station"].as_i64())
            .collect()
    }
}

impl Drop for CallLog {
    fn drop(&mut self) {
        let _ = std::fs::remove_file(&self.path);
    }
}
