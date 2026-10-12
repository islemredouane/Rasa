"""Generate the 1200x630 social preview images (Open Graph / Twitter cards).

Usage: python scripts/make-og.py

Writes images/og/<name>.jpg. Each card: black background with an orange glow,
the Rasa logo, a title and a subtitle; some cards add a photo on the right.
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

W, H = 1200, 630
ORANGE = (234, 106, 31)
FONTS = Path(__file__).parent / "fonts"
OUT = Path("images/og")

CARDS = {
    "default": ("Rasa Club", "Cultural club of ESTIN Béjaïa", "Feel the emotion. Live the expression.", None),
    "events": ("Events", "Rasa Club · ESTIN Béjaïa", "What's next and every moment we lived together", "images/events/upcoming/welcome-day-2026/cover.webp"),
    "chess": ("Chess", "Rasa Club · ESTIN Béjaïa", "RASA Chess Cup 2026 · 24 players · 3 days", "images/chess-cup-2026/9.webp"),
    "charity": ("Charity", "Rasa Club · ESTIN Béjaïa", "Small hands, big hearts", None),
    "recruitment": ("Join the team", "Rasa Club · 2026/27", "Graphic designers · External relations", None),
}


def glow(size, center, radius, alpha):
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).ellipse(
        (center[0] - radius, center[1] - radius, center[0] + radius, center[1] + radius), fill=ORANGE + (alpha,)
    )
    return layer.filter(ImageFilter.GaussianBlur(radius // 2))


def card(title, subtitle, tagline, photo):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    img.alpha_composite(glow((W, H), (200, 120), 260, 90))
    img.alpha_composite(glow((W, H), (1100, 600), 200, 40))

    text_right = W - 80
    if photo:
        ph = ImageOps.fit(ImageOps.exif_transpose(Image.open(photo)).convert("RGB"), (470, H), Image.LANCZOS)
        mask = Image.new("L", (470, H), 255)
        fade = Image.linear_gradient("L").rotate(90).resize((160, H))  # fade the photo's left edge into black
        mask.paste(fade, (0, 0))
        img.paste(ph, (W - 470, 0), mask)
        text_right = W - 470

    logo = Image.open("rasa-logo.png").convert("RGBA")
    logo = logo.crop(logo.getbbox())
    logo.thumbnail((110, 110), Image.LANCZOS)
    img.alpha_composite(logo, (80, 70))

    d = ImageDraw.Draw(img)
    width = text_right - 80
    size = 120
    while size > 60:
        f_title = ImageFont.truetype(str(FONTS / "Offside-Regular.ttf"), size)
        if d.textlength(title, font=f_title) <= width:
            break
        size -= 4
    f_sub = ImageFont.truetype(str(FONTS / "Quicksand-Bold.ttf"), 38)
    f_tag = ImageFont.truetype(str(FONTS / "Quicksand-Bold.ttf"), 30)

    d.text((80, 250), title, font=f_title, fill=(255, 255, 255))
    d.text((80, 250 + size + 24), subtitle, font=f_sub, fill=ORANGE)
    d.text((80, 250 + size + 84), tagline, font=f_tag, fill=(170, 170, 178))
    d.rectangle((80, 560, 200, 566), fill=ORANGE)
    d.text((220, 545), "rasa-off.vercel.app", font=f_tag, fill=(120, 120, 128))
    return img.convert("RGB")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, (title, subtitle, tagline, photo) in CARDS.items():
        path = OUT / f"{name}.jpg"
        card(title, subtitle, tagline, photo).save(path, "JPEG", quality=86, optimize=True, progressive=True)
        print(f"{path}: {path.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
