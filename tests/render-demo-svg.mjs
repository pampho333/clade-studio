import {readFileSync,writeFileSync} from 'node:fs';
import {parseNewick,layoutTree,DEFAULTS,matchDelimitation,parseDelimitationTable,delimitationRuns} from '../src/core.js';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const xml=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const tree=parseNewick(read('../examples/demo-species.nwk'));
const layout=layoutTree(tree,{}, {...DEFAULTS,treeWidth:575,rowGap:23,fontSize:12,scale:false,title:false,alignLabels:true});
const methods=parseDelimitationTable(read('../examples/demo-delimitation.csv'),'wide');
const match=matchDelimitation(tree,{methods});
if(layout.terminals.length!==18||match.methods.length!==4)throw new Error('Synthetic fixture changed');
const labels=layout.terminals.map(t=>t.node.name.replace(/_/g,' '));
const labelLeft=Math.max(...layout.terminals.map(x=>x.x))+18;
const barStart=labelLeft+Math.max(...labels.map(x=>x.length))*7+44;
const step=92,width=barStart+match.methods.length*step+75,height=layout.height+145;
const bits=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="-70 -88 '+Math.ceil(width+70)+' '+Math.ceil(height+88)+'" width="'+Math.ceil(width+70)+'" height="'+Math.ceil(height+88)+'">',
 '<title>Clade Studio v1.9: synthetic species delimitation comparison</title>',
 '<desc>Illustrative synthetic tree with ASAP, ABGD, bPTP, and GMYC assignments. Not a scientific result.</desc>',
 '<rect x="-70" y="-88" width="'+(width+70)+'" height="'+(height+88)+'" fill="#fff"/>',
 '<defs><pattern id="mixed" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 5L5 0" stroke="#666" stroke-width="1"/></pattern></defs>',
 '<g stroke="#262626" stroke-width="1.3" fill="none">'];
for(const n of layout.all)if(n.parent)bits.push('<path d="M'+n.parent.x.toFixed(2)+','+n.parent.y.toFixed(2)+'V'+n.y.toFixed(2)+'H'+n.x.toFixed(2)+'"/>');
bits.push('</g>','<g font-family="Arial, sans-serif" fill="#111">');
for(let i=0;i<layout.terminals.length;i++){
 const item=layout.terminals[i];bits.push('<path d="M'+item.x.toFixed(2)+','+item.y.toFixed(2)+'H'+(labelLeft-6)+'" stroke="#bbb" stroke-width=".6" stroke-dasharray="2,3"/>');
 bits.push('<text x="'+labelLeft+'" y="'+(item.y+4).toFixed(2)+'" font-size="12">'+xml(labels[i])+'</text>');
}
bits.push('</g>');let segments=0;
for(let col=0;col<match.methods.length;col++){
 const method=match.methods[col],groups=delimitationRuns(tree,layout,method),x=barStart+col*step;
 bits.push('<text x="'+(x+7)+'" y="-22" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="14">'+xml(method.name)+'</text>');
 const names=[...groups.groups.keys()],byGroup=new Map();
 for(const run of groups.runs){
  const color=run.mixed?'url(#mixed)':(['#151515','#969696'][names.indexOf(run.group)%2]);
  const h=Math.max(3,run.tipCount===1?7:run.bottom-run.top),y=(run.top+run.bottom-h)/2;
  bits.push('<rect x="'+x+'" y="'+y.toFixed(2)+'" width="14" height="'+h.toFixed(2)+'" fill="'+color+'"/>');segments++;
  if(!run.mixed){if(!byGroup.has(run.group))byGroup.set(run.group,[]);byGroup.get(run.group).push(run);}
 }
 for(const [name,runs] of byGroup){
  if(runs.length>1)for(let i=1;i<runs.length;i++)bits.push('<line x1="'+(x+7)+'" x2="'+(x+7)+'" y1="'+runs[i-1].bottom.toFixed(2)+'" y2="'+runs[i].top.toFixed(2)+'" stroke="#777" stroke-width=".8" stroke-dasharray="3,3"/>');
  if(groups.nonMonophyletic.has(name)||runs.length>1)for(const run of runs)bits.push('<text x="'+(x-10)+'" y="'+(run.top+8).toFixed(2)+'" font-family="Arial" font-size="12" fill="#a53a2b">!</text>');
 }
}
bits.push('<text x="-5" y="-57" font-family="Arial" font-size="17" fill="#161616">Species delimitation comparison — synthetic example</text>',
 '<text x="0" y="'+(layout.height+55)+'" font-family="Arial" font-size="12" fill="#666">Black / grey: groups · Dashed: discontiguous group · !: non-monophyletic</text>',
 '<text x="0" y="'+(layout.height+77)+'" font-family="Arial" font-size="11" fill="#888">Illustrative data only; no real taxonomic claims.</text>', '</svg>');
const svg=bits.join('\n')+'\n';
if(!svg.includes('<svg')||!svg.includes('bPTP'))throw new Error('SVG content incomplete');
writeFileSync(new URL('../examples/demo-species.svg',import.meta.url),svg,'utf8');
console.log('SYNTHETIC_SVG_EXPORT '+JSON.stringify({path:'examples/demo-species.svg',tips:layout.terminals.length,methods:match.methods.length,segments,bytes:Buffer.byteLength(svg)}));
