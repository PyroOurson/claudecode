// SPDX-License-Identifier: AGPL-3.0
// Copyright (C) 2026 Naoise McG
use crate::route::{Line, OutgoingJourney, parse_journey_departure};
use chrono::{DateTime, Utc};
use serde_json::{Value, json};
use std::fmt;
use std::io::{BufRead, BufReader, Write};
use std::process::{Child, ChildStdin, Command, Stdio};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::mpsc::{Receiver, RecvTimeoutError, channel};
use std::sync::{Arc, Mutex, Weak};
use std::thread;
use std::time::{Duration, Instant};

#[derive(Clone, Debug)]
pub struct PluginSpec {
    pub name: String,
    pub program: String,
    pub args: Vec<String>,
}

impl PluginSpec {
    pub fn nix(name: &str) -> Self {
        PluginSpec {
            name: name.to_string(),
            program: "nix".to_string(),
            args: vec!["run".to_string(), format!(".#plugins.{}", name)],
        }
    }
}

#[derive(Clone, Copy, Debug)]
pub struct Timeouts {
    pub call: Duration,
    pub startup: Duration,
}

#[derive(Debug, PartialEq)]
pub enum PluginError {
    Unavailable,
    Timeout,
    Exited,
    Malformed(String),
    Replied(String),
}

impl fmt::Display for PluginError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            PluginError::Unavailable => write!(f, "the plugin is restarting or stopped"),
            PluginError::Timeout => write!(f, "no answer within the timeout"),
            PluginError::Exited => write!(f, "the plugin process exited"),
            PluginError::Malformed(line) => write!(f, "malformed reply: {}", line),
            PluginError::Replied(error) => write!(f, "the plugin answered an error: {}", error),
        }
    }
}

struct Process {
    child: Child,
    stdin: ChildStdin,
    replies: Receiver<String>,
}

impl Process {
    fn spawn(spec: &PluginSpec) -> Result<Process, String> {
        let mut child = Command::new(&spec.program)
            .args(&spec.args)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|error| format!("could not start {}: {}", spec.program, error))?;
        let stdin = child.stdin.take().ok_or("no stdin")?;
        let stdout = child.stdout.take().ok_or("no stdout")?;
        let (sender, replies) = channel();
        thread::spawn(move || {
            for line in BufReader::new(stdout).lines() {
                let Ok(line) = line else { break };
                if !line.trim().is_empty() && sender.send(line).is_err() {
                    break;
                }
            }
        });
        if let Some(stderr) = child.stderr.take() {
            let name = spec.name.clone();
            thread::spawn(move || {
                for line in BufReader::new(stderr).lines().map_while(Result::ok) {
                    eprintln!("[plugin {}] {}", name, line);
                }
            });
        }
        Ok(Process {
            child,
            stdin,
            replies,
        })
    }

    fn request(
        &mut self,
        action: &str,
        data: &Value,
        timeout: Duration,
    ) -> Result<Value, PluginError> {
        let mut line = json!({ "action": action, "data": data }).to_string();
        line.push('\n');
        self.stdin
            .write_all(line.as_bytes())
            .and_then(|_| self.stdin.flush())
            .map_err(|_| PluginError::Exited)?;
        let reply = match self.replies.recv_timeout(timeout) {
            Ok(reply) => reply,
            Err(RecvTimeoutError::Timeout) => return Err(PluginError::Timeout),
            Err(RecvTimeoutError::Disconnected) => return Err(PluginError::Exited),
        };
        let reply: Value =
            serde_json::from_str(&reply).map_err(|_| PluginError::Malformed(reply.clone()))?;
        match (reply.get("response"), reply.get("error")) {
            (Some(response), _) if !response.is_null() => Ok(response.clone()),
            (_, Some(error)) => Err(PluginError::Replied(
                error
                    .as_str()
                    .map_or_else(|| error.to_string(), str::to_string),
            )),
            _ => Err(PluginError::Malformed(reply.to_string())),
        }
    }

    fn is_running(&mut self) -> bool {
        matches!(self.child.try_wait(), Ok(None))
    }
}

impl Drop for Process {
    fn drop(&mut self) {
        let _ = self.child.kill();
        let _ = self.child.wait();
    }
}

struct Handshake {
    mode: String,
    attribution: Value,
    available: Value,
}

fn handshake(process: &mut Process, timeout: Duration) -> Result<Handshake, PluginError> {
    let mode = process.request("mode", &json!([]), timeout)?;
    let attribution = process.request("attribution", &json!([]), timeout)?;
    let available = process.request("available", &json!([]), timeout)?;
    Ok(Handshake {
        mode: mode.as_str().unwrap_or("unknown").to_string(),
        attribution,
        available,
    })
}

enum Slot {
    Running(Process),
    Restarting,
    Stopped,
}

struct Shared {
    spec: PluginSpec,
    timeouts: Timeouts,
    mode: String,
    data_owner: String,
    data_license: String,
    plugin_owner: String,
    plugin_license: String,
    available: Value,
    slot: Mutex<Slot>,
    calls: AtomicU64,
    errors: AtomicU64,
    busy_micros: AtomicU64,
}

pub struct PluginStats {
    pub calls: u64,
    pub errors: u64,
    pub average_ms: f64,
}

#[derive(Clone)]
pub struct Plugin {
    shared: Arc<Shared>,
}

static STARTED: Mutex<Vec<Weak<Shared>>> = Mutex::new(Vec::new());

impl Plugin {
    pub fn start(spec: PluginSpec, timeouts: Timeouts) -> Result<Plugin, String> {
        let mut process = Process::spawn(&spec)?;
        let handshake = handshake(&mut process, timeouts.startup)
            .map_err(|error| format!("plugin {} failed its handshake: {}", spec.name, error))?;
        let text = |key: &str| {
            handshake.attribution[key]
                .as_str()
                .unwrap_or("unknown")
                .to_string()
        };
        let shared = Arc::new(Shared {
            mode: handshake.mode.clone(),
            data_owner: text("data_owner"),
            data_license: text("data_license"),
            plugin_owner: text("plugin_owner"),
            plugin_license: text("plugin_license"),
            available: handshake.available,
            spec,
            timeouts,
            slot: Mutex::new(Slot::Running(process)),
            calls: AtomicU64::new(0),
            errors: AtomicU64::new(0),
            busy_micros: AtomicU64::new(0),
        });
        if let Ok(mut started) = STARTED.lock() {
            started.retain(|plugin| plugin.strong_count() > 0);
            started.push(Arc::downgrade(&shared));
        }
        Ok(Plugin { shared })
    }

    pub fn name(&self) -> &str {
        &self.shared.spec.name
    }

    pub fn mode(&self) -> &str {
        &self.shared.mode
    }

    pub fn data_owner(&self) -> &str {
        &self.shared.data_owner
    }

    pub fn data_license(&self) -> &str {
        &self.shared.data_license
    }

    pub fn plugin_owner(&self) -> &str {
        &self.shared.plugin_owner
    }

    pub fn plugin_license(&self) -> &str {
        &self.shared.plugin_license
    }

    pub fn available(&self) -> &Value {
        &self.shared.available
    }

    pub fn stats(&self) -> PluginStats {
        let calls = self.shared.calls.load(Ordering::Relaxed);
        let busy = self.shared.busy_micros.load(Ordering::Relaxed);
        PluginStats {
            calls,
            errors: self.shared.errors.load(Ordering::Relaxed),
            average_ms: if calls == 0 {
                0.0
            } else {
                busy as f64 / calls as f64 / 1000.0
            },
        }
    }

    #[cfg(test)]
    pub fn process_id(&self) -> Option<u32> {
        match &*self.shared.slot.lock().unwrap_or_else(|e| e.into_inner()) {
            Slot::Running(process) => Some(process.child.id()),
            _ => None,
        }
    }

    pub fn is_alive(&self) -> bool {
        match self.shared.slot.try_lock() {
            Ok(mut slot) => match &mut *slot {
                Slot::Running(process) => process.is_running(),
                _ => false,
            },
            Err(_) => true,
        }
    }

    pub fn call(&self, action: &str, data: &Value) -> Result<Value, PluginError> {
        let mut slot = self.shared.slot.lock().unwrap_or_else(|e| e.into_inner());
        let Slot::Running(process) = &mut *slot else {
            return Err(PluginError::Unavailable);
        };
        let started = Instant::now();
        let result = process.request(action, data, self.shared.timeouts.call);
        self.shared.calls.fetch_add(1, Ordering::Relaxed);
        self.shared
            .busy_micros
            .fetch_add(started.elapsed().as_micros() as u64, Ordering::Relaxed);
        if result.is_err() {
            self.shared.errors.fetch_add(1, Ordering::Relaxed);
        }
        if matches!(
            result,
            Err(PluginError::Timeout | PluginError::Exited | PluginError::Malformed(_))
        ) {
            eprintln!(
                "Plugin {} failed ({}), restarting it",
                self.name(),
                result
                    .as_ref()
                    .err()
                    .map(ToString::to_string)
                    .unwrap_or_default()
            );
            *slot = Slot::Restarting;
            drop(slot);
            self.restart_in_background();
        }
        result
    }

    pub fn explore(&self, station: i64, datetime: DateTime<Utc>) -> Result<Value, PluginError> {
        self.call(
            "explore",
            &json!({ "station": station, "datetime": datetime.format("%Y%m%dT%H%M%S").to_string() }),
        )
    }

    fn restart_in_background(&self) {
        let shared = Arc::downgrade(&self.shared);
        thread::spawn(move || {
            let mut delay = Duration::from_secs(1);
            loop {
                let Some(plugin) = shared.upgrade() else {
                    return;
                };
                let attempt = Process::spawn(&plugin.spec).and_then(|mut process| {
                    handshake(&mut process, plugin.timeouts.startup)
                        .map(|_| process)
                        .map_err(|error| error.to_string())
                });
                match attempt {
                    Ok(process) => {
                        let mut slot = plugin.slot.lock().unwrap_or_else(|e| e.into_inner());
                        if matches!(*slot, Slot::Restarting) {
                            *slot = Slot::Running(process);
                            eprintln!("Plugin {} restarted", plugin.spec.name);
                        }
                        return;
                    }
                    Err(error) => {
                        eprintln!(
                            "Plugin {} could not restart ({}), trying again in {} s",
                            plugin.spec.name,
                            error,
                            delay.as_secs()
                        );
                    }
                }
                if matches!(
                    *plugin.slot.lock().unwrap_or_else(|e| e.into_inner()),
                    Slot::Stopped
                ) {
                    return;
                }
                drop(plugin);
                thread::sleep(delay);
                delay = (delay * 2).min(Duration::from_secs(300));
            }
        });
    }

    pub fn stop(&self) {
        let mut slot = self.shared.slot.lock().unwrap_or_else(|e| e.into_inner());
        *slot = Slot::Stopped;
    }
}

pub fn stop_all() {
    let started = STARTED
        .lock()
        .map(|started| started.clone())
        .unwrap_or_default();
    for shared in started.iter().filter_map(Weak::upgrade) {
        Plugin { shared }.stop();
    }
}

pub fn start_all(specs: Vec<PluginSpec>, timeouts: Timeouts) -> Vec<Plugin> {
    let handles: Vec<_> = specs
        .into_iter()
        .map(|spec| {
            println!(
                "Starting plugin {}: {} {}",
                spec.name,
                spec.program,
                spec.args.join(" ")
            );
            thread::spawn(move || Plugin::start(spec, timeouts))
        })
        .collect();
    handles
        .into_iter()
        .filter_map(|handle| match handle.join() {
            Ok(Ok(plugin)) => Some(plugin),
            Ok(Err(error)) => {
                eprintln!("{}", error);
                None
            }
            Err(_) => None,
        })
        .collect()
}

pub fn parse_id(value: &Value) -> Option<i64> {
    match value {
        Value::Number(number) => number.as_i64(),
        Value::String(text) => text.trim().parse().ok(),
        _ => None,
    }
}

fn parse_line(value: Option<&Value>) -> Option<Line> {
    let line = value?;
    let id = match line.get("id") {
        Some(Value::String(text)) => Some(text.clone()),
        Some(Value::Number(number)) => Some(number.to_string()),
        _ => None,
    };
    let preferred_colour = line
        .get("preferred_colour")
        .and_then(Value::as_str)
        .map(str::to_string);
    if id.is_some() || preferred_colour.is_some() {
        Some(Line {
            id,
            preferred_colour,
        })
    } else {
        None
    }
}

fn parse_journey(
    entry: &Value,
    plugin: usize,
    mode: &str,
) -> Result<OutgoingJourney, &'static str> {
    let target_station = entry
        .get("to")
        .and_then(parse_id)
        .ok_or("\"to\" is not an integer ID")?;
    let cost = entry
        .get("cost")
        .and_then(Value::as_i64)
        .ok_or("\"cost\" is not an integer")?;
    let cost_seconds = u64::try_from(cost).map_err(|_| "\"cost\" is negative")?;
    let departure = entry
        .get("time")
        .and_then(Value::as_str)
        .and_then(|time| parse_journey_departure(time).ok())
        .ok_or("\"time\" is not YYYYmmddTHHMMSS")?;
    Ok(OutgoingJourney {
        target_station,
        departure,
        cost_seconds,
        plugin,
        mode: mode.to_string(),
        line: parse_line(entry.get("line")),
    })
}

pub fn parse_journeys(
    plugin_name: &str,
    plugin_index: usize,
    mode: &str,
    station: i64,
    response: &Value,
) -> Vec<OutgoingJourney> {
    let Some(entries) = response.as_array() else {
        eprintln!(
            "Plugin {} answered explore for station {} with something other than a list: {}",
            plugin_name, station, response
        );
        return Vec::new();
    };
    let mut journeys = Vec::with_capacity(entries.len());
    let mut skipped = 0;
    let mut first_problem = None;
    for entry in entries {
        match parse_journey(entry, plugin_index, mode) {
            Ok(journey) => journeys.push(journey),
            Err(reason) => {
                skipped += 1;
                first_problem.get_or_insert((reason, entry));
            }
        }
    }
    if let Some((reason, entry)) = first_problem {
        eprintln!(
            "Plugin {} sent {} invalid journeys from station {}, skipped; the first one: {} ({})",
            plugin_name, skipped, station, entry, reason
        );
    }
    journeys
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn ids_are_read_from_integers_and_numeric_strings() {
        assert_eq!(parse_id(&json!(400)), Some(400));
        assert_eq!(parse_id(&json!("400")), Some(400));
        assert_eq!(parse_id(&json!(" 12486470822 ")), Some(12486470822));
        assert_eq!(parse_id(&json!("node/400")), None);
        assert_eq!(parse_id(&json!(4.5)), None);
        assert_eq!(parse_id(&json!(null)), None);
    }

    #[test]
    fn invalid_journeys_are_skipped_and_valid_ones_kept() {
        let response = json!([
            {"to": 400, "cost": 600, "time": "20260808T120200"},
            {"to": "500", "cost": 60, "time": "2026-08-08T12:05:00", "line": {"id": 7}},
            {"to": 400, "cost": -500, "time": "20260808T120200"},
            {"to": 400, "cost": 1.5, "time": "20260808T120200"},
            {"to": 400, "cost": "600", "time": "20260808T120200"},
            {"to": 400, "cost": 600, "time": "tomorrow"},
            {"to": null, "cost": 600, "time": "20260808T120200"},
            "nonsense"
        ]);
        let journeys = parse_journeys("test", 2, "bus", 300, &response);
        let targets: Vec<i64> = journeys.iter().map(|j| j.target_station).collect();
        assert_eq!(targets, vec![400, 500]);
        assert_eq!(
            journeys[1].line.as_ref().and_then(|l| l.id.clone()),
            Some("7".to_string())
        );
        assert!(journeys.iter().all(|j| j.plugin == 2 && j.mode == "bus"));
    }
}
