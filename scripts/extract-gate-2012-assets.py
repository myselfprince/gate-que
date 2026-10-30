"""Diagram-only crops from the exact selected 20-page booklet; no other paper."""
from pathlib import Path
import fitz

doc=fitz.open(r'D:\Gate PYQs Year Wise - PDFs\2012.pdf')
out=Path('public/Year Papers/GATE CS 2012');out.mkdir(parents=True,exist_ok=True)
regions=[
 ('q12-nfa',3,(94,648,410,723)),
 ('q26-graph',6,(110,136,205,208)),
 ('q26-a',6,(145,235,244,309)),('q26-b',6,(365,231,471,316)),
 ('q26-c',6,(145,347,244,420)),('q26-d',6,(369,350,471,423)),
 ('q36-a',9,(109,398,264,546)),('q36-b',9,(322,398,471,546)),
 ('q36-c',9,(109,588,264,725)),('q36-d',9,(322,588,477,741)),
 ('q40-graph',10,(110,257,388,422)),('q46-dfa',11,(99,291,440,541)),
]
for name,page,rect in regions:
 doc[page-1].get_pixmap(matrix=fitz.Matrix(4,4),clip=fitz.Rect(*rect)).save(str(out/(name+'.png')))
print(f'{len(regions)} independent source-diagram crops')
