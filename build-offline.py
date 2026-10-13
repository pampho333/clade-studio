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
def bundle_module(name):
    text = (source / name).read_text(encoding="utf-8")
    text = re.sub(r'''^import\s+\{[^}]+\}\s+from\s+['"][^'"]+['"];\s*''', "", text, flags=re.M)
    return re.sub(r"^export\s+", "", text, flags=re.M)

script = "(() => {\n'use strict';\n" + "\n".join(bundle_module(name) for name in ("i18n.js", "core.js", "app.js")) + "\n})();\n"
html = html.replace('<link rel="stylesheet" href="./style.css">', '<style>\n' + css + '\n</style>')
html = html.replace('<script type="module" src="./app.js"></script>', '<script>\n' + re.sub(r'</script', r'<\\/script', script, flags=re.I) + '\n</script>')

def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as output:
        output.write(text)

for language, suffix in (("ko", ""), ("en", "_EN"), ("th", "_TH")):
    output = html.replace('<html lang="ko" data-default-language="ko">', f'<html lang="{language}" data-default-language="{language}">')
    heading = f'Clade Studio — 수정 버전 {version}' if language == "ko" else f'Clade Studio — {"Version" if language == "en" else "เวอร์ชัน"} {version}'
    output = output.replace('<title>Clade Studio — 계통수 편집기</title>', f'<title>{heading}</title>')
    name = f"Clade_Studio_Offline_v{version}{suffix}.html"
    write(root / name, output)
    if language == "ko":
        write(root / "index.html", output)
    print(f"Built {name} ({len(output.encode('utf-8')):,} bytes)")
write(root / ".build" / "bundle-check.js", script)
