from pathlib import Path
import fitz
doc=fitz.open(r'D:\Gate PYQs Year Wise - PDFs\2001.pdf')
out=Path('public/Year Papers/GATE CS 2001')
out.mkdir(parents=True,exist_ok=True)
# Source page 8, converter only; editable question text surrounds it.
doc[7].get_pixmap(matrix=fitz.Matrix(4,4),clip=fitz.Rect(331,209,475,280)).save(str(out/'q58-converter.png'))
