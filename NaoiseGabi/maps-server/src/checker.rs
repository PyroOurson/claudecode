// SPDX-License-Identifier: AGPL-3.0
// Copyright (C) 2026 Naoise McG
use crate::plugin::{PluginSpec, Process, Timeouts};
use crate::route::parse_journey_departure;
use chrono::{DateTime, NaiveDateTime, Utc};
use serde_json::{Value, json};
use std::collections::HashSet;
use std::fmt;
use std::time::{Duration, Instant};

const SLOW: Duration = Duration::from_secs(5);
const STATIONS_TO_EXPLORE: usize = 3;
const DETAILS_PER_CALL: usize = 5;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Level {
    Ok,
    Warning,
    Problem,
}

#[derive(Debug)]
pub struct Finding {
    pub level: Level,
    pub message: String,
}

#[derive(Debug, Default)]
pub struct Report {
    pub findings: Vec<Finding>,
}

impl Report {
    fn add(&mut self, level: Level, message: impl Into<String>) {
        self.findings.push(Finding {
            level,
            message: message.into(),
        });
    }

    pub fn count(&self, level: Level) -> usize {
        self.findings.iter().filter(|f| f.level == level).count()
    }

    pub fn passed(&self) -> bool {
        self.count(Level::Problem) == 0
    }
}

impl fmt::Display for Report {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        for finding in &self.findings {
            let label = match finding.level {
                Level::Ok => "ok     ",
                Level::Warning => "warning",
                Level::Problem => "PROBLEM",
            };
            writeln!(f, "{}  {}", label, finding.message)?;
        }
        write!(
            f,
            "{} problem(s), {} warning(s).",
            self.count(Level::Problem),
            self.count(Level::Warning)
        )
    }
}

struct Details<'a> {
    report: &'a mut Report,
    context: String,
    shown: usize,
    hidden: usize,
}

impl Details<'_> {
    fn add(&mut self, level: Level, message: String) {
        if self.shown < DETAILS_PER_CALL {
            self.report
                .add(level, format!("{}: {}", self.context, message));
            self.shown += 1;
        } else {
            self.hidden += 1;
        }
    }

    fn finish(self) {
        if self.hidden > 0 {
            self.report.add(
                Level::Warning,
                format!(
                    "{}: {} more finding(s) not shown",
                    self.context, self.hidden
                ),
            );
        }
    }
}

fn is_hex_colour(text: &str) -> bool {
    let Some(digits) = text.strip_prefix('#') else {
        return false;
    };
    matches!(digits.len(), 3 | 6) && digits.chars().all(|c| c.is_ascii_hexdigit())
}

fn ask(
    process: &mut Process,
    report: &mut Report,
    action: &str,
    data: &Value,
    timeout: Duration,
) -> Option<Value> {
    let started = Instant::now();
    let reply = process.request(action, data, timeout);
    let elapsed = started.elapsed();
    match reply {
        Ok(value) => {
            if elapsed > SLOW {
                report.add(
                    Level::Warning,
                    format!(
                        "{} took {:.1} s; the server waits at most the plugin timeout",
                        action,
                        elapsed.as_secs_f64()
                    ),
                );
            }
            Some(value)
        }
        Err(error) => {
            report.add(Level::Problem, format!("{}: {}", action, error));
            None
        }
    }
}

fn check_id(value: &Value) -> Result<i64, Level> {
    match value {
        Value::Number(number) => number.as_i64().ok_or(Level::Problem),
        Value::String(text) if text.trim().parse::<i64>().is_ok() => Err(Level::Warning),
        _ => Err(Level::Problem),
    }
}

fn check_available(report: &mut Report, available: &Value) -> Vec<i64> {
    let Some(map) = available.as_object() else {
        report.add(
            Level::Problem,
            format!(
                "available must be an object of station IDs, got {}",
                available
            ),
        );
        return Vec::new();
    };
    let mut stations = Vec::new();
    let mut details = Details {
        report,
        context: "available".to_string(),
        shown: 0,
        hidden: 0,
    };
    for (key, entrances) in map {
        let Ok(station) = key.trim().parse::<i64>() else {
            details.add(
                Level::Problem,
                format!("station key {:?} is not an integer ID", key),
            );
            continue;
        };
        stations.push(station);
        let Some(entrances) = entrances.as_array() else {
            details.add(
                Level::Problem,
                format!(
                    "station {} must map to an array of entrance IDs, got {}",
                    station, entrances
                ),
            );
            continue;
        };
        for entrance in entrances {
            match check_id(entrance) {
                Ok(_) => {}
                Err(Level::Warning) => details.add(
                    Level::Warning,
                    format!(
                        "station {} entrance {} is a string; send integers",
                        station, entrance
                    ),
                ),
                Err(_) => details.add(
                    Level::Problem,
                    format!(
                        "station {} entrance {} is not an integer ID",
                        station, entrance
                    ),
                ),
            }
        }
    }
    details.finish();
    stations.sort_unstable();
    if stations.is_empty() {
        report.add(Level::Warning, "available lists no stations");
    } else {
        report.add(
            Level::Ok,
            format!("available: {} station(s)", stations.len()),
        );
    }
    stations
}

fn check_line(line: &Value, details: &mut Details, index: usize) {
    let Some(fields) = line.as_object() else {
        details.add(
            Level::Problem,
            format!("journey {}: line must be an object, got {}", index, line),
        );
        return;
    };
    match fields.get("id") {
        None | Some(Value::Null) | Some(Value::String(_)) | Some(Value::Number(_)) => {}
        Some(other) => details.add(
            Level::Problem,
            format!("journey {}: line id must be a string, got {}", index, other),
        ),
    }
    match fields.get("preferred_colour") {
        None | Some(Value::Null) => {}
        Some(Value::String(colour)) if is_hex_colour(colour) => {}
        Some(other) => details.add(
            Level::Problem,
            format!(
                "journey {}: preferred_colour must be a hex colour such as \"#FF0000\", got {}",
                index, other
            ),
        ),
    }
    if let Some(ways) = fields.get("ways")
        && !ways
            .as_array()
            .is_some_and(|ways| ways.iter().all(|way| way.is_i64()))
    {
        details.add(
            Level::Warning,
            format!(
                "journey {}: line ways should be an array of integer way IDs",
                index
            ),
        );
    }
}

fn check_journeys(
    report: &mut Report,
    station: i64,
    asked: DateTime<Utc>,
    reply: &Value,
    known: &HashSet<i64>,
) -> usize {
    let context = format!("explore {}", station);
    let Some(journeys) = reply.as_array() else {
        report.add(
            Level::Problem,
            format!("{}: the reply must be a list, got {}", context, reply),
        );
        return 0;
    };
    let mut details = Details {
        report,
        context: context.clone(),
        shown: 0,
        hidden: 0,
    };
    for (index, journey) in journeys.iter().enumerate() {
        if !journey.is_object() {
            details.add(
                Level::Problem,
                format!("journey {} is not an object", index),
            );
            continue;
        }
        match journey.get("to").map(check_id) {
            Some(Ok(to)) if known.contains(&to) => {}
            Some(Ok(to)) => details.add(
                Level::Problem,
                format!(
                    "journey {}: to {} is not a station listed by available",
                    index, to
                ),
            ),
            Some(Err(Level::Warning)) => details.add(
                Level::Warning,
                format!("journey {}: to is a string; send an integer", index),
            ),
            _ => details.add(
                Level::Problem,
                format!("journey {}: to is not an integer ID", index),
            ),
        }
        match journey.get("cost").and_then(Value::as_i64) {
            Some(cost) if cost >= 0 => {}
            Some(cost) => details.add(
                Level::Problem,
                format!("journey {}: cost {} is negative", index, cost),
            ),
            None => details.add(
                Level::Problem,
                format!(
                    "journey {}: cost must be an integer number of seconds",
                    index
                ),
            ),
        }
        let time = journey.get("time").and_then(Value::as_str);
        match time.map(|text| (text, NaiveDateTime::parse_from_str(text, "%Y%m%dT%H%M%S"))) {
            Some((_, Ok(departure))) if departure.and_utc() < asked => details.add(
                Level::Warning,
                format!(
                    "journey {}: leaves at {}, before the requested {}; the server drops it",
                    index,
                    departure,
                    asked.format("%Y%m%dT%H%M%S")
                ),
            ),
            Some((_, Ok(_))) => {}
            Some((text, Err(_))) if parse_journey_departure(text).is_ok() => details.add(
                Level::Warning,
                format!(
                    "journey {}: time {:?} should be YYYYmmddTHHMMSS",
                    index, text
                ),
            ),
            _ => details.add(
                Level::Problem,
                format!("journey {}: time must be YYYYmmddTHHMMSS in UTC", index),
            ),
        }
        if let Some(line) = journey.get("line").filter(|line| !line.is_null()) {
            check_line(line, &mut details, index);
        }
    }
    details.finish();
    journeys.len()
}

pub fn check(spec: &PluginSpec, timeouts: Timeouts, now: DateTime<Utc>) -> Report {
    let timeout = timeouts.startup;
    let mut report = Report::default();
    let mut process = match Process::spawn(spec) {
        Ok(process) => process,
        Err(error) => {
            report.add(Level::Problem, error);
            return report;
        }
    };

    if let Some(mode) = ask(&mut process, &mut report, "mode", &json!([]), timeout) {
        match mode.as_str() {
            Some(text) if !text.trim().is_empty() => {
                report.add(Level::Ok, format!("mode: {}", text))
            }
            _ => report.add(
                Level::Problem,
                format!("mode must be a non-empty string, got {}", mode),
            ),
        }
    }

    if let Some(attribution) = ask(
        &mut process,
        &mut report,
        "attribution",
        &json!([]),
        timeout,
    ) {
        let mut complete = true;
        for key in [
            "data_owner",
            "data_license",
            "plugin_owner",
            "plugin_license",
        ] {
            match attribution.get(key).and_then(Value::as_str) {
                Some(text) if !text.trim().is_empty() => {}
                _ => {
                    complete = false;
                    report.add(
                        Level::Problem,
                        format!("attribution needs a non-empty string {}", key),
                    );
                }
            }
        }
        if complete {
            report.add(Level::Ok, "attribution: all four fields present");
        }
    }

    let Some(available) = ask(&mut process, &mut report, "available", &json!([]), timeout) else {
        return report;
    };
    let stations = check_available(&mut report, &available);
    let known: HashSet<i64> = stations.iter().copied().collect();

    let datetime = now.format("%Y%m%dT%H%M%S").to_string();
    let mut departures = 0;
    for &station in stations.iter().take(STATIONS_TO_EXPLORE) {
        let data = json!({ "station": station, "datetime": datetime });
        let started = Instant::now();
        if let Some(reply) = ask(&mut process, &mut report, "explore", &data, timeouts.call) {
            let count = check_journeys(&mut report, station, now, &reply, &known);
            departures += count;
            report.add(
                Level::Ok,
                format!(
                    "explore {}: {} journey(s) in {} ms",
                    station,
                    count,
                    started.elapsed().as_millis()
                ),
            );
        }
    }
    if !stations.is_empty() && departures == 0 {
        report.add(
            Level::Warning,
            format!(
                "no departures from the first {} station(s) at {}",
                stations.len().min(STATIONS_TO_EXPLORE),
                datetime
            ),
        );
    }
    report
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hex_colours() {
        for good in ["#FF0000", "#0055a5", "#abc"] {
            assert!(is_hex_colour(good), "{}", good);
        }
        for bad in ["FF0000", "#FF00", "#GG0000", "red", ""] {
            assert!(!is_hex_colour(bad), "{}", bad);
        }
    }
}
