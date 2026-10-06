import argparse
from math import prod


def fibonacci(n):
    def pair(k):
        if k == 0:
            return 0, 1
        a, b = pair(k >> 1)
        c = a * (2 * b - a)
        d = a * a + b * b
        return (d, c + d) if k & 1 else (c, d)
    return pair(n)[0]


def persistence(n):
    steps = 0
    while n >= 10:
        n = prod(int(d) for d in str(n))
        steps += 1
    return steps


def most_persistent(limit):
    best, record = 0, -1
    for n in range(limit + 1):
        p = persistence(n)
        if p > record:
            best, record = n, p
            print(f"{n} needs {p} steps")
    return best, record


def is_prime(n):
    if n < 2:
        return False
    for p in (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37):
        if n % p == 0:
            return n == p
    d, s = n - 1, 0
    while d % 2 == 0:
        d //= 2
        s += 1
    for a in (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37):
        x = pow(a, d, n)
        if x in (1, n - 1):
            continue
        for _ in range(s - 1):
            x = x * x % n
            if x == n - 1:
                break
        else:
            return False
    return True


def main():
    parser = argparse.ArgumentParser(description="Small number theory tools.")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("fib", help="n-th Fibonacci number").add_argument("n", type=int)
    sub.add_parser("persistence", help="multiplicative persistence of n").add_argument("n", type=int)
    sub.add_parser("record", help="most persistent number up to n").add_argument("n", type=int)
    sub.add_parser("prime", help="is n prime?").add_argument("n", type=int)
    args = parser.parse_args()

    if args.command == "fib":
        print(fibonacci(args.n))
    elif args.command == "persistence":
        print(persistence(args.n))
    elif args.command == "record":
        print(most_persistent(args.n))
    else:
        print(is_prime(args.n))


if __name__ == "__main__":
    main()
