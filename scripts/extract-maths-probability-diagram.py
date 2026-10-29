"""Reproduce the diagram-only crop from visually reviewed PDF page 4."""
import hashlib
import io
import json
from pathlib import Path
import pypdfium2 as pdfium

SOURCE = Path(r'C:\Users\Prince\Desktop\MadeEasy PYQ PDF\11. Engg. Maths\1. Probability.pdf')
SOURCE_HASH = 'e90e2db4cee3877cc55b5300d274bb84ec09928c74008fc6cacce3621a3233c2'
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SOURCE_HASH
ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'public/11. Engg. Maths/1. Probability'
DEST.mkdir(parents=True, exist_ok=True)
bounds = (798, 1130, 1069, 1278)
with pdfium.PdfDocument(SOURCE) as pdf:
    page = pdf[3]
    image = page.render(scale=4800/page.get_width()).to_pil()
    crop = image.crop(tuple(v*2 for v in bounds))
    buffer = io.BytesIO()
    crop.save(buffer, format='PNG')
    content = buffer.getvalue()
    target = DEST / 'probability-5-61.png'
    if target.exists():
        assert target.read_bytes() == content, 'Existing reviewed crop differs'
    else:
        target.write_bytes(content)
manifest = {'sourceSHA256':SOURCE_HASH,'crops':[{'file':target.name,'pdfPage':4,'bookPage':80,
    'boundsAt2400pxSpread':bounds,'size':crop.size,'sha256':hashlib.sha256(content).hexdigest()}]}
(ROOT / 'data/imports/maths-probability-diagrams.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
print('Q5.61 source diagram crop verified')
