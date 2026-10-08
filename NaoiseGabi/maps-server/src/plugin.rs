// SPDX-License-Identifier: AGPL-3.0
// Copyright (C) 2026 Naoise McG
use crate::route::{Line, OutgoingJourney, parse_journey_departure};
use serde_json::Value;

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

fn parse_journey(entry: &Value, mode: &str) -> Result<OutgoingJourney, &'static str> {
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
        mode: mode.to_string(),
        line: parse_line(entry.get("line")),
    })
}

pub fn parse_journeys(
    plugin_name: &str,
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
        match parse_journey(entry, mode) {
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
        let journeys = parse_journeys("test", "bus", 300, &response);
        let targets: Vec<i64> = journeys.iter().map(|j| j.target_station).collect();
        assert_eq!(targets, vec![400, 500]);
        assert_eq!(
            journeys[1].line.as_ref().and_then(|l| l.id.clone()),
            Some("7".to_string())
        );
        assert!(journeys.iter().all(|j| j.mode == "bus"));
    }
}
