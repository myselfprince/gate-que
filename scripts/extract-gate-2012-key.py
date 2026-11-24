"""Read only the retained 2012 CS booklet-A key mirror, including cancelled items."""
import json,re
from pathlib import Path
import fitz

root=Path('data/backups/gate-2012')
doc=fitz.open(root/'historical-key-mirror.pdf')
text='\n'.join(page.get_text(sort=True) for page in doc)
if not re.search(r'GATE\s+2012.*Answer\s+Key.*Paper\s*:\s*CS',text):
 raise ValueError('Unexpected key identity')
rows=re.findall(r'^\s*CS\s+(\d+)\s+(Marks to All|[ABCD])\s+',text,re.M)
keys={int(number):answer for number,answer in rows}
if len(rows)!=65 or set(keys)!=set(range(1,66)):
 raise ValueError('Incomplete or duplicate booklet-A key entries')
(root/'historical-key-mirror-key.json').write_text(json.dumps(keys,indent=2),encoding='utf-8')
print('65 booklet-A entries read; retained PDF is a mirror, not a direct official-host download.')
