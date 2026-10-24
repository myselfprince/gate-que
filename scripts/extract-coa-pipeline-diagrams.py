"""Reproducible, checksum-guarded figure-only crops; prose/tables stay editable."""
import hashlib
from pathlib import Path
import subprocess
import tempfile
import io
from PIL import Image

SOURCE = Path(r'C:\Users\Prince\Desktop\MadeEasy PYQ PDF\4. COA\3. Instructions Pipeline.pdf')
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == '19a73f8062c04fc97904b750368e945cd2126f5953097ce99a5d7500c354d04b'
DEST = Path(__file__).resolve().parents[1] / 'public' / '4. COA' / '3. Instructions Pipeline'
# PDF point bounds on the 612 x 459 scanned spreads. Include every signal label.
FIGURES = [
    (1, (331, 330, 439, 386), 'coa-pipeline-3-12-datapath'),
    (2, (321, 104, 428, 161), 'coa-pipeline-3-23-stages'),
]
DEST.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory(prefix='coa-pipeline-figures-') as directory:
    root = Path(directory)
    for page, bounds, name in FIGURES:
        subprocess.run(['pdftoppm', '-f', str(page), '-l', str(page), '-scale-to', '3000', '-png', str(SOURCE), str(root / 'spread')], check=True)
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
