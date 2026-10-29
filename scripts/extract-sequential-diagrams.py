"""Reproduce figure-only crops from all four visually reviewed scanned spreads."""
import argparse
import hashlib
import io
import json
from pathlib import Path
import subprocess
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r'C:\Users\Prince\Desktop\MadeEasy PYQ PDF\9. Digital Logic\3. Sequential Circuits.pdf')
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == '41cd95b1b2efe20c72011eb32e607fb4c5701672be021a6546520eb5be1a6467'
parser = argparse.ArgumentParser()
parser.add_argument('--render-dir', default=str(ROOT/'tmp/pdfs/sequential-source'))
parser.add_argument('--replace-reviewed', action='store_true')
args = parser.parse_args()
cache = Path(args.render_dir)
cache.mkdir(parents=True, exist_ok=True)
dest = ROOT/'public/9. Digital Logic/3. Sequential Circuits'
dest.mkdir(parents=True, exist_ok=True)
# Coordinates relative to the inspected book-page crops: L=(260,160), R=(1510,160).
figures = [
    (1,'R',(38,308,607,596),'1'),
    (1,'R',(90,1110,449,1300),'2'),
    (1,'R',(705,302,1250,552),'3-circuit'),
    (1,'R',(705,680,1152,818),'3-timing'),
    (1,'R',(720,837,1145,892),'3-a'),
    (1,'R',(720,897,1145,951),'3-b'),
    (1,'R',(720,956,1145,1013),'3-c'),
    (1,'R',(720,1021,1145,1084),'3-d'),
    (1,'R',(650,1232,1190,1475),'4'),
    (2,'L',(150,162,564,310),'5'),
    (2,'L',(16,1305,513,1510),'8'),
    (2,'L',(803,140,1075,278),'9'),
    (2,'L',(694,803,1165,1033),'11'),
    (2,'L',(683,1385,1138,1593),'12-circuit'),
    (2,'R',(95,42,543,196),'12-timing'),
    (2,'R',(94,488,520,670),'13'),
    (2,'R',(-20,1148,560,1390),'14'),
    (2,'R',(766,115,1135,242),'15-a'),
    (2,'R',(766,247,1135,369),'15-b'),
    (2,'R',(766,374,1135,490),'15-c'),
    (2,'R',(746,490,1135,613),'15-d'),
    (2,'R',(758,782,1145,946),'16'),
    (2,'R',(690,1332,1073,1429),'18'),
    (3,'L',(135,70,534,307),'19'),
    (3,'L',(146,567,552,715),'20'),
    (3,'L',(717,42,1176,237),'22'),
    (3,'L',(736,557,1101,1034),'24-25'),
    (3,'R',(125,43,564,225),'27'),
    (3,'R',(746,215,1275,427),'32'),
    (3,'R',(704,1464,1117,1615),'34'),
    (4,'L',(36,149,584,357),'35'),
    (4,'L',(188,604,482,846),'36'),
    (4,'L',(630,226,1204,444),'37'),
]
manifest=[]
for page in range(1,5):
    file=cache/f'spread-{page}.png'
    if not file.exists():
        subprocess.run(['pdftoppm','-f',str(page),'-l',str(page),'-scale-to','3000','-png',str(SOURCE),str(cache/'spread')],check=True)
    with Image.open(file) as image:
        assert image.size == (3000,2250)
        for p,side,bounds,name in figures:
            if p != page:
                continue
            ox,oy=(260,160) if side=='L' else (1510,160)
            absolute=(bounds[0]+ox,bounds[1]+oy,bounds[2]+ox,bounds[3]+oy)
            crop=image.crop(absolute).convert('RGBA')
            # Only neighbouring prose/option-marker pixels in exterior corners
            # are excluded. No wire, signal name, arrow or figure label is masked.
            masks={
                '5':[(0,142,50,148)],
                '11':[(0,222,180,230)],
                '12-timing':[(0,126,350,154)],
                '13':[(145,0,426,8)],
                '15-a':[(0,35,18,80)],
                '15-d':[(0,35,28,85)],
                '22':[(0,182,390,195)],
                '20':[(0,143,180,148)],
                '27':[(0,0,10,35)],
                '32':[(0,205,125,212)],
            }.get(name,[])
            draw=ImageDraw.Draw(crop)
            for bounds_to_mask in masks:
                draw.rectangle(bounds_to_mask,fill=(0,0,0,0))
            polygons={
                '1':[[(0,264),(160,268),(490,288),(0,288)]],
                '12-circuit':[[(0,194),(45,194),(240,208),(0,208)]],
                '14':[[(0,220),(80,225),(270,242),(0,242)]],
                '24-25':[[(0,0),(365,0),(365,20),(315,10),(90,2)]],
                '27':[[(0,148),(325,174),(325,182),(0,182)]],
            }.get(name,[])
            for polygon in polygons:
                draw.polygon(polygon,fill=(0,0,0,0))
            out=io.BytesIO()
            crop.save(out,format='PNG')
            content=out.getvalue()
            target=dest/f'sequential-3-{name}.png'
            if target.exists() and not args.replace_reviewed:
                assert target.read_bytes()==content, f'Reviewed crop changed: {target}'
            else:
                target.write_bytes(content)
            manifest.append({'file':target.name,'pdfPage':page,'pixelBounds':absolute,'renderWidth':3000,'excludedExteriorPixels':masks,'excludedExteriorPolygons':polygons,'sha256':hashlib.sha256(content).hexdigest()})
(ROOT/'data/imports/digital-logic-sequential-diagrams.json').write_text(json.dumps(manifest,indent=2)+'\n')
# A labelled sheet for visual crop QA, with every asset at readable resolution.
for group in range((len(manifest)+5)//6):
    sheet=Image.new('RGB',(1800,1050),'#dddddd')
    draw=ImageDraw.Draw(sheet)
    for i,entry in enumerate(manifest[group*6:(group+1)*6]):
        with Image.open(dest/entry['file']) as im:
            thumb=Image.new('RGBA',im.size,'white');thumb.alpha_composite(im.convert('RGBA'));thumb=thumb.convert('RGB');thumb.thumbnail((585,480))
        x,y=(i%3)*600,(i//3)*525
        draw.text((x+5,y+5),entry['file'],fill='black')
        sheet.paste(thumb,(x+5,y+30))
    sheet.save(cache/f'crops-{group+1}.jpg',quality=96)
print(f'{len(manifest)} checksum-guarded figure crops')
