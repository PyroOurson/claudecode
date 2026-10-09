// SPDX-License-Identifier: AGPL-3.0
// Copyright (C) 2026 Naoise McG
use osmpbf::{BlobDecode, BlobReader, Element};
use rayon::prelude::*;
use rstar::RTree;
use rstar::primitives::GeomWithData;
use std::path::Path;
use std::sync::OnceLock;

const EARTH_RADIUS_KM: f64 = 6371.0;
const DEGREES_PER_UNIT: f64 = 1e-7;

pub fn haversine_km((lat1, lon1): (f64, f64), (lat2, lon2): (f64, f64)) -> f64 {
    let dlat = lat2 - lat1;
    let dlon = lon2 - lon1;
    let h = ((dlat / 2.0).sin().powi(2) + lat1.cos() * lat2.cos() * (dlon / 2.0).sin().powi(2))
        .clamp(0.0, 1.0);
    EARTH_RADIUS_KM * 2.0 * h.sqrt().atan2((1.0 - h).sqrt())
}

fn is_walkable<'a>(tags: impl IntoIterator<Item = (&'a str, &'a str)>) -> bool {
    let mut highway_type = None;
    let mut foot_tag = None;
    let mut access_tag = None;
    let mut railway_tag = None;
    let mut public_transport_tag = None;
    let mut indoor_tag = None;
    let mut has_sidewalk = false;
    let mut is_building = false;

    for (key, value) in tags {
        match key {
            "highway" => highway_type = Some(value),
            "foot" => foot_tag = Some(value),
            "access" => access_tag = Some(value),
            "railway" => railway_tag = Some(value),
            "public_transport" => public_transport_tag = Some(value),
            "indoor" => indoor_tag = Some(value),
            "sidewalk" if matches!(value, "both" | "left" | "right" | "yes") => has_sidewalk = true,
            "sidewalk:both" | "sidewalk:left" | "sidewalk:right" if value == "yes" => {
                has_sidewalk = true
            }
            "building" if value != "no" => is_building = true,
            _ => {}
        }
    }

    if let Some(foot) = foot_tag {
        match foot {
            "no" | "private" | "use_sidepath" => return false,
            "yes" | "designated" | "permissive" | "official" => return true,
            _ => {}
        }
    }

    if is_building && highway_type.is_none() && railway_tag.is_none() {
        return false;
    }

    if let Some(access) = access_tag
        && (access == "no" || access == "private")
    {
        return false;
    }

    if railway_tag == Some("platform") || public_transport_tag == Some("platform") {
        return true;
    }

    let Some(highway) = highway_type else {
        return indoor_tag == Some("corridor");
    };

    match highway {
        "trunk" | "trunk_link" => has_sidewalk,
        "motorway" | "motorway_link" | "construction" | "proposed" | "raceway" | "abandoned"
        | "bus_guideway" | "busway" | "razed" | "disused" | "no" => false,
        _ => true,
    }
}

fn is_station_like<'a>(mut tags: impl Iterator<Item = (&'a str, &'a str)>) -> bool {
    tags.any(|(key, _)| matches!(key, "public_transport" | "railway" | "entrance"))
}

const STEPS: u32 = 1 << 31;

#[derive(Clone, Copy)]
struct Edge {
    target: u32,
    length_m: f32,
}

impl Edge {
    fn index(self) -> usize {
        (self.target & !STEPS) as usize
    }

    fn is_steps(self) -> bool {
        self.target & STEPS != 0
    }
}

fn is_steps<'a>(mut tags: impl Iterator<Item = (&'a str, &'a str)>) -> bool {
    tags.any(|(key, value)| key == "highway" && value == "steps")
}

type Located = GeomWithData<[f32; 3], u32>;

#[derive(Clone, Copy, Debug)]
pub struct Step {
    pub node: i64,
    pub length_m: f64,
    pub steps: bool,
}

pub struct Graph {
    ids: Vec<i64>,
    coordinates: Vec<[i32; 2]>,
    offsets: Vec<u32>,
    edges: Vec<Edge>,
    nearest: OnceLock<RTree<Located>>,
}

fn on_unit_sphere(lat: f64, lon: f64) -> [f32; 3] {
    let (lat, lon) = (lat.to_radians(), lon.to_radians());
    [
        (lat.cos() * lon.cos()) as f32,
        (lat.cos() * lon.sin()) as f32,
        lat.sin() as f32,
    ]
}

#[derive(Default)]
struct Ways {
    refs: Vec<i64>,
    lengths: Vec<u32>,
    steps: Vec<bool>,
}

impl Ways {
    fn merge(mut self, other: Ways) -> Ways {
        self.refs.extend(other.refs);
        self.lengths.extend(other.lengths);
        self.steps.extend(other.steps);
        self
    }
}

fn for_each_block<T, F>(path: &Path, extract: F) -> Result<Vec<T>, osmpbf::Error>
where
    T: Send + Default,
    F: Fn(&osmpbf::PrimitiveBlock, &mut T) + Sync + Send,
{
    BlobReader::from_path(path)?
        .par_bridge()
        .map(|blob| {
            let mut found = T::default();
            if let BlobDecode::OsmData(block) = blob?.decode()? {
                extract(&block, &mut found);
            }
            Ok(found)
        })
        .collect()
}

fn degrees(value: i32) -> f64 {
    f64::from(value) * DEGREES_PER_UNIT
}

const BYTES_PER_DECODE_THREAD: u64 = 8 << 20;

fn decode_threads<P: AsRef<Path>>(paths: &[P]) -> usize {
    let bytes: u64 = paths
        .iter()
        .filter_map(|path| std::fs::metadata(path).ok())
        .map(|metadata| metadata.len())
        .sum();
    let cores = std::thread::available_parallelism().map_or(1, usize::from);
    ((bytes / BYTES_PER_DECODE_THREAD) as usize + 1).min(cores)
}

impl Graph {
    pub fn from_pbfs<P: AsRef<Path> + Sync>(paths: &[P]) -> Result<Self, osmpbf::Error> {
        let threads = decode_threads(paths);
        match rayon::ThreadPoolBuilder::new().num_threads(threads).build() {
            Ok(pool) => pool.install(|| Graph::load(paths)),
            Err(_) => Graph::load(paths),
        }
    }

    fn load<P: AsRef<Path>>(paths: &[P]) -> Result<Self, osmpbf::Error> {
        let mut ways = Ways::default();
        for path in paths {
            let batches = for_each_block(path.as_ref(), |block, found: &mut Ways| {
                for element in block.elements() {
                    if let Element::Way(way) = element
                        && is_walkable(way.tags())
                    {
                        let before = found.refs.len();
                        found.refs.extend(way.refs());
                        found.lengths.push((found.refs.len() - before) as u32);
                        found.steps.push(is_steps(way.tags()));
                    }
                }
            })?;
            ways = batches.into_iter().fold(ways, Ways::merge);
        }

        let mut needed = ways.refs.clone();
        needed.par_sort_unstable();
        needed.dedup();

        let mut nodes: Vec<(i64, [i32; 2])> = Vec::with_capacity(needed.len());
        for path in paths {
            let batches =
                for_each_block(path.as_ref(), |block, found: &mut Vec<(i64, [i32; 2])>| {
                    for element in block.elements() {
                        let kept = match &element {
                            Element::DenseNode(node) => (needed.binary_search(&node.id()).is_ok()
                                || is_station_like(node.tags()))
                            .then(|| (node.id(), [node.decimicro_lat(), node.decimicro_lon()])),
                            Element::Node(node) => (needed.binary_search(&node.id()).is_ok()
                                || is_station_like(node.tags()))
                            .then(|| (node.id(), [node.decimicro_lat(), node.decimicro_lon()])),
                            _ => None,
                        };
                        found.extend(kept);
                    }
                })?;
            nodes.extend(batches.into_iter().flatten());
        }
        drop(needed);

        let graph = Graph::build(nodes, |emit| {
            let mut start = 0;
            for (&length, &steps) in ways.lengths.iter().zip(&ways.steps) {
                let end = start + length as usize;
                for pair in ways.refs[start..end].windows(2) {
                    emit(pair[0], pair[1], steps);
                }
                start = end;
            }
        });

        tracing::info!(
            "Loaded graph with {} nodes ({} walkable) and {} edges from {} file(s), using {:.1} MB.",
            graph.node_count(),
            graph.walkable_node_count(),
            graph.edge_count(),
            paths.len(),
            graph.heap_bytes() as f64 / 1_048_576.0
        );
        Ok(graph)
    }

    fn build(
        mut nodes: Vec<(i64, [i32; 2])>,
        ways: impl FnOnce(&mut dyn FnMut(i64, i64, bool)),
    ) -> Self {
        nodes.par_sort_unstable_by_key(|&(id, _)| id);
        nodes.dedup_by_key(|&mut (id, _)| id);
        let ids: Vec<i64> = nodes.iter().map(|&(id, _)| id).collect();
        let coordinates: Vec<[i32; 2]> = nodes.iter().map(|&(_, at)| at).collect();
        drop(nodes);

        let mut directed: Vec<(u32, u32, f32)> = Vec::new();
        ways(&mut |a, b, steps| {
            if a == b {
                return;
            }
            let (Ok(from), Ok(to)) = (ids.binary_search(&a), ids.binary_search(&b)) else {
                return;
            };
            let radians = |index: usize| {
                let [lat, lon] = coordinates[index];
                (degrees(lat).to_radians(), degrees(lon).to_radians())
            };
            let length_m = (haversine_km(radians(from), radians(to)) * 1000.0) as f32;
            let flag = if steps { STEPS } else { 0 };
            directed.push((from as u32, to as u32 | flag, length_m));
            directed.push((to as u32, from as u32 | flag, length_m));
        });
        directed.par_sort_unstable_by_key(|&(from, to, _)| (from, to & !STEPS, to & STEPS));
        directed.dedup_by_key(|&mut (from, to, _)| (from, to & !STEPS));

        let mut offsets = vec![0u32; ids.len() + 1];
        for &(from, _, _) in &directed {
            offsets[from as usize + 1] += 1;
        }
        for index in 1..offsets.len() {
            offsets[index] += offsets[index - 1];
        }
        let mut edges: Vec<Edge> = directed
            .into_iter()
            .map(|(_, target, length_m)| Edge { target, length_m })
            .collect();
        edges.shrink_to_fit();

        Graph {
            ids,
            coordinates,
            offsets,
            edges,
            nearest: OnceLock::new(),
        }
    }

    #[cfg(test)]
    pub fn from_parts(nodes: &[(i64, f64, f64)], edges: &[(i64, i64)]) -> Self {
        let edges: Vec<(i64, i64, bool)> = edges.iter().map(|&(a, b)| (a, b, false)).collect();
        Graph::from_parts_with_steps(nodes, &edges)
    }

    #[cfg(test)]
    pub fn from_parts_with_steps(nodes: &[(i64, f64, f64)], edges: &[(i64, i64, bool)]) -> Self {
        let nodes = nodes
            .iter()
            .map(|&(id, lat, lon)| {
                (
                    id,
                    [
                        (lat / DEGREES_PER_UNIT).round() as i32,
                        (lon / DEGREES_PER_UNIT).round() as i32,
                    ],
                )
            })
            .collect();
        Graph::build(nodes, |emit| {
            for &(a, b, steps) in edges {
                emit(a, b, steps);
            }
        })
    }

    fn index(&self, node: i64) -> Option<usize> {
        self.ids.binary_search(&node).ok()
    }

    pub fn node_count(&self) -> usize {
        self.ids.len()
    }

    pub fn walkable_node_count(&self) -> usize {
        self.offsets.windows(2).filter(|w| w[1] > w[0]).count()
    }

    pub fn edge_count(&self) -> usize {
        self.edges.len()
    }

    pub fn heap_bytes(&self) -> usize {
        self.ids.capacity() * std::mem::size_of::<i64>()
            + self.coordinates.capacity() * std::mem::size_of::<[i32; 2]>()
            + self.offsets.capacity() * std::mem::size_of::<u32>()
            + self.edges.capacity() * std::mem::size_of::<Edge>()
    }

    pub fn contains(&self, node: i64) -> bool {
        self.index(node).is_some()
    }

    pub fn position(&self, node: i64) -> Option<(f64, f64)> {
        let [lat, lon] = self.coordinates[self.index(node)?];
        Some((degrees(lat), degrees(lon)))
    }

    pub fn nearest_walkable(&self, lat: f64, lon: f64) -> Option<(i64, f64)> {
        let tree = self.nearest.get_or_init(|| {
            RTree::bulk_load(
                (0..self.ids.len())
                    .filter(|&index| self.offsets[index + 1] > self.offsets[index])
                    .map(|index| {
                        let [node_lat, node_lon] = self.coordinates[index];
                        GeomWithData::new(
                            on_unit_sphere(degrees(node_lat), degrees(node_lon)),
                            index as u32,
                        )
                    })
                    .collect(),
            )
        });
        let index = tree.nearest_neighbor(on_unit_sphere(lat, lon))?.data as usize;
        let [node_lat, node_lon] = self.coordinates[index];
        let metres = haversine_km(
            (lat.to_radians(), lon.to_radians()),
            (
                degrees(node_lat).to_radians(),
                degrees(node_lon).to_radians(),
            ),
        ) * 1000.0;
        Some((self.ids[index], metres))
    }

    pub fn coords_from_id(&self, node: i64) -> Option<(f64, f64)> {
        let [lat, lon] = self.coordinates[self.index(node)?];
        Some((degrees(lat).to_radians(), degrees(lon).to_radians()))
    }

    pub fn neighbours(&self, node: i64) -> impl Iterator<Item = Step> + '_ {
        let range = self.index(node).map_or(0..0, |index| {
            self.offsets[index] as usize..self.offsets[index + 1] as usize
        });
        self.edges[range].iter().map(|&edge| Step {
            node: self.ids[edge.index()],
            length_m: f64::from(edge.length_m),
            steps: edge.is_steps(),
        })
    }
}
