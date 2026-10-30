from pathlib import Path
import fitz
doc=fitz.open(r'D:\Gate PYQs Year Wise - PDFs\2009.pdf')
out=Path('public/Year Papers/GATE CS 2009');out.mkdir(parents=True,exist_ok=True)
for name,page,rect in [
 ('q32-process-states',7,(145,467,455,586)),
 ('q38-graph',9,(215,121,400,208)),
 ('q41-dfa',9,(195,482,427,553)),
]:
 doc[page-1].get_pixmap(matrix=fitz.Matrix(4,4),clip=fitz.Rect(*rect)).save(str(out/(name+'.png')))
