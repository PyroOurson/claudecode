# maps-server review and handoff

This folder is a review of [maps-server](https://gitlab.com/buphagidae/maps-server) at commit `51779c0`. It contains a ready-to-paste prompt for another AI and tests that prove each bug.

| File | For | What it is |
| --- | --- | --- |
| `review.md` | You | The findings, with evidence and measurements. |
| `prompt.md` | The other AI | The full handoff: context, rules, decisions, ordered tasks with acceptance tests, and feature specifications. |
| `repro/run_repro.py` | You or the AI | Runs the 19 checks on any maps-server checkout. |
| `repro/repro.rs` | The AI | The tests. They call the real code and need no Docker, Nix or network. |
| `repro/fake_plugin.py` | The tests | A scripted transit plugin. |
| `repro/fixture.osm`, `repro/fixture.osm.pbf` | The tests | A 5-node test map. |

## See the bugs yourself

You need Rust (`cargo`). Inside the maps-server folder, `nix develop` provides it.

```bash
python3 ClaudeScripts/maps-server-review/repro/run_repro.py NaoiseGabi/maps-server
```

It builds a copy in a temporary folder and prints one line per check: `BUG`, `fixed` or `control ok`. On commit `51779c0` it reports 15 bugs, and all 4 controls pass. Run it again after the other AI's changes to see what got fixed: a checkout that already carries the tests in `src/repro.rs`, as `NaoiseGabi/maps-server` now does, has them run as they are, ignored ones included. On the current version it reports 0 bugs.

What was done with this handoff, task by task, is in `report.md`.

## Hand it to another AI

1. Give the AI the maps-server repository (`NaoiseGabi/maps-server/`) and this whole folder.
2. Paste `prompt.md` as the task.
3. It will ask the owner three questions first (section 6 of the prompt). Answer them, or let it use the recommended options.
