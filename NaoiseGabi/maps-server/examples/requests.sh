#!/usr/bin/env bash
# SPDX-License-Identifier: AGPL-3.0
# Copyright (C) 2026 Naoise McG
set -u

BASE="${1:-${MAPS_URL:-http://127.0.0.1:6767}}"
failures=0

check() {
	local expected="$1" label="$2"
	shift 2
	local actual
	actual=$(curl -s -o /dev/null -w "%{http_code}" "$@")
	if [ "$actual" = "$expected" ]; then
		echo "ok    $expected  $label"
	else
		echo "FAIL  expected $expected, got $actual  $label"
		failures=$((failures + 1))
	fi
}

post() {
	check "$1" "$2" -X POST "$BASE/" -H "Content-Type: application/json" -d "$2"
}

post 200 '{"required_nodes": [1813442462, 12486470822], "time": "20260808T131000"}'
post 200 '{"required_nodes": [642423112, 9952646938], "walking_speed": 0.0014}'
post 200 '{"required_nodes": [9952646938, 1813442462], "time": "20260807T131000", "walking_speed": 0.0014}'
post 200 '{"required_nodes": [1690189840, 1813442462], "time": "20260807T131000", "walking_speed": 0.0014}'
post 200 '{"required_nodes": [1813442462, 1690189840], "time": "2026-08-07T13:10:00", "walking_speed": 0.0014}'
post 200 '{"required_nodes": [4939161314, 1813442462], "time": "20260807T131000", "fast": true}'
post 200 '{"required_nodes": [1813442462, 4939161314], "time": "2026-08-07T15:10:00+02:00"}'
post 200 '{"required_nodes": [10068880332, 1813442462], "time": "20260808T213000", "walking_speed": 0.0014}'
post 200 '{"required_nodes": [9952646938, 1813442462], "time": "20260807T131000", "min_transfer_s": 300, "transfer_penalty_s": 600, "max_walk_m": 2000, "avoid_steps": true, "exclude_modes": ["bus"]}'
post 200 '{"required_nodes": [1813442462, 10068880332], "walking_speed": 0.0014}'
post 200 '{"waypoints": [[43.3027, 5.3806], [43.2951, 5.3740]], "time": "20260808T131000"}'
post 200 '{"waypoints": [[43.3027, 5.3806], [43.2951, 5.3740]], "time": "20260808T131000", "format": "geojson"}'
post 404 '{"required_nodes": [0, 9952646938], "time": "20260807T131000", "walking_speed": 0.0014}'
post 400 '{"required_nodes": [1813442462, 12486470822], "time": "260808T131000"}'
post 400 '{"required_nodes": [1813442462], "time": "20260808T131000"}'
post 400 '{"required_nodes": [1813442462, 12486470822], "walking_speed": 0}'
post 400 '{"required_nodes": "1813442462,12486470822"}'
post 400 '{"required_nodes": [1813442462, 12486470822'
post 400 '{"waypoints": [[43.3027, 5.3806], [0.0, 0.0]]}'
post 400 '{"required_nodes": [1813442462, 12486470822], "exclude_modes": "bus"}'
check 204 "OPTIONS / (CORS preflight)" -X OPTIONS "$BASE/" -H "Origin: https://example.org" -H "Access-Control-Request-Method: POST"
check 405 "GET /" "$BASE/"
check 200 "GET /health" "$BASE/health"

if [ "$failures" -gt 0 ]; then
	echo "$failures request(s) did not get the expected status."
	exit 1
fi
