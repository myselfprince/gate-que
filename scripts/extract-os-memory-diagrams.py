"""Repeat-safe figure-only crops from the visually reviewed source spreads."""
import hashlib
import io
import json
from pathlib import Path
import pypdfium2 as pdfium

SOURCE = Path(r'C:\Users\Prince\Desktop\MadeEasy PYQ PDF\5. Operating Systems\4. Mem. Mgmt and Virtual Mem.pdf')
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == '0992bce7880081db8630d9bfe90fd3944ae64f56620b0c652dd491b85d9f0cd6'
ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'public' / '5. Operating Systems' / '4. Mem. Mgmt and Virtual Mem'
DEST.mkdir(parents=True, exist_ok=True)
CROPS = [(11, 0, (1405/1836, 1004/1278, 1795/1836, 1245/1278), 'overlay'),
         (67, 3, (1454/1836, 1030/1273, 1793/1836, 1118/1273), 'address')]
manifest = []
with pdfium.PdfDocument(SOURCE) as pdf:
    for number, page, bounds, label in CROPS:
        image = pdf[page].render(scale=8).to_pil()
        w, h = image.size
        crop = image.crop(tuple(round(v*(w if i % 2 == 0 else h)) for i, v in enumerate(bounds)))
        output = io.BytesIO()
        crop.save(output, format='PNG')
        target = DEST / f'os-memory-{number}-{label}.png'
        if target.exists():
            assert target.read_bytes() == output.getvalue(), 'Existing crop differs; review before replacement.'
        else:
            target.write_bytes(output.getvalue())
        manifest.append({'question': f'4.{number}', 'pdfPage': page+1, 'boundsNormalized': bounds,
                         'file': target.name, 'sha256': hashlib.sha256(output.getvalue()).hexdigest()})
(ROOT / 'data/imports/os-memory-diagrams.json').write_text(json.dumps(manifest, indent=2)+'\n')
print(json.dumps(manifest, indent=2))
