"""Rebuild WEEV logo text: keep traced Tempa + heart W, replace eev with geometry, text with Nunito, drop specks."""
import re, math
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen

INK = '#2E1741'
SRC = 'weev-logo-final.svg'
OUT = 'weev-logo-rebuilt.svg'
s = open(SRC, encoding='utf-8').read()

# ---------- 1. strip traced eev + text, and specks ----------
def sub_bbox(d):
    nums = [float(v) for v in re.findall(r'-?\d+\.?\d*', d)]
    xs, ys = nums[0::2], nums[1::2]
    return min(xs), min(ys), max(xs), max(ys)

def in_text_zone(b):
    x0, y0, x1, y1 = b
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    eev = cx > 1695 and 2480 < cy < 3040 and y0 > 2470
    txt = cy > 3080 and 900 < cx < 3200 and y0 > 3070
    return eev or txt

removed_txt = removed_speck = 0
def fix_path(m):
    global removed_txt, removed_speck
    pre, d, post = m.group(1), m.group(2), m.group(3)
    subs = re.findall(r'M[^M]*', d)
    keep = []
    for sp in subs:
        b = sub_bbox(sp)
        if in_text_zone(b):
            removed_txt += 1; continue
        if max(b[2] - b[0], b[3] - b[1]) < 10:
            removed_speck += 1; continue
        keep.append(sp)
    if not keep:
        return ''
    return f'<path {pre}d="{"".join(keep)}"{post}/>'

s = re.sub(r'<path ([^>]*?)d="([^"]*)"([^>]*)/>', fix_path, s)

# ---------- 2. geometric e e v ----------
def e_glyph(cx, cy):
    t = 88.0                      # ring stroke
    rx, ry = 229.5 - t / 2, 237.0 - t / 2
    a = math.radians(33)          # terminal angle below horizontal
    sx, sy = cx + rx, cy
    ex, ey = cx + rx * math.cos(a), cy + ry * math.sin(a)
    ring = (f'<path d="M{sx:.1f},{sy:.1f} A{rx:.1f},{ry:.1f} 0 1 0 {ex:.1f},{ey:.1f}" fill="none" '
            f'stroke="{INK}" stroke-width="{t}" stroke-linecap="butt"/>'
            f'<circle cx="{ex:.1f}" cy="{ey:.1f}" r="{t / 2:.1f}" fill="{INK}"/>')
    bar_h = 77.0
    cid = f'ec{int(cx)}'
    clip = (f'<clipPath id="{cid}"><ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{rx + t / 2:.1f}" ry="{ry + t / 2:.1f}"/></clipPath>')
    bar = (f'<rect x="{cx - rx - t:.1f}" y="{cy - bar_h / 2:.1f}" width="{2 * rx + 2 * t:.1f}" height="{bar_h}" '
           f'fill="{INK}" clip-path="url(#{cid})"/>')
    return clip + ring + bar

E1 = (1933.5, 2772.0)
E2 = (E1[0] + 503.0, E1[1])
tv = 101.0
v = (f'<path d="M2735.6,2591.5 L2908.5,2954.5 L3081.4,2591.5" fill="none" stroke="{INK}" '
     f'stroke-width="{tv}" stroke-linecap="round" stroke-linejoin="round"/>')
eev = f'<g id="eev">{e_glyph(*E1)}{e_glyph(*E2)}{v}</g>'

# ---------- 3. Nunito text as outlines ----------
VF = TTFont(r'C:\Users\fahi\tools\fonts\Nunito-VF.ttf')
cache = {}
def font_at(w):
    if w not in cache:
        cache[w] = instancer.instantiateVariableFont(TTFont(r'C:\Users\fahi\tools\fonts\Nunito-VF.ttf'), {'wght': w})
    return cache[w]

def text_path(text, wght, track_em, box):
    f = font_at(wght)
    gs = f.getGlyphSet(); cmap = f.getBestCmap(); upm = f['head'].unitsPerEm
    hmtx = f['hmtx']
    # layout in font units, y up
    pen_x = 0.0; placed = []
    for ch in text:
        g = cmap[ord(ch)]
        placed.append((g, pen_x))
        pen_x += hmtx[g][0] + track_em * upm
    bp = BoundsPen(gs)
    for g, x in placed:
        gs[g].draw(TransformPen(bp, (1, 0, 0, 1, x, 0)))
    bx0, by0, bx1, by1 = bp.bounds
    X0, Y0, X1, Y1 = box
    k = (X1 - X0) / (bx1 - bx0)                      # scale to target ink width
    # vertical: centre ink bbox on target box centre (y flipped)
    ty = (Y0 + Y1) / 2 + k * (by0 + by1) / 2
    tx = X0 - k * bx0
    sp = SVGPathPen(gs)
    for g, x in placed:
        gs[g].draw(TransformPen(sp, (k, 0, 0, -k, tx + k * x, ty)))
    return sp.getCommands(), k * upm

sub_d, sub_size = text_path('Wedding \u2022 Event', 800, -0.04, (990, 3105, 3109, 3368))
tag_d, tag_size = text_path('Find Your People. Make It Happen.', 700, -0.02, (999, 3419, 3102, 3543))
text = (f'<g id="tagline"><path d="{sub_d}" fill="{INK}"/><path d="{tag_d}" fill="{INK}"/></g>')

s = s.replace('</svg>', eev + text + '</svg>')
open(OUT, 'w', encoding='utf-8').write(s)
print(f'removed text subpaths {removed_txt}, specks {removed_speck}; font sizes {sub_size:.1f}/{tag_size:.1f}px -> {OUT}')
