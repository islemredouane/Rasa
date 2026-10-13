"""Render the README images with headless Chrome/Edge (no extra dependencies).

Usage (from the repo root, with the preview server running: python scripts/serve.py):
    python scripts/render-readme-assets.py

1. Screenshots the live local site into .github/assets/src/shots/
   (desktop 1440x900 and mobile 390x844, both at 2x).
2. Renders .github/assets/src/{banner,stats,preview}.html at 2x with a transparent background.
3. Saves .github/assets/banner.webp, stats.webp and preview.webp, 1760 px wide.
"""
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / ".github" / "assets" / "src"
OUT = ROOT / ".github" / "assets"
SITE = "http://127.0.0.1:5510"

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


def shoot(url: str, out: Path, width: int, height: int, transparent: bool = False, mobile: bool = False) -> None:
    with tempfile.TemporaryDirectory() as profile:  # throwaway profile: never touches your browser
        args = [
            browser(),
            "--headless=new",
            f"--user-data-dir={profile}",
            "--hide-scrollbars",
            "--force-device-scale-factor=2",
            f"--window-size={width},{height}",
            "--virtual-time-budget=6000",  # let fonts, images and scripts settle
            f"--screenshot={out}",
        ]
        if transparent:
            args.append("--default-background-color=00000000")
        if mobile:
            args.append(
                "--user-agent=Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
                "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
            )
        args.append(url)
        subprocess.run(args, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120)
    print(f"  {out.relative_to(ROOT) if out.is_relative_to(ROOT) else out.name}")


def to_webp(png: Path, name: str, width: int = 1760) -> None:
    img = Image.open(png).convert("RGBA")
    img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
    dest = OUT / name
    img.save(dest, "WEBP", quality=90, method=6)
    print(f"  {dest.relative_to(ROOT)}  {img.width}x{img.height}  {dest.stat().st_size // 1024} KB")


def main() -> None:
    (SRC / "shots").mkdir(parents=True, exist_ok=True)
    print("site screenshots")
    shoot(f"{SITE}/", SRC / "shots" / "desktop.png", 1440, 900)
    # phone: an exact 390 px frame inside a 500 px window, then cropped to the frame
    mobile = SRC / "shots" / "mobile.png"
    shoot(f"{SITE}/.github/assets/src/shot-frame.html?u=/events&w=390&h=844", mobile, 500, 844, mobile=True)
    Image.open(mobile).crop((0, 0, 390 * 2, 844 * 2)).save(mobile)

    print("README images")
    with tempfile.TemporaryDirectory() as tmp:
        for name, (w, h) in {"banner": (1280, 440), "stats": (1280, 300), "preview": (1280, 720)}.items():
            png = Path(tmp) / f"{name}.png"
            shoot((SRC / f"{name}.html").as_uri(), png, w, h, transparent=True)
            to_webp(png, f"{name}.webp")


if __name__ == "__main__":
    main()
