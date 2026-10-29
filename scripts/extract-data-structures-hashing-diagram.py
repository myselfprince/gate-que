"""Reproduce the figure-only crop; all tables remain editable LaTeX."""
import hashlib
import io
import json
from pathlib import Path
import pypdfium2 as pdfium

SOURCE = Path(r'C:\Users\Prince\Desktop\MadeEasy PYQ PDF\6. Data Structures\6. Hashing.pdf')
SOURCE_HASH = '092c3a0695e1d58164b0b96215e94d84350eb9290d59f056a0da7fbbb0c215fa'
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SOURCE_HASH
ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'public/6. Data Structures/6. Hashing'
DEST.mkdir(parents=True, exist_ok=True)
BOUNDS = (1304, 211, 1768, 357)  # coordinates in the reviewed 2400px spread
with pdfium.PdfDocument(SOURCE) as pdf:
    page = pdf[1]
    image = page.render(scale=4800/page.get_width()).to_pil()
    crop = image.crop(tuple(v*2 for v in BOUNDS))
    buffer = io.BytesIO()
    crop.save(buffer, format='PNG')
    content = buffer.getvalue()
    target = DEST / 'hashing-7-16.png'
    if target.exists():
        assert target.read_bytes() == content, 'Existing reviewed crop differs'
    else:
        target.write_bytes(content)
    manifest = {'sourceSHA256': SOURCE_HASH, 'crops': [{
        'file': target.name, 'pdfPage': 2, 'bookPage': 411,
        'boundsAt2400pxSpread': BOUNDS, 'size': crop.size,
        'sha256': hashlib.sha256(content).hexdigest(),
    }]}
    (ROOT / 'data/imports/data-structures-hashing-diagrams.json').write_text(json.dumps(manifest, indent=2), encoding='utf8')
print('1 figure-only source crop verified')
