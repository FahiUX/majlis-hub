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
9. **Software House Dynamic Persona Scoping:** Never force a rigid number of user role tabs. Adapt dynamically (2-3 for simple tools, 3-4 for marketplaces/e-com, 4-5 for SaaS/training portals, 6-8+ for ERP/healthcare).
10. **Micro-UI Details in BA Specs:** Every feature specification MUST explicitly detail UI micro-interactions (live search bars, date/status filters, pagination, export buttons, action icons, drawer modals, eye password toggles) so designers and developers never have to guess.
11. **UI/UX "Master Screen → Clone & Tweak" Advisory:** The BA must actively advise the designer on scoping: build the ~12-15 Master Screens (Admin full view), then clone and toggle components for Staff roles to cut design time by 75%.
12. **Settings Hierarchy Separation:** Keep personal account settings (`My Profile`, Password, 2FA, Theme) accessible to all users, while restricting business/entity configuration (Legal Name, BRN, Base Currency, Fiscal Year, Tax Codes) strictly to Admins.
13. **Transaction Lifecycle & Immutability:** Transactional business records must follow `Draft` ➔ `Posted` ➔ `Void/Reverse`. Finalized/posted records must never be directly deleted; corrections must generate a balanced reversing entry with a mandatory audit reason.

14. **Rules Run Page-Wide:** When the user corrects one screen, apply the rule to every screen and module that shares the pattern in the same turn, and back-fill it on screens finished earlier. Never wait for the user to find the same bug twice.
15. **Code-Faithful Figma Fixes:** Read the TSX class before any page-wide sizing change (`flex-1` = Fill, `w-fit` = Hug, `w-[Npx]` = Fixed). A blind page-wide pass once hit 20 wrong rows.
16. **The User's Hand Fix Is the Reference:** Read the properties of what the user fixed by hand and apply that pattern; search the retro before inventing a size.
17. **Capture Every State:** Every tab, toggle, accordion, drawer and modal needs its own Figma frame; the default view alone is never enough.
18. **No Truncation:** Show full text everywhere; only fixed-height table rows and single-line inputs truncate.
19. **Clones & Transfers Match by Name + Type:** Layout transfers between twin screens and cross-page clones must match children by name and type; clones lose prototype reactions and must be re-wired.
20. **Shared Views Need Context Props:** A shared view without the current user / module shows another module's persona.
21. **Finish Every Pass With Verification:** Re-fit sections, restack, then run a verify script (gaps, links, clipping, reachability). One writer per Figma page; batch calls (Figma MCP has a per-seat limit).

---

## 📓 Session Changelog & Retrospectives

### 2026-09-29 — Software House BA & UI/UX Handoff Framework Masterclass
- **What Worked Well:**
  - Standardized feature matrices using the enterprise role-based UAT format (`No`, `Module`, `Features`, `Explanation`, `UI Component`, `Tester`, `Comments`).
  - Proactive discovery technique: Presenting Options A/B/C with clear BA Recommendations to resolve ambiguous requirements rapidly.
  - Successfully bridged business accounting rules to Figma design components (e.g. 2-Pane Split Reconciliation, Real-Time Imbalance Indicators, Overdue row color highlighting).
- **Friction Points / Human Corrections:**
  - Initial BA specs were overly abstract and segregated roles into isolated systems instead of modern unified SaaS architecture.
  - Designer lacked micro-UI interaction details and was overwhelmed thinking every role needed 80+ separate screens from scratch.
- **Permanent Fix Applied:**
  - Upgraded `.agents/02_requirement_analyst_agent.md` and `templates/MODULE_FEATURE_SPEC_TEMPLATE.md` to enforce the Software House BA Universal Framework with the "Master Screen → Clone & Tweak" design scoping advisory.

### 2026-10-11 — Figma Digital Twin Retro (7 modules, ~400 screens)
- **What Worked Well:**
  - A dedicated Retro Agent logging every user correction as a Detect / Fix rule, then running it as a checklist on every module.
  - Fixing shared views once and transferring the layout to every module's twin screens.
  - A final audit with read-only auditors, then one fixer per page and a scripted verification.
- **Friction Points / Human Corrections:**
  - The sweep caused repeat breakages (collapsed buttons, oval circles, Fill labels pushing badges away, truncated text); the user had to flag the same pattern on several modules.
  - Rules were first applied frame by frame instead of page-wide; new rules were not back-filled.
  - Default-only captures missed tabs, accordions and overlay states.
- **Permanent Fix Applied:**
  - Added `.agents/08_retro_agent.md`; rewrote `.agents/07_figma_ai_agent.md` (state inventory, repair page-wide, prototype standard, final audit); Permanent Rules 14-21.
  - Updated the global `figma-standard-ui` skill (GRID for >6 cards, no truncation, code-faithful Hug, button/input/circle standards, gap 500, `references/figma-repair-rules.md`).

### 2026-11-14 — Chat Photo/Video (Majlis Hub, task 1 of 4)
- **What Worked Well:**
  - A stakeholder report ("chat can't share photos/videos") turned into an ordered task list agreed with the user (1 → 4 → 3 → 2) before any code.
  - Real gallery/camera picker, caption preview, video bubble, full-screen viewer; the vendor inbox now renders media (it showed blank bubbles before).
  - Photos downscaled to 1080px JPEG data URLs so they survive reload; videos are session-only blob URLs with a "Video tamat" placeholder, stated rather than hidden.
  - Verified with a real file upload in Playwright: 0 console errors.
- **Friction Points / Human Corrections:**
  - The build ran without calling the UI/UX and Retro agents first. User: "call the ui.ux agent and retro agent." UI/UX review is running after the fact.
  - The repo here (`Documents\GitHub\project-wedding-repo`) is not the deploy repo (`FahiUX/majlis-hub`), so the change is not live yet.
- **Rule Going Forward:**
  - Any user-facing feature: brief the UI/UX agent (and open a Retro entry) **before** writing code, not after. Resuming on another machine does not skip the agent loop.
  - When reporting "done", say which repo it is in and whether it is live.

### 2026-11-14 — WhatsApp-style Chat (Majlis Hub, task 1, round 2)
- **What Worked Well:**
  - Second pass covered what the user listed: documents (PDF/Word/Excel/PPT ≤20 MB), day separators + HH:MM, album grid, swipe gallery, per-photo captions, reply / copy / delete (for everyone / for me) via long-press or right-click; vendor inbox reuses the same bubbles.
  - Store key bumped `majlishub.v3` → `v4` so old chats with "Isnin" in the time field are dropped instead of migrated badly.
  - Verified by real clicks: 0 console errors.
- **Friction Points / Human Corrections:**
  - User: "what isnin? i need time also." Seed messages showed only a weekday.
  - The first version was a minimal pass; the user had to list the WhatsApp behaviours one by one.
  - Media bubbles stretched full width: `w-fit` beat `w-[240px]` in the same class string.
- **Rule Going Forward:**
  - When a stakeholder says "like WhatsApp" (or any named app), list that app's behaviours up front and agree the list before building, not a minimal first pass.
  - Never put two width (or other same-property) Tailwind classes on one element; pick one, and check the rendered size.

### 2026-11-19 — App rebrand to the locked WEEV palette (home PC)
- **What Worked Well:**
  - Kept the legacy token names (`hijau`, `emas`, `kertas`) and remapped their values, so every screen switched in one `index.css` change; mapping table added to `DESIGN-SYSTEM.md` the same day.
  - Logo files reach the app only as byte copies (`scripts/brand/sync-public.sh`), checked against `LOGO.sha256` by the script, the pre-commit hook and the Brand lock CI.
  - Contrast checked before choosing roles: brand pink is 3.2:1 on linen, so pink text uses `pink-teks` (#A8336C, 5.9:1).
- **Friction Points / Human Corrections:**
  - UI/UX agent caught leftovers the token swap can't reach: green 3D category icons (`public/img/cat`), a hard-coded green shadow, and pink defined but unused.
  - Splash first filled ~85% of the width and broke the logo clear-space rule; the video edge showed because the bg colour was sampled from the file, not the rendered page.
- **Rule Going Forward:**
  - Any copy of a locked brand file outside `final/` is made by a hash-checking script and sits under the same `-text` rule, hook and CI check.
  - A rebrand updates `DESIGN-SYSTEM.md` and `BRAND_GUIDELINES.md` in the same change; after a token swap, grep for hard-coded rgba/hex and check raster art.
  - Splash pattern: cold open of Home only, tap to skip, reduced motion off, timeout fallback, logo keeps its clear space.

### 2026-11-19 — New art + BM reels (home PC, Claude + AGY)
- **What Worked Well:**
  - 10 category icons in the WEEV palette (AGY/Gemini, style locked on 2 before the other 8), 15 photoreal photos with varied real colour themes (3 AGY + 12 Qwen-Image 3.0 driven over Dia CDP), 5 Bahasa Melayu reels (Google Flow, Veo 3.1 Lite). Photos 13 MB → 2.7 MB; reels ~1.5 MB each with audio.
  - Reels were always `muted`; added a feed-wide Senyap/Bunyi toggle so the BM speech can be heard.
- **Friction Points / Human Corrections:**
  - A script saved the kompang photo as `venue.jpg`; one bride came out European and was regenerated as Malay.
  - Flow's Omni 1.2 Flash quoted 24 credits per clip; the user stopped it: "use the cheap one". Veo 3.1 Lite = 10.
  - One prompt was falsely flagged "prominent people" (refunded). Flow downloads only worked by hand.
- **Rule Going Forward:**
  - After any scripted download, look at the file before shipping (right subject, people match the brief).
  - Before a paid run, write credits per output + budget and use the cheapest model that meets the brief; ask before anything pricier.
  - Video prompts with people say "fictional everyday people"; plan Flow downloads as a manual user step.
  - Raw renders live in `preview/rerender/` (gitignored); move them off-repo after the user signs off.
