"""Crop only reviewed bit-field figures; all prose, options and tables stay editable."""
from pathlib import Path
import hashlib
import json
import fitz

source = Path(r'C:\Users\Prince\Desktop\MadeEasy PYQ PDF\9. Digital Logic\4. Number Systems.pdf')
assert hashlib.sha256(source.read_bytes()).hexdigest() == 'ed9441210bdacb32ed28da2d4aff0f8f436be776f690e2fbbe1bdf293e699c28'
root = Path('public/9. Digital Logic/4. Number Systems')
root.mkdir(parents=True, exist_ok=True)
pdf = fitz.open(source)
# Coordinates are in the original 612 x 459 PDF page coordinate space.
crops = [
    ('4', 1, (346, 215, 416, 236)),
    ('16', 2, (64, 106, 155, 127)),
    ('25-26', 2, (178, 188, 287, 218)),
    ('53', 3, (211, 341, 276, 353)),
    ('61', 3, (456, 199, 551, 219)),
]
manifest = []
for name, page, rect in crops:
    file = f'number-systems-4-{name}.png'
    pix = pdf[page - 1].get_pixmap(matrix=fitz.Matrix(7, 7), clip=fitz.Rect(*rect))
    pix.save(root / file)
    manifest.append({'file': file, 'pdfPage': page, 'rect': rect, 'sha256': hashlib.sha256((root / file).read_bytes()).hexdigest()})
Path('data/imports/digital-logic-number-systems-diagrams.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps(manifest, indent=2))
