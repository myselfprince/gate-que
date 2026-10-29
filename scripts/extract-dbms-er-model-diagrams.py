"""Reproduce five diagram-only crops from both visually reviewed source spreads."""
import hashlib
import io
import json
from pathlib import Path
import pypdfium2 as pdfium
from PIL import Image

SOURCE = Path(r'C:\Users\Prince\Desktop\MadeEasy PYQ PDF\12. DBMS\1. ER Model.pdf')
SOURCE_HASH = 'aab96c4034d58b63448c7e115b78a124483163c42875a59c7c4b4dab2a917991'
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SOURCE_HASH
ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'public/12. DBMS/1. ER Model'
DEST.mkdir(parents=True, exist_ok=True)
CROPS = [
    ('er-model-1-1', 1, 597, (1308, 874, 1780, 1022)),
    ('er-model-1-2', 1, 597, (1368, 1268, 1715, 1318)),
    ('er-model-1-3', 1, 597, (1903, 458, 2290, 536)),
    ('er-model-1-6-7', 2, 598, (110, 217, 632, 352)),
    ('er-model-1-13', 2, 599, (1310, 216, 2220, 798)),
]
manifest = {'sourceSHA256': SOURCE_HASH, 'crops': []}
with pdfium.PdfDocument(SOURCE) as pdf:
    for name, page_number, book_page, bounds in CROPS:
        page = pdf[page_number-1]
        image = page.render(scale=4800/page.get_width()).to_pil()
        crop = image.crop(tuple(v*2 for v in bounds))
        regions = None
        if name == 'er-model-1-13':
            # Tight individual crops exclude the slanted prose above candidate
            # (ii). Place the four figures in their original labelled 2x2 order.
            regions = [(1310,216,1770,510),(1780,264,2220,512),
                       (1310,525,1770,798),(1780,532,2220,798)]
            crop = Image.new('RGB', (1880, 1220), 'white')
            for index, region in enumerate(regions):
                tile = image.crop(tuple(v*2 for v in region))
                crop.paste(tile, ((index%2)*960, (index//2)*620))
        buffer = io.BytesIO()
        crop.save(buffer, format='PNG')
        content = buffer.getvalue()
        target = DEST / (name + '.png')
        if target.exists():
            assert target.read_bytes() == content, 'Existing reviewed crop differs'
        else:
            target.write_bytes(content)
        manifest['crops'].append({'file':target.name, 'pdfPage':page_number, 'bookPage':book_page,
            'boundsAt2400pxSpread':bounds, 'figureRegionsAt2400pxSpread':regions,
            'size':crop.size, 'sha256':hashlib.sha256(content).hexdigest()})
(ROOT / 'data/imports/dbms-er-model-diagrams.json').write_text(json.dumps(manifest, indent=2), encoding='utf8')
print('Five source figure crops verified')
