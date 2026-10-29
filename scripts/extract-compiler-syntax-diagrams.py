"""Reproduce figure-only crops from the two visually reviewed scanned spreads."""
import hashlib
import io
import json
from pathlib import Path
import pypdfium2 as pdfium

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r'C:\Users\Prince\Desktop\MadeEasy PYQ PDF\10. Compiler Design\3. Syntax Directed Translations.pdf')
HASH = 'a763257c9796c375d591a6be074d495f2287a0ab620069d0f1dd32c5f669bc90'
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == HASH
DEST = ROOT / 'public/10. Compiler Design/3. Syntax Directed Translations'
DEST.mkdir(parents=True, exist_ok=True)
# Bounds in the 4x rendered spread; crops include only the trees and leaf labels.
CROPS = {'syntax-3-13': (1, 505, (1880, 1315, 2367, 1558)),
         'syntax-3-18': (2, 506, (258, 1403, 493, 1631))}
manifest = {'sourceSHA256': HASH, 'crops': []}
with pdfium.PdfDocument(SOURCE) as pdf:
    for name, (number, book, bounds) in CROPS.items():
        full = pdf[number-1].render(scale=6).to_pil()
        crop = full.crop(tuple(round(v*1.5) for v in bounds))
        buffer = io.BytesIO()
        crop.save(buffer, format='PNG')
        content = buffer.getvalue()
        target = DEST / (name + '.png')
        if target.exists():
            assert target.read_bytes() == content
        else:
            target.write_bytes(content)
        manifest['crops'].append({'file': target.name, 'pdfPage': number, 'bookPage': book,
                                  'boundsAt4x': bounds, 'size': crop.size,
                                  'sha256': hashlib.sha256(content).hexdigest()})
(ROOT / 'data/imports/compiler-syntax-diagrams.json').write_text(json.dumps(manifest, indent=2), encoding='utf8')
print('2 figure-only crops verified')
