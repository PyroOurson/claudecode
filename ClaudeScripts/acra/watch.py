"""Run a trained ACRA policy in the MuJoCo viewer in real time.

    python watch.py                  (policy from runs/latest)
    python watch.py --run acra
    python watch.py --random         (untrained random actions, for comparison)

Keys: Up/Down change forward speed, Left/Right turn, Space pauses, R resets,
+ and - double or halve playback speed. Walking speed and the episode's
cumulative reward are printed in the terminal.
"""
from __future__ import annotations

import argparse
import sys
import time
from dataclasses import dataclass
from typing import Callable

import mujoco
import mujoco.viewer
import numpy as np

from train import VX_RANGE, WZ_RANGE, AcraEnv, resolve_run

KEY_UP, KEY_DOWN, KEY_LEFT, KEY_RIGHT = 265, 264, 263, 262
KEY_SPACE, KEY_R = 32, 82
KEYS_FASTER = (61, 334)
KEYS_SLOWER = (45, 333)
VX_STEP = 0.1
WZ_STEP = 0.2


@dataclass
class Controls:
    """State changed by the viewer's key callback and read by the simulation loop."""

    vx: float = 0.0
    wz: float = 0.0
    paused: bool = False
    reset: bool = False
    speed: float = 1.0

    def on_key(self, key: int) -> None:
        """Map a GLFW key code to a command, pause, reset or playback-speed change."""
        if key == KEY_UP:
            self.vx = min(self.vx + VX_STEP, VX_RANGE[1])
        elif key == KEY_DOWN:
            self.vx = max(self.vx - VX_STEP, VX_RANGE[0])
        elif key == KEY_LEFT:
            self.wz = min(self.wz + WZ_STEP, WZ_RANGE[1])
        elif key == KEY_RIGHT:
            self.wz = max(self.wz - WZ_STEP, WZ_RANGE[0])
        elif key == KEY_SPACE:
            self.paused = not self.paused
        elif key == KEY_R:
            self.reset = True
        elif key in KEYS_FASTER:
            self.speed = min(self.speed * 2.0, 8.0)
        elif key in KEYS_SLOWER:
            self.speed = max(self.speed / 2.0, 0.125)


def load_policy(run: str, env: AcraEnv) -> Callable[[np.ndarray], np.ndarray]:
    """Load PPO weights and observation statistics from a run; returns obs -> action."""
    from stable_baselines3 import PPO
    from stable_baselines3.common.vec_env import DummyVecEnv, VecNormalize

    path = resolve_run(run)
    model = PPO.load(str(path / "policy.zip"), device="cpu")
    norm = VecNormalize.load(str(path / "vecnormalize.pkl"), DummyVecEnv([AcraEnv]))
    norm.training = False
    print(f"loaded policy from {path}")
    return lambda obs: model.predict(norm.normalize_obs(obs), deterministic=True)[0]


def parse_args() -> argparse.Namespace:
    """Command-line flags."""
    p = argparse.ArgumentParser(description="Watch ACRA walk.")
    p.add_argument("--run", default=None, help="run name under runs/ (default: runs/latest)")
    p.add_argument("--random", action="store_true", help="use random actions instead of a trained policy")
    return p.parse_args()


def main() -> None:
    """Open the passive viewer and step the policy at real-time pace until the window closes."""
    args = parse_args()
    ctl = Controls()
    env = AcraEnv(command=(0.0, 0.0), max_steps=10**9)
    if args.random:
        policy = lambda obs: env.action_space.sample()
    else:
        policy = load_policy(args.run, env)
    obs, _ = env.reset(seed=0)
    episode_return, last_print = 0.0, 0.0
    speed_avg = 0.0

    with mujoco.viewer.launch_passive(env.model, env.data, key_callback=ctl.on_key) as viewer:
        viewer.cam.type = mujoco.mjtCamera.mjCAMERA_TRACKING
        viewer.cam.trackbodyid = env.model.body("torso").id
        viewer.cam.distance, viewer.cam.elevation, viewer.cam.azimuth = 1.6, -20.0, 120.0
        while viewer.is_running():
            tick = time.perf_counter()
            if ctl.reset:
                obs, _ = env.reset()
                episode_return, ctl.reset = 0.0, False
            if not ctl.paused:
                env.set_command(ctl.vx, ctl.wz)
                obs, reward, fell, _, info = env.step(policy(obs))
                episode_return += reward
                speed_avg += 0.1 * (info["forward_speed"] - speed_avg)
                if fell:
                    print(f"\nfell after {env.steps * env.dt:.1f}s, return {episode_return:.1f}; resetting")
                    obs, _ = env.reset()
                    episode_return = 0.0
            viewer.sync()
            if tick - last_print > 0.25:
                state = "PAUSED" if ctl.paused else f"x{ctl.speed:g}"
                sys.stdout.write(f"\rcmd vx {ctl.vx:+.2f} m/s wz {ctl.wz:+.2f} rad/s | speed {speed_avg:+.3f} m/s "
                                 f"| return {episode_return:8.1f} | t {env.steps * env.dt:6.1f}s | {state}   ")
                sys.stdout.flush()
                last_print = tick
            time.sleep(max(0.0, env.dt / ctl.speed - (time.perf_counter() - tick)))
    print()


if __name__ == "__main__":
    main()
