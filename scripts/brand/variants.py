"""Build WEEV logo variants from the clean master SVGs. Step 1: full-canvas SVGs (cropped later by render bbox)."""
import re, os

OUT = 'variants'
os.makedirs(OUT, exist_ok=True)
INK, PINK, WHITE = '#2E1741', '#DB619B', '#FFFFFF'

def parts(path):
    s = open(path, encoding='utf-8').read()
    body = s[s.index('<svg'):]
    body = body[body.index('>') + 1:body.rindex('</svg>')]
    body = re.sub(r'<title>.*?</title>', '', body, flags=re.S)
    i = body.index('<g id="w-mark">'); j = body.index('<g id="eev">'); k = body.index('<g id="tagline">')
    return dict(traced=body[:i], w=body[i:j], eev=body[j:k], tag=body[k:])

def tempa_only(traced):
    """drop traced subpaths that sit in the wordmark band (y > 2440)"""
    def fix(m):
        pre, d, post = m.group(1), m.group(2), m.group(3)
        keep = []
        for sp in re.findall(r'M[^M]*', d):
            ys = [float(v) for v in re.findall(r'-?\d+\.?\d*', sp)][1::2]
            if min(ys) > 2440:
                continue
            keep.append(sp)
        return f'<path {pre}d="{"".join(keep)}"{post}/>' if keep else ''
    return re.sub(r'<path ([^>]*?)d="([^"]*)"([^>]*)/>', fix, traced)

def white(x):
    return x.replace(f'fill="{INK}"', f'fill="{WHITE}"').replace(f'stroke="{INK}"', f'stroke="{WHITE}"')

def save(name, content):
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4096 4096" width="4096" height="4096">{content}</svg>'
    open(f'{OUT}/{name}.svg', 'w', encoding='utf-8').write(svg)

P = parts('rw.svg'); H = parts('weev-logo-hero.svg')
save('weev-logo-primary', P['traced'] + P['w'] + P['eev'] + P['tag'])
save('weev-logo-primary-white', P['traced'] + white(P['w'] + P['eev'] + P['tag']))
save('weev-logo-hero', H['traced'] + H['w'] + H['eev'] + H['tag'])
save('weev-logo-hero-white', H['traced'] + white(H['w'] + H['eev'] + H['tag']))
save('weev-wordmark', P['w'] + P['eev'])
save('weev-wordmark-white', white(P['w'] + P['eev']))
save('weev-wordmark-tagline', P['w'] + P['eev'] + P['tag'])
save('weev-wordmark-tagline-white', white(P['w'] + P['eev'] + P['tag']))
save('weev-w-mark', P['w'])
save('weev-w-mark-white', white(P['w']))
save('weev-tempa', tempa_only(P['traced']))
save('weev-tempa-nest', tempa_only(H['traced']))
print(sorted(os.listdir(OUT)))
