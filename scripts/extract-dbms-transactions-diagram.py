"""Reproduce only Q5.22's directed graph from the visually reviewed scan."""
import hashlib
import json
from pathlib import Path
import fitz

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r'C:\Users\Prince\Desktop\MadeEasy PYQ PDF\12. DBMS\5. Transactions and Concurrency Contorl.pdf')
SHA = '16985def50bfc94418b62c19aad1798a920288316c047092fa39f73bb3584cec'
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SHA
bounds = (1900, 1160, 2260, 1340)
with fitz.open(SOURCE) as doc:
    page = doc[1]
    ratio = page.rect.width / 2400
    pix = page.get_pixmap(matrix=fitz.Matrix(2 / ratio, 2 / ratio), clip=fitz.Rect(*(v * ratio for v in bounds)))
    content = pix.tobytes('png')
target = ROOT / 'public/12. DBMS/5. Transactions and Concurrency Contorl/transactions-5-22.png'
target.parent.mkdir(parents=True, exist_ok=True)
if target.exists():
    assert target.read_bytes() == content, 'Reviewed diagram changed'
else:
    target.write_bytes(content)
manifest = {'sourceSHA256': SHA, 'crops': [{'file': target.name, 'pdfPage': 2, 'bookPage': 647,
    'boundsAt2400pxSpread': bounds, 'size': [pix.width, pix.height], 'sha256': hashlib.sha256(content).hexdigest()}]}
(ROOT / 'data/imports/dbms-transactions-diagrams.json').write_text(json.dumps(manifest, indent=2), encoding='utf8')
print('Q5.22 graph crop verified')
