"""Exact diagram-only crops from both visually reviewed File Structures spreads."""
import hashlib
import json
from pathlib import Path
import fitz

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r'C:\Users\Prince\Desktop\MadeEasy PYQ PDF\12. DBMS\6. File Structures.pdf')
SHA = '6a32ebac6bd3897877038afddbe516d8f9df745c2ea467fcd54fd78eb57653d2'
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SHA
crops = [
    ('file-structures-6-12-13.png', 1, 657, (1320, 755, 1740, 923)),
    ('file-structures-6-19.png', 2, 658, (110, 218, 540, 374)),
    ('file-structures-6-26.png', 2, 658, (625, 915, 1140, 1415)),
]
manifest = {'sourceSHA256': SHA, 'crops': []}
with fitz.open(SOURCE) as doc:
    for name, page_number, book_page, bounds in crops:
        page = doc[page_number - 1]
        ratio = page.rect.width / 2400
        pix = page.get_pixmap(matrix=fitz.Matrix(2 / ratio, 2 / ratio), clip=fitz.Rect(*(v * ratio for v in bounds)))
        content = pix.tobytes('png')
        target = ROOT / 'public/12. DBMS/6. File Structures' / name
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists():
            assert target.read_bytes() == content, 'Existing reviewed diagram differs'
        else:
            target.write_bytes(content)
        manifest['crops'].append({'file': name, 'pdfPage': page_number, 'bookPage': book_page,
            'boundsAt2400pxSpread': bounds, 'size': [pix.width, pix.height], 'sha256': hashlib.sha256(content).hexdigest()})
(ROOT / 'data/imports/dbms-file-structures-diagrams.json').write_text(json.dumps(manifest, indent=2), encoding='utf8')
print(json.dumps(manifest, indent=2))
