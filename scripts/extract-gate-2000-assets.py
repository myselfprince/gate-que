from pathlib import Path
import fitz

doc=fitz.open(r'D:\Gate PYQs Year Wise - PDFs\2000.pdf')
out=Path('public/Year Papers/GATE CS 2000')
out.mkdir(parents=True,exist_ok=True)
for name,page,rect in [
 ('q55-pda',6,(332,40,522,99)),
 ('q57-timing',6,(332,581,523,680)),
]:
 doc[page].get_pixmap(matrix=fitz.Matrix(3,3),clip=fitz.Rect(*rect)).save(str(out/(name+'.png')))
