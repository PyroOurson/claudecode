# claudecode

| Folder | Contents |
| --- | --- |
| [`NaoiseGabi/`](NaoiseGabi/) | Our Python projects: games, solvers and art. See its README. |
| [`ClaudeScripts/`](ClaudeScripts/) | Everything Claude makes from scratch, including `update.py`. |

## Get the latest version

From inside the `claudecode` folder:

```bash
python ClaudeScripts/update.py
```

It downloads only what changed and removes files that were deleted on GitHub. Your Snake high score and Wordello progress are stored in your home folder, so updating never erases them.

`index.html` at the root is the hello page served at https://pyroourson.github.io/claudecode/. GitHub Pages needs it at the root; its source copy lives in `ClaudeScripts/hello-page/`.
