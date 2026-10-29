"""Reproducible figure-only crops of the visually inspected 3000px scans."""
import argparse
import hashlib
import io
import json
from pathlib import Path
import subprocess
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r'C:\Users\Prince\Desktop\MadeEasy PYQ PDF\9. Digital Logic\2. Combinational Circuits.pdf')
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == '3fb94a04cc0c2153efc11e29861411a10df92ba788b5d37010485da84becc37a'
parser = argparse.ArgumentParser()
parser.add_argument('--render-dir', default=str(ROOT/'tmp/pdfs/combinational-source'))
parser.add_argument('--replace-reviewed', action='store_true')
args = parser.parse_args()
cache = Path(args.render_dir)
cache.mkdir(parents=True, exist_ok=True)
dest = ROOT/'public/9. Digital Logic/2. Combinational Circuits'
dest.mkdir(parents=True, exist_ok=True)
figures = [
    (1, (375,605,780,925), '1'),
    (1, (390,1100,695,1395), '2'),
    (1, (940,1345,1360,1545), '7'),
    (1, (1590,225,2080,435), '8'),
    (1, (1600,635,2065,899), '9'),
    (1, (2210,735,2680,910), '13'),
    (1, (2215,1210,2625,1430), '14'),
    (1, (2220,1615,2630,1905), '15'),
    (2, (1030,270,1405,455), '19'),
    (2, (1000,1095,1310,1255), '22'),
    (2, (990,1440,1345,1670), '23'),
    (2, (1690,760,2020,1010), '25'),
    (2, (2290,510,2720,687), '28'),
    (3, (425,190,630,375), '32-a'),
    (3, (670,190,880,375), '32-b'),
    (3, (400,380,630,575), '32-c'),
    (3, (670,380,880,575), '32-d'),
    (3, (385,925,810,1310), '33'),
    (3, (960,285,1490,790), '34'),
    (3, (970,1210,1395,1620), '35'),
]
manifest = []
for page in [1,2,3]:
    file = cache/f'spread-{page}.png'
    if not file.exists():
        subprocess.run(['pdftoppm','-f',str(page),'-l',str(page),'-scale-to','3000','-png',str(SOURCE),str(cache/'spread')],check=True)
    with Image.open(file) as image:
        assert image.size == (3000,2250)
        for p, bounds, name in figures:
            if p != page:
                continue
            target = dest/f'combinational-2-{name}.png'
            out = io.BytesIO()
            crop = image.crop(bounds).convert('RGBA')
            # Perspective makes neighbouring prose intrude into exterior scan
            # corners. These masks do not intersect circuit wires or labels.
            masks = {
                '8': [(0,195,190,210),(190,201,280,210)],
                '9': [(0,260,300,264)],
                '25': [(0,245,100,250)],
                '28': [(0,160,230,177)],
                '33': [(0,360,175,385)],
            }.get(name, [])
            draw = ImageDraw.Draw(crop)
            for mask in masks:
                draw.rectangle(mask, fill=(0,0,0,0))
            crop.save(out, format='PNG')
            content = out.getvalue()
            if target.exists() and not args.replace_reviewed:
                assert target.read_bytes() == content, f'Existing crop changed: {target}'
            else:
                target.write_bytes(content)
            manifest.append({'file':target.name,'pdfPage':page,'pixelBounds':bounds,'renderWidth':3000,'excludedExteriorPixels':masks,'sha256':hashlib.sha256(content).hexdigest()})
(ROOT/'data/imports/digital-logic-combinational-diagrams.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f'{len(manifest)} checksum-guarded figure crops')
