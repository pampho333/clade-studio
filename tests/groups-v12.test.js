import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULTS,parseNewick,indexTree,layoutTree,normalizeGroups,resolveGroups,validateProject,toNewick} from '../src/core.js';
const fixture=()=>parseNewick('((A:1,B:1)99:1,(C:1,D:1)98:1,E:2);');
const byName=(tree,name)=>[...indexTree(tree).nodes.values()].find(n=>n.name===name).id;
function solve(tree,raw,styles={}){const layout=layoutTree(tree,styles,DEFAULTS),groups=normalizeGroups(raw,new Set(layout.index.nodes.keys()));return{groups,layout,...resolveGroups(tree,groups,layout,DEFAULTS)};}
test('clade annotation covers its descendants and does not alter source data',()=>{
 const tree=fixture(),before=toNewick(tree),id=tree.children[0].id;
 const r=solve(tree,[{id:'gA',name:'A clade',nodeIds:[id],color:'#1956a3',colorBranches:true,colorLabels:true}]);
 assert.equal(r.groups[0].leaves.size,2);assert.equal(r.groups[0].runs.length,1);assert.equal(r.groups[0].runs[0].first,0);assert.equal(r.groups[0].runs[0].last,1);
 assert.ok(r.branchColors.has(id));assert.ok(!r.branchColors.has(tree.id));assert.ok(!r.labelColors.has(byName(tree,'C')));assert.equal(toNewick(tree),before);
});
test('noncontiguous selected taxa form separate bands, never an inferred common ancestor',()=>{
 const tree=fixture(),r=solve(tree,[{id:'gAC',nodeIds:[byName(tree,'A'),byName(tree,'C')]}]);
 assert.deepEqual(r.groups[0].runs.map(r=>[r.first,r.last]),[[0,0],[2,2]]);assert.ok(!r.groups[0].covered.has(tree.children[0].id));assert.equal(r.groups[0].leaves.size,2);
});
test('complete collapsed clade keeps a band; a partial target is withheld and reported',()=>{
 const tree=fixture(),id=tree.children[0].id,st={[id]:{collapsed:true,height:90}};
 const full=solve(tree,[{id:'gFull',nodeIds:[id]}],st);assert.equal(full.groups[0].runs.length,1);assert.ok(full.groups[0].runs[0].bottom-full.groups[0].runs[0].top>=90);assert.equal(full.partialCount,0);
 const part=solve(tree,[{id:'gPartial',nodeIds:[byName(tree,'A')],colorBranches:true,colorLabels:true}],st);assert.equal(part.groups[0].runs.length,0);assert.equal(part.partialCount,1);assert.ok(!part.branchColors.has(id));assert.ok(!part.labelColors.has(id));
});
test('nested groups use separate lanes while adjacent groups share one',()=>{
 const tree=fixture(),r=solve(tree,[{id:'gAB',nodeIds:[tree.children[0].id]},{id:'gCD',nodeIds:[tree.children[1].id]},{id:'gAll',nodeIds:[tree.id]}]);
 assert.equal(r.groups[0].lane,0);assert.equal(r.groups[1].lane,0);assert.equal(r.groups[2].lane,1);
});
test('overlapping groups have deterministic colors; visibility disables all annotation effects',()=>{
 const tree=fixture(),id=byName(tree,'A');let r=solve(tree,[{id:'gAll',nodeIds:[tree.id],color:'#1956a3',colorLabels:true},{id:'gA',nodeIds:[id],color:'#a53924',colorLabels:true}]);assert.equal(r.labelColors.get(id),'#a53924');
 r=solve(tree,[{id:'gA',nodeIds:[id],visible:false,colorBranches:true,colorLabels:true}]);assert.equal(r.groups.length,0);assert.equal(r.branchColors.size,0);assert.equal(r.labelColors.size,0);
});
test('group project round trip preserves targets, appearance and unchanged bootstrap values',()=>{
 const tree=fixture(),ids=new Set(indexTree(tree).nodes.keys()),groups=normalizeGroups([{id:'gA',name:'Chilobrachys sp. A\nTaxon B',nodeIds:[tree.children[0].id],color:'#1956a3',background:'gradient',backgroundScope:'full',opacity:.3,barWidth:9,labelSize:18,colorLabels:true,colorBranches:true}],ids);
 const p=validateProject(JSON.parse(JSON.stringify({format:'clade-studio',version:1,tree,styles:{},groups,options:DEFAULTS})));
 assert.deepEqual(p.groups,groups);assert.equal(p.tree.children[0].name,'99');assert.equal(p.tree.children[1].name,'98');assert.equal(toNewick(p.tree),toNewick(tree));
 assert.deepEqual(validateProject({format:'clade-studio',version:1,tree,styles:{}}).groups,[]);
});
test('untrusted group fields are sanitized; missing IDs and duplicate targets are removed',()=>{
 const tree=fixture(),id=tree.children[0].id,ids=new Set(indexTree(tree).nodes.keys()),r=normalizeGroups([{id:'../bad',nodeIds:[id,id,'n999'],color:'url(https://example.test)',opacity:4,barWidth:-1,labelSize:999,background:'bad'}, {id:'group-0',nodeIds:[id]}, {id:'gMissing',nodeIds:['n999']}],ids);
 assert.equal(r.length,2);assert.deepEqual(r[0].nodeIds,[id]);assert.equal(r[0].color,'#1956a3');assert.equal(r[0].opacity,1);assert.equal(r[0].barWidth,2);assert.equal(r[0].labelSize,30);assert.equal(r[0].background,'none');assert.notEqual(r[0].id,r[1].id);
});
test('rotating descendants recomputes range positions while keeping taxon identity',()=>{
 const tree=fixture(),group={id:'gA',nodeIds:[byName(tree,'A')]};assert.equal(solve(tree,[group]).groups[0].runs[0].first,0);tree.children[0].children.reverse();assert.equal(solve(tree,[group]).groups[0].runs[0].first,1);
});
