import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DEFAULTS,SAMPLE,parseNewick,indexTree,walk,rerootTree,branchSupportFor,supportText,toNewick,validateProject,layoutTree,normalizeGroups,resolveGroups,ladderizeTree} from '../src/core.js';
const fixture=()=>parseNewick('((((A:1,B:2)91/99:3,C:4)86/97:5,D:6)94/100:7,(E:8,F:9)89/98:10,G:11);');
const find=(tree,name)=>[...indexTree(tree).nodes.values()].find(n=>n.name===name);
const tips=tree=>[...indexTree(tree).nodes.values()].filter(n=>!n.children.length).map(n=>n.name).sort();
function distances(tree){
 const adj=new Map();walk(tree,n=>adj.set(n.id,[]));walk(tree,(n,p)=>{if(p){adj.get(n.id).push([p.id,n.length]);adj.get(p.id).push([n.id,n.length]);}});
 const leaves=[...indexTree(tree).nodes.values()].filter(n=>!n.children.length),out={};
 for(const a of leaves){const d=new Map(),stack=[[a.id,null,0]];while(stack.length){const[id,parent,total]=stack.pop();d.set(id,total);for(const[next,length]of adj.get(id))if(next!==parent)stack.push([next,id,total===null||length===null?null:total+length]);}for(const b of leaves)if(a.name<b.name)out[a.name+'|'+b.name]=d.get(b.id);}
 return out;
}
function splits(tree){
 const all=tips(tree),result=[];walk(tree,(n,p)=>{const value=branchSupportFor(n);if(!p||!value)return;const inside=[];walk(n,x=>{if(!x.children.length)inside.push(x.name);});inside.sort();const outside=all.filter(t=>!inside.includes(t)).sort();const key=[inside.join(','),outside.join(',')].sort().join('|');result.push(key+':'+value);});return result.sort();
}
function checkDistances(a,b){const d1=distances(a),d2=distances(b);assert.deepEqual(Object.keys(d1).sort(),Object.keys(d2).sort());for(const key of Object.keys(d1)){if(d1[key]===null)assert.equal(d2[key],null);else assert.ok(Math.abs(d1[key]-d2[key])<1e-9,`${key}: ${d1[key]} != ${d2[key]}`);}}
test('selected internal clade remains intact on the first side of a two-way root',()=>{
 const tree=fixture(),id=find(tree,'91/99').id,before=JSON.stringify(tree),r=rerootTree(tree,id);
 assert.notEqual(r.tree.id,id);assert.equal(r.mode,'clade');assert.equal(r.tree.children.length,2);assert.equal(r.tree.children[0].id,id);assert.deepEqual(tips(r.tree.children[0]),['A','B']);assert.deepEqual(tips(r.tree),tips(tree));checkDistances(tree,r.tree);assert.deepEqual(splits(r.tree),splits(tree));assert.equal(JSON.stringify(tree),before);assert.equal(supportText(r.tree),'');assert.equal(r.tree.rooted,true);
});
test('all nodes in an IQ-TREE-like tree preserve patristic distances and support bipartitions',()=>{
 const tree=parseNewick(SAMPLE);for(const n of indexTree(tree).nodes.values()){const r=rerootTree(tree,n.id);assert.deepEqual(tips(r.tree),tips(tree));checkDistances(tree,r.tree);assert.deepEqual(splits(r.tree),splits(tree),n.id);for(const options of [DEFAULTS,{...DEFAULTS,layout:'circular'}]){const layout=layoutTree(r.tree,r.styles,options);assert.ok(layout.all.every(v=>Number.isFinite(v.x)&&Number.isFinite(v.y)));}}
});
test('terminal rooting inserts a midpoint root and keeps the selected species as a leaf',()=>{
 const tree=fixture(),tip=find(tree,'A'),r=rerootTree(tree,tip.id),selected=indexTree(r.tree).nodes.get(tip.id);
 assert.equal(r.mode,'tip');assert.notEqual(r.tree.id,tip.id);assert.equal(r.tree.children.length,2);assert.equal(selected.children.length,0);assert.equal(selected.name,'A');assert.equal(selected.length,.5);assert.equal(r.tree.children.find(n=>n.id!==tip.id).length,.5);checkDistances(tree,r.tree);assert.deepEqual(splits(r.tree),splits(tree));
});
test('missing, zero and negative lengths are retained without inventing distances',()=>{
 const tree=parseNewick('(((A:0,B:-2)70:0,C)81:3,D:5);');for(const n of indexTree(tree).nodes.values()){const r=rerootTree(tree,n.id);checkDistances(tree,r.tree);assert.deepEqual(tips(r.tree),tips(tree));assert.deepEqual(splits(r.tree),splits(tree));}
 const missing=rerootTree(tree,find(tree,'C').id);assert.equal(missing.tree.children[0].length,null);assert.equal(missing.tree.children[1].length,null);
});
test('binary old roots may remain unary; ancestral dangling stems never become false tips',()=>{
 for(const text of ['((A:1,B:2)90:3,(C:4,D:5)80:6);','((((A:1,B:2)90:3,C:4)80:5)70:6)100:2;']){const tree=parseNewick(text),r=rerootTree(tree,find(tree,'90').id);assert.deepEqual(tips(r.tree),tips(tree));checkDistances(tree,r.tree);assert.equal(r.tree.length,tree.length);}
});
test('color groups retain original leaf membership when their clade becomes the rooting reference',()=>{
 const tree=fixture(),id=find(tree,'91/99').id,groups=normalizeGroups([{id:'gAB',name:'Group AB',nodeIds:[id],colorLabels:true}],new Set(indexTree(tree).nodes.keys())),r=rerootTree(tree,id,{},groups),layout=layoutTree(r.tree,r.styles,DEFAULTS),resolved=resolveGroups(r.tree,r.groups,layout,DEFAULTS);
 assert.deepEqual([...resolved.groups[0].leaves].sort(),[find(tree,'A').id,find(tree,'B').id].sort());assert.ok(!resolved.labelColors.has(find(tree,'C').id));assert.equal(resolved.groups[0].covered.has(r.tree.id),false);
});
test('changed clades expand, unrelated collapsed clades and manual sizes survive',()=>{
 const tree=fixture(),id=find(tree,'91/99').id,ancestor=find(tree,'86/97').id,other=find(tree,'89/98').id,styles={[id]:{collapsed:true,width:100},[ancestor]:{collapsed:true},[other]:{collapsed:true,width:77,height:66}};
 const r=rerootTree(tree,id,styles);assert.equal(r.styles[id].collapsed,true);assert.equal(r.styles[ancestor].collapsed,false);assert.equal(r.styles[other].collapsed,true);assert.equal(r.styles[other].width,77);assert.equal(r.styles[other].height,66);assert.equal(styles[id].collapsed,true);
});
test('bootstrap drag positions follow reversed support-bearing edges',()=>{
 const tree=fixture(),id=find(tree,'91/99').id,parent=find(tree,'86/97').id,grandparent=find(tree,'94/100').id,r=rerootTree(tree,id,{[id]:{supportDx:23,supportDy:-16,supportAnchor:'middle'},[parent]:{supportDx:-41,supportDy:7,supportAnchor:'start'}});
 assert.equal(branchSupportFor(indexTree(r.tree).nodes.get(id)),'91/99');assert.equal(r.styles[id].supportDx,23);assert.equal(r.styles[id].supportDy,-16);assert.equal(r.styles[id].supportAnchor,'middle');assert.equal(branchSupportFor(indexTree(r.tree).nodes.get(parent)),null);assert.equal(branchSupportFor(indexTree(r.tree).nodes.get(grandparent)),'86/97');assert.equal(r.styles[grandparent].supportDx,-41);assert.equal(r.styles[r.tree.id].supportDx,0);
});
test('rerooted Newick and projects round-trip lengths, numeric support and root direction',()=>{
 const tree=fixture(),r=rerootTree(tree,find(tree,'91/99').id),nwk=toNewick(r.tree),reparsed=parseNewick(nwk);assert.ok(nwk.startsWith('[&R] '));checkDistances(tree,reparsed);assert.deepEqual(splits(reparsed),splits(tree));assert.equal(reparsed.rooted,true);
 const raw={format:'clade-studio',version:1,...r,options:DEFAULTS,title:'Rooted'},p=validateProject(JSON.parse(JSON.stringify(raw)));assert.equal(p.tree.id,r.tree.id);assert.equal(p.tree.rooted,true);assert.deepEqual(splits(p.tree),splits(tree));assert.equal(toNewick(p.tree),nwk);
});
test('named internal nodes and ordinary comments survive while support moves across them',()=>{
 const tree=parseNewick('((((A:1,B:2)75:1,E:2)91[tip-group]:3,C:4)Named[other]:5,D:6);'),named=find(tree,'Named').id,r=rerootTree(tree,find(tree,'75').id),node=indexTree(r.tree).nodes.get(named);assert.equal(node.name,'Named');assert.equal(branchSupportFor(node),'91');assert.deepEqual(node.comments,['[other]']);const re=parseNewick(toNewick(r.tree));assert.equal(find(re,'Named').branchSupport,'91');checkDistances(tree,re);assert.deepEqual(splits(re),splits(tree));
});
test('numeric tip names stay taxa and do not become support values',()=>{
 const tree=parseNewick('((101:1,102:2)99:3,103:4);'),r=rerootTree(tree,find(tree,'101').id);const re=parseNewick(toNewick(r.tree));assert.deepEqual(tips(re),['101','102','103']);checkDistances(tree,re);
});
test('repeated rerooting is stable; original-root and invalid selections are handled',()=>{
 const tree=fixture();let current=tree;for(const name of ['A','F','B','G','C']){current=rerootTree(current,find(current,name).id).tree;checkDistances(tree,current);assert.deepEqual(splits(current),splits(tree));}assert.equal(rerootTree(current,current.id).changed,false);assert.throws(()=>rerootTree(tree,'n999'),/선택/);
});
test('reroot errors are atomic when reorientation exceeds the supported depth',()=>{
 const chain=(label,d)=>d?'('+chain(label,d-1)+'):1':`${label}:1`,tree=parseNewick(`(${chain('A',260)},${chain('B',260)});`),before=JSON.stringify(tree);assert.throws(()=>rerootTree(tree,find(tree,'A').id),/500/);assert.equal(JSON.stringify(tree),before);
});

test('repeated rooting on the same tip does not halve its branch again or accumulate roots',()=>{
 const tree=fixture(),id=find(tree,'A').id;let current=tree;
 for(let i=0;i<15;i++){const r=rerootTree(current,id);current=r.tree;assert.equal(current.children[0].id,id);assert.equal(current.children[0].length,.5);assert.equal(current.children[1].length,.5);assert.equal(indexTree(current).nodes.size,indexTree(tree).nodes.size+1);checkDistances(tree,current);}
});
test('obsolete two-way root is removed and its lengths are summed without an extra bend',()=>{
 const tree=parseNewick('((A:1,B:2)91:3,(C:4,D:5):7);'),oldRoot=tree.id,r=rerootTree(tree,find(tree,'A').id);
 assert.ok(!indexTree(r.tree).nodes.has(oldRoot));assert.ok([...indexTree(r.tree).nodes.values()].every(n=>n.children.length!==1));checkDistances(tree,r.tree);assert.deepEqual(splits(r.tree),splits(tree));
});
test('different support annotations on a pre-existing binary root are never silently chosen between',()=>{
 const tree=parseNewick('((A:1,B:2)91:3,(C:4,D:5)82:7);'),r=rerootTree(tree,find(tree,'A').id);assert.ok(indexTree(r.tree).nodes.has(tree.id));assert.deepEqual(splits(r.tree),splits(tree));checkDistances(tree,r.tree);
});
test('former parent direction follows the unchanged child branches after reversal',()=>{
 const tree=fixture(),r=rerootTree(tree,find(tree,'A').id),visible=layoutTree(r.tree,r.styles,DEFAULTS);assert.deepEqual(visible.terminals.map(n=>n.node.name),['A','B','C','D','G','E','F']);
});
test('ladderization changes only sibling order, with stable ties',()=>{
 const tree=parseNewick('(((D:1,E:2):3,C:4):5,(A:6,B:7):8,F:9);'),sorted=ladderizeTree(tree);assert.deepEqual(layoutTree(sorted,{},DEFAULTS).terminals.map(n=>n.node.name),['F','A','B','C','D','E']);assert.deepEqual(tips(sorted),tips(tree));checkDistances(tree,sorted);assert.deepEqual(splits(sorted),splits(tree));assert.notEqual(toNewick(sorted),toNewick(tree));
});
// Optional local research fixture; never bundled with the repository.
const referencePath=process.env.CLADE_REFERENCE_TREE;
test('actual COI1293 FBTHE011-17 matches the iTOL root length and adjacent clade sequence',{skip:!referencePath},()=>{
 const tree=parseNewick(fs.readFileSync(referencePath,'utf8')),leaf=find(tree,'FBTHE011-17'),r=rerootTree(tree,leaf.id),counts=indexTree(r.tree).counts;
 assert.equal(r.tree.children.length,2);assert.equal(r.tree.children[0].name,'FBTHE011-17');assert.equal(r.tree.children[0].length,0.0949799735);assert.equal(r.tree.children[1].length,0.0949799735);assert.equal(counts.get(r.tree.children[1].id),25);checkDistances(tree,r.tree);assert.deepEqual(splits(r.tree),splits(tree));
 let node=r.tree.children[1];for(const size of [4,4,2,1,7]){assert.equal(counts.get(node.children[0].id),size);node=node.children[1];}
 const order=layoutTree(r.tree,r.styles,DEFAULTS).terminals.map(n=>n.node.name);assert.equal(order[0],'FBTHE011-17');assert.deepEqual(new Set(order.slice(1,5)),new Set(['FBTHE068-17','TIGMT41966-25','TIGMT41967-25','JN018125.1']));
});
test('real dataset repeated rerooting retains the same FBTHE branch length and node count',{skip:!referencePath},()=>{
 const tree=parseNewick(fs.readFileSync(referencePath,'utf8'));let current=tree;
 for(const name of ['FBTHE011-17','OM103379.1','FBTHE011-17','FBTHE007-17','FBTHE011-17']){const r=rerootTree(current,find(current,name).id);current=r.tree;assert.equal(indexTree(current).nodes.size,indexTree(tree).nodes.size+1);checkDistances(tree,current);assert.deepEqual(splits(current),splits(tree));if(name==='FBTHE011-17')assert.ok(Math.abs(current.children[0].length-0.0949799735)<1e-12);}
});
