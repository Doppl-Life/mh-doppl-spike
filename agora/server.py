"""agora.server — the local "Agora": a tiny stdlib web square where Agardeners
react to surfaced ideas, and the human↔judge↔council agreement shows up live.

No framework, no OAuth, no install — `python -m agora.server` and open the page.
Swap this transport for Slack/Discord later; the schema and ledger don't change.

  python -m agora.server                     # serve agora/ledger/
  python -m agora.server --dir path/to/ledger --port 8800

Anti-anchoring note: the machine labels (judge / council) are visually gated —
you must react before the card reveals what the machines thought. That guards the
politeness-mirror / herding reward hacks (bedrock/signal/README.md). It's a visual
gate on a trusted-team tool, not a security boundary.
"""

from __future__ import annotations

import argparse
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

from .agreement import agreement
from .ledger import (
    DEFAULT_DIR,
    append_verdict,
    load_posts,
    load_verdicts,
)
from .schema import REACTION_MAP, Verdict, resolve_dimension

LEDGER_DIR = DEFAULT_DIR  # rebound in main()

PAGE = """<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>the Agora</title>
<style>
  :root{ --bg:#0d1117; --card:#161b22; --line:#272e3a; --ink:#e6edf3; --dim:#8b949e;
         --pos:#3fb950; --neg:#f85149; --neu:#d29922; --acc:#58a6ff; }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);
       font:15px/1.5 ui-sans-serif,-apple-system,Segoe UI,Roboto,Helvetica,Arial}
  header{position:sticky;top:0;background:rgba(13,17,23,.92);backdrop-filter:blur(6px);
         border-bottom:1px solid var(--line);padding:14px 20px;display:flex;
         align-items:center;gap:16px;z-index:5}
  header h1{font-size:18px;margin:0;letter-spacing:.3px}
  header .who{margin-left:auto;color:var(--dim);font-size:13px}
  header input{background:#1f2630;border:1px solid var(--line);color:var(--ink);
        border-radius:8px;padding:4px 8px;font:13px ui-sans-serif;width:120px}
  header a{color:var(--acc);text-decoration:none;font-size:13px}
  .wrap{max-width:760px;margin:0 auto;padding:20px}
  .card{background:var(--card);border:1px solid var(--line);border-radius:14px;
        padding:18px 18px 14px;margin:0 0 16px}
  .meta{color:var(--dim);font-size:12px;display:flex;gap:10px;flex-wrap:wrap;margin-bottom:8px}
  .tag{border:1px solid var(--line);border-radius:999px;padding:1px 9px}
  .idea{font-size:16px;font-weight:600;margin:2px 0 8px}
  .sub{color:var(--dim);font-size:13px;margin:2px 0}
  .sub b{color:var(--ink);font-weight:600}
  .react{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
  .react button{background:#1f2630;border:1px solid var(--line);color:var(--ink);
        font-size:20px;border-radius:10px;padding:6px 12px;cursor:pointer;transition:.12s}
  .react button:hover{border-color:var(--acc);transform:translateY(-1px)}
  .reveal{margin-top:12px;padding-top:12px;border-top:1px dashed var(--line);display:none}
  .reveal.show{display:block}
  .row{display:flex;gap:8px;align-items:center;margin:4px 0;font-size:13px}
  .chip{font-weight:700;border-radius:6px;padding:1px 8px;font-size:12px}
  .p1{background:rgba(63,185,80,.15);color:var(--pos)}
  .p0{background:rgba(210,153,34,.15);color:var(--neu)}
  .pn1{background:rgba(248,81,73,.15);color:var(--neg)}
  .verdict-line b{color:var(--ink)}
  .empty{color:var(--dim);text-align:center;padding:40px}
  .agree{color:var(--pos)} .disagree{color:var(--neg)}
  textarea{width:100%;background:#0d1117;border:1px solid var(--line);color:var(--ink);
        border-radius:8px;padding:6px;font:13px ui-sans-serif;margin-top:8px;display:none}
  textarea.show{display:block}
</style></head>
<body>
<header>
  <h1>🏛️ the Agora</h1>
  <a href="/agreement">agreement matrix →</a>
  <span class="who">reacting as</span><input id="who" placeholder="your name"/>
</header>
<div class="wrap" id="feed"><div class="empty">loading…</div></div>
<script>
const POL={"1":["p1","good"],"0":["p0","mixed"],"-1":["pn1","bad"]};
const DIM_POL={"novel":1,"feasible":1,"derivative":-1,"not-it":-1};
let reactor = new URLSearchParams(location.search).get("as")
  || localStorage.getItem("agora_reactor") || "guest";
localStorage.setItem("agora_reactor", reactor);
const whoEl=document.getElementById("who"); whoEl.value=reactor;
whoEl.addEventListener("change",()=>{ reactor=(whoEl.value||"guest").trim(); localStorage.setItem("agora_reactor",reactor); });
let voted = new Set(JSON.parse(localStorage.getItem("agora_voted_"+reactor)||"[]"));
function saveVoted(){ localStorage.setItem("agora_voted_"+reactor, JSON.stringify([...voted])); }

function chip(p){ const [cls,txt]=POL[String(p)]; return `<span class="chip ${cls}">${txt}</span>`; }
function labelLine(l){
  const pol = l.dimension?DIM_POL[l.dimension]:(l.kind==="afrit"?1:l.kind==="weed"?-1:0);
  const d = l.dissent!=null?` · dissent ${l.dissent}`:"";
  const note = l.note?` — <span class="sub">${l.note}</span>`:"";
  return `<div class="row">${chip(pol)} <b>${l.labeler}</b>: ${l.dimension||l.kind||"?"}${d}${note}</div>`;
}
function reveal(card, post, myDim){
  const myPol = DIM_POL[myDim];
  let html = `<div class="verdict-line row">${chip(myPol)} <b>you</b>: ${myDim}</div>`;
  (post.labels||[]).forEach(l=>{ html+=labelLine(l); });
  // quick agree/disagree call vs each machine labeler
  (post.labels||[]).forEach(l=>{
    const lp = l.dimension?DIM_POL[l.dimension]:(l.kind==="afrit"?1:l.kind==="weed"?-1:0);
    const ok = lp===myPol;
    html+=`<div class="row ${ok?'agree':'disagree'}">${ok?'✓ agree with':'✗ diverge from'} ${l.labeler}</div>`;
  });
  const r=card.querySelector(".reveal"); r.innerHTML=html; r.classList.add("show");
  card.querySelector(".react").style.display="none";
}
async function vote(card, post, emoji){
  const because = card.querySelector("textarea").value.trim();
  const res = await fetch("/api/verdict",{method:"POST",headers:{"content-type":"application/json"},
    body:JSON.stringify({post_id:post.post_id, reactor, emoji, because})});
  const data = await res.json();
  if(!data.ok){ alert("error: "+(data.error||"?")); return; }
  voted.add(post.post_id); saveVoted();
  reveal(card, post, data.dimension);
}
function render(posts){
  const feed=document.getElementById("feed"); feed.innerHTML="";
  const todo = posts.filter(p=>!voted.has(p.post_id));
  if(!todo.length){ feed.innerHTML='<div class="empty">No unreacted ideas. <a href="/agreement">See the agreement matrix →</a></div>'; return; }
  todo.forEach(post=>{
    const card=document.createElement("div"); card.className="card";
    const meta=[post.source||post.spawncidence_id, post.kind, post.exploration?"exploration":null].filter(Boolean)
      .map(t=>`<span class="tag">${t}</span>`).join("");
    card.innerHTML=`
      <div class="meta">${meta}</div>
      <div class="idea">${post.idea}</div>
      ${post.why_nonobvious?`<div class="sub"><b>why non-obvious:</b> ${post.why_nonobvious}</div>`:""}
      ${post.how_to_verify?`<div class="sub"><b>verify:</b> ${post.how_to_verify}</div>`:""}
      <textarea placeholder="optional: because… (richer signal)"></textarea>
      <div class="react"></div>
      <div class="reveal"></div>`;
    const react=card.querySelector(".react");
    Object.keys(EMOJI).forEach(e=>{
      const b=document.createElement("button"); b.textContent=e; b.title=EMOJI[e];
      b.onclick=()=>vote(card,post,e); react.appendChild(b);
    });
    const ta=card.querySelector("textarea");
    react.addEventListener("mouseenter",()=>ta.classList.add("show"),{once:true});
    feed.appendChild(card);
  });
}
const EMOJI=__EMOJI__;
fetch("/api/posts").then(r=>r.json()).then(d=>render(d.posts));
</script>
</body></html>
"""


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):  # quiet
        pass

    def _send(self, code: int, body: bytes, ctype: str) -> None:
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _json(self, code: int, obj) -> None:
        self._send(code, json.dumps(obj).encode(), "application/json; charset=utf-8")

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path == "/":
            emoji = {k: v for k, v in REACTION_MAP.items()}
            html = PAGE.replace("__EMOJI__", json.dumps(emoji))
            self._send(200, html.encode(), "text/html; charset=utf-8")
        elif path == "/api/posts":
            posts = [p.to_dict() for p in load_posts(dir_=LEDGER_DIR)]
            self._json(200, {"posts": posts})
        elif path == "/api/agreement":
            self._json(200, agreement(load_posts(dir_=LEDGER_DIR), load_verdicts(dir_=LEDGER_DIR)))
        elif path == "/agreement":
            self._send(200, _agreement_page().encode(), "text/html; charset=utf-8")
        else:
            self._json(404, {"error": "not found"})

    def do_POST(self) -> None:
        if urlparse(self.path).path != "/api/verdict":
            self._json(404, {"error": "not found"})
            return
        length = int(self.headers.get("Content-Length", 0))
        try:
            body = json.loads(self.rfile.read(length) or b"{}")
            token = body.get("emoji") or body.get("dimension")
            dimension = resolve_dimension(token)
            verdict = Verdict(
                post_id=body["post_id"],
                reactor=(body.get("reactor") or "anon").strip(),
                dimension=dimension,
                because=body.get("because", ""),
                weight=float(body.get("weight", 1.0)),
            )
            append_verdict(verdict, dir_=LEDGER_DIR)
            self._json(200, {"ok": True, "dimension": dimension})
        except Exception as e:  # noqa: BLE001 — surface any bad input to the client
            self._json(400, {"ok": False, "error": str(e)})


def _agreement_page() -> str:
    report = agreement(load_posts(dir_=LEDGER_DIR), load_verdicts(dir_=LEDGER_DIR))
    rows = []
    for p in report["pairs"]:
        pct = f"{p['rate']:.0%}"
        divs = "".join(
            f"<li><code>[{p['a']}:{d['a_pol']:+d} | {p['b']}:{d['b_pol']:+d}]</code> {d['idea']}</li>"
            for d in p["divergences"][:10]
        )
        rows.append(
            f"<div class='pair'><h3>{p['a']} <span>vs</span> {p['b']} "
            f"<em>{p['agree']}/{p['n']} = {pct}</em></h3><ul>{divs or '<li>no divergences</li>'}</ul></div>"
        )
    cov = " · ".join(f"{k}={v}" for k, v in report["labelers"].items())
    body = "".join(rows) or "<p class='dim'>No comparable pairs yet — need verdicts and ≥2 labelers.</p>"
    return f"""<!doctype html><html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/><title>agreement · the Agora</title>
<style>
 body{{margin:0;background:#0d1117;color:#e6edf3;font:15px/1.6 ui-sans-serif,-apple-system,Segoe UI,Roboto,Arial}}
 .wrap{{max-width:820px;margin:0 auto;padding:24px}}
 a{{color:#58a6ff;text-decoration:none}} h1{{font-size:20px}}
 .dim{{color:#8b949e}} .pair{{background:#161b22;border:1px solid #272e3a;border-radius:12px;padding:14px 18px;margin:14px 0}}
 .pair h3{{margin:0 0 8px;font-size:15px}} .pair h3 span{{color:#8b949e;font-weight:400}}
 .pair h3 em{{float:right;color:#d29922;font-style:normal}}
 .pair ul{{margin:6px 0 0;padding-left:18px}} .pair li{{margin:4px 0;font-size:13px;color:#c9d1d9}}
 code{{color:#8b949e;font-size:12px}}
</style></head><body><div class="wrap">
<p><a href="/">← back to the square</a></p>
<h1>Agreement matrix</h1>
<p class="dim">{report['n_posts']} posts · {report['n_verdicts']} verdicts · labelers: {cov}</p>
<p class="dim">Sorted most-divergent first — that's where the information (and the tuning signal) lives.</p>
{body}
</div></body></html>"""


def main() -> None:
    global LEDGER_DIR
    ap = argparse.ArgumentParser(description="agora — local verdict square")
    ap.add_argument("--dir", default=str(DEFAULT_DIR), help="ledger directory")
    ap.add_argument("--port", type=int, default=8787)
    ap.add_argument("--host", default="127.0.0.1")
    args = ap.parse_args()
    LEDGER_DIR = Path(args.dir).resolve()
    LEDGER_DIR.mkdir(parents=True, exist_ok=True)
    srv = ThreadingHTTPServer((args.host, args.port), Handler)
    print(f"the Agora is open  →  http://{args.host}:{args.port}")
    print(f"ledger: {LEDGER_DIR}")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nthe Agora closes.")


if __name__ == "__main__":
    main()
