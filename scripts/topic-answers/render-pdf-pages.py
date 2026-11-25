"""Render PDF pages (or a cropped region) to PNG so formulas, diagrams and scanned
answer tables can be read. The PDF is only read.

    python -I scripts/topic-answers/render-pdf-pages.py <pdf> <out-dir> <dpi> <page> [<page> ...]
    python -I scripts/topic-answers/render-pdf-pages.py <pdf> <out-dir> <dpi> <page> --crop x0 y0 x1 y1

Pages are 1-based. Crop fractions are 0-1 of the page width/height, e.g.
--crop 0.49 0.10 0.99 0.32 for the top-right answer table of a Made Easy scan.
Output: <out-dir>/p<page>.png, or p<page>-crop.png with --crop.
"""
import os
import sys

import fitz  # PyMuPDF

args = sys.argv[1:]
crop = None
if '--crop' in args:
    at = args.index('--crop')
    crop = [float(value) for value in args[at + 1:at + 5]]
    args = args[:at] + args[at + 5:]
if len(args) < 4:
    sys.exit(__doc__)
pdf, out, dpi, pages = args[0], args[1], int(args[2]), [int(page) for page in args[3:]]
os.makedirs(out, exist_ok=True)
doc = fitz.open(pdf)
for number in pages:
    page = doc[number - 1]
    clip = None
    if crop:
        r = page.rect
        clip = fitz.Rect(r.x0 + r.width * crop[0], r.y0 + r.height * crop[1], r.x0 + r.width * crop[2], r.y0 + r.height * crop[3])
    target = os.path.join(out, f'p{number}{"-crop" if crop else ""}.png')
    page.get_pixmap(dpi=dpi, clip=clip).save(target)
    print(target)
