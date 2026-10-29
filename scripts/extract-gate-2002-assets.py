from pathlib import Path
import fitz
doc=fitz.open(r'D:\Gate PYQs Year Wise - PDFs\2002.pdf')
out=Path('public/Year Papers/GATE CS 2002')
out.mkdir(parents=True,exist_ok=True)
# Actual diagram only, from source page 7; all surrounding content is editable.
doc[6].get_pixmap(matrix=fitz.Matrix(4,4),clip=fitz.Rect(334,74,524,195)).save(str(out/'q56-pipeline.png'))
