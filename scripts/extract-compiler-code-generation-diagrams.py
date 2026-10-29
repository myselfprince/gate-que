"""Checksum guarded figure-only crops, coordinates in reviewed 3.5x half-spreads."""
import hashlib
import io
import json
from pathlib import Path
import pypdfium2 as pdfium

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r'C:\Users\Prince\Desktop\MadeEasy PYQ PDF\10. Compiler Design\4. Code Generations and Optimizatinos.pdf')
HASH = 'b5fc5757b77aca121115807eeeed9846c69768c0112ce5d241c400a40b007b0e'
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == HASH
DEST = ROOT / 'public/10. Compiler Design/4. Code Generations and Optimizatinos'
DEST.mkdir(parents=True, exist_ok=True)
CROPS = {
    'compiler-4-4-A': (1, 1, (650, 290, 810, 578)),
    'compiler-4-4-B': (1, 1, (850, 310, 1010, 580)),
    'compiler-4-4-C': (1, 1, (655, 580, 815, 886)),
    'compiler-4-4-D': (1, 1, (850, 583, 1030, 890)),
    'compiler-4-5-A': (1, 2, (120, 175, 355, 390)),
    'compiler-4-5-B': (1, 2, (120, 390, 355, 604)),
    'compiler-4-5-C': (1, 2, (120, 604, 355, 772)),
    'compiler-4-5-D': (1, 2, (120, 772, 355, 978)),
    'compiler-4-13-flow': (2, 1, (185, 914, 475, 1120)),
    'compiler-4-26-flow': (3, 1, (145, 627, 465, 1053)),
}
manifest = {'sourceSHA256': HASH, 'crops': []}
with pdfium.PdfDocument(SOURCE) as pdf:
    for name, (page, half, bounds) in CROPS.items():
        image = pdf[page-1].render(scale=7).to_pil()
        shift = 1071 if half == 2 else 0
        x0, y0, x1, y1 = bounds
        crop = image.crop(tuple(v*2 for v in (x0+shift, y0, x1+shift, y1)))
        buffer = io.BytesIO()
        crop.save(buffer, format='PNG')
        content = buffer.getvalue()
        target = DEST / f'{name}.png'
        if target.exists():
            assert target.read_bytes() == content, f'Existing crop differs: {target}'
        else:
            target.write_bytes(content)
        manifest['crops'].append({'file': target.name, 'pdfPage': page, 'bookPage': 512+2*(page-1)+half-1,
            'half': half, 'boundsAt3Point5x': bounds, 'size': crop.size, 'sha256': hashlib.sha256(content).hexdigest()})
(ROOT / 'data/imports/compiler-code-generation-diagrams.json').write_text(json.dumps(manifest, indent=2), encoding='utf8')
print(f'{len(CROPS)} diagram-only crops verified')
