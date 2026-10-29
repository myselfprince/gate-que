from pathlib import Path
import fitz
doc=fitz.open(r'D:\Gate PYQs Year Wise - PDFs\2004.pdf')
out=Path('public/Year Papers/GATE CS 2004');out.mkdir(parents=True,exist_ok=True)
# Source graph preserves the selected scan's arrow direction. Prose, code and tables stay editable.
crops=[('q44-source-graph',5,(332,208,480,283)),('q56-network',7,(304,194,485,220))]
for name,page,box in crops:
    doc[page].get_pixmap(matrix=fitz.Matrix(5,5),clip=fitz.Rect(box)).save(str(out/(name+'.png')))
