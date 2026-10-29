"""Exact diagram-only source crops; coordinates use the reviewed 4x renders."""
import hashlib
import json
import sys
from pathlib import Path
import pypdfium2 as pdfium

SOURCE = Path(r'C:\Users\Prince\Desktop\MadeEasy PYQ PDF\7. Algorithms\3. Greedy Method.pdf')
SOURCE_HASH = 'a92eb7d6acfa00d9f6891c2b63110e4f284f3cef99be07ce127ec4910b55b91a'
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SOURCE_HASH
DEST = Path(__file__).resolve().parents[1] / 'public/7. Algorithms/3. Greedy Method'
DEST.mkdir(parents=True, exist_ok=True)
# (PDF page, half-spread, x0,y0,x1,y1). No question prose or solutions.
CROPS = {
    'greedy-3-4-graph': (1, 2, (110, 1004, 480, 1256)),
    'greedy-3-6-graph': (1, 2, (756, 472, 1050, 676)),
    'greedy-3-7-graph': (1, 2, (678, 882, 1078, 1111)),
    'greedy-3-9-A': (2, 1, (164, 326, 438, 456)),
    'greedy-3-9-B': (2, 1, (164, 458, 438, 582)),
    'greedy-3-9-C': (2, 1, (164, 586, 438, 710)),
    'greedy-3-9-D': (2, 1, (168, 710, 442, 834)),
    'greedy-3-21-graph': (2, 2, (170, 1080, 400, 1295)),
    'greedy-3-31-graph': (3, 1, (201, 1370, 592, 1546)),
    'greedy-3-33-graph': (3, 1, (710, 745, 1193, 924)),
    'greedy-3-35-graph': (3, 1, (725, 1367, 1175, 1530)),
    'greedy-3-41-A': (3, 2, (710, 450, 902, 705)),
    'greedy-3-41-B': (3, 2, (934, 450, 1118, 661)),
    'greedy-3-41-C': (3, 2, (714, 700, 895, 919)),
    'greedy-3-41-D': (3, 2, (929, 700, 1122, 907)),
    'greedy-3-42-43-graph': (3, 2, (744, 1108, 1040, 1312)),
    'greedy-3-45-graph': (4, 1, (179, 656, 595, 910)),
    'greedy-3-50-graph': (4, 1, (748, 812, 1098, 988)),
    'greedy-3-61-graph': (5, 1, (251, 179, 451, 350)),
    'greedy-3-68-graph': (5, 1, (750, 1020, 1154, 1243)),
    'greedy-3-69-graph': (5, 2, (114, 150, 542, 400)),
    'greedy-3-71-graph': (5, 2, (193, 758, 408, 976)),
}
manifest = {'sourceSHA256': SOURCE_HASH, 'crops': []}
with pdfium.PdfDocument(SOURCE) as pdf:
    for name, (number, side, bounds) in CROPS.items():
        # 6x keeps scan labels sharp. Coordinate system is the 4x source view.
        image = pdf[number - 1].render(scale=6).to_pil()
        shift = 1224 if side == 2 else 0
        x0, y0, x1, y1 = bounds
        crop = image.crop(tuple(round(v * 1.5) for v in (x0 + shift, y0, x1 + shift, y1)))
        target = DEST / f'{name}.png'
        import io
        buffer = io.BytesIO()
        crop.save(buffer, format='PNG')
        content = buffer.getvalue()
        if target.exists() and '--refresh-reviewed-crops' not in sys.argv:
            assert target.read_bytes() == content, f'Existing crop differs: {target}'
        else:
            target.write_bytes(content)
        manifest['crops'].append({'file': target.name, 'pdfPage': number, 'bookPage': 446 + 2 * (number - 1) + side - 1,
                                  'half': side, 'boundsAt4x': bounds, 'size': crop.size,
                                  'sha256': hashlib.sha256(content).hexdigest()})
manifest_path = Path(__file__).resolve().parents[1] / 'data/imports/algorithms-greedy-diagrams.json'
manifest_path.parent.mkdir(parents=True, exist_ok=True)
manifest_path.write_text(json.dumps(manifest, indent=2), encoding='utf8')
print(f'{len(CROPS)} diagram-only crops verified; manifest: {manifest_path}')
