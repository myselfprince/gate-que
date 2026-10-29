"""Reproduce reviewed figure-only crops. Coordinates refer to 4x PDF renders."""
import hashlib
import io
import json
from pathlib import Path
import pypdfium2 as pdfium

SOURCE = Path(r'C:\Users\Prince\Desktop\MadeEasy PYQ PDF\6. Data Structures\4. Trees.pdf')
SOURCE_HASH = '020037cef32681b1eb3bd79141978cfd1888f9c5bab76f7d69095077189a4e92'
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SOURCE_HASH
ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'public/6. Data Structures/4. Trees'
DEST.mkdir(parents=True, exist_ok=True)
CROPS = {
    'trees-5-2-3': (1, 2, (209, 523, 397, 701)),
    'trees-5-19-A': (2, 1, (714, 1260, 873, 1418)),
    'trees-5-19-B': (2, 1, (935, 1280, 1088, 1415)),
    'trees-5-19-C': (2, 1, (718, 1425, 836, 1543)),
    'trees-5-19-D': (2, 1, (938, 1422, 1077, 1560)),
    'trees-5-46': (3, 2, (795, 380, 1044, 582)),
    'trees-5-62': (4, 2, (422, 630, 605, 787)),
}
manifest = {'sourceSHA256': SOURCE_HASH, 'crops': []}
with pdfium.PdfDocument(SOURCE) as pdf:
    for name, (number, side, bounds) in CROPS.items():
        image = pdf[number - 1].render(scale=6).to_pil()
        shift = 1224 if side == 2 else 0
        x0, y0, x1, y1 = bounds
        crop = image.crop(tuple(round(v * 1.5) for v in (x0+shift, y0, x1+shift, y1)))
        buffer = io.BytesIO()
        crop.save(buffer, format='PNG')
        content = buffer.getvalue()
        target = DEST / f'{name}.png'
        if target.exists():
            assert target.read_bytes() == content, f'Existing reviewed crop differs: {target}'
        else:
            target.write_bytes(content)
        manifest['crops'].append({'file':target.name,'pdfPage':number,'bookPage':384+2*(number-1)+side-1,
            'half':side,'boundsAt4x':bounds,'size':crop.size,'sha256':hashlib.sha256(content).hexdigest()})
(ROOT / 'data/imports/data-structures-trees-diagrams.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
print(f'{len(CROPS)} source crops verified')
