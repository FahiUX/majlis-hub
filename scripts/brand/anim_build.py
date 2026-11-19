"""Build preview/weev-logo-animation.html from the final wordmark+tagline SVG."""
import re

REPO = r'C:\Users\fahi\Documents\GitHub\majlis-hub'
s = open(REPO + r'\preview\logos\final\svg\weev-wordmark-tagline.svg', encoding='utf-8').read()
vb = re.search(r'viewBox="([^"]+)"', s).group(1)
w = s[s.index('<g id="w-mark">'):s.index('<g id="eev">')]
e = s[s.index('<g id="eev">'):s.index('<g id="tagline">')]
t = s[s.index('<g id="tagline">'):s.rindex('</svg>')]

# --- W: body / border / ribbon ---
wp = re.findall(r'<path [^>]*/>', w)
body, border, ribbon = wp
body = body.replace('<path ', '<path class="w-body" pathLength="1" ', 1)
from wpen import W_D, R_D
body = re.sub(r' class="w-body" pathLength="1"', '', body)
W = ('<defs>'
     '<mask id="m-w" maskUnits="userSpaceOnUse" x="0" y="0" width="4096" height="4096">'
     f'<path class="pen pen-w" d="{W_D}" pathLength="1" fill="none" stroke="#fff" stroke-width="120" stroke-linecap="round" stroke-linejoin="round"/>'
     '<rect class="pen-done pen-done-w" x="0" y="0" width="4096" height="4096" fill="#fff"/></mask>'
     '<mask id="m-r" maskUnits="userSpaceOnUse" x="0" y="0" width="4096" height="4096">'
     f'<path class="pen pen-r" d="{R_D}" pathLength="1" fill="none" stroke="#fff" stroke-width="130" stroke-linecap="round" stroke-linejoin="round"/>'
     '<rect class="pen-done pen-done-r" x="0" y="0" width="4096" height="4096" fill="#fff"/></mask>'
     '</defs>'
     f'<g class="w-twist"><g mask="url(#m-w)">{body}</g><g mask="url(#m-r)">{border}{ribbon}</g></g>')

# --- eev: two e (clip, ring, dot, bar) + v ---
clips = re.findall(r'<clipPath .*?</clipPath>', e)
rings = re.findall(r'<path d="M[^"]*A[^"]*"[^>]*/>', e)
dots = re.findall(r'<circle [^>]*/>', e)
bars = re.findall(r'<rect [^>]*/>', e)
v = re.findall(r'<path d="M[^"]*L[^"]*"[^>]*/>', e)[0]
EEV = ''.join(clips)
for i in range(2):
    EEV += (f'<g class="e e{i + 1}">'
            f'<g class="e-bar">{bars[i]}</g>'
            f'{rings[i].replace("<path ", "<path class=\"e-ring\" pathLength=\"1\" ", 1)}'
            f'{dots[i].replace("<circle ", "<circle class=\"e-dot\" ", 1)}</g>')
EEV += v.replace('<path ', '<path class="v-stroke" pathLength="1" ', 1)

# --- tagline: two lines ---
tp = re.findall(r'<path [^>]*/>', t)
TAG = (f'<g class="tag tag1">{tp[0]}</g><g class="tag tag2">{tp[1]}</g>')

svg = (f'<svg id="logo" xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" '
       f'aria-label="WEEV: Wedding and Event. Find your people. Make it happen.">{W}<g class="eev">{EEV}</g>{TAG}</svg>')

html = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>WEEV Logo Animation</title>
<style>
  :root { --linen:#FAF7EF; --ink:#2E1741; --pink:#DB619B; --gold:#E8B536; }
  * { box-sizing:border-box; }
  body { margin:0; min-height:100vh; background:var(--linen); color:var(--ink);
         font-family:"Nunito", system-ui, sans-serif; display:flex; flex-direction:column;
         align-items:center; justify-content:center; gap:32px; padding:24px 16px; }
  .stage { width:min(720px, 100%); }
  #logo { width:100%; height:auto; display:block; overflow:visible; }
  .controls { display:flex; gap:12px; align-items:center; flex-wrap:wrap; justify-content:center; }
  button { font:inherit; font-weight:700; font-size:15px; border:0; border-radius:999px; padding:10px 22px;
           background:var(--ink); color:var(--linen); cursor:pointer; }
  button.ghost { background:transparent; color:var(--ink); box-shadow:inset 0 0 0 2px var(--ink); }
  button:focus-visible { outline:3px solid var(--pink); outline-offset:3px; }
  .note { font-size:13px; opacity:.65; margin:0; text-align:center; }

  /* timeline (s): W pen .15-1.85 | ribbon 1.55-2.25 | e1 1.95-2.9 | e2 2.2-3.15 | v 2.55-3.1 | tagline 3.0-3.85 */
  :root { --sine:cubic-bezier(.45,.05,.55,.95); --out:cubic-bezier(.22,1,.36,1); --soft-pop:cubic-bezier(.34,1.3,.64,1); }

  /* 1. W written with one pen stroke + soft twist */
  .w-twist { transform-box:fill-box; transform-origin:50% 60%; animation:twist 2s var(--out) both; }
  @keyframes twist { 0% { transform:rotate(-12deg) scale(.92) } 100% { transform:rotate(0) scale(1) } }
  .pen { stroke-dasharray:1; stroke-dashoffset:1; animation:draw var(--sine) forwards; }
  .pen-w { animation-duration:1.7s; animation-delay:.15s; }
  .pen-r { animation-duration:.7s; animation-delay:1.55s; }
  .pen-done { opacity:0; animation:show .3s ease-out forwards; }
  .pen-done-w { animation-delay:1.85s } .pen-done-r { animation-delay:2.25s }
  @keyframes draw { to { stroke-dashoffset:0 } }
  @keyframes show { to { opacity:1 } }

  /* 3. eev writes itself: bar -> ring -> tip (overlapping) */
  .e-bar { clip-path:inset(0 100% 0 0); animation:bar .22s var(--sine) forwards; }
  @keyframes bar { to { clip-path:inset(0 0 0 0) } }
  .e-ring { stroke-dasharray:1; stroke-dashoffset:1; animation:draw .55s var(--sine) forwards; }
  .e-dot { transform-box:fill-box; transform-origin:50% 50%; transform:scale(0);
           animation:pop .3s var(--soft-pop) forwards; }
  @keyframes pop { to { transform:scale(1) } }
  .e1 .e-bar { animation-delay:1.95s } .e1 .e-ring { animation-delay:2.12s } .e1 .e-dot { animation-delay:2.6s }
  .e2 .e-bar { animation-delay:2.2s }  .e2 .e-ring { animation-delay:2.37s } .e2 .e-dot { animation-delay:2.85s }
  .v-stroke { stroke-dasharray:1; stroke-dashoffset:1; animation:draw .55s var(--sine) 2.55s forwards; }

  /* 4. tagline fades up */
  .tag { transform-box:fill-box; opacity:0; transform:translateY(25%); animation:rise .7s var(--out) forwards; }
  .tag1 { animation-delay:3.0s } .tag2 { animation-delay:3.15s }
  @keyframes rise { to { opacity:1; transform:translateY(0) } }

  /* export mode (video frames): no controls, logo centred */
  body.export { gap:0; padding:0; }
  body.export .controls, body.export .note { display:none; }
  body.export .stage { width:62vw; }

  /* settle: tiny bounce of the whole mark when done */
  #logo .eev, #logo .w-twist { }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration:1ms !important; animation-delay:0s !important; }
  }
</style>
</head>
<body>
  <div class="stage">''' + svg + '''</div>
  <div class="controls">
    <button id="replay" type="button">Replay</button>
    <button id="slow" class="ghost" type="button" aria-pressed="false">Slow motion</button>
  </div>
  <p class="note">WEEV wordmark animation · the W is written in one stroke, the ribbon flows, eev writes itself.</p>
<script>
  const stage = document.querySelector('.stage');
  const tpl = stage.innerHTML;
  let slow = false;
  function replay() {
    stage.innerHTML = tpl;
    if (slow) stage.querySelectorAll('#logo *').forEach(el => {
      const cs = getComputedStyle(el);
      if (cs.animationName !== 'none') {
        el.style.animationDuration = cs.animationDuration.split(',').map(d => parseFloat(d) * 4 + 's').join(',');
        el.style.animationDelay = cs.animationDelay.split(',').map(d => parseFloat(d) * 4 + 's').join(',');
      }
    });
  }
  if (new URLSearchParams(location.search).has('export')) document.body.classList.add('export');
  document.getElementById('replay').addEventListener('click', replay);
  document.getElementById('slow').addEventListener('click', e => {
    slow = !slow; e.currentTarget.setAttribute('aria-pressed', slow); replay();
  });
</script>
</body>
</html>
'''
open(REPO + r'\preview\weev-logo-animation.html', 'w', encoding='utf-8').write(html)
print('written', len(html) // 1024, 'KB')
