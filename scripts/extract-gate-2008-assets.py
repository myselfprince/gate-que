from pathlib import Path
import fitz
doc=fitz.open(r'D:\Gate PYQs Year Wise - PDFs\2008.pdf')
out=Path('public/Year Papers/GATE CS 2008');out.mkdir(parents=True,exist_ok=True)
# Fresh crops of actual diagrams from the selected scan; other tables/math remain editable.
for name,page,rect in [
 ('q8-circuit',3,(130,80,420,200)),
 ('q19-graph',4,(165,487,380,580)),
 ('q45-graph',8,(160,185,515,298)),
 ('q52-nfas',10,(136,66,565,433)),
 ('q82-83-er',18,(84,103,525,181)),
]:
 doc[page-1].get_pixmap(matrix=fitz.Matrix(4,4),clip=fitz.Rect(*rect)).save(str(out/(name+'.png')))
