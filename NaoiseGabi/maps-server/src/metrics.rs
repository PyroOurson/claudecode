// SPDX-License-Identifier: AGPL-3.0
// Copyright (C) 2026 Naoise McG
use std::collections::BTreeMap;
use std::fmt::Write;
use std::sync::Mutex;
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::Duration;

const BUCKETS: [f64; 12] = [
    0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0,
];

#[derive(Default)]
pub struct Metrics {
    requests: Mutex<BTreeMap<(&'static str, u16), u64>>,
    latency_buckets: [AtomicU64; BUCKETS.len()],
    latency_micros: AtomicU64,
    latency_count: AtomicU64,
    searches: AtomicU64,
    expanded_states: AtomicU64,
    search_plugin_calls: AtomicU64,
}

pub fn path_label(path: &str) -> &'static str {
    match path {
        "/" => "/",
        "/health" => "/health",
        "/metrics" => "/metrics",
        _ => "other",
    }
}

impl Metrics {
    pub fn record_request(&self, path: &'static str, status: u16, elapsed: Duration) {
        *self
            .requests
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .entry((path, status))
            .or_default() += 1;
        let seconds = elapsed.as_secs_f64();
        for (bucket, limit) in self.latency_buckets.iter().zip(BUCKETS) {
            if seconds <= limit {
                bucket.fetch_add(1, Ordering::Relaxed);
            }
        }
        self.latency_micros
            .fetch_add(elapsed.as_micros() as u64, Ordering::Relaxed);
        self.latency_count.fetch_add(1, Ordering::Relaxed);
    }

    pub fn record_search(&self, expanded: usize, plugin_calls: usize) {
        self.searches.fetch_add(1, Ordering::Relaxed);
        self.expanded_states
            .fetch_add(expanded as u64, Ordering::Relaxed);
        self.search_plugin_calls
            .fetch_add(plugin_calls as u64, Ordering::Relaxed);
    }

    pub fn render(&self, out: &mut String) {
        let _ = writeln!(
            out,
            "# HELP maps_http_requests_total HTTP requests answered, by path and status.\n# TYPE maps_http_requests_total counter"
        );
        for ((path, status), count) in self
            .requests
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .iter()
        {
            let _ = writeln!(
                out,
                "maps_http_requests_total{{path=\"{}\",status=\"{}\"}} {}",
                path, status, count
            );
        }
        let _ = writeln!(
            out,
            "# HELP maps_http_request_duration_seconds Time to answer HTTP requests.\n# TYPE maps_http_request_duration_seconds histogram"
        );
        for (bucket, limit) in self.latency_buckets.iter().zip(BUCKETS) {
            let _ = writeln!(
                out,
                "maps_http_request_duration_seconds_bucket{{le=\"{}\"}} {}",
                limit,
                bucket.load(Ordering::Relaxed)
            );
        }
        let count = self.latency_count.load(Ordering::Relaxed);
        let _ = writeln!(
            out,
            "maps_http_request_duration_seconds_bucket{{le=\"+Inf\"}} {}\nmaps_http_request_duration_seconds_sum {}\nmaps_http_request_duration_seconds_count {}",
            count,
            self.latency_micros.load(Ordering::Relaxed) as f64 / 1e6,
            count
        );
        for (name, help, value) in [
            ("maps_searches_total", "Route searches run.", &self.searches),
            (
                "maps_search_expanded_states_total",
                "Search states expanded by all route searches.",
                &self.expanded_states,
            ),
            (
                "maps_search_plugin_calls_total",
                "Plugin calls made by route searches, after the cache.",
                &self.search_plugin_calls,
            ),
        ] {
            let _ = writeln!(
                out,
                "# HELP {} {}\n# TYPE {} counter\n{} {}",
                name,
                help,
                name,
                name,
                value.load(Ordering::Relaxed)
            );
        }
    }
}

pub fn gauge(out: &mut String, name: &str, help: &str, value: f64) {
    let _ = writeln!(
        out,
        "# HELP {} {}\n# TYPE {} gauge\n{} {}",
        name, help, name, name, value
    );
}

pub fn escape(label: &str) -> String {
    label
        .replace('\\', "\\\\")
        .replace('"', "\\\"")
        .replace('\n', "\\n")
}
