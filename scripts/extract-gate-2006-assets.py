from pathlib import Path
import fitz
doc=fitz.open(r'D:\Gate PYQs Year Wise - PDFs\2006.pdf')
out=Path('public/Year Papers/GATE CS 2006');out.mkdir(parents=True,exist_ok=True)
# Diagram-only crops, and the four degraded formula options at Q36. Coordinates are PDF points.
for name,page,rect in [
 ('q35-circuit',5,(85,280,225,390)),
 ('q36-original-options',5,(70,551,298,609)),
 ('q37-circuit',5,(88,650,278,711)),
 ('q38-original-options',5,(330,300,525,366)),
 ('q47-graph',7,(84,45,259,163)),
 ('q69-plans',11,(87,83,290,158)),
 ('q82-83-lans',13,(55,360,266,504)),
]:
 doc[page-1].get_pixmap(matrix=fitz.Matrix(4,4),clip=fitz.Rect(*rect)).save(str(out/(name+'.png')))
