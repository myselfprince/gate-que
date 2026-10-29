"""Reproduce the query-plan figure, excluding question prose, from reviewed PDF page 1."""
import hashlib
import json
from pathlib import Path
import fitz

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r'C:\Users\Prince\Desktop\MadeEasy PYQ PDF\12. DBMS\4. Relational Model.pdf')
SHA = '1556421d5e7360aec7b13f66076ab2cdd803e4318e11e6755763b6ded4208ec7'
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SHA
bounds = (1850, 1340, 2380, 1650)
with fitz.open(SOURCE) as doc:
    page = doc[0]
    ratio = page.rect.width / 2400
    pix = page.get_pixmap(matrix=fitz.Matrix(2 / ratio, 2 / ratio), clip=fitz.Rect(*(v * ratio for v in bounds)))
    content = pix.tobytes('png')
target = ROOT / 'public/12. DBMS/4. Relational Model/relational-model-4-13.png'
target.parent.mkdir(parents=True, exist_ok=True)
if target.exists():
    assert target.read_bytes() == content, 'Reviewed diagram changed'
else:
    target.write_bytes(content)
manifest = {'sourceSHA256': SHA, 'crops': [{'file': target.name, 'pdfPage': 1, 'bookPage': 633,
    'boundsAt2400pxSpread': bounds, 'size': [pix.width, pix.height], 'sha256': hashlib.sha256(content).hexdigest()}]}
(ROOT / 'data/imports/dbms-relational-model-diagrams.json').write_text(json.dumps(manifest, indent=2), encoding='utf8')
print('Query-plan crop verified')
