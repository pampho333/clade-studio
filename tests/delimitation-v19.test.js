import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {
  DEFAULTS,parseNewick,layoutTree,validateProject,toNewick,parseDelimitationTable,
  normalizeDelimitation,normalizeTaxon,matchDelimitation,delimitationRuns,
  delimitationSummary,delimitationAgreement,consensusAssignments,rerootTree
} from '../src/core.js';

const fixture=name=>readFileSync(new URL('./fixtures/'+name,import.meta.url),'utf8');
const tree=()=>parseNewick('((A1:1,A2:1):1,(B1:1,B2:1):1);');
const resolved=(t,assignments)=>matchDelimitation(t,{methods:[{name:'ASAP',assignments}]});
const layout=(t,styles={})=>layoutTree(t,styles,{...DEFAULTS});

test('wide CSV imports every method column',()=>{
 const result=parseDelimitationTable(fixture('delim-wide.csv'),'auto','d.csv');
 assert.equal(result.length,4);assert.deepEqual(result.map(x=>x.name),['ASAP','ABGD','bPTP','GMYC']);
 assert.equal(result[0].assignments.A2,'A');
});
test('long TSV imports all named methods',()=>{
 const result=parseDelimitationTable(fixture('delim-long.tsv'),'long','d.tsv');
 assert.equal(result.length,2);assert.equal(result[1].assignments.B1,'Y');
});
for(const [file,format,method] of [
 ['asap.Partition_1.csv','auto','ASAP'],
 ['abgd.groupe1.txt','auto','ABGD'],
 ['ptp.PTPhSupportPartition.txt','auto','bPTP highest support'],
 ['mptp.webserver.txt','mptp','mPTP'],
 ['gmyc.csv','auto','GMYC'],
 ['bold.csv','auto','BIN']
]){
 test('verified example parser: '+method,()=>{
  const parsed=parseDelimitationTable(fixture(file),format,file);
  assert.equal(parsed.length,1);
  assert.equal(parsed[0].name,method);
  assert.equal(parsed[0].assignments.A1,parsed[0].assignments.A2);
  assert.notEqual(parsed[0].assignments.A1,parsed[0].assignments.B1);
 });
}
test('exact matches take priority; underscore, space and quote normalization follows',()=>{
 const t=parseNewick("(A_one:1,'B two':1,Unmatched:1);");
 const m=matchDelimitation(t,{methods:[{name:'M',assignments:{A_one:'1',B_two:'2',Lost:'3'}}]});
 assert.equal(m.exact,1);assert.equal(m.normalized,1);
 assert.deepEqual(m.unmatched,['Lost']);assert.deepEqual(m.missing,['Unmatched']);
 assert.equal(normalizeTaxon("'B_two'"),'B two');
});
test('manual mapping uses stable tip ID, including equal labels',()=>{
 const t=parseNewick("(D:1,D:1,C:1);"),id=t.children[1].id;
 const m=matchDelimitation(t,{methods:[{name:'M',assignments:{Outside:'1'}}],manualMap:{Outside:id}});
 assert.equal(m.manual,1);assert.equal(m.methods[0].byId.get(id),'1');
});
test('continuous groups join; non-continuous groups are split',()=>{
 const t=tree(),l=layout(t);
 const a=resolved(t,{A1:'X',A2:'X',B1:'Y',B2:'Y'});
 assert.equal(delimitationRuns(t,l,a.methods[0]).runs.length,2);
 const b=resolved(t,{A1:'X',A2:'Y',B1:'X',B2:'Y'});
 const d=delimitationRuns(t,l,b.methods[0]);
 assert.equal(d.runs.length,4);assert.ok(d.runs.filter(x=>x.group==='X').every(x=>x.split));
 assert.ok(d.nonMonophyletic.has('X'));
});
test('singleton has exactly one display tip',()=>{
 const t=tree(),m=resolved(t,{A1:'X',A2:'Y',B1:'Y',B2:'Y'});
 assert.equal(delimitationRuns(t,layout(t),m.methods[0]).runs.find(x=>x.group==='X').tipCount,1);
});
test('collapsed clade uniform vs mixed',()=>{
 const t=tree(),styles={[t.children[0].id]:{collapsed:true,height:48}},l=layout(t,styles);
 const same=resolved(t,{A1:'X',A2:'X',B1:'Y',B2:'Y'});
 const mixed=resolved(t,{A1:'X',A2:'Z',B1:'Y',B2:'Y'});
 assert.ok(delimitationRuns(t,l,same.methods[0]).runs.some(x=>x.group==='X'&&x.collapsed));
 assert.ok(delimitationRuns(t,l,mixed.methods[0]).runs.some(x=>x.mixed));
});
test('reordering and rerooting trigger recalculation without editing assignments',()=>{
 const t=tree(),m=resolved(t,{A1:'X',A2:'X',B1:'Y',B2:'Y'});
 const before=delimitationRuns(t,layout(t),m.methods[0]).runs.map(x=>x.group).join(',');
 t.children[0].children.reverse();t.children.reverse();
 const after=delimitationRuns(t,layout(t),m.methods[0]).runs.map(x=>x.group).join(',');
 assert.notEqual(before,after);
 const rooted=rerootTree(t,t.children[0].children[0].id).tree;
 const newM=resolved(rooted,{A1:'X',A2:'X',B1:'Y',B2:'Y'});
 assert.equal(newM.methods[0].byId.size,4);
 assert.ok(delimitationRuns(rooted,layout(rooted),newM.methods[0]).runs.length>=2);
});
test('pairwise Jaccard and ARI agree with hand calculations',()=>{
 const t=tree();
 const m=matchDelimitation(t,{methods:[
  {name:'A',assignments:{A1:'1',A2:'1',B1:'2',B2:'2'}},
  {name:'B',assignments:{A1:'1',A2:'2',B1:'1',B2:'2'}},
  {name:'C',assignments:{A1:'x',A2:'x',B1:'y',B2:'y'}}
 ]});
 const cross=delimitationAgreement(m.methods[0],m.methods[1]);
 assert.equal(cross.n,4);assert.equal(cross.jaccard,0);assert.ok(Math.abs(cross.ari+0.5)<1e-12);
 const same=delimitationAgreement(m.methods[0],m.methods[2]);
 assert.equal(same.jaccard,1);assert.equal(same.ari,1);
 const c=consensusAssignments(m);assert.equal(c.size,0);
});
test('consensus requires exact constituent sets, not equal group labels',()=>{
 const t=tree(),m=matchDelimitation(t,{methods:[
  {name:'M1',assignments:{A1:'X',A2:'X',B1:'Y',B2:'Y'}},
  {name:'M2',assignments:{A1:'1',A2:'1',B1:'2',B2:'2'}}
 ]});
 const c=consensusAssignments(m);assert.equal(c.size,4);
 const sum=delimitationSummary(t,layout(t),m);
 assert.equal(sum.rows[0].groups,2);assert.equal(sum.rows[0].singletons,0);
});
test('version 2 save / reload is lossless and 1.8 version 1 still loads',()=>{
 const t=tree(),base={format:'clade-studio',version:1,tree:t,styles:{},groups:[],options:{},title:'Synthetic',sample:true};
 const legacy=validateProject(base);assert.equal(legacy.delimitation.methods.length,0);
 const d=normalizeDelimitation({methods:[{name:'ASAP',assignments:{A1:'sp1',A2:'sp1'}}],
  manualMap:{unmatched:t.children[0].id},settings:{colorMode:'group',consensus:true}});
 const loaded=validateProject(JSON.parse(JSON.stringify({...base,version:2,delimitation:d})));
 assert.deepEqual(loaded.delimitation,d);assert.equal(toNewick(loaded.tree),toNewick(t));
});


test('bPTP ML web-server partition: 14 synthetic tips in exactly five groups',()=>{
 const file='bptp_output.PTPMLPartition.txt';
 const [partition]=parseDelimitationTable(fixture(file),'auto',file);
 assert.equal(partition.name,'bPTP ML');
 assert.equal(partition.sourceFormat,'bptp-ml');
 assert.equal(Object.keys(partition.assignments).length,14);
 assert.deepEqual(
  [...Object.values(partition.assignments).reduce((map,group)=>map.set(group,(map.get(group)||0)+1),new Map()).values()],
  [6,1,2,4,1]
 );
 assert.equal(partition.assignments.taxon_10,partition.assignments.taxon_13);
});
test('bPTP highest-support output is a separately named seven-group partition',()=>{
 const file='bptp_output.PTPhSupportPartition.txt';
 const [partition]=parseDelimitationTable(fixture(file),'auto',file);
 assert.equal(partition.name,'bPTP highest support');
 assert.equal(partition.sourceFormat,'bptp-high');
 assert.equal(Object.keys(partition.assignments).length,14);
 assert.equal(new Set(Object.values(partition.assignments)).size,7);
 assert.notEqual(partition.assignments.taxon_10,partition.assignments.taxon_13);
});
test('PTP overlapping-candidate summary is rejected even if forced to a table or bPTP',()=>{
 const file='bptp_output.PTPPartitonSummary.txt';
 for(const format of ['auto','wide','bptp']){
  assert.throws(()=>parseDelimitationTable(fixture(file),format,file),/PTP|summary/i);
 }
});
test('GMYC web-only summary cannot be inferred as membership data',()=>{
 const page='#Result of GMYC species delimitation\nmethod:\tsingle\nnumber of ML clusters:\t4\nthreshold time:\t-0.0128565';
 for(const format of ['auto','gmyc','wide'])
  assert.throws(()=>parseDelimitationTable(page,format,'result_gmyc.txt'),/GMYC|summary/i);
});
test('PTP accession version underscore matches period only for verified PTP imports',()=>{
 const t=parseNewick("('OM089662.1':1,'OM089663.1':1,Other:1);");
 const [ptp]=parseDelimitationTable('# Max likilhood partition\nSpecies 1 (support = 0.987)\n     OM089662_1,OM089663_1\n','auto','run.PTPMLPartition.txt');
 const matched=matchDelimitation(t,{methods:[ptp]});
 assert.equal(matched.normalized,2);assert.equal(matched.unmatched.length,0);
 assert.equal(matched.methods[0].byId.size,2);
 const strict=matchDelimitation(t,{methods:[{name:'manual table',assignments:{OM089662_1:'G1'}}]});
 assert.deepEqual(strict.unmatched,['OM089662_1']);
 assert.equal(strict.methods[0].byId.size,0);
});
test('PTP accession normalization never silently chooses between duplicate tree names',()=>{
 const t=parseNewick("('OM089662.1':1,'OM089662.1':1);");
 const m=matchDelimitation(t,{methods:[{name:'bPTP ML',sourceFormat:'bptp-ml',assignments:{OM089662_1:'G1'}}]});
 assert.deepEqual(m.unmatched,['OM089662_1']);
 assert.equal(m.methods[0].byId.size,0);
});
test('PTP partition source type survives project schema 2 round-trip',()=>{
 const t=parseNewick('(A1:1,A2:1);'),parsed=parseDelimitationTable(
 '# Max likilhood partition\nSpecies 1 (support = 1.000)\n     A1,A2\n',
 'auto','result.PTPMLPartition.txt');
 const validated=validateProject({format:'clade-studio',version:2,tree:t,styles:{},groups:[],
   delimitation:{methods:parsed},options:DEFAULTS});
 assert.equal(validated.delimitation.methods[0].sourceFormat,'bptp-ml');
 assert.deepEqual(validateProject(JSON.parse(JSON.stringify({
  format:'clade-studio',version:2,...validated
 }))).delimitation.methods[0].assignments,parsed[0].assignments);
});
test('PTP malformed output with an empty or duplicated species group is rejected',()=>{
 const noTips='# Max likilhood partition\nSpecies 1 (support = 0.900)\n\nSpecies 2 (support = 0.500)\n     taxon_01\n';
 const duplicate='# Max likilhood partition\nSpecies 1 (support = 0.900)\n     taxon_01\nSpecies 2 (support = 0.500)\n     taxon_01\n';
 assert.throws(()=>parseDelimitationTable(noTips,'auto','a.PTPMLPartition.txt'),/PTP|group/i);
 assert.throws(()=>parseDelimitationTable(duplicate,'auto','a.PTPMLPartition.txt'),/PTP|Duplicate/i);
});


test('PTP-specific accession aliases are not applied to a shared generic-table name',()=>{
 const t=parseNewick("('OM089662.1':1,B:1);");
 const m=matchDelimitation(t,{methods:[
  {name:'bPTP ML',sourceFormat:'bptp-ml',assignments:{OM089662_1:'Species 1'}},
  {name:'ASAP',assignments:{OM089662_1:'Species 1'}}
 ]});
 assert.deepEqual(m.unmatched,['OM089662_1']);
 assert.equal(m.methods[0].byId.size,0);
 assert.equal(m.methods[1].byId.size,0);
});
