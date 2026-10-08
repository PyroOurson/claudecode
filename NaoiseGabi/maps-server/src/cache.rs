// SPDX-License-Identifier: AGPL-3.0
// Copyright (C) 2026 Naoise McG
use crate::route::OutgoingJourney;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

pub const WINDOW_SECONDS: i64 = 300;
const SWEEP_ABOVE: usize = 10_000;
const MAX_ENTRIES: usize = 200_000;

type Key = (i64, usize, i64);
pub type Journeys = Arc<Vec<OutgoingJourney>>;

pub struct ExploreCache {
    ttl: Duration,
    entries: Mutex<HashMap<Key, (Instant, Journeys)>>,
    hits: AtomicU64,
    misses: AtomicU64,
}

impl ExploreCache {
    pub fn new(ttl: Duration) -> Self {
        ExploreCache {
            ttl,
            entries: Mutex::new(HashMap::new()),
            hits: AtomicU64::new(0),
            misses: AtomicU64::new(0),
        }
    }

    pub fn window_start(time: DateTime<Utc>) -> DateTime<Utc> {
        let start = time.timestamp().div_euclid(WINDOW_SECONDS) * WINDOW_SECONDS;
        DateTime::from_timestamp(start, 0).unwrap_or(time)
    }

    pub fn get(&self, station: i64, plugin: usize, window: DateTime<Utc>) -> Option<Journeys> {
        let entries = self.entries.lock().unwrap_or_else(|e| e.into_inner());
        let found = entries
            .get(&(station, plugin, window.timestamp()))
            .filter(|(stored, _)| stored.elapsed() < self.ttl)
            .map(|(_, journeys)| journeys.clone());
        let counter = if found.is_some() {
            &self.hits
        } else {
            &self.misses
        };
        counter.fetch_add(1, Ordering::Relaxed);
        found
    }

    pub fn insert(&self, station: i64, plugin: usize, window: DateTime<Utc>, journeys: Journeys) {
        if self.ttl.is_zero() {
            return;
        }
        let mut entries = self.entries.lock().unwrap_or_else(|e| e.into_inner());
        if entries.len() >= SWEEP_ABOVE {
            entries.retain(|_, (stored, _)| stored.elapsed() < self.ttl);
            if entries.len() >= MAX_ENTRIES {
                entries.clear();
            }
        }
        entries.insert(
            (station, plugin, window.timestamp()),
            (Instant::now(), journeys),
        );
    }

    pub fn hits(&self) -> u64 {
        self.hits.load(Ordering::Relaxed)
    }

    pub fn misses(&self) -> u64 {
        self.misses.load(Ordering::Relaxed)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn at(text: &str) -> DateTime<Utc> {
        DateTime::parse_from_rfc3339(text)
            .unwrap()
            .with_timezone(&Utc)
    }

    #[test]
    fn windows_start_on_five_minute_marks() {
        assert_eq!(
            ExploreCache::window_start(at("2026-08-08T12:04:59Z")),
            at("2026-08-08T12:00:00Z")
        );
        assert_eq!(
            ExploreCache::window_start(at("2026-08-08T12:05:00Z")),
            at("2026-08-08T12:05:00Z")
        );
    }

    #[test]
    fn entries_expire_after_the_ttl() {
        let cache = ExploreCache::new(Duration::from_millis(50));
        let window = at("2026-08-08T12:00:00Z");
        cache.insert(300, 0, window, Arc::new(Vec::new()));
        assert!(cache.get(300, 0, window).is_some());
        assert!(cache.get(300, 1, window).is_none());
        std::thread::sleep(Duration::from_millis(80));
        assert!(cache.get(300, 0, window).is_none());
        assert_eq!((cache.hits(), cache.misses()), (1, 2));
    }

    #[test]
    fn a_zero_ttl_turns_the_cache_off() {
        let cache = ExploreCache::new(Duration::ZERO);
        let window = at("2026-08-08T12:00:00Z");
        cache.insert(300, 0, window, Arc::new(Vec::new()));
        assert!(cache.get(300, 0, window).is_none());
    }
}
