"""Checksum-guarded figure-only crops; question prose and tables remain editable."""
import hashlib
import io
from pathlib import Path
import subprocess
import tempfile
from PIL import Image

SOURCE = Path(r'C:\Users\Prince\Desktop\MadeEasy PYQ PDF\4. COA\4. Memory Organization.pdf')
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == 'e1b88198e1018531aee17191441bfe1c70efd30be87a44b1f08a771b14af5bfd'
DEST = Path(__file__).resolve().parents[1] / 'public' / '4. COA' / '4. Memory Organization'
# Bounds in PDF points on the original 612 x 459 spreads.
FIGURES = [
    (3, (59, 342, 169, 364), 'coa-memory-4-35-36-cache'),
    (4, (76, 130, 148, 202), 'coa-memory-4-52-miss-rate'),
    (5, (73, 204, 285, 293), 'coa-memory-4-71-chip-select'),
]
DEST.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory(prefix='coa-memory-figures-') as directory:
    root = Path(directory)
    for page in sorted({figure[0] for figure in FIGURES}):
        subprocess.run(['pdftoppm', '-f', str(page), '-l', str(page), '-scale-to', '3000', '-png', str(SOURCE), str(root / 'spread')], check=True)
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
