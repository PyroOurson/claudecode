# car-soccer.com comparison tools

Side-by-side checks of our sim (`seg/01_sim.js`) and camera (`seg/10b_cscam.js`) against car-soccer.com's own physics and camera, run headless in Node. The site's files are not stored here. To run:

1. Download the site bundles into a scratch folder `cs/` next to this folder's parent: `index.html`, `assets/main-*.js`, and the 16 meshes listed in `assets/arena/collision/manifest.json` (into `cs/collision/`).
2. `node xwasm.js cs/main-*.js cs/wasm` pulls out the embedded WASM; `strip.js` makes the bundle greppable.
3. Build `csmod.mjs` from the Emscripten factory `async function og(` … `return Sr=await Te(),await $a(),e}` in the main bundle (set `r=false`, replace `import.meta.url` with a string, `export default og`). `cs.mjs` wraps it.
4. `node dual.mjs` prints the physics table, `node camcmp.mjs <seed> <seconds>` compares camera output frame by frame, `node botmatch.mjs` runs headless bot matches. `SIM=<file>` points the tools at another copy of `01_sim.js`.

The other scripts are single-topic probes (contact gaps, bounces, bumps, pads, landings, hits).
