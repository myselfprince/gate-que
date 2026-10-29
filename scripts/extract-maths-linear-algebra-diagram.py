"""Reproduce the reviewed Q6.65 graph-only crop, including both self-loops."""
import hashlib
import io
import json
from pathlib import Path
import pypdfium2 as pdfium

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r'C:\Users\Prince\Desktop\MadeEasy PYQ PDF\11. Engg. Maths\2. Linear Algebra.pdf')
SOURCE_HASH = 'db82237929f2ad56a350754384712fa8e74edf893fb7cc827830d06e9bcd9337'
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SOURCE_HASH
with pdfium.PdfDocument(SOURCE) as pdf:
    image = pdf[3].render(scale=6).to_pil()
    assert image.size == (3672, 2754)
    # Coordinates in the right half at 6x, visually reviewed separately.
    bounds = (980, 470, 1440, 770)
    crop = image.crop((1836+bounds[0], bounds[1], 1836+bounds[2], bounds[3]))
    buffer = io.BytesIO()
    crop.save(buffer, format='PNG')
    content = buffer.getvalue()
target = ROOT / 'public/11. Engg. Maths/2. Linear Algebra/linear-algebra-6-65-graph.png'
target.parent.mkdir(parents=True, exist_ok=True)
if target.exists():
    assert target.read_bytes() == content, 'Existing crop differs; review before replacement.'
else:
    target.write_bytes(content)
manifest = {'sourceSHA256': SOURCE_HASH, 'crops': [{'file': target.name, 'pdfPage': 4, 'bookPage': 101,
    'half': 2, 'boundsAt6x': bounds, 'size': crop.size, 'sha256': hashlib.sha256(content).hexdigest()}]}
(ROOT / 'data/imports/maths-linear-algebra-diagrams.json').write_text(json.dumps(manifest, indent=2), encoding='utf8')
print(json.dumps(manifest))
