"use strict";

const ENGINE_URL = "engine.wasm?v=1";
const MAP_URL = "monaco.osm.pbf?v=1";
const HEX = /^#[0-9A-Fa-f]{6}$/;
const WALK_COLOUR = "#3b3b3b";
const FALLBACK_COLOUR = "#2b62c4";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const state = {
  module: null,
  pbf: null,
  engine: null,
  info: null,
  map: null,
  routeLayer: null,
  lineLayer: null,
  a: null,
  b: null,
  stops: new Map(),
  patterns: [],
};

function $(id) {
  return document.getElementById(id);
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function setStatus(text, error) {
  const status = $("status");
  status.textContent = text;
  status.classList.toggle("error", Boolean(error));
}

function setHint(text) {
  $("hint").textContent = text;
}

function formatInt(value) {
  return Number(value).toLocaleString("en-GB");
}

function clock(iso) {
  const time = Math.round(new Date(iso).getTime() / 60000) * 60000;
  return new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function minutes(ms) {
  const total = Math.max(0, Math.round(ms / 60000));
  if (total === 0) return ms > 0 ? "under 1 min" : "0 min";
  if (total < 60) return total + " min";
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return hours + " h " + String(rest).padStart(2, "0") + " min";
}

function metres(points) {
  let sum = 0;
  for (let i = 1; i < points.length; i++) {
    const [lat1, lon1] = points[i - 1].map((v) => (v * Math.PI) / 180);
    const [lat2, lon2] = points[i].map((v) => (v * Math.PI) / 180);
    const h =
      Math.sin((lat2 - lat1) / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2;
    sum += 2 * 6371000 * Math.asin(Math.sqrt(h));
  }
  return sum;
}

function distance(m) {
  if (m < 1000) return Math.round(m / 10) * 10 + " m";
  return (m / 1000).toFixed(1) + " km";
}

function colourOf(line) {
  const colour = line && line.preferred_colour;
  return typeof colour === "string" && HEX.test(colour) ? colour : FALLBACK_COLOUR;
}

function localInputValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) +
    "T" + pad(date.getHours()) + ":" + pad(date.getMinutes())
  );
}

function defaultDeparture() {
  const date = new Date();
  date.setSeconds(0, 0);
  date.setMinutes(Math.ceil(date.getMinutes() / 5) * 5);
  if (date.getHours() >= 22) {
    date.setDate(date.getDate() + 1);
    date.setHours(8, 0);
  } else if (date.getHours() < 6) {
    date.setHours(8, 0);
  }
  return date;
}

function instantiate() {
  const instance = new WebAssembly.Instance(state.module, {});
  state.engine = instance.exports;
  return call(state.engine.load, state.pbf);
}

function call(fn, bytes) {
  const engine = state.engine;
  const pointer = engine.alloc(bytes.length);
  new Uint8Array(engine.memory.buffer, pointer, bytes.length).set(bytes);
  const started = performance.now();
  let status;
  try {
    status = fn(pointer, bytes.length);
  } finally {
    try {
      engine.dealloc(pointer, bytes.length);
    } catch (ignored) {
      status = status || 500;
    }
  }
  const ms = performance.now() - started;
  const text = decoder.decode(new Uint8Array(engine.memory.buffer, engine.output_ptr(), engine.output_len()).slice());
  return { status, ms, body: JSON.parse(text) };
}

async function fetchBytes(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(url.split("?")[0] + " answered " + response.status);
  return new Uint8Array(await response.arrayBuffer());
}

function pinIcon(letter, className) {
  const pin = element("div", "pin " + className);
  pin.appendChild(element("span", "", letter));
  return L.divIcon({ html: pin, className: "", iconSize: [28, 28], iconAnchor: [14, 30] });
}

function placeMarker(which, latlng) {
  const current = state[which];
  if (current) {
    current.setLatLng(latlng);
    return;
  }
  const letter = which === "a" ? "A" : "B";
  const marker = L.marker(latlng, {
    draggable: true,
    icon: pinIcon(letter, "pin-" + which),
    title: which === "a" ? "Start" : "Destination",
    alt: which === "a" ? "Start" : "Destination",
  }).addTo(state.map);
  marker.on("dragend", plan);
  state[which] = marker;
}

function removeMarker(which) {
  if (state[which]) {
    state.map.removeLayer(state[which]);
    state[which] = null;
  }
}

function updateButtons() {
  const both = Boolean(state.a && state.b);
  $("swap").disabled = !both;
  $("clear").disabled = !state.a && !state.b;
}

function clearRoute() {
  state.routeLayer.clearLayers();
  $("result").replaceChildren();
  $("request").textContent = "";
  $("response").textContent = "";
}

function initMap() {
  const map = L.map("map", { zoomControl: true }).setView([43.7384, 7.4246], 15);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  state.map = map;
  state.lineLayer = L.layerGroup().addTo(map);
  state.routeLayer = L.layerGroup().addTo(map);
  L.control.layers(null, { "Bus lines and stops": state.lineLayer }, { collapsed: false }).addTo(map);
  map.on("click", (event) => {
    if (!state.engine) return;
    if (!state.a || state.b) {
      removeMarker("b");
      clearRoute();
      placeMarker("a", event.latlng);
      setHint("Now click the destination.");
    } else {
      placeMarker("b", event.latlng);
      setHint("Drag A or B to change the route. Click again to start over.");
      plan();
    }
    updateButtons();
  });
}

function drawNetwork(info) {
  for (const stop of info.stops) state.stops.set(stop.id, stop);
  state.patterns = info.patterns;
  for (const pattern of info.patterns) {
    const points = pattern.stops.map((id) => state.stops.get(id)).filter(Boolean).map((s) => [s.lat, s.lon]);
    const colour = HEX.test(pattern.colour) ? pattern.colour : FALLBACK_COLOUR;
    L.polyline(points, { color: colour, weight: 3, opacity: 0.35, interactive: false }).addTo(state.lineLayer);
  }
  for (const stop of info.stops) {
    const label = element("span", "", stop.name);
    L.circleMarker([stop.lat, stop.lon], {
      radius: 4,
      color: "#1b1b1b",
      weight: 1.5,
      fillColor: "#ffffff",
      fillOpacity: 1,
      bubblingMouseEvents: true,
    })
      .bindTooltip(label, { direction: "top", offset: [0, -4] })
      .addTo(state.lineLayer);
  }
}

function patternShape(segment) {
  const [from, to] = [segment.nodes[0], segment.nodes[segment.nodes.length - 1]];
  const id = segment.line && segment.line.id;
  for (const pattern of state.patterns) {
    if (pattern.line !== id) continue;
    const start = pattern.stops.indexOf(from);
    if (start < 0) continue;
    const end = pattern.stops.indexOf(to, start + 1);
    if (end < 0) continue;
    const stops = pattern.stops.slice(start, end + 1).map((s) => state.stops.get(s)).filter(Boolean);
    return { points: stops.map((s) => [s.lat, s.lon]), count: end - start };
  }
  return { points: segment.coordinates, count: 1 };
}

function stopName(names, id) {
  return (names && names[String(id)]) || "stop " + id;
}

function buildRequest() {
  const a = state.a.getLatLng();
  const b = state.b.getLatLng();
  const round = (v) => Math.round(v * 1e6) / 1e6;
  const timeValue = $("time").value;
  const when = timeValue ? new Date(timeValue) : new Date();
  const body = {
    waypoints: [
      [round(a.lat), round(a.lng)],
      [round(b.lat), round(b.lng)],
    ],
    time: isNaN(when.getTime()) ? timeValue : when.toISOString(),
    walking_speed: Number($("speed").value),
  };
  if (!$("buses").checked) body.exclude_modes = ["bus"];
  if ($("steps").checked) body.avoid_steps = true;
  if ($("fast").checked) body.fast = true;
  const transfer = $("transfer").value.trim();
  if (transfer !== "" && Number(transfer) !== 60) body.min_transfer_s = Number(transfer);
  const penalty = $("penalty").value.trim();
  if (penalty !== "" && Number(penalty) !== 0) body.transfer_penalty_s = Number(penalty);
  const maxWalk = $("maxwalk").value.trim();
  if (maxWalk !== "") body.max_walk_m = Number(maxWalk);
  return body;
}

function showProblem(status, body) {
  const box = element("div", "problem");
  let text;
  if (status === 404 && body.error === "no route") {
    text = "No route between these two points with these options. Try allowing buses, a later time, or no walking limit.";
  } else if (status === 404 && body.error === "no route within limits") {
    text = "The search hit its limit (" + body.limit + ") before finding a route.";
  } else {
    text = body.error || "Something went wrong (" + status + ").";
  }
  box.textContent = text;
  $("result").replaceChildren(box);
}

function drawRoute(body, request, ms) {
  state.routeLayer.clearLayers();
  const route = body.route.filter((segment) => {
    const span = new Date(segment.arrival_time) - new Date(segment.departure_time);
    return segment.mode !== "walking" || span >= 1000 || metres(segment.coordinates) >= 1;
  });
  const list = element("ol", "legs");
  let walked = 0;
  let rides = 0;
  let previousArrival = null;
  for (const segment of route) {
    const item = element("li", "leg");
    item.appendChild(element("div", "time", clock(segment.departure_time)));
    const text = element("div", "");
    const duration = new Date(segment.arrival_time) - new Date(segment.departure_time);
    if (segment.mode === "walking") {
      const m = metres(segment.coordinates);
      walked += m;
      const what = element("div", "what");
      what.appendChild(element("span", "badge walk-badge", "Walk"));
      what.appendChild(document.createTextNode(minutes(duration) + ", about " + distance(m)));
      text.appendChild(what);
      L.polyline(segment.coordinates, { color: "#ffffff", weight: 8, opacity: 0.9, interactive: false }).addTo(state.routeLayer);
      L.polyline(segment.coordinates, { color: WALK_COLOUR, weight: 5, dashArray: "2 9", lineCap: "round" }).addTo(state.routeLayer);
    } else {
      rides += 1;
      const colour = colourOf(segment.line);
      const shape = patternShape(segment);
      const from = segment.nodes[0];
      const to = segment.nodes[segment.nodes.length - 1];
      const what = element("div", "what");
      const badge = element("span", "badge", (segment.line && segment.line.id) || segment.mode);
      badge.style.background = colour;
      what.appendChild(badge);
      const mode = segment.mode.charAt(0).toUpperCase() + segment.mode.slice(1);
      what.appendChild(document.createTextNode(mode + " to " + stopName(body.stop_names, to)));
      text.appendChild(what);
      const stops = shape.count === 1 ? "1 stop" : shape.count + " stops";
      const wait = previousArrival ? new Date(segment.departure_time) - previousArrival : 0;
      const board = wait >= 60000
        ? "Wait " + minutes(wait) + " at " + stopName(body.stop_names, from) + ", then "
        : "From " + stopName(body.stop_names, from) + ", ";
      text.appendChild(
        element("div", "detail", board + stops + " (" + minutes(duration) + "). Arrive " + clock(segment.arrival_time) + ".")
      );
      L.polyline(shape.points, { color: "#ffffff", weight: 10, opacity: 0.9, interactive: false }).addTo(state.routeLayer);
      L.polyline(shape.points, { color: colour, weight: 6 })
        .bindTooltip(element("span", "", segment.mode + " " + ((segment.line && segment.line.id) || "")))
        .addTo(state.routeLayer);
      for (const point of [shape.points[0], shape.points[shape.points.length - 1]]) {
        L.circleMarker(point, { radius: 5, color: colour, weight: 3, fillColor: "#ffffff", fillOpacity: 1 }).addTo(state.routeLayer);
      }
    }
    previousArrival = new Date(segment.arrival_time);
    item.appendChild(text);
    list.appendChild(item);
  }

  const summary = element("div", "summary");
  const total = new Date(body.arrival_time) - new Date(request.time);
  summary.appendChild(element("div", "big", "Arrive " + clock(body.arrival_time)));
  const parts = [minutes(total)];
  parts.push(rides === 0 ? "walking only" : rides === 1 ? "1 bus" : rides + " buses");
  parts.push(distance(walked) + " on foot");
  summary.appendChild(element("div", "small", parts.join(" · ")));
  summary.appendChild(list);
  const stats = body.stats || {};
  summary.appendChild(
    element(
      "p",
      "stats-line",
      "Search: " + formatInt(stats.expanded || 0) + " states explored, " +
        formatInt(stats.plugin_calls || 0) + " timetable lookups, " +
        (ms < 1 ? "under 1" : Math.round(ms)) + " ms in your browser." +
        (rides > 0 ? " Bus times are made up for this demo." : "")
    )
  );
  $("result").replaceChildren(summary);
}

function plan() {
  updateButtons();
  if (!state.engine || !state.a || !state.b) return;
  const request = buildRequest();
  $("request").textContent = "POST /\n" + JSON.stringify(request, null, 2);
  let answer;
  try {
    answer = call(state.engine.plan, encoder.encode(JSON.stringify(request)));
  } catch (error) {
    $("response").textContent = String(error);
    showProblem(500, { error: "The routing engine stopped on an internal error. It has been restarted; try again." });
    try {
      instantiate();
    } catch (ignored) {
      setStatus("The routing engine could not restart. Reload the page.", true);
    }
    return;
  }
  $("response").textContent = answer.status + "\n" + JSON.stringify(answer.body, null, 2);
  if (answer.status === 200) {
    drawRoute(answer.body, request, answer.ms);
  } else {
    state.routeLayer.clearLayers();
    showProblem(answer.status, answer.body);
  }
}

function useExample(button) {
  const [fromLat, fromLon] = button.dataset.from.split(",").map(Number);
  const [toLat, toLon] = button.dataset.to.split(",").map(Number);
  placeMarker("a", L.latLng(fromLat, fromLon));
  placeMarker("b", L.latLng(toLat, toLon));
  state.map.fitBounds(L.latLngBounds([fromLat, fromLon], [toLat, toLon]), { padding: [60, 60] });
  setHint("Drag A or B to change the route. Click again to start over.");
  plan();
}

function initForm() {
  $("time").value = localInputValue(defaultDeparture());
  $("options").addEventListener("submit", (event) => event.preventDefault());
  $("options").addEventListener("change", plan);
  $("swap").addEventListener("click", () => {
    const a = state.a.getLatLng();
    state.a.setLatLng(state.b.getLatLng());
    state.b.setLatLng(a);
    plan();
  });
  $("clear").addEventListener("click", () => {
    removeMarker("a");
    removeMarker("b");
    clearRoute();
    updateButtons();
    setHint("Click the map to place the start.");
  });
  for (const chip of document.querySelectorAll(".chip")) {
    chip.disabled = true;
    chip.addEventListener("click", () => useExample(chip));
  }
}

async function start() {
  initForm();
  initMap();
  try {
    const [wasm, pbf] = await Promise.all([fetchBytes(ENGINE_URL), fetchBytes(MAP_URL)]);
    state.module = await WebAssembly.compile(wasm);
    state.pbf = pbf;
    const loaded = instantiate();
    if (loaded.status !== 200) throw new Error(loaded.body.error || "the map did not load");
    const info = loaded.body;
    state.info = info;
    drawNetwork(info);
    if (info.bounds) state.map.fitBounds(info.bounds, { padding: [10, 10] });
    const timetable = info.timetable;
    $("headway").textContent = timetable.headway_min;
    $("first").textContent = timetable.first;
    $("last").textContent = timetable.last;
    $("kmh").textContent = timetable.speed_kmh;
    for (const chip of document.querySelectorAll(".chip")) chip.disabled = false;
    setStatus(
      "Ready. Monaco: " + formatInt(info.walkable_nodes) + " walkable points, " + formatInt(info.edges) +
        " path links and " + info.patterns.length + " bus routes, loaded in " + Math.round(loaded.ms) + " ms."
    );
    setHint("Click the map to place the start.");
  } catch (error) {
    if (location.protocol === "file:") {
      setStatus(
        "Browsers do not let this page load its files from a folder. In the claudecode folder, run python3 -m http.server and open http://localhost:8000/ClaudeScripts/maps-demo/",
        true
      );
    } else {
      setStatus("Could not start: " + error.message, true);
    }
    setHint("");
  }
}

start();
