import argparse
import datetime
import json
import os
import shutil
import ssl
import subprocess
import sys
import urllib.request
import webbrowser
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
WORDLE_URL = "https://www.nytimes.com/games/wordle/index.html"
API_URL = "https://www.nytimes.com/svc/wordle/v2/{}.json"
COLORS = {"2": "\033[42;97;1m", "1": "\033[43;97;1m", "0": "\033[100;97;1m"}
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


def copy_to_clipboard(text):
    for command in (["pbcopy"], ["clip"], ["wl-copy"], ["xclip", "-selection", "clipboard"], ["xsel", "-b", "-i"]):
        if shutil.which(command[0]):
            try:
                subprocess.run(command, input=text.encode(), check=True, timeout=5)
                return True
            except (OSError, subprocess.SubprocessError):
                pass
    return False


def load_words(path, length):
    with open(path, encoding="utf-8") as f:
        return sorted({w.strip().lower() for w in f if len(w.strip()) == length and w.strip().isalpha()})


def feedback(guess, answer):
    result = ["0"] * len(guess)
    remaining = Counter()
    for i, (g, a) in enumerate(zip(guess, answer)):
        if g == a:
            result[i] = "2"
        else:
            remaining[a] += 1
    for i, g in enumerate(guess):
        if result[i] == "0" and remaining[g]:
            result[i] = "1"
            remaining[g] -= 1
    return "".join(result)


def best_guess(candidates, allowed):
    if len(candidates) <= 2:
        return candidates[0]
    pool = allowed if len(candidates) > 50 else sorted(set(candidates) | set(allowed[:2000]))
    frequency = Counter(c for word in candidates for c in set(word))
    shortlist = sorted(pool, key=lambda w: -sum(frequency[c] for c in set(w)))[:200]
    candidate_set = set(candidates)

    def score(guess):
        groups = Counter(feedback(guess, answer) for answer in candidates)
        return sum(n * n for n in groups.values()), guess not in candidate_set

    return min(shortlist, key=score)


def opening(allowed, length):
    return "crane" if length == 5 and "crane" in allowed else best_guess(allowed, allowed)


def tiles(word, pattern):
    return " ".join(f"{COLORS[p]} {c.upper()} {RESET}" for c, p in zip(word, pattern))


def solve_path(answer, allowed, first=None, limit=10):
    if answer not in allowed:
        allowed = sorted(set(allowed) | {answer})
    candidates = list(allowed)
    guess = first or opening(allowed, len(answer))
    path = []
    for _ in range(limit):
        pattern = feedback(guess, answer)
        path.append((guess, pattern))
        if guess == answer:
            break
        candidates = [w for w in candidates if feedback(guess, w) == pattern]
        guess = best_guess(candidates, allowed)
    return path


def ask_pattern(length):
    while True:
        text = input(f"Colours ({length} digits: 0 grey, 1 yellow, 2 green) or the word you played: ").strip().lower()
        if len(text) == length and set(text) <= set("012"):
            return None, text
        if len(text) == length and text.isalpha():
            return text, ask_pattern(length)[1]
        print("Try again.")


def interactive(allowed, length, tries, first):
    candidates = list(allowed)
    guess = first or opening(allowed, length)
    for turn in range(1, tries + 1):
        print(f"\nGuess {turn}: {guess.upper()}   ({len(candidates)} possible answers)")
        played, pattern = ask_pattern(length)
        guess = played or guess
        print(tiles(guess, pattern))
        if pattern == "2" * length:
            print("Solved!")
            return
        candidates = [w for w in candidates if feedback(guess, w) == pattern]
        if not candidates:
            print("No word matches those colours. Check what you typed.")
            return
        if len(candidates) <= 10:
            print("Possible:", ", ".join(w.upper() for w in candidates))
        guess = best_guess(candidates, allowed)
    print("Out of tries.")


def todays_answer(date):
    data = fetch_json(API_URL.format(date.isoformat()))
    return data["solution"].lower(), data.get("days_since_launch")


def main():
    parser = argparse.ArgumentParser(description="Get today's Wordle answer, or get help solving any Wordle.")
    parser.add_argument("--date", help="puzzle date as YYYY-MM-DD (default: today)")
    parser.add_argument("--play", action="store_true", help="helper mode: type the colours you get and it suggests guesses")
    parser.add_argument("--step", action="store_true", help="reveal the solving path one row at a time (press Enter)")
    parser.add_argument("--no-browser", action="store_true", help="don't open Wordle in the browser")
    parser.add_argument("--words", default=os.path.join(HERE, "wordle_words.txt"))
    parser.add_argument("--length", type=int, default=5)
    parser.add_argument("--first", help="opening guess")
    parser.add_argument("--tries", type=int, default=6)
    args = parser.parse_args()
    if os.name == "nt":
        os.system("")

    allowed = load_words(args.words, args.length)
    if args.play:
        interactive(allowed, args.length, args.tries, args.first)
        return

    date = datetime.date.fromisoformat(args.date) if args.date else datetime.date.today()
    try:
        answer, number = todays_answer(date)
    except Exception as error:
        print(f"Could not get the answer from the New York Times ({error}).")
        print("Switching to helper mode instead.\n")
        interactive(allowed, args.length, args.tries, args.first)
        return

    title = f"Wordle {number}" if number is not None else "Wordle"
    print(f"\n{title} · {date.strftime('%A %d %B %Y')}\n")
    for guess, pattern in solve_path(answer, allowed, args.first):
        if args.step and guess != answer:
            input(tiles(guess, pattern) + "   (Enter for the next row)")
        else:
            print(tiles(guess, pattern))
    print(f"\nAnswer: {answer.upper()}")
    if copy_to_clipboard(answer):
        print("Copied to the clipboard.")
    if not args.no_browser:
        webbrowser.open(WORDLE_URL)


if __name__ == "__main__":
    try:
        main()
    except (KeyboardInterrupt, EOFError):
        print()
        sys.exit(0)
