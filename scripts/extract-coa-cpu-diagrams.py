"""Checksum-guarded figure-only crops from the visually reviewed source spreads."""
import hashlib
from pathlib import Path
import subprocess
import tempfile
from PIL import Image
import io

SOURCE = Path(r'C:\Users\Prince\Desktop\MadeEasy PYQ PDF\4. COA\1. CPU Arch. and Address. Modes.pdf')
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == '8aa38459f735217253db118956b6de251bab9118150ee24868d263a3ddb0add3'
DEST = Path(__file__).resolve().parents[1] / 'public' / '4. COA' / '1. CPU Arch. and Address. Modes'
# Bounds in PDF points, on 612 x 459 scanned spreads. Prose/options stay editable.
FIGURES = [
    (2, (487, 305, 560, 374), 'coa-cpu-1-27-tree'),
    (3, (480, 56, 568, 87), 'coa-cpu-1-38-chip-select'),
]
DEST.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory(prefix='coa-cpu-figures-') as directory:
    root = Path(directory)
    subprocess.run(['pdftoppm', '-f', '2', '-l', '3', '-scale-to', '3600', '-png', str(SOURCE), str(root / 'spread')], check=True)
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
