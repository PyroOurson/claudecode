"""Gymnasium environment for the ACRA quadruped and PPO training entry point.

    python train.py --steps 40000000 --envs 24 --seed 0
    python train.py --resume            (continue from runs/latest)
    python train.py --resume 20261024-153000 --steps 1000000

Each run writes checkpoints, CSV logs, the final policy, the observation
normaliser and a summary into runs/<timestamp>/, and runs/latest (a text file
holding the run name) is pointed at it.
"""
from __future__ import annotations

import argparse
import zipfile
import functools
import json
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

import gymnasium as gym
import mujoco
import numpy as np
from gymnasium import spaces

HERE = Path(__file__).resolve().parent
MODEL_PATH = HERE / "acra.xml"
MESHES_PATH = HERE / "meshes.zip"
RUNS_DIR = HERE / "runs"
LATEST_FILE = RUNS_DIR / "latest"

VX_RANGE = (-0.3, 0.7)
WZ_RANGE = (-1.0, 1.0)


@dataclass
class RewardWeights:
    """Weights of each reward term, applied once per control step."""

    track_vx: float = 1.5
    track_wz: float = 0.5
    upright: float = 0.3
    alive: float = 0.2
    energy: float = 0.002
    action_rate: float = 0.02
    lateral: float = 0.5
    gait: float = 0.4
    spine_wave: float = 0.3
    clearance: float = 0.3
    slip: float = 1.0
    body_rock: float = 0.02


def load_model() -> mujoco.MjModel:
    """Compile acra.xml with its STL meshes read straight out of meshes.zip."""
    with zipfile.ZipFile(MESHES_PATH) as z:
        assets = {name: z.read(name) for name in z.namelist()}
    return mujoco.MjModel.from_xml_string(MODEL_PATH.read_text(), assets)


def heading_free_quat(q: np.ndarray) -> np.ndarray:
    """Torso quaternion (w, x, y, z) with its yaw removed, so the policy is heading invariant."""
    w, x, y, z = q
    yaw = np.arctan2(2.0 * (w * z + x * y), 1.0 - 2.0 * (y * y + z * z))
    unyaw = np.array([np.cos(yaw / 2), 0.0, 0.0, -np.sin(yaw / 2)])
    out = np.zeros(4)
    mujoco.mju_mulQuat(out, unyaw, q)
    return out


class AcraEnv(gym.Env):
    """ACRA lizard walking task: track a commanded forward speed and yaw rate with a lizard gait.

    A gait clock drives a lizard walking trot: the diagonal pairs FL+RR and
    FR+RL alternate stance, the step rate rises with commanded speed, and the
    spine yaw follows a standing wave timed so the body bend lengthens each
    stance stroke, plus a steady bend into turns. Swinging feet are rewarded
    for lifting to SWING_HEIGHT and planted feet are penalised for slipping.
    The gait terms are soft and only active while a motion is commanded.
    Without a fixed command, a new random command is drawn every 3-8 s.

    Observation (44): joint positions relative to the neutral pose (10), joint
    velocities (10), heading-free torso quaternion (4), torso angular velocity
    (3), torso linear velocity in the body frame (3), previous action (10),
    the command (forward velocity, yaw rate) (2) and the gait clock (sin, cos) (2).
    Action (10): target joint positions, neutral + per-joint scale * action.
    """

    FEET = ("FL_foot", "FR_foot", "RL_foot", "RR_foot")
    DIAGONAL_A = np.array([True, False, False, True])
    SPINE_AMPLITUDE = 0.25
    SPINE_TURN = 0.2
    SWING_HEIGHT = 0.035
    FOOT_R = 0.02

    metadata = {"render_modes": []}

    def __init__(
        self,
        command: Optional[Tuple[float, float]] = None,
        frame_skip: int = 10,
        action_scale: float = 0.6,
        max_steps: int = 1000,
        min_height: float = 0.06,
        min_upright: float = 0.2,
        weights: Optional[RewardWeights] = None,
    ) -> None:
        self.model = load_model()
        self.data = mujoco.MjData(self.model)
        self.fixed_command = command
        self.frame_skip = frame_skip
        self.action_scale = np.full(self.model.nu, action_scale)
        self.spine = self.model.actuator("spine_yaw").id
        self.action_scale[self.spine] = 0.4
        self.feet = np.array([self.model.geom(n).id for n in self.FEET])
        self.phase = 0.0
        self.next_command = 0
        self.prev_feet_xy = np.zeros((4, 2))
        self.max_steps = max_steps
        self.min_height = min_height
        self.min_upright = min_upright
        self.w = weights or RewardWeights()
        self.dt = self.model.opt.timestep * frame_skip
        self.neutral = self.model.key_ctrl[0].copy()
        self.ctrl_low, self.ctrl_high = self.model.actuator_ctrlrange.T.copy()
        nu = self.model.nu
        self.action_space = spaces.Box(-1.0, 1.0, (nu,), np.float32)
        self.observation_space = spaces.Box(-np.inf, np.inf, (3 * nu + 14,), np.float32)
        self.command = np.zeros(2)
        self.prev_action = np.zeros(nu)
        self.steps = 0

    def set_command(self, vx: float, wz: float) -> None:
        """Change the commanded forward velocity (m/s) and yaw rate (rad/s) mid-episode."""
        self.command[:] = (vx, wz)

    def _sample_command(self) -> np.ndarray:
        """Fixed command if one was given, otherwise a random one (10% of episodes stand still)."""
        if self.fixed_command is not None:
            return np.array(self.fixed_command, dtype=float)
        if self.np_random.random() < 0.1:
            return np.zeros(2)
        return np.array([self.np_random.uniform(*VX_RANGE), self.np_random.uniform(*WZ_RANGE)])

    def _sensor(self, name: str) -> np.ndarray:
        """Current reading of a named MJCF sensor."""
        return self.data.sensor(name).data

    def _obs(self) -> np.ndarray:
        """Assemble the observation vector described in the class docstring."""
        d = self.data
        return np.concatenate([
            d.qpos[7:] - self.neutral,
            d.qvel[6:],
            heading_free_quat(self._sensor("torso_quat")),
            self._sensor("torso_gyro"),
            self._sensor("torso_vel"),
            self.prev_action,
            self.command,
            [np.sin(2 * np.pi * self.phase), np.cos(2 * np.pi * self.phase)],
        ]).astype(np.float32)

    def foot_contacts(self) -> np.ndarray:
        """Which feet (FL, FR, RL, RR) currently touch the ground."""
        touching = self.data.contact.geom.ravel()
        return np.isin(self.feet, touching)

    def gait_hz(self) -> float:
        """Step rate of the gait clock: faster strides at higher commanded speed or turn rate."""
        return min(2.8, 1.4 + 1.6 * abs(self.command[0]) + 0.6 * abs(self.command[1]))

    def foot_heights(self) -> np.ndarray:
        """Height of the bottom of each foot pad above the ground."""
        return self.data.geom_xpos[self.feet, 2] - self.FOOT_R

    def gait_targets(self) -> Tuple[np.ndarray, float, float]:
        """Desired foot contacts, spine yaw and how strongly the gait applies (0 standing, 1 walking)."""
        drive = min(1.0, abs(self.command[0]) / 0.3 + abs(self.command[1]) / 0.6)
        if drive < 0.15:
            return np.ones(4, dtype=bool), 0.0, 0.0
        stance_a = np.sin(2 * np.pi * self.phase) > 0
        contacts = self.DIAGONAL_A if stance_a else ~self.DIAGONAL_A
        spine = -self.SPINE_AMPLITUDE * drive * np.cos(2 * np.pi * self.phase) - self.SPINE_TURN * self.command[1]
        return contacts, spine, drive

    def upright(self) -> float:
        """World z component of the torso's up axis: 1 upright, 0 on its side, -1 flipped."""
        return float(self.data.xmat[1][8])

    def forward_speed(self) -> float:
        """Torso velocity along its own forward axis (m/s)."""
        return float(self._sensor("torso_vel")[0])

    def reset(self, *, seed: Optional[int] = None, options: Optional[Dict[str, Any]] = None) -> Tuple[np.ndarray, Dict[str, Any]]:
        """Stand in the keyframe pose with small joint noise and draw a new command."""
        super().reset(seed=seed)
        mujoco.mj_resetDataKeyframe(self.model, self.data, 0)
        nj = self.model.nu
        self.data.qpos[7:] += self.np_random.uniform(-0.05, 0.05, nj)
        self.data.qvel[:] = self.np_random.normal(0.0, 0.05, self.model.nv)
        mujoco.mj_forward(self.model, self.data)
        self.command = self._sample_command()
        self.prev_action = np.zeros(nj)
        self.phase = float(self.np_random.random())
        self.next_command = int(self.np_random.integers(150, 400))
        self.prev_feet_xy = self.data.geom_xpos[self.feet, :2].copy()
        self.steps = 0
        return self._obs(), {}

    def _reward(self, action: np.ndarray) -> Tuple[float, Dict[str, float]]:
        """Weighted sum of tracking, posture, gait and alive terms minus energy, jerk and drift penalties."""
        vel = self._sensor("torso_vel")
        wz = self._sensor("torso_gyro")[2]
        want_contacts, want_spine, drive = self.gait_targets()
        spine_err = self.data.qpos[7 + self.spine] - want_spine
        contacts = self.foot_contacts()
        feet_xy = self.data.geom_xpos[self.feet, :2]
        slip = np.sum(np.sum((feet_xy - self.prev_feet_xy) ** 2, axis=1) / self.dt ** 2 * contacts)
        self.prev_feet_xy = feet_xy.copy()
        swing = ~want_contacts
        lift = np.exp(-(((self.foot_heights() - self.SWING_HEIGHT) / 0.015) ** 2))
        gyro = self._sensor("torso_gyro")
        terms = {
            "gait": float(np.mean(contacts == want_contacts)),
            "spine_wave": drive * np.exp(-(spine_err ** 2) / 0.02),
            "clearance": drive * float(np.sum(lift * swing) / max(1, np.sum(swing))),
            "slip": -float(slip),
            "body_rock": -float(gyro[0] ** 2 + gyro[1] ** 2),
            "track_vx": np.exp(-((vel[0] - self.command[0]) ** 2) / 0.02),
            "track_wz": np.exp(-((wz - self.command[1]) ** 2) / 0.1),
            "upright": self.upright(),
            "alive": 1.0,
            "energy": -float(np.sum(np.abs(self.data.actuator_force * self.data.actuator_velocity))),
            "action_rate": -float(np.sum((action - self.prev_action) ** 2)),
            "lateral": -float(vel[1] ** 2),
        }
        terms = {k: float(v) * getattr(self.w, k) for k, v in terms.items()}
        return sum(terms.values()), terms

    def step(self, action: np.ndarray) -> Tuple[np.ndarray, float, bool, bool, Dict[str, Any]]:
        """Apply joint targets for frame_skip physics steps and score the result."""
        action = np.clip(np.asarray(action, dtype=float), -1.0, 1.0)
        target = self.neutral + self.action_scale * action
        self.data.ctrl[:] = np.clip(target, self.ctrl_low, self.ctrl_high)
        mujoco.mj_step(self.model, self.data, nstep=self.frame_skip)
        self.phase = (self.phase + self.dt * self.gait_hz()) % 1.0
        self.steps += 1
        if self.fixed_command is None and self.steps >= self.next_command:
            self.command = self._sample_command()
            self.next_command = self.steps + int(self.np_random.integers(150, 400))
        reward, terms = self._reward(action)
        self.prev_action = action
        fell = self.data.qpos[2] < self.min_height or self.upright() < self.min_upright
        truncated = self.steps >= self.max_steps
        info = {"terms": terms, "forward_speed": self.forward_speed(), "command": self.command.copy()}
        return self._obs(), reward, bool(fell), bool(truncated), info


def resolve_run(name: Optional[str]) -> Path:
    """Run directory for a name, or the one runs/latest points at when name is None or 'latest'."""
    if name in (None, "latest"):
        if not LATEST_FILE.exists():
            raise FileNotFoundError("no runs/latest yet; train first or pass a run name")
        name = LATEST_FILE.read_text().strip()
    path = Path(name) if Path(name).is_dir() else RUNS_DIR / name
    if not path.is_dir():
        raise FileNotFoundError(f"run not found: {path}")
    return path


def make_env(seed: int) -> gym.Env:
    """Factory used by the vectorised envs; seeds each copy differently."""
    env = AcraEnv()
    env.reset(seed=seed)
    return env


def evaluate(policy: Any, norm: Any, command: Tuple[float, float], seconds: float = 10.0) -> Dict[str, float]:
    """Run the deterministic policy for a fixed command and report mean speed, yaw rate, return and survival."""
    env = AcraEnv(command=command, max_steps=int(seconds / 0.02))
    obs, _ = env.reset(seed=123)
    total, speeds, yaws, steps, fell = 0.0, [], [], 0, False
    for _ in range(env.max_steps):
        action, _ = policy.predict(norm.normalize_obs(obs), deterministic=True)
        obs, r, fell, trunc, info = env.step(action)
        total += r
        speeds.append(info["forward_speed"])
        yaws.append(float(env.data.sensor("torso_gyro").data[2]))
        steps += 1
        if fell or trunc:
            break
    return {"command_vx": command[0], "command_wz": command[1], "mean_speed": float(np.mean(speeds)),
            "mean_yaw_rate": float(np.mean(yaws)), "return": total, "steps": steps, "fell": bool(fell)}


def linear_lr(progress_remaining: float) -> float:
    """PPO learning rate: 3e-4 at the start, decaying linearly to 3e-5 at the end of training."""
    return 3e-5 + 2.7e-4 * progress_remaining


def parse_args() -> argparse.Namespace:
    """Command-line flags."""
    p = argparse.ArgumentParser(description="Train ACRA to walk with PPO.")
    p.add_argument("--steps", type=int, default=40_000_000, help="environment steps to train for")
    p.add_argument("--seed", type=int, default=0)
    p.add_argument("--envs", type=int, default=24, help="parallel environments (subprocesses when > 1)")
    p.add_argument("--resume", nargs="?", const="latest", default=None, help="continue from a run (default: latest)")
    p.add_argument("--checkpoint-every", type=int, default=200_000, help="steps between checkpoints")
    return p.parse_args()


def main() -> None:
    """Build vectorised envs, train or resume PPO, save everything and point runs/latest at the run."""
    import torch
    from stable_baselines3 import PPO
    from stable_baselines3.common.callbacks import CheckpointCallback
    from stable_baselines3.common.logger import configure
    from stable_baselines3.common.vec_env import DummyVecEnv, SubprocVecEnv, VecMonitor, VecNormalize

    args = parse_args()
    run_dir = RUNS_DIR / time.strftime("%Y%m%d-%H%M%S")
    run_dir.mkdir(parents=True, exist_ok=True)
    fns = [functools.partial(make_env, args.seed + i) for i in range(args.envs)]
    venv = VecMonitor(SubprocVecEnv(fns) if args.envs > 1 else DummyVecEnv(fns))

    if args.resume:
        src = resolve_run(args.resume)
        env = VecNormalize.load(str(src / "vecnormalize.pkl"), venv)
        model = PPO.load(str(src / "policy.zip"), env=env, device="cpu")
        print(f"resumed from {src.name} at {model.num_timesteps} steps")
    else:
        env = VecNormalize(venv, norm_obs=True, norm_reward=True, clip_obs=10.0, gamma=0.99)
        model = PPO(
            "MlpPolicy", env, seed=args.seed, device="cpu",
            n_steps=1024, batch_size=4096, n_epochs=5, learning_rate=linear_lr,
            gamma=0.99, gae_lambda=0.95, clip_range=0.2, ent_coef=0.0, max_grad_norm=1.0, target_kl=0.03,
            policy_kwargs={"net_arch": {"pi": [256, 256], "vf": [256, 256]},
                           "activation_fn": torch.nn.ELU, "log_std_init": -1.0},
        )
    model.set_logger(configure(str(run_dir / "logs"), ["stdout", "csv"]))
    (run_dir / "config.json").write_text(json.dumps({**vars(args), "weights": asdict(RewardWeights())}, indent=2))

    checkpoints = CheckpointCallback(
        save_freq=max(args.checkpoint_every // args.envs, 1), save_path=str(run_dir / "checkpoints"),
        name_prefix="ppo", save_vecnormalize=True,
    )
    start = time.time()
    model.learn(total_timesteps=args.steps, callback=checkpoints, reset_num_timesteps=not args.resume)
    elapsed = time.time() - start

    model.save(str(run_dir / "policy.zip"))
    env.save(str(run_dir / "vecnormalize.pkl"))
    LATEST_FILE.write_text(run_dir.name)
    env.training = False

    episodes = list(model.ep_info_buffer)
    summary = {
        "run": run_dir.name,
        "total_timesteps": int(model.num_timesteps),
        "wall_seconds": round(elapsed, 1),
        "steps_per_second": round(args.steps / max(elapsed, 1e-9), 1),
        "recent_episode_return": float(np.mean([e["r"] for e in episodes])) if episodes else None,
        "recent_episode_length": float(np.mean([e["l"] for e in episodes])) if episodes else None,
        "eval": [evaluate(model, env, c) for c in ((0.3, 0.0), (0.6, 0.0), (0.0, 0.0), (0.3, 0.6), (0.0, 1.0), (-0.3, 0.0))],
    }
    (run_dir / "summary.json").write_text(json.dumps(summary, indent=2))
    print(json.dumps(summary, indent=2))
    env.close()


if __name__ == "__main__":
    main()
