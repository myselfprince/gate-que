"""Diagram-only crops from the visually reviewed 3x half-spread renders."""
import hashlib
import io
import json
from pathlib import Path
import fitz

SOURCE = Path(r'C:\Users\Prince\Desktop\MadeEasy PYQ PDF\6. Data Structures\2. Stack and Queues.pdf')
SOURCE_HASH = 'd470dc8e1e5d08893ef10af72258c910f1637e9720b89683bfaf125af85154c8'
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SOURCE_HASH
DEST = Path(__file__).resolve().parents[1] / 'public/6. Data Structures/2. Stack and Queues'
DEST.mkdir(parents=True, exist_ok=True)
# PDF page, zero-based side, bounds in the reviewed 3x half-spread images.
CROPS = {
    'stacks-queues-3-10': (1, 1, (148, 226, 410, 313)),
    'stacks-queues-3-26': (2, 1, (502, 445, 875, 548)),
    'stacks-queues-3-28': (3, 0, (82, 121, 453, 296)),
    'stacks-queues-3-30': (3, 0, (608, 192, 810, 323)),
}
manifest = {'sourceSHA256': SOURCE_HASH, 'crops': []}
with fitz.open(SOURCE) as pdf:
    for name, (number, side, bounds) in CROPS.items():
        x0, y0, x1, y1 = bounds
        clip = fitz.Rect(x0/3+side*306, y0/3, x1/3+side*306, y1/3)
        content = pdf[number-1].get_pixmap(matrix=fitz.Matrix(6,6), clip=clip).tobytes('png')
        target = DEST / f'{name}.png'
        if target.exists():
            assert target.read_bytes() == content, f'Existing reviewed crop differs: {target}'
        else:
            target.write_bytes(content)
        manifest['crops'].append({'file': target.name, 'pdfPage': number,
            'bookPage': 368+2*(number-1)+side, 'half': side+1, 'boundsAt3x': bounds,
            'sha256': hashlib.sha256(content).hexdigest()})
Path('data/imports/data-structures-stacks-queues-diagrams.json').write_text(json.dumps(manifest, indent=2), encoding='utf8')
print(f'{len(CROPS)} source diagram crops verified')
