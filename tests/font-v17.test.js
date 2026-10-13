import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULTS,FONT_FAMILIES,fontFamilyFor,normalizeOptions,parseNewick,validateProject,toNewick,labelSegments} from '../src/core.js';

test('legacy font selections still load with their original families',()=>{
 assert.equal(normalizeOptions({font:'sans'}).font,'sans');
 assert.equal(fontFamilyFor(normalizeOptions({font:'serif'})),'"Times New Roman", serif');
 assert.equal(fontFamilyFor(normalizeOptions({font:'mono'})),'"Courier New", monospace');
 assert.equal(normalizeOptions({font:'unknown'}).font,'sans');
 assert.equal(fontFamilyFor({font:'__proto__'}),FONT_FAMILIES.sans);
});

test('all twelve listed fonts and a custom installed name survive project save/load',()=>{
 const tree=parseNewick('(A:1,B:2)99;');
 assert.equal(Object.keys(FONT_FAMILIES).length,12);
 for(const font of [...Object.keys(FONT_FAMILIES),'custom']){
  const options={...DEFAULTS,font,customFont:'Noto Serif'};
  const p=validateProject(JSON.parse(JSON.stringify({format:'clade-studio',version:1,tree,styles:{},options})));
  assert.equal(p.options.font,font);assert.equal(p.options.customFont,'Noto Serif');assert.equal(toNewick(p.tree),toNewick(tree));
 }
 assert.equal(fontFamilyFor({font:'custom',customFont:'Noto Serif'}),'"Noto Serif", Arial, sans-serif');
});

test('custom font names are one quoted family and empty names have a safe fallback',()=>{
 const o=normalizeOptions({font:'custom',customFont:'  A "Quoted" Font\n\u0000  '});
 assert.equal(o.customFont,'A "Quoted" Font');
 assert.equal(fontFamilyFor(o),'"A \\"Quoted\\" Font", Arial, sans-serif');
 assert.equal(fontFamilyFor({font:'custom',customFont:''}),FONT_FAMILIES.sans);
 assert.equal(normalizeOptions({customFont:'a'.repeat(300)}).customFont.length,120);
});

test('font choice leaves scientific-name-only italic ranges intact',()=>{
 const text='Chilobrachys sapphirus sp. nov. ABC123',style={italicMode:'custom',italicRanges:[[0,'Chilobrachys sapphirus'.length]]};
 const a=labelSegments(text,style,DEFAULTS),b=labelSegments(text,style,{...DEFAULTS,font:'serif'});
 assert.deepEqual(a,b);assert.equal(b[0].text,'Chilobrachys sapphirus');assert.equal(b[0].italic,true);assert.equal(b[1].italic,false);
});
