"""Extract only the nine reviewed figures, guarded by the source checksum."""
import hashlib
import io
from pathlib import Path
import subprocess
import tempfile
from PIL import Image
import pdfplumber

SOURCE = Path(r'C:\Users\Prince\Desktop\MadeEasy PYQ PDF\3. Computer Networks\4. Routing and Application Layer.pdf')
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == 'adee929df2f3f0e6f1a7818ec0e2a9d42832439e11260789362993d1c9ac338b'
ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'public' / '3. Computer Networks' / '4. Routing and Application Layer'
# Bounds in points on the 612 x 454.4 point scanned spreads, visually reviewed.
FIGURES = [
    (1, (179, 347, 286, 452), 'cn-routing-4-7-bridges'),
    (1, (489, 93, 571, 145), 'cn-routing-4-10-network'),
    (2, (193, 364.2, 281, 419), 'cn-routing-4-15-graph'),
    (2, (491, 144, 575, 209), 'cn-routing-4-19-network'),
    (3, (35, 75, 135, 139), 'cn-routing-4-22-network'),
    (3, (204, 119, 278, 136), 'cn-routing-4-26-path'),
    (3, (521, 269, 564, 317), 'cn-routing-4-36-topology'),
    (4, (14, 102, 143, 177.5), 'cn-routing-4-37-enterprise'),
    (4, (196, 62, 272, 79), 'cn-routing-4-40-path'),
]
DEST.mkdir(parents=True, exist_ok=True)
with pdfplumber.open(SOURCE) as source:
    sizes = [(page.width, page.height) for page in source.pages]
with tempfile.TemporaryDirectory(prefix='cn-routing-figures-') as temporary:
    rendered = Path(temporary)
    subprocess.run(['pdftoppm', '-r', '300', '-png', str(SOURCE), str(rendered / 'page')], check=True)
    for page, bounds, name in FIGURES:
        with Image.open(rendered / f'page-{page}.png') as image:
            width, height = sizes[page - 1]
            sx, sy = image.width / width, image.height / height
            crop = image.crop(tuple(round(v * (sx if i % 2 == 0 else sy)) for i, v in enumerate(bounds)))
            output = io.BytesIO()
            crop.save(output, format='PNG')
            content = output.getvalue()
        target = DEST / f'{name}.png'
        if target.exists():
            if target.read_bytes() != content:
                raise RuntimeError(f'Existing crop differs; review before replacing: {target}')
        else:
            target.write_bytes(content)
        print(target.name, hashlib.sha256(content).hexdigest())
