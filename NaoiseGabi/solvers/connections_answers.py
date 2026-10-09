import argparse
import datetime
import json
import os
import ssl
import sys
import urllib.request
import webbrowser

GAME_URL = "https://www.nytimes.com/games/connections"
API_URLS = ["https://www.nytimes.com/svc/connections/v2/{}.json", "https://www.nytimes.com/svc/connections/v1/{}.json"]
LEVELS = [("Yellow", "\033[43;30;1m"), ("Green", "\033[42;30;1m"), ("Blue", "\033[44;97;1m"), ("Purple", "\033[45;97;1m")]
RESET = "\033[0m"


def fetch_json(url):
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        import certifi
        context = ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        context = ssl.create_default_context()
    with urllib.request.urlopen(request, timeout=10, context=context) as response:
        return json.load(response)


def parse_groups(data):
    if "categories" in data:
        return [(c["title"], [card.get("content") or card.get("image_alt_text") or "?" for card in c["cards"]])
                for c in data["categories"]]
    groups = sorted(data["groups"].items(), key=lambda item: item[1].get("level", 0))
    return [(title, group["members"]) for title, group in groups]


def todays_groups(date):
    errors = []
    for url in API_URLS:
        try:
            return parse_groups(fetch_json(url.format(date.isoformat())))
        except Exception as error:
            errors.append(str(error))
    raise RuntimeError("; ".join(errors))


def show(level, title, words):
    name, color = LEVELS[level] if level < len(LEVELS) else ("", "")
    print(f"{color} {name.upper():<6} {RESET}  {title.upper()}")
    print("          " + ", ".join(w.upper() for w in words) + "\n")


def main():
    parser = argparse.ArgumentParser(description="Show the answers to today's NYT Connections, one group at a time.")
    parser.add_argument("--date", help="puzzle date as YYYY-MM-DD (default: today)")
    parser.add_argument("--all", action="store_true", help="show every group at once")
    parser.add_argument("--no-browser", action="store_true", help="don't open Connections in the browser")
    args = parser.parse_args()
    if os.name == "nt":
        os.system("")

    date = datetime.date.fromisoformat(args.date) if args.date else datetime.date.today()
    try:
        groups = todays_groups(date)
    except Exception as error:
        print(f"Could not get the puzzle from the New York Times ({error}).")
        sys.exit(1)

    if not args.no_browser:
        webbrowser.open(GAME_URL)
    print(f"\nConnections · {date.strftime('%A %d %B %Y')}\n")
    for level, (title, words) in enumerate(groups):
        if not args.all and level:
            input("Press Enter for the next group...")
            print("\033[1A\033[2K", end="")
        show(level, title, words)


if __name__ == "__main__":
    try:
        main()
    except (KeyboardInterrupt, EOFError):
        print()
        sys.exit(0)
