"""Generate the PWA / home-screen icons from rasa-logo.png.

Usage: python scripts/make-icons.py

Writes to icons/:
  icon-192.png, icon-512.png        logo at 72% on black ("any" purpose)
  maskable-512.png                  logo at 56% on black (inside Android's safe zone)
  apple-touch-icon.png (180x180)    logo at 70% on black (iOS adds its own rounding)
  favicon-16.png, favicon-32.png    small browser-tab icons
  ../favicon.ico                    16/32/48 px, the file browsers request by default
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
    make(16, 0.90, "favicon-16.png", base)
    # favicon.ico at the site root: browsers and crawlers ask for it even without a <link>
    sizes = [(16, 16), (32, 32), (48, 48)]
    big = Image.new("RGBA", (256, 256), BG)
    mark = base.copy()
    mark.thumbnail((int(256 * 0.86), int(256 * 0.86)), Image.LANCZOS)
    big.alpha_composite(mark, ((256 - mark.width) // 2, (256 - mark.height) // 2))
    big.save("favicon.ico", sizes=sizes)
    print(f"favicon.ico: {', '.join(f'{w}px' for w, _ in sizes)}, {Path('favicon.ico').stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
