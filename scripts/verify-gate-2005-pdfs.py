import json,re,zipfile
from pathlib import Path
import fitz
from PIL import Image,ImageOps,ImageDraw
root=Path('tmp/gate2005/rendered');root.mkdir(parents=True,exist_ok=True)
report={};issues=[]
for variant,expected in [('dark',90),('print',90),('solutions',None)]:
    doc=fitz.open(f'output/pdf/gate-cs-2005.{variant}.pdf')
    if expected and len(doc)!=expected:issues.append([variant,'page count',len(doc)])
    texts=[]
    for i,page in enumerate(doc):
        text=page.get_text();texts.append(text)
        if variant!='solutions':
            if not re.search(rf'(?m)^{i+1}\s*\[GATE CS 2005',text):issues.append([variant,i+1,'ordered header missing'])
            if re.search(r'Authored reference|Correct answer:|Disputed item',text):issues.append([variant,i+1,'answer leak'])
            if i==49 and '(E)' not in text:issues.append([variant,i+1,'fifth option missing'])
            if i>=80:
                label=str(81+(i-80)//2)+('a' if i%2==0 else 'b')
                if 'Source question '+label[0:-1]+'('+label[-1]+')' not in text:issues.append([variant,i+1,'source linked label missing'])
        for x0,y0,x1,y1,word,*_ in page.get_text('words'):
            if x0<-1 or y0<-1 or x1>page.rect.width+1 or y1>page.rect.height+1:issues.append([variant,i+1,'bounds',word])
        page.get_pixmap(matrix=fitz.Matrix(1.15,1.15)).save(str(root/f'{variant}-{i+1:02}.png'))
    if variant=='solutions':
        for n in range(1,91):
            if not re.search(rf'\bQ{n}\b','\n'.join(texts)):issues.append([variant,'missing answer',n])
    report[variant]={'pages':len(doc),'rendered':len(doc)}
    # Twelve pages per contact sheet; full-resolution page renders remain available.
    for start in range(0,len(doc),12):
        canvas=Image.new('RGB',(1800,4*370),'#b8b8b8');draw=ImageDraw.Draw(canvas)
        for j in range(start,min(start+12,len(doc))):
            tile=ImageOps.contain(Image.open(root/f'{variant}-{j+1:02}.png'),(590,340))
            x=(j-start)%3*600;y=(j-start)//3*370
            canvas.paste(tile,(x,y+25));draw.text((x+8,y+5),f'{variant} page {j+1}',fill='black')
        canvas.save(root/f'{variant}-contact-{start//12+1:02}.png')
with zipfile.ZipFile('output/pdf/gate-cs-2005.zip') as z:
    assert sorted(z.namelist())==['GATE-CS-2005-Answers-and-Solutions.pdf','GATE-CS-2005-Questions.pdf']
    assert z.read('GATE-CS-2005-Questions.pdf')==Path('output/pdf/gate-cs-2005.dark.pdf').read_bytes()
    assert z.read('GATE-CS-2005-Answers-and-Solutions.pdf')==Path('output/pdf/gate-cs-2005.solutions.pdf').read_bytes()
report['issues']=issues
Path('data/backups/gate-2005/pdf-verification.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2));assert not issues
