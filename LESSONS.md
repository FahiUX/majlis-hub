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
