"""Reproducible, checksum-guarded figure-only crops; all prose stays editable."""
import hashlib
from pathlib import Path
import subprocess
import tempfile
import io
from PIL import Image

SOURCE = Path(r'C:\Users\Prince\Desktop\MadeEasy PYQ PDF\4. COA\2. Control Unit Design.pdf')
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == '0c3d64c73a79bac06e3c1fea0b50d842c9803af995b25f7eb457c5cdd3df9d33'
DEST = Path(__file__).resolve().parents[1] / 'public' / '4. COA' / '2. Control Unit Design'
# PDF point bounds on 612 x 459 scanned spreads; retain every bus/arrow/label.
FIGURES = [
    (1, (317, 320, 436, 376), 'coa-control-2-4-datapath'),
    (2, (328, 64, 433, 115), 'coa-control-2-16-17-datapath'),
    (3, (49, 199, 166, 246), 'coa-control-2-26-datapath'),
]
DEST.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory(prefix='coa-control-figures-') as directory:
    root = Path(directory)
    subprocess.run(['pdftoppm', '-scale-to', '3000', '-png', str(SOURCE), str(root / 'spread')], check=True)
    for page, bounds, name in FIGURES:
        with Image.open(root / f'spread-{page}.png') as image:
            crop = image.crop(tuple(round(v * (image.width / 612 if i % 2 == 0 else image.height / 459)) for i, v in enumerate(bounds)))
            output = io.BytesIO()
            crop.save(output, format='PNG')
        target = DEST / f'{name}.png'
        content = output.getvalue()
        if target.exists():
            assert target.read_bytes() == content, f'Existing crop differs: {target}'
        else:
            target.write_bytes(content)
        print(target.name, hashlib.sha256(content).hexdigest())
