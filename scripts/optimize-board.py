"""Crop and compress board photos for the website.

Usage: python scripts/optimize-board.py <source_dir> <output_dir>

Each source file is named "<full name> - <role>.<ext>". The output is a
600x600 WebP named after the person (lowercase, dashes), cropped to a square
biased toward the top of the photo so faces stay in frame.
"""
import re
import sys
import unicodedata
from pathlib import Path

from PIL import Image, ImageOps
from pillow_heif import register_heif_opener

register_heif_opener()

SIZE = 600
EXTS = {".jpg", ".jpeg", ".png", ".heic", ".webp"}


def slugify(name: str) -> str:
    name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    name = name.replace("_", " ").lower()
    return re.sub(r"[^a-z0-9]+", "-", name).strip("-")


def square_crop_top(img: Image.Image) -> Image.Image:
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    # Portraits: keep the head by taking the crop from 15% of the excess height.
    top = int((h - side) * 0.15)
    return img.crop((left, top, left + side, top + side))


def main(src: Path, out: Path) -> None:
    out.mkdir(parents=True, exist_ok=True)
    for f in sorted(src.iterdir()):
        if f.suffix.lower() not in EXTS:
            continue
        person = f.stem.split(" - ")[0].strip()
        img = ImageOps.exif_transpose(Image.open(f)).convert("RGB")
        img = square_crop_top(img).resize((SIZE, SIZE), Image.LANCZOS)
        dest = out / f"{slugify(person)}.webp"
        img.save(dest, "WEBP", quality=80, method=6)
        print(f"{f.name} -> {dest.name} ({dest.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(sys.argv[2]))
