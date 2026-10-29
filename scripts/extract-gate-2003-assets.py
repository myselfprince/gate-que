from pathlib import Path
import fitz
doc=fitz.open(r'D:\Gate PYQs Year Wise - PDFs\2003.pdf')
out=Path('public/Year Papers/GATE CS 2003');out.mkdir(parents=True,exist_ok=True)
# Only real diagrams are cropped. Mathematical tables, code and prose are editable.
crops=[('q42-plot',4,(332,479,523,596)),
       ('q65-tree',8,(337,121,524,197)),
       ('q65-option-a',8,(350,202,524,284)),
       ('q65-option-b',8,(350,284,524,364)),
       ('q65-option-c',8,(350,363,524,421))]
for name,page,box in crops:
    doc[page].get_pixmap(matrix=fitz.Matrix(5,5),clip=fitz.Rect(box)).save(str(out/(name+'.png')))
