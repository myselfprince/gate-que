"""Repeatable, checksum-guarded figure extraction; never replaces an existing image."""
import argparse
import hashlib
import io
from pathlib import Path
import subprocess
import tempfile
from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument('--pdf', default=r'C:\Users\Prince\Desktop\MadeEasy PYQ PDF\3. Computer Networks\3. TCP, UDP and IP.pdf')
parser.add_argument('--rendered', help='Optional folder containing detail-1.png through detail-3.png at 300 DPI')
args = parser.parse_args()
pdf = Path(args.pdf)
assert hashlib.sha256(pdf.read_bytes()).hexdigest() == '56139841ba5ebfa3976575c2c90aff616bba7d4cc0b58220cd10c5bfa37cb9e6'
root = Path(__file__).resolve().parents[1]
destination = root / 'public' / '3. Computer Networks' / '3. TCP, UDP and IP'
destination.mkdir(parents=True, exist_ok=True)

def extract(rendered):
    # Coordinates are measured on the visually reviewed 200 DPI full spreads.
    figures = [
        (1, (925, 768, 1260, 827), ['cn-tcp-ip-3-12-network', '11']),
        (2, (1380, 720, 1635, 910), ['cn-tcp-ip-3-36-handshake', '69']),
        (3, (1335, 463, 1665, 566), ['cn-tcp-ip-3-54-ttl']),
        (3, (1370, 995, 1615, 1048), ['cn-tcp-ip-3-55-network']),
        # Restore this missing legacy table reference without changing its record.
        # The verified PDF version retains the table as editable LaTeX instead.
        (1, (948, 134, 1260, 269), ['12']),
    ]
    for page, bounds, names in figures:
        with Image.open(rendered / f'detail-{page}.png') as image:
            crop = image.crop(tuple(round(value * 1.5) for value in bounds))
            output = io.BytesIO()
            crop.save(output, format='PNG')
            content = output.getvalue()
        for name in names:
            target = destination / f'{name}.png'
            if target.exists():
                if target.read_bytes() != content:
                    raise RuntimeError(f'Existing image differs; review before replacing: {target}')
            else:
                with target.open('xb') as stream:
                    stream.write(content)
            print(target.name, hashlib.sha256(content).hexdigest())

if args.rendered:
    extract(Path(args.rendered))
else:
    with tempfile.TemporaryDirectory(prefix='cn-tcp-ip-') as temporary:
        rendered = Path(temporary)
        subprocess.run(['pdftoppm', '-f', '1', '-l', '3', '-r', '300', '-png', str(pdf), str(rendered / 'detail')], check=True)
        extract(rendered)
