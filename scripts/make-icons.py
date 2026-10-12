"""Generate the PWA / home-screen icons from rasa-logo.png.

Usage: python scripts/make-icons.py

Writes to icons/:
  icon-192.png, icon-512.png        logo at 72% on black ("any" purpose)
  maskable-512.png                  logo at 56% on black (inside Android's safe zone)
  apple-touch-icon.png (180x180)    logo at 70% on black (iOS adds its own rounding)
  favicon-32.png                    small browser-tab icon
"""
from pathlib import Path

from PIL import Image

BG = (0, 0, 0, 255)
OUT = Path("icons")


def logo() -> Image.Image:
    img = Image.open("rasa-logo.png").convert("RGBA")
    return img.crop(img.getbbox())  # trim the transparent margin


def make(size: int, scale: float, name: str, base: Image.Image) -> None:
    canvas = Image.new("RGBA", (size, size), BG)
    mark = base.copy()
    mark.thumbnail((int(size * scale), int(size * scale)), Image.LANCZOS)
    canvas.alpha_composite(mark, ((size - mark.width) // 2, (size - mark.height) // 2))
    canvas.convert("RGB").save(OUT / name, "PNG", optimize=True)
    print(f"{name}: {size}x{size}, {(OUT / name).stat().st_size // 1024} KB")


def main() -> None:
    OUT.mkdir(exist_ok=True)
    base = logo()
    make(192, 0.72, "icon-192.png", base)
    make(512, 0.72, "icon-512.png", base)
    make(512, 0.56, "maskable-512.png", base)
    make(180, 0.70, "apple-touch-icon.png", base)
    make(32, 0.86, "favicon-32.png", base)


if __name__ == "__main__":
    main()
