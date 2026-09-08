#!/usr/bin/env python3
# Add the site's grid background to the standalone pages.
import io, sys
GRID = 'linear-gradient(rgba(201,168,76,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.03) 1px,transparent 1px)'

def edit(path, old, new):
    try:
        t = io.open(path, "r", encoding="utf-8", newline="").read()
    except FileNotFoundError:
        print("MISSING (adjust path):", path); return
    c = t.count(old)
    if c != 1:
        print(f"SKIP {path}: matched {c} (expected 1)"); return
    io.open(path, "w", encoding="utf-8", newline="").write(t.replace(old, new, 1))
    print("OK:", path)

# privacy + terms — solid color, add grid
for p in [r"pages\privacy.js", r"pages\terms.js"]:
    edit(p,
        'minHeight: "100vh", background: "#080608"',
        'minHeight: "100vh", backgroundColor: "#080608", backgroundImage: "' + GRID + '", backgroundSize: "56px 56px"')

# support — keep its radial glow, layer grid over it
edit(r"pages\support.js",
    'minHeight: "100vh", background: "radial-gradient(1200px 600px at 50% -10%, rgba(139,32,32,.14), transparent), #080608"',
    'minHeight: "100vh", backgroundColor: "#080608", backgroundImage: "' + GRID + ',radial-gradient(1200px 600px at 50% -10%, rgba(139,32,32,.14), transparent)", backgroundSize: "56px 56px,56px 56px,100% 100%"')

# shared job page — adjust the path to wherever your shared page lives (e.g. pages/j/[id].js)
edit(r"pages\shared_job_page.js",
    'minHeight: "100vh", background: "radial-gradient(1100px 620px at 50% -12%, rgba(139,32,32,.16), transparent), #080608"',
    'minHeight: "100vh", backgroundColor: "#080608", backgroundImage: "' + GRID + ',radial-gradient(1100px 620px at 50% -12%, rgba(139,32,32,.16), transparent)", backgroundSize: "56px 56px,56px 56px,100% 100%"')
