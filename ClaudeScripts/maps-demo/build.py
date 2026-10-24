import argparse
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ENGINE = HERE / "engine"
TARGET = "wasm32-unknown-unknown"
BUILT = ENGINE / "target" / TARGET / "release" / "maps_demo_engine.wasm"


def run(command):
    print("$ " + " ".join(command), flush=True)
    subprocess.run(command, cwd=str(ENGINE), check=True)


def main():
    parser = argparse.ArgumentParser(
        description="Rebuild engine.wasm, the maps-server routing code used by the demo page."
    )
    parser.add_argument("--test", action="store_true", help="run the engine's tests before building")
    args = parser.parse_args()

    if shutil.which("cargo") is None:
        print("cargo is missing. Install Rust from https://rustup.rs, then run:")
        print("  rustup target add " + TARGET)
        return 1
    try:
        if args.test:
            run(["cargo", "test", "--release"])
        run(["cargo", "build", "--release", "--target", TARGET])
    except subprocess.CalledProcessError as error:
        print("Failed with exit code {}.".format(error.returncode))
        if "target" in " ".join(error.cmd):
            print("If the error mentions {}, run: rustup target add {}".format(TARGET, TARGET))
        return error.returncode

    shutil.copyfile(str(BUILT), str(HERE / "engine.wasm"))
    size = (HERE / "engine.wasm").stat().st_size
    print("Wrote engine.wasm ({:.0f} KB).".format(size / 1024))
    return 0


if __name__ == "__main__":
    sys.exit(main())
