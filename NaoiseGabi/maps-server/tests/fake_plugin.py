# SPDX-License-Identifier: AGPL-3.0
# Copyright (C) 2026 Naoise McG
import json
import sys
import time
from datetime import datetime, timedelta

TIME_FORMAT = "%Y%m%dT%H%M%S"


def explore(scenario, data):
    start = datetime.strptime(data["datetime"], TIME_FORMAT)
    journeys = []
    for leg in scenario.get("explore", {}).get(str(data["station"]), []):
        journey = {
            "to": leg["to"],
            "cost": leg["cost"],
            "time": (start + timedelta(seconds=leg["offset"])).strftime(TIME_FORMAT),
        }
        if "line" in leg:
            journey["line"] = leg["line"]
        journeys.append(journey)
    return journeys


def answer(scenario, request):
    action = request.get("action")
    if action in scenario.get("hang", []):
        time.sleep(3600)
    if action in scenario.get("crash", []):
        sys.exit(1)
    if action == "mode":
        return scenario.get("mode", "train")
    if action == "attribution":
        return scenario.get("attribution", {
            "data_owner": "Fake data",
            "data_license": "CC0",
            "plugin_owner": "maps-server-review",
            "plugin_license": "CC0",
        })
    if action == "available":
        return scenario.get("available", {})
    if action == "explore":
        return explore(scenario, request.get("data") or {})
    raise ValueError("unknown action: " + str(action))


def record(scenario, line):
    path = scenario.get("log")
    if path:
        with open(path, "a", encoding="utf-8") as f:
            f.write(line.strip() + "\n")


def main():
    scenario = json.loads(sys.argv[1])
    for line in sys.stdin:
        if not line.strip():
            continue
        record(scenario, line)
        try:
            reply = {"response": answer(scenario, json.loads(line))}
        except Exception as error:
            reply = {"error": str(error)}
        print(json.dumps(reply), flush=True)


if __name__ == "__main__":
    main()
