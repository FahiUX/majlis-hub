"""Pen paths (centre-lines) for the W and the ribbon, as smooth cubic Beziers in 4096 logo coords."""
import numpy as np
from PIL import Image, ImageDraw

OX, OY = 930, 2450
# crop-pixel waypoints read off the skeleton, in pen order
W_PTS = [(255, 120), (225, 104), (190, 102), (140, 125), (105, 165), (97, 210), (108, 280), (150, 370),
         (210, 445), (280, 483), (322, 468), (360, 430), (400, 372), (445, 310), (463, 250), (458, 190),
         (440, 162), (400, 152), (360, 162), (340, 185), (335, 250), (348, 298), (375, 335), (400, 372),
         (440, 428), (480, 468), (520, 483), (570, 465), (640, 370), (688, 275), (700, 205), (684, 145),
         (650, 110), (600, 102), (568, 108), (543, 120)]
R_PTS = [(380, 117), (350, 140), (330, 185), (324, 245), (338, 305), (370, 360), (410, 410), (455, 455),
         (510, 490), (560, 500), (600, 482)]

def catmull(pts, tension=0.5):
    p = [np.array(v, float) + (OX, OY) for v in pts]
    p = [p[0]] + p + [p[-1]]
    d = f'M{p[1][0]:.1f},{p[1][1]:.1f}'
    for i in range(1, len(p) - 2):
        c1 = p[i] + (p[i + 1] - p[i - 1]) * tension / 3
        c2 = p[i + 1] - (p[i + 2] - p[i]) * tension / 3
        d += f'C{c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p[i + 1][0]:.1f},{p[i + 1][1]:.1f}'
    return d

def smooth(pts, keep=()):
    out=[pts[0]]
    for i in range(1,len(pts)-1):
        if i in keep: out.append(pts[i]); continue
        out.append(tuple((pts[i-1][k]+2*pts[i][k]+pts[i+1][k])/4 for k in (0,1)))
    return out+[pts[-1]]
W_D = catmull(smooth(W_PTS, keep=(12, 23)), 0.9)
R_D = catmull(smooth(R_PTS), 0.9)

if __name__ == '__main__':
    body = np.load('w_body.npy')
    img = Image.new('RGB', body.shape[::-1], 'white'); a = np.array(img); a[body] = [225, 215, 235]
    img = Image.fromarray(a); d = ImageDraw.Draw(img)
    for pts, col in ((W_PTS, (200, 0, 0)), (R_PTS, (0, 120, 220))):
        d.line(pts, fill=col, width=3, joint='curve')
        for i, (x, y) in enumerate(pts):
            d.ellipse([x - 4, y - 4, x + 4, y + 4], fill=col)
            if i in (0, len(pts) - 1): d.text((x + 6, y - 6), 'start' if i == 0 else 'end', fill=col)
    img.save('w_pen.png'); print(len(W_D), len(R_D))
