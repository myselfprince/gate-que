"""Diagram-only source crops from the visually reviewed scanned spreads."""
import hashlib
import io
import json
import sys
from pathlib import Path
import pypdfium2 as pdfium

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r'C:\Users\Prince\Desktop\MadeEasy PYQ PDF\6. Data Structures\5. Graphs.pdf')
SOURCE_HASH = '4e81d5c512edbe016342f79be6bcde4e2c53124be6af9db2a1c6b439f84417b3'
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SOURCE_HASH
DEST = ROOT / 'public/6. Data Structures/5. Graphs'
DEST.mkdir(parents=True, exist_ok=True)
# PDF page, book page, half-spread, bounds on the 4x source render.
CROPS = {
    'graphs-6-1': (1, 402, 1, (225, 405, 440, 658)),
    'graphs-6-4': (1, 402, 1, (190, 1377, 482, 1592)),
    'graphs-6-14': (1, 403, 2, (755, 586, 1025, 733)),
    'graphs-6-15': (1, 403, 2, (702, 898, 1068, 1128)),
    'graphs-6-17': (2, 404, 1, (138, 320, 510, 443)),
    'graphs-6-18': (2, 404, 1, (184, 518, 463, 658)),
    'graphs-6-21': (2, 404, 1, (225, 1405, 458, 1548)),
}
manifest = {'sourceSHA256': SOURCE_HASH, 'crops': []}
with pdfium.PdfDocument(SOURCE) as pdf:
    for name, (number, book, side, bounds) in CROPS.items():
        image = pdf[number-1].render(scale=6).to_pil()
        x0, y0, x1, y1 = bounds
        shift = 1224 if side == 2 else 0
        crop = image.crop(tuple(round(v*1.5) for v in (x0+shift, y0, x1+shift, y1)))
        buffer = io.BytesIO()
        crop.save(buffer, format='PNG')
        content = buffer.getvalue()
        target = DEST / (name+'.png')
        if target.exists() and '--refresh-reviewed-crops' not in sys.argv:
            assert target.read_bytes() == content, f'Existing crop differs: {target}'
        else:
            target.write_bytes(content)
        manifest['crops'].append({'file': target.name, 'pdfPage': number, 'bookPage': book,
                                  'half': side, 'boundsAt4x': bounds, 'size': crop.size,
                                  'sha256': hashlib.sha256(content).hexdigest()})
(ROOT / 'data/imports/data-structures-graphs-diagrams.json').write_text(json.dumps(manifest, indent=2), encoding='utf8')
print(f'{len(CROPS)} diagram crops verified')
