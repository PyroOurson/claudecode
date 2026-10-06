import argparse
import os
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))


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
        return (sum(n * n for n in groups.values()), guess not in candidate_set)

    return min(shortlist, key=score)


def ask_pattern(length):
    while True:
        pattern = input(f"Result ({length} digits, 0=grey 1=yellow 2=green, or a word you played instead): ").strip().lower()
        if len(pattern) == length and set(pattern) <= set("012"):
            return None, pattern
        if len(pattern) == length and pattern.isalpha():
            return pattern, ask_pattern(length)[1]
        print("Try again.")


def main():
    parser = argparse.ArgumentParser(description="Interactive Wordle helper.")
    parser.add_argument("--words", default=os.path.join(HERE, "wordle_words.txt"), help="word list, one word per line")
    parser.add_argument("--length", type=int, default=5)
    parser.add_argument("--first", default=None, help="opening guess (default: computed)")
    parser.add_argument("--tries", type=int, default=6)
    args = parser.parse_args()

    allowed = load_words(args.words, args.length)
    candidates = list(allowed)
    guess = args.first or ("crane" if args.length == 5 and "crane" in allowed else best_guess(candidates, allowed))
    for turn in range(1, args.tries + 1):
        print(f"\nGuess {turn}: {guess.upper()}   ({len(candidates)} possible answers)")
        played, pattern = ask_pattern(args.length)
        guess = played or guess
        if pattern == "2" * args.length:
            print("Solved!")
            return
        candidates = [w for w in candidates if feedback(guess, w) == pattern]
        if not candidates:
            print("No word matches that feedback. Check what you typed or use a bigger word list.")
            return
        if len(candidates) <= 10:
            print("Possible:", ", ".join(candidates))
        guess = best_guess(candidates, allowed)
    print("Out of tries.")


if __name__ == "__main__":
    main()
