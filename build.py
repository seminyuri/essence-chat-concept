#!/usr/bin/env python3
# Assemble a single self-contained artifact.html (inline fonts + CSS + JS) for claude.ai Artifact / any host.
import re, base64, urllib.request, os
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
FURL = ('https://fonts.googleapis.com/css2?family=Manrope:wght@200..700'
        '&family=Lora:ital,wght@0,400..600;1,400..600&family=JetBrains+Mono:wght@400;500&display=swap')

def get(url, binary=False):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=90) as r:
        return r.read() if binary else r.read().decode()

os.makedirs('build', exist_ok=True)
css = get(FURL)

# Keep only latin, latin-ext, cyrillic subsets to keep size sane; inline their woff2 as data URIs.
blocks = re.split(r'(?=/\*\s)', css)
keep = []
for b in blocks:
    m = re.match(r'/\*\s*([\w-]+)\s*\*/', b.strip())
    if m and m.group(1) not in ('latin', 'latin-ext', 'cyrillic'):
        continue
    keep.append(b)
css = ''.join(keep) if any('font-face' in b for b in keep) else css

def repl(m):
    data = get(m.group(1), True)
    b = base64.b64encode(data).decode()
    return f"url(data:font/woff2;base64,{b}) format('woff2')"
css = re.sub(r"url\((https://fonts\.gstatic\.com/[^)]+\.woff2)\)\s*format\('woff2'\)", repl, css)
open('build/fonts-inline.css', 'w').write(css)

essence = open('assets/essence.css').read()
essence = re.sub(r"@import url\([^)]*\);\s*", "", essence, count=1)   # drop @import (fonts inlined)
shell = open('assets/shell.css').read()
chat  = open('assets/chat.css').read()
appjs = open('assets/app.js').read()

idx = open('index.html').read()
theme_init = re.search(r'<script>.*?</script>', idx, re.S).group(0)
body = idx.split('<body>', 1)[1].split('<script src="assets/app.js">', 1)[0]

out = (theme_init + "\n<style>\n" + css + "\n" + essence + "\n" + shell + "\n" + chat + "\n</style>\n"
       + body + "\n<script>\n" + appjs + "\n</script>\n")
open('artifact.html', 'w').write(out)
print(f"artifact.html: {len(out)//1024} KB (fonts+css+js inline)")
