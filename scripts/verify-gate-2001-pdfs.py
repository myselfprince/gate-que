import json,re,zipfile
from pathlib import Path
import fitz
from PIL import Image,ImageOps,ImageDraw
root=Path('tmp/gate2001/rendered');root.mkdir(parents=True,exist_ok=True)
report={};issues=[]
for variant,expected in [('dark',70),('print',70),('solutions',None)]:
    doc=fitz.open(f'output/pdf/gate-cs-2001.{variant}.pdf')
    if expected and len(doc)!=expected:issues.append([variant,'page count',len(doc)])
    texts=[]
    for i,page in enumerate(doc):
        text=page.get_text();texts.append(text)
        if variant!='solutions':
            if not re.search(rf'(?m)^{i+1}\s*\[GATE CS 2001',text):issues.append([variant,i+1,'ordered header missing'])
            if re.search(r'Authored reference|Reference discussion|Correct answer:|Disputed item',text):issues.append([variant,i+1,'solution leak'])
        for x0,y0,x1,y1,word,*_ in page.get_text('words'):
            if x0< -1 or y0< -1 or x1>page.rect.width+1 or y1>page.rect.height+1:issues.append([variant,i+1,'bounds',word])
        page.get_pixmap(matrix=fitz.Matrix(1.1,1.1)).save(str(root/f'{variant}-{i+1:02}.png'))
    if variant=='solutions':
        for n in range(1,71):
            if not re.search(rf'\bQ{n}\b','\n'.join(texts)):issues.append([variant,'missing answer',n])
    report[variant]={'pages':len(doc),'rendered':len(doc)}
    # Six pages per sheet, large enough to spot layout/diagram problems.
    for start in range(0,len(doc),6):
        canvas=Image.new('RGB',(1560,3*580),'#b8b8b8');draw=ImageDraw.Draw(canvas)
        for j in range(start,min(start+6,len(doc))):
            tile=ImageOps.contain(Image.open(root/f'{variant}-{j+1:02}.png'),(760,540))
            x=(j-start)%2*780;y=(j-start)//2*580
            canvas.paste(tile,(x,y+25));draw.text((x+8,y+5),f'{variant} page {j+1}',fill='black')
        canvas.save(root/f'{variant}-contact-{start//6+1:02}.png')
with zipfile.ZipFile('output/pdf/gate-cs-2001.zip') as z:
    assert sorted(z.namelist())==['GATE-CS-2001-Answers-and-Solutions.pdf','GATE-CS-2001-Questions.pdf']
    assert z.read('GATE-CS-2001-Questions.pdf')==Path('output/pdf/gate-cs-2001.dark.pdf').read_bytes()
    assert z.read('GATE-CS-2001-Answers-and-Solutions.pdf')==Path('output/pdf/gate-cs-2001.solutions.pdf').read_bytes()
report['issues']=issues
Path('data/backups/gate-2001/pdf-verification.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2));assert not issues
