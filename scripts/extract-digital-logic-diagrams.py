"""Checksum-guarded figure-only crops; prose, formulas and K-maps stay editable."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parents[1]
SOURCE=Path(r'C:\Users\Prince\Desktop\MadeEasy PYQ PDF\9. Digital Logic\1. Logic Functions and Minimizations.pdf')
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()=='ebe00a96fdac069eb9a388d2691cb17a90e381b121a5687172308c6f08bf7c42'
parser=argparse.ArgumentParser()
parser.add_argument('--render-dir',default=str(ROOT/'tmp/pdfs/digital-logic-source'))
parser.add_argument('--replace-reviewed',action='store_true')
args=parser.parse_args()
cache=Path(args.render_dir)
cache.mkdir(parents=True,exist_ok=True)
dest=ROOT/'public/9. Digital Logic/1. Logic Functions and Minimizations'
dest.mkdir(parents=True,exist_ok=True)
offsets={1:(235,225),2:(845,225),3:(1480,235),4:(2100,235)}
# Original 3000 x 2250 scan pixels, expressed relative to each inspected column.
figures=[
 (1,3,(100,1475,490,1600),'5'),
 (2,2,(100,140,575,295),'15'),
 (2,2,(140,838,465,1020),'17'),
 (2,3,(60,90,585,217),'19-circuit'),
 (2,3,(30,480,600,610),'19-waveform'),
 (2,4,(130,225,500,390),'25'),
 (2,4,(180,620,490,765),'26'),
 (3,3,(140,260,525,430),'38'),
 (3,3,(155,1140,430,1250),'40'),
 (3,4,(75,1280,500,1590),'47'),
 (4,1,(100,150,270,220),'48-a'),
 (4,1,(100,220,270,290),'48-b'),
 (4,1,(100,295,300,360),'48-c'),
 (4,1,(100,365,430,520),'48-d'),
 (5,1,(120,45,505,215),'69'),
 (5,1,(80,400,480,555),'70'),
 (5,1,(90,1487,500,1630),'73'),
 (5,2,(50,1130,535,1355),'76'),
]
manifest=[]
for page in sorted({f[0] for f in figures}):
 file=cache/f'spread-{page}.png'
 if not file.exists():
  subprocess.run(['pdftoppm','-f',str(page),'-l',str(page),'-scale-to','3000','-png',str(SOURCE),str(cache/'spread')],check=True)
 with Image.open(file) as im:
  assert im.size==(3000,2250)
  for p,column,box,name in figures:
   if p!=page:continue
   x,y=offsets[column]
   bounds=(box[0]+x,box[1]+y,box[2]+x,box[3]+y)
   target=dest/f'digital-logic-1-{name}.png'
   import io
   crop=im.crop(bounds)
   # The photographed page is skewed. These two exterior strips contain only
   # neighbouring prose fragments, outside the complete circuit and its labels.
   excluded=[]
   if name=='19-circuit':
    crop=crop.convert('RGBA')
    excluded=[(0,0,crop.width,8),(0,119,45,crop.height)]
    draw=ImageDraw.Draw(crop)
    for area in excluded:draw.rectangle(area,fill=(0,0,0,0))
   out=io.BytesIO();crop.save(out,format='PNG');content=out.getvalue()
   if target.exists() and not args.replace_reviewed:assert target.read_bytes()==content,f'Existing crop differs: {target}'
   else:target.write_bytes(content)
   manifest.append({'file':target.name,'pdfPage':page,'pixelBounds':bounds,'renderWidth':3000,'excludedExteriorPixels':excluded,'sha256':hashlib.sha256(content).hexdigest()})
(ROOT/'data/imports/digital-logic-functions-diagrams.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps(manifest,indent=2))
