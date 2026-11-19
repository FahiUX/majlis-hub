"""Close seams in a smoothed cutout SVG: fills get a same-colour stroke, ink drawn last, brand colours snapped."""
import re, sys

src, out, width = sys.argv[1], sys.argv[2], float(sys.argv[3])
s = open(src, encoding='utf-8').read()
vb = re.search(r'viewBox="([^"]+)"', s).group(1)
paths = re.findall(r'<path d="([^"]+)" fill="(#[0-9a-fA-F]{6})"/>', s)

def rgb(h):
    return int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16)

def lum(h):
    r, g, b = rgb(h)
    return 0.299 * r + 0.587 * g + 0.114 * b

def snap(h):
    r, g, b = rgb(h)
    if lum(h) < 80:
        return '#2E1741'
    if abs(r - 219) + abs(g - 97) + abs(b - 155) < 45:
        return '#DB619B'
    return h.upper()

fills, ink = [], []
for d, c in paths:
    c2 = snap(c)
    if c2 == '#2E1741':
        ink.append(f'<path d="{d}" fill="{c2}" stroke="{c2}" stroke-width="{width*1.1:.2f}" stroke-linejoin="round"/>')
    else:
        fills.append(f'<path d="{d}" fill="{c2}" stroke="{c2}" stroke-width="{width}" stroke-linejoin="round"/>')

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="1024" height="1024">'
       f'<g id="fills">{"".join(fills)}</g><g id="ink">{"".join(ink)}</g></svg>')
open(out, 'w', encoding='utf-8').write(svg)
print(f'{len(fills)} fills, {len(ink)} ink paths -> {out}')
