# Typing bot: handoff for a fresh session

## What the owner wants
- A Python script that types typing.com tests automatically.
- Browser: Google Chrome (keep a `BROWSER` setting so Safari/Brave/Edge can be picked).
- Speed: 120 wpm by default.
- It waits until the test text appears, types it, and stops by itself when the test is finished.
- Must work for every test type: 1, 3, 5 minute tests and 1, 3, 5 page tests.
- All settings (browser, wpm, stop timings...) grouped at the top of the file so they are all visible at once.
- File: `ClaudeScripts/typing-bot/typer.py` on branch `claude/typing-automation-script-46lx0r` (draft PR PyroOurson/claudecode#1).

## The owner's Mac (hard limits)
- School-managed Mac (Jamf), macOS 15.5, Apple M4. No admin, no sudo, cannot install apps.
- Cannot grant Accessibility permission, so `System Events` keystrokes (real OS key presses) are NOT possible.
- Runs `/usr/bin/python3` (3.9). Standard library only, plus the packages in `NaoiseGabi/requirements.txt`.
- `osascript` works. Chrome "View > Developer > Allow JavaScript from Apple Events" is now ON in the profile used for typing.com.
- GitHub raw files are cached by the school network: always give download links pinned to a commit hash and verify with `shasum -a 256`.
- The owner wants one copy-paste Terminal command for every step (download, verify, run).

## How the current script works
- Python uses `osascript` to find the Chrome tab whose URL contains `typing.com` (any window) and runs JavaScript in it.
- The injected JavaScript finds the letters, finds the active one, and sends it as synthetic keyboard events at the target speed, then reports status back to Python.
- Stop conditions: letters disappear, the cursor stops advancing, or no new text for `STOP_AFTER_IDLE_SECONDS`.

## What was learned on the real typing.com page (1-minute test)
Output of the script's debug dump:
```
"count": 1655,
"active": 0,
"focused": "<input class=\"js-input-box\">",
"first": [
  "<div class=\"letter letter--basic screenBasic-letter     is-active\"> \"U\"",
  "<div class=\"letter letter--basic screenBasic-letter    \"> \"s\"", ...
],
"inputs": ["<input class=\"js-input-box\">"]
```
- Letter detection is correct: `.screenBasic-letter`, current letter has `is-active`.
- The page focuses a hidden `<input class="js-input-box">` that receives the typing.
- Sending synthetic `keydown`/`keypress`/`keyup` to that input plus `document.execCommand('insertText')` did NOT move the cursor.

## Next things to try (in order)
1. On `.js-input-box`: set the value with the native setter (`Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set`) then dispatch `input` (InputEvent with `data` and `inputType: 'insertText'`), with and without the key events around it.
2. Dispatch `beforeinput`/`textInput` events, and `keydown` with `code` set (e.g. `KeyU`, `Space`) in case the page reads `e.code`.
3. If needed, ask the owner to run `getEventListeners(document.querySelector('.js-input-box'))` in the Chrome DevTools Console and paste the result, to see which events the page listens to.
4. If the page checks `event.isTrusted`, typing from JavaScript cannot work and, without Accessibility permission, there is no other way on this Mac. Say so plainly.
- Add a quick probe mode to the script that tries each method on one letter and reports which one advanced `is-active`, so one run tells which method works. DONE, see below.

## Probe mode (added)
- Run `python3 typer.py probe` with a typing.com test open on its start screen.
- It brings the browser to the front, then tries every method in `METHODS_JS` (`keys`, `keys_code`, `value_input`, `keys_value_input`, `beforeinput_value_input`, `textinput`, `value_change`, `keys_document`, `keys_body`, `jquery_keys`, `jquery_keys_value_input`) on the current letter, waits `PROBE_WAIT_PER_METHOD_SECONDS`, and prints WORKS/no for each.
- It also prints page details: whether the page has focus, jQuery version, and which jQuery/React/`on*` handlers are visible on the input, document, window and body.
- The normal typing mode now uses `TYPE_METHOD` (setting at the top) to pick the method. Once the probe names a working one, set it there.
- Tested in headless Chromium against mock pages (input-event driven, keypress-with-code driven, isTrusted-only): the probe picked the right methods in each case.
- If nothing works and the page details show nothing useful, go to step 3 above (`getEventListeners`) and then step 4.

## First probe run on the real page
- Every method: no. No jQuery, no React/Vue props or `on*` handlers visible on the input, document, window or body (so listeners are added with `addEventListener`, likely by a bundled framework).
- `document.hasFocus()` was false even after `activate` of Chrome. The probe now waits up to `PROBE_WAIT_FOR_CLICK_SECONDS` for the owner to click on the test so the page has focus, and prints focus per method.
- In parallel the owner was asked to run a DevTools Console snippet that lists the key/input listeners on the input, document, window and body and whether their source mentions `isTrusted`.

## Second probe run (page focused)
- Still no method moved the cursor, even with `document.hasFocus()` true. Strong sign the page checks `event.isTrusted`.
- The owner cannot easily use the DevTools Console (pasted the snippet into Terminal), so a `scan` mode was added instead: `python3 typer.py scan` reads the URLs of all scripts the page loaded (script tags plus `performance` resource entries), downloads them from Python, and prints counts of `isTrusted`, `keydown`, `keypress`, `beforeinput`, `js-input-box` per script plus the code around each `isTrusted`.
- If the scan shows `isTrusted` checks in the typing code, script typing is impossible on this Mac without Accessibility permission: tell the owner plainly.

## Result of the probes: switched to Chrome remote control (current design)
- Both probe runs: no in-page JavaScript method moved the cursor, even with the page focused. typing.com only accepts trusted (real) key events.
- Sandbox cannot reach typing.com (network policy blocks it), and the owner's Desktop Commander device is offline, so the real page cannot be tested from Claude's side.
- New `typer.py` (old osascript/probe/scan code removed): launches the browser itself with `--remote-debugging-port=DEBUG_PORT --user-data-dir=PROFILE_DIR` (a separate profile in `~/typing-bot/chrome-profile`, needed since Chrome 136, no admin needed), finds the tab whose URL contains `SITE`, reads the active letter with `Runtime.evaluate`, clicks it with `Input.dispatchMouseEvent`, focuses `.js-input-box`, and types with `Input.dispatchKeyEvent` (trusted events: keydown/keypress/input all have `isTrusted: true`).
- WebSocket client is written with the standard library (no websocket package in requirements). Local HTTP calls bypass any system proxy.
- After each key it waits up to `WAIT_FOR_KEY_ACCEPTED_SECONDS` for the active letter to move before the next key, so a slow re-render never causes a double letter. Stops when the letters disappear, after `STOP_AFTER_STUCK_KEYS` unaccepted keys (timed test over), or after `STOP_AFTER_IDLE_SECONDS` with no new text.
- Tested in headless Chromium 141 against mock pages that ignore untrusted events (keydown-only, input-only, delayed re-render, 2-page test, 3-second timed test): 78/78 characters, 0 errors, 117 wpm at WPM 120 and 192 wpm at WPM 200; the timed test stops by itself.
- Remaining risk: the school may set the Chrome policy `RemoteDebuggingAllowed` to false. Then the port never opens, the script says so, and there is no other way on this Mac.
- First run: the owner must log in to typing.com once in the new Chrome window (the profile keeps the login).

## Control window (replaces the osascript popups)
- The owner confirmed the remote-control version works on the real typing.com (601 characters in 60.1s at 120 wpm) and asked for: a window that stays open to change WPM and accuracy at any time, both on one page, and a max of 5000 WPM.
- `osascript` dialogs close after one answer and tkinter in `/usr/bin/python3` uses Apple's deprecated Tk, so the control window is a small page opened in the same remote-controlled Chrome (`Target.createTarget` with `newWindow: true` and a `data:` URL, resized with `Browser.setWindowBounds`). Python reads `window.__settings` from it every `READ_CONTROLS_EVERY_SECONDS` and writes the status line with `window.setStatus`. If the window is closed, the script opens it again with the same values.
- Values apply live, even mid-test (the pacing restarts from the new speed). Last values are saved in `last_choices.json` and used as the starting values.
- The script no longer exits after a test: it waits for the next one. A test that ended with its text still on screen is remembered (URL and first 30 letters) so it is not typed again.
- Accuracy: deliberate wrong letters when the running mistake count is below the target (never on the first key, never twice in a row, never for Enter). The first mistake learns whether the page moves on after a mistake or waits for the right letter.
- High speeds: keys are sent in bursts (up to `MAX_KEYS_PER_BURST`, pipelined CDP calls) when the schedule is behind, then the script waits for the cursor to reach the expected letter before the next burst.
- Tested end to end (real `main()` in headless Chromium 141, mock pages that ignore untrusted events, control window driven like a user): 120 wpm set gives 120 measured; 1000 gives 995; 5000 gives 4866 at 100%, 4879 at 90% on a page that waits after a mistake, 4865 at 90% on a page that moves on; a page with a 60 ms delayed re-render reaches 2354 wpm at 5000 set. Accuracy matches the setting to 0.1%. Closing the control window reopens it with the same values; a finished timed test is not typed again; several tests in a row work.

## High-speed fix (owner: at 2000+ wpm it made mistakes at 100% accuracy and at some point stopped typing)
- Cause 1: bursts of pipelined keys are too fast for the real typing.com, which merges or misreads keys. Reproduced with a mock that handles keys through the input value with a short timer: old version made 39 errors and got stuck at 2000 wpm.
- Cause 2: focus can leave `.js-input-box` (for example when the owner clicks the control window), then keys go nowhere. Reproduced with a mock that blurs the box: old version stopped after 4 s.
- Fix: start one key at a time and double the burst only after `GROW_BURST_AFTER_CLEAN_KEYS` clean keys while behind schedule. `STATE_JS` counts letters whose class looks wrong/incorrect/error; if that count grows more than the deliberate mistakes, halve the burst and cap it (or, at one key, double the check pause). The learned cap and pause are saved in `last_choices.json` (`burst_ceiling`, `check_pause`), so the learning mistake happens only once.
- Focus: `STATE_JS` reports whether `.js-input-box` has focus; it is focused again before each burst. When keys are not accepted, it clicks the active letter and refocuses once per second, and only gives up after `STOP_AFTER_NO_PROGRESS_SECONDS`.
- The state read after each burst is reused for the next loop (one round trip less per key). The control window shows when the page cannot go as fast as asked.
- Unexpected errors are detected by comparing the page's marked-wrong letters with the bot's deliberate mistakes on the current text (reset when the first 30 letters change). A per-burst comparison gave false alarms on pages that mark mistakes late.
- Final regression (current code): 120 set gives 120 wpm with 0 errors; a 1650-letter page gives 1960 wpm at 2000 and 4749 wpm at 5000 with 0 errors; 5000 at 90% gives 90.0% on both mistake behaviours; delayed re-render at 5000/95% gives 95.0% with no false slowdown; slow input-value page at 2000/100% gives 1 error (the learning one) then 0 errors on the next run, at about 670 wpm (that page's limit); focus loss at 2000/100% finishes with 0 errors.
- If the learned limit ever gets too low (for example the Mac was busy once), deleting `last_choices.json` resets it.

## Busy port fix (owner got "Something else is using port 9222")
- Port 9222 was taken but not answering, most likely the typing Chrome from the last run frozen.
- Now: wait `WAIT_FOR_BUSY_PORT_SECONDS` for it to answer; if not, find the bot's own Chrome (`ps`: command has `--remote-debugging-port=DEBUG_PORT` and `PROFILE_DIR`, not a `--type=` helper), stop it (SIGTERM then SIGKILL) and launch a fresh one. If another program holds the port, print its `lsof` line and suggest a different `DEBUG_PORT`.
- Tested with a fake frozen process holding the port (closed and replaced by a working Chromium) and an unrelated process (left alone, `lsof` line printed). Typing re-checked: 1961 wpm at 2000/100% with 0 errors, 95.0% at 1000/95%.

## Opens the test itself (owner ran an old osascript copy from ~/Desktop/claudecode by mistake, then asked for this)
- Settings: `TEST` (default "1-minute"), `TESTS` (1/3/5 minute, 1/3/5 page) and `TEST_URL` = `https://www.typing.com/student/typing-test/%s` (1-minute, 5-minute and 1-page addresses confirmed by web search; 3-minute, 3-page and 5-page follow the same pattern but are unconfirmed).
- A fresh typing Chrome starts on the chosen test. If Chrome is already running and no tab is on a `/typing-test/` page, the script opens the test (navigates the typing.com tab, or opens a new window if there is none).
- Control window: a Test picker and an Open test button. The button (re)opens the chosen test in the typing.com tab; pressed mid-test, the current test is dropped and the new one starts. The chosen test is saved in `last_choices.json`.
- Tested end to end with mock pages: auto-open on start, picker plus button switches to the 3-page URL in the same tab, button mid-test switches cleanly, choice saved; typing stayed at 119 wpm with 0 errors.
