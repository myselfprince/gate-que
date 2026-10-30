from pathlib import Path
import fitz
doc=fitz.open(r'D:\Gate PYQs Year Wise - PDFs\2010.pdf')
out=Path('public/Year Papers/GATE CS 2010');out.mkdir(parents=True,exist_ok=True)
# Diagram-only crops, in PDF points, from the exact selected source scan.
for name,page,rect in [
 ('q9-mux',3,(205,73,425,237)),
 ('q21-modules',5,(210,169,425,325)),
 ('q31-nor',7,(176,112,453,310)),
 ('q32-flipflops',7,(174,437,465,593)),
 ('q48-49-cache',12,(101,172,424,228)),
 ('q54-55-network',14,(218,98,407,203)),
]:
 doc[page-1].get_pixmap(matrix=fitz.Matrix(4,4),clip=fitz.Rect(*rect)).save(str(out/(name+'.png')))
