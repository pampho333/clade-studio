import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {fontFamilyFor,DEFAULTS,parseNewick,indexTree,layoutTree,normalizeGroups,resolveGroups,validateProject,toNewick} from '../src/core.js';

const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const drawSource=source.slice(source.indexOf('function drawGroups('),source.indexOf('function applyView('));
const fixture=()=>parseNewick('((Alpha_one:1,Alpha_two:1)99:1,(Beta_one:1,Beta_two:1)98:1);');
function setup(raw){const tree=fixture(),index=indexTree(tree),groups=normalizeGroups(raw(tree),new Set(index.nodes.keys())),layout=layoutTree(tree,{},DEFAULTS);return{tree,groups,layout,groupState:resolveGroups(tree,groups,layout,DEFAULTS)};}
function draw(data){
 const node=(tag,attrs={},text)=>({tag,attrs,text,children:[],getBBox(){return {x:620,width:this.text?this.text.length*8:180};},remove(){this.parent.children=this.parent.children.filter(c=>c!==this);}});
 const defs=node('defs'),background=node('g'),foreground=node('g'),text=node('g');
 const append=(p,tag,attrs,text)=>{const n=node(tag,attrs,text);n.parent=p;p.children.push(n);return n;};
 const context={options:DEFAULTS,layout:data.layout,groupState:data.groupState,fontFamilyFor,append,appendLabel:(p,a,t)=>append(p,'text',a,t)};
 runInNewContext(drawSource,context);context.drawGroups(defs,background,foreground,text,800);
 return {defs,background,foreground};
}

test('old projects keep bar and background settings, with automatic width and inherited color',()=>{
 const tree=fixture(),before=toNewick(tree),p=validateProject({format:'clade-studio',version:1,tree,styles:{},groups:[{id:'gOld',nodeIds:[tree.children[0].id],color:'#1956a3',showBar:true,background:'gradient',backgroundScope:'band',opacity:.18}]});
 assert.equal(p.groups[0].showBar,true);assert.equal(p.groups[0].color,'#1956a3');assert.equal(p.groups[0].backgroundColor,null);assert.equal(p.groups[0].backgroundWidth,0);assert.equal(p.groups[0].labelPosition,'start');assert.equal(p.groups[0].opacity,.18);assert.equal(toNewick(p.tree),before);
});

test('independent background color, width and name position survive project round trip',()=>{
 const data=setup(t=>[{id:'gCustom',name:'Alpha',nodeIds:[t.children[0].id],color:'#252525',backgroundColor:'#08754b',background:'gradient',backgroundScope:'band',backgroundWidth:320,labelPosition:'center',opacity:.75}]);
 const p=validateProject(JSON.parse(JSON.stringify({format:'clade-studio',version:1,tree:data.tree,groups:data.groups,styles:{}})));
 assert.deepEqual(p.groups,data.groups);
 const invalid=normalizeGroups([{nodeIds:[data.tree.id],backgroundColor:'url(https://bad.test)',backgroundWidth:9999,labelPosition:'bad'}],new Set(data.layout.index.nodes.keys()))[0];
 assert.equal(invalid.backgroundColor,null);assert.equal(invalid.backgroundWidth,1200);assert.equal(invalid.labelPosition,'start');
});

test('rendered gradient uses the independent color and keeps the existing solid bar',()=>{
 const data=setup(t=>[{id:'gA',name:'Alpha',nodeIds:[t.children[0].id],color:'#252525',backgroundColor:'#08754b',background:'gradient',backgroundScope:'band',backgroundWidth:320,labelPosition:'center',opacity:.75}]),r=draw(data);
 const bar=r.foreground.children.find(n=>n.tag==='rect'),label=r.foreground.children.find(n=>n.tag==='text');
 assert.equal(bar.attrs.fill,'#252525');assert.equal(bar.attrs.width,6);
 assert.equal(r.defs.children[0].children[0].attrs['stop-opacity'],0);
 assert.equal(r.defs.children[0].children[1].attrs['stop-color'],'#08754b');
 assert.equal(r.defs.children[0].children[1].attrs['stop-opacity'],.75);
 assert.equal(r.background.children[0].attrs.width,328); // Includes the 8 px leading margin.
 assert.equal(label.attrs['text-anchor'],'middle');
 assert.equal(label.attrs.x,bar.attrs.x+160);
});

test('background and bar visibility can be changed independently',()=>{
 for(const [showBar,background] of [[true,'none'],[false,'solid'],[true,'gradient']]){
  const data=setup(t=>[{id:'gA',name:'Alpha',nodeIds:[t.children[0].id],color:'#252525',backgroundColor:'#ae6a00',showBar,background,backgroundScope:'band',opacity:.6}]),r=draw(data);
  assert.equal(r.foreground.children.filter(n=>n.tag==='rect').length,showBar?1:0);
  assert.equal(r.background.children.length,background==='none'?0:1);
  if(background==='solid'){assert.equal(r.background.children[0].attrs.fill,'#ae6a00');assert.equal(r.background.children[0].attrs['fill-opacity'],.6);}
 }
});

test('the reference preset leaves existing bar settings untouched',()=>{
 const fields=new Map(),get=id=>{if(!fields.has(id))fields.set(id,{});return fields.get(id);};
 get('groupBar').checked=true;get('groupColor').value='#252525';get('groupBarWidth').value=9;
 const fn=source.slice(source.indexOf('function referenceBackground('),source.indexOf('function updateBackgroundPreview('));
 const context={$:get,updateBackgroundPreview(){}};runInNewContext(fn,context);context.referenceBackground();
 assert.equal(get('groupBar').checked,true);assert.equal(get('groupColor').value,'#252525');assert.equal(get('groupBarWidth').value,9);
 assert.equal(get('groupBackground').value,'gradient');assert.equal(get('groupScope').value,'band');
});

// Optional standalone visual check of the real annotation renderer, without browser UI.
if(process.env.CLADE_BACKGROUND_PREVIEW){
 const data=setup(t=>[{id:'gGreen',name:'Alpha group',nodeIds:[t.children[0].id],color:'#333333',backgroundColor:'#08754b',background:'gradient',backgroundScope:'band',backgroundWidth:260,labelPosition:'center',opacity:.75},{id:'gBlue',name:'Beta group',nodeIds:[t.children[1].id],color:'#1956a3',showBar:false,background:'gradient',backgroundScope:'band',backgroundWidth:260,labelPosition:'center',opacity:.75}]);
 const r=draw(data),escape=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
 function xml(n){return `<${n.tag} ${Object.entries(n.attrs).map(([k,v])=>`${k}="${escape(v)}"`).join(' ')}>${n.text?escape(n.text):''}${n.children.map(xml).join('')}</${n.tag}>`;}
 writeFileSync(process.env.CLADE_BACKGROUND_PREVIEW,`<svg xmlns="http://www.w3.org/2000/svg" width="360" height="190" viewBox="790 -20 360 190"><rect x="790" y="-20" width="360" height="190" fill="white"/>${xml(r.defs)}${xml(r.background)}${xml(r.foreground)}</svg>`);
}
