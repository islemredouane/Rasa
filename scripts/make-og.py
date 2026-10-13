"""Render the social preview images (Open Graph / Twitter cards), one per page.

Usage: python scripts/make-og.py

Each card is scripts/og/card.html filled with the values below and rendered at 1200x630 with
headless Chrome/Edge (real Offside/Quicksand fonts), then saved as images/og/<name>.jpg.
The names are referenced from PAGES in scripts/build.mjs.
"""
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from urllib.parse import urlencode

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / "scripts" / "og" / "card.html"
OUT = ROOT / "images" / "og"

CARDS = {
    "default": dict(title="Rasa Club", eyebrow="Cultural & artistic club · ESTIN Béjaïa",
                    line="Feel the emotion. Live the expression.", img="images/rasa ai2.png", fit="contain",
                    stat="11", statLabel="activities in 2025/26"),
    "events": dict(title="Events", eyebrow="Rasa Club · ESTIN Béjaïa",
                   line="What's coming next, and every moment we lived together.",
                   img="images/events/2025-26/welcome-day/cover.webp", stat="11", statLabel="activities · 2025/26"),
    "literature": dict(title="Literature Department", eyebrow="Rasa Club · Literature",
                       line="Reading, book fairs, the Speaking Club and three libraries.",
                       img="images/events/2025-26/sila/cover.webp"),
    "english": dict(title="English Library", eyebrow="Rasa Club · Literature",
                    line="Our English book picks, readable right in the browser.", img="images/harry potter.png"),
    "french": dict(title="French Library", eyebrow="Rasa Club · Literature",
                   line="Nos lectures en français, à lire directement sur le site.", img="images/peste.png"),
    "arabic": dict(title="Arabic Library", eyebrow="Rasa Club · Literature",
                   line="Our Arabic book picks, readable right in the browser.", img="images/Back to haifa.png"),
    "art": dict(title="Art Department", eyebrow="Rasa Club · Art",
                line="Drawing, painting and paper quilling by our members.",
                img="images/photo_5782752836901866859_w.jpg"),
    "music": dict(title="Music Department", eyebrow="Rasa Club · Music",
                  line="Musical evenings, instruments and students who play together.",
                  img="images/photo_6037583180832902927_y.jpg"),
    "chess": dict(title="Chess Department", eyebrow="Rasa Club · Chess",
                  line="Training, puzzles and the RASA Chess Cup.", img="images/chess-cup-2026/9.webp",
                  stat="24", statLabel="players · Chess Cup 2026"),
    "activities": dict(title="Activities Department", eyebrow="Rasa Club · Activities",
                       line="Games, tournaments and fun moments beyond lectures.", img="images/IMG_1252.JPG"),
    "charity": dict(title="Charity Department", eyebrow="Rasa Club · Charity",
                    line="Small hands, big hearts: solidarity with accredited associations."),
    "recruitment": dict(title="Join the core team", eyebrow="Recruitment · 2026/27",
                        line="Graphic designers · External relations"),
}

CANDIDATES = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "google-chrome",
    "chromium",
]


def browser() -> str:
    for c in CANDIDATES:
        if Path(c).exists() or shutil.which(c):
            return c
    sys.exit("No Chrome/Edge found. Install one or edit CANDIDATES.")


def render(name: str, params: dict) -> None:
    url = TEMPLATE.as_uri() + "?" + urlencode(params)
    with tempfile.TemporaryDirectory() as tmp:
        png = Path(tmp) / "card.png"
        subprocess.run(
            [browser(), "--headless=new", f"--user-data-dir={Path(tmp) / 'profile'}", "--hide-scrollbars",
             "--force-device-scale-factor=1", "--window-size=1200,630", "--virtual-time-budget=6000",
             "--allow-file-access-from-files", f"--screenshot={png}", url],
            check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120,
        )
        dest = OUT / f"{name}.jpg"
        Image.open(png).convert("RGB").save(dest, "JPEG", quality=88, optimize=True, progressive=True)
    print(f"{dest.relative_to(ROOT)}: {dest.stat().st_size // 1024} KB")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    only = set(sys.argv[1:])
    for name, params in CARDS.items():
        if not only or name in only:
            render(name, params)


if __name__ == "__main__":
    main()
