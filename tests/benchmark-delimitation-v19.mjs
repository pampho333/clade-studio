// Synthetic benchmark only: 10,000 tips, five method columns, no research data.
import {performance} from 'node:perf_hooks';
import {parseNewick,DEFAULTS,layoutTree,matchDelimitation,delimitationRuns} from '../src/core.js';
const count=10000, columns=5;
let parts=Array.from({length:count},(_,i)=>'Synthetic_'+String(i+1)+':0.1');
while(parts.length>1){const result=[];for(let i=0;i<parts.length;i+=2)
  result.push(i+1<parts.length?'('+parts[i]+','+parts[i+1]+'):0.1':parts[i]);parts=result;}
const t0=performance.now();
const tree=parseNewick(parts[0]+';'),l=layoutTree(tree,{},DEFAULTS);
const setup=performance.now()-t0;
const methods=Array.from({length:columns},(_,j)=>{
 const assignments={};for(let i=0;i<count;i++)assignments['Synthetic_'+(i+1)]='Group_'+Math.floor((i+j*7)/40);
 return {name:'Method '+(j+1),assignments};
});
const started=performance.now();
const matched=matchDelimitation(tree,{methods});
let segments=0;
for(const m of matched.methods)segments+=delimitationRuns(tree,l,m).runs.length;
const elapsed=performance.now()-started;
const result={tips:count,methods:columns,segments,layoutMs:Number(setup.toFixed(2)),
  columnCalculationMs:Number(elapsed.toFixed(2)),totalMs:Number((setup+elapsed).toFixed(2)),
  platform:process.platform,node:process.version};
console.log('DELIMITATION_BENCHMARK '+JSON.stringify(result));
if(matched.leaves.length!==count||matched.methods.length!==columns)process.exitCode=1;
