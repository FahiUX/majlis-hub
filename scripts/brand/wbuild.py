"""Rebuild the heart-ribbon W as 3 smooth layers (body, ribbon border, ribbon) with few-node Beziers."""
import re, sys
import numpy as np
from PIL import Image
from scipy import ndimage
import potrace

SRC, OUT = sys.argv[1], sys.argv[2]
INK, PINK = '#2E1741', '#DB619B'
X0, Y0, X1, Y1 = 930, 2450, 1697, 3070      # W zone in 4096 coords (stops before first e)

up = np.array(Image.open('up4.png').convert('RGB')).astype(float)[Y0:Y1, X0:X1]
r, g, b = up[..., 0], up[..., 1], up[..., 2]
lum = 0.299 * r + 0.587 * g + 0.114 * b
pink = (r > 165) & (g < 150) & (b > 100) & (r - g > 60)
ink = lum < 125

def clean(m, sigma, close=0):
    if close:
        m = ndimage.binary_closing(m, iterations=close)
    m = ndimage.binary_opening(m, iterations=2)
    lab, n = ndimage.label(m)
    if n > 1:                               # keep big parts only
        sizes = ndimage.sum(m, lab, range(1, n + 1))
        m = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > 3000])
    return ndimage.gaussian_filter(m.astype(float), sigma) > 0.5

body = clean(ink | pink, 7, close=2)
ribbon = clean(pink, 5, close=3)
border = clean(ndimage.binary_dilation(ribbon, iterations=13), 4)

def trace(mask):
    pl = potrace.Bitmap(~mask).trace(turdsize=400, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY,
                                     alphamax=1.3, opticurve=True, opttolerance=1.2)
    out, nodes = [], 0
    for c in pl:
        sp = c.start_point
        d = [f'M{sp.x + X0:.1f},{sp.y + Y0:.1f}']
        for s in c.segments:
            nodes += 1
            if s.is_corner:
                d.append(f'L{s.c.x + X0:.1f},{s.c.y + Y0:.1f}L{s.end_point.x + X0:.1f},{s.end_point.y + Y0:.1f}')
            else:
                d.append(f'C{s.c1.x + X0:.1f},{s.c1.y + Y0:.1f} {s.c2.x + X0:.1f},{s.c2.y + Y0:.1f} '
                         f'{s.end_point.x + X0:.1f},{s.end_point.y + Y0:.1f}')
        out.append(''.join(d) + 'Z')
    return ''.join(out), nodes

bd, n1 = trace(body)
rd, n2 = trace(border & body | border)
pd, n3 = trace(ribbon)
w = (f'<g id="w-mark"><path d="{bd}" fill="{INK}" fill-rule="evenodd"/>'
     f'<path d="{rd}" fill="{INK}" fill-rule="evenodd"/>'
     f'<path d="{pd}" fill="{PINK}" fill-rule="evenodd"/></g>')

# remove traced W subpaths from the logo
s = open(SRC, encoding='utf-8').read()
gone = 0
def fix(m):
    global gone
    pre, d, post = m.group(1), m.group(2), m.group(3)
    keep = []
    for sp in re.findall(r'M[^M]*', d):
        nums = [float(v) for v in re.findall(r'-?\d+\.?\d*', sp)]
        xs, ys = nums[0::2], nums[1::2]
        cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
        if X0 - 60 < min(xs) and max(xs) < X1 + 70 and min(ys) > Y0 - 30 and max(ys) < Y1 + 10 and cx < X1 - 40 and cy > 2480:
            gone += 1; continue
        keep.append(sp)
    return f'<path {pre}d="{"".join(keep)}"{post}/>' if keep else ''
s = re.sub(r'<path ([^>]*?)d="([^"]*)"([^>]*)/>', fix, s)
s = s.replace('<g id="eev">', w + '<g id="eev">', 1)
open(OUT, 'w', encoding='utf-8').write(s)
print(f'removed {gone} traced W subpaths; new W nodes body {n1}, border {n2}, ribbon {n3} -> {OUT}')
