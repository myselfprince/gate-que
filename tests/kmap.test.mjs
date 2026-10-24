import test from 'node:test';
import assert from 'node:assert/strict';
import { bitCount, cubeMatches, emptyKmap, grayCodes, groupCube, groupFragments, kmapLayout, normalizeKmap, simplifyKmap, valuesFromTerms } from '../src/lib/kmap.mjs';
import { kmapLatex, kmapSvg } from '../src/lib/kmap-svg.mjs';
import { createNode, emptyDiagram, validateDiagram } from '../src/lib/diagram-model.mjs';
import { diagramSvg } from '../src/lib/diagram-svg.mjs';

test('Gray-code neighbours differ by one bit and 2–6 variable panels cover each minterm exactly once',()=>{
  for(let n=1;n<=3;n++){const codes=grayCodes(n);for(let i=0;i<codes.length;i++)assert.equal(bitCount(parseInt(codes[i],2)^parseInt(codes[(i+1)%codes.length],2)),1);}
  for(let n=2;n<=6;n++){const layout=kmapLayout(emptyKmap(n));assert.equal(layout.cells.length,1<<n);assert.deepEqual(layout.cells.map(cell=>cell.term).sort((a,b)=>a-b),Array.from({length:1<<n},(_,i)=>i));assert.equal(layout.panels.length,2**Math.max(0,n-4));}
});
test('term lists support ranges, reject invalid terms and never silently overlap dont-cares',()=>{
  assert.deepEqual(valuesFromTerms(2,'0, 2-3','1'),['1','X','1','1']);
  assert.throws(()=>valuesFromTerms(3,'8',''),/between/);assert.throws(()=>valuesFromTerms(3,'1','1'),/both/);assert.throws(()=>valuesFromTerms(3,'1, bad',''),/Invalid term/);
});
test('Boolean grouping accepts corner wrap and matching planes but rejects diagonal and incomplete cubes',()=>{
  const cube=groupCube([0,2,8,10],4);assert.deepEqual({bits:cube.bits,mask:cube.mask},{bits:0,mask:10});
  assert.equal(groupFragments(cube.terms,kmapLayout(emptyKmap(4))).length,4);
  assert.equal(groupFragments([0,16],kmapLayout(emptyKmap(5))).length,2);
  assert.throws(()=>groupCube([0,3],2),/adjacent/);assert.throws(()=>groupCube([0,1,2],2),/group must/);
});
function checkCover(values,variables,mode) {
  const result=simplifyKmap(values,variables,mode),target=mode==='sop'?'1':'0';
  values.forEach((value,index)=>{if(value==='X')return;const matches=result.cubes.some(cube=>cubeMatches(cube,index));assert.equal(matches,value===target,`${variables} ${mode}: term ${index} of ${values.join('')}`);});
  result.groups.forEach(group=>groupCube(group,variables.length));return result;
}
test('SOP and POS agree with every defined truth-table row for all 2-variable ternary functions and 3-variable Boolean functions',()=>{
  for(let code=0;code<81;code++){let v=code;const values=Array.from({length:4},()=>{const digit=v%3;v=Math.floor(v/3);return['0','1','X'][digit];});for(const mode of ['sop','pos'])checkCover(values,'AB',mode);}
  for(let code=0;code<256;code++){const values=Array.from({length:8},(_,i)=>code&(1<<i)?'1':'0');for(const mode of ['sop','pos'])checkCover(values,'ABC',mode);}
});
test('minimum cover matches exhaustive optimal term/literal cost for every two-variable function including dont-cares',()=>{
  const cubes=[];for(let mask=0;mask<4;mask++)for(let bits=0;bits<4;bits++)if((bits&mask)===0)cubes.push({bits,mask});
  for(let code=0;code<81;code++)for(const mode of ['sop','pos']){
    let number=code;const values=Array.from({length:4},()=>{const value=['0','1','X'][number%3];number=Math.floor(number/3);return value;});const target=mode==='sop'?'1':'0';
    const allowed=cubes.filter(cube=>values.every((value,index)=>value==='X'||!cubeMatches(cube,index)||value===target));let optimal=[Infinity,Infinity];
    for(let subset=0;subset<1<<allowed.length;subset++){const selected=allowed.filter((_,i)=>subset&(1<<i));if(!values.every((value,index)=>value!==target||selected.some(cube=>cubeMatches(cube,index))))continue;const cost=[selected.length,selected.reduce((sum,cube)=>sum+2-bitCount(cube.mask),0)];if(cost[0]<optimal[0]||cost[0]===optimal[0]&&cost[1]<optimal[1])optimal=cost;}
    const result=simplifyKmap(values,'AB',mode),actual=[result.cubes.length,result.cubes.reduce((sum,cube)=>sum+2-bitCount(cube.mask),0)];assert.deepEqual(actual,optimal,`${code} ${mode}`);assert.equal(result.exact,true);
  }
});
test('known simplifications, constants, dont-cares and six-variable patterns are correct',()=>{
  assert.equal(simplifyKmap(valuesFromTerms(4,'0,2,8,10',''),'ABCD').expression,"B'D'");
  assert.equal(simplifyKmap(valuesFromTerms(3,'1,3,5,7',''),'ABC').expression,'C');
  assert.equal(simplifyKmap(Array(16).fill('1'),'ABCD').expression,'1');assert.equal(simplifyKmap(Array(16).fill('0'),'ABCD','pos').expression,'0');
  for(const mode of ['sop','pos'])checkCover(Array.from({length:64},(_,i)=>i%7===0?'X':bitCount(i)%2?'1':'0'),'ABCDEF',mode);
  assert.throws(()=>simplifyKmap(['','','',''],'AB'),/blank/);
});
test('K-Map SVG / LaTeX retain labels, all cells and groups and can be embedded as editable vector artwork',()=>{
  const map=emptyKmap(4);map.title='Map < & test';map.values=valuesFromTerms(4,'0,2,8,10','');map.groups=[[0,2,8,10]];
  const svg=kmapSvg(map),tex=kmapLatex(map);assert.match(svg,/Map &lt; &amp; test/);assert.doesNotMatch(svg,/tabindex|data-minterm/);assert.equal((tex.match(/rectangle \+\+\(72,72\)/g)||[]).length,16);assert.match(tex,/definecolor/);
  const doc=validateDiagram({...emptyDiagram(),nodes:[createNode('kmap',100,100,{width:600,height:600,kmap:map})]});assert.match(diagramSvg(doc),/G1 =/);assert.throws(()=>normalizeKmap({...map,groups:[[0,3]]}),/adjacent/);
});
