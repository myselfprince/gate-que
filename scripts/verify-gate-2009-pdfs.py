import json,re,zipfile
from pathlib import Path
import fitz
from PIL import Image,ImageOps,ImageDraw
root=Path('tmp/gate2009/rendered');root.mkdir(parents=True,exist_ok=True)
report={};issues=[]
for variant,expected in [('dark',60),('print',60),('solutions',None)]:
 doc=fitz.open(f'output/pdf/gate-cs-2009.{variant}.pdf');texts=[]
 if expected and len(doc)!=expected:issues.append([variant,'page count',len(doc)])
 for i,page in enumerate(doc):
  text=page.get_text();texts.append(text)
  if variant!='solutions':
   if not re.search(rf'(?m)^{i+1}\s*\[GATE CS 2009',text):issues.append([variant,i+1,'ordered header'])
   if re.search('Authored reference|Disputed item|Correct answer:',text):issues.append([variant,i+1,'answer leak'])
  for x0,y0,x1,y1,word,*_ in page.get_text('words'):
   if x0<-1 or y0<-1 or x1>page.rect.width+1 or y1>page.rect.height+1:issues.append([variant,i+1,'bounds',word])
  page.get_pixmap(matrix=fitz.Matrix(1.2,1.2)).save(str(root/f'{variant}-{i+1:02}.png'))
 if variant=='solutions':
  for n in range(1,61):
   if not re.search(rf'\bQ{n}\b','\n'.join(texts)):issues.append([variant,'missing answer',n])
 report[variant]={'pages':len(doc),'rendered':len(doc)}
 for start in range(0,len(doc),12):
  canvas=Image.new('RGB',(1800,1480),'#b8b8b8');draw=ImageDraw.Draw(canvas)
  for j in range(start,min(start+12,len(doc))):
   tile=ImageOps.contain(Image.open(root/f'{variant}-{j+1:02}.png'),(590,340));x=(j-start)%3*600;y=(j-start)//3*370
   canvas.paste(tile,(x,y+25));draw.text((x+8,y+5),f'{variant} page {j+1}',fill='black')
  canvas.save(root/f'{variant}-contact-{start//12+1:02}.png')
with zipfile.ZipFile('output/pdf/gate-cs-2009.zip') as z:
 assert sorted(z.namelist())==['GATE-CS-2009-Answers-and-Solutions.pdf','GATE-CS-2009-Questions.pdf']
 assert z.read('GATE-CS-2009-Questions.pdf')==Path('output/pdf/gate-cs-2009.dark.pdf').read_bytes()
 assert z.read('GATE-CS-2009-Answers-and-Solutions.pdf')==Path('output/pdf/gate-cs-2009.solutions.pdf').read_bytes()
report['issues']=issues
Path('data/backups/gate-2009/pdf-verification.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2));assert not issues
