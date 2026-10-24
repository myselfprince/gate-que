"""Verify every exported page and render contact sheets for visual review."""
import argparse
import json
from pathlib import Path
import subprocess
import pdfplumber
from PIL import Image, ImageDraw

parser = argparse.ArgumentParser()
parser.add_argument('output_directory')
args = parser.parse_args()
root = Path(args.output_directory)
rendered = root / 'rendered'
rendered.mkdir(exist_ok=True)
counts, issues, font_sizes = [], [], []
number = 0
for part in range(1, 4):
    source = root / f'PYQs_Part{part}.pdf'
    with pdfplumber.open(source) as pdf:
        counts.append(len(pdf.pages))
        for page in pdf.pages:
            number += 1
            if f'4.{number}' not in (page.extract_text() or ''):
                issues.append([number, 'missing source number'])
            # The body is white, while the header/footer intentionally use greys.
            body_sizes = [c['size'] for c in page.chars if c.get('non_stroking_color') in [(1, 1, 1), (1,), 1]]
            font_sizes.append({'question': number, 'minWhiteFont': min(body_sizes) if body_sizes else None})
            rules = [r['width'] for r in page.lines if r['height'] < 1 and r['width'] > 100]
            if not rules or max(rules) < page.width - 85:
                issues.append([number, 'question box lost full text width'])
            for char in page.chars:
                if char['x0'] < 10 or char['x1'] > page.width - 10 or char['top'] < 10 or char['bottom'] > page.height - 10:
                    issues.append([number, 'text outside page'])
                    break
    subprocess.run(['pdftoppm', '-r', '105', '-png', str(source), str(rendered / f'part{part}')], check=True)
assert counts == [20, 20, 3], counts
files = sorted(rendered.glob('part*.png'))
assert len(files) == 43, len(files)
for file in files:
    with Image.open(file) as image:
        if max(image.convert('RGB').getpixel((3, 3))) > 8:
            issues.append([file.name, 'background is not black'])
for group in range(4):
    sheet = Image.new('RGB', (1800, 1840), '#282828')
    draw = ImageDraw.Draw(sheet)
    for index, file in enumerate(files[group * 12:(group + 1) * 12]):
        with Image.open(file) as image:
            thumbnail = image.convert('RGB')
            thumbnail.thumbnail((590, 425))
        x, y = (index % 3) * 600, (index // 3) * 460
        sheet.paste(thumbnail, (x, y + 25))
        draw.text((x + 8, y + 5), f'Book Q4.{group * 12 + index + 1}', fill='white')
    sheet.save(root / f'contact-{group + 1}.jpg', quality=92)
result = {'pages': number, 'parts': counts, 'renderedPages': len(files), 'blackBackgroundPass': not issues, 'layoutIssues': issues, 'fontSizes': font_sizes}
(root / 'pdf-structure-qa.json').write_text(json.dumps(result, indent=2))
print(json.dumps(result))
assert not issues, issues
