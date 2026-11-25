"""Build a read-only index of the GATE Overflow PYQ PDFs.

Usage (run from the project root; the PDFs are only read):
    python -I scripts/topic-answers/gateoverflow-index.py [output.json] [pdf folder]

Defaults: tmp/gateoverflow/index.json and G:\\GateOverflow PYQ PDF all years.

For every volume the index records its checksum, chapters (from the PDF outline)
and every question header: GO id such as 3.1.24, topic, exam, year, set,
question label, page, gateoverflow.in URL, a plain-text snippet and the answer
from the chapter's "Answer Keys" table. Formulas are rendered as images in
these PDFs, so snippets omit math; render the page to compare option text.
"""
import hashlib
import json
import os
import re
import sys

import fitz  # PyMuPDF

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join('tmp', 'gateoverflow', 'index.json')
ROOT = sys.argv[2] if len(sys.argv) > 2 else r'G:\GateOverflow PYQ PDF all years'

ID = re.compile(r'^\d+\.\d+\.\d+$')
HEADER = re.compile(
    r'^(?P<topic>.+?):\s+(?P<exam>GATE\s+[A-Za-z&]+)\s+(?P<year>(?:19|20)\d{2})'
    r'(?:\s*\|\s*Set\s*(?P<set>\d+))?(?:\s*\|\s*(?P<section>GA))?\s*\|\s*Question:\s*(?P<question>.+)$')
CHAPTER = re.compile(r'^(?P<number>\d+)\s+(?P<title>.+?)\s+\((?P<count>\d+)\)$')
SKIP = re.compile(r'^(Answer key|gate\S*\s|[a-z0-9&\-]+(\s{2,}[a-z0-9&\-]+)+$)')


def sha256(path):
    digest = hashlib.sha256()
    with open(path, 'rb') as handle:
        for block in iter(lambda: handle.read(1 << 20), b''):
            digest.update(block)
    return digest.hexdigest()


def page_lines(page):
    lines = []
    for block in page.get_text('dict')['blocks']:
        for line in block.get('lines', []):
            text = ''.join(span['text'] for span in line['spans']).strip()
            if text:
                x0, y0, x1, y1 = line['bbox']
                lines.append({'text': text, 'x': x0, 'y': (y0 + y1) / 2})
    lines.sort(key=lambda item: (round(item['y']), item['x']))
    return lines


def question_links(page):
    links = []
    for link in page.get_links():
        uri = link.get('uri') or ''
        if re.match(r'^https://gateoverflow\.in/\d+/[^/]+$', uri):
            rect = link['from']
            links.append({'uri': uri, 'y': (rect.y0 + rect.y1) / 2})
    return links


def answer_keys(doc, first, last):
    """Pair each GO id with the token to its right in the key table pages."""
    keys = {}
    for number in range(first, last + 1):
        rows = {}
        # The first key page can also hold the chapter's last questions; read only below the heading.
        heading = next((line['y'] for line in page_lines(doc[number - 1]) if line['text'] == 'Answer Keys'), None) if number == first else None
        for word in doc[number - 1].get_text('words'):
            if heading is not None and (word[1] + word[3]) / 2 <= heading:
                continue
            rows.setdefault(round((word[1] + word[3]) / 2 / 3), []).append(word)
        for words in rows.values():
            words.sort(key=lambda word: word[0])
            for index, word in enumerate(words):
                if not ID.match(word[4]) or word[4] in keys:
                    continue
                following = words[index + 1][4] if index + 1 < len(words) else ''
                keys[word[4]] = {'answer': '' if ID.match(following) else following, 'page': number}
    return keys


def index_volume(path):
    doc = fitz.open(path)
    toc = doc.get_toc()
    chapters = []
    for position, (level, title, page) in enumerate(toc):
        match = CHAPTER.match(title) if level == 1 else None
        if not match:
            continue
        end = next((p for lvl, _, p in toc[position + 1:] if lvl == 1), doc.page_count + 1) - 1
        key_page = next((p for _, t, p in toc[position + 1:] if t == 'Answer Keys' and p <= end), None)
        chapters.append({'number': int(match['number']), 'title': match['title'], 'questionCount': int(match['count']),
                         'firstPage': page, 'lastPage': end, 'answerKeyPage': key_page})

    questions, current = [], None
    for chapter in chapters:
        keys = answer_keys(doc, chapter['answerKeyPage'], chapter['lastPage']) if chapter['answerKeyPage'] else {}
        stop = chapter['answerKeyPage'] or chapter['lastPage']
        for number in range(chapter['firstPage'], stop + 1):
            page = doc[number - 1]
            lines, links = page_lines(page), question_links(page)
            ids = [line for line in lines if ID.match(line['text'])]
            for line in lines:
                if number == chapter['answerKeyPage'] and line['text'] == 'Answer Keys':
                    break  # The key table follows the chapter's last questions on this page.
                header = HEADER.match(line['text'])
                if header:
                    same_row = [item for item in ids if abs(item['y'] - line['y']) < 4]
                    link = min((item for item in links if abs(item['y'] - line['y']) < 6), key=lambda item: abs(item['y'] - line['y']), default=None)
                    go_id = same_row[0]['text'] if same_row else ''
                    key = keys.get(go_id, {})
                    current = {
                        'volume': os.path.basename(path), 'id': go_id, 'chapter': chapter['title'],
                        'topic': header['topic'], 'exam': header['exam'], 'year': header['year'], 'set': header['set'] or '',
                        'question': header['question'].strip(), 'title': line['text'], 'page': number,
                        'url': link['uri'] if link else '', 'answer': key.get('answer', ''), 'answerKeyPage': key.get('page'),
                        'text': '',
                    }
                    questions.append(current)
                elif current and current['volume'] == os.path.basename(path) and not ID.match(line['text']) \
                        and not SKIP.match(line['text']) and len(current['text']) < 1500:
                    current['text'] = f"{current['text']} {line['text']}".strip()
            if number == stop:
                current = None
    return {'file': path, 'size': os.path.getsize(path), 'sha256': sha256(path), 'pages': doc.page_count,
            'chapters': chapters}, questions


def main():
    volumes, questions = [], []
    for name in sorted(os.listdir(ROOT)):
        if name.lower().endswith('.pdf'):
            volume, found = index_volume(os.path.join(ROOT, name))
            volumes.append(volume)
            questions.extend(found)
    os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as handle:
        json.dump({'format': 'gateoverflow-pdf-index-v1', 'root': ROOT, 'volumes': volumes, 'questions': questions},
                  handle, ensure_ascii=False, indent=1)
    missing = sum(1 for q in questions if not q['answer'])
    print(f'{len(volumes)} volumes, {len(questions)} questions, {missing} without a key entry -> {OUT}')


if __name__ == '__main__':
    main()
