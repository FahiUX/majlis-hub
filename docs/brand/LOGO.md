# WEEV Logo & Tempa — Brand Lock

> **Status: LOCKED (approved by the user, 18–19 Nov 2026).**
> Read this whole file before ANY brand, logo, mascot, icon or splash-screen work.
> The files in `preview/logos/final/` are the source of truth. This document describes them so you can
> recognise and protect them. It does **not** replace them: never redraw the logo from this description.

---

## 0. The five rules (non-negotiable)

1. **Use the files, never redraw.** Every logo, wordmark, W, favicon, app icon and Tempa image comes from
   `preview/logos/final/`. Copy, scale, recolour (only as allowed in §5) or crop them. Do not regenerate,
   re-trace, re-imagine or "improve" them with AI.
2. **No AI image generation of the logo or the W.** AI generators cannot keep exact letter shapes or proportions
   (proven 16–18 Nov: the W came out 1.5× too big, "meev", "ooeev", a potato bird).
3. **Small fixes = edit the approved file.** Swap the one part, keep everything else byte-identical.
4. **Check the fingerprints** before and after brand work: `sha256sum -c docs/brand/LOGO.sha256`
   (run inside `preview/logos/final/`). Any `FAILED` on a file you did not intend to change = revert it.
5. **Changes need the user's approval.** If a final file must change, show before/after, get a yes,
   then update the file, regenerate `LOGO.sha256`, and log it in §9.

### Locks in place
- **Pre-commit lock** (`.githooks/pre-commit`): blocks any commit that touches `preview/logos/final/` or `LOGO.sha256`.
  Approved change: regenerate `LOGO.sha256`, log it in §9, then `WEEV_BRAND_UNLOCK=1 git commit ...` (the hook also checks the fingerprints match).
- **GitHub check** (`.github/workflows/brand-lock.yml`): every push verifies `final/` against `LOGO.sha256`; a red ✗ means a logo file changed.
- **New machine / fresh clone (do once):** `git config core.hooksPath .githooks`
- **Global Claude rule:** add the "WEEV brand lock" block to `~/.claude/CLAUDE.md` on every computer (done on the home PC 19 Nov; **todo on the work Mac**).

---

## 1. Where everything is

```
preview/logos/final/
├── weev-logo-primary.svg        master, full 4096 canvas (no nest)      ← primary logo
├── weev-logo-hero.svg           master, full 4096 canvas (with nest)    ← hero / banners
├── weev-tempa-final-nonest.jpg  approved raster, 1024² (no nest)        ← Tempa reference for poses
├── weev-tempa-final.jpg         approved raster, 1024² (with nest)
├── weev-app-icon-tempa.png      approved app icon, 1024²
├── svg/      12 cropped variants (see §4)
├── png/      transparent PNG of every svg/ variant
├── favicon/  favicon.svg, favicon.ico (16/32/48), favicon-16…512.png
├── app-icons/ ios/ (20–1024), android/ (mdpi–xxxhdpi + playstore 512), web/ (192, 512, apple-touch-icon)
└── animation/weev-logo-animation-1080p.mp4  (source: preview/weev-logo-animation.html)
preview/logos/trashcan/   rejected/broken vectors — never use, never restore without asking
scripts/brand/            the exact scripts that built the vectors, variants and animation (§8)
docs/brand/LOGO.sha256    fingerprints of every file in final/
```

---

## 2. Colours (exact)

| Token | Hex | Used for |
|---|---|---|
| Royal Aubergine (ink) | `#2E1741` | W body, eev, tagline, every Tempa outline, sunglasses |
| Bubblegum Pink | `#DB619B` | W ribbon, cheek blush, confetti |
| Sunshine Gold | `#E8B536` | Accent (dot in tagline line on brand pages, stars) |
| Warm Linen | `#FAF7EF` | Background canvas |
| White | `#FFFFFF` | Gloves, notepad, glasses shine; ink colour in `-white` variants |

Tempa's own fills (from the trace, keep as they are): crown gold `~#FABF0A`/`#EBB455`, feather shading
`#B57E30` / `#9D5F23`, cream body `#F9D9AC`/`#FDEDCB`, belly shade `#D3AB7E`, caramel wing `#CE8B1A`.

---

## 3. Anatomy — what "correct" looks like

### 3.1 The lockup (top to bottom, centred)
1. **Tempa** (mascot) above the wordmark.
2. **Wordmark** `weev`: the heart-ribbon **W** + `eev`, **all four letters the same height, one baseline.**
   The W is NOT bigger than eev (user requirement, rejected twice when it was).
3. `Wedding • Event`, Nunito ExtraBold (800), tracking −0.04 em.
4. `Find Your People. Make It Happen.`, Nunito Bold (700), tracking −0.02 em.

All text and the wordmark are `#2E1741` on light backgrounds, `#FFFFFF` on dark (`-white` variants).

### 3.2 The heart-ribbon W (the most important shape)
- One continuous **aubergine stroke** that forms **two heart lobes**. Each lobe ends in an **inward curl**
  at the top (left curl points right, right curl points left).
- Between the lobes the stroke makes a **teardrop loop** with a **visible teardrop hole** in the middle.
  **The hole must always be there** (it went missing once — that is a bug).
- The stroke crosses itself in an **X** below the loop; the two bottom points of the W are **rounded**.
- A **pink ribbon** (`#DB619B`) with a thin **aubergine border** runs diagonally from the top of the loop
  (upper-left, pointed tip) down to the lower right, ending in a flat cut past the right bottom point.
  It is a clean diagonal band: **no loop, no tail** (a looped ribbon reads as a cancer-awareness ribbon — rejected).
- Built as 3 layers in `<g id="w-mark">`: body (27 nodes, even-odd with the hole), ribbon border (10), ribbon (8).

### 3.3 The `eev` (geometric, rebuilt — not traced)
Coordinates in the 4096 master space (`weev-logo-primary.svg`):
- **e** = elliptical ring, centre (1933.5, 2772.0) and (2436.5, 2772.0) — 503 apart; outer radii 229.5 × 237;
  ring stroke **88**; open at the lower right at **33°** below horizontal, with a **round** terminal;
  horizontal crossbar **77** high across the full inner width (clipped to the outer ellipse).
- **v** = two straight strokes, width **101**, round caps and join: (2735.6, 2591.5) → (2908.5, 2954.5) → (3081.4, 2591.5).
- Both e's must be identical. No wobble, no serif, no italic.

### 3.4 Tempa the Weaver Bird (mascot)
Reference image: `final/weev-tempa-final-nonest.jpg`. Every pose must match it.
- **Species/story:** burung tempua (baya weaver), WEEV = weave. Event-neutral: never rings or hearts on him.
- **Head:** golden-yellow spiky crown (3–4 feather spikes, swept back), cream face.
- **Sunglasses:** wide aubergine (`#2E1741`) wayfarers with **two white diagonal gloss stripes per lens**.
- **Beak:** short, thick, cone-shaped, pale cream; **wide-open happy smile** with pink tongue.
- **Cheeks:** round pink (`#DB619B`) blush, one each side.
- **Body:** round, egg/pear-shaped, cream with a darker tan belly shade and small "V" feather marks on the chest.
- **Wings:** caramel/golden-brown with darker streaks; tail feathers fan out lower right.
- **Hands:** white cartoon gloves (Mickey-style, 3 dark finger lines on the back).
- **Default props (logo pose):** left glove raises a **party popper** (pink/gold stripes) bursting pink and
  gold confetti, stars and streamers; right glove holds a **spiral notepad checklist** (gold header, 3 checkboxes,
  2 ticked, gold star, lilac lines) with a **yellow pencil** (pink eraser).
- **Outline:** bold, even `#2E1741` outline on every shape.
- **No legs or feet visible** in the logo. **No nest** in the primary/app icon; the nest is optional, hero only.
- **Nest (hero only):** woven retort-shaped straw nest with a dark round entrance hole, hanging to his right.

---

## 4. Variants (all in `final/svg/` + `final/png/`)

| File | Use |
|---|---|
| `weev-logo-primary(-white)` | default logo; white = on dark backgrounds |
| `weev-logo-hero(-white)` | with nest: landing hero, banners, App Store art |
| `weev-wordmark-tagline(-white)` | text-only lockup (no Tempa) |
| `weev-wordmark(-white)` | `weev` only: navbar, headers, small spaces |
| `weev-w-mark(-white)` | the W alone: favicon source, watermark, loading spinner |
| `weev-tempa` / `weev-tempa-nest` | mascot only: stickers, empty states (until poses exist) |

App icon = **Tempa head on aubergine** (`weev-app-icon-tempa.png`). Favicon = **white W + pink ribbon on aubergine rounded square**.

---

## 5. Allowed / not allowed

**Allowed:** scale proportionally · swap ink between `#2E1741` and `#FFFFFF` by using the `-white` files ·
place on `#FAF7EF`, white, or `#2E1741` · crop to the provided variants.

**Not allowed:** redraw or re-trace · change the W size relative to eev · remove the W hole · add a loop/tail to
the ribbon · change fonts · stretch, skew, rotate, outline, shadow, gradient · put rings/hearts on Tempa ·
recolour Tempa · use anything from `trashcan/` · use the old brain mascot or Concept B serif logo.

Clear space: at least the **height of the `e`** on all sides. Minimum size: wordmark 80 px wide,
full logo 120 px wide, W mark 16 px (favicon tested at 16 px).

---

## 6. Making new Tempa poses (the 11-pose plan)

AI generation is allowed **only** for new poses, and only like this:
1. Always attach `final/weev-tempa-final-nonest.jpg` as the reference and paste §3.4 into the prompt.
2. One pose per image, square, `#FAF7EF` background, no text, no wordmark.
3. Compare the result side by side with the reference: crown, glasses + 2 gloss stripes, beak, blush,
   gloves, outline weight, colours. Reject anything that is not clearly the same bird.
4. Fix small issues by editing the generated image, not by rerolling everything.
5. When approved, vectorise with the pipeline in §8 and add to `final/poses/` + update `LOGO.sha256`.

Poses planned: wave (onboarding) · binoculars (search/loading) · checklist (planner) · thumbs up (booking
confirmed) · party popper (success) · sleeping in nest (empty) · head scratch (error) · pointing (tips) ·
chat bubble (chat) · money jar (Tabung) · envelope (Kad & RSVP).

---

## 7. Animation

`preview/weev-logo-animation.html` (source) → `final/animation/weev-logo-animation-1080p.mp4` (1080p60, 5.5 s).
Sequence: W written in **one pen stroke** (left curl → left lobe → up through the loop → right lobe → right curl)
with a soft twist → pink ribbon flows top to bottom → `eev` writes itself (bar → ring → tip, then v) →
tagline rises. Pen path waypoints: `scripts/brand/wpen.py`. Re-export: `node scripts/brand/record.js` then ffmpeg (see §8).

---

## 8. How the vectors were built (reproducible)

Tools on the home PC: Real-ESRGAN (`~/tools/realesrgan`, model `realesrgan-x4plus-anime`),
VectorCraft CLI (`C:\Program Files\VectorCraft\vectorcraft-cli.exe`), Python (Pillow, numpy, scipy,
potracer, scikit-image, fonttools), Nunito VF (`~/tools/fonts/Nunito-VF.ttf`, OFL), Edge, Playwright, ffmpeg.

1. Upscale approved JPG ×4 with Real-ESRGAN anime → 4096².
2. Key background + letter holes to pure green.
3. VectorCraft Image Trace (`scripts/brand/vectorcraft-trace.json`: colour, 20 colours, paths 15, corners 25,
   noise 30, overlapping, ignore `#00ff00`) → Simplify (tolerance 1.2) → snap ink to `#2E1741`, ribbon to `#DB619B`.
4. `rebuild.py`: remove traced text/eev, add geometric eev + Nunito text outlines, drop specks.
5. `wbuild.py`: replace traced W with the smooth 3-layer W (keeps the hole; cleanup zone limited to the W).
6. `variants.py` + `crop.py`: build and crop the 12 variants; PNG/favicon/app icons via Edge headless + Pillow.
7. Animation: `anim_build.py` → HTML; `record.js` (Playwright + Edge, frame-exact) → `ffmpeg -framerate 60 -i f_%04d.png -c:v libx264 -pix_fmt yuv420p -crf 16`.

Scripts expect their inputs (upscaled PNGs) in the working folder; regenerate them with steps 1–2.

---

## 9. Change log

| Date | Change | Approved |
|---|---|---|
| 2026-11-18 | Logo approved: mascot-6 Tempa + Direction 1 heart-ribbon W at eev height | user ("yess!!!! like this") |
| 2026-11-18 | App icon (Tempa head) approved | user |
| 2026-11-19 | Vector masters, logo kit v1, animation + MP4 | user |
