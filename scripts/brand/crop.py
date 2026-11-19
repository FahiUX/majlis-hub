"""Crop each variant's viewBox to its art (+ padding), measured from a render on a green key background."""
import os, re, subprocess, sys
import numpy as np
from PIL import Image

EDGE = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
D = os.path.abspath('variants')
PAD = 0.04          # 4% padding of the longer side
R = 1024            # render size for measuring

def render(svg, png, size, bg):
    html = os.path.join(D, '_r.html')
    open(html, 'w').write(f'<html><body style="margin:0;background:{bg}"><img src="{os.path.basename(svg)}" '
                          f'width="{size[0]}" height="{size[1]}" style="display:block"></body></html>')
    subprocess.run([EDGE, '--headless', '--disable-gpu', '--hide-scrollbars', f'--screenshot={png}',
                    f'--window-size={size[0]},{size[1]}', 'file:///' + html.replace('\\', '/')],
                   timeout=90, capture_output=True)

for f in sorted(os.listdir(D)):
    if not f.endswith('.svg'):
        continue
    p = os.path.join(D, f)
    s = open(p, encoding='utf-8').read()
    s = re.sub(r'viewBox="[^"]*" width="\d+" height="\d+"', 'viewBox="0 0 4096 4096" width="4096" height="4096"', s, 1)
    open(p, 'w', encoding='utf-8').write(s)
    tmp = os.path.join(D, '_m.png')
    render(p, tmp, (R, R), '#00FF00')
    a = np.asarray(Image.open(tmp).convert('RGB')).astype(int)
    art = np.abs(a - [0, 255, 0]).sum(2) > 40
    ys, xs = np.where(art)
    k = 4096 / R
    x0, y0, x1, y1 = xs.min() * k, ys.min() * k, (xs.max() + 1) * k, (ys.max() + 1) * k
    pad = PAD * max(x1 - x0, y1 - y0)
    x0, y0, x1, y1 = x0 - pad, y0 - pad, x1 + pad, y1 + pad
    if 'w-mark' in f:                       # square canvas for the mark
        side = max(x1 - x0, y1 - y0); cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        x0, x1, y0, y1 = cx - side / 2, cx + side / 2, cy - side / 2, cy + side / 2
    w, h = x1 - x0, y1 - y0
    disp_w = 1024 if w >= h else round(1024 * w / h)
    disp_h = round(disp_w * h / w)
    s = s.replace('viewBox="0 0 4096 4096" width="4096" height="4096"',
                  f'viewBox="{x0:.0f} {y0:.0f} {w:.0f} {h:.0f}" width="{disp_w}" height="{disp_h}"', 1)
    open(p, 'w', encoding='utf-8').write(s)
    print(f'{f:36s} viewBox {x0:.0f} {y0:.0f} {w:.0f}x{h:.0f}  {os.path.getsize(p)//1024} KB')
for t in ('_m.png', '_r.html'):
    if os.path.exists(os.path.join(D, t)):
        os.remove(os.path.join(D, t))
