// Local translations only. User data is never passed through the catalog.
export const LANGUAGES = Object.freeze(["ko", "en", "th"]);
let activeLanguage='ko';
export function preferredLanguage(saved, fallback='ko'){
  return LANGUAGES.includes(saved)?saved:LANGUAGES.includes(fallback)?fallback:'ko';
}
export function setLanguage(language){activeLanguage=preferredLanguage(language);return activeLanguage;}
export function getLanguage(){return activeLanguage;}
export function t(key,values={},language=activeLanguage){
  const entry=Object.hasOwn(CATALOG,key)?CATALOG[key]:null;
  const template=entry?.[preferredLanguage(language)]??key;
  return template.replace(/\{([A-Za-z]+)\}/g,(match,name)=>Object.hasOwn(values,name)?String(values[name]):match);
}
// Capture only the initial application chrome. Dynamic tree labels, names, and
// form values are never scanned or rewritten during a language change.
export function bindStaticTranslations(doc){
  const bindings=[];
  const walker=doc.createTreeWalker(doc.documentElement,4);
  while(walker.nextNode()){
    const node=walker.currentNode;
    if(node.parentElement?.closest('script,style'))continue;
    const raw=node.nodeValue,key=raw.trim();
    if(Object.hasOwn(CATALOG,key))bindings.push(()=>{
      if(node.isConnected)node.nodeValue=raw.replace(key,t(key));
    });
  }
  for(const element of doc.querySelectorAll('[title],[aria-label],[placeholder],[alt],meta[name="description"]')){
    for(const attr of ['title','aria-label','placeholder','alt','content']){
      const key=element.getAttribute(attr);
      if(key&&Object.hasOwn(CATALOG,key))bindings.push(()=>element.setAttribute(attr,t(key)));
    }
  }
  return ()=>bindings.forEach(apply=>apply());
}
export const CATALOG = Object.freeze({
  "Clade Studio — 계통수 편집기": {
    "ko": "Clade Studio — 계통수 편집기",
    "en": "Clade Studio — Phylogenetic tree editor",
    "th": "Clade Studio — เครื่องมือแก้ไขทรีสายวิวัฒนาการ"
  },
  "Clade Studio 홈": {
    "ko": "Clade Studio 홈",
    "en": "Clade Studio home",
    "th": "หน้าหลัก Clade Studio"
  },
  "강원대학교 Insect Taxonomy Laboratory 로고": {
    "ko": "강원대학교 Insect Taxonomy Laboratory 로고",
    "en": "Kangwon National University Insect Taxonomy Laboratory logo",
    "th": "โลโก้ห้องปฏิบัติการอนุกรมวิธานแมลง มหาวิทยาลัยแห่งชาติคังวอน"
  },
  "PHYLOGENETIC TREE EDITOR": {
    "ko": "PHYLOGENETIC TREE EDITOR",
    "en": "PHYLOGENETIC TREE EDITOR",
    "th": "เครื่องมือแก้ไขทรีสายวิวัฒนาการ"
  },
  "WORKSPACE": {
    "ko": "WORKSPACE",
    "en": "WORKSPACE",
    "th": "พื้นที่ทำงาน"
  },
  "프로젝트 제목": {
    "ko": "프로젝트 제목",
    "en": "Project title",
    "th": "ชื่อโครงการ"
  },
  "입력한 트리 데이터는 이 브라우저에서 처리됩니다.": {
    "ko": "입력한 트리 데이터는 이 브라우저에서 처리됩니다.",
    "en": "Your tree data is processed in this browser.",
    "th": "ข้อมูลทรีของคุณประมวลผลในเบราว์เซอร์นี้"
  },
  "브라우저에서 작업 중": {
    "ko": "브라우저에서 작업 중",
    "en": "Working in your browser",
    "th": "กำลังทำงานในเบราว์เซอร์"
  },
  "사용 방법": {
    "ko": "사용 방법",
    "en": "Help",
    "th": "วิธีใช้งาน"
  },
  "트리 열기": {
    "ko": "트리 열기",
    "en": "Open tree",
    "th": "เปิดทรี"
  },
  "내보내기": {
    "ko": "내보내기",
    "en": "Export",
    "th": "ส่งออก"
  },
  "트리 탐색 및 표시 설정": {
    "ko": "트리 탐색 및 표시 설정",
    "en": "Tree navigation and display settings",
    "th": "สำรวจทรีและตั้งค่าการแสดงผล"
  },
  "노드 탐색": {
    "ko": "노드 탐색",
    "en": "Nodes",
    "th": "โหนด"
  },
  "표시 설정": {
    "ko": "표시 설정",
    "en": "Display",
    "th": "การแสดงผล"
  },
  "라벨 또는 노드 검색": {
    "ko": "라벨 또는 노드 검색",
    "en": "Search labels or nodes",
    "th": "ค้นหาป้ายชื่อหรือโหนด"
  },
  "노드 검색": {
    "ko": "노드 검색",
    "en": "Search nodes",
    "th": "ค้นหาโหนด"
  },
  "말단 노드": {
    "ko": "말단 노드",
    "en": "Tips",
    "th": "โหนดปลาย"
  },
  "접힌 분기군": {
    "ko": "접힌 분기군",
    "en": "Collapsed clades",
    "th": "กลุ่มที่ยุบ"
  },
  "트리 구조": {
    "ko": "트리 구조",
    "en": "Tree structure",
    "th": "โครงสร้างทรี"
  },
  "노드 목록": {
    "ko": "노드 목록",
    "en": "Node list",
    "th": "รายการโหนด"
  },
  "모두 펼치기": {
    "ko": "모두 펼치기",
    "en": "Expand all",
    "th": "ขยายทั้งหมด"
  },
  "하위 말단 수가 적은 분기군부터 정렬합니다. 같은 크기의 분기군은 기존 순서를 유지합니다.": {
    "ko": "하위 말단 수가 적은 분기군부터 정렬합니다. 같은 크기의 분기군은 기존 순서를 유지합니다.",
    "en": "Sort clades with fewer tips first. Clades of equal size keep their current order.",
    "th": "เรียงกลุ่มที่มีโหนดปลายน้อยกว่าไว้ก่อน กลุ่มที่มีขนาดเท่ากันจะคงลำดับเดิม"
  },
  "iTOL식 분기군 정렬": {
    "ko": "iTOL식 분기군 정렬",
    "en": "Ladderize · iTOL style",
    "th": "เรียงกลุ่มแบบ iTOL"
  },
  "예제 트리 열기": {
    "ko": "예제 트리 열기",
    "en": "Open example tree",
    "th": "เปิดทรีตัวอย่าง"
  },
  "TREE APPEARANCE": {
    "ko": "TREE APPEARANCE",
    "en": "TREE APPEARANCE",
    "th": "รูปแบบทรี"
  },
  "가지 길이": {
    "ko": "가지 길이",
    "en": "Branch lengths",
    "th": "ความยาวกิ่ง"
  },
  "원본 길이 사용 · Phylogram": {
    "ko": "원본 길이 사용 · Phylogram",
    "en": "Use branch lengths · Phylogram",
    "th": "ใช้ความยาวกิ่ง · Phylogram"
  },
  "위상만 표시 · Cladogram": {
    "ko": "위상만 표시 · Cladogram",
    "en": "Topology only · Cladogram",
    "th": "โครงสร้างการแตกกิ่งเท่านั้น · Cladogram"
  },
  "트리 가로 폭": {
    "ko": "트리 가로 폭",
    "en": "Tree width",
    "th": "ความกว้างทรี"
  },
  "노드 사이 간격": {
    "ko": "노드 사이 간격",
    "en": "Tip spacing",
    "th": "ระยะห่างโหนดปลาย"
  },
  "기본 글자 크기": {
    "ko": "기본 글자 크기",
    "en": "Default font size",
    "th": "ขนาดตัวอักษรเริ่มต้น"
  },
  "기본 선 두께": {
    "ko": "기본 선 두께",
    "en": "Default line width",
    "th": "ความหนาเส้นเริ่มต้น"
  },
  "트리 글꼴 선택": {
    "ko": "트리 글꼴 선택",
    "en": "Choose tree font",
    "th": "เลือกแบบอักษรของทรี"
  },
  "트리 글꼴": {
    "ko": "트리 글꼴",
    "en": "Tree font",
    "th": "แบบอักษรของทรี"
  },
  "맑은 고딕": {
    "ko": "맑은 고딕",
    "en": "Malgun Gothic",
    "th": "Malgun Gothic"
  },
  "바탕": {
    "ko": "바탕",
    "en": "Batang",
    "th": "Batang"
  },
  "다른 설치 글꼴 직접 입력…": {
    "ko": "다른 설치 글꼴 직접 입력…",
    "en": "Enter another installed font…",
    "th": "ระบุแบบอักษรอื่นที่ติดตั้งไว้…"
  },
  "설치된 글꼴 이름": {
    "ko": "설치된 글꼴 이름",
    "en": "Installed font name",
    "th": "ชื่อแบบอักษรที่ติดตั้งไว้"
  },
  "예: Noto Serif": {
    "ko": "예: Noto Serif",
    "en": "For example: Noto Serif",
    "th": "ตัวอย่าง: Noto Serif"
  },
  "이름을 입력하고 Enter를 누르면 적용됩니다.": {
    "ko": "이름을 입력하고 Enter를 누르면 적용됩니다.",
    "en": "Enter a font name and press Enter to apply.",
    "th": "พิมพ์ชื่อแบบอักษรแล้วกด Enter เพื่อใช้"
  },
  "선택 글꼴 미리보기": {
    "ko": "선택 글꼴 미리보기",
    "en": "Font preview",
    "th": "ตัวอย่างแบบอักษร"
  },
  "sp. nov. · 99 / 100 · 가나다": {
    "ko": "sp. nov. · 99 / 100 · 가나다",
    "en": "sp. nov. · 99 / 100 · Aa Bb",
    "th": "sp. nov. · 99 / 100 · ก ข ค"
  },
  "라벨·부트스트랩·분류군 이름에 함께 적용합니다. 설치되지 않은 글꼴은 대체 글꼴로 표시됩니다. SVG를 다른 컴퓨터에서 열 때도 해당 글꼴이 필요합니다.": {
    "ko": "라벨·부트스트랩·분류군 이름에 함께 적용합니다. 설치되지 않은 글꼴은 대체 글꼴로 표시됩니다. SVG를 다른 컴퓨터에서 열 때도 해당 글꼴이 필요합니다.",
    "en": "Applies to labels, support values, and taxon names. Missing fonts use a fallback. The same font must be installed when opening an SVG on another computer.",
    "th": "ใช้กับป้ายชื่อ ค่าสนับสนุน และชื่อกลุ่มอนุกรมวิธาน หากไม่มีแบบอักษรจะใช้แบบอักษรสำรอง เมื่อต้องการเปิด SVG บนคอมพิวเตอร์อื่น ต้องติดตั้งแบบอักษรเดียวกันด้วย"
  },
  "내부 노드 라벨·지지도": {
    "ko": "내부 노드 라벨·지지도",
    "en": "Internal labels / support values",
    "th": "ป้ายชื่อโหนดภายใน / ค่าสนับสนุน"
  },
  "가지 길이 수치": {
    "ko": "가지 길이 수치",
    "en": "Branch length values",
    "th": "ค่าความยาวกิ่ง"
  },
  "학명 부분 자동 기울임": {
    "ko": "학명 부분 자동 기울임",
    "en": "Auto-italicize scientific names",
    "th": "ทำชื่อวิทยาศาสตร์เป็นตัวเอียงอัตโนมัติ"
  },
  "말단 라벨 오른쪽 정렬": {
    "ko": "말단 라벨 오른쪽 정렬",
    "en": "Align tip labels on the right",
    "th": "จัดป้ายชื่อโหนดปลายให้ตรงกันทางขวา"
  },
  "밑줄을 공백으로 표시": {
    "ko": "밑줄을 공백으로 표시",
    "en": "Display underscores as spaces",
    "th": "แสดงขีดล่างเป็นช่องว่าง"
  },
  "축척 막대": {
    "ko": "축척 막대",
    "en": "Scale bar",
    "th": "แถบมาตราส่วน"
  },
  "그림 제목": {
    "ko": "그림 제목",
    "en": "Figure title",
    "th": "ชื่อภาพ"
  },
  "접힌 도형의 크기는 표시용입니다. 원본 가지 길이와 하위 노드 데이터는 유지됩니다.": {
    "ko": "접힌 도형의 크기는 표시용입니다. 원본 가지 길이와 하위 노드 데이터는 유지됩니다.",
    "en": "Collapsed shape sizes affect the display only. Original branch lengths and descendant data are preserved.",
    "th": "ขนาดรูปทรงที่ยุบมีผลเฉพาะการแสดงผล ความยาวกิ่งเดิมและข้อมูลโหนดลูกยังคงอยู่"
  },
  "트리 편집 영역": {
    "ko": "트리 편집 영역",
    "en": "Tree editing area",
    "th": "พื้นที่แก้ไขทรี"
  },
  "트리 레이아웃": {
    "ko": "트리 레이아웃",
    "en": "Tree layout",
    "th": "การจัดรูปแบบทรี"
  },
  "직각 트리": {
    "ko": "직각 트리",
    "en": "Rectangular tree",
    "th": "ทรีแบบสี่เหลี่ยม"
  },
  "직각": {
    "ko": "직각",
    "en": "Rectangular",
    "th": "สี่เหลี่ยม"
  },
  "원형 트리": {
    "ko": "원형 트리",
    "en": "Circular tree",
    "th": "ทรีแบบวงกลม"
  },
  "원형": {
    "ko": "원형",
    "en": "Circular",
    "th": "วงกลม"
  },
  "선택한 분기군 접기 / 펼치기 (C)": {
    "ko": "선택한 분기군 접기 / 펼치기 (C)",
    "en": "Collapse / expand selected clade (C)",
    "th": "ยุบ / ขยายกลุ่มที่เลือก (C)"
  },
  "접기": {
    "ko": "접기",
    "en": "Collapse",
    "th": "ยุบ"
  },
  "하위 노드 순서 뒤집기 (R)": {
    "ko": "하위 노드 순서 뒤집기 (R)",
    "en": "Reverse child order (R)",
    "th": "กลับลำดับโหนดลูก (R)"
  },
  "회전": {
    "ko": "회전",
    "en": "Rotate",
    "th": "สลับลำดับ"
  },
  "선택 노드를 기준으로 루트 변경 (Shift+R)": {
    "ko": "선택 노드를 기준으로 루트 변경 (Shift+R)",
    "en": "Reroot at selected node (Shift+R)",
    "th": "กำหนดรากใหม่โดยอิงโหนดที่เลือก (Shift+R)"
  },
  "선택 노드로 재루팅": {
    "ko": "선택 노드로 재루팅",
    "en": "Reroot at selected node",
    "th": "กำหนดรากใหม่โดยอิงโหนดที่เลือก"
  },
  "루트 지정": {
    "ko": "루트 지정",
    "en": "Reroot",
    "th": "เปลี่ยนราก"
  },
  "분류군 색 띠와 범위 표시": {
    "ko": "분류군 색 띠와 범위 표시",
    "en": "Taxon color bars and ranges",
    "th": "แถบสีและขอบเขตกลุ่มอนุกรมวิธาน"
  },
  "분류군 색": {
    "ko": "분류군 색",
    "en": "Taxon colors",
    "th": "สีกลุ่ม"
  },
  "분류군의 단색·그라데이션 배경": {
    "ko": "분류군의 단색·그라데이션 배경",
    "en": "Solid and gradient taxon backgrounds",
    "th": "พื้นหลังกลุ่มแบบสีทึบและไล่สี"
  },
  "배경색": {
    "ko": "배경색",
    "en": "Background",
    "th": "พื้นหลัง"
  },
  "글꼴": {
    "ko": "글꼴",
    "en": "Font",
    "th": "แบบอักษร"
  },
  "실행 취소": {
    "ko": "실행 취소",
    "en": "Undo",
    "th": "เลิกทำ"
  },
  "실행 취소 (Ctrl+Z)": {
    "ko": "실행 취소 (Ctrl+Z)",
    "en": "Undo (Ctrl+Z)",
    "th": "เลิกทำ (Ctrl+Z)"
  },
  "다시 실행": {
    "ko": "다시 실행",
    "en": "Redo",
    "th": "ทำซ้ำ"
  },
  "다시 실행 (Ctrl+Shift+Z)": {
    "ko": "다시 실행 (Ctrl+Shift+Z)",
    "en": "Redo (Ctrl+Shift+Z)",
    "th": "ทำซ้ำ (Ctrl+Shift+Z)"
  },
  "프로젝트 파일 저장": {
    "ko": "프로젝트 파일 저장",
    "en": "Save project file",
    "th": "บันทึกไฟล์โครงการ"
  },
  "프로젝트 파일 저장 (Ctrl+S)": {
    "ko": "프로젝트 파일 저장 (Ctrl+S)",
    "en": "Save project file (Ctrl+S)",
    "th": "บันทึกไฟล์โครงการ (Ctrl+S)"
  },
  "선택 노드 설정": {
    "ko": "선택 노드 설정",
    "en": "Selected node settings",
    "th": "ตั้งค่าโหนดที่เลือก"
  },
  "예제 데이터": {
    "ko": "예제 데이터",
    "en": "Example data",
    "th": "ข้อมูลตัวอย่าง"
  },
  "노드를 선택하고, 분기군을 원하는 크기로 접어 보세요.": {
    "ko": "노드를 선택하고, 분기군을 원하는 크기로 접어 보세요.",
    "en": "Select a node and resize its collapsed clade.",
    "th": "เลือกโหนดแล้วปรับขนาดกลุ่มที่ยุบได้ตามต้องการ"
  },
  "계통수. 노드를 클릭해 선택합니다. 배경을 끌어 이동하고 마우스 휠로 확대합니다.": {
    "ko": "계통수. 노드를 클릭해 선택합니다. 배경을 끌어 이동하고 마우스 휠로 확대합니다.",
    "en": "Phylogenetic tree. Click a node to select it. Drag the background to pan and use the mouse wheel to zoom.",
    "th": "ทรีสายวิวัฒนาการ คลิกโหนดเพื่อเลือก ลากพื้นหลังเพื่อเลื่อน และใช้ล้อเมาส์เพื่อซูม"
  },
  "편집 가능한 계통수": {
    "ko": "편집 가능한 계통수",
    "en": "Editable phylogenetic tree",
    "th": "ทรีสายวิวัฒนาการที่แก้ไขได้"
  },
  "트리 파일을 여기에 놓으세요": {
    "ko": "트리 파일을 여기에 놓으세요",
    "en": "Drop a tree file here",
    "th": "วางไฟล์ทรีที่นี่"
  },
  "클릭 선택": {
    "ko": "클릭 선택",
    "en": "Click to select",
    "th": "คลิกเพื่อเลือก"
  },
  "더블클릭 접기 / 펼치기": {
    "ko": "더블클릭 접기 / 펼치기",
    "en": "Double-click to collapse / expand",
    "th": "ดับเบิลคลิกเพื่อยุบ / ขยาย"
  },
  "드래그 이동": {
    "ko": "드래그 이동",
    "en": "Drag to pan",
    "th": "ลากเพื่อเลื่อน"
  },
  "축소": {
    "ko": "축소",
    "en": "Zoom out",
    "th": "ย่อ"
  },
  "확대": {
    "ko": "확대",
    "en": "Zoom in",
    "th": "ขยาย"
  },
  "화면에 맞추기 (F)": {
    "ko": "화면에 맞추기 (F)",
    "en": "Fit to view (F)",
    "th": "พอดีหน้าจอ (F)"
  },
  "화면에 맞추기": {
    "ko": "화면에 맞추기",
    "en": "Fit to view",
    "th": "พอดีหน้าจอ"
  },
  "선택 노드 편집": {
    "ko": "선택 노드 편집",
    "en": "Edit selected node",
    "th": "แก้ไขโหนดที่เลือก"
  },
  "선택 노드": {
    "ko": "선택 노드",
    "en": "Selected node",
    "th": "โหนดที่เลือก"
  },
  "COLLAPSED CLADE": {
    "ko": "COLLAPSED CLADE",
    "en": "COLLAPSED CLADE",
    "th": "กลุ่มที่ยุบ"
  },
  "노드를 선택하세요": {
    "ko": "노드를 선택하세요",
    "en": "Select a node",
    "th": "เลือกโหนด"
  },
  "트리의 분기점, 가지, 라벨을 클릭하면 여기에서 편집할 수 있습니다.": {
    "ko": "트리의 분기점, 가지, 라벨을 클릭하면 여기에서 편집할 수 있습니다.",
    "en": "Click a branch point, branch, or label to edit it here.",
    "th": "คลิกจุดแตกกิ่ง กิ่ง หรือป้ายชื่อ เพื่อแก้ไขที่นี่"
  },
  "분기군 펼치기": {
    "ko": "분기군 펼치기",
    "en": "Expand clade",
    "th": "ขยายกลุ่ม"
  },
  "이 분류군을 기준으로 재루팅": {
    "ko": "이 분류군을 기준으로 재루팅",
    "en": "Reroot using this clade",
    "th": "กำหนดรากใหม่โดยอิงกลุ่มนี้"
  },
  "접힌 도형 크기": {
    "ko": "접힌 도형 크기",
    "en": "Collapsed shape size",
    "th": "ขนาดรูปทรงที่ยุบ"
  },
  "이 노드만": {
    "ko": "이 노드만",
    "en": "This node only",
    "th": "เฉพาะโหนดนี้"
  },
  "4 tips": {
    "ko": "4 tips",
    "en": "4 tips",
    "th": "4 โหนดปลาย"
  },
  "꼭짓점의 핸들을 끌어 조절할 수 있습니다.": {
    "ko": "꼭짓점의 핸들을 끌어 조절할 수 있습니다.",
    "en": "Drag the corner handles to resize.",
    "th": "ลากจุดปรับขนาดที่มุมเพื่อปรับขนาด"
  },
  "접기 전 분기군 폭에 맞추기": {
    "ko": "접기 전 분기군 폭에 맞추기",
    "en": "Match original clade width",
    "th": "ใช้ความกว้างเดิมก่อนยุบ"
  },
  "가로 폭": {
    "ko": "가로 폭",
    "en": "Width",
    "th": "ความกว้าง"
  },
  "선택 노드 가로 폭": {
    "ko": "선택 노드 가로 폭",
    "en": "Selected node width",
    "th": "ความกว้างโหนดที่เลือก"
  },
  "세로 높이": {
    "ko": "세로 높이",
    "en": "Height",
    "th": "ความสูง"
  },
  "선택 노드 세로 높이": {
    "ko": "선택 노드 세로 높이",
    "en": "Selected node height",
    "th": "ความสูงโหนดที่เลือก"
  },
  "작게": {
    "ko": "작게",
    "en": "Smaller",
    "th": "เล็กลง"
  },
  "크게": {
    "ko": "크게",
    "en": "Larger",
    "th": "ใหญ่ขึ้น"
  },
  "원본 분기군의 가로 폭으로 복원": {
    "ko": "원본 분기군의 가로 폭으로 복원",
    "en": "Restore the original clade width",
    "th": "คืนค่าความกว้างเดิมของกลุ่ม"
  },
  "원래 폭": {
    "ko": "원래 폭",
    "en": "Original width",
    "th": "ความกว้างเดิม"
  },
  "도형": {
    "ko": "도형",
    "en": "Shape",
    "th": "รูปทรง"
  },
  "삼각형": {
    "ko": "삼각형",
    "en": "Triangle",
    "th": "สามเหลี่ยม"
  },
  "사각형": {
    "ko": "사각형",
    "en": "Rectangle",
    "th": "สี่เหลี่ยม"
  },
  "타원": {
    "ko": "타원",
    "en": "Ellipse",
    "th": "วงรี"
  },
  "폭은 분기점부터 가장 먼 하위 말단까지 맞춥니다. 라벨은 제외합니다. 직접 폭을 바꾸면 수동 모드로 전환됩니다.": {
    "ko": "폭은 분기점부터 가장 먼 하위 말단까지 맞춥니다. 라벨은 제외합니다. 직접 폭을 바꾸면 수동 모드로 전환됩니다.",
    "en": "Width spans from this branch point to its farthest descendant tip, excluding labels. Editing the width switches to manual sizing.",
    "th": "ความกว้างวัดจากจุดแตกกิ่งนี้ถึงโหนดปลายที่ไกลที่สุด ไม่รวมป้ายชื่อ หากแก้ไขความกว้างจะเปลี่ยนเป็นการปรับด้วยตนเอง"
  },
  "부트스트랩 위치": {
    "ko": "부트스트랩 위치",
    "en": "Bootstrap position",
    "th": "ตำแหน่งค่าบูตสแตรป"
  },
  "트리에서 지지도를 직접 끌어 이동할 수 있습니다. X는 오른쪽, Y는 아래쪽이 +입니다.": {
    "ko": "트리에서 지지도를 직접 끌어 이동할 수 있습니다. X는 오른쪽, Y는 아래쪽이 +입니다.",
    "en": "Drag support values directly on the tree. Positive X moves right; positive Y moves down.",
    "th": "ลากค่าสนับสนุนบนทรีได้โดยตรง ค่า X บวกเลื่อนไปทางขวา ค่า Y บวกเลื่อนลง"
  },
  "부트스트랩 가로 이동": {
    "ko": "부트스트랩 가로 이동",
    "en": "Bootstrap horizontal offset",
    "th": "เลื่อนค่าบูตสแตรปแนวนอน"
  },
  "부트스트랩 세로 이동": {
    "ko": "부트스트랩 세로 이동",
    "en": "Bootstrap vertical offset",
    "th": "เลื่อนค่าบูตสแตรปแนวตั้ง"
  },
  "기준점 정렬": {
    "ko": "기준점 정렬",
    "en": "Text anchor",
    "th": "จุดยึดข้อความ"
  },
  "오른쪽": {
    "ko": "오른쪽",
    "en": "Right",
    "th": "ขวา"
  },
  "가운데": {
    "ko": "가운데",
    "en": "Center",
    "th": "กึ่งกลาง"
  },
  "왼쪽": {
    "ko": "왼쪽",
    "en": "Left",
    "th": "ซ้าย"
  },
  "기본 위치로 복원": {
    "ko": "기본 위치로 복원",
    "en": "Reset position",
    "th": "คืนค่าตำแหน่งเริ่มต้น"
  },
  "표시 설정에서 내부 노드 라벨·지지도를 켜면 위치를 확인할 수 있습니다.": {
    "ko": "표시 설정에서 내부 노드 라벨·지지도를 켜면 위치를 확인할 수 있습니다.",
    "en": "Enable internal labels / support values in Display to see their positions.",
    "th": "เปิดป้ายชื่อโหนดภายใน / ค่าสนับสนุนในเมนูการแสดงผล เพื่อดูตำแหน่ง"
  },
  "라벨과 스타일": {
    "ko": "라벨과 스타일",
    "en": "Label and style",
    "th": "ป้ายชื่อและรูปแบบ"
  },
  "표시 라벨": {
    "ko": "표시 라벨",
    "en": "Display label",
    "th": "ป้ายชื่อที่แสดง"
  },
  "기본 라벨 사용": {
    "ko": "기본 라벨 사용",
    "en": "Use default label",
    "th": "ใช้ป้ายชื่อเริ่มต้น"
  },
  "글자 크기": {
    "ko": "글자 크기",
    "en": "Font size",
    "th": "ขนาดตัวอักษร"
  },
  "이탤릭체 범위": {
    "ko": "이탤릭체 범위",
    "en": "Italic range",
    "th": "ช่วงตัวเอียง"
  },
  "기본 설정 따르기": {
    "ko": "기본 설정 따르기",
    "en": "Use default setting",
    "th": "ใช้ค่าเริ่มต้น"
  },
  "학명만 · 자동 인식": {
    "ko": "학명만 · 자동 인식",
    "en": "Scientific name only · Auto",
    "th": "เฉพาะชื่อวิทยาศาสตร์ · อัตโนมัติ"
  },
  "선택한 글자만": {
    "ko": "선택한 글자만",
    "en": "Selected text only",
    "th": "เฉพาะข้อความที่เลือก"
  },
  "라벨 전체": {
    "ko": "라벨 전체",
    "en": "Entire label",
    "th": "ป้ายชื่อทั้งหมด"
  },
  "사용 안 함": {
    "ko": "사용 안 함",
    "en": "None",
    "th": "ไม่ใช้"
  },
  "선택 부분 적용": {
    "ko": "선택 부분 적용",
    "en": "Apply to selection",
    "th": "ใช้กับข้อความที่เลือก"
  },
  "모두 해제": {
    "ko": "모두 해제",
    "en": "Clear all italics",
    "th": "ล้างตัวเอียงทั้งหมด"
  },
  "위 라벨 입력칸에서 학명 부분을 드래그해 선택한 뒤 적용하십시오. 자동 인식은 표기 패턴을 사용하므로 직접 수정할 수 있습니다.": {
    "ko": "위 라벨 입력칸에서 학명 부분을 드래그해 선택한 뒤 적용하십시오. 자동 인식은 표기 패턴을 사용하므로 직접 수정할 수 있습니다.",
    "en": "Select the scientific name in the label field above, then apply italics. Automatic detection uses name patterns and can be overridden manually.",
    "th": "เลือกชื่อวิทยาศาสตร์ในช่องป้ายชื่อด้านบน แล้วใช้ตัวเอียง การตรวจจับอัตโนมัติอิงรูปแบบชื่อและสามารถแก้ไขเองได้"
  },
  "라벨 서식 미리보기": {
    "ko": "라벨 서식 미리보기",
    "en": "Label formatting preview",
    "th": "ตัวอย่างรูปแบบป้ายชื่อ"
  },
  "가지·테두리": {
    "ko": "가지·테두리",
    "en": "Branch / outline",
    "th": "กิ่ง / เส้นขอบ"
  },
  "도형 채우기": {
    "ko": "도형 채우기",
    "en": "Shape fill",
    "th": "สีเติมรูปทรง"
  },
  "색상 프리셋": {
    "ko": "색상 프리셋",
    "en": "Color presets",
    "th": "ชุดสี"
  },
  "초록색": {
    "ko": "초록색",
    "en": "Green",
    "th": "เขียว"
  },
  "파란색": {
    "ko": "파란색",
    "en": "Blue",
    "th": "น้ำเงิน"
  },
  "보라색": {
    "ko": "보라색",
    "en": "Purple",
    "th": "ม่วง"
  },
  "황갈색": {
    "ko": "황갈색",
    "en": "Ochre",
    "th": "น้ำตาลเหลือง"
  },
  "분홍색": {
    "ko": "분홍색",
    "en": "Pink",
    "th": "ชมพู"
  },
  "회색": {
    "ko": "회색",
    "en": "Gray",
    "th": "เทา"
  },
  "이 색상을 하위 가지에도 적용": {
    "ko": "이 색상을 하위 가지에도 적용",
    "en": "Apply this color to descendant branches",
    "th": "ใช้สีนี้กับกิ่งลูกทั้งหมด"
  },
  "선택 분류군에 색 띠 추가": {
    "ko": "선택 분류군에 색 띠 추가",
    "en": "Add color bar to selected taxon",
    "th": "เพิ่มแถบสีให้กลุ่มที่เลือก"
  },
  "선택 분류군에 배경색 추가": {
    "ko": "선택 분류군에 배경색 추가",
    "en": "Add background to selected taxon",
    "th": "เพิ่มพื้นหลังให้กลุ่มที่เลือก"
  },
  "원본 노드 라벨": {
    "ko": "원본 노드 라벨",
    "en": "Original node label",
    "th": "ป้ายชื่อโหนดเดิม"
  },
  "들어오는 가지 길이": {
    "ko": "들어오는 가지 길이",
    "en": "Incoming branch length",
    "th": "ความยาวกิ่งก่อนถึงโหนด"
  },
  "노드 ID": {
    "ko": "노드 ID",
    "en": "Node ID",
    "th": "รหัสโหนด"
  },
  "접힌 하위 노드도 그대로 보존됩니다.": {
    "ko": "접힌 하위 노드도 그대로 보존됩니다.",
    "en": "All collapsed descendants are preserved.",
    "th": "โหนดลูกทั้งหมดในกลุ่มที่ยุบยังคงอยู่"
  },
  "현재 브라우저에 자동 저장": {
    "ko": "현재 브라우저에 자동 저장",
    "en": "Autosave in this browser",
    "th": "บันทึกอัตโนมัติในเบราว์เซอร์นี้"
  },
  "iTOL에서 영감을 받은 독립 편집기 ↗": {
    "ko": "iTOL에서 영감을 받은 독립 편집기 ↗",
    "en": "Independent editor inspired by iTOL ↗",
    "th": "เครื่องมืออิสระที่ได้รับแรงบันดาลใจจาก iTOL ↗"
  },
  "TAXON ANNOTATIONS": {
    "ko": "TAXON ANNOTATIONS",
    "en": "TAXON ANNOTATIONS",
    "th": "คำอธิบายกลุ่มอนุกรมวิธาน"
  },
  "분류군 색 띠·배경": {
    "ko": "분류군 색 띠·배경",
    "en": "Taxon color bars and backgrounds",
    "th": "แถบสีและพื้นหลังกลุ่มอนุกรมวิธาน"
  },
  "닫기": {
    "ko": "닫기",
    "en": "Close",
    "th": "ปิด"
  },
  "색 띠와 배경을 각각 켜거나 함께 사용할 수 있습니다. 분류군마다 다른 색과 진하기를 지정하십시오.": {
    "ko": "색 띠와 배경을 각각 켜거나 함께 사용할 수 있습니다. 분류군마다 다른 색과 진하기를 지정하십시오.",
    "en": "Use color bars and backgrounds separately or together. Set a different color and opacity for each taxon.",
    "th": "ใช้แถบสีและพื้นหลังแยกกันหรือร่วมกันได้ กำหนดสีและความทึบแยกตามกลุ่ม"
  },
  "분류군 목록": {
    "ko": "분류군 목록",
    "en": "Taxon list",
    "th": "รายการกลุ่ม"
  },
  "+ 새 분류군": {
    "ko": "+ 새 분류군",
    "en": "+ New taxon",
    "th": "+ กลุ่มใหม่"
  },
  "목록의 체크를 해제하면 숨깁니다. 겹치는 범위는 별도 열에 표시합니다.": {
    "ko": "목록의 체크를 해제하면 숨깁니다. 겹치는 범위는 별도 열에 표시합니다.",
    "en": "Uncheck an item to hide it. Overlapping ranges use separate columns.",
    "th": "ยกเลิกเครื่องหมายถูกเพื่อซ่อนรายการ ขอบเขตที่ซ้อนกันจะแสดงแยกคอลัมน์"
  },
  "분류군 표시 설정": {
    "ko": "분류군 표시 설정",
    "en": "Taxon display settings",
    "th": "ตั้งค่าการแสดงกลุ่ม"
  },
  "새 분류군": {
    "ko": "새 분류군",
    "en": "New taxon",
    "th": "กลุ่มใหม่"
  },
  "분류군 이름": {
    "ko": "분류군 이름",
    "en": "Taxon name",
    "th": "ชื่อกลุ่มอนุกรมวิธาน"
  },
  "줄바꿈 가능": {
    "ko": "줄바꿈 가능",
    "en": "Line breaks allowed",
    "th": "ขึ้นบรรทัดใหม่ได้"
  },
  "적용 대상": {
    "ko": "적용 대상",
    "en": "Apply to",
    "th": "นำไปใช้กับ"
  },
  "기존 대상 유지": {
    "ko": "기존 대상 유지",
    "en": "Keep existing targets",
    "th": "คงเป้าหมายเดิม"
  },
  "선택 노드와 모든 하위 말단": {
    "ko": "선택 노드와 모든 하위 말단",
    "en": "Selected node and all descendant tips",
    "th": "โหนดที่เลือกและโหนดปลายลูกทั้งหมด"
  },
  "라벨 검색 · 일치하는 말단만": {
    "ko": "라벨 검색 · 일치하는 말단만",
    "en": "Label search · Matching tips only",
    "th": "ค้นหาป้ายชื่อ · เฉพาะโหนดปลายที่ตรงกัน"
  },
  "포함할 문자열": {
    "ko": "포함할 문자열",
    "en": "Text to match",
    "th": "ข้อความที่ต้องการค้นหา"
  },
  "대소문자 구분 없음": {
    "ko": "대소문자 구분 없음",
    "en": "Case-insensitive",
    "th": "ไม่แยกตัวพิมพ์ใหญ่และเล็ก"
  },
  "예: Chilobrachys 또는 natanicharum": {
    "ko": "예: Chilobrachys 또는 natanicharum",
    "en": "For example: Chilobrachys or natanicharum",
    "th": "ตัวอย่าง: Chilobrachys หรือ natanicharum"
  },
  "분류군 색 HEX": {
    "ko": "분류군 색 HEX",
    "en": "Taxon color HEX",
    "th": "สีของกลุ่มแบบ HEX"
  },
  "분류군 색상 프리셋": {
    "ko": "분류군 색상 프리셋",
    "en": "Taxon color presets",
    "th": "ชุดสีของกลุ่ม"
  },
  "파랑": {
    "ko": "파랑",
    "en": "Blue",
    "th": "น้ำเงิน"
  },
  "적갈색": {
    "ko": "적갈색",
    "en": "Rust",
    "th": "น้ำตาลแดง"
  },
  "초록": {
    "ko": "초록",
    "en": "Green",
    "th": "เขียว"
  },
  "보라": {
    "ko": "보라",
    "en": "Purple",
    "th": "ม่วง"
  },
  "자주": {
    "ko": "자주",
    "en": "Magenta",
    "th": "ม่วงแดง"
  },
  "검정": {
    "ko": "검정",
    "en": "Black",
    "th": "ดำ"
  },
  "오른쪽 색 띠": {
    "ko": "오른쪽 색 띠",
    "en": "Color bar on the right",
    "th": "แถบสีด้านขวา"
  },
  "말단 라벨 색": {
    "ko": "말단 라벨 색",
    "en": "Tip label color",
    "th": "สีป้ายชื่อโหนดปลาย"
  },
  "가지·도형 테두리 색": {
    "ko": "가지·도형 테두리 색",
    "en": "Branch / shape outline color",
    "th": "สีกิ่ง / เส้นขอบรูปทรง"
  },
  "분류군 이름의 학명만 기울임": {
    "ko": "분류군 이름의 학명만 기울임",
    "en": "Italicize scientific names in taxon names",
    "th": "ทำเฉพาะชื่อวิทยาศาสตร์ในชื่อกลุ่มเป็นตัวเอียง"
  },
  "띠 너비": {
    "ko": "띠 너비",
    "en": "Bar width",
    "th": "ความกว้างแถบ"
  },
  "이름 크기": {
    "ko": "이름 크기",
    "en": "Name size",
    "th": "ขนาดชื่อ"
  },
  "배경색 설정": {
    "ko": "배경색 설정",
    "en": "Background settings",
    "th": "ตั้งค่าพื้นหลัง"
  },
  "분류군 배경색": {
    "ko": "분류군 배경색",
    "en": "Taxon background",
    "th": "พื้นหลังกลุ่ม"
  },
  "그림처럼 그라데이션": {
    "ko": "그림처럼 그라데이션",
    "en": "Apply reference-style gradient",
    "th": "ใช้พื้นหลังไล่สีตามแบบ"
  },
  "왼쪽은 투명하게, 오른쪽으로 갈수록 색이 진해집니다. 색 띠의 표시 여부는 그대로 유지합니다.": {
    "ko": "왼쪽은 투명하게, 오른쪽으로 갈수록 색이 진해집니다. 색 띠의 표시 여부는 그대로 유지합니다.",
    "en": "Transparent on the left, stronger color toward the right. Keeps the current color bar visibility.",
    "th": "โปร่งใสด้านซ้ายและสีเข้มขึ้นทางขวา คงการตั้งค่าการแสดงแถบสีเดิม"
  },
  "배경 표현": {
    "ko": "배경 표현",
    "en": "Background style",
    "th": "รูปแบบพื้นหลัง"
  },
  "단색": {
    "ko": "단색",
    "en": "Solid",
    "th": "สีทึบ"
  },
  "그라데이션 · 왼쪽 → 오른쪽": {
    "ko": "그라데이션 · 왼쪽 → 오른쪽",
    "en": "Gradient · Left → Right",
    "th": "ไล่สี · ซ้าย → ขวา"
  },
  "배경 범위": {
    "ko": "배경 범위",
    "en": "Background range",
    "th": "ขอบเขตพื้นหลัง"
  },
  "말단 라벨부터": {
    "ko": "말단 라벨부터",
    "en": "From tip labels",
    "th": "เริ่มจากป้ายชื่อโหนดปลาย"
  },
  "트리 전체 너비": {
    "ko": "트리 전체 너비",
    "en": "Full tree width",
    "th": "ความกว้างทรีทั้งหมด"
  },
  "오른쪽 분류군 이름 영역": {
    "ko": "오른쪽 분류군 이름 영역",
    "en": "Taxon name area on the right",
    "th": "พื้นที่ชื่อกลุ่มด้านขวา"
  },
  "분류군 색과 같은 배경색 사용": {
    "ko": "분류군 색과 같은 배경색 사용",
    "en": "Use taxon color for background",
    "th": "ใช้สีของกลุ่มเป็นสีพื้นหลัง"
  },
  "배경색 HEX": {
    "ko": "배경색 HEX",
    "en": "Background color HEX",
    "th": "สีพื้นหลังแบบ HEX"
  },
  "배경 진하기": {
    "ko": "배경 진하기",
    "en": "Background opacity",
    "th": "ความทึบพื้นหลัง"
  },
  "오른쪽 영역 최소 폭": {
    "ko": "오른쪽 영역 최소 폭",
    "en": "Minimum right-area width",
    "th": "ความกว้างขั้นต่ำของพื้นที่ด้านขวา"
  },
  "px · 0이면 자동": {
    "ko": "px · 0이면 자동",
    "en": "px · 0 = Auto",
    "th": "px · 0 = อัตโนมัติ"
  },
  "분류군 이름 위치": {
    "ko": "분류군 이름 위치",
    "en": "Taxon name position",
    "th": "ตำแหน่งชื่อกลุ่ม"
  },
  "왼쪽 정렬": {
    "ko": "왼쪽 정렬",
    "en": "Left aligned",
    "th": "ชิดซ้าย"
  },
  "영역 가운데": {
    "ko": "영역 가운데",
    "en": "Centered in area",
    "th": "กึ่งกลางพื้นที่"
  },
  "분류군 배경 미리보기": {
    "ko": "분류군 배경 미리보기",
    "en": "Taxon background preview",
    "th": "ตัวอย่างพื้นหลังกลุ่ม"
  },
  "색 띠·범위 배경은 직각 보기에서 표시됩니다. 부트스트랩은 항상 검정으로 유지합니다. 서로 떨어진 말단은 연속된 구간별로 표시하며, 접힌 도형 일부만 해당하면 펼쳐야 범위를 볼 수 있습니다.": {
    "ko": "색 띠·범위 배경은 직각 보기에서 표시됩니다. 부트스트랩은 항상 검정으로 유지합니다. 서로 떨어진 말단은 연속된 구간별로 표시하며, 접힌 도형 일부만 해당하면 펼쳐야 범위를 볼 수 있습니다.",
    "en": "Bars and backgrounds appear in rectangular view. Support values stay black. Separated tips are shown as separate contiguous ranges. Expand a collapsed shape if only some of its tips belong to the taxon.",
    "th": "แถบสีและพื้นหลังแสดงในมุมมองสี่เหลี่ยม ค่าสนับสนุนคงเป็นสีดำ โหนดปลายที่อยู่ห่างกันจะแสดงเป็นช่วงต่อเนื่องแยกกัน หากกลุ่มครอบคลุมเพียงบางโหนดปลายในรูปทรงที่ยุบ ให้ขยายรูปทรงนั้นก่อน"
  },
  "분류군 표시 삭제": {
    "ko": "분류군 표시 삭제",
    "en": "Delete taxon annotation",
    "th": "ลบคำอธิบายกลุ่ม"
  },
  "적용하고 닫기": {
    "ko": "적용하고 닫기",
    "en": "Apply and close",
    "th": "ใช้และปิด"
  },
  "START WITH YOUR TREE": {
    "ko": "START WITH YOUR TREE",
    "en": "START WITH YOUR TREE",
    "th": "เริ่มด้วยทรีของคุณ"
  },
  "트리 불러오기": {
    "ko": "트리 불러오기",
    "en": "Import tree",
    "th": "นำเข้าทรี"
  },
  "파일을 선택하거나 화면에 끌어 놓으세요": {
    "ko": "파일을 선택하거나 화면에 끌어 놓으세요",
    "en": "Choose a file or drop it onto the workspace",
    "th": "เลือกไฟล์หรือลากมาวางในพื้นที่ทำงาน"
  },
  "파일당 최대 8 MB · 노드 10,000개 · 브라우저에서 처리": {
    "ko": "파일당 최대 8 MB · 노드 10,000개 · 브라우저에서 처리",
    "en": "Up to 8 MB per file · 10,000 nodes · Processed in your browser",
    "th": "สูงสุด 8 MB ต่อไฟล์ · 10,000 โหนด · ประมวลผลในเบราว์เซอร์"
  },
  "또는 Newick / NEXUS 붙여넣기": {
    "ko": "또는 Newick / NEXUS 붙여넣기",
    "en": "Or paste Newick / NEXUS",
    "th": "หรือวางข้อความ Newick / NEXUS"
  },
  "Newick 또는 NEXUS 입력": {
    "ko": "Newick 또는 NEXUS 입력",
    "en": "Newick or NEXUS input",
    "th": "ข้อมูล Newick หรือ NEXUS"
  },
  "현재 작업은 새 트리로 교체됩니다. 편집 내용을 보관하려면 먼저 프로젝트 파일을 저장하세요.": {
    "ko": "현재 작업은 새 트리로 교체됩니다. 편집 내용을 보관하려면 먼저 프로젝트 파일을 저장하세요.",
    "en": "The new tree replaces your current work. Save a project file first if you want to keep your edits.",
    "th": "ทรีใหม่จะแทนที่งานปัจจุบัน หากต้องการเก็บการแก้ไข โปรดบันทึกไฟล์โครงการก่อน"
  },
  "현재 프로젝트 저장": {
    "ko": "현재 프로젝트 저장",
    "en": "Save current project",
    "th": "บันทึกโครงการปัจจุบัน"
  },
  "텍스트 불러오기": {
    "ko": "텍스트 불러오기",
    "en": "Import text",
    "th": "นำเข้าข้อความ"
  },
  "MULTIPLE TREES": {
    "ko": "MULTIPLE TREES",
    "en": "MULTIPLE TREES",
    "th": "มีหลายทรี"
  },
  "편집할 트리 선택": {
    "ko": "편집할 트리 선택",
    "en": "Choose a tree to edit",
    "th": "เลือกทรีที่ต้องการแก้ไข"
  },
  "파일에 여러 트리가 있습니다. 한 번에 하나의 트리를 편집할 수 있습니다.": {
    "ko": "파일에 여러 트리가 있습니다. 한 번에 하나의 트리를 편집할 수 있습니다.",
    "en": "This file contains multiple trees. You can edit one tree at a time.",
    "th": "ไฟล์นี้มีหลายทรี สามารถแก้ไขได้ครั้งละหนึ่งทรี"
  },
  "TAKE YOUR WORK WITH YOU": {
    "ko": "TAKE YOUR WORK WITH YOU",
    "en": "TAKE YOUR WORK WITH YOU",
    "th": "บันทึกผลงานของคุณ"
  },
  "벡터 이미지": {
    "ko": "벡터 이미지",
    "en": "Vector image",
    "th": "ภาพเวกเตอร์"
  },
  "논문 그림 · 확대해도 선명하게": {
    "ko": "논문 그림 · 확대해도 선명하게",
    "en": "Publication figures · Sharp at any scale",
    "th": "ภาพสำหรับตีพิมพ์ · คมชัดทุกขนาด"
  },
  "Illustrator / Inkscape에서 편집": {
    "ko": "Illustrator / Inkscape에서 편집",
    "en": "Edit in Illustrator / Inkscape",
    "th": "แก้ไขใน Illustrator / Inkscape"
  },
  "다운로드 ↗": {
    "ko": "다운로드 ↗",
    "en": "Download ↗",
    "th": "ดาวน์โหลด ↗"
  },
  "고해상도 이미지": {
    "ko": "고해상도 이미지",
    "en": "High-resolution image",
    "th": "ภาพความละเอียดสูง"
  },
  "흰색 배경 · 기본 3배 해상도": {
    "ko": "흰색 배경 · 기본 3배 해상도",
    "en": "White background · Default 3× resolution",
    "th": "พื้นหลังสีขาว · ความละเอียดเริ่มต้น 3 เท่า"
  },
  "화면의 스타일 그대로 저장": {
    "ko": "화면의 스타일 그대로 저장",
    "en": "Preserves the displayed style",
    "th": "คงรูปแบบที่แสดงบนหน้าจอ"
  },
  "PROJECT": {
    "ko": "PROJECT",
    "en": "PROJECT",
    "th": "โครงการ"
  },
  "편집 프로젝트": {
    "ko": "편집 프로젝트",
    "en": "Editable project",
    "th": "โครงการที่แก้ไขต่อได้"
  },
  "트리·접기·개별 크기·스타일 보존": {
    "ko": "트리·접기·개별 크기·스타일 보존",
    "en": "Keeps tree, collapsed nodes, sizes, and styles",
    "th": "เก็บทรี สถานะยุบ ขนาด และรูปแบบ"
  },
  "다시 불러와 이어서 편집": {
    "ko": "다시 불러와 이어서 편집",
    "en": "Import again to continue editing",
    "th": "นำเข้าภายหลังเพื่อแก้ไขต่อ"
  },
  "트리 데이터": {
    "ko": "트리 데이터",
    "en": "Tree data",
    "th": "ข้อมูลทรี"
  },
  "현재 루트·말단·가지 길이·순서": {
    "ko": "현재 루트·말단·가지 길이·순서",
    "en": "Current root, tips, lengths, and order",
    "th": "ราก โหนดปลาย ความยาว และลำดับปัจจุบัน"
  },
  "표시 라벨과 스타일은 프로젝트에 보존": {
    "ko": "표시 라벨과 스타일은 프로젝트에 보존",
    "en": "Display labels and styles are kept in the project",
    "th": "ป้ายชื่อที่แสดงและรูปแบบเก็บไว้ในโครงการ"
  },
  "SVG·PNG에는 선택 테두리·조절 핸들·ROOT 안내 표시가 포함되지 않습니다. 재루팅한 방향은 Newick과 프로젝트에도 반영됩니다. 화면에서 접힌 분기군도 Newick에는 전체 하위 노드로 저장됩니다.": {
    "ko": "SVG·PNG에는 선택 테두리·조절 핸들·ROOT 안내 표시가 포함되지 않습니다. 재루팅한 방향은 Newick과 프로젝트에도 반영됩니다. 화면에서 접힌 분기군도 Newick에는 전체 하위 노드로 저장됩니다.",
    "en": "SVG and PNG omit selection outlines and editing handles. Rerooting is also saved in Newick and project files. Collapsed clades are exported to Newick with all their descendants.",
    "th": "SVG และ PNG ไม่รวมเส้นเลือกและจุดปรับขนาด ตำแหน่งรากใหม่จะบันทึกในไฟล์ Newick และโครงการด้วย กลุ่มที่ยุบจะส่งออกเป็น Newick โดยมีโหนดลูกครบทั้งหมด"
  },
  "A LITTLE FIELD GUIDE": {
    "ko": "A LITTLE FIELD GUIDE",
    "en": "A LITTLE FIELD GUIDE",
    "th": "คู่มือฉบับย่อ"
  },
  "작은 분기까지, 원하는 대로": {
    "ko": "작은 분기까지, 원하는 대로",
    "en": "Edit every branch your way",
    "th": "ปรับทุกกิ่งได้ตามต้องการ"
  },
  "트리 파일을 불러옵니다.": {
    "ko": "트리 파일을 불러옵니다.",
    "en": "Import a tree file.",
    "th": "นำเข้าไฟล์ทรี"
  },
  "Newick, IQ-TREE의 .treefile / .contree, NEXUS를 지원합니다. 여러 트리가 있으면 선택 창이 표시됩니다.": {
    "ko": "Newick, IQ-TREE의 .treefile / .contree, NEXUS를 지원합니다. 여러 트리가 있으면 선택 창이 표시됩니다.",
    "en": "Supports Newick, IQ-TREE .treefile / .contree, and NEXUS. Files with multiple trees open a selection dialog.",
    "th": "รองรับ Newick, ไฟล์ .treefile / .contree ของ IQ-TREE และ NEXUS หากไฟล์มีหลายทรี จะมีหน้าต่างให้เลือก"
  },
  "분기점을 선택해 접습니다.": {
    "ko": "분기점을 선택해 접습니다.",
    "en": "Select a branch point and collapse it.",
    "th": "เลือกจุดแตกกิ่งแล้วยุบกลุ่ม"
  },
  "내부 노드·가지 또는 왼쪽 목록을 클릭한 후 ‘분기군 접기’를 누릅니다. 더블클릭이나 C 키도 사용할 수 있습니다.": {
    "ko": "내부 노드·가지 또는 왼쪽 목록을 클릭한 후 ‘분기군 접기’를 누릅니다. 더블클릭이나 C 키도 사용할 수 있습니다.",
    "en": "Click an internal node, branch, or item in the left panel, then choose Collapse clade. You can also double-click or press C.",
    "th": "คลิกโหนดภายใน กิ่ง หรือรายการด้านซ้าย แล้วเลือกยุบกลุ่ม หรือดับเบิลคลิกหรือกด C ได้เช่นกัน"
  },
  "선택한 도형만 조절합니다.": {
    "ko": "선택한 도형만 조절합니다.",
    "en": "Resize just the selected shape.",
    "th": "ปรับขนาดเฉพาะรูปทรงที่เลือก"
  },
  "기본 가로 폭은 원래 분기점부터 가장 먼 말단까지 유지합니다. 직접 값을 바꾸거나 핸들을 끌면 해당 도형만 수동 조절할 수 있습니다.": {
    "ko": "기본 가로 폭은 원래 분기점부터 가장 먼 말단까지 유지합니다. 직접 값을 바꾸거나 핸들을 끌면 해당 도형만 수동 조절할 수 있습니다.",
    "en": "The default width spans from the original branch point to its farthest tip. Change a value or drag a handle to resize only that shape manually.",
    "th": "ความกว้างเริ่มต้นวัดจากจุดแตกกิ่งเดิมถึงโหนดปลายที่ไกลที่สุด เปลี่ยนค่าหรือลากจุดปรับขนาดเพื่อปรับเฉพาะรูปทรงนั้นด้วยตนเอง"
  },
  "학명 서식과 부트스트랩 위치를 편집합니다.": {
    "ko": "학명 서식과 부트스트랩 위치를 편집합니다.",
    "en": "Edit scientific-name italics and bootstrap positions.",
    "th": "แก้ไขตัวเอียงชื่อวิทยาศาสตร์และตำแหน่งค่าบูตสแตรป"
  },
  "라벨 입력칸에서 학명만 선택해 이탤릭체를 적용할 수 있습니다. 지지도는 직접 드래그하거나 오른쪽 X·Y 값으로 옮깁니다.": {
    "ko": "라벨 입력칸에서 학명만 선택해 이탤릭체를 적용할 수 있습니다. 지지도는 직접 드래그하거나 오른쪽 X·Y 값으로 옮깁니다.",
    "en": "Select only the scientific name in the label field to italicize it. Drag support values directly or adjust the X and Y offsets in the right panel.",
    "th": "เลือกเฉพาะชื่อวิทยาศาสตร์ในช่องป้ายชื่อเพื่อทำเป็นตัวเอียง ลากค่าสนับสนุนโดยตรงหรือปรับค่า X และ Y ในแผงด้านขวา"
  },
  "분류군별 색을 지정합니다.": {
    "ko": "분류군별 색을 지정합니다.",
    "en": "Assign colors to taxa.",
    "th": "กำหนดสีให้กลุ่มอนุกรมวิธาน"
  },
  "상단 ‘분류군 색’에서 선택한 분기군 또는 라벨 검색 결과에 색 띠·이름·범위 배경을 추가합니다. 체크를 해제해 숨기거나 목록에서 다시 편집할 수 있습니다.": {
    "ko": "상단 ‘분류군 색’에서 선택한 분기군 또는 라벨 검색 결과에 색 띠·이름·범위 배경을 추가합니다. 체크를 해제해 숨기거나 목록에서 다시 편집할 수 있습니다.",
    "en": "Use Taxon colors to add a bar, name, and background for the selected clade or matching tip labels. Uncheck an item to hide it, or select it in the list to edit it again.",
    "th": "ใช้เมนูสีกลุ่มเพื่อเพิ่มแถบสี ชื่อ และพื้นหลังให้กลุ่มที่เลือกหรือโหนดปลายที่ตรงกับการค้นหา ยกเลิกเครื่องหมายถูกเพื่อซ่อน หรือเลือกจากรายการเพื่อแก้ไข"
  },
  "선택한 노드로 루트를 변경합니다.": {
    "ko": "선택한 노드로 루트를 변경합니다.",
    "en": "Reroot using a selected node.",
    "th": "กำหนดรากใหม่โดยอิงโหนดที่เลือก"
  },
  "노드를 클릭한 뒤 상단 ‘루트 지정’ 또는 오른쪽 ‘이 분류군을 기준으로 재루팅’을 누릅니다. 내부 노드와 말단 모두 선택한 노드로 들어오는 가지 중간에 새 루트를 놓아, 선택 분류군과 나머지 트리를 분리합니다. 선택 분류군을 위쪽에 두고 나머지는 작은 분기군부터 정렬하며 라벨을 오른쪽에 맞춥니다. 왼쪽 ‘iTOL식 분기군 정렬’로 말단 수가 적은 분기군을 위쪽에 정렬할 수 있습니다. 수치형 부트스트랩은 해당 가지를 따라 이동합니다. 하위 말단 구성이 바뀐 접힌 노드는 펼치며 분류군 색은 원래 지정한 말단에 유지합니다. Ctrl+Z로 되돌릴 수 있습니다.": {
    "ko": "노드를 클릭한 뒤 상단 ‘루트 지정’ 또는 오른쪽 ‘이 분류군을 기준으로 재루팅’을 누릅니다. 내부 노드와 말단 모두 선택한 노드로 들어오는 가지 중간에 새 루트를 놓아, 선택 분류군과 나머지 트리를 분리합니다. 선택 분류군을 위쪽에 두고 나머지는 작은 분기군부터 정렬하며 라벨을 오른쪽에 맞춥니다. 왼쪽 ‘iTOL식 분기군 정렬’로 말단 수가 적은 분기군을 위쪽에 정렬할 수 있습니다. 수치형 부트스트랩은 해당 가지를 따라 이동합니다. 하위 말단 구성이 바뀐 접힌 노드는 펼치며 분류군 색은 원래 지정한 말단에 유지합니다. Ctrl+Z로 되돌릴 수 있습니다.",
    "en": "Select a node and choose Reroot. A new root is placed halfway along its incoming branch, separating the selected clade from the rest. The selected clade is placed first; the remaining clades are sorted by tip count and labels are aligned on the right. Ladderize sorts smaller clades first. Numeric support values stay with their branches. Collapsed nodes whose descendant membership changes are expanded, while taxon colors retain their original tips. Press Ctrl+Z to undo.",
    "th": "เลือกโหนดแล้วกดเปลี่ยนราก รากใหม่จะอยู่กึ่งกลางกิ่งก่อนถึงโหนดนั้น เพื่อแยกกลุ่มที่เลือกออกจากส่วนที่เหลือ กลุ่มที่เลือกจะแสดงก่อน ส่วนอื่นเรียงตามจำนวนโหนดปลาย และจัดป้ายชื่อให้ตรงกันทางขวา การเรียงกลุ่มจะนำกลุ่มเล็กขึ้นก่อน ค่าสนับสนุนตัวเลขจะติดตามกิ่งเดิม โหนดที่ยุบจะขยายหากสมาชิกโหนดปลายเปลี่ยนไป ส่วนสีกลุ่มยังผูกกับโหนดปลายเดิม กด Ctrl+Z เพื่อเลิกทำ"
  },
  "그림과 프로젝트를 저장합니다.": {
    "ko": "그림과 프로젝트를 저장합니다.",
    "en": "Save the figure and project.",
    "th": "บันทึกภาพและโครงการ"
  },
  "SVG는 벡터 편집용, PNG는 이미지용입니다. 편집 상태는 프로젝트 파일에 저장합니다. 자동 저장은 이 브라우저의 마지막 작업 한 개에만 적용됩니다.": {
    "ko": "SVG는 벡터 편집용, PNG는 이미지용입니다. 편집 상태는 프로젝트 파일에 저장합니다. 자동 저장은 이 브라우저의 마지막 작업 한 개에만 적용됩니다. 브라우저 설정이나 HTML 파일 위치에 따라 자동 저장이 제한될 수 있으므로 프로젝트 파일을 따로 저장하십시오.",
    "en": "Use SVG for vector editing and PNG for images. Save editable state as a project file. Autosave keeps only the last project in this browser; browser settings and file location can limit recovery, so save a separate project file.",
    "th": "ใช้ SVG สำหรับแก้ไขเวกเตอร์ และ PNG สำหรับภาพ บันทึกสถานะการแก้ไขเป็นไฟล์โครงการ การบันทึกอัตโนมัติเก็บเฉพาะโครงการล่าสุดในเบราว์เซอร์นี้ การตั้งค่าเบราว์เซอร์และตำแหน่งไฟล์อาจจำกัดการกู้คืน จึงควรบันทึกไฟล์โครงการแยกไว้"
  },
  "접기 / 펼치기": {
    "ko": "접기 / 펼치기",
    "en": "Collapse / expand",
    "th": "ยุบ / ขยาย"
  },
  "하위 순서 뒤집기": {
    "ko": "하위 순서 뒤집기",
    "en": "Reverse child order",
    "th": "กลับลำดับโหนดลูก"
  },
  "선택 노드로 루트 지정": {
    "ko": "선택 노드로 루트 지정",
    "en": "Reroot at selected node",
    "th": "กำหนดรากใหม่โดยอิงโหนดที่เลือก"
  },
  "화면 맞춤": {
    "ko": "화면 맞춤",
    "en": "Fit to view",
    "th": "พอดีหน้าจอ"
  },
  "프로젝트 저장": {
    "ko": "프로젝트 저장",
    "en": "Save project",
    "th": "บันทึกโครงการ"
  },
  "예제의 종명·분기·지지도는 기능 시연용으로 구성한 가상 데이터입니다. 계통관계에 대한 연구 결과가 아닙니다. 이 앱은 iTOL과 별개이며 iTOL 계정에 연결되지 않습니다.": {
    "ko": "예제의 종명·분기·지지도는 기능 시연용으로 구성한 가상 데이터입니다. 계통관계에 대한 연구 결과가 아닙니다. 인터넷 연결이나 설치 없이 이 HTML 파일을 Chrome 또는 Edge에서 열어 사용합니다. 이 앱은 iTOL과 별개이며 iTOL 계정에 연결되지 않습니다.",
    "en": "Example names, branches, and support values are illustrative, not research results. Open this HTML in Chrome or Edge without installation or internet access. Clade Studio is independent of iTOL and does not connect to an iTOL account.",
    "th": "ชื่อ กิ่ง และค่าสนับสนุนในตัวอย่างใช้สาธิตการทำงาน ไม่ใช่ผลการวิจัย เปิด HTML นี้ใน Chrome หรือ Edge ได้โดยไม่ต้องติดตั้งหรือเชื่อมต่ออินเทอร์เน็ต Clade Studio เป็นเครื่องมืออิสระและไม่เชื่อมต่อบัญชี iTOL"
  },
  "실행을 취소했습니다.": {
    "ko": "실행을 취소했습니다.",
    "en": "Action undone.",
    "th": "เลิกทำแล้ว"
  },
  "다시 실행했습니다.": {
    "ko": "다시 실행했습니다.",
    "en": "Action redone.",
    "th": "ทำซ้ำแล้ว"
  },
  "변경 내용 저장 중…": {
    "ko": "변경 내용 저장 중…",
    "en": "Saving changes…",
    "th": "กำลังบันทึกการเปลี่ยนแปลง…"
  },
  "현재 브라우저에 자동 저장됨": {
    "ko": "현재 브라우저에 자동 저장됨",
    "en": "Autosaved in this browser",
    "th": "บันทึกอัตโนมัติในเบราว์เซอร์นี้แล้ว"
  },
  "자동 저장 불가 · 프로젝트 파일로 저장하세요": {
    "ko": "자동 저장 불가 · 프로젝트 파일로 저장하세요",
    "en": "Autosave unavailable · Save a project file",
    "th": "บันทึกอัตโนมัติไม่ได้ · โปรดบันทึกไฟล์โครงการ"
  },
  "하위 노드의 표시 순서를 뒤집었습니다.": {
    "ko": "하위 노드의 표시 순서를 뒤집었습니다.",
    "en": "Reversed the display order of child nodes.",
    "th": "กลับลำดับการแสดงโหนดลูกแล้ว"
  },
  "내 트리": {
    "ko": "내 트리",
    "en": "My tree",
    "th": "ทรีของฉัน"
  },
  "가상 예제 · 실제 계통관계를 나타내지 않습니다.": {
    "ko": "가상 예제 · 실제 계통관계를 나타내지 않습니다.",
    "en": "Illustrative example · Not an inferred phylogeny.",
    "th": "ตัวอย่างสมมติ · ไม่ใช่ผลการวิเคราะห์สายวิวัฒนาการ"
  },
  "도형 크기와 라벨은 오른쪽 패널에서 개별 조절할 수 있습니다.": {
    "ko": "도형 크기와 라벨은 오른쪽 패널에서 개별 조절할 수 있습니다.",
    "en": "Adjust each shape and label in the right panel.",
    "th": "ปรับรูปทรงและป้ายชื่อแต่ละรายการในแผงด้านขวา"
  },
  "양수 가지 길이가 없어 위상 모드로 표시합니다.": {
    "ko": "양수 가지 길이가 없어 위상 모드로 표시합니다.",
    "en": "No positive branch lengths; showing topology instead.",
    "th": "ไม่มีความยาวกิ่งที่เป็นบวก จึงแสดงเฉพาะโครงสร้างการแตกกิ่ง"
  },
  "분류군 색 띠·배경은 직각 보기에서 표시됩니다. 가지·라벨 색은 원형 보기에도 적용됩니다.": {
    "ko": "분류군 색 띠·배경은 직각 보기에서 표시됩니다. 가지·라벨 색은 원형 보기에도 적용됩니다.",
    "en": "Taxon bars and backgrounds appear in rectangular view. Branch and label colors also work in circular view.",
    "th": "แถบสีและพื้นหลังกลุ่มแสดงในมุมมองสี่เหลี่ยม สีกิ่งและป้ายชื่อใช้ในมุมมองวงกลมได้ด้วย"
  },
  "분기군 접기": {
    "ko": "분기군 접기",
    "en": "Collapse clade",
    "th": "ยุบกลุ่ม"
  },
  "일치하는 노드가 없습니다.": {
    "ko": "일치하는 노드가 없습니다.",
    "en": "No matching nodes.",
    "th": "ไม่พบโหนดที่ตรงกัน"
  },
  "처음 250개를 표시합니다. 검색으로 노드를 찾을 수 있습니다.": {
    "ko": "처음 250개를 표시합니다. 검색으로 노드를 찾을 수 있습니다.",
    "en": "Showing the first 250 nodes. Use search to find others.",
    "th": "แสดง 250 โหนดแรก ใช้การค้นหาเพื่อหาโหนดอื่น"
  },
  "하위 분기군 접힘": {
    "ko": "하위 분기군 접힘",
    "en": "Descendants collapsed",
    "th": "โหนดลูกถูกยุบ"
  },
  "내부 노드": {
    "ko": "내부 노드",
    "en": "Internal node",
    "th": "โหนดภายใน"
  },
  "펼치기": {
    "ko": "펼치기",
    "en": "Expand",
    "th": "ขยาย"
  },
  "현재 루트입니다": {
    "ko": "현재 루트입니다",
    "en": "Current root",
    "th": "รากปัจจุบัน"
  },
  "ROOT 표시가 현재 루트입니다. 다른 노드를 선택해 루트를 변경할 수 있습니다.": {
    "ko": "현재 루트입니다. 다른 노드를 선택해 루트를 변경할 수 있습니다.",
    "en": "This is the current root. Select another node to reroot the tree.",
    "th": "นี่คือรากปัจจุบัน เลือกโหนดอื่นเพื่อกำหนดรากใหม่"
  },
  "선택한 노드로 들어오는 가지 중간에 루트를 놓아, 선택 분류군과 나머지 트리를 나눕니다. 선택 분류군은 위쪽에 두고, 나머지는 작은 분기군부터 정렬합니다.": {
    "ko": "선택한 노드로 들어오는 가지 중간에 루트를 놓아, 선택 분류군과 나머지 트리를 나눕니다. 선택 분류군은 위쪽에 두고, 나머지는 작은 분기군부터 정렬합니다.",
    "en": "Place the root halfway along the selected node’s incoming branch. The selected clade appears first; the rest are sorted with smaller clades first.",
    "th": "วางรากกึ่งกลางกิ่งก่อนถึงโหนดที่เลือก กลุ่มที่เลือกจะแสดงก่อน ส่วนที่เหลือเรียงจากกลุ่มเล็กไปใหญ่"
  },
  "자동 맞춤": {
    "ko": "자동 맞춤",
    "en": "Auto fit",
    "th": "ปรับอัตโนมัติ"
  },
  "수동 크기": {
    "ko": "수동 크기",
    "en": "Manual size",
    "th": "ขนาดที่กำหนดเอง"
  },
  "라벨 입력칸에서 기울일 글자부터 선택하십시오.": {
    "ko": "라벨 입력칸에서 기울일 글자부터 선택하십시오.",
    "en": "Select the text to italicize in the label field first.",
    "th": "เลือกข้อความในช่องป้ายชื่อที่ต้องการทำเป็นตัวเอียงก่อน"
  },
  "하위 가지에도 같은 색상을 적용했습니다.": {
    "ko": "하위 가지에도 같은 색상을 적용했습니다.",
    "en": "Applied the same color to descendant branches.",
    "th": "ใช้สีเดียวกันกับกิ่งลูกทั้งหมดแล้ว"
  },
  "말단 수가 적은 분기군을 위로 정렬했습니다. 계통관계와 가지 길이는 유지됩니다.": {
    "ko": "말단 수가 적은 분기군을 위로 정렬했습니다. 계통관계와 가지 길이는 유지됩니다.",
    "en": "Sorted smaller clades first. Topology and branch lengths are preserved.",
    "th": "เรียงกลุ่มเล็กไว้ก่อนแล้ว โครงสร้างการแตกกิ่งและความยาวกิ่งยังคงเดิม"
  },
  "모든 분기군을 펼쳤습니다.": {
    "ko": "모든 분기군을 펼쳤습니다.",
    "en": "Expanded all clades.",
    "th": "ขยายทุกกลุ่มแล้ว"
  },
  "현재 트리를 예제 트리로 교체하시겠습니까? 프로젝트를 저장하지 않은 경우 현재 작업은 실행 취소로 복원할 수 있습니다.": {
    "ko": "현재 트리를 예제 트리로 교체하시겠습니까? 프로젝트를 저장하지 않은 경우 현재 작업은 실행 취소로 복원할 수 있습니다.",
    "en": "Replace the current tree with the example? You can use Undo to restore your current work.",
    "th": "ต้องการแทนที่ทรีปัจจุบันด้วยทรีตัวอย่างหรือไม่? สามารถใช้เลิกทำเพื่อกู้คืนงานปัจจุบันได้"
  },
  " · 분기군을 선택하거나 라벨을 검색하십시오.": {
    "ko": " · 분기군을 선택하거나 라벨을 검색하십시오.",
    "en": " · Select a clade or search labels.",
    "th": " · เลือกกลุ่มหรือค้นหาป้ายชื่อ"
  },
  " 외": {
    "ko": " 외",
    "en": " and more",
    "th": " และอื่น ๆ"
  },
  "현재 선택된 노드가 없습니다.": {
    "ko": "현재 선택된 노드가 없습니다.",
    "en": "No node selected.",
    "th": "ยังไม่ได้เลือกโหนด"
  },
  "아직 지정한 분류군이 없습니다. 노드를 선택해 색 띠나 배경을 추가하십시오.": {
    "ko": "아직 지정한 분류군이 없습니다. 노드를 선택해 색 띠나 배경을 추가하십시오.",
    "en": "No taxa yet. Select a node to add a color bar or background.",
    "th": "ยังไม่มีกลุ่ม เลือกโหนดเพื่อเพิ่มแถบสีหรือพื้นหลัง"
  },
  "분류군 편집": {
    "ko": "분류군 편집",
    "en": "Edit taxon",
    "th": "แก้ไขกลุ่ม"
  },
  "적용할 말단 노드가 없습니다. 대상을 선택하십시오.": {
    "ko": "적용할 말단 노드가 없습니다. 대상을 선택하십시오.",
    "en": "No target tips. Select what to apply this to.",
    "th": "ไม่มีโหนดปลายเป้าหมาย โปรดเลือกเป้าหมายที่จะนำไปใช้"
  },
  "분류군 이름을 입력하십시오.": {
    "ko": "분류군 이름을 입력하십시오.",
    "en": "Enter a taxon name.",
    "th": "โปรดระบุชื่อกลุ่ม"
  },
  "분류군 표시는 100개까지 만들 수 있습니다.": {
    "ko": "분류군 표시는 100개까지 만들 수 있습니다.",
    "en": "You can create up to 100 taxon annotations.",
    "th": "สร้างคำอธิบายกลุ่มได้สูงสุด 100 รายการ"
  },
  "색상은 #1956A3과 같은 6자리 HEX 값으로 입력하십시오.": {
    "ko": "색상은 #1956A3과 같은 6자리 HEX 값으로 입력하십시오.",
    "en": "Enter a six-digit HEX color such as #1956A3.",
    "th": "ระบุสีเป็นรหัส HEX 6 หลัก เช่น #1956A3"
  },
  "배경색은 #1956A3과 같은 6자리 HEX 값으로 입력하십시오.": {
    "ko": "배경색은 #1956A3과 같은 6자리 HEX 값으로 입력하십시오.",
    "en": "Enter a six-digit HEX background color such as #1956A3.",
    "th": "ระบุสีพื้นหลังเป็นรหัส HEX 6 หลัก เช่น #1956A3"
  },
  "분류군 표시를 적용했습니다.": {
    "ko": "분류군 표시를 적용했습니다.",
    "en": "Taxon annotation applied.",
    "th": "ใช้คำอธิบายกลุ่มแล้ว"
  },
  "분류군 표시를 삭제했습니다. 실행 취소로 복원할 수 있습니다.": {
    "ko": "분류군 표시를 삭제했습니다. 실행 취소로 복원할 수 있습니다.",
    "en": "Taxon annotation deleted. Use Undo to restore it.",
    "th": "ลบคำอธิบายกลุ่มแล้ว ใช้เลิกทำเพื่อกู้คืนได้"
  },
  "프로젝트와 개별 노드 설정을 불러왔습니다.": {
    "ko": "프로젝트와 개별 노드 설정을 불러왔습니다.",
    "en": "Loaded the project and individual node settings.",
    "th": "โหลดโครงการและการตั้งค่าแต่ละโหนดแล้ว"
  },
  "붙여넣은 트리": {
    "ko": "붙여넣은 트리",
    "en": "Pasted tree",
    "th": "ทรีจากข้อความที่วาง"
  },
  "8 MB 이하 파일을 사용하세요.": {
    "ko": "8 MB 이하 파일을 사용하세요.",
    "en": "Use a file no larger than 8 MB.",
    "th": "โปรดใช้ไฟล์ขนาดไม่เกิน 8 MB"
  },
  "첫 번째 파일을 불러옵니다.": {
    "ko": "첫 번째 파일을 불러옵니다.",
    "en": "Importing the first file.",
    "th": "กำลังนำเข้าไฟล์แรก"
  },
  "프로젝트 파일을 저장했습니다.": {
    "ko": "프로젝트 파일을 저장했습니다.",
    "en": "Project file saved.",
    "th": "บันทึกไฟล์โครงการแล้ว"
  },
  "현재 루트와 전체 하위 노드를 포함한 Newick 파일을 저장했습니다.": {
    "ko": "현재 루트와 전체 하위 노드를 포함한 Newick 파일을 저장했습니다.",
    "en": "Saved Newick with the current root and all descendant nodes.",
    "th": "บันทึก Newick พร้อมรากปัจจุบันและโหนดลูกทั้งหมดแล้ว"
  },
  "편집 가능한 SVG를 저장했습니다.": {
    "ko": "편집 가능한 SVG를 저장했습니다.",
    "en": "Editable SVG saved.",
    "th": "บันทึก SVG ที่แก้ไขได้แล้ว"
  },
  "이미지 변환에 실패했습니다. SVG 내보내기를 사용하세요.": {
    "ko": "이미지 변환에 실패했습니다. SVG 내보내기를 사용하세요.",
    "en": "Image conversion failed. Export as SVG instead.",
    "th": "แปลงภาพไม่สำเร็จ โปรดส่งออกเป็น SVG"
  },
  "이 브라우저에서 PNG를 만들 수 없습니다. SVG를 사용하세요.": {
    "ko": "이 브라우저에서 PNG를 만들 수 없습니다. SVG를 사용하세요.",
    "en": "This browser cannot create PNG. Use SVG instead.",
    "th": "เบราว์เซอร์นี้สร้าง PNG ไม่ได้ โปรดใช้ SVG"
  },
  "PNG가 너무 큽니다. SVG로 저장하세요.": {
    "ko": "PNG가 너무 큽니다. SVG로 저장하세요.",
    "en": "The PNG is too large. Save as SVG instead.",
    "th": "PNG มีขนาดใหญ่เกินไป โปรดบันทึกเป็น SVG"
  },
  "이전 자동 저장을 불러오지 못해 예제 트리를 열었습니다.": {
    "ko": "이전 자동 저장을 불러오지 못해 예제 트리를 열었습니다.",
    "en": "Could not restore autosave; opened the example tree.",
    "th": "กู้คืนข้อมูลที่บันทึกอัตโนมัติไม่ได้ จึงเปิดทรีตัวอย่าง"
  },
  "이전 자동 저장 작업 복원됨": {
    "ko": "이전 자동 저장 작업 복원됨",
    "en": "Previous autosave restored",
    "th": "กู้คืนงานที่บันทึกอัตโนมัติแล้ว"
  },
  "트리 텍스트가 비어 있습니다.": {
    "ko": "트리 텍스트가 비어 있습니다.",
    "en": "Tree text is empty.",
    "th": "ข้อความทรีว่างเปล่า"
  },
  "닫히지 않은 대괄호 주석입니다.": {
    "ko": "닫히지 않은 대괄호 주석입니다.",
    "en": "Unclosed bracket comment.",
    "th": "หมายเหตุในวงเล็บเหลี่ยมยังไม่ปิด"
  },
  "닫히지 않은 따옴표입니다.": {
    "ko": "닫히지 않은 따옴표입니다.",
    "en": "Unclosed quotation mark.",
    "th": "เครื่องหมายอัญประกาศยังไม่ปิด"
  },
  "500단계보다 깊은 트리는 지원하지 않습니다.": {
    "ko": "500단계보다 깊은 트리는 지원하지 않습니다.",
    "en": "Trees deeper than 500 levels are not supported.",
    "th": "ไม่รองรับทรีที่ลึกเกิน 500 ระดับ"
  },
  "노드 10,000개까지 불러올 수 있습니다.": {
    "ko": "노드 10,000개까지 불러올 수 있습니다.",
    "en": "You can import up to 10,000 nodes.",
    "th": "นำเข้าได้สูงสุด 10,000 โหนด"
  },
  "빈 하위 노드입니다.": {
    "ko": "빈 하위 노드입니다.",
    "en": "Empty child node.",
    "th": "โหนดลูกว่างเปล่า"
  },
  "닫는 괄호가 필요합니다.": {
    "ko": "닫는 괄호가 필요합니다.",
    "en": "Expected a closing parenthesis.",
    "th": "ต้องมีวงเล็บปิด"
  },
  "가지 길이가 올바른 숫자가 아닙니다.": {
    "ko": "가지 길이가 올바른 숫자가 아닙니다.",
    "en": "Branch length is not a valid number.",
    "th": "ความยาวกิ่งไม่ใช่ตัวเลขที่ถูกต้อง"
  },
  "말단 노드의 이름이 비어 있습니다.": {
    "ko": "말단 노드의 이름이 비어 있습니다.",
    "en": "A tip name is empty.",
    "th": "ชื่อโหนดปลายว่างเปล่า"
  },
  "Newick 트리는 세미콜론(;)으로 끝나야 합니다.": {
    "ko": "Newick 트리는 세미콜론(;)으로 끝나야 합니다.",
    "en": "A Newick tree must end with a semicolon (;).",
    "th": "ทรี Newick ต้องลงท้ายด้วยอัฒภาค (;)"
  },
  "세미콜론 뒤에 해석할 수 없는 텍스트가 있습니다.": {
    "ko": "세미콜론 뒤에 해석할 수 없는 텍스트가 있습니다.",
    "en": "Unexpected text after the semicolon.",
    "th": "มีข้อความที่อ่านไม่ได้หลังอัฒภาค"
  },
  "파일이 비어 있습니다.": {
    "ko": "파일이 비어 있습니다.",
    "en": "The file is empty.",
    "th": "ไฟล์ว่างเปล่า"
  },
  "NEXUS 파일에 TREES 블록이 없습니다.": {
    "ko": "NEXUS 파일에 TREES 블록이 없습니다.",
    "en": "The NEXUS file has no TREES block.",
    "th": "ไฟล์ NEXUS ไม่มีบล็อก TREES"
  },
  "NEXUS TRANSLATE 항목을 해석할 수 없습니다.": {
    "ko": "NEXUS TRANSLATE 항목을 해석할 수 없습니다.",
    "en": "Could not parse a NEXUS TRANSLATE entry.",
    "th": "อ่านรายการ NEXUS TRANSLATE ไม่ได้"
  },
  "TRANSLATE 라벨의 따옴표가 닫히지 않았습니다.": {
    "ko": "TRANSLATE 라벨의 따옴표가 닫히지 않았습니다.",
    "en": "Unclosed quotation mark in a TRANSLATE label.",
    "th": "อัญประกาศในป้ายชื่อ TRANSLATE ยังไม่ปิด"
  },
  "NEXUS TREE 문을 해석할 수 없습니다.": {
    "ko": "NEXUS TREE 문을 해석할 수 없습니다.",
    "en": "Could not parse a NEXUS TREE statement.",
    "th": "อ่านคำสั่ง NEXUS TREE ไม่ได้"
  },
  "NEXUS 파일에 트리가 없습니다.": {
    "ko": "NEXUS 파일에 트리가 없습니다.",
    "en": "The NEXUS file contains no trees.",
    "th": "ไฟล์ NEXUS ไม่มีทรี"
  },
  "루트 기준으로 사용할 노드를 선택하십시오.": {
    "ko": "루트 기준으로 사용할 노드를 선택하십시오.",
    "en": "Select a node to use for rerooting.",
    "th": "เลือกโหนดสำหรับกำหนดรากใหม่"
  },
  "말단이 2개 이상인 트리에서 루트를 변경할 수 있습니다.": {
    "ko": "말단이 2개 이상인 트리에서 루트를 변경할 수 있습니다.",
    "en": "Rerooting requires at least two tips.",
    "th": "การกำหนดรากใหม่ต้องมีโหนดปลายอย่างน้อยสองโหนด"
  },
  "선택한 분류군 바깥에 다른 말단이 없습니다.": {
    "ko": "선택한 분류군 바깥에 다른 말단이 없습니다.",
    "en": "There are no tips outside the selected clade.",
    "th": "ไม่มีโหนดปลายอื่นนอกกลุ่มที่เลือก"
  },
  "새 루트를 추가하면 노드 10,000개 제한을 초과합니다.": {
    "ko": "새 루트를 추가하면 노드 10,000개 제한을 초과합니다.",
    "en": "Adding a root would exceed the 10,000-node limit.",
    "th": "การเพิ่มรากจะเกินขีดจำกัด 10,000 โหนด"
  },
  "재루팅 결과가 500단계 깊이 제한을 초과합니다.": {
    "ko": "재루팅 결과가 500단계 깊이 제한을 초과합니다.",
    "en": "Rerooting would exceed the 500-level depth limit.",
    "th": "การกำหนดรากใหม่จะทำให้ความลึกเกิน 500 ระดับ"
  },
  "지원하는 Clade Studio 프로젝트 파일이 아닙니다.": {
    "ko": "지원하는 Clade Studio 프로젝트 파일이 아닙니다.",
    "en": "This is not a supported Clade Studio project file.",
    "th": "ไฟล์นี้ไม่ใช่โครงการ Clade Studio ที่รองรับ"
  },
  "프로젝트의 노드 데이터가 올바르지 않습니다.": {
    "ko": "프로젝트의 노드 데이터가 올바르지 않습니다.",
    "en": "Invalid node data in the project.",
    "th": "ข้อมูลโหนดในโครงการไม่ถูกต้อง"
  },
  "프로젝트의 트리가 지원 크기를 초과합니다.": {
    "ko": "프로젝트의 트리가 지원 크기를 초과합니다.",
    "en": "The project tree exceeds the supported size.",
    "th": "ทรีในโครงการมีขนาดเกินที่รองรับ"
  },
  "프로젝트의 가지 길이가 올바르지 않습니다.": {
    "ko": "프로젝트의 가지 길이가 올바르지 않습니다.",
    "en": "Invalid branch length in the project.",
    "th": "ความยาวกิ่งในโครงการไม่ถูกต้อง"
  },
  "분류군": {
    "ko": "분류군",
    "en": "Taxon",
    "th": "กลุ่มอนุกรมวิธาน"
  },
  "언어": {
    "ko": "언어",
    "en": "Language",
    "th": "ภาษา"
  },
  "수정 버전 {version}": {
    "ko": "수정 버전 {version}",
    "en": "Version {version}",
    "th": "เวอร์ชัน {version}"
  },
  "Clade Studio — 수정 버전 {version}": {
    "ko": "Clade Studio — 수정 버전 {version}",
    "en": "Clade Studio — Version {version}",
    "th": "Clade Studio — เวอร์ชัน {version}"
  },
  "{name}와 나머지 트리가 루트에서 갈라지도록 재루팅했습니다. Ctrl+Z로 되돌릴 수 있습니다.": {
    "ko": "{name}와 나머지 트리가 루트에서 갈라지도록 재루팅했습니다. Ctrl+Z로 되돌릴 수 있습니다.",
    "en": "Rerooted to separate {name} from the rest of the tree. Press Ctrl+Z to undo.",
    "th": "กำหนดรากใหม่เพื่อแยก {name} ออกจากส่วนที่เหลือแล้ว กด Ctrl+Z เพื่อเลิกทำ"
  },
  "{tips} tips · {nodes} nodes · {collapsed} collapsed": {
    "ko": "{tips} tips · {nodes} nodes · {collapsed} collapsed",
    "en": "{tips} tips · {nodes} nodes · {collapsed} collapsed",
    "th": "{tips} โหนดปลาย · {nodes} โหนด · ยุบ {collapsed} กลุ่ม"
  },
  "가지 길이 {count}개 누락 · 0으로 표시합니다. 위상 모드로 바꿀 수 있습니다.": {
    "ko": "가지 길이 {count}개 누락 · 0으로 표시합니다. 위상 모드로 바꿀 수 있습니다.",
    "en": "{count} branch lengths missing · Shown as zero. You can switch to topology mode.",
    "th": "ไม่มีค่าความยาวกิ่ง {count} ค่า · แสดงเป็นศูนย์ สามารถเปลี่ยนเป็นโหมดโครงสร้างการแตกกิ่งได้"
  },
  "음수 길이 {count}개 · 화면에서는 0으로 표시하며 원본 값은 보존합니다.": {
    "ko": "음수 길이 {count}개 · 화면에서는 0으로 표시하며 원본 값은 보존합니다.",
    "en": "{count} negative lengths · Shown as zero; original values are preserved.",
    "th": "ความยาวติดลบ {count} ค่า · แสดงเป็นศูนย์ แต่เก็บค่าเดิมไว้"
  },
  "{count} tips": {
    "ko": "{count} tips",
    "en": "{count} tips",
    "th": "{count} โหนดปลาย"
  },
  "접힌 도형 일부에만 해당하는 분류군 {count}개는 범위 표시를 생략했습니다. 해당 도형을 펼쳐 확인하십시오.": {
    "ko": "접힌 도형 일부에만 해당하는 분류군 {count}개는 범위 표시를 생략했습니다. 해당 도형을 펼쳐 확인하십시오.",
    "en": "Ranges for {count} taxa that match only part of a collapsed shape are hidden. Expand the shape to view them.",
    "th": "ซ่อนขอบเขตของ {count} กลุ่มที่ครอบคลุมเพียงบางส่วนของรูปทรงที่ยุบ โปรดขยายรูปทรงเพื่อดู"
  },
  "{count}개": {
    "ko": "{count}개",
    "en": "{count}",
    "th": "{count}"
  },
  "{count}개 말단 노드 · {type}": {
    "ko": "{count}개 말단 노드 · {type}",
    "en": "{count} tips · {type}",
    "th": "{count} โหนดปลาย · {type}"
  },
  "원본 폭 {width} px · {mode}": {
    "ko": "원본 폭 {width} px · {mode}",
    "en": "Original width {width} px · {mode}",
    "th": "ความกว้างเดิม {width} px · {mode}"
  },
  "현재 선택: {name}": {
    "ko": "현재 선택: {name}",
    "en": "Selected: {name}",
    "th": "เลือกอยู่: {name}"
  },
  "{name} 표시": {
    "ko": "{name} 표시",
    "en": "Show {name}",
    "th": "แสดง {name}"
  },
  "{count}개 말단 노드": {
    "ko": "{count}개 말단 노드",
    "en": "{count} tips",
    "th": "{count} โหนดปลาย"
  },
  "{count}개 말단 노드를 불러왔습니다.": {
    "ko": "{count}개 말단 노드를 불러왔습니다.",
    "en": "Imported {count} tips.",
    "th": "นำเข้า {count} โหนดปลายแล้ว"
  },
  "PNG {width} × {height}px 저장 완료": {
    "ko": "PNG {width} × {height}px 저장 완료",
    "en": "Saved PNG at {width} × {height}px",
    "th": "บันทึก PNG ขนาด {width} × {height}px แล้ว"
  },
  " (문자 {position})": {
    "ko": " (문자 {position})",
    "en": " (character {position})",
    "th": " (อักขระที่ {position})"
  },
  "NO SELECTION": {
    "ko": "NO SELECTION",
    "en": "NO SELECTION",
    "th": "ยังไม่ได้เลือก"
  },
  "ROOT NODE": {
    "ko": "ROOT NODE",
    "en": "ROOT NODE",
    "th": "โหนดราก"
  },
  "INTERNAL NODE": {
    "ko": "INTERNAL NODE",
    "en": "INTERNAL NODE",
    "th": "โหนดภายใน"
  },
  "LEAF NODE": {
    "ko": "LEAF NODE",
    "en": "TIP NODE",
    "th": "โหนดปลาย"
  },
  "Untitled tree": {
    "ko": "Untitled tree",
    "en": "Untitled tree",
    "th": "ทรีไม่มีชื่อ"
  },
  "ILLUSTRATIVE DATA · NOT A RESEARCH RESULT": {
    "ko": "ILLUSTRATIVE DATA · NOT A RESEARCH RESULT",
    "en": "ILLUSTRATIVE DATA · NOT A RESEARCH RESULT",
    "th": "ข้อมูลตัวอย่าง · ไม่ใช่ผลการวิจัย"
  },
  "언어를 변경했습니다.": {
    "ko": "언어를 변경했습니다.",
    "en": "Language changed.",
    "th": "เปลี่ยนภาษาแล้ว"
  },
  "브라우저에서 계통수를 편집하고, 접힌 노드마다 크기를 자유롭게 조절하세요. Newick, NEXUS, IQ-TREE 지원.": {
    "ko": "브라우저에서 계통수를 편집하고, 접힌 노드마다 크기를 자유롭게 조절하세요. Newick, NEXUS, IQ-TREE 지원.",
    "en": "Edit phylogenetic trees in your browser and resize each collapsed clade. Supports Newick, NEXUS, and IQ-TREE.",
    "th": "แก้ไขทรีสายวิวัฒนาการในเบราว์เซอร์และปรับขนาดแต่ละกลุ่มที่ยุบ รองรับ Newick, NEXUS และ IQ-TREE"
  },
  "프로젝트 JSON 형식이 올바르지 않습니다.": {
    "ko": "프로젝트 JSON 형식이 올바르지 않습니다.",
    "en": "Invalid project JSON. Check the file format.",
    "th": "รูปแบบ JSON ของโครงการไม่ถูกต้อง โปรดตรวจสอบไฟล์"
  }
});
