import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {CATALOG,LANGUAGES,t,setLanguage,getLanguage,preferredLanguage,bindStaticTranslations} from '../src/i18n.js';
import {parseNewick,parseTreeFile,indexTree,toNewick,validateProject,DEFAULTS,labelSegments} from '../src/core.js';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../src/index.html',import.meta.url),'utf8');
const parameters=value=>[...value.matchAll(/\{([A-Za-z]+)\}/g)].map(m=>m[1]).sort();

test('all translations are complete and retain the same substitution parameters',()=>{
  assert.ok(Object.keys(CATALOG).length>350);
  for(const [key,row] of Object.entries(CATALOG))for(const locale of LANGUAGES){
    assert.ok(row[locale]?.trim(),`${locale}: ${key}`);
    assert.deepEqual(parameters(row[locale]),parameters(key),`${locale}: ${key}`);
    if(locale!=='ko')assert.doesNotMatch(row[locale],/[가-힣]/,`${locale}: ${key}`);
  }
});

test('every Korean chrome label, accessible label, and runtime translation key has a translation',()=>{
  const strings=[...html.matchAll(/>([^<>]+)</g)].map(m=>m[1].trim());
  strings.push(...[...html.matchAll(/(?:title|aria-label|placeholder|alt|content)="([^"]*)"/g)].map(m=>m[1]));
  for(const text of strings)if(/[가-힣]/.test(text)&&text!=='한국어'&&!/^수정 버전 \d+\.\d+$/.test(text))assert.ok(Object.hasOwn(CATALOG,text),text);
  for(const match of app.matchAll(/(?:\bt|setSaveStatus)\('([^']+)'/g))assert.ok(Object.hasOwn(CATALOG,match[1]),match[1]);
});

test('language defaults and saved preferences are validated without a project migration',()=>{
  assert.equal(preferredLanguage(null,'en'),'en');
  assert.equal(preferredLanguage(null,'th'),'th');
  assert.equal(preferredLanguage('th','en'),'th');
  assert.equal(preferredLanguage('invalid','en'),'en');
  assert.equal(preferredLanguage(null,'invalid'),'ko');
  assert.equal(setLanguage('__proto__'),'ko');
  assert.equal(getLanguage(),'ko');
  assert.equal(t('__proto__'),'__proto__');
});

test('language changes preserve scientific names, custom labels, italic ranges and saved tree data',()=>{
  const tree=parseNewick("(('Chilobrachys natanicharum ไทย':.1,'노드 탐색':.2)99:.3,C:.5);");
  const p=validateProject({format:'clade-studio',version:1,tree,styles:{[tree.children[0].children[0].id]:{label:'ไทย Chilobrachys natanicharum 한국어',italicMode:'custom',italicRanges:[[4,15],[16,28]]}},groups:[{id:'gA',name:'분류군 이름',nodeIds:[tree.children[0].id]}],options:DEFAULTS});
  const before=JSON.stringify(p),newick=toNewick(p.tree),label=p.styles[tree.children[0].children[0].id].label;
  for(const locale of ['en','th','ko']){
    setLanguage(locale);
    assert.equal(JSON.stringify(p),before);
    assert.equal(toNewick(p.tree),newick);
    assert.equal(labelSegments(label,p.styles[tree.children[0].children[0].id],p.options).map(part=>part.text).join(''),label);
    const name='ไทย {count} 한국어 <b>literal</b>';
    assert.ok(t('현재 선택: {name}',{name}).endsWith(name));
  }
});

test('tree parser errors and character positions use the current language',()=>{
  try{
    setLanguage('en');assert.throws(()=>parseNewick(''),/Tree text is empty/);assert.throws(()=>parseNewick('(A,B)'),/semicolon.*character 6/);
    setLanguage('th');assert.throws(()=>parseNewick(''),/ข้อความทรีว่างเปล่า/);assert.throws(()=>parseNewick('(A,B)'),/อัฒภาค.*อักขระที่ 6/);
    setLanguage('ko');assert.throws(()=>parseNewick(''),/트리 텍스트가 비어 있습니다/);
  }finally{setLanguage('ko');}
});

test('only captured chrome is translated; later user data and disconnected render nodes are untouched',()=>{
  const text=value=>({nodeValue:value,isConnected:true,parentElement:{closest(){return false;}}});
  const title=text('  트리 열기  '),detached=text('분류군 이름');
  const input={attrs:{placeholder:'라벨 또는 노드 검색'},value:'트리 열기',getAttribute(key){return this.attrs[key]??null;},setAttribute(key,value){this.attrs[key]=value;}};
  const initial=[title,detached],doc={documentElement:{},createTreeWalker(){let i=-1;return{nextNode(){return ++i<initial.length;},get currentNode(){return initial[i];}};},querySelectorAll(){return[input];}};
  const apply=bindStaticTranslations(doc),userLabel=text('분류군 이름');detached.isConnected=false;
  try{
    setLanguage('en');apply();assert.equal(title.nodeValue,'  Open tree  ');assert.equal(input.attrs.placeholder,'Search labels or nodes');
    setLanguage('th');apply();assert.equal(title.nodeValue,'  เปิดทรี  ');assert.equal(input.attrs.placeholder,'ค้นหาป้ายชื่อหรือโหนด');
    setLanguage('ko');apply();assert.equal(title.nodeValue,'  트리 열기  ');
    assert.equal(input.value,'트리 열기');assert.equal(userLabel.nodeValue,'분류군 이름');assert.equal(detached.nodeValue,'분류군 이름');
  }finally{setLanguage('ko');}
});

test('the multiple-tree picker localizes counts and preserves source tree names',()=>{
  const fn=app.slice(app.indexOf('function loadContent('),app.indexOf('async function loadFile('));
  const fields=new Map(),element=()=>({children:[],textContent:'',append(...nodes){this.children.push(...nodes);},replaceChildren(){this.children=[];},close(){}});
  const $=id=>{if(!fields.has(id))fields.set(id,element());return fields.get(id);};
  let opened;
  const context={$ ,t,parseTreeFile,indexTree,document:{createElement:element},openDialog:id=>opened=id,importError:err=>{throw err;},loadProject(){},loadTree(){}};
  runInNewContext(fn,context);
  try{
    for(const language of ['en','th','ko']){
      setLanguage(language);context.loadContent('#NEXUS\nbegin trees; tree original_name=(A:1,B:2); tree Thai_name=(C:3,D:4); end;','test.nex');
      assert.equal(opened,'treePickerDialog');assert.equal($('treeChoices').children.length,2);
      assert.equal($('treeChoices').children[0].children[0].textContent,'1. original_name');
      assert.equal($('treeChoices').children[0].children[1].textContent,language==='th'?'2 โหนดปลาย':'2 tips');
    }
  }finally{setLanguage('ko');}
});
