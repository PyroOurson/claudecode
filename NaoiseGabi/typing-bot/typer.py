import base64
import json
import os
import random
import signal
import socket
import struct
import subprocess
import sys
import time
import urllib.parse
import urllib.request

BROWSER = "chrome"
WPM = 120
ACCURACY = 100
MAX_WPM = 5000
MIN_ACCURACY = 50
SITE = "typing.com"
TEST = "1-minute"
TESTS = ["1-minute", "3-minute", "5-minute", "1-page", "3-page", "5-page"]
TEST_URL = "https://www.typing.com/student/typing-test/%s"
DEBUG_PORT = 9222
PROFILE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chrome-profile")
LAST_CHOICES_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "last_choices.json")
CONTROL_WINDOW_SIZE = (380, 520)
WAIT_FOR_BROWSER_SECONDS = 20
WAIT_FOR_BUSY_PORT_SECONDS = 8
WAIT_FOR_KEY_ACCEPTED_SECONDS = 1.0
WAIT_AFTER_MISTAKE_SECONDS = 0.3
STOP_AFTER_NO_PROGRESS_SECONDS = 6
STOP_AFTER_IDLE_SECONDS = 8
MAX_KEYS_PER_BURST = 40
GROW_BURST_AFTER_CLEAN_KEYS = 60
READ_CONTROLS_EVERY_SECONDS = 0.25

BROWSERS = {
    "chrome": "Google Chrome",
    "brave": "Brave Browser",
    "edge": "Microsoft Edge",
}

STATE_JS = r"""
(function () {
  var ls = document.querySelectorAll('.screenBasic-letter');
  if (!ls.length) {
    ls = Array.prototype.filter.call(document.querySelectorAll('[class*="letter"]'), function (el) {
      return el.children.length === 0 && el.textContent.length <= 1;
    });
  }
  var idx = ls.length, start = 0, found = false, errors = 0;
  for (var i = 0; i < ls.length; i++) {
    var c = typeof ls[i].className === 'string' ? ls[i].className : '';
    if (/wrong|incorrect|error|mistake|invalid/i.test(c)) errors++;
    if (/is-active|\bactive\b|current/.test(c)) { idx = i; found = true; break; }
    if (/is-done|is-correct|is-wrong|\bdone\b|correct|incorrect/.test(c)) start = i + 1;
  }
  if (!found) idx = start;
  function charOf(el) {
    var cls = typeof el.className === 'string' ? el.className : '';
    var t = el.textContent;
    if (/enter|return|newline/i.test(cls) || t === '\u21b5' || t === '\u23ce') return '\n';
    if (t === '' || t.trim() === '') return ' ';
    return t;
  }
  var next = '', x = 0, y = 0;
  for (var j = idx; j < Math.min(ls.length, idx + LOOKAHEAD); j++) next += charOf(ls[j]);
  if (WITH_POSITION && idx < ls.length) {
    var r = ls[idx].getBoundingClientRect();
    x = r.left + r.width / 2;
    y = r.top + r.height / 2;
  }
  var sig = '';
  for (var k = 0; k < Math.min(30, ls.length); k++) sig += ls[k].textContent;
  var box = document.querySelector('.js-input-box');
  return {n: ls.length, idx: idx, next: next, sig: sig, x: x, y: y, url: location.href, errors: errors, focus: !box || document.activeElement === box};
})()
"""

FOCUS_JS = "(function () { var b = document.querySelector('.js-input-box'); if (b) b.focus(); return true; })()"

CONTROL_HTML = r"""<!doctype html>
<html><head><meta charset="utf-8"><title>Typing bot</title>
<style>
body { font: 15px -apple-system, Helvetica, sans-serif; margin: 0; padding: 18px; background: #f4f5f7; color: #222; }
h1 { font-size: 18px; margin: 0 0 6px; }
label { display: block; margin: 12px 0 4px; font-weight: 600; }
input, select { width: 100%; box-sizing: border-box; font-size: 20px; padding: 6px 8px; border: 2px solid #ccd; border-radius: 6px; background: #fff; }
button { width: 100%; margin-top: 10px; font-size: 18px; padding: 8px; border: 0; border-radius: 6px; background: #2f6fde; color: #fff; font-weight: 600; cursor: pointer; }
button:active { background: #2458b5; }
input.bad { border-color: #d33; }
.hint { font-size: 12px; color: #667; margin-top: 3px; }
#status { margin-top: 16px; padding: 10px; background: #fff; border-radius: 6px; min-height: 40px; white-space: pre-line; }
</style></head><body>
<h1>Typing bot</h1>
<div class="hint">Changes apply right away, even during a test.</div>
<label for="wpm">Words per minute</label>
<input id="wpm" type="number" min="1" max="MAX_WPM" step="1" value="START_WPM">
<div class="hint">1 to MAX_WPM</div>
<label for="acc">Accuracy (%)</label>
<input id="acc" type="number" min="MIN_ACCURACY" max="100" step="0.5" value="START_ACCURACY">
<div class="hint">MIN_ACCURACY to 100</div>
<label for="test">Test</label>
<select id="test">TEST_OPTIONS</select>
<button id="open">Open test</button>
<div id="status">Starting...</div>
<script>
window.__settings = {wpm: START_WPM, accuracy: START_ACCURACY, test: document.getElementById('test').value, open: 0};
document.getElementById('test').addEventListener('change', function () { window.__settings.test = this.value; });
document.getElementById('open').addEventListener('click', function () { window.__settings.open++; });
function hook(id, key, low, high, whole) {
  var el = document.getElementById(id);
  el.addEventListener('input', function () {
    var v = parseFloat(el.value.replace(',', '.'));
    if (isNaN(v) || v < low || v > high) { el.className = 'bad'; return; }
    el.className = '';
    window.__settings[key] = whole ? Math.round(v) : v;
  });
}
hook('wpm', 'wpm', 1, MAX_WPM, true);
hook('acc', 'accuracy', MIN_ACCURACY, 100, false);
window.setStatus = function (text) { document.getElementById('status').textContent = text; };
</script></body></html>"""

CODES = {
    " ": ("Space", 32), ",": ("Comma", 188), "<": ("Comma", 188), ".": ("Period", 190), ">": ("Period", 190),
    ";": ("Semicolon", 186), ":": ("Semicolon", 186), "'": ("Quote", 222), '"': ("Quote", 222),
    "-": ("Minus", 189), "_": ("Minus", 189), "=": ("Equal", 187), "+": ("Equal", 187),
    "/": ("Slash", 191), "?": ("Slash", 191), "[": ("BracketLeft", 219), "{": ("BracketLeft", 219),
    "]": ("BracketRight", 221), "}": ("BracketRight", 221), "\\": ("Backslash", 220), "|": ("Backslash", 220),
    "`": ("Backquote", 192), "~": ("Backquote", 192), "!": ("Digit1", 49), "@": ("Digit2", 50),
    "#": ("Digit3", 51), "$": ("Digit4", 52), "%": ("Digit5", 53), "^": ("Digit6", 54), "&": ("Digit7", 55),
    "*": ("Digit8", 56), "(": ("Digit9", 57), ")": ("Digit0", 48),
}
SHIFTED = '~!@#$%^&*()_+{}|:"<>?'

LAUNCH_FAILED_HELP = """{app} did not open its remote control port.
Most likely your school disabled it (Chrome policy "RemoteDebuggingAllowed").
You can check: open chrome://policy in {app} and look for RemoteDebuggingAllowed.
If it is there and set to false, there is no way to type automatically on this Mac."""

ALREADY_OPEN_HELP = """Something other than the typing {app} window is using port {port}:
{owner}
Quit that program, or change DEBUG_PORT at the top of typer.py to another number (for example 9333)."""


class CDPError(Exception):
    pass


class Closed(Exception):
    pass


class CDP:
    def __init__(self, ws_url):
        u = urllib.parse.urlparse(ws_url)
        self.sock = socket.create_connection((u.hostname, u.port), timeout=10)
        key = base64.b64encode(os.urandom(16)).decode()
        request = (
            "GET %s HTTP/1.1\r\nHost: %s:%d\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n"
            "Sec-WebSocket-Key: %s\r\nSec-WebSocket-Version: 13\r\n\r\n" % (u.path, u.hostname, u.port, key)
        )
        self.sock.sendall(request.encode())
        response = b""
        while b"\r\n\r\n" not in response:
            chunk = self.sock.recv(4096)
            if not chunk:
                raise Closed()
            response += chunk
        if b" 101 " not in response.split(b"\r\n")[0]:
            raise CDPError(response.split(b"\r\n")[0].decode(errors="replace"))
        self.buffer = response.split(b"\r\n\r\n", 1)[1]
        self.next_id = 0

    def close(self):
        try:
            self.sock.close()
        except OSError:
            pass

    def read_exact(self, n):
        while len(self.buffer) < n:
            chunk = self.sock.recv(65536)
            if not chunk:
                raise Closed()
            self.buffer += chunk
        data, self.buffer = self.buffer[:n], self.buffer[n:]
        return data

    def send_frame(self, opcode, payload):
        n = len(payload)
        if n < 126:
            header = struct.pack(">BB", 0x80 | opcode, 0x80 | n)
        elif n < 65536:
            header = struct.pack(">BBH", 0x80 | opcode, 0x80 | 126, n)
        else:
            header = struct.pack(">BBQ", 0x80 | opcode, 0x80 | 127, n)
        mask = os.urandom(4)
        masked = bytes(b ^ mask[i % 4] for i, b in enumerate(payload))
        self.sock.sendall(header + mask + masked)

    def recv_message(self):
        parts = []
        while True:
            b1, b2 = self.read_exact(2)
            opcode = b1 & 0x0F
            n = b2 & 0x7F
            if n == 126:
                n = struct.unpack(">H", self.read_exact(2))[0]
            elif n == 127:
                n = struct.unpack(">Q", self.read_exact(8))[0]
            mask = self.read_exact(4) if b2 & 0x80 else None
            payload = self.read_exact(n)
            if mask:
                payload = bytes(b ^ mask[i % 4] for i, b in enumerate(payload))
            if opcode == 8:
                raise Closed()
            if opcode == 9:
                self.send_frame(10, payload)
                continue
            if opcode == 10:
                continue
            parts.append(payload)
            if b1 & 0x80:
                return b"".join(parts).decode("utf-8", "replace")

    def call_many(self, calls):
        ids = []
        for method, params in calls:
            self.next_id += 1
            ids.append(self.next_id)
            self.send_frame(1, json.dumps({"id": self.next_id, "method": method, "params": params or {}}).encode())
        results = {}
        while len(results) < len(ids):
            message = json.loads(self.recv_message())
            if message.get("id") in ids:
                results[message["id"]] = message
        out = []
        for i in ids:
            message = results[i]
            if "error" in message:
                raise CDPError(message["error"].get("message", str(message["error"])))
            out.append(message.get("result", {}))
        return out

    def call(self, method, params=None):
        return self.call_many([(method, params)])[0]

    def evaluate(self, expression):
        result = self.call("Runtime.evaluate", {"expression": expression, "returnByValue": True})
        if "exceptionDetails" in result:
            raise CDPError(str(result["exceptionDetails"].get("text")))
        return result.get("result", {}).get("value")


LOCAL = urllib.request.build_opener(urllib.request.ProxyHandler({}))


def http_json(path):
    url = "http://127.0.0.1:%d%s" % (DEBUG_PORT, path)
    with LOCAL.open(url, timeout=3) as response:
        return json.loads(response.read().decode())


def port_ready():
    try:
        http_json("/json/version")
        return True
    except Exception:
        return False


def port_in_use():
    try:
        socket.create_connection(("127.0.0.1", DEBUG_PORT), timeout=1).close()
        return True
    except OSError:
        return False


def browser_binary():
    app = BROWSERS[BROWSER]
    for folder in ("/Applications", os.path.expanduser("~/Applications")):
        path = os.path.join(folder, app + ".app", "Contents", "MacOS", app)
        if os.path.exists(path):
            return path
    return None


def processes():
    result = subprocess.run(["ps", "-ax", "-o", "pid=,command="], capture_output=True, text=True)
    out = []
    for line in result.stdout.splitlines():
        pid, _, command = line.strip().partition(" ")
        if pid.isdigit():
            out.append((int(pid), command))
    return out


def typing_browser_pids():
    flag = "--remote-debugging-port=%d" % DEBUG_PORT
    return [pid for pid, command in processes() if flag in command and PROFILE_DIR in command and "--type=" not in command]


def port_owner():
    try:
        result = subprocess.run(["lsof", "-nP", "-iTCP:%d" % DEBUG_PORT, "-sTCP:LISTEN"], capture_output=True, text=True)
        return result.stdout.strip() or "(could not tell which program)"
    except OSError:
        return "(could not tell which program)"


def wait_until(check, seconds):
    deadline = time.time() + seconds
    while time.time() < deadline:
        if check():
            return True
        time.sleep(0.5)
    return check()


def restart_frozen_browser(app):
    pids = typing_browser_pids()
    if not pids:
        return False
    print("The typing %s window is not responding. Closing it and opening a fresh one..." % app)
    for sig in (signal.SIGTERM, signal.SIGKILL):
        for pid in pids:
            try:
                os.kill(pid, sig)
            except OSError:
                pass
        if wait_until(lambda: not port_in_use(), 10):
            return True
    return not port_in_use()


def launch_browser():
    app = BROWSERS[BROWSER]
    if port_ready():
        print("%s remote control is already on." % app)
        return True
    if port_in_use():
        print("Port %d is busy, waiting for the typing %s window to answer..." % (DEBUG_PORT, app))
        if wait_until(port_ready, WAIT_FOR_BUSY_PORT_SECONDS):
            print("%s remote control is on." % app)
            return True
        if not restart_frozen_browser(app):
            print(ALREADY_OPEN_HELP.format(app=app, port=DEBUG_PORT, owner=port_owner()))
            return False
    binary = browser_binary()
    if not binary:
        print("Could not find %s in /Applications or ~/Applications." % app)
        return False
    os.makedirs(PROFILE_DIR, exist_ok=True)
    print("Opening a separate %s window for typing (its own profile, saved in %s)..." % (app, PROFILE_DIR))
    subprocess.Popen(
        [binary, "--remote-debugging-port=%d" % DEBUG_PORT, "--user-data-dir=" + PROFILE_DIR,
         "--no-first-run", "--no-default-browser-check", test_url(load_last_test())],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    deadline = time.time() + WAIT_FOR_BROWSER_SECONDS
    while time.time() < deadline:
        if port_ready():
            return True
        time.sleep(0.5)
    print(LAUNCH_FAILED_HELP.format(app=app))
    return False


def clamp_choices(wpm, accuracy):
    return int(min(max(round(float(wpm)), 1), MAX_WPM)), float(min(max(float(accuracy), MIN_ACCURACY), 100))


def read_saved():
    try:
        with open(LAST_CHOICES_FILE) as f:
            data = json.load(f)
        return data if isinstance(data, dict) else {}
    except (OSError, ValueError):
        return {}


def save(**values):
    data = read_saved()
    data.update(values)
    try:
        with open(LAST_CHOICES_FILE, "w") as f:
            json.dump(data, f)
    except OSError:
        pass


def load_last_choices():
    data = read_saved()
    try:
        return clamp_choices(data.get("wpm", WPM), data.get("accuracy", ACCURACY))
    except (ValueError, TypeError):
        return clamp_choices(WPM, ACCURACY)


def load_last_test():
    test = read_saved().get("test", TEST)
    return test if test in TESTS else TESTS[0]


class Controls:
    def __init__(self):
        self.wpm, self.accuracy = load_last_choices()
        self.test = load_last_test()
        self.open_requested = False
        self.open_seen = 0
        self.cdp = None
        self.status = ""
        self.last_read = 0

    def page_url(self):
        options = "".join('<option value="%s"%s>%s</option>' % (t, " selected" if t == self.test else "", t.replace("-", " ")) for t in TESTS)
        page = CONTROL_HTML.replace("TEST_OPTIONS", options)
        for name, value in (("MAX_WPM", MAX_WPM), ("MIN_ACCURACY", MIN_ACCURACY), ("START_WPM", self.wpm), ("START_ACCURACY", "%g" % self.accuracy)):
            page = page.replace(name, str(value))
        return "data:text/html;charset=utf-8;base64," + base64.b64encode(page.encode()).decode()

    def open(self):
        browser = CDP(http_json("/json/version")["webSocketDebuggerUrl"])
        try:
            target_id = browser.call("Target.createTarget", {"url": self.page_url(), "newWindow": True})["targetId"]
            try:
                window = browser.call("Browser.getWindowForTarget", {"targetId": target_id})["windowId"]
                browser.call("Browser.setWindowBounds", {"windowId": window, "bounds": {
                    "left": 20, "top": 60, "width": CONTROL_WINDOW_SIZE[0], "height": CONTROL_WINDOW_SIZE[1]}})
            except CDPError:
                pass
        finally:
            browser.close()
        deadline = time.time() + 5
        while time.time() < deadline:
            for t in http_json("/json/list"):
                if t.get("id") == target_id and t.get("webSocketDebuggerUrl"):
                    self.cdp = CDP(t["webSocketDebuggerUrl"])
                    self.open_seen = 0
                    shown, self.status = self.status, ""
                    self.set_status(shown or "Waiting for a test...")
                    return
            time.sleep(0.2)

    def drop(self):
        if self.cdp:
            self.cdp.close()
        self.cdp = None

    def read(self, force=False):
        if not force and time.time() - self.last_read < READ_CONTROLS_EVERY_SECONDS:
            return False
        self.last_read = time.time()
        if self.cdp is None:
            try:
                self.open()
            except (CDPError, Closed, OSError, KeyError, ValueError):
                self.drop()
        if self.cdp is None:
            return False
        try:
            data = json.loads(self.cdp.evaluate("JSON.stringify(window.__settings || null)") or "null")
            wpm, accuracy = clamp_choices(data["wpm"], data["accuracy"])
            test, opens = data.get("test"), int(data.get("open", 0))
        except (CDPError, Closed, OSError):
            self.drop()
            return False
        except (TypeError, KeyError, ValueError, AttributeError):
            return False
        if test in TESTS and test != self.test:
            self.test = test
            save(test=test)
        if opens > self.open_seen:
            self.open_seen = opens
            self.open_requested = True
        if (wpm, accuracy) == (self.wpm, self.accuracy):
            return False
        self.wpm, self.accuracy = wpm, accuracy
        save(wpm=wpm, accuracy=accuracy)
        print("Now %d wpm, %g%% accuracy." % (wpm, accuracy))
        return True

    def set_status(self, text):
        if text == self.status:
            return
        self.status = text
        if self.cdp is None:
            return
        try:
            self.cdp.evaluate("window.setStatus && window.setStatus(%s)" % json.dumps(text))
        except (CDPError, Closed, OSError):
            self.drop()


def site_tabs():
    return [t for t in http_json("/json/list") if t.get("type") == "page" and SITE in t.get("url", "") and t.get("webSocketDebuggerUrl")]


FAST_STATE_JS = STATE_JS.replace("LOOKAHEAD", str(MAX_KEYS_PER_BURST + 1)).replace("WITH_POSITION", "false")
POSITION_STATE_JS = STATE_JS.replace("LOOKAHEAD", str(MAX_KEYS_PER_BURST + 1)).replace("WITH_POSITION", "true")


def read_state(cdp, position=False):
    return cdp.evaluate(POSITION_STATE_JS if position else FAST_STATE_JS)


def test_key(state):
    return (state["url"], state["sig"])


class Finder:
    def __init__(self):
        self.done = set()

    def find(self):
        tabs = site_tabs()
        seen = set()
        for tab in tabs:
            cdp = None
            try:
                cdp = CDP(tab["webSocketDebuggerUrl"])
                state = read_state(cdp)
                if state and state["n"] > 0:
                    seen.add(test_key(state))
                    if state["idx"] < state["n"] and test_key(state) not in self.done:
                        return cdp, state
            except (CDPError, Closed, OSError):
                pass
            if cdp:
                cdp.close()
        self.done &= seen
        return None, None

    def finished(self, cdp):
        try:
            state = read_state(cdp)
            if state and state["n"] > 0:
                self.done.add(test_key(state))
        except (CDPError, Closed, OSError):
            pass


def key_events(ch):
    if ch == "\n":
        down = {"key": "Enter", "code": "Enter", "text": "\r", "unmodifiedText": "\r", "windowsVirtualKeyCode": 13, "nativeVirtualKeyCode": 13}
        return dict(down, type="keyDown"), {"type": "keyUp", "key": "Enter", "code": "Enter", "windowsVirtualKeyCode": 13, "nativeVirtualKeyCode": 13}
    if ch.isascii() and ch.isalpha():
        code, vk = "Key" + ch.upper(), ord(ch.upper())
    elif ch.isascii() and ch.isdigit():
        code, vk = "Digit" + ch, ord(ch)
    else:
        code, vk = CODES.get(ch, ("", 0))
    shift = (ch.isascii() and ch.isupper()) or ch in SHIFTED
    common = {"key": ch, "code": code, "windowsVirtualKeyCode": vk, "nativeVirtualKeyCode": vk, "modifiers": 8 if shift else 0}
    return dict(common, type="keyDown", text=ch, unmodifiedText=ch.lower() if shift else ch), dict(common, type="keyUp")


def press_all(cdp, chars):
    calls = []
    for ch in chars:
        down, up = key_events(ch)
        calls.append(("Input.dispatchKeyEvent", down))
        calls.append(("Input.dispatchKeyEvent", up))
    cdp.call_many(calls)


def wrong_letter(ch):
    letters = "asdfghjklqwertyuiopzxcvbnm"
    choice = random.choice([c for c in letters if c != ch.lower()])
    return choice.upper() if ch.isupper() else choice


def click(cdp, x, y):
    for kind in ("mousePressed", "mouseReleased"):
        cdp.call("Input.dispatchMouseEvent", {"type": kind, "x": x, "y": y, "button": "left", "clickCount": 1})


def prepare(cdp, state):
    try:
        cdp.call("Page.bringToFront")
        cdp.call("Emulation.setFocusEmulationEnabled", {"enabled": True})
    except CDPError:
        pass
    state = read_state(cdp, position=True) or state
    if state["x"] > 0 and state["y"] > 0:
        click(cdp, state["x"], state["y"])
    cdp.evaluate(FOCUS_JS)
    time.sleep(0.3)


def wait_for(cdp, before, target_idx, seconds, pause):
    deadline = time.time() + seconds
    state = before
    while time.time() < deadline:
        time.sleep(pause)
        state = read_state(cdp)
        if not state or state["n"] == 0 or state["sig"] != before["sig"] or state["idx"] >= target_idx:
            return state, True
    return state, False


SPEED = {"burst": 1, "ceiling": MAX_KEYS_PER_BURST, "pause": 0.001}


def load_speed_limits():
    data = read_saved()
    try:
        SPEED["ceiling"] = int(min(max(data.get("burst_ceiling", MAX_KEYS_PER_BURST), 1), MAX_KEYS_PER_BURST))
        SPEED["pause"] = float(min(max(data.get("check_pause", 0.001), 0.001), 0.05))
    except (ValueError, TypeError):
        pass


def slow_down(reason):
    before = (SPEED["burst"], SPEED["pause"])
    if SPEED["burst"] > 1:
        SPEED["ceiling"] = max(1, SPEED["burst"] // 2)
        SPEED["burst"] = SPEED["ceiling"]
    else:
        SPEED["ceiling"] = 1
        SPEED["pause"] = min(SPEED["pause"] * 2, 0.05)
    save(burst_ceiling=SPEED["ceiling"], check_pause=SPEED["pause"])
    if (SPEED["burst"], SPEED["pause"]) != before:
        print("%s: slowing down so the page keeps up (up to %d keys at once, %.0f ms checks)." % (reason, SPEED["burst"], SPEED["pause"] * 1000))


def recover(cdp):
    try:
        state = read_state(cdp, position=True)
        if state and state["x"] > 0 and state["y"] > 0:
            click(cdp, state["x"], state["y"])
        cdp.evaluate(FOCUS_JS)
    except CDPError:
        pass


def type_test(cdp, controls):
    t0 = None
    base_time = 0
    base_typed = 0
    typed = 0
    mistakes = 0
    clean = 0
    moved = False
    idle_since = None
    last_progress = time.time()
    last_recover = 0
    last_was_mistake = True
    mistake_moves_on = None
    last_report = 0
    after = None
    page_sig = None
    page_errors_base = 0
    page_mistakes = 0
    while True:
        if controls.read() and t0 is not None:
            base_time, base_typed = time.time(), typed
        if controls.open_requested:
            return "you opened a new test", typed, time.time() - (t0 or time.time()), mistakes
        state = after if after is not None else read_state(cdp)
        after = None
        if not state or state["n"] == 0:
            if t0 is not None:
                return "the test text disappeared", typed, time.time() - t0, mistakes
            time.sleep(0.3)
            continue
        if state["idx"] >= state["n"]:
            if t0 is not None:
                idle_since = idle_since or time.time()
                if time.time() - idle_since > STOP_AFTER_IDLE_SECONDS:
                    return "no new text appeared", typed, time.time() - t0, mistakes
            time.sleep(0.2)
            continue
        idle_since = None
        if t0 is None:
            prepare(cdp, state)
            state = read_state(cdp)
            if not state or state["n"] == 0 or state["idx"] >= state["n"]:
                continue
            t0 = base_time = time.time()
            last_progress = t0
            print("Typing at %d wpm, %g%% accuracy..." % (controls.wpm, controls.accuracy))
        if state["sig"] != page_sig:
            page_sig = state["sig"]
            page_errors_base = state["errors"]
            page_mistakes = 0
        if not state["focus"]:
            cdp.evaluate(FOCUS_JS)
        interval = 60.0 / (controls.wpm * 5)
        miss_rate = (100.0 - controls.accuracy) / 100.0
        due = int((time.time() - base_time) / interval) + 1 - (typed - base_typed)
        if due <= 0:
            time.sleep(max(0.0, base_time + (typed - base_typed) * interval - time.time()))
            after = read_state(cdp)
            continue
        burst = []
        mistake = False
        for ch in state["next"][:min(due, SPEED["burst"])]:
            if not last_was_mistake and ch != "\n" and mistakes < (typed + len(burst) + 1) * miss_rate - random.random():
                burst.append(wrong_letter(ch))
                mistake = True
                break
            last_was_mistake = False
            burst.append(ch)
        last_was_mistake = mistake
        press_all(cdp, burst)
        typed += len(burst)
        good = len(burst) - 1 if mistake else len(burst)
        if mistake:
            mistakes += 1
            page_mistakes += 1
            if mistake_moves_on is False:
                after, ok = wait_for(cdp, state, state["idx"] + good, WAIT_FOR_KEY_ACCEPTED_SECONDS, SPEED["pause"])
            else:
                after, ok = wait_for(cdp, state, state["idx"] + good + 1, WAIT_AFTER_MISTAKE_SECONDS, SPEED["pause"])
                if after and after["sig"] == state["sig"] and after["n"] > 0 and mistake_moves_on is None:
                    mistake_moves_on = after["idx"] >= state["idx"] + good + 1
                ok = True
        else:
            after, ok = wait_for(cdp, state, state["idx"] + good, WAIT_FOR_KEY_ACCEPTED_SECONDS, SPEED["pause"])
        same_text = after is not None and after["n"] > 0 and after["sig"] == state["sig"]
        if same_text and after["errors"] - page_errors_base > page_mistakes:
            slow_down("The page marked a letter wrong that the bot typed right")
            page_errors_base = after["errors"] - page_mistakes
            clean = 0
        elif ok:
            clean += len(burst)
            if clean >= GROW_BURST_AFTER_CLEAN_KEYS and due > SPEED["burst"] and SPEED["burst"] < SPEED["ceiling"]:
                SPEED["burst"] = min(SPEED["burst"] * 2, SPEED["ceiling"])
                clean = 0
        if ok or (same_text and after["idx"] != state["idx"]):
            moved = True
            last_progress = time.time()
            if not ok and SPEED["burst"] > 1:
                slow_down("The page lost some keys")
        else:
            if time.time() - last_recover > 1:
                last_recover = time.time()
                recover(cdp)
            if time.time() - last_progress > STOP_AFTER_NO_PROGRESS_SECONDS:
                return ("the page stopped accepting keys" if moved else "ignored"), typed, time.time() - t0, mistakes
            base_time, base_typed = time.time(), typed
        if time.time() - last_report > 0.5:
            last_report = time.time()
            seconds = max(time.time() - t0, 0.001)
            text = "Typing: %d keys, %.0f wpm, %d mistakes." % (typed, typed / 5.0 / seconds * 60, mistakes)
            if due > 10 * SPEED["burst"] and time.time() - t0 > 2:
                text += "\nThe page cannot go faster than about %.0f wpm." % (typed / 5.0 / seconds * 60)
            controls.set_status(text)


def test_url(test):
    return TEST_URL % test


def open_test(test):
    url = test_url(test)
    print("Opening the %s test..." % test.replace("-", " "))
    for tab in site_tabs():
        cdp = None
        try:
            cdp = CDP(tab["webSocketDebuggerUrl"])
            cdp.call("Page.navigate", {"url": url})
            cdp.call("Page.bringToFront")
            return
        except (CDPError, Closed, OSError):
            pass
        finally:
            if cdp:
                cdp.close()
    browser = CDP(http_json("/json/version")["webSocketDebuggerUrl"])
    try:
        browser.call("Target.createTarget", {"url": url, "newWindow": True})
    finally:
        browser.close()


def has_test_tab():
    return any("/typing-test/" in t.get("url", "") for t in site_tabs())


def main():
    if sys.platform != "darwin":
        print("This script only works on macOS.")
        sys.exit(1)
    if BROWSER not in BROWSERS:
        print("BROWSER must be one of: %s" % ", ".join(sorted(BROWSERS)))
        sys.exit(1)
    app = BROWSERS[BROWSER]
    if not launch_browser():
        sys.exit(1)
    load_speed_limits()
    controls = Controls()
    controls.read(force=True)
    finder = Finder()
    waiting = "Waiting for the test...\nIf typing.com asks you to log in, log in, then press Open test."
    try:
        if not has_test_tab():
            open_test(controls.test)
    except Exception:
        pass
    print("Change speed, accuracy and test in the small Typing bot window. It stays open.")
    print("If typing.com asks you to log in (only the first time), log in, then press Open test in that window.")
    print("The script keeps running for test after test. Press Ctrl+C here to quit.")
    controls.set_status(waiting)
    try:
        while True:
            controls.read()
            if controls.open_requested:
                controls.open_requested = False
                try:
                    open_test(controls.test)
                except Exception:
                    pass
                controls.set_status(waiting)
                time.sleep(1)
            try:
                cdp, state = finder.find()
            except Exception:
                if not port_ready():
                    print("%s was closed. Run the script again." % app)
                    sys.exit(1)
                cdp = None
            if not cdp:
                time.sleep(0.5)
                continue
            print("Found the test: %s" % state["url"])
            controls.set_status("Found a test, starting...")
            try:
                reason, typed, seconds, mistakes = type_test(cdp, controls)
                finder.finished(cdp)
            except (Closed, OSError):
                print("Lost the tab, waiting for a test again...")
                controls.set_status(waiting)
                continue
            finally:
                cdp.close()
            if controls.open_requested:
                continue
            if reason == "ignored":
                text = "The page did not accept the key presses."
                print(text + " Send this output to Claude.")
                print(json.dumps(state, indent=2))
            else:
                seconds = max(seconds, 0.001)
                text = "Test finished (%s).\n%d keys in %.1fs: %.0f wpm, %d mistakes (%.1f%% accuracy)." % (
                    reason, typed, seconds, typed / 5.0 / seconds * 60, mistakes, 100.0 * (typed - mistakes) / max(typed, 1))
                print(text.replace("\n", " "))
            controls.set_status(text + "\n\nPress Open test for another one.")
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
