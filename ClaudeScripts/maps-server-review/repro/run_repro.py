import os
import re
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
IGNORED = shutil.ignore_patterns("target", ".git", "result", "assets")
RESULT_LINE = re.compile(r"^test repro::(\w+) \.\.\. (ok|FAILED)$")
SECTION = re.compile(r"^---- repro::(\w+) stdout ----$")
PANIC = re.compile(r"^thread '([^']*)' \([^)]*\) panicked at ([^:]+:\d+):\d+:$|^thread '([^']*)' panicked at ([^:]+:\d+):\d+:$")


def has_own_tests(source):
    return os.path.isfile(os.path.join(source, "src", "repro.rs"))


def prepare(source):
    work = tempfile.mkdtemp(prefix="maps-server-repro-")
    project = os.path.join(work, "maps-server")
    shutil.copytree(source, project, ignore=IGNORED)
    if has_own_tests(source):
        return project
    shutil.copy(os.path.join(HERE, "repro.rs"), os.path.join(project, "src", "repro.rs"))
    with open(os.path.join(project, "src", "main.rs"), "a", encoding="utf-8") as f:
        f.write("\n#[cfg(test)]\nmod repro;\n")
    os.makedirs(os.path.join(project, "assets"))
    shutil.copy(os.path.join(HERE, "fixture.osm.pbf"), os.path.join(project, "assets", "fixture.osm.pbf"))
    return project


def panics(output):
    found = {}
    current = None
    lines = output.splitlines()
    for index, line in enumerate(lines):
        section = SECTION.match(line)
        if section:
            current = section.group(1)
            found[current] = []
            continue
        if line.startswith("failures:") or line.startswith("test result:"):
            current = None
        panic = PANIC.match(line)
        if current and panic:
            thread = panic.group(1) or panic.group(3)
            place = panic.group(2) or panic.group(4)
            message = lines[index + 1].strip() if index + 1 < len(lines) else ""
            who = "server" if "repro::" not in thread else "test"
            found[current].append(who + " at " + place + ": " + message)
    return found


def main():
    if len(sys.argv) != 2:
        print("Usage: python3 run_repro.py /path/to/maps-server")
        sys.exit(2)
    source = os.path.abspath(sys.argv[1])
    if not os.path.isfile(os.path.join(source, "src", "main.rs")):
        print(source + " is not a maps-server checkout (there is no src/main.rs).")
        sys.exit(2)
    if shutil.which("cargo") is None:
        print("cargo was not found. Install Rust, or run this inside `nix develop` in the maps-server folder.")
        sys.exit(2)
    own = has_own_tests(source)
    project = prepare(source)
    env = dict(os.environ, OSM_PBF_FILES="fixture.osm.pbf", REPRO_KIT=HERE, REPRO_PYTHON=sys.executable)
    if own:
        print("This checkout carries the reproduction tests itself (src/repro.rs); running them, ignored ones included.")
    print("Building a copy in " + project + " and running the reproduction tests...")
    run = subprocess.run(
        ["cargo", "test", "repro::", "--", "--include-ignored", "--test-threads=1"],
        cwd=project,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        universal_newlines=True,
    )
    log = os.path.join(project, "repro.log")
    with open(log, "w", encoding="utf-8") as f:
        f.write(run.stdout)
    results = [m.groups() for m in map(RESULT_LINE.match, run.stdout.splitlines()) if m]
    if not results:
        print(run.stdout[-3000:])
        print("No test results. The copy did not build; the full log is in " + log)
        sys.exit(1)
    details = panics(run.stdout)
    bugs = 0
    for name, outcome in results:
        if name.startswith("control_"):
            label = "control ok" if outcome == "ok" else "CONTROL FAILED"
        elif outcome == "ok":
            label = "fixed"
        else:
            label = "BUG"
            bugs += 1
        print("{:<15} {}".format(label, name))
        for detail in details.get(name, []):
            print("                  " + detail)
    print("")
    print("{} of {} checks show a bug. Full log: {}".format(bugs, len(results), log))


if __name__ == "__main__":
    main()
