"""Read the downloaded historical key's booklet-A column; never alter the source PDF."""
import json,re
from pathlib import Path
import fitz
root=Path('data/backups/gate-2011')
doc=fitz.open(root/'historical-key-mirror.pdf')
text='\n'.join(page.get_text(sort=True) for page in doc)
if 'GATE 2011 - Answer Key - Paper : CS' not in text:
 raise ValueError('Unexpected answer-key identity')
rows=re.findall(r'^\s*CS\s+(\d+)\s+([ABCD])\s+[ABCD]\s+[ABCD]\s+[ABCD]\s*$',text,re.M)
keys={int(number):key for number,key in rows}
if len(rows)!=65 or set(keys)!=set(range(1,66)):
 raise ValueError('Incomplete or duplicate booklet-A key rows')
(root/'historical-key-mirror-key.json').write_text(json.dumps(keys,indent=2),encoding='utf-8')
print('Read all 65 booklet-A key entries; original issuing host remains unauthenticated.')
