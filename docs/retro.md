# Retro: Majlis Hub

- **Project:** Majlis Hub (customer app, Wave 1)
- **Phase:** 5, front-end build (React 19 + Vite + Tailwind v4 + Lucide), `src/`
- **Date:** 2026-11-11
- **Sources:** `/Users/fahi.abss/project-wedding-repo/conversation.md` (prototype corrections 2026-11-06 to 2026-11-10) + user instructions 2026-11-11
- **Stakeholder feedback (10 points):** see `docs/MODULE_FEATURE_SPEC.md` v2.0 header and rows. Not copied here.

Every rule below was first fixed in `preview/prototype.html`. Status ☐ = not yet checked in the React app.

---

## Standing user rules

| # | Rule | User's words | Status (React) |
|---|---|---|---|
| U1 | Mobile-first. Phone screen is the target. | "we using mobile take note" | ☐ |
| U2 | No visible scrollbars anywhere; pages still scroll. | "all page have scroll i dont want that. we using mobile take note." | ☐ |
| U3 | Every back button must work on a real tap, and return to where the user came from. | "then please fix back button." | ☐ |
| U4 | Full-bleed media: Inspirasi video fills the screen behind a transparent status bar. | "make sure full" | ☐ |
| U5 | Home hero: green gradient + pattern background. | "home page, can you make background gradiant (green + pattern)" | ☐ |
| U6 | Home hero: no radius, no corner stroke gaps, event card blends in (borderless). | touch-ups: no radius, no corner gaps, blend the card in | ☐ |
| U7 | Home hero bottom fades green into white (kertas), 150px fade, 104px bottom padding. | "i mean greend and white blend" | ☐ |
| U8 | Do not tighten the hero. "1 step" was reverted; ask what "1 step" means before moving any layout. | "drag to up 1 step" then "revert back please." | ☐ |
| U9 | Home categories use the isometric illustrations (not line icons), with a green drop shadow. Small icons elsewhere stay Lucide. | "kan u but greend shadow there" / "nice2. thanks." | ☐ |
| U10 | Photos, video and illustrations come from AGY (pane 3) only. No Wikimedia or stock. | "hhmm the photo look fuck. hahaaha, go ask pane 3 help to generated for you." | ☐ |
| U11 | Phase 5 is front end only: mock data, simulated payments, nothing sent or charged. | "no need backend just front end bro." | ☐ |
| U12 | Phase 5 code follows `figma-standard-ui`; every build wave is checked by Retro, PM and QA agents before it is shown. | "went you build this consider to use /figma-standard-ui and call retro agent pm and QA agent to check your work." | ☐ |
| U13 | Trust feel, minimal text. | "i want the apps feel trust confident. went user read the apps. ohh, i trist this apps." | ☐ |

---

## Code rules

### C1. Visible scrollbar
- **User:** "all page have scroll i dont want that. we using mobile take note."
- **Found in:** prototype, every page (fixed with `.phone *{scrollbar-width:none}`)
- **Symptom:** Scrollable containers showed a desktop scrollbar inside the phone frame.
- **Detect:** `grep -nE "scrollbar-width:\s*none" src/index.css && grep -nE "::-webkit-scrollbar\s*\{\s*display:\s*none" src/index.css` must both hit. Then `grep -rnE "scrollbar-(thin|auto|gutter)|scrollbar-width:\s*(auto|thin)|::-webkit-scrollbar\s*\{[^}]*(width|height):\s*[1-9]" src` must return nothing. Playwright: on every route, `document.querySelectorAll('*')` with `scrollHeight>clientHeight` and `offsetWidth-clientWidth>0` must be empty.
- **Fix:** Keep the global rule in `src/index.css` `@layer base`: `* { scrollbar-width: none; } *::-webkit-scrollbar { display: none; }`. Remove any local override.
- **Exceptions:** Scrolling itself stays (`overflow-y-auto` is fine). Do not set `overflow:hidden` to "fix" it.
- **Side effects:** None.
- **Status:** global rule ✅ present in `src/index.css` · per-route Playwright check ☐

### C2. Back button covered by an overlay
- **User:** "then please fix back button."
- **Found in:** prototype vendor gallery (`.gallery .top`, heart button)
- **Symptom:** The heart button's `::after{inset:-4px}` hit-area expander had no positioned parent of its own, so it anchored to `.gallery .top` and covered the back button. Taps went to the heart.
- **Detect:** `grep -rnE "(after|before):(absolute|inset)|after:-?inset|before:-?inset|-inset-|inset-\[-|absolute inset-0" src --include=*.tsx` and, for each hit, confirm the nearest ancestor with `relative` is the element itself or its own wrapper, not a header/top row that also holds a `TopBar` back button. Playwright: for every route that renders `TopBar`, do a real `page.getByRole('button',{name:'Kembali'}).click()` (no `force:true`) and assert the URL changed; also assert `document.elementFromPoint(center of back button)` is the button or inside it.
- **Fix:** Give the element that owns the expander `relative` (Tailwind `relative`). Keep expanders inside their owner. Back button sits above overlays (`relative z-10` on the TopBar row if a full-bleed image/gradient is behind it).
- **Exceptions:** Full-screen sheets/modals that are meant to block the page.
- **Side effects:** Back must return to the origin screen, not always home: `TopBar` `back(fallback)` uses history first, `fallback` only on deep link. Check vendor screen opened from Search, Compare and Inspirasi.
- **Status:** ☐ all `TopBar` routes

### C3. Hero gradient, pattern and fade must be real elements
- **User:** "home page, can you make background gradiant (green + pattern)" / "i mean greend and white blend"
- **Found in:** prototype `.home-hero` (gradient + gold radial glow + songket diamond SVG pattern; fade was `.home-hero::after`)
- **Symptom:** In the prototype the green-to-white fade was a `::after`. Pseudo-elements do not exist in the DOM tree, so they vanish in html-to-Figma capture and break figma-standard-ui layer mapping (U12).
- **Detect:** `grep -nE "(before|after):|::before|::after" src/modules/home/HomeScreen.tsx src/index.css` must return no hero-related hits. Playwright: hero has child elements for gradient, pattern and fade (e.g. `[data-layer=hero-fade]`).
- **Fix:** Render the gradient as the hero's own `background`, the pattern as an `<svg>` or `<div>` child (`absolute inset-0 pointer-events-none`), and the fade as a `<div>` child 150px tall, `linear-gradient(to bottom, transparent, var(--color-kertas))`, `pointer-events-none`. Hero bottom padding 104px (U7, U8).
- **Exceptions:** `.skeleton` shimmer and other non-hero CSS-only effects.
- **Side effects:** Decorative children must be `pointer-events-none` and `aria-hidden` so they do not repeat C2.
- **Status:** ☐ Home

### C4. Hero full-bleed: no radius, no corner gaps
- **User:** touch-ups: no radius, no corner stroke gaps, blend the card in
- **Found in:** prototype Home hero + event card + status bar
- **Symptom:** Hero had rounded corners and a stroke, leaving light gaps at the corners; the event card had a border that separated it from the hero.
- **Detect:** `grep -nE "rounded|border|ring-|mx-|m-[1-9]" ` on the hero root and event-card lines in `src/modules/home/HomeScreen.tsx`. Playwright: hero `getBoundingClientRect()` left = 0, width = viewport width, top = 0; computed `border-radius` = `0px`, `border-width` = `0px`.
- **Fix:** Hero root `w-full rounded-none border-0`, no horizontal margin, starts at top 0 behind a transparent status bar. Event card: no border, no ring; separate with shadow only (`shadow-float`).
- **Exceptions:** Cards below the hero keep their brand radius.
- **Side effects:** Status bar text/icons must stay readable on green (light variant).
- **Status:** ☐ Home

### C5. Inspirasi video full-bleed
- **User:** "make sure full"
- **Found in:** prototype Inspirasi feed
- **Symptom:** Video did not cover the screen; status bar sat on its own background.
- **Detect:** Playwright on `/inspirasi`: each `video` rect equals the viewport (width and height), `object-fit` = `cover`; status bar/top bar background is transparent.
- **Fix:** Reel container `fixed inset-0` (or `h-dvh w-full`), `<video className="w-full h-full object-cover">`, top bar transparent over it.
- **Exceptions:** None.
- **Side effects:** Back/close buttons over video need contrast (white/95 chip, as `TopBar transparent`).
- **Status:** ☐ Inspirasi

### C6. Category art: isometric PNG + green shadow
- **User:** "kan u but greend shadow there"
- **Found in:** prototype Home "Kategori" grid (commits abd18b2, 3fb0bbf)
- **Symptom:** Line icons looked generic; art without shadow looked flat.
- **Detect:** `grep -rn "img/cat/" src --include=*.tsx` must hit for every category tile; `grep -rnE "drop-shadow" src/modules/home/HomeScreen.tsx` must hit. `ls public/img/cat/` must hold one PNG per category in spec v2.0.
- **Fix:** `<img src="/img/cat/cat-<key>.png" alt="" className="... [filter:drop-shadow(0_6px_6px_rgba(14,94,75,.28))]">`. New v2.0 categories (Bride Assistant, Inai, Kompang, Penyanyi) need new art from AGY in the same style, never a reused or similar image.
- **Exceptions:** Small icons elsewhere stay Lucide line icons. Art stays at 256px (intentional, see M3).
- **Side effects:** Brief AGY with the original 13:08 style block.
- **Status:** ☐ Home

### C7. Media only from AGY
- **User:** "hhmm the photo look fuck. hahaaha, go ask pane 3 help to generated for you."
- **Found in:** mood board (Wikimedia placeholders)
- **Symptom:** Stock/Wikimedia photos looked off-brand.
- **Detect:** `grep -rnE "https?://[^\"' ]+\.(jpe?g|png|webp|mp4|gif)|wikimedia|unsplash|pexels|picsum|placehold" src` must return nothing. Every `src=` points under `/img/` or `/video/` in `public/`.
- **Fix:** Use existing `public/img/gen`, `public/img/cat`, `public/video` files, or brief AGY (no text, no logos, Malaysian setting, brand palette).
- **Exceptions:** Lucide icons.
- **Side effects:** Check each new AGY image for slipped-in text before use.
- **Status:** ☐ all modules

### C8. Front end only, no network
- **User:** "no need backend just front end bro."
- **Found in:** Phase 5 scope (spec v2.0 "Build scope")
- **Symptom:** n/a (preventive).
- **Detect:** `grep -rnE "fetch\(|axios|XMLHttpRequest|WebSocket|supabase|firebase|stripe|import\.meta\.env\.VITE_.*(KEY|URL)" src` must return nothing. Playwright: no requests to non-localhost hosts while clicking through booking deposit and Tabung.
- **Fix:** Read/write from `src/data` mock + `src/store.tsx`. Payments show a simulated success screen labelled as demo.
- **Exceptions:** Google Fonts stylesheet.
- **Side effects:** None.
- **Status:** ☐ all modules

### C9. figma-standard-ui layout
- **User:** "went you build this consider to use /figma-standard-ui and call retro agent pm and QA agent to check your work."
- **Found in:** Phase 5 standing rule
- **Symptom:** n/a (preventive). Layouts built with margins, absolute offsets or pseudo-elements do not map to Auto Layout.
- **Detect:** `grep -rnE "\b-?m[trblxy]?-[0-9]|\bspace-[xy]-|-m[trblxy]?-[0-9]|absolute" src --include=*.tsx` and review each hit; spacing must be `gap-*` + padding. Row containers `flex w-full` with `justify-between`; text `min-w-0`, metadata `truncate`; no `opacity-*` on active/completed text.
- **Fix:** Replace margins with parent `gap`; replace `space-*` with `flex flex-col gap-*`; truncation via `truncate`; drop text opacity, use colour tokens (`text-muted`).
- **Exceptions:** Decorative absolute layers (C3), sheets/modals, video overlays (C5). `mx-auto` for centring.
- **Side effects:** Re-run C2 after moving anything.
- **Status:** ☐ all modules

### C10. Review gate before showing
- **User:** same as C9.
- **Detect:** Each wave has a Retro pass (this file updated), a PM check against `docs/MODULE_FEATURE_SPEC.md` v2.0 rows, and a QA Playwright run (C1, C2, C5 checks) logged before the user sees it.
- **Fix:** Do not show a wave until all three are logged.
- **Status:** ☐ Wave 1

---

## Mistakes & lessons

### M1. Heart `::after` hit-area covered the back button
- **What:** 44px hit-area expander (`::after{inset:-4px}`) on the gallery heart anchored to the wrong positioned parent and swallowed taps on back.
- **Found by:** real Playwright clicks, not screenshots.
- **Lesson:** Hit-area expanders need their own `relative` owner. Verify back buttons with real clicks (no `force`), every route. → C2.

### M2. `between()` regex edit deleted helper functions
- **What:** A scripted edit that replaced text between two markers matched a wider span than intended and removed helper functions in between.
- **Lesson:** Regex/marker replacements over a large file must be anchored to unique markers and followed by a diff check (count functions before/after, run the page). Prefer exact-string edits.

### M3. AGY "fixed" the intentional 256px resize
- **What:** Claude-1 downscaled the category art 1024 → 256px on purpose. AGY saw the size change as a bug and kept regenerating/"fixing" the images until told to stop.
- **Lesson:** When a helper agent shares the same files, tell it which edits are intentional and which files are now off-limits, in the same message that hands off the work.

### M4. Moved layout on an unclear instruction ("1 step")
- **What:** "drag to up 1 step" was read as tightening padding 104→72 and fade 150→120. The user asked to revert.
- **Lesson:** When a spatial instruction is ambiguous, ask what it means (which element, which direction, how much) before changing layout. → U8.

### M5. Wikimedia placeholders on the mood board
- **What:** Stock photos were used as placeholders and the user rejected them.
- **Lesson:** Placeholder media is still judged as design. Brief AGY from the start. → C7.

---

## Deferred

- B4 vendor and admin screens (Wave 2), including V-8 video upload and A-7 moderation.
- Real motion video (Veo/Runway or vendor footage); current reels are Ken Burns clips over stills.
