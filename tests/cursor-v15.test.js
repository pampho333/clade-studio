import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const handlers=source.slice(source.indexOf("const viewport=$('canvasViewport')"),source.indexOf('new ResizeObserver'));

function editor(){
 const targets={};
 function surface(name){return targets[name]??={dataset:{},events:{},captured:new Set(),classList:{add(){},remove(){}},addEventListener(type,fn){this.events[type]=fn;},getBoundingClientRect(){return {left:0,top:0};},setPointerCapture(id){this.captured.add(id);},hasPointerCapture(id){return this.captured.has(id);},releasePointerCapture(id){this.captured.delete(id);this.events.lostpointercapture?.({pointerId:id});}};}
 const node={id:'n1',x:0,y:0,style:{width:40,height:24,supportDx:0,supportDy:0}};
 const context={$:surface,window:surface('window'),document:surface('document'),drag:null,selected:null,layout:{all:[node]},options:{layout:'rectangular'},view:{x:0,y:0,k:1},edits:[],history:[],saved:0,clamp:(v,a,b)=>Math.min(b,Math.max(a,v)),snapshot:()=>'{"before":true}',updateStyle(id,patch){context.edits.push(patch);},record(before){context.history.push(before);},scheduleSave(){context.saved++;},draw(){},drawWithLayout(){},renderInspector(){},renderList(){},render(){},applyView(){},selectNode(){},toggleCollapse(){},fitView(){},zoom(){}};
 runInNewContext(handlers,context);
 function send(type,{kind='background',pointerId=7,buttons=1,x=0,y=0}={}){
  const target={closest(selector){if(kind==='support'&&selector==='[data-support-node]')return {dataset:{supportNode:'n1'}};if(kind==='width'&&selector==='[data-resize]')return {dataset:{node:'n1',resize:'width'}};return null;}};
  surface('canvasViewport').events[type]({button:0,buttons,pointerType:'mouse',pointerId,clientX:x,clientY:y,target,preventDefault(){},stopPropagation(){}});
 }
 return {context,surface,send};
}

test('pan cursor clears if the mouse button was released outside the canvas',()=>{
 const e=editor();e.send('pointerdown');
 assert.equal(e.surface('canvasViewport').dataset.dragCursor,'move');
 e.send('pointermove',{buttons:0});
 assert.equal(e.context.drag,null);
 assert.equal(e.surface('canvasViewport').dataset.dragCursor,undefined);
 assert.equal(e.surface('canvasViewport').captured.size,0);
});

test('support drag survives redraws and capture loss commits once',()=>{
 const e=editor();e.send('pointerdown',{kind:'support'});e.send('pointermove',{x:12,y:-4});
 assert.equal(e.context.edits[0].supportDx,12);
 assert.equal(e.context.edits[0].supportDy,-4);
 assert.equal(e.surface('canvasViewport').dataset.dragCursor,'move');
 e.send('lostpointercapture');e.send('pointerup');
 assert.equal(e.context.history.length,1);
 assert.equal(e.context.saved,1);
 assert.equal(e.surface('canvasViewport').dataset.dragCursor,undefined);
});

test('resize keeps its directional cursor until release and remains undoable',()=>{
 const e=editor();e.send('pointerdown',{kind:'width'});
 assert.equal(e.surface('canvasViewport').dataset.dragCursor,'width');
 e.send('pointermove',{x:15});
 assert.equal(e.context.edits[0].width,55);
 assert.equal(e.context.edits[0].widthMode,'manual');
 e.send('pointerup');
 assert.equal(e.context.history.length,1);
 assert.equal(e.context.drag,null);
});

test('another pointer cannot move or end the current drag',()=>{
 const e=editor();e.send('pointerdown',{kind:'width'});
 e.send('pointermove',{pointerId:9,x:50});e.send('pointercancel',{pointerId:9});
 assert.equal(e.context.edits.length,0);assert.equal(e.context.drag.pointerId,7);
 e.send('pointercancel');assert.equal(e.context.drag,null);
});

test('window blur and hidden tabs release stale cursor and pointer capture',()=>{
 for(const mode of ['blur','hidden']){
  const e=editor();e.send('pointerdown',{kind:'support'});
  if(mode==='blur')e.surface('window').events.blur();else{e.surface('document').hidden=true;e.surface('document').events.visibilitychange();}
  assert.equal(e.context.drag,null);
  assert.equal(e.surface('canvasViewport').captured.size,0);
  assert.equal(e.surface('canvasViewport').dataset.dragCursor,undefined);
  assert.equal(e.context.history.length,1);
 }
});
