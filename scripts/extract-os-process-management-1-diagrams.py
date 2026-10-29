"""Checksum-guarded, figure-only crops from all five visually reviewed spreads."""
import hashlib
import io
from pathlib import Path
import pypdfium2 as pdfium

SOURCE = Path(r'C:\Users\Prince\Desktop\MadeEasy PYQ PDF\5. Operating Systems\1. Process Management-1.pdf')
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == '8b722f6546557c3c79df71dd2368e9fa007049a95ed17ab57a6169fd0d063ae5'
DEST = Path(__file__).resolve().parents[1] / 'public' / '5. Operating Systems' / '1. Process Management-1'
DEST.mkdir(parents=True, exist_ok=True)
CROPS = [
    (3, 0, (150/1888, 691/1336, 435/1888, 869/1336)),
    (28, 1, (534/1856, 1081/1338, 922/1856, 1280/1338)),
    (38, 2, (113/1916, 673/1312, 458/1916, 828/1312)),
]
with pdfium.PdfDocument(SOURCE) as pdf:
    for number, page, bounds in CROPS:
        image = pdf[page].render(scale=8).to_pil()
        w, h = image.size
        crop = image.crop(tuple(round(v*(w if i % 2 == 0 else h)) for i, v in enumerate(bounds)))
        output = io.BytesIO()
        crop.save(output, format='PNG')
        target = DEST / f'os-process-management-1-{number}-state-diagram.png'
        if target.exists():
            assert target.read_bytes() == output.getvalue(), 'Existing crop differs; review before replacement.'
        else:
            target.write_bytes(output.getvalue())
        print(target, hashlib.sha256(output.getvalue()).hexdigest())
