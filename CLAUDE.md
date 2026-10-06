# Rules for Claude

- Put anything you create from scratch in `ClaudeScripts/`, one subfolder per project.
- `Naoise&Gabi/` holds the owners' projects. Only edit them when asked.
- Everything the owners run should be Python that works with Python 3.9 on macOS (`/usr/bin/python3`) and only needs packages from `Naoise&Gabi/requirements.txt`.
- Never add comments inside code.
- Keep `index.html` at the root: it is the GitHub Pages hello page.
- After adding, removing or renaming files, regenerate `files.txt` with `git ls-files > files.txt` (it is what `ClaudeScripts/update.py` downloads).
