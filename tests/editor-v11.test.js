import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULTS,parseNewick,toNewick,indexTree,layoutTree,styleFor,labelSegments,scientificRanges,normalizeItalicRanges,validateProject} from '../src/core.js';
const emphasized=(name,style={},options=DEFAULTS)=>labelSegments(name,style,options).filter(p=>p.italic).map(p=>p.text);
test('scientific-only formatting leaves accessions, authorities and country upright',()=>{
 const name='OR123456 Chilobrachys natanicharum Chomphuphuang et al., 2023 Thailand';
 assert.deepEqual(emphasized(name),['Chilobrachys','natanicharum']);
 assert.equal(labelSegments(name,{},DEFAULTS).map(p=>p.text).join(''),name);
});
test('sp., cf., genus abbreviations and underscore-separated names',()=>{
 assert.deepEqual(emphasized('Chilobrachys sp. A1'),['Chilobrachys']);
 assert.deepEqual(emphasized('Chilobrachys cf. andersoni voucher001'),['Chilobrachys','andersoni']);
 assert.deepEqual(emphasized('C. natanicharum COI_123'),['C.','natanicharum']);
 assert.deepEqual(emphasized('Chilobrachys_natanicharum_MK1234'),['Chilobrachys','natanicharum']);
 assert.deepEqual(emphasized('Clade A'),[]);assert.deepEqual(emphasized('Outgroup A'),[]);
});
test('manual italic ranges support separated parts without changing text',()=>{
 const name='ABC Chilobrachys natanicharum specimen 123';const s={italicMode:'custom',italicRanges:['Chilobrachys','natanicharum'].map(part=>[name.indexOf(part),name.indexOf(part)+part.length])};
 assert.deepEqual(emphasized(name,s),['Chilobrachys','natanicharum']);
 assert.equal(labelSegments(name,s,DEFAULTS).map(p=>p.text).join(''),name);
 assert.deepEqual(normalizeItalicRanges([[2,6],[4,9],[-4,1],[5,5],[10,80]],12),[[0,1],[2,9],[10,12]]);
});
test('local formatting overrides global automatic setting; legacy styles still load',()=>{
 const text='Chilobrachys natanicharum voucher';
 assert.deepEqual(emphasized(text,{italicMode:'none'}),[]);
 assert.deepEqual(emphasized(text,{italicMode:'all'}),[text]);
 assert.deepEqual(emphasized(text,{italic:true}),[text]);
 assert.deepEqual(emphasized(text,{italicMode:'scientific'},{...DEFAULTS,italic:false}),['Chilobrachys','natanicharum']);
});
test('auto collapse width ends at the farthest original tip exactly, excluding labels',()=>{
 const tree=parseNewick('((Species_one:0.4,Species_two:0.8)98:0.2,C:0.6);'),id=tree.children[0].id;
 const expanded=layoutTree(tree,{},DEFAULTS),desc=expanded.all.filter(n=>n.parent?.id===id),right=Math.max(...desc.map(n=>n.x));
 const collapsed=layoutTree(tree,{[id]:{collapsed:true}},DEFAULTS),n=collapsed.all.find(n=>n.id===id);
 assert.ok(Math.abs(n.x+n.style.width-right)<1e-9);assert.equal(n.style.widthMode,'auto');
 assert.equal(toNewick(tree),'((Species_one:0.4,Species_two:0.8)98:0.2,C:0.6);');
});
test('auto width follows metric and global scale; manual width remains independent',()=>{
 const tree=parseNewick('((A:1,B:2)99:1,C:5);'),id=tree.children[0].id;
 const auto={[id]:{collapsed:true,widthMode:'auto'}};
 const a=layoutTree(tree,auto,DEFAULTS).all.find(n=>n.id===id),b=layoutTree(tree,auto,{...DEFAULTS,treeWidth:1240}).all.find(n=>n.id===id);
 assert.equal(b.style.width,a.style.width*2);
 const manual=layoutTree(tree,{[id]:{collapsed:true,width:77}},DEFAULTS).all.find(n=>n.id===id);assert.equal(manual.style.width,77);assert.equal(manual.style.widthMode,'manual');
 const topology=layoutTree(tree,auto,{...DEFAULTS,metric:'topology'}).all.find(n=>n.id===id);assert.equal(topology.style.width,310);
});
test('hidden descendant collapse and support movement never affect native clade width',()=>{
 const tree=parseNewick('(((A:1,B:4)87:2,C:2)99:3,D:8);'),id=tree.children[0].id,child=tree.children[0].children[0].id;
 const base=layoutTree(tree,{[id]:{collapsed:true}},DEFAULTS).all.find(n=>n.id===id);
 const modified=layoutTree(tree,{[id]:{collapsed:true,supportDx:120,supportDy:-60},[child]:{collapsed:true,width:999}},DEFAULTS).all.find(n=>n.id===id);
 assert.equal(modified.style.width,base.style.width);
});
test('circular branch scale and native radial extent survive collapse',()=>{
 let i=0;function subtree(d){return d?`(${subtree(d-1)},${subtree(d-1)}):.1`:`T${++i}:.1`;}
 const tree=parseNewick(subtree(6)+';'),id=tree.children[0].id,opts={...DEFAULTS,layout:'circular'};
 const a=layoutTree(tree,{},opts),b=layoutTree(tree,{[id]:{collapsed:true}},opts);assert.equal(a.scale,b.scale);
 const node=b.all.find(n=>n.id===id),tips=a.all.filter(n=>!n.node.children.length);assert.ok(Math.abs(node.radius+node.style.width-Math.max(...tips.map(n=>n.radius)))<1e-8);
});
test('zero-length descendant clade retains zero distance instead of artificial width',()=>{
 const tree=parseNewick('((A:0,B:0)99:1,C:2);'),id=tree.children[0].id,n=layoutTree(tree,{[id]:{collapsed:true}},DEFAULTS).all.find(n=>n.id===id);assert.equal(n.style.width,0);
});
test('partial italics, native width and bootstrap offsets survive project round trip',()=>{
 const tree=parseNewick("('Chilobrachys natanicharum A':.1,B:.2)100/99;"),id=tree.id;
 const st={[id]:{collapsed:true,widthMode:'auto',supportDx:45,supportDy:-30,supportAnchor:'middle'},[tree.children[0].id]:{italicMode:'custom',italicRanges:[[0,11],[12,24]]}};
 const p=validateProject(JSON.parse(JSON.stringify({format:'clade-studio',version:1,tree,styles:st,options:DEFAULTS,title:'v1.1'})));
 assert.equal(p.tree.name,'100/99');assert.equal(p.styles[id].supportDx,45);assert.equal(p.styles[id].supportDy,-30);assert.equal(p.styles[id].supportAnchor,'middle');assert.equal(p.styles[id].widthMode,'auto');assert.deepEqual(p.styles[tree.children[0].id].italicRanges,[[0,11],[12,24]]);assert.equal(toNewick(tree),toNewick(p.tree));
});
