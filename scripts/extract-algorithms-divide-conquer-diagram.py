"""Checksum-guarded Q2.50 graph-only crop; excludes prose and answer key."""
import hashlib
import io
from pathlib import Path
import pypdfium2 as pdfium

SOURCE = Path(r'C:\Users\Prince\Desktop\MadeEasy PYQ PDF\7. Algorithms\2. Divide and Conquer.pdf')
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == '9f7deecd91fd52146914409e245a924f7b772c0abaa9441449978e45b74f1672'
DEST = Path(__file__).resolve().parents[1] / 'public' / '7. Algorithms' / '2. Divide and Conquer'
DEST.mkdir(parents=True, exist_ok=True)
with pdfium.PdfDocument(SOURCE) as pdf:
    image = pdf[3].render(scale=5).to_pil()
    w, h = image.size
    bounds = (814/2800, 724/1896, 1337/2800, 972/1896)
    crop = image.crop(tuple(round(v*(w if i%2 == 0 else h)) for i,v in enumerate(bounds)))
    output = io.BytesIO()
    crop.save(output, format='PNG')
    content = output.getvalue()
    target = DEST / 'algorithms-divide-conquer-2-50-graph.png'
    if target.exists():
        assert target.read_bytes() == content, 'Existing crop differs; review before replacing.'
    else:
        target.write_bytes(content)
    print(target, hashlib.sha256(content).hexdigest())
