# Pre-Flight Audit: Majlis Hub (Phase 2 → Phase 5 gate)

**Auditor:** Pre-Flight Auditor Agent (`.agents/04_preflight_auditor_agent.md`)
**Date:** 2026-11-10
**Inputs:** `docs/MODULE_FEATURE_SPEC.md` v1.0 (all §9 decisions accepted) · `docs/BRAND_GUIDELINES.md` v1.0 · `preview/prototype.html` (678 lines) · `preview/design-tokens.html` · `figma-standard-ui` skill
**Scope note:** The Phase 2 prototype covers the **Customer** journey only, which was intentional. Uncovered rows are still listed below. A row is a 🔴 BLOCKER only when it has no approved master to clone from. Rows that clone an approved master are 🟡 WARNINGs, and the master is named.

## Verdict summary

| Tag | Count |
| :--- | :---: |
| 🔴 BLOCKER | **5** (B1–B5) |
| 🟡 WARNING | **54** = 31 layout/token/state rules (W1–W31) + 18 feature-coverage rows (§1) + 4 screen-state rows (§2) + 1 decision (§4c) |
| 🟢 PASS | **11** (4 feature rows, 2 screen states, 3 RBAC checks, 1 Hug/Fill pattern, 1 token-match block) |

**Verdict:** The approved customer masters (M1 Home, M2 Search, M3 Vendor Profile, M4 Booking Sheet, M5 Planner) are solid and close to brand. **Customer-journey coding can start once B1, B2, B3 and B5 are resolved.** B4 blocks only the Vendor/Admin build, so you can schedule it as a second Phase 5 wave.

### 🔴 Blockers

| # | Blocker | Why it blocks | Resolution (pick one) |
| :---: | :--- | :--- | :--- |
| B1 | **M13 Auth isn't prototyped** (G-2.0: phone+OTP, email+password, role choice, 60s resend). The guest login wall (G-1.0 "Log in to request" CTA swap, C-2.4 guest heart → login) isn't shown either. The prototype assumes "Aina" is always logged in. | M13 is a master with no approved pattern, and every customer action (book, save, compare, planner) sits behind it. | Add 3 frames to the prototype: login/register, OTP (incl. error and countdown), and the guest M3 with the swapped CTA. Or the user signs off on designing auth directly in code from §8 input/button specs. |
| B2 | **M8 Stepper isn't prototyped.** C-3.0 Create event (customer) and V-1.0–V-1.3 onboarding (vendor) both depend on it. The prototype hardcodes `EVENT` (prototype.html:400). | The customer can't reach the planner in real use without creating an event, and no wizard pattern exists to clone. | Prototype the 4-step stepper once (customer event wizard), then clone it for vendor onboarding. |
| B3 | **M7 Chat thread isn't prototyped** (C-4.3, V-7.0). Inbox rows are dead buttons with no handler (prototype.html:559). | It's a master with business rules that need a visual: phone number revealed only after Accepted, photo send, sending tick, failed → tap to retry, "Say hi" empty state. | Add 1 thread screen with those 4 states, reachable from the inbox rows. |
| B4 | **Vendor and Admin desktop masters M9 Dashboard shell, M10 Data table, M11 Calendar manager and M12 Verification split screen are all unprototyped.** That covers 0 of 17 V-/A- rows. The desktop layout (sidebar 248px, 1280 content) has never been tested. | No approved pattern exists for any Vendor/Admin screen, and the §2 clone table derives all of them from these masters. | Run a Phase 2b prototype round for M9–M12, desktop 1440. **Customer Phase 5 doesn't need to wait for it.** |
| B5 | **Rule conflict between BRAND §8 and the auditor/Figma standard.** Brand specifies fixed heights (`h-12` button/input, `h-9` chip, `h-14` search pill) and `max-w-[1280px]` (§1). Checklist #4 and figma-standard-ui 6A/§9 ban `h-*` on buttons/pills/inputs and ban `max-w-*`. Brand also contradicts itself: §8 sets the touch-target minimum at 44px, but the chip is 36px and the heart is 36px. | The Phase 5 coder builds `<Button>`, `<Input>` and `<Chip>` first. With two rules, they'll guess. | Amend BRAND §8 to padding-based sizing that keeps the same visual heights: button/input `py-3.5 leading-5` (48), chip `py-2 leading-5` (36), pill `py-1 leading-4` (24), search pill `py-1.5` + 44 orb (56). Replace `max-w-[1280px]` with `w-full px-6 lg:px-8` on a 1440 frame. Keep 36px chips/hearts visually and extend the hit area to 44. |

---

## 1. Feature reconciliation scan

Legend: ✅ covered · ◐ partial · ❌ not prototyped · n/a deferred

### Guest & Customer

| ID | Cov. | Evidence / gap | Tag | Recommendation / clone source |
| :--- | :---: | :--- | :---: | :--- |
| G-1.0 Discover | ◐ | Home works (416–437). Missing: guest CTA swap, location-denied state, home skeleton/error. | 🟡 | Guest CTA swap goes in B1. Clone the search skeleton/error (463–464) for Home. |
| G-2.0 Auth | ❌ | Not prototyped. | 🔴 B1 | — |
| G-3.0 Language | ✅ | BM/EN toggle in the topbar (561), full copy tables (330–371). Missing: toggle in profile (no profile screen). | 🟢 | Profile entry goes with C-6.0. |
| C-1.0 Search | ◐ | Category tiles OK (431). The search pill is a button that jumps to Catering (422). There's no text input, no live autocomplete and no BM/EN keyword match. The backbar search icon is dead (470). | 🟡 | Design in code as M2 header + suggestion list (reuse `.crow` rows). |
| C-1.1 Location | ◐ | Radius slider sheet with live count (573–582), "within 70 km" bar, km on cards. The **State → District mode is a dead toggle** (576). GPS-denied fallback is missing. | 🟡 | Add a State/District select pair inside the same sheet (M4 sheet pattern, §8 input). |
| C-1.2 Filters & sort | ◐ | 4 chips + sort select (472–474), live count. Missing: price range, pax capacity, date picker (fixed "14 Feb"), "all filters" bottom sheet, "remove strictest filter" empty hint. Verified can't be turned off (633). | 🟡 | Clone the location sheet (573) for the full filter sheet. |
| C-1.3 Map | n/a | Deferred per §9 #1. Correctly absent. | 🟢 | — |
| C-1.4 Compare | ✅ | Tick, tray, max 3 toast, compare table (446–447, 476, 583–590). Missing: "Add 1 more" hint (the button is only dimmed, 476) and the mixed-category hint (compare clears on category change, 627). | 🟡 | Add a hint line in the tray. |
| C-2.0 Vendor profile | ◐ | Gallery, verified sheet, facts, rating block (506–517). Spec tabs are **Packages · Reviews · Portfolio · About**, but the prototype has Packages · Reviews · Calendar (485). Portfolio and About are missing. Service area, "New on Majlis Hub", skeleton and the suspended "Not available" page are missing. Gallery is static "1 / 24" (509). | 🟡 | Clone the M3 tab body. Clone the search error state (464) for "Not available". |
| C-2.1 Packages | ◐ | Catering 3-tier and generic 1-tier (480–491). Missing: per-category fields (MC language, Photo hours, Venue capacity, Makeup sessions), "Ask for quote" empty state, "See full menu" collapse. | 🟡 | Swap fields per the §2 clone note. |
| C-2.2 Availability | ✅ | Month grid, legend, limited dot, user's date highlighted (498–505). Status isn't colour-only (line-through + aria-label) ✓. No month navigation. | 🟢 | — |
| C-2.3 Reviews | ◐ | Booked-via tag, event type, stars, vendor reply (492–497). Missing: 5★→1★ breakdown bar, review photos, empty state. | 🟡 | Add the breakdown inside `.rating-block` (515). |
| C-2.4 Save / Share | ◐ | Save works with a toast (630). **Share is dead** (508). Guest → login is missing. There's no shortlist screen to view saved vendors. | 🟡 | Native `navigator.share`. Shortlist = clone of the M2 list. |
| C-3.0 Create event | ❌ | Not prototyped (hardcoded `EVENT`, 400). | 🔴 B2 | — |
| C-3.1 Planner | ✅ | Countdown ring, budget bar, checklist states (536–556). Empty (all "Not started") and over-budget amber states can't be reached. | 🟡 | Add both to the demo panel. Over budget needs an `amaran-50` token (see §6). |
| C-3.2 Find from planner | ✅ | Not-started row → search (551, 627). | 🟢 | — |
| C-3.3 Custom checklist items | ❌ | Not prototyped. | 🟡 | Clone `.crow` (261) + inline add row. |
| C-4.0 Booking request | ✅ | Sheet, package radio, pax stepper, estimate, spinner, date-taken error with alternatives, success (591–605, 644–651, 520–535). Missing: duplicate-request block and the "enter date/location/pax" path when there's no event. | 🟡 | Duplicate = `.alert.err` clone. |
| C-4.1 Track bookings | ❌ | No bookings list or Booking Detail (M6). The timeline exists only on Success (527–531). The Declined/Cancelled chip isn't styled in CSS (105–111). | 🟡 | Build M6 from the Success `.sum` + `.timeline` (523–531). List = `.crow` rows grouped by event. Add the `st-declined/cancelled` style from BRAND §7. |
| C-4.2 Cancel request | ❌ | Not prototyped. | 🟡 | Clone the M4 sheet (564) with reason select + textarea + the §8 Danger button. Add the <7-day `.alert.warn`. |
| C-4.3 Chat | ❌ | Inbox only (557–560). There's no thread. | 🔴 B3 | — |
| C-5.0 Leave review | ❌ | Not prototyped. | 🟡 | Clone the M4 sheet: star input, textarea (<20 char error), photo uploader (needs the V-1.2 uploader → B4 dependency for the uploader only). |
| C-6.0 Profile & notifications | ❌ | Not prototyped, and **there's no entry point**: the bottom nav has only Home/Search/My Majlis/Messages (615). | 🟡 | Decide the IA: avatar in the topbar or a 5th tab. Build a plain settings list. |

### Vendor & Admin

| IDs | Cov. | Tag | Recommendation |
| :--- | :---: | :---: | :--- |
| V-1.0–V-1.3 Onboarding | ❌ | 🔴 B2 / B4 | Stepper (B2) + uploader + map-pin/radius (reuse the C-1.1 radius sheet). |
| V-2.0, A-1.0 Dashboards | ❌ | 🔴 B4 | M9 shell. |
| V-3.0, A-2.0, A-3.0, A-4.0 Tables | ❌ | 🔴 B4 | M10 table. |
| V-3.1, V-3.2 Accept / Decline / Complete | ❌ | 🟡 | Vendor variant of M6 (after C-4.1). |
| V-4.0 Calendar manager | ❌ | 🔴 B4 | M11. It can start from the C-2.2 grid (187–192). |
| V-5.0 Edit listing, V-6.0 Reply, A-5.0 Moderate, A-6.0 Settings | ❌ | 🟡 | Drawer + form patterns derived from M9/M10 once B4 is approved. |
| V-7.0 Vendor inbox | ❌ | 🔴 B3 | Same thread as C-4.3 + quick replies. |
| A-2.1 Verification review | ❌ | 🔴 B4 | M12 split screen. |

## 2. Screen-state audit (Empty / Loading / Error)

| Screen | Empty | Loading | Error | Tag |
| :--- | :---: | :---: | :---: | :---: |
| Search results | ✅ widen CTA (465) | ✅ shimmer (463) | ✅ retry (464) | 🟢 PASS |
| Booking sheet | n/a | ✅ spinner (645) | ✅ date taken + alternatives (597) | 🟢 PASS |
| Home | ❌ location denied | ❌ | ❌ retry banner | 🟡 clone search states |
| Vendor profile | ❌ no reviews / no packages | ❌ skeleton | ❌ suspended page | 🟡 clone search states |
| Planner | ❌ all not-started | ❌ | ❌ | 🟡 add to demo panel |
| Messages | ❌ "Say hi" | ❌ | ❌ | 🟡 (B3) |

The empty-state pattern matches BRAND §9 (icon in a `pucuk-50` circle + one sentence + one action, 156–157), so the coder can reuse it. Loading, error and date-taken can be reached only from the demo panel. They have no deep link (see §7).

## 3. RBAC

| Check | Result | Tag |
| :--- | :--- | :---: |
| No Vendor/Admin actions (accept, decline, verify, hide) visible in customer screens | ✓ | 🟢 PASS |
| Phone number never shown before Accepted | ✓ (no phone anywhere) | 🟢 PASS |
| "Write a review" absent from the vendor profile (Gherkin §7) | ✓ | 🟢 PASS |
| Guest gating (booking/save/compare → login) | Not demonstrated | 🔴 B1 |

## 4. Auto-layout & spacing (prototype as reference for React/Tailwind)

### 4a. Must become Phase 5 coding rules

| # | Violation | Lines | Rule for coder |
| :---: | :--- | :--- | :--- |
| W1 | Fixed `height` on buttons, pills and inputs: `.btn` 48, `.tray .btn` 40, `.chip` 36, `.pill` 24, `.st` 26, `.input` 48, `textarea` 84, `.search` 56, `.sortsel` 36, `.lang button` 28, `.stepper` 48, `.cmp` 32, `.tabs button` 44, inline `height:36px` | prototype.html:88, 160, 98, 100, 106, 211, 212, 93, 153, 63, 219, 146, 174, 554, 588 | Height comes from `py-*` + `leading-*` (see B5). Textarea uses `rows`, not a height. |
| W2 | Margins used as spacing: `.sec` mt 28, `.sec-head` mb 12, `.search` m 12/16, `.event-card` m 16, `.trust-band` m 28, `.locbar` m 4/16/12, `.state` m 32/16, `.rating-block` m 16, `.ev-head` m 8/16, `.check` m 0/16, `.bar` mt 10, `.cal-grid`/`.legend` mt 12, `.reply` mt 4, inline `margin-top` | 83, 84, 93, 115, 130, 150, 156, 170, 252, 260, 122, 187, 193, 185, 421, 445, 463, 515, 524, 549, 586, 597 | No `m*-`/`space-*`. Screen = `flex flex-col gap-8` (32 between sections) with `px-4` padding. Inner stacks use `gap`. |
| W3 | Negative margins: `.tabs button` mb -1, inline mt -4 | 174, 576 | Banned. Use a divider element under the tab row. |
| W4 | Gutter faked with `margin:16px` + `width:calc(100% - 32px)` | 93, 115, 150 | Parent `px-4` + child `w-full`. |
| W5 | `text-overflow:ellipsis` on descriptive text: page title, planner row vendor·price | 66, 266 | Remove it and let text wrap. BM runs ~20% longer (BRAND §5). |
| W6 | `min-height` on category tiles | 125 | Equal height via `items-stretch` on a row of `flex-1` tiles. |
| W7 | `min-width:40px` on lang buttons | 63 | Remove it. Width comes from `px`. |
| W8 | CSS grid for ≤6 items: category tiles (6), plus `display:grid;place-items:center` on ~18 icon circles | 124; 45, 61, 67, 95, 116, 117, 126, 132, 139, 147, 157, 182, 189, 216, 220, 243, 249, 263 | Tiles: 2 rows × 3 `flex-1` (or `flex-wrap`). Icon circles: `flex items-center justify-center`. |
| W9 | Compare toggle `position:absolute` over the card meta, where it collides with the price line | 146 | Put it in flow as a Hug item in the price row (`justify-between`). |
| W10 | Timeline connector drawn with `::before` absolute | 247 | Use an explicit 2px connector element in the flow column (exports as a vector). |
| W11 | Single-side padding with a border divider: `.sum .tot` border-top + pt 8 | 225 | Use a separate `h-px` divider + parent gap. |
| W12 | Asymmetric/inner padding on non-whitelisted frames: `.topbar` 8/16/4, `.hello` 16/16/0, `.pf-head` 16/16/0, `.count` 14/16/12, `.vmeta` 10/2/0, `.sh-head` 8/8/8/20, `.sh-body` 4/20/20 | 59, 114, 167, 152, 141, 205, 207 | Only cards, sheets, buttons, pills and inputs get padding. Rows get size from gap + Hug. |
| W13 | Off-scale spacing values 28, 10, 6, 5, 3 (scale is 4·8·12·16·24·32·48·64) | 83, 130, 70, 100, 106, 41, 141 | Snap to the scale: 28→32, 10→8/12, 6/5→4/8. |
| W14 | `.tabs` sticky `top:60px` assumes a backbar that the vendor screen doesn't have, which leaves a 60px gap when stuck | 173 | Use `top-0` on M3, or offset by the real header. |

### 4b. Acceptable as-is (documented exceptions)

| Item | Lines | Why OK |
| :--- | :--- | :--- |
| Phone frame, statusbar, stage, demo panel/fab, `.screen` bottom padding | 30–56, 32–34 | Prototype chrome, not app UI |
| `.search>span` ellipsis | 94 | Single-line input placeholder (truncation exception) |
| Floating pips/badges: `.heart`, `.photo .pill`, `.gallery .top`, `.count-p`, `.nav .dot::after`, `.day.limited::after` | 139, 138, 165, 166, 73, 191 | figma-standard-ui §12 floating children |
| Overlays: `.nav`, `.tray`, `.sticky-cta`, `.sheet`, `.scrim`, `.toast` absolute | 69, 159, 196, 200–203, 268 | In React these become `fixed`/`sticky` bars and portals |
| `.sheet` `max-height:88%` | 202 | Runtime scroll constraint. Figma frame = Hug. |
| Fixed leaf boxes: icon buttons 44, ring 64, avatars 40, checkbox/radio 20, day cell 40, tracks 6/8 | 67, 116, 182, 147, 216, 189, 122, 258 | Leaf fixed sizes are allowed |
| `.mini` carousel card `width:220px` | 129 | Fixed-width scroll cards (add `shrink-0`) |
| `.cmp-table th` 76px | 235 | Fixed table label column |
| Calendar `grid-template-columns:repeat(7,1fr)` | 187 | >6 cells, GRID allowed |
| Pills/chips/status `white-space:nowrap` | 98, 100, 106 | Pill text is Hug × Hug |

### 4c. Needs an explicit decision

| Item | Lines | Tag | Recommendation |
| :--- | :--- | :---: | :--- |
| Inbox preview truncated to 1 line | 559 | 🟡 | Allow it as a documented exception (fixed-height list row), or show 2 lines without ellipsis. Write the choice into the rules. |

## 5. Hug vs Fill

| # | Issue | Lines | Fix |
| :---: | :--- | :--- | :--- |
| W15 | Two-text rows without a declared Fill: vendor name vs rating, package name vs price, inbox name vs time, calendar title vs caption, budget rows | 443, 489, 559, 501, 545, 547 | Left text `flex-1 min-w-0` (Fill), right text `shrink-0` (Hug). One Fill per row. |
| W16 | Compare table columns size to their content and overflow sideways at 390px | 586 | Use equal Fill columns (`table-fixed` / `flex-1`). With 3 vendors on mobile, test whether wrapping beats horizontal scroll. |
| W17 | Carousel and category cards aren't equal height (they depend on name length / `min-height`) | 129, 125 | Row `items-stretch`, cards `h-full` with `justify-between`. |
| — | Correct already: `.event-card .meta`, `.locbar .t`, `.crow .t`, `.sticky-cta .p`, inbox text column all use `flex:1;min-width:0` | 119, 151, 265, 197, 559 | 🟢 PASS: keep this pattern |

## 6. Design token alignment

**Exact matches (🟢 PASS):** all 19 colour hexes (prototype.html:11–14 = BRAND §3), shadow tier (15), scrim ink 48% (200), focus ring 2px hijau +2 offset (23), input focus halo pucuk-200/60 (213), sheet 24px top radius (202), primary/secondary button colours and radius 10 (88–91), input (211), search pill 56 + 44 orb (93–95), filter chip default and active (98–99), status chips Requested/Accepted/Completed/Expired (107–111), ink stars (144, 172), Fraunces limited to display, event name and rating (76, 120, 171).

**Mismatches (🟡):**

| # | Token | BRAND says | Prototype has | Line | Fix |
| :---: | :--- | :--- | :--- | :--- | :--- |
| W18 | Card list gap (mobile) | 12px between cards | `.list` gap 24 | 149 | 12 |
| W19 | Section rhythm (mobile) | 32px | 28px | 83, 130 | 32 |
| W20 | Heart button (vendor card) | 36px circle (§8; design-tokens.html:136 = 36) | 40px | 139 | 36 visual, 44 hit area |
| W21 | Danger / warning tints | not defined | `#FDECEA` / `#7A1A10` error alert, `#FDF3E6` / `#6B3D04` warn alert. design-tokens.html:83 uses a different danger tint, `#FEF3F2` | 158, 227, 229 | Add `bahaya-50` and `amaran-50` tokens to BRAND §3. Use one value in both files. |
| W22 | Skeleton colours | not defined | `#EFEDE8` / `#F7F6F2` | 154 | Add a `skeleton` token, or use `hairline`/`kertas` |
| W23 | Declined/Cancelled chip | `hairline` (#E4E2DC) fill + muted text + icon (§7) | missing in prototype. design-tokens.html:114 uses `#F1EFEA` | — | Use #E4E2DC in both |
| W24 | Status chip size | not specified | prototype 26px / 12px (106) vs design-tokens 28px / 13px (DT:110) | 106 | Pick one (recommend 28 / 13, i.e. the label token) |
| W25 | Pill size | not specified | prototype 24px (100) vs design-tokens 26px (DT:108) | 100 | Pick one |
| W26 | Radius off-scale | 10 / 12 / 16 / 24 / full | 14px `.locbar`, `.tray`. 9px logo. 6px checkbox and focus ring. `0 8px 8px 0` reply | 150, 159, 61, 147, 23, 185 | 14→16 (outer) or 12 (inner). Add a 6px "checkbox" token to BRAND §2. Reply → 12 all corners. |
| W27 | Stroke off-scale | 1px default, 2px selected | 1.5px on checkbox, radio and timeline dot. 3px left border on vendor reply. Dashed border on `.st-none` | 147, 216, 249, 185, 110 | Add 1.5px as a "control stroke" token or use 2px. Reply → `pucuk-50` panel, no side stroke. "Not started" → hairline solid. |
| W28 | Gold usage | celebration only, never status | gold pill "Paling popular" on a package | 102, 488 | Use the hijau-outline pill, or add "Most popular" to the allowed gold list in §3 |
| W29 | Type scale off-token | price 18/22 700. h1 24, h2 20, h3 16. display mobile 28/34. micro-badge 11px | `.price` 15px. backbar/logo 17px. sheet title 18px. planner event name 22px. display line-height 1.15 (=32). ring caption 10px uppercase | 145, 66, 60, 206, 544, 76, 118 | Map each to a §5 token. Event name = `display`. Micro caption 11px. |
| W30 | Touch targets < 44 (§8) | ≥ 44×44 | lang 28, `.cmp` 32, chip 36, sort 36, "Find"/"Choose" 36, tray button 40, heart 40 | 63, 146, 98, 153, 554, 588, 160, 139 | Keep the visuals and extend the hit area (resolved by B5) |
| — | Undocumented but consistent | — | primary disabled = `pucuk-200` (90, DT:85). Verified pill on a photo = white 95% + shadow (138, DT:135). Home event card on `hijau-malam` (115) vs planner header on `pucuk-50` (252). | — | Add the disabled state, on-photo pill variant and event-card surface to BRAND §8 (part of W29's doc pass, no extra tag) |

## 7. State inventory (Figma readiness)

| Screen | States / views to frame in Phase 7 | Reachable by | Gap |
| :--- | :--- | :--- | :--- |
| Home | default; carousel saved heart; toast "saved" | `#home` | — |
| Search | ideal; loading; empty; error; filters on; sort ×3; compare tray (1 = disabled, 2–3); max-3 toast | `#search`, `#empty`; loading/error only via demo panel | 🟡 W31 add `#loading`, `#error` |
| Location sheet | radius mode; **state mode** | click `Tukar` | State mode is dead (576) |
| Compare sheet | 3 vendors | `#compare` | — |
| Vendor profile | Packages / Reviews / Calendar tabs; verified sheet (SSM vs **Freelancer** variant) | `#vendor`, `#verify` | Tabs and freelancer variant have no deep link. Portfolio/About tabs missing. |
| Booking sheet | default; package selected; pax at min (− disabled); sending; date-taken error | `#book`; date-taken via demo panel | Add `#taken` |
| Success | requested | `#success` | — |
| Planner | mixed progress | `#planner` | Empty and over-budget states unreachable |
| Messages | list | `#messages` | Rows dead (B3) |

**Dead or toast-only CTAs (🟡, part of W31):** Share (508, no handler) · backbar search icon (470, no handler) · inbox rows (559, no handler) · "Ikut negeri" mode (576, no handler) · alternative-date chips (597/643) only toast "Tarikh ditukar" while the sheet still shows 14 Feb, so they're effectively toast-only · the gallery has no swipe.

**Listing + detail rule:** Bookings (C-4.1) has neither a listing nor a detail (M6). Messages has a listing but no detail (B3). Vendor reviews render inline in a tab, which is acceptable because it's a single vendor's sub-list.

---

## Recommended Phase 5 sequencing

1. Resolve **B5** first (a ~15-minute BRAND §8/§1 amendment, plus the W21–W27 tokens in the same pass).
2. Close **B1–B3** with a small prototype increment: Auth (3 frames), Event stepper (4 steps), Chat thread (1 screen, 4 states). Add M6 Booking Detail at the same time since it's cheap (cloned from Success).
3. Start the **Customer** Phase 5 build with rules W1–W17 in the coder brief.
4. Run the **Phase 2b** Vendor/Admin prototype (B4) in parallel, then start the second coding wave.

---

## Resolution log — 2026-11-10 (user chose Option A: 2 waves)

| ID | Status | What changed |
| :--- | :--- | :--- |
| B1 | ✅ Resolved | Prototype: Login/Register (role choice, +60 phone with validation error, email + password with eye toggle), OTP (6 boxes, auto-advance, 60s resend countdown, wrong-code error), guest mode (vendor CTA → "Log masuk untuk tempah", heart/planner/messages → login, returns to the intended action). Deep links `#login #otp #otp-error #guest`. |
| B2 | ✅ Resolved | Prototype: 4-step Create Event wizard (type, date with past-date error + 2-day option, location with required error + pax stepper, budget + summary) → creates the event and resets the planner. `#wizard`. Vendor onboarding (V-1.x) clones this stepper in Wave 2. |
| B3 | ✅ Resolved | Prototype: chat thread from inbox rows, booking detail and Success. Phone locked until Accepted, then shown with a call button; quick-reply "Say hi" empty state; send → sending tick → delivered; photo send; "Send fails" demo → failed bubble with tap-to-retry. `#chat #chat-empty`. |
| B4 | ⏭ Deferred to Wave 2 | Vendor + Admin masters (M9–M12) to be prototyped before Vendor/Admin coding. Customer build is not blocked. |
| B5 | ✅ Resolved | BRAND_GUIDELINES v1.1 §8 now uses padding-based sizing (py + leading) with a visual-height table and 44px hit areas; §1 drops `max-w-*`. Also added W21–W27 tokens: `bahaya-50`, `amaran-50`, `skeleton`, 6px checkbox radius, 1.5px control stroke, no side-only strokes, gold allowed list (W28). |
| Extra | ✅ | M6 Booking Detail with timeline + Cancel request (reason sheet → Cancelled status in planner). Dead CTAs fixed: Share copies link, backbar search icon removed, "Ikut negeri" shows State/District selects, alt-date chips now change the request date. Deep links added for `#loading #error #booking #cancel`. Token fixes W18–W20, W23, W26, W27 applied in the prototype. |

W1–W17 layout rules are carried into the Phase 5 coder brief (React build), not retro-fitted into the throwaway prototype CSS.
