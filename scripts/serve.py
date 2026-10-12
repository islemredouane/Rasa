"""Local preview server that behaves like Vercel with cleanUrls and the
redirects from vercel.json.

Usage (from the repo root):  python scripts/serve.py [port]   (default 5510)

  /events          -> serves events.html
  /events.html     -> 308 redirect to /events
  /index.html      -> 308 redirect to /
  redirects listed in vercel.json are applied first
"""
import json
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent.parent
REDIRECTS = {
    r["source"]: r["destination"]
    for r in json.loads((ROOT / "vercel.json").read_text(encoding="utf-8")).get("redirects", [])
}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".webmanifest": "application/manifest+json",
        ".webp": "image/webp",
        ".js": "application/javascript",
    }

    def _redirect(self, location: str) -> None:
        self.send_response(308)
        self.send_header("Location", location)
        self.end_headers()

    def do_GET(self):
        parts = urlsplit(self.path)
        path, query = parts.path, ("?" + parts.query if parts.query else "")

        if path in REDIRECTS:
            return self._redirect(REDIRECTS[path] + query)
        if path.endswith(".html"):
            clean = path[: -len(".html")]
            return self._redirect(("/" if clean in ("/index", "") else clean) + query)
        if path != "/" and "." not in path.rsplit("/", 1)[-1]:
            candidate = ROOT / (path.lstrip("/") + ".html")
            if candidate.is_file():
                self.path = path + ".html" + query
        return super().do_GET()

    def end_headers(self):
        if self.path.split("?")[0].endswith(("sw.js", ".webmanifest")):
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5510
    print(f"Serving {ROOT} on http://127.0.0.1:{port}")
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
