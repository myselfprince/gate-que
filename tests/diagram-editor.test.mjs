import test from 'node:test';
import assert from 'node:assert/strict';
import { SYMBOLS, createNode, createEdge, nodePorts, portPosition, edgeGeometry, emptyDiagram, validateDiagram, duplicateItems, removeItems, contentBounds } from '../src/lib/diagram-model.mjs';
import { diagramSvg } from '../src/lib/diagram-svg.mjs';
import { DIAGRAM_TEMPLATES, makeTemplate } from '../src/lib/diagram-templates.mjs';

test('all ready templates round-trip with valid pins and complete attached connections',()=>{
  for(const template of DIAGRAM_TEMPLATES){const doc=makeTemplate(template.id),copy=validateDiagram(JSON.parse(JSON.stringify(doc)));assert.equal(copy.nodes.length,doc.nodes.length);assert.equal(copy.edges.length,doc.edges.length);assert.ok(diagramSvg(copy).startsWith('<svg'));}
});
test('logic symbols expose configurable multi-input pins and MUX / DEMUX select lines',()=>{
  const and=createNode('and',0,0,{inputs:12,height:280}),mux=createNode('mux',0,0,{inputs:16}),demux=createNode('demux',0,0,{outputs:8});
  assert.equal(nodePorts(and).filter(p=>p.side==='left').length,12);
  assert.equal(nodePorts(mux).filter(p=>p.side==='bottom').length,4);
  assert.equal(nodePorts(demux).filter(p=>p.side==='right').length,8);
  assert.equal(nodePorts(demux).filter(p=>p.side==='bottom').length,3);
  assert.ok(SYMBOLS.some(symbol=>symbol.type==='multiplier'));
});
test('connections follow node movement and rotated pin geometry',()=>{
  const a=createNode('and',100,100),b=createNode('output',400,100),edge=createEdge({nodeId:a.id,portId:'right0'},{nodeId:b.id,portId:'left0'},[a,b]);
  const original=edgeGeometry(edge,[a,b]),moved=edgeGeometry(edge,[{...a,x:180},b]);
  assert.equal(moved.start.x-original.start.x,80);assert.notEqual(original.path,moved.path);
  const rotated=portPosition({...a,rotation:90},'right0');assert.equal(rotated.x,a.x+a.width/2);assert.equal(rotated.y,a.y+a.height/2+a.width/2);
});
test('state transitions terminate at circular boundaries and self-loop bounds include the curve',()=>{
  const a=createNode('start',100,200),b=createNode('accept',400,200),edge=createEdge({nodeId:a.id,portId:'auto'},{nodeId:b.id,portId:'auto'},[a,b],{label:'ε',style:'straight'});
  const geometry=edgeGeometry(edge,[a,b]);assert.equal(geometry.start.x,180);assert.equal(geometry.end.x,400);
  const loop=createEdge({nodeId:a.id,portId:'auto'},{nodeId:a.id,portId:'auto'},[a],{label:'0, 1',bend:80});
  const bounds=contentBounds({...emptyDiagram(),nodes:[a],edges:[loop]});assert.ok(bounds.y<100);assert.match(diagramSvg({...emptyDiagram(),nodes:[a],edges:[loop]}),/marker-end/);
});
test('copy duplicates internal wiring with new IDs and delete removes attached edges',()=>{
  const doc=makeTemplate('half-adder'),ids=doc.nodes.map(node=>node.id),copy=duplicateItems(doc,ids);
  assert.equal(copy.project.nodes.length,doc.nodes.length*2);assert.equal(copy.project.edges.length,doc.edges.length*2);assert.equal(new Set(copy.project.nodes.map(node=>node.id)).size,copy.project.nodes.length);
  const removed=removeItems(copy.project,[doc.nodes[0].id]);assert.ok(removed.edges.every(edge=>edge.source.nodeId!==doc.nodes[0].id&&edge.target.nodeId!==doc.nodes[0].id));
});
test('import rejects active markup styles, missing references and oversized pin counts',()=>{
  const doc=makeTemplate('half-adder');assert.throws(()=>validateDiagram({...doc,nodes:[{...doc.nodes[0],color:'red" onclick="alert(1)'}]}),/colour/);
  assert.throws(()=>validateDiagram({...doc,nodes:doc.nodes.slice(1)}),/missing symbol/);
  assert.throws(()=>validateDiagram({...doc,nodes:doc.nodes.map((node,i)=>i?node:{...node,inputs:65})}),/invalid coordinate/);
  assert.throws(()=>validateDiagram({...doc,nodes:doc.nodes.map((node,i)=>i?node:{...node,id:'bad"id'})}),/ID/);
});
test('SVG exports escape labels and omit editor controls while keeping editable artwork',()=>{
  const doc={...emptyDiagram('<script>title</script>'),nodes:[createNode('text',20,20,{label:'A < B & "C" <script>alert(1)</script>'})],edges:[]};
  const svg=diagramSvg(doc,{background:'transparent'});assert.doesNotMatch(svg,/<script>|onclick=|foreignObject|data-port/);assert.match(svg,/&lt;script&gt;/);assert.match(svg,/fill="currentColor"/);assert.doesNotMatch(svg,/<rect/);
});
