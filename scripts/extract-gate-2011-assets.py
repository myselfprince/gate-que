from pathlib import Path
import fitz
doc=fitz.open(r'D:\Gate PYQs Year Wise - PDFs\2011.pdf')
out=Path('public/Year Papers/GATE CS 2011');out.mkdir(parents=True,exist_ok=True)
# Diagram-only crops from the exact selected booklet-A scan; coordinates in PDF points.
regions=[
 ('q13-a',4,(112,303,213,348)),('q13-b',4,(337,306,470,350)),
 ('q13-c',4,(111,363,218,408)),('q13-d',4,(335,365,531,452)),
 ('q17-graphs',5,(205,88,408,201)),
 ('q23-a',6,(110,107,235,275)),('q23-b',6,(319,108,445,239)),
 ('q23-c',6,(106,299,234,432)),('q23-d',6,(318,300,445,432)),
 ('q27-a',7,(143,278,260,453)),('q27-b',7,(376,277,478,443)),
 ('q27-c',7,(157,462,258,633)),('q27-d',7,(367,457,493,636)),
 ('q36-tree',10,(270,144,395,294)),('q41-pipeline',11,(91,235,537,398)),
 ('q45-dfa',12,(247,95,405,195)),('q45-a',12,(131,255,290,360)),
 ('q45-b',12,(342,258,523,348)),('q45-c',12,(124,378,293,451)),('q45-d',12,(376,374,478,476)),
 ('q50-51-counter',14,(229,338,389,594)),('q52-53-network',15,(216,103,387,270)),
 ('q54-55-graph',15,(247,573,350,661)),('q62-microbes',17,(123,143,515,393)),
]
for name,page,rect in regions:
 if name=='q52-53-network':
  # Remove only unrelated preceding-sentence fragments beside the diagram.
  canvas=fitz.open();p=canvas.new_page(width=rect[2]-rect[0],height=rect[3]-rect[1])
  p.show_pdf_page(p.rect,doc,page-1,clip=fitz.Rect(*rect))
  p.draw_rect(fitz.Rect(0,0,124,8),fill=(1,1,1),color=(1,1,1))
  p.get_pixmap(matrix=fitz.Matrix(4,4)).save(str(out/(name+'.png')))
 else:
  doc[page-1].get_pixmap(matrix=fitz.Matrix(4,4),clip=fitz.Rect(*rect)).save(str(out/(name+'.png')))
print(f'{len(regions)} independent diagram crops')
