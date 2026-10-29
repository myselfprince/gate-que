"""Reproduce the four exact diagram-only option crops at 300 dpi."""
import hashlib
import json
from pathlib import Path
import pdfplumber

source = Path(r'C:/Users/Prince/Desktop/MadeEasy PYQ PDF/7. Algorithms/5. P and NP Concepts.pdf')
checksum = '207c753b90a883fe8a900313be8145b832bf0355cdb70e3f7992f64d8ca64b73'
assert hashlib.sha256(source.read_bytes()).hexdigest() == checksum
root = Path(__file__).resolve().parents[1]
dest = root / 'public/7. Algorithms/5. P and NP Concepts'
dest.mkdir(parents=True, exist_ok=True)
# Original scan coordinates; option letters and question prose are excluded.
bounds = {'A': (181, 1545, 318, 1673), 'B': (410, 1541, 610, 1702),
          'C': (763, 271, 930, 403), 'D': (995, 269, 1223, 407)}
manifest = {'sourceSHA256': checksum, 'crops': []}
with pdfplumber.open(source) as pdf:
    image = pdf.pages[0].to_image(resolution=300).original
    for letter, box in bounds.items():
        crop = image.crop(box)
        target = dest / f'p-np-5-5-{letter}.png'
        import io
        stream = io.BytesIO()
        crop.save(stream, format='PNG')
        content = stream.getvalue()
        if target.exists():
            assert target.read_bytes() == content, 'Existing crop changed; re-review required'
        else:
            target.write_bytes(content)
        manifest['crops'].append({'file':target.name,'pdfPage':1,'bookPage':476,
                                 'boundsAt300DPI':box,'size':crop.size,
                                 'sha256':hashlib.sha256(content).hexdigest()})
(root/'data/imports/algorithms-p-np-diagrams.json').write_text(json.dumps(manifest,indent=2))
print('4 figure-only option crops verified')
