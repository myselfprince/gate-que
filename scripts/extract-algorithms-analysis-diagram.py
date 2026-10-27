"""Checksum-guarded crop of Q1.48's flowchart, without question prose."""
import hashlib
import io
from pathlib import Path
import pypdfium2 as pdfium

SOURCE = Path(r'C:\Users\Prince\Desktop\MadeEasy PYQ PDF\7. Algorithms\1. Algo. Analysis and Asymptotic Notations.pdf')
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == 'b626ea3c6f9591e887dc07217525a86f18e041edef3adfe2ecd42324a56e6492'
DEST = Path(__file__).resolve().parents[1] / 'public' / '7. Algorithms' / '1. Algo. Analysis and Asymptotic Notations'
DEST.mkdir(parents=True, exist_ok=True)
with pdfium.PdfDocument(SOURCE) as pdf:
    page = pdf[3]
    image = page.render(scale=5).to_pil()
    w, h = image.size
    bounds = (20/2550, 135/1713, 640/2550, 485/1713)
    crop = image.crop(tuple(round(v*(w if i%2 == 0 else h)) for i,v in enumerate(bounds)))
    output = io.BytesIO()
    crop.save(output, format='PNG')
    content = output.getvalue()
    target = DEST / 'algorithms-analysis-1-48-flowchart.png'
    if target.exists():
        assert target.read_bytes() == content, 'Existing crop differs; review before replacing.'
    else:
        target.write_bytes(content)
    print(target, hashlib.sha256(content).hexdigest())
