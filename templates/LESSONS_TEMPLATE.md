# 📝 Continuous Learning Ledger (`LESSONS.md`)

This file records real-world lessons, gotchas, friction points, and edge cases discovered during project development. The Manager Agent consults this ledger at the start of every session to ensure past mistakes are never repeated.

---

## 🏛️ Permanent Architectural Rules (Auto-Loaded)

1. **Table Structure:** Always build tables using the **column-based pattern** (`Column Grid` ➔ `Col N` ➔ `Header Cell` + `Data Cells`). Row-based grouping breaks auto-layout alignment across varying content lengths.
2. **Figma Outer Body Padding:** HTML capture often bakes 64px padding from `<body class="p-16">` into the root frame. Always run `figma_sanitizer.py` to zero out root frame padding.
3. **Float32 Corner Radius:** Sweep for pill tags with `cornerRadius > 9999` and force reset to `9999` to avoid float32 export bugs.
4. **Icon Cold-Cache Defense:** When capturing HTML to Figma, verify `VECTOR` count > 0. If zero vectors are detected, wait 2500ms for Iconify SVGs to warm up before recapturing.
5. **No Monolithic TSX Files:** Keep all page components decomposed under `< 300` lines in `src/components/`.
6. **Reference Standard, Never 1:1 Clone:** Reference past work only for quality, hierarchy, and density standards. Never copy fonts, brand tokens, or layout cards 1:1. Each project must have an authentic, bespoke visual identity.
7. **Prototypes Are Real Products, Not Token Showcases:** Phase 2 prototypes must simulate the actual application workflows and states (e.g. kiosk screens, transactional tables, user flows), never an artificial token swatch page.
8. **Zero Brand Cross-Contamination:** Maintain absolute isolation. Never mention past project or client names in chat messages, code, or documentation.
9. **Never Silently Pre-Filter the Design Catalog:** When offering `awesome-design-md` options, always show the user the full live catalog first, not a hardcoded shortlist — an undisclosed filter reads as the assistant deciding on the user's behalf.
10. **Recommend from the Real Doc, Not Brand Reputation:** Before recommending a design direction, fetch and read the actual `design-md/<brand>/DESIGN.md` content. A brand's public image can be wrong about its documented visual language (e.g. one fintech brand's real doc turned out to be a vivid lime-green 900-weight display system, not the muted institutional look its reputation suggested).
11. **Clone the Real File, Don't Paraphrase It:** Once the user picks a design direction, download the actual `DESIGN.md`/`README.md` into `docs/design-reference/` in the project repo and commit/push it. The Design Engineer Agent must ingest that real file, never a chat summary of it.
12. **Three Distinct Design Deliverables, Not Two:** `preview/moodboard.html` (concept: imagery, texture, tone, adjectives — built and reviewed FIRST), `preview/design-tokens.html` (implementable spec: swatches, type scale, component variants), and `preview/prototype.html` (real product screens) are all required at Gate 2. An earlier run conflated the mood board with the token page and shipped only two files — corrected: a mood board that's actually a component spec sheet isn't a mood board, it just has the wrong name.
13. **Mood Board Imagery Must Be Generated or Royalty-Free — Never Arbitrary:** Every image on `moodboard.html` must be either (a) AI-generated, or (b) verified royalty-free/freely-licensed stock with a confirmed license (e.g. Wikimedia Commons CC BY/CC BY-SA/public domain — no API key required). Use an image-generation tool if this session has one; otherwise source real royalty-free photos (verify the URL resolves, attribute the license inline). Never ship an all-abstract CSS collage as if it were photography without disclosing that no image tool was available. If another available agent/session has image generation and this one doesn't, say so and offer to hand off rather than silently settling for less.
14. **Explicit Font-Family Specimens, Not a Buried Row:** On the design-tokens page, give every typeface (primary, secondary/mono) its own large "Aa" specimen block labeled with its role, before the type-scale table. A second typeface reduced to one small row in a size table reads as "there's only one font," even when it's technically present.
15. **Inspect Generated Images Before Shipping:** AI-generated reference photos can contain incidental text/branding (a fictional or real third-party name rendered on a screen prop, a real country's ID card, etc.). Inspect every generated image and disclose anything like this inline — it must never be mistaken for this project's own branding.

---

## 📓 Session Changelog & Retrospectives

### [YYYY-MM-DD] — [Feature or Module Name]
- **What Worked Well:**
  - [Example: Fast prototype approval using the HTML visual preview]
- **Friction Points / Human Corrections:**
  - [Example: User flagged inconsistent badge padding]
- **Permanent Fix Applied:**
  - [Example: Added strict Badge component spec to BRAND_GUIDELINES.md]
