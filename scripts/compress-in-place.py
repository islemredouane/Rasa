"""Shrink heavy site images without renaming them (so no HTML needs to change).

Usage: python scripts/compress-in-place.py <min_kb> <max_side> <file> [<file> ...]

Each file larger than <min_kb> is resized so its longest side is at most
<max_side> px and re-saved in the same format (JPEG quality 82, progressive;
PNG optimised). A file is only overwritten when the result is smaller.
"""
import io
import sys
from pathlib import Path

from PIL import Image, ImageOps


def compress(path: Path, max_side: int) -> tuple[int, int]:
    before = path.stat().st_size
    img = ImageOps.exif_transpose(Image.open(path))
    img.thumbnail((max_side, max_side), Image.LANCZOS)
    buf = io.BytesIO()
    if path.suffix.lower() in (".jpg", ".jpeg"):
        img.convert("RGB").save(buf, "JPEG", quality=82, optimize=True, progressive=True)
    else:
        img.save(buf, "PNG", optimize=True)
    after = buf.tell()
    if after < before:
        path.write_bytes(buf.getvalue())
        return before, after
    return before, before


def main() -> None:
    min_kb, max_side, files = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3:]
    total_before = total_after = 0
    for name in files:
        p = Path(name)
        if p.stat().st_size < min_kb * 1024:
            continue
        b, a = compress(p, max_side)
        total_before += b
        total_after += a
        print(f"{p}: {b // 1024} KB -> {a // 1024} KB")
    print(f"total: {total_before / 1e6:.1f} MB -> {total_after / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
