from pathlib import Path
import fitz
doc=fitz.open(r'D:\Gate PYQs Year Wise - PDFs\2007.pdf')
out=Path('public/Year Papers/GATE CS 2007');out.mkdir(parents=True,exist_ok=True)
# Only diagrams, taken from the exact selected scan. Coordinates are PDF points.
for name,page,rect in [
 ('q5-dag',2,(265,483,365,555)),
 ('q26-a',6,(100,130,220,259)),
 ('q26-b',6,(300,130,455,259)),
 ('q26-c',6,(100,274,275,410)),
 ('q26-d',6,(310,274,480,410)),
 ('q36-counter',8,(150,385,420,553)),
 ('q74-75-automaton',19,(155,90,438,188)),
]:
 doc[page-1].get_pixmap(matrix=fitz.Matrix(4,4),clip=fitz.Rect(*rect)).save(str(out/(name+'.png')))
