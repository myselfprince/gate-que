from pathlib import Path
import fitz
doc=fitz.open(r'D:\Gate PYQs Year Wise - PDFs\2005.pdf')
out=Path('public/Year Papers/GATE CS 2005');out.mkdir(parents=True,exist_ok=True)
crops=[
 ('q9-hasse',2,(87,44,213,112)),('q15-circuit',2,(330,165,503,232)),
 ('q47-g1',6,(106,228,174,287)),('q47-g2',6,(109,289,177,356)),
 ('q47-g3',6,(108,358,175,417)),('q47-g4',6,(108,419,175,478)),
 ('q53-machine',7,(84,45,255,109)),('q62-circuit',8,(84,160,268,233)),
 ('q62-timing',8,(87,272,273,335)),('q63-machine',8,(94,492,258,555)),
 ('q64-circuit',8,(325,40,492,114)),('q79-80-datapath',10,(304,535,485,612)),
 ('q85-format',12,(306,361,455,430))]
for name,page,box in crops:
 doc[page-1].get_pixmap(matrix=fitz.Matrix(5,5),clip=fitz.Rect(box)).save(str(out/(name+'.png')))
