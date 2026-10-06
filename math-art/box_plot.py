import argparse
import csv

import matplotlib.pyplot as plt

from common import finish


def median(values):
    n = len(values)
    mid = n // 2
    return values[mid] if n % 2 else (values[mid - 1] + values[mid]) / 2


def five_numbers(data):
    values = sorted(data)
    n = len(values)
    lower = values[: n // 2]
    upper = values[(n + 1) // 2:]
    return (values[0], median(lower) if lower else values[0], median(values),
            median(upper) if upper else values[-1], values[-1])


def read_columns(path):
    with open(path, newline="") as f:
        rows = list(csv.reader(f))
    columns = {}
    for i, name in enumerate(rows[0]):
        values = [float(r[i]) for r in rows[1:] if i < len(r) and r[i].strip()]
        if values:
            columns[name] = values
    return columns


def main():
    parser = argparse.ArgumentParser(description="Box plots with the five-number summary marked.")
    parser.add_argument("csv", nargs="?", help="CSV file, one column per group with a header row")
    parser.add_argument("--group", nargs="+", action="append", metavar="NAME VALUE",
                        help="inline data, e.g. --group Boys 1 2 3 --group Girls 2 4 5")
    parser.add_argument("--xlabel", default="Value")
    parser.add_argument("--save")
    args = parser.parse_args()

    if args.csv:
        groups = read_columns(args.csv)
    elif args.group:
        groups = {g[0]: [float(v) for v in g[1:]] for g in args.group}
    else:
        parser.error("give a CSV file or at least one --group")

    colors = ("black", "green", "red", "blue", "purple")
    labels = ("Min", "Q1", "Median", "Q3", "Max")
    fig, axes = plt.subplots(1, len(groups), figsize=(7 * len(groups), 4), squeeze=False)
    for ax, (name, data) in zip(axes[0], groups.items()):
        summary = five_numbers(data)
        print(name, dict(zip(labels, summary)))
        ax.boxplot(data, orientation="horizontal")
        for value, color, label in zip(summary, colors, labels):
            ax.axvline(value, color=color, linestyle="--", label=f"{label} = {value:g}")
        ax.set_title(name)
        ax.set_xlabel(args.xlabel)
        ax.legend(loc="lower right")
    fig.tight_layout()
    finish(fig, args.save)


if __name__ == "__main__":
    main()
