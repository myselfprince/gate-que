import json
from pathlib import Path

import pdfplumber
import pypdfium2
from PIL import Image, ImageDraw

root = Path('tmp/question-syntax-audit')
report = json.loads((root / 'compilation-approved/report.json').read_text(encoding='utf-8'))
manifest = json.loads((root / 'patches.json').read_text(encoding='utf-8'))
output = root / 'visual-checks'
output.mkdir(exist_ok=True)
results = []
for chapter in report['results']:
    assert not chapter['failures']
    assert len(chapter['compiledFiles']) == 1
    file = Path(chapter['compiledFiles'][0])
    issues = []
    with pdfplumber.open(file) as document:
        assert len(document.pages) == chapter['total'], (file, len(document.pages), chapter['total'])
        for index, page in enumerate(document.pages):
            for kind, items in [('text', page.chars), ('image', page.images)]:
                outside = [item for item in items if item['x0'] < -0.5 or item['x1'] > page.width + 0.5 or item['top'] < -0.5 or item['bottom'] > page.height + 0.5]
                if outside:
                    issues.append({'page': index + 1, 'kind': kind, 'outsideObjects': len(outside)})
            if not page.chars:
                issues.append({'page': index + 1, 'kind': 'empty-page'})
            page.flush_cache()
    assert not issues, (file, issues)
    results.append({'chapter': chapter['chapter'], 'view': chapter['view'], 'pages': chapter['total'], 'pageBoundsIssues': issues})
    print(json.dumps(results[-1]), flush=True)

staged = json.loads((root / 'staged-chapters.json').read_text(encoding='utf-8'))
selected = set()
for patch in manifest['patches']:
    ci = next(index for index, chapter in enumerate(staged) if chapter['_id'] == patch['chapterId'])
    selected.add((ci, patch['number']))
selected.update([(16, 9), (16, 80), (5, 91), (0, 59)])
for ci, chapter in enumerate(staged):
    selected.add((ci, 1))
    selected.add((ci, len(chapter['questions'])))

tiles = []
for ci, number in sorted(selected):
    pdf = root / f'compilation-approved/{ci:02d}-editable/main.pdf'
    document = pypdfium2.PdfDocument(pdf)
    page = document[number - 1]
    bitmap = page.render(scale=1.1)
    rendered = bitmap.to_pil()
    tile = Image.new('RGB', (960, 705), '#252535')
    rendered.thumbnail((950, 670))
    tile.paste(rendered, ((960-rendered.width)//2, 28))
    ImageDraw.Draw(tile).text((12, 8), f'{ci:02d} | {staged[ci]["chapter"]} | Question {number}', fill='white')
    tile.save(output / f'{ci:02d}-{number:03d}.png')
    tiles.append(tile)
    rendered.close()
    bitmap.close()
    page.close()
    document.close()

for start in range(0, len(tiles), 4):
    sheet = Image.new('RGB', (1920, 1410), '#252535')
    for index, tile in enumerate(tiles[start:start+4]):
        sheet.paste(tile, ((index % 2)*960, (index//2)*705))
    sheet.save(output / f'sheet-{start//4+1:02d}.jpg', quality=93)
    sheet.close()
for tile in tiles:
    tile.close()
summary = {'pagesChecked': sum(row['pages'] for row in results), 'pageCountAndBoundsValid': True, 'renderedReviewPages': len(tiles), 'results': results}
(root / 'pdf-layout-report.json').write_text(json.dumps(summary, indent=2), encoding='utf-8')
print(json.dumps({key: value for key, value in summary.items() if key != 'results'}))
