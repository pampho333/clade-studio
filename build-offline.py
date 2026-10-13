"""Build the offline application using only the Python standard library."""
from pathlib import Path
import re

root = Path(__file__).resolve().parent
source = root / "src"
html = (source / "index.html").read_text(encoding="utf-8")
match = re.search(r'<meta name="clade-studio-version" content="([0-9.]+)">', html)
if not match:
    raise SystemExit("Missing clade-studio-version metadata in src/index.html")
version = match.group(1)
css = (source / "style.css").read_text(encoding="utf-8")
core = re.sub(r"^export\s+", "", (source / "core.js").read_text(encoding="utf-8"), flags=re.M)
app = re.sub(r'''^import\s+\{[^}]+\}\s+from\s+['"][^'"]+['"];\s*''', "", (source / "app.js").read_text(encoding="utf-8"), count=1)
script = "(() => {\n'use strict';\n" + core + "\n" + app + "\n})();\n"
html = html.replace('<link rel="stylesheet" href="./style.css">', '<style>\n' + css + '\n</style>')
html = html.replace('<script type="module" src="./app.js"></script>', '<script>\n' + re.sub(r'</script', r'<\\/script', script, flags=re.I) + '\n</script>')
html = html.replace('<title>Clade Studio — 계통수 편집기</title>', f'<title>Clade Studio — 수정 버전 {version}</title>')
html = html.replace('href="./" aria-label="Clade Studio 홈"', 'href="#" aria-label="Clade Studio"')
html = html.replace('브라우저에서 작업 중', f'수정 버전 {version}')
html = html.replace('자동 저장은 이 브라우저의 마지막 작업 한 개에만 적용됩니다.', '자동 저장은 이 브라우저의 마지막 작업 한 개에만 적용됩니다. 브라우저 설정이나 HTML 파일 위치에 따라 자동 저장이 제한될 수 있으므로 프로젝트 파일을 따로 저장하십시오.')
html = html.replace('이 앱은 iTOL과 별개이며', '인터넷 연결이나 설치 없이 이 HTML 파일을 Chrome 또는 Edge에서 열어 사용합니다. 이 앱은 iTOL과 별개이며')

def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as output:
        output.write(text)

for name in ("index.html", f"Clade_Studio_Offline_v{version}.html"):
    write(root / name, html)
    print(f"Built {name} ({len(html.encode('utf-8')):,} bytes)")
write(root / ".build" / "bundle-check.js", script)
