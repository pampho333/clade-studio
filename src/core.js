// Data and display state are separate: collapsing never changes the source tree.
export const DEFAULTS = Object.freeze({layout:'rectangular', metric:'length', rowGap:22, treeWidth:620, fontSize:14, branchWidth:1.4, support:true, lengths:false, italic:true, alignLabels:false, underscores:true, scale:true, font:'sans', customFont:'', title:true});
export const FONT_FAMILIES = Object.freeze({sans:'Arial, sans-serif',serif:'"Times New Roman", serif',helvetica:'Helvetica, Arial, sans-serif',georgia:'Georgia, serif',verdana:'Verdana, sans-serif',calibri:'Calibri, Arial, sans-serif',cambria:'Cambria, Georgia, serif',palatino:'"Palatino Linotype", Palatino, serif',mono:'"Courier New", monospace',consolas:'Consolas, monospace',malgun:'"Malgun Gothic", "맑은 고딕", sans-serif',batang:'Batang, "바탕", serif'});
export function cleanFontName(value){return typeof value==='string'?value.replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,120):'';}
export function fontFamilyFor(options={}){const custom=cleanFontName(options.customFont);if(options.font==='custom'&&custom)return `${JSON.stringify(custom)}, Arial, sans-serif`;return Object.hasOwn(FONT_FAMILIES,options.font)?FONT_FAMILIES[options.font]:FONT_FAMILIES.sans;}
export const SAMPLE = "((((Chilobrachys_sp._A1:0.027,Chilobrachys_sp._A2:0.023)99/100:0.034,(Chilobrachys_sp._A3:0.033,Chilobrachys_sp._A4:0.029)97/99:0.028)100/100:0.049,((Chilobrachys_sp._B1:0.029,Chilobrachys_sp._B2:0.025)94/98:0.036,(Chilobrachys_sp._B3:0.024,Chilobrachys_sp._B4:0.031)98/100:0.029)98/99:0.051)100/100:0.04,(((Chilobrachys_sp._C1:0.03,Chilobrachys_sp._C2:0.022)99/100:0.035,(Chilobrachys_sp._C3:0.02,Chilobrachys_sp._C4:0.031)95/99:0.026)97/99:0.047,((Chilobrachys_sp._D1:0.027,Chilobrachys_sp._D2:0.036)91/96:0.041,(Chilobrachys_sp._D3:0.029,Chilobrachys_sp._D4:0.028)96/100:0.03)99/100:0.04)100/100:0.046,(Outgroup_A:0.075,Outgroup_B:0.089)100/100:0.12);";
export const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)));
const error=(message,pos)=>new Error(`${message}${pos===undefined?'':` (문자 ${pos+1})`}`);
export function parseNewick(input){
  const text=String(input).replace(/^\uFEFF/,'').trim(); let i=0,serial=0;
  if(!text)throw error('트리 텍스트가 비어 있습니다.');
  function ws(){while(/\s/.test(text[i]||'')&&i<text.length)i++;}
  function comment(){let start=i++,depth=1;while(i<text.length&&depth){if(text[i]==='[')depth++;if(text[i]===']')depth--;i++;}if(depth)throw error('닫히지 않은 대괄호 주석입니다.',start);return text.slice(start,i);}
  function comments(){const out=[];ws();while(text[i]==='['){out.push(comment());ws();}return out;}
  function name(){ws();if(text[i]==="'"){i++;let s='',closed=false;while(i<text.length){if(text[i]==="'"){if(text[i+1]==="'"){s+="'";i+=2;}else{i++;closed=true;break;}}else{s+=text[i++];}}if(!closed)throw error('닫히지 않은 따옴표입니다.',i);return s;}
    let start=i;while(i<text.length&&!"(),:;[]".includes(text[i]))i++;return text.slice(start,i).trim();}
  function node(depth){if(depth>500)throw error('500단계보다 깊은 트리는 지원하지 않습니다.');if(++serial>10000)throw error('노드 10,000개까지 불러올 수 있습니다.');const n={id:`n${serial}`,name:'',length:null,children:[],comments:comments()};
    if(text[i]==='('){i++;do{ws();if(text[i]===')'||text[i]===','||i>=text.length)throw error('빈 하위 노드입니다.',i);n.children.push(node(depth+1));ws();if(text[i]===','){i++;continue;}break;}while(true);if(text[i]!==')')throw error('닫는 괄호가 필요합니다.',i);i++;}
    n.comments.push(...comments());n.name=name();n.comments.push(...comments());
    if(text[i]===':'){i++;n.comments.push(...comments());ws();let start=i;while(i<text.length&&!",);[".includes(text[i]))i++;let raw=text.slice(start,i).trim();if(!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(raw)||!Number.isFinite(Number(raw)))throw error('가지 길이가 올바른 숫자가 아닙니다.',start);n.length=Number(raw);n.comments.push(...comments());}
    if(!n.children.length&&!n.name)throw error('말단 노드의 이름이 비어 있습니다.',i);for(const c of n.comments){const m=c.match(/^\[&support=([^\]]+)\]$/i);if(m&&isSupportValue(m[1]))n.branchSupport=m[1];}return n;}
  const tree=node(0);if(tree.comments.some(c=>/^\[&R\]$/i.test(c)))tree.rooted=true;ws();if(text[i]!==';')throw error('Newick 트리는 세미콜론(;)으로 끝나야 합니다.',i);i++;comments();ws();if(i<text.length)throw error('세미콜론 뒤에 해석할 수 없는 텍스트가 있습니다.',i);return tree;
}
export function splitStatements(text){let out=[],start=0,quoted=false,depth=0;for(let i=0;i<text.length;i++){const c=text[i];if(c==="'"&&!depth){if(quoted&&text[i+1]==="'"){i++;continue;}quoted=!quoted;}if(!quoted){if(c==='[')depth++;if(c===']')depth--;if(c===';'&&!depth){out.push(text.slice(start,i+1).trim());start=i+1;}}}if(text.slice(start).trim())out.push(text.slice(start).trim());return out;}
function splitTranslation(text){let parts=[],start=0,q=false;for(let i=0;i<text.length;i++){if(text[i]==="'"){if(q&&text[i+1]==="'"){i++;continue;}q=!q;}if(text[i]===','&&!q){parts.push(text.slice(start,i));start=i+1;}}parts.push(text.slice(start));return parts;}
export function parseTreeFile(text){
  text=String(text).replace(/^\uFEFF/,'').trim();if(!text)throw error('파일이 비어 있습니다.');
  if(/^#nexus\b/i.test(text)){
    const block=text.match(/begin\s+trees\s*;([\s\S]*?)\bend(?:block)?\s*;/i);if(!block)throw error('NEXUS 파일에 TREES 블록이 없습니다.');let translations=new Map(),out=[];
    for(let stmt of splitStatements(block[1])){stmt=stmt.replace(/^\s*(?:\[[\s\S]*?\]\s*)+/,'');if(/^translate\s/i.test(stmt)){const body=stmt.replace(/^translate\s+/i,'').replace(/;$/,'');for(const p of splitTranslation(body)){const match=p.trim().match(/^(\S+)\s+([\s\S]+)$/);if(!match)throw error('NEXUS TRANSLATE 항목을 해석할 수 없습니다.');let label=match[2].trim();if(label.startsWith("'")){if(!label.endsWith("'"))throw error('TRANSLATE 라벨의 따옴표가 닫히지 않았습니다.');label=label.slice(1,-1).replace(/''/g,"'");}translations.set(match[1],label);}}
      else if(/^(?:tree|utree)\s/i.test(stmt)){const m=stmt.match(/^(?:tree|utree)\s+\*?\s*([^=]+)=([\s\S]+)$/i);if(!m)throw error('NEXUS TREE 문을 해석할 수 없습니다.');out.push({name:m[1].trim().replace(/^'|'$/g,''),tree:parseNewick(m[2])});}}
    if(!out.length)throw error('NEXUS 파일에 트리가 없습니다.');for(const item of out)walk(item.tree,n=>{if(!n.children.length&&translations.has(n.name))n.name=translations.get(n.name);});return out;
  }
  return splitStatements(text).map((stmt,i)=>({name:`Tree ${i+1}`,tree:parseNewick(stmt)}));
}
export function walk(node,fn,parent=null,depth=0){fn(node,parent,depth);for(const c of node.children)walk(c,fn,node,depth+1);}
export function indexTree(tree){const nodes=new Map(),parents=new Map(),counts=new Map(),depths=new Map();function rec(n,p,d){nodes.set(n.id,n);if(p)parents.set(n.id,p.id);depths.set(n.id,d);let count=n.children.length?n.children.reduce((sum,c)=>sum+rec(c,n,d+1),0):1;counts.set(n.id,count);return count;}rec(tree,null,0);return{nodes,parents,counts,depths};}
const quote=s=>/[\s(),:;\[\]']/.test(s)?`'${s.replace(/'/g,"''")}'`:s;
export function isSupportValue(value){return typeof value==='string'&&/^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?(?:\/(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)*$/.test(value);}
export function branchSupportFor(node){return Object.hasOwn(node,'branchSupport')?node.branchSupport:(node.children.length&&isSupportValue(node.name)?node.name:null);}
export function supportText(node){if(!node.children.length)return '';return branchSupportFor(node)??(isSupportValue(node.name)?'':node.name);}
export function toNewick(tree){function rec(n){const explicit=Object.hasOwn(n,'branchSupport'),support=branchSupportFor(n),numeric=n.children.length&&(isSupportValue(n.name)||n.name==='');const name=explicit&&numeric?(support||''):n.name,extra=explicit&&support&&!numeric?`[&support=${support}]`:'';const comments=(n.comments||[]).filter(c=>!(explicit&&/^\[&support=/i.test(c))&&!(tree.rooted===true&&/^\[&[RU]\]$/i.test(c))).join('');return(n.children.length?`(${n.children.map(rec).join(',')})`:'')+quote(name)+extra+comments+(n.length===null?'':`:${n.length}`);}return(tree.rooted===true?'[&R] ':'')+rec(tree)+';';}

// Root on the incoming edge of the selected clade or tip; selected side stays first.
export function rerootTree(tree,targetId,styles={},groups=[]){
 const before=indexTree(tree),target=before.nodes.get(targetId);
 if(!target)throw error('루트 기준으로 사용할 노드를 선택하십시오.');
 if(targetId===tree.id)return {tree,styles,groups,changed:false,mode:'edge',expanded:0};
 if(before.counts.get(tree.id)<2)throw error('말단이 2개 이상인 트리에서 루트를 변경할 수 있습니다.');
 const copies=new Map(),adj=new Map(),originalLeaves=new Set(),nextStyles=JSON.parse(JSON.stringify(styles));
 for(const n of before.nodes.values()){copies.set(n.id,{...n,comments:[...(n.comments||[])].filter(c=>!/^\[&[RU]\]$/i.test(c)),children:[]});adj.set(n.id,[]);if(!n.children.length)originalLeaves.add(n.id);}
 function connect(a,b,length,support,owner){const edge={a,b,length,support,owner};adj.get(a).push(edge);adj.get(b).push(edge);return edge;}
 function other(edge,id){return edge.a===id?edge.b:edge.a;}
 function disconnect(edge){for(const id of [edge.a,edge.b])adj.set(id,adj.get(id).filter(e=>e!==edge));}
 walk(tree,(n,p)=>{if(p)connect(p.id,n.id,n.length,branchSupportFor(n),n.id);});
 let targetEdge=adj.get(targetId).find(e=>other(e,targetId)===before.parents.get(targetId));
 const nextGroups=groups.map(g=>{const leaves=new Set();for(const id of g.nodeIds){const n=before.nodes.get(id);if(n)walk(n,c=>{if(!c.children.length)leaves.add(c.id);});}return{...g,nodeIds:[...leaves]};});
 // Suppress obsolete two-way roots, combining their edge lengths. Distinct
 // support values or named/annotated nodes are retained rather than discarded.
 for(const id of [...copies.keys()]){
  const n=copies.get(id);if(id===targetId||originalLeaves.has(id)||adj.get(id).length!==2||!(id===tree.id||n.syntheticRoot))continue;
  if((n.name&&!isSupportValue(n.name))||n.comments.some(c=>!/^\[&support=/i.test(c))||styles[id]?.label)continue;
  const [a,b]=adj.get(id);if(a.support&&b.support&&a.support!==b.support)continue;
  const left=other(a,id),right=other(b,id),support=a.support||b.support,owner=a.support?a.owner:b.support?b.owner:a.owner||b.owner;
  disconnect(a);disconnect(b);const joined=connect(left,right,a.length===null||b.length===null?null:a.length+b.length,support,owner);
  if(targetEdge===a||targetEdge===b)targetEdge=joined;adj.delete(id);copies.delete(id);delete nextStyles[id];
 }
 // Remove ancestral dangling stems, which do not represent sampled taxa.
 const dangling=[...copies.keys()].filter(id=>id!==targetId&&!originalLeaves.has(id)&&adj.get(id).length<=1);
 while(dangling.length){const id=dangling.pop();if(!adj.has(id)||id===targetId||originalLeaves.has(id)||adj.get(id).length>1)continue;const edge=adj.get(id)[0];if(edge){const neighbor=other(edge,id);disconnect(edge);dangling.push(neighbor);}adj.delete(id);copies.delete(id);delete nextStyles[id];}
 if(!targetEdge||!adj.get(targetId).includes(targetEdge))throw error('선택한 분류군 바깥에 다른 말단이 없습니다.');
 if(copies.size>=10000)throw error('새 루트를 추가하면 노드 10,000개 제한을 초과합니다.');
 let serial=before.nodes.size+1;while(copies.has(`n${serial}`))serial++;const rootId=`n${serial}`,parent=other(targetEdge,targetId),half=targetEdge.length===null?null:targetEdge.length/2;
 copies.set(rootId,{id:rootId,name:'',length:null,comments:[],children:[],syntheticRoot:true});adj.set(rootId,[]);disconnect(targetEdge);
 connect(rootId,targetId,half,targetEdge.support,targetEdge.owner);connect(rootId,parent,half,null,null);
 let expanded=0;const changedNodes=[];
 function orient(id,parentId=null,incoming=null,depth=0){
  if(depth>500)throw error('재루팅 결과가 500단계 깊이 제한을 초과합니다.');
  const n=copies.get(id);n.length=incoming?incoming.length:tree.length;n.branchSupport=incoming?incoming.support:null;delete n.rooted;
  const old=before.nodes.get(id),oldChildren=old?.children.map(c=>c.id)||[];
  // Keep existing descendant branches before the former parent direction.
  const edges=adj.get(id).filter(e=>other(e,id)!==parentId);
  if(old)edges.sort((a,b)=>{const ia=oldChildren.indexOf(other(a,id)),ib=oldChildren.indexOf(other(b,id));return(ia<0?oldChildren.length:ia)-(ib<0?oldChildren.length:ib);});
  for(const edge of edges)n.children.push(orient(other(edge,id),id,edge,depth+1));
  const sameClade=old&&oldChildren.length===n.children.length&&n.children.every(c=>oldChildren.includes(c.id));
  if(!sameClade){changedNodes.push(id);if(nextStyles[id]?.collapsed)expanded++;nextStyles[id]={...nextStyles[id],collapsed:false};}
  if(!incoming||incoming.owner!==id){const source=incoming?.owner?styleFor(styles,incoming.owner):{};nextStyles[id]={...nextStyles[id],supportDx:source.supportDx||0,supportDy:source.supportDy||0,supportAnchor:source.supportAnchor||'end'};}
  return n;
 }
 const rooted=orient(rootId);rooted.rooted=true;rooted.children=rooted.children.map(child=>ladderizeTree(child));
 return {tree:rooted,styles:nextStyles,groups:nextGroups,changed:true,mode:target.children.length?'clade':'tip',expanded,changedNodes};
}
// Explicit display-order edit: stable sorting preserves the order of tied clades.
export function ladderizeTree(tree,descending=false){
 const counts=indexTree(tree).counts;
 function copy(n){return {...n,comments:[...(n.comments||[])],children:n.children.map(copy).sort((a,b)=>(counts.get(a.id)-counts.get(b.id))*(descending?-1:1))};}
 return copy(tree);
}
export function styleFor(styles,id){const raw=styles[id]||{};return {collapsed:false,width:100,height:48,color:'#374151',fill:'#e8ebef',label:null,shape:'triangle',labelSize:null,italic:null,italicRanges:[],supportDx:0,supportDy:0,supportAnchor:'end',...raw,widthMode:['auto','manual'].includes(raw.widthMode)?raw.widthMode:(Object.hasOwn(raw,'width')?'manual':'auto')};}
export function nodeLabel(node,styles,counts,options={}){let s=styles[node.id]?.label;if(s===null||s===undefined||s==='')s=node.children.length?(!/^\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)*$/.test(node.name)&&node.name?node.name:`Clade ${node.id.slice(1)}`):node.name;return options.underscores?s.replace(/_/g,' '):s;}
export function normalizeItalicRanges(ranges,length){const sorted=(Array.isArray(ranges)?ranges:[]).filter(r=>Array.isArray(r)&&r.length===2&&r.every(Number.isFinite)).map(([a,b])=>[Math.trunc(clamp(a,0,length)),Math.trunc(clamp(b,0,length))]).filter(([a,b])=>b>a).sort((a,b)=>a[0]-b[0]);const merged=[];for(const r of sorted){const last=merged.at(-1);if(last&&r[0]<=last[1])last[1]=Math.max(last[1],r[1]);else merged.push([...r]);}return merged;}
export function scientificRanges(text){
 // Formatting heuristic only, never a taxonomic identification. Manual ranges override it.
 const tokens=[...text.matchAll(/[A-Za-z][A-Za-z.\-]*/g)],ranges=[],excluded=new Set(['Clade','Outgroup','Group','Species','Voucher','Sample','Unknown','Taxon','Tree']);
 const genus=s=>/^(?:[A-Z][a-z]{2,}|[A-Z]\.)$/.test(s)&&!excluded.has(s),epithet=s=>/^[a-z][a-z-]+$/.test(s)&&!['sp','spp','cf','aff','nr','subsp','ssp','var','strain','voucher','isolate','sample','et','al','and','from'].includes(s);
 const nearby=(a,b)=>b&&/^[\s_]+$/.test(text.slice(a.index+a[0].length,b.index));
 for(let i=0;i<tokens.length;i++){const a=tokens[i],b=tokens[i+1];if(!genus(a[0]))continue;const range=t=>[t.index,t.index+t[0].length];if(!b&&tokens.length===1){ranges.push(range(a));continue;}if(!nearby(a,b))continue;
   if(epithet(b[0])){ranges.push(range(a),range(b));i++;const rank=tokens[i+1],third=tokens[i+2];if(rank&&/^(?:subsp|ssp|var)\.$/.test(rank[0])&&nearby(b,rank)&&nearby(rank,third)&&epithet(third[0])){ranges.push(range(third));i+=2;}}
   else if(/^(?:sp|spp)\.$/.test(b[0])){ranges.push(range(a));i++;}
   else if(/^(?:cf|aff|nr)\.$/.test(b[0])){ranges.push(range(a));const c=tokens[i+2];if(nearby(b,c)&&epithet(c[0])){ranges.push(range(c));i+=2;}}
 }
 return normalizeItalicRanges(ranges,text.length);
}
export function italicModeFor(style,options){if(['inherit','scientific','custom','all','none'].includes(style.italicMode)&&style.italicMode!=='inherit')return style.italicMode;if(style.italicMode!=='inherit'&&typeof style.italic==='boolean')return style.italic?'all':'none';return options.italic?'scientific':'none';}
export function labelSegments(text,style,options){const mode=italicModeFor(style,options);const ranges=mode==='all'?[[0,text.length]]:mode==='custom'?normalizeItalicRanges(style.italicRanges,text.length):mode==='scientific'?scientificRanges(text):[];const parts=[];let offset=0;for(const[a,b]of ranges){if(a>offset)parts.push({text:text.slice(offset,a),italic:false});parts.push({text:text.slice(a,b),italic:true});offset=b;}if(offset<text.length)parts.push({text:text.slice(offset),italic:false});return parts.length?parts:[{text,italic:false}];}
export function layoutTree(tree,styles,options){
 const index=indexTree(tree),all=[];let maxDistance=0,maxDepth=0,negative=0,missing=0,fullHeight=0;const distances=new Map();
 walk(tree,(n,p,d)=>{const dist=p?(distances.get(p.id)+Math.max(0,n.length??0)):0;distances.set(n.id,dist);maxDistance=Math.max(maxDistance,dist);maxDepth=Math.max(maxDepth,d);if(p&&n.length===null)missing++;if(n.length<0)negative++;if(!n.children.length)fullHeight+=Math.max(options.fontSize,styles[n.id]?.labelSize||0)+options.rowGap;});
 const useLength=options.metric==='length'&&maxDistance>0,scale=options.treeWidth/(useLength?maxDistance:Math.max(1,maxDepth));let cursor=0;
 const coordinate=n=>useLength?distances.get(n.id):index.depths.get(n.id),furthest=new Map();function extent(n){const max=n.children.length?Math.max(...n.children.map(extent)):coordinate(n);furthest.set(n.id,max);return max;}extent(tree);
 function rec(n,p){const st=styleFor(styles,n.id),terminal=!n.children.length||st.collapsed,naturalWidth=Math.max(0,(furthest.get(n.id)-coordinate(n))*scale);if(st.widthMode==='auto')st.width=naturalWidth;const item={id:n.id,node:n,parent:p,x:coordinate(n)*scale,y:0,style:st,naturalWidth,terminal,collapsed:!!(n.children.length&&st.collapsed),count:index.counts.get(n.id),children:[]};all.push(item);
 if(terminal){const height=item.collapsed?st.height:Math.max(options.fontSize,st.labelSize||0);item.y=cursor+height/2;cursor+=height+options.rowGap;}
 else{item.children=n.children.map(c=>rec(c,item));item.y=(item.children[0].y+item.children.at(-1).y)/2;}return item;}
 const root=rec(tree,null),height=Math.max(100,cursor-options.rowGap),terminals=all.filter(x=>x.terminal);let width=options.treeWidth;
 for(const v of terminals)width=Math.max(width,v.x+(v.collapsed?v.style.width:0));
 if(options.layout==='circular'){
   const radius=Math.max(options.treeWidth, Math.max(1,fullHeight-options.rowGap)/(2*Math.PI)*1.35);const ratio=radius/options.treeWidth;
   for(const v of all){v.radius=v.x*ratio;v.naturalWidth*=ratio;if(v.style.widthMode==='auto')v.style.width=v.naturalWidth;v.angle=(v.y/Math.max(height,1))*Math.PI*1.82-Math.PI*.91;v.x=Math.cos(v.angle)*v.radius;v.y=Math.sin(v.angle)*v.radius;}
   return {root,all,terminals,index,width:radius*2,height:radius*2,scale:scale*ratio,useLength,negative,missing};
 }
 return{root,all,terminals,index,width,height,scale,useLength,negative,missing};
}
export function revealAncestors(id,index,styles){let p=index.parents.get(id);while(p){if(styles[p])styles[p].collapsed=false;p=index.parents.get(p);}}
export function normalizeOptions(raw={}){const o={...DEFAULTS};for(const k of ['support','lengths','italic','alignLabels','underscores','scale','title'])if(typeof raw[k]==='boolean')o[k]=raw[k];for(const[k,min,max]of[['rowGap',6,100],['treeWidth',180,1400],['fontSize',8,30],['branchWidth',.5,6]])if(Number.isFinite(raw[k]))o[k]=clamp(raw[k],min,max);if(['rectangular','circular'].includes(raw.layout))o.layout=raw.layout;if(['length','topology'].includes(raw.metric))o.metric=raw.metric;if(Object.hasOwn(FONT_FAMILIES,raw.font)||raw.font==='custom')o.font=raw.font;o.customFont=cleanFontName(raw.customFont);return o;}
export function validateProject(raw){
 if(raw?.format!=='clade-studio'||raw.version!==1)throw error('지원하는 Clade Studio 프로젝트 파일이 아닙니다.');let serial=0;const ids=new Set();function rec(n,d){if(!n||typeof n!=='object'||!Array.isArray(n.children)||typeof n.name!=='string'||typeof n.id!=='string'||!/^n\d+$/.test(n.id)||ids.has(n.id))throw error('프로젝트의 노드 데이터가 올바르지 않습니다.');if(++serial>10000||d>500)throw error('프로젝트의 트리가 지원 크기를 초과합니다.');ids.add(n.id);if(n.length!==null&&!Number.isFinite(n.length))throw error('프로젝트의 가지 길이가 올바르지 않습니다.');return{id:n.id,name:n.name.slice(0,4000),length:n.length,...(Object.hasOwn(n,'branchSupport')?{branchSupport:isSupportValue(n.branchSupport)?n.branchSupport:null}:{}),...(n.rooted===true?{rooted:true}:{}),...(n.syntheticRoot===true?{syntheticRoot:true}:{}),comments:(Array.isArray(n.comments)?n.comments:[]).filter(c=>typeof c==='string'&&/^\[[\s\S]*\]$/.test(c)),children:n.children.map(c=>rec(c,d+1))};}
 const tree=rec(raw.tree,0),styles={};for(const id of ids){const r=raw.styles?.[id];if(!r||typeof r!=='object')continue;const s={collapsed:!!r.collapsed};for(const[k,min,max]of[['width',0,100000],['height',8,360],['labelSize',8,36],['supportDx',-100000,100000],['supportDy',-100000,100000]])if(Number.isFinite(r[k]))s[k]=clamp(r[k],min,max);for(const k of ['color','fill'])if(/^#[0-9a-f]{6}$/i.test(r[k]))s[k]=r[k];if(typeof r.label==='string')s.label=r.label.slice(0,4000);if(typeof r.italic==='boolean')s.italic=r.italic;if(['inherit','scientific','custom','all','none'].includes(r.italicMode))s.italicMode=r.italicMode;if(Array.isArray(r.italicRanges))s.italicRanges=normalizeItalicRanges(r.italicRanges,4000);if(['start','middle','end'].includes(r.supportAnchor))s.supportAnchor=r.supportAnchor;if(['auto','manual'].includes(r.widthMode))s.widthMode=r.widthMode;if(['triangle','rectangle','ellipse'].includes(r.shape))s.shape=r.shape;styles[id]=s;}
 return {tree,styles,groups:normalizeGroups(raw.groups,ids),options:normalizeOptions(raw.options),title:typeof raw.title==='string'?raw.title.slice(0,200):'Untitled tree',sample:raw.sample===true};
}

export function normalizeGroups(raw,ids){
 const seen=new Set();return (Array.isArray(raw)?raw:[]).slice(0,100).filter(r=>r&&typeof r==='object').map((r,i)=>{
  let id=typeof r.id==='string'&&/^g[\w-]{1,60}$/.test(r.id)?r.id:`group-${i}`;while(seen.has(id))id+='x';seen.add(id);
  return {id,name:typeof r.name==='string'?r.name.slice(0,200):'분류군',nodeIds:[...new Set((Array.isArray(r.nodeIds)?r.nodeIds:[]).filter(id=>ids.has(id)))],color:/^#[0-9a-f]{6}$/i.test(r.color)?r.color:'#1956a3',visible:r.visible!==false,showBar:r.showBar!==false,showName:r.showName!==false,background:['solid','gradient'].includes(r.background)?r.background:'none',backgroundScope:['full','labels','band'].includes(r.backgroundScope)?r.backgroundScope:'labels',backgroundColor:/^#[0-9a-f]{6}$/i.test(r.backgroundColor)?r.backgroundColor:null,backgroundWidth:Number.isFinite(r.backgroundWidth)?clamp(r.backgroundWidth,0,1200):0,labelPosition:r.labelPosition==='center'?'center':'start',opacity:Number.isFinite(r.opacity)?clamp(r.opacity,0,1):.18,colorLabels:r.colorLabels===true,colorBranches:r.colorBranches===true,barWidth:Number.isFinite(r.barWidth)?clamp(r.barWidth,2,24):6,labelSize:Number.isFinite(r.labelSize)?clamp(r.labelSize,10,30):14,italic:r.italic!==false};
 }).filter(g=>g.nodeIds.length);
}

// A group contains an explicit union of clades/tips, never an inferred MRCA.
export function resolveGroups(tree,groups,layout,options){
 const index=layout.index,branchColors=new Map(),labelColors=new Map(),resolved=[];
 for(const group of groups){if(!group.visible)continue;const leaves=new Set();for(const id of group.nodeIds){const n=index.nodes.get(id);if(n)walk(n,c=>{if(!c.children.length)leaves.add(c.id);});}
  const covered=new Set(),matched=new Map();function count(n){const total=n.children.length?n.children.reduce((sum,c)=>sum+count(c),0):Number(leaves.has(n.id));matched.set(n.id,total);if(total&&total===index.counts.get(n.id))covered.add(n.id);return total;}count(tree);
  for(const id of covered){if(group.colorBranches)branchColors.set(id,group.color);if(group.colorLabels)labelColors.set(id,group.color);}
  let run=null;const runs=[],partial=[];layout.terminals.forEach((n,i)=>{if(n.collapsed&&matched.get(n.id)>0&&!covered.has(n.id))partial.push(n.id);if(!covered.has(n.id)){run=null;return;}
   const half=(n.collapsed?n.style.height:Math.max(options.fontSize,n.style.labelSize||0))/2+options.rowGap*.35;
   if(!run){run={first:i,last:i,top:n.y-half,bottom:n.y+half};runs.push(run);}else{run.last=i;run.bottom=n.y+half;}
  });resolved.push({...group,covered,leaves,runs,partial});
 }
 // Overlapping and nested ranges receive separate columns on the right.
 const lanes=[];for(const g of resolved){const spans=g.runs.map(r=>{const extra=Math.max(0,(g.name.split('\n').length*g.labelSize*1.3-(r.bottom-r.top))/2);return{top:r.top-extra,bottom:r.bottom+extra};});let lane=0;while(lanes[lane]?.some(a=>spans.some(b=>a.top<b.bottom&&b.top<a.bottom)))lane++;g.lane=lane;(lanes[lane]??=[]).push(...spans);}
 return {groups:resolved,branchColors,labelColors,partialCount:resolved.reduce((sum,g)=>sum+g.partial.length,0)};
}
