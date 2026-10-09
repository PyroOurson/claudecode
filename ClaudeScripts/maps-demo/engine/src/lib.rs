#![allow(dead_code, clippy::missing_safety_doc)]

pub mod graph {
    include!("../../../../NaoiseGabi/maps-server/src/graph.rs");

    fn blocks<T, F>(bytes: &[u8], extract: F) -> Result<Vec<T>, osmpbf::Error>
    where
        T: Default,
        F: Fn(&osmpbf::PrimitiveBlock, &mut T),
    {
        BlobReader::new(bytes)
            .map(|blob| {
                let mut found = T::default();
                if let BlobDecode::OsmData(block) = blob?.decode()? {
                    extract(&block, &mut found);
                }
                Ok(found)
            })
            .collect()
    }

    impl Graph {
        pub fn from_pbf_bytes(bytes: &[u8]) -> Result<Self, osmpbf::Error> {
            let batches = blocks(bytes, |block, found: &mut Ways| {
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
            let ways = batches.into_iter().fold(Ways::default(), Ways::merge);

            let mut needed = ways.refs.clone();
            needed.sort_unstable();
            needed.dedup();

            let batches = blocks(bytes, |block, found: &mut Vec<(i64, [i32; 2])>| {
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
            let nodes: Vec<(i64, [i32; 2])> = batches.into_iter().flatten().collect();
            drop(needed);

            Ok(Graph::build(nodes, |emit| {
                let mut start = 0;
                for (&length, &steps) in ways.lengths.iter().zip(&ways.steps) {
                    let end = start + length as usize;
                    for pair in ways.refs[start..end].windows(2) {
                        emit(pair[0], pair[1], steps);
                    }
                    start = end;
                }
            }))
        }

        pub fn walkable_bounds(&self) -> Option<[[f64; 2]; 2]> {
            let mut walkable =
                (0..self.ids.len()).filter(|&index| self.offsets[index] < self.offsets[index + 1]);
            let first = walkable.next()?;
            let [lat, lon] = self.coordinates[first];
            let mut bounds = [[degrees(lat), degrees(lon)]; 2];
            for index in walkable {
                let [lat, lon] = self.coordinates[index];
                let (lat, lon) = (degrees(lat), degrees(lon));
                bounds[0] = [bounds[0][0].min(lat), bounds[0][1].min(lon)];
                bounds[1] = [bounds[1][0].max(lat), bounds[1][1].max(lon)];
            }
            Some(bounds)
        }
    }
}

#[path = "../../../../NaoiseGabi/maps-server/src/route.rs"]
pub mod route;

pub mod api;
pub mod ffi;
pub mod transit;
