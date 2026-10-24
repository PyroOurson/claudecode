#!/bin/sh
cd "$(dirname "$0")" || exit 1
CHECK="import mujoco, stable_baselines3, torch, gymnasium"
PY=python3
if ! $PY -c "$CHECK" 2>/dev/null; then
    PY=.venv/bin/python
    if ! $PY -c "$CHECK" 2>/dev/null; then
        echo "First run: installing MuJoCo, PyTorch and Stable-Baselines3 into acra/.venv (a few minutes)..."
        if [ ! -x .venv/bin/python ] && ! python3 -m venv .venv; then
            echo "Could not create a Python environment. On Ubuntu/Debian run: sudo apt install python3-venv python3-pip"
            exit 1
        fi
        $PY -m pip install -q --upgrade pip
        $PY -m pip install -q torch --index-url https://download.pytorch.org/whl/cpu
        $PY -m pip install -q -r requirements.txt || exit 1
    fi
fi
exec $PY watch.py "$@"
