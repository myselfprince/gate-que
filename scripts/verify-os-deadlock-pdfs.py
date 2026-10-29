"""Check every exported page and independently compile the portable LaTeX ZIP."""
import argparse
import hashlib
import json
import re
from pathlib import Path
import subprocess
import zipfile
import pdfplumber
import pypdfium2 as pdfium

def render_pdf(source, prefix):
    with pdfium.PdfDocument(source) as pdf:
        for i, page in enumerate(pdf, 1):
            page.render(scale=105/72).to_pil().save(str(prefix) + f'-{i:02}.png')
from PIL import Image, ImageChops, ImageDraw

parser = argparse.ArgumentParser()
parser.add_argument('output_directory')
args = parser.parse_args()
root = Path(args.output_directory).resolve()
rendered = root / 'rendered'
rendered.mkdir(exist_ok=True)
counts, issues, font_sizes, source_renders = [], [], [], []
number = 0
for part in range(1, 3):
    source = root / f'PYQs_Part{part}.pdf'
    with pdfplumber.open(source) as pdf:
        counts.append(len(pdf.pages))
        for page in pdf.pages:
            number += 1
            if not re.search(rf'(?m)^{number}\s+\[GATE CS', page.extract_text() or ''):
                issues.append([number, 'missing ordered question/exam header'])
            body_sizes = [c['size'] for c in page.chars if c.get('non_stroking_color') in [(1, 1, 1), (1,), 1]]
            font_sizes.append({'question': number, 'minWhiteFont': min(body_sizes) if body_sizes else None})
            rules = [r['width'] for r in page.lines if r['height'] < 1 and r['width'] > 100]
            # Current default titleMode is first. Only page 1 has a title rule;
            # every question body still uses a full-width TeX minipage.
            if number == 1 and (not rules or max(rules) < page.width - 85):
                issues.append([number, 'question box lost full text width'])
            if any(c['x0'] < 10 or c['x1'] > page.width - 10 or c['top'] < 10 or c['bottom'] > page.height - 10 for c in page.chars):
                issues.append([number, 'text outside page'])
    render_pdf(source, rendered / f'part{part}')
    source_renders.extend(sorted(rendered.glob(f'part{part}-*.png')))
assert counts == [20, 1], counts
assert len(source_renders) == 21
for file in source_renders:
    with Image.open(file) as image:
        if max(image.convert('RGB').getpixel((3, 3))) > 8:
            issues.append([file.name, 'background is not black'])

portable = root / 'editable-verified'
portable.mkdir(exist_ok=True)
with zipfile.ZipFile(root / 'Deadlock-Editable-LaTeX.zip') as archive:
    # Local application-produced ZIP; reject unexpected paths before extraction.
    for item in archive.namelist():
        assert Path(portable / item).resolve().is_relative_to(portable)
    archive.extractall(portable)
tex_source = (portable / 'main.tex').read_text(encoding='utf8')
assert tex_source.count('\\renewcommand{\\questionbody}') == 21
assert '\\begin{minipage}[t]{\\textwidth}' in tex_source
assert '\\resizebox*{!}{\\questionheight}' not in tex_source, 'Whole-question shrinking would narrow prose'
compilation = subprocess.run(['pdflatex', '-no-shell-escape', '-halt-on-error', '-interaction=nonstopmode', 'main.tex'], cwd=portable, capture_output=True, text=True)
(root / 'editable-compilation.log').write_text(compilation.stdout + compilation.stderr, encoding='utf8')
assert compilation.returncode == 0, compilation.stdout[-4000:]
full_pdf = root / 'Deadlock.pdf'
full_pdf.write_bytes((portable / 'main.pdf').read_bytes())
with pdfplumber.open(full_pdf) as pdf:
    assert len(pdf.pages) == 21
render_pdf(full_pdf, rendered / 'editable')
editable_renders = sorted(rendered.glob('editable-*.png'))
assert len(editable_renders) == 21
exact_pages, subpixel_pages = 0, []
for index, (exported, editable) in enumerate(zip(source_renders, editable_renders), 1):
    with Image.open(exported) as left, Image.open(editable) as right:
        assert left.size == right.size
        difference = ImageChops.difference(left.convert('RGB'), right.convert('RGB'))
        if not difference.getbbox():
            exact_pages += 1
            continue
        # Separate part/full TeX compilations can round glyph advances slightly
        # differently. Admit only subpixel differences with identical text,
        # font, color and geometry within 0.02pt (0.03px at this render DPI).
        changed_pixels = sum(pixel != (0, 0, 0) for pixel in difference.get_flattened_data())
        part_number, part_page = (index-1)//20+1, (index-1)%20
        with pdfplumber.open(root / f'PYQs_Part{part_number}.pdf') as part_pdf, pdfplumber.open(full_pdf) as portable_pdf:
            left_chars, right_chars = part_pdf.pages[part_page].chars, portable_pdf.pages[index-1].chars
            identical_text = len(left_chars) == len(right_chars) and all(
                a['text'] == b['text'] and a['fontname'].split('+')[-1] == b['fontname'].split('+')[-1]
                and a.get('non_stroking_color') == b.get('non_stroking_color')
                for a, b in zip(left_chars, right_chars))
            max_delta = max((abs(a[key]-b[key]) for a, b in zip(left_chars, right_chars)
                             for key in ['x0', 'x1', 'top', 'bottom', 'size']), default=0)
        if identical_text and max_delta <= 0.02 and changed_pixels / (left.width*left.height) <= 0.0005:
            subpixel_pages.append({'question': index, 'changedPixels': changed_pixels, 'maxGlyphDeltaPt': max_delta})
        else:
            issues.append([index, 'editable ZIP differs from PDF route'])

for group in range(4):
    sheet = Image.new('RGB', (1800, 920), '#282828')
    draw = ImageDraw.Draw(sheet)
    for index, file in enumerate(source_renders[group * 6:(group + 1) * 6]):
        with Image.open(file) as image:
            thumbnail = image.convert('RGB')
            thumbnail.thumbnail((590, 425))
        x, y = (index % 3) * 600, (index // 3) * 460
        sheet.paste(thumbnail, (x, y + 25))
        draw.text((x + 8, y + 5), f'Book Q3.{group * 6 + index + 1}', fill='white')
    sheet.save(root / f'contact-{group + 1}.jpg', quality=94)
result = {'pages': number, 'parts': counts, 'renderedPages': len(source_renders), 'blackBackgroundPass': not any('background' in issue[1] for issue in issues), 'fullWidthBodyVerified': True,
          'layoutIssues': issues, 'fontSizes': font_sizes, 'editableZipCompiles': True, 'pixelEqualPages': exact_pages,
          'subpixelRoundingPages': subpixel_pages, 'matchingLayoutPages': exact_pages+len(subpixel_pages),
          'fullPdfSHA256': hashlib.sha256(full_pdf.read_bytes()).hexdigest()}
(root / 'pdf-structure-qa.json').write_text(json.dumps(result, indent=2))
print(json.dumps(result))
assert not issues, issues
