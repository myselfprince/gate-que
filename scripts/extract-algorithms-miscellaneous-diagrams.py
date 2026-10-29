"""Reproducible diagram-only crops from the visually reviewed source spreads."""
import hashlib
import io
import json
from pathlib import Path
import pypdfium2 as pdfium

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r'C:/Users/Prince/Desktop/MadeEasy PYQ PDF/7. Algorithms/6. Muscellaneous Topics.pdf')
SHA256 = 'fae38049bc4f47e237f9ba4378bc2182f7eb8815c95f306f4666689e6df95bb0'
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SHA256
DEST = ROOT / 'public/7. Algorithms/6. Miscellaneous Topics'
DEST.mkdir(parents=True, exist_ok=True)
# Full spread coordinates in PDF points. Include all graph labels and arrowheads.
CROPS = {
    'miscellaneous-6-6-graph': (1, 478, (181, 122, 271, 165)),
    'miscellaneous-6-17-graph': (1, 479, (474, 220, 570, 275)),
    'miscellaneous-6-20-graph': (2, 480, (67, 46, 110, 80)),
}
manifest = {'sourceSHA256': SHA256, 'crops': []}
with pdfium.PdfDocument(SOURCE) as pdf:
    for name, (page, book, bounds) in CROPS.items():
        image = pdf[page-1].render(scale=6).to_pil()
        crop = image.crop(tuple(round(v*6) for v in bounds))
        data = io.BytesIO()
        crop.save(data, format='PNG')
        target = DEST / f'{name}.png'
        if target.exists():
            assert target.read_bytes() == data.getvalue(), f'Existing crop changed: {target}'
        else:
            target.write_bytes(data.getvalue())
        manifest['crops'].append({'file': target.name, 'pdfPage': page, 'bookPage': book,
                                  'boundsPdfPoints': bounds, 'size': crop.size,
                                  'sha256': hashlib.sha256(data.getvalue()).hexdigest()})
(ROOT / 'data/imports/algorithms-miscellaneous-diagrams.json').write_text(json.dumps(manifest, indent=2), encoding='utf8')
print('3 diagram-only crops verified')
