#!/usr/bin/env python3
"""Build the root-level kernel proof hub.

It links the current committed kernel-rebuild HTML surfaces. Older spike traces
still exist in the repo, but they are not the front door for this work.

    python3 build_index.py           # write index.html
    python3 build_index.py --open    # write + open in browser
"""

from __future__ import annotations

import argparse
import datetime as dt
import re
import webbrowser
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent
KERNEL_DIR = ROOT / "kernel-rebuild"
INDEX_PATH = ROOT / "index.html"

# Directories whose HTML is dependency noise or ephemeral working output. `out/` is
# gitignored (regenerate with `pnpm publish:html`, which copies the live pages into
# `kernel-rebuild/published/`); the committed `published/` surface is what reaches deploy.
_SKIP_DIRS = {"node_modules", "out", ".git", "dist", "build"}
_TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.IGNORECASE | re.DOTALL)

_CSS = """
:root{--bg:#0b0e13;--surface:#141a22;--surface2:#1b232e;--border:#2a3544;
--text:#e8edf4;--muted:#8b9bb0;--accent:#c084fc;--green:#3dd68c;--yellow:#f5c451;--red:#fb7185;}
*{box-sizing:border-box;}
body{margin:0;background:var(--bg);color:var(--text);line-height:1.55;
font-family:"SF Pro Text","Segoe UI",system-ui,sans-serif;}
.layout{display:grid;grid-template-columns:240px 1fr;min-height:100vh;}
aside{background:var(--surface);border-right:1px solid var(--border);padding:1.5rem 1rem;
position:sticky;top:0;height:100vh;overflow:auto;}
aside h2{font-size:.78rem;text-transform:uppercase;letter-spacing:.09em;color:var(--accent);margin:0 0 .8rem;}
aside .spike{font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);
margin:1rem 0 .35rem;}
aside a{display:block;color:var(--text);text-decoration:none;font-size:.85rem;padding:.25rem .4rem;
border-radius:6px;}
aside a:hover{background:var(--surface2);color:var(--accent);}
main{padding:2.5rem 2rem 5rem;max-width:900px;}
h1{font-size:1.7rem;margin:0 0 .3rem;}
.sub{color:var(--muted);margin:0 0 2rem;}
.card{background:var(--surface);border:1px solid var(--border);border-radius:12px;
padding:1.1rem 1.25rem;margin-bottom:1rem;}
.card a.title{color:var(--text);text-decoration:none;font-weight:650;font-size:1.05rem;}
.card a.title:hover{color:var(--accent);}
.row{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin:.4rem 0;}
.pill{font-size:.72rem;padding:.18rem .55rem;border-radius:999px;background:var(--surface2);
border:1px solid var(--border);color:var(--muted);}
.pill.pass{color:var(--green);border-color:#1f5b3a;}
.pill.fail{color:var(--yellow);border-color:#5b4a1f;}
.pill.herded{color:var(--red);border-color:#5b1f28;}
.prompt{color:var(--muted);font-size:.88rem;margin:.4rem 0 0;}
.meta{color:var(--muted);font-size:.76rem;margin-top:.5rem;}
.empty{color:var(--muted);font-style:italic;}
"""


def _now() -> str:
    return dt.datetime.now().strftime("%Y-%m-%d %H:%M")


def _esc(value: Any) -> str:
    import html as _html

    return _html.escape(str(value if value is not None else ""))


def _extract_title(html_path: Path) -> str:
    """Pull the <title> for a human-readable label, falling back to the file stem."""
    try:
        head = html_path.read_text(encoding="utf-8", errors="ignore")[:8000]
    except OSError:
        return html_path.stem
    match = _TITLE_RE.search(head)
    if match:
        title = " ".join(match.group(1).split())
        if title:
            return title
    return html_path.stem


def collect_kernel() -> list[tuple[Path, str]]:
    """Discover every committed HTML page under kernel-rebuild/ so the hub can link
    them without anyone needing to know the paths. Skips dependency and ephemeral dirs."""
    if not KERNEL_DIR.exists():
        return []
    pages: list[tuple[Path, str]] = []
    for html_path in KERNEL_DIR.rglob("*.html"):
        rel_parts = html_path.relative_to(KERNEL_DIR).parts
        if any(part in _SKIP_DIRS for part in rel_parts):
            continue
        pages.append((html_path, _extract_title(html_path)))
    pages.sort(key=lambda pair: pair[0].relative_to(ROOT).as_posix())
    return pages


def _kernel_card(html_path: Path, title: str) -> str:
    rel = html_path.relative_to(ROOT).as_posix()
    anchor = rel.replace("/", "__")
    mtime = dt.datetime.fromtimestamp(html_path.stat().st_mtime).strftime("%Y-%m-%d %H:%M")
    return (
        f'<div class="card" id="{anchor}">'
        f'<a class="title" href="{rel}">{_esc(title)}</a>'
        f'<p class="meta">{rel} · updated {mtime}</p>'
        "</div>"
    )


def render(kernel_pages: list[tuple[Path, str]]) -> str:
    side, body = [], []

    if kernel_pages:
        side.append('<div class="spike">proof surfaces</div>')
        body.append(f'<h2 style="margin-top:2rem">Proof surfaces ({len(kernel_pages)})</h2>')
        for html_path, title in kernel_pages:
            anchor = html_path.relative_to(ROOT).as_posix().replace("/", "__")
            side.append(f'<a href="#{anchor}">{_esc(title)}</a>')
            body.append(_kernel_card(html_path, title))

    if not kernel_pages:
        body.append(
            '<p class="empty">No kernel HTML found yet. Run <code>cd kernel-rebuild && pnpm publish:html</code>, '
            "then rebuild this index.</p>"
        )

    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Doppl Kernel Rebuild — proof hub</title><style>{_CSS}</style></head>
<body><div class="layout">
<aside><h2>Kernel</h2><a href="#">Proof surfaces ({len(kernel_pages)})</a>{"".join(side)}
</aside>
<main><h1>Doppl Kernel Rebuild — proof hub</h1>
<p class="sub">Current human proof surfaces for the kernel rebuild. Regenerate with
<code>cd kernel-rebuild && pnpm publish:html</code>, then <code>python3 build_index.py</code>.
Generated {_now()}.</p>
{"".join(body)}
</main></div></body></html>"""


def main() -> None:
    parser = argparse.ArgumentParser(description="Build the Agarden run index")
    parser.add_argument("--open", action="store_true", help="Open index.html after writing")
    args = parser.parse_args()

    kernel_pages = collect_kernel()
    INDEX_PATH.write_text(render(kernel_pages), encoding="utf-8")
    print(f"Wrote {INDEX_PATH.relative_to(ROOT)} — {len(kernel_pages)} kernel-rebuild page(s).")
    if args.open:
        webbrowser.open(INDEX_PATH.resolve().as_uri())


if __name__ == "__main__":
    main()
