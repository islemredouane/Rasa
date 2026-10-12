"""Resize and compress event photos for a web gallery.

Usage: python scripts/optimize-gallery.py <source_dir> <output_dir> [max_side]

Every image in <source_dir> is resized so its longest side is at most
max_side (default 1600 px), keeping its aspect ratio, and saved as
<source name>.webp (lowercase, dashes), so adding or removing a photo
never renames the others.
"""
import re
import sys
from pathlib import Path

from PIL import Image, ImageOps
from pillow_heif import register_heif_opener

register_heif_opener()

EXTS = {".jpg", ".jpeg", ".png", ".heic", ".webp"}


def main(src: Path, out: Path, max_side: int) -> None:
    out.mkdir(parents=True, exist_ok=True)
    files = sorted(f for f in src.iterdir() if f.suffix.lower() in EXTS)
    for f in files:
        img = ImageOps.exif_transpose(Image.open(f)).convert("RGB")
        img.thumbnail((max_side, max_side), Image.LANCZOS)
        dest = out / (re.sub(r"[^a-z0-9]+", "-", f.stem.lower()).strip("-") + ".webp")
        img.save(dest, "WEBP", quality=78, method=6)
        print(f"{f.name} -> {dest.name} {img.size[0]}x{img.size[1]} ({dest.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(sys.argv[2]), int(sys.argv[3]) if len(sys.argv) > 3 else 1600)
