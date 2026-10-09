use crate::graph::{Graph, haversine_km};
use crate::route::{Line, OutgoingJourney, StationAccessMap, Stations};
use chrono::{DateTime, Datelike, Duration, NaiveDate, Utc};
use osmpbf::{BlobDecode, BlobReader, Element, RelMemberType};
use serde::Serialize;
use std::collections::{HashMap, HashSet};

pub const PLUGIN: usize = 0;
pub const PLUGIN_NAME: &str = "sample-buses";
pub const MODE: &str = "bus";
pub const SPEED_KMH: f64 = 18.0;
pub const DETOUR: f64 = 1.3;
pub const DWELL_S: f64 = 20.0;
pub const HEADWAY_MIN: i64 = 10;
pub const FIRST_MIN: i64 = 6 * 60;
pub const LAST_MIN: i64 = 22 * 60;
pub const MAX_ENTRANCE_M: f64 = 150.0;
const PALETTE: [&str; 8] = [
    "#D1433A", "#2B62C4", "#2E8B4F", "#C98A00", "#8E44AD", "#00838F", "#D35400", "#6D4C41",
];

#[derive(Clone, Debug, Serialize)]
pub struct Stop {
    pub id: i64,
    pub name: String,
    pub lat: f64,
    pub lon: f64,
}

#[derive(Clone, Debug, Serialize)]
pub struct Pattern {
    pub line: String,
    pub name: String,
    pub colour: String,
    pub stops: Vec<i64>,
    pub offsets_s: Vec<i64>,
}

struct RawRoute {
    line: String,
    name: String,
    colour: Option<String>,
    stops: Vec<i64>,
}

pub struct Network {
    pub stops: HashMap<i64, Stop>,
    pub patterns: Vec<Pattern>,
    calls_at: HashMap<i64, Vec<(usize, usize)>>,
}

fn is_hex_colour(value: &str) -> bool {
    value.len() == 7 && value.starts_with('#') && value[1..].chars().all(|c| c.is_ascii_hexdigit())
}

fn stop_members(members: &[(String, i64)]) -> Vec<i64> {
    let classes: [fn(&str) -> bool; 3] = [
        |role| role.starts_with("stop"),
        |role| role.is_empty(),
        |role| role.starts_with("platform"),
    ];
    classes
        .iter()
        .map(|class| {
            members
                .iter()
                .filter(|(role, _)| class(role))
                .map(|&(_, id)| id)
                .collect::<Vec<_>>()
        })
        .find(|stops| stops.len() >= 2)
        .unwrap_or_default()
}

fn read_routes(bytes: &[u8]) -> Result<Vec<RawRoute>, osmpbf::Error> {
    let mut routes = Vec::new();
    for blob in BlobReader::new(bytes) {
        if let BlobDecode::OsmData(block) = blob?.decode()? {
            for element in block.elements() {
                let Element::Relation(relation) = element else {
                    continue;
                };
                let tags: HashMap<&str, &str> = relation.tags().collect();
                if tags.get("type") != Some(&"route") || tags.get("route") != Some(&MODE) {
                    continue;
                }
                let members: Vec<(String, i64)> = relation
                    .members()
                    .filter(|member| member.member_type == RelMemberType::Node)
                    .map(|member| (member.role().unwrap_or("").to_string(), member.member_id))
                    .collect();
                let name = tags.get("name").map(|name| name.to_string());
                let line = tags
                    .get("ref")
                    .map(|line| line.to_string())
                    .or_else(|| name.clone())
                    .unwrap_or_else(|| relation.id().to_string());
                routes.push(RawRoute {
                    name: name.unwrap_or_else(|| format!("{} {}", MODE, line)),
                    line,
                    colour: tags
                        .get("colour")
                        .filter(|colour| is_hex_colour(colour))
                        .map(|colour| colour.to_uppercase()),
                    stops: stop_members(&members),
                });
            }
        }
    }
    Ok(routes)
}

fn read_stops(bytes: &[u8], wanted: &HashSet<i64>) -> Result<HashMap<i64, Stop>, osmpbf::Error> {
    let mut stops = HashMap::new();
    let mut keep = |id: i64, lat: f64, lon: f64, name: Option<&str>| {
        if wanted.contains(&id) {
            stops.insert(
                id,
                Stop {
                    id,
                    name: name.map_or_else(|| format!("Stop {}", id), str::to_string),
                    lat,
                    lon,
                },
            );
        }
    };
    for blob in BlobReader::new(bytes) {
        if let BlobDecode::OsmData(block) = blob?.decode()? {
            for element in block.elements() {
                match element {
                    Element::DenseNode(node) => keep(
                        node.id(),
                        node.lat(),
                        node.lon(),
                        node.tags()
                            .find(|&(key, _)| key == "name")
                            .map(|(_, value)| value),
                    ),
                    Element::Node(node) => keep(
                        node.id(),
                        node.lat(),
                        node.lon(),
                        node.tags()
                            .find(|&(key, _)| key == "name")
                            .map(|(_, value)| value),
                    ),
                    _ => {}
                }
            }
        }
    }
    Ok(stops)
}

fn ride_seconds(from: &Stop, to: &Stop) -> i64 {
    let km = haversine_km(
        (from.lat.to_radians(), from.lon.to_radians()),
        (to.lat.to_radians(), to.lon.to_radians()),
    );
    (km * DETOUR / SPEED_KMH * 3600.0 + DWELL_S).round() as i64
}

fn last_sunday(year: i32, month: u32) -> NaiveDate {
    let next = if month == 12 {
        NaiveDate::from_ymd_opt(year + 1, 1, 1)
    } else {
        NaiveDate::from_ymd_opt(year, month + 1, 1)
    };
    let last = next.and_then(|day| day.pred_opt()).unwrap_or_default();
    last - Duration::days(i64::from(last.weekday().num_days_from_sunday()))
}

pub fn utc_offset(time: DateTime<Utc>) -> Duration {
    let year = time.year();
    let summer = |month| {
        last_sunday(year, month)
            .and_hms_opt(1, 0, 0)
            .unwrap_or_default()
            .and_utc()
    };
    if time >= summer(3) && time < summer(10) {
        Duration::hours(2)
    } else {
        Duration::hours(1)
    }
}

pub fn next_departure(offset_s: i64, after: DateTime<Utc>) -> Option<DateTime<Utc>> {
    let local_day = (after + utc_offset(after)).date_naive();
    [local_day.pred_opt(), Some(local_day), local_day.succ_opt()]
        .into_iter()
        .flatten()
        .find_map(|day| {
            let noon = day.and_hms_opt(12, 0, 0)?.and_utc();
            let midnight = day.and_hms_opt(0, 0, 0)?.and_utc() - utc_offset(noon);
            (FIRST_MIN..=LAST_MIN)
                .step_by(HEADWAY_MIN as usize)
                .map(|minute| midnight + Duration::minutes(minute) + Duration::seconds(offset_s))
                .find(|&departure| departure >= after)
        })
}

impl Network {
    pub fn read(bytes: &[u8], graph: &Graph) -> Result<(Network, Stations), osmpbf::Error> {
        let routes = read_routes(bytes)?;
        let wanted: HashSet<i64> = routes
            .iter()
            .flat_map(|route| route.stops.iter().copied())
            .collect();
        let found = read_stops(bytes, &wanted)?;

        let mut access: StationAccessMap = HashMap::new();
        for stop in found.values() {
            if let Some((entrance, metres)) = graph.nearest_walkable(stop.lat, stop.lon)
                && metres <= MAX_ENTRANCE_M
            {
                access.insert(stop.id, vec![entrance]);
            }
        }

        let mut lines: Vec<String> = routes.iter().map(|route| route.line.clone()).collect();
        lines.sort();
        lines.dedup();
        let mut patterns = Vec::new();
        for route in routes {
            let mut stops: Vec<i64> = route
                .stops
                .iter()
                .copied()
                .filter(|id| access.contains_key(id))
                .collect();
            stops.dedup();
            if stops.len() < 2 {
                continue;
            }
            let mut offsets_s = vec![0];
            for pair in stops.windows(2) {
                let ride = ride_seconds(&found[&pair[0]], &found[&pair[1]]);
                offsets_s.push(offsets_s[offsets_s.len() - 1] + ride);
            }
            let index = lines
                .iter()
                .position(|line| *line == route.line)
                .unwrap_or(0);
            patterns.push(Pattern {
                colour: route
                    .colour
                    .unwrap_or_else(|| PALETTE[index % PALETTE.len()].to_string()),
                line: route.line,
                name: route.name,
                stops,
                offsets_s,
            });
        }
        patterns.sort_by(|a, b| (&a.line, &a.name).cmp(&(&b.line, &b.name)));

        let mut calls_at: HashMap<i64, Vec<(usize, usize)>> = HashMap::new();
        for (pattern_index, pattern) in patterns.iter().enumerate() {
            for (position, &stop) in pattern.stops.iter().enumerate() {
                calls_at
                    .entry(stop)
                    .or_default()
                    .push((pattern_index, position));
            }
        }
        let used: HashSet<i64> = calls_at.keys().copied().collect();
        access.retain(|stop, _| used.contains(stop));
        let served_by = used.iter().map(|&stop| (stop, vec![PLUGIN])).collect();
        let stops = found
            .into_iter()
            .filter(|(id, _)| used.contains(id))
            .collect();

        Ok((
            Network {
                stops,
                patterns,
                calls_at,
            },
            Stations::with_plugins(access, served_by),
        ))
    }

    pub fn journeys(&self, station: i64, after: DateTime<Utc>) -> Vec<OutgoingJourney> {
        let mut journeys = Vec::new();
        for &(pattern_index, position) in self.calls_at.get(&station).map_or(&[][..], Vec::as_slice)
        {
            let pattern = &self.patterns[pattern_index];
            let here = pattern.offsets_s[position];
            let Some(departure) = next_departure(here, after) else {
                continue;
            };
            for (&target, &offset) in pattern
                .stops
                .iter()
                .zip(&pattern.offsets_s)
                .skip(position + 1)
            {
                journeys.push(OutgoingJourney {
                    target_station: target,
                    departure,
                    cost_seconds: (offset - here) as u64,
                    plugin: PLUGIN,
                    mode: MODE.to_string(),
                    line: Some(Line {
                        id: Some(pattern.line.clone()),
                        preferred_colour: Some(pattern.colour.clone()),
                    }),
                });
            }
        }
        journeys
    }

    pub fn position(&self, stop: i64) -> Option<(f64, f64)> {
        self.stops.get(&stop).map(|stop| (stop.lat, stop.lon))
    }
}
