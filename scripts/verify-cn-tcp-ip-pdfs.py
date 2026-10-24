"""Check every exported page and render contact sheets for visual inspection."""
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
counts, issues = [], []
number = 0
for part in range(1, 6):
    source = root / f'PYQs_Part{part}.pdf'
    with pdfplumber.open(source) as pdf:
        counts.append(len(pdf.pages))
        for page in pdf.pages:
            number += 1
            if f'3.{number}' not in (page.extract_text() or ''):
                issues.append([number, 'missing source number'])
            for char in page.chars:
                if char['x0'] < 10 or char['x1'] > page.width - 10 or char['top'] < 10 or char['bottom'] > page.height - 10:
                    issues.append([number, 'text outside page'])
                    break
    subprocess.run(['pdftoppm', '-r', '90', '-png', str(source), str(rendered / f'part{part}')], check=True)
assert counts == [20, 20, 20, 20, 14], counts
files = sorted(rendered.glob('part*.png'))
assert len(files) == 94, len(files)
for file in files:
    with Image.open(file) as image:
        if max(image.convert('RGB').getpixel((3, 3))) > 8:
            issues.append([file.name, 'background is not black'])
for group in range(8):
    sheet = Image.new('RGB', (1800, 1840), '#282828')
    draw = ImageDraw.Draw(sheet)
    for index, file in enumerate(files[group * 12:(group + 1) * 12]):
        with Image.open(file) as image:
            thumbnail = image.convert('RGB')
            thumbnail.thumbnail((590, 425))
        x, y = (index % 3) * 600, (index // 3) * 460
        sheet.paste(thumbnail, (x, y + 25))
        draw.text((x + 8, y + 5), f'Book Q3.{group * 12 + index + 1}', fill='white')
    sheet.save(root / f'contact-{group + 1}.jpg', quality=90)
result = {'pages': number, 'parts': counts, 'renderedPages': len(files), 'blackBackgroundPass': not issues, 'layoutIssues': issues}
(root / 'pdf-structure-qa.json').write_text(json.dumps(result, indent=2))
print(json.dumps(result))
assert not issues, issues
