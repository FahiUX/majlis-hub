# Graph Report - majlis-hub  (2026-11-16)

## Corpus Check
- Large corpus: 175 files · ~1,579,781 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 1232 nodes · 3116 edges · 119 communities (58 shown, 61 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Conversation Log Session 0
- Vendor App Portal
- Admin Console & Moderation
- Chat & Media Module
- UI System & Design Tokens
- Conversation Log Session 5
- Search & Vendor Discovery
- Chat & Media Module
- Conversation Log Session 8
- Brand Guidelines & Design Tokens
- Vendor App Portal
- Vendor App Portal
- Conversation Log Session 12
- Search & Vendor Discovery
- Chat & Media Module
- Kad Kahwin & Guest RSVP
- Chat & Media Module
- Chat & Media Module
- Majlis Planner & Suggestions
- Vendor App Portal
- Chat & Media Module
- tsconfig.json compilerOptions
- Admin Console & Moderation
- Feature Spec & Requirements
- Tabung & Payment Ledger
- Conversation Log Session 25
- Admin Console & Moderation
- Vendor App Portal
- Feature Spec & Requirements
- Retro & Standing UI Rules
- Conversation Log Session 30
- Vendor App Portal
- UI System & Design Tokens
- Brand Guidelines & Design Tokens
- Brand Guidelines & Design Tokens
- Feature Spec & Requirements
- Chat & Media Module
- Feature Spec & Requirements
- Feature Spec & Requirements
- Retro & Standing UI Rules
- UI System & Design Tokens
- Majlis Planner & Suggestions
- Admin Console & Moderation
- Auth & Account Profile
- Feature Spec & Requirements
- Chat & Media Module
- Brand Guidelines & Design Tokens
- Retro & Standing UI Rules
- Cleanup QA_CONSISTENCY_WAVE1.m
- Majlis Planner & Suggestions
- Conversation Log Session 50
- Retro & Standing UI Rules
- Conversation Log Session 52
- State Store & Mock Data
- Conversation Log Session 54
- Conversation Log Session 55
- Conversation Log Session 56
- Chat & Media Module
- Airbnb Design Reference
- NerdWallet Design Reference
- Majlis Planner & Suggestions

## God Nodes (most connected - your core abstractions)
1. `cx()` - 132 edges
2. `useStore()` - 115 edges
3. `📅 2026-11-10` - 100 edges
4. `nav()` - 84 edges
5. `vendorById()` - 60 edges
6. `fmtDate()` - 59 edges
7. `lucide-react` - 57 edges
8. `react` - 51 edges
9. `rm()` - 50 edges
10. `effective()` - 43 edges

## Surprising Connections (you probably didn't know these)
- `LoginGate()` --calls--> `nav()`  [EXTRACTED]
  src/App.tsx → src/router.tsx
- `Corner()` --calls--> `cx()`  [EXTRACTED]
  src/modules/kad/KadCard.tsx → src/components/ui.tsx
- `DocSlot()` --calls--> `cx()`  [EXTRACTED]
  src/modules/vendorapp/Onboarding.tsx → src/components/ui.tsx
- `AccountScreen()` --indirect_call--> `vendorById()`  [INFERRED]
  src/modules/auth/AccountScreen.tsx → src/data/mock.ts
- `CompareScreen()` --indirect_call--> `vendorById()`  [INFERRED]
  src/modules/search/CompareScreen.tsx → src/data/mock.ts

## Import Cycles
- None detected.

## Communities (119 total, 61 thin omitted)

### Community 0 - "Conversation Log Session 0"
Cohesion: 0.02
Nodes (90): `[08:39]` **Claude-1** (Claude Pane 1), `[08:39]` **User** (Claude Pane 1), `[08:40]` **User** (Claude Pane 1), `[08:41]` **Claude-1** (Claude Pane 1), `[08:41]` **Claude-1** (Claude Pane 1), `[08:41]` **Claude-1** (Claude Pane 1), `[08:46]` **Claude-1** (Claude Pane 1), `[08:46]` **Claude-1** (Claude Pane 1) (+82 more)

### Community 1 - "Vendor App Portal"
Cohesion: 0.06
Nodes (59): rm(), REELS, vendorById(), Reel, BookingDetail(), BookingList(), CancelSheet(), COMMITTED (+51 more)

### Community 2 - "Admin Console & Moderation"
Cohesion: 0.09
Nodes (59): RFC-4180, CATS, VENDORS, BookingStatus, AdminApp(), NAV, page(), AuditLog() (+51 more)

### Community 3 - "Chat & Media Module"
Cohesion: 0.08
Nodes (54): statusLabel(), Payment, Kpi(), buildPayments(), depositDeadline(), maxIso(), minIso(), preview() (+46 more)

### Community 4 - "UI System & Design Tokens"
Cohesion: 0.05
Nodes (38): dependencies, clsx, @iconify/react, lucide-react, react, react-dom, tailwind-merge, devDependencies (+30 more)

### Community 5 - "Conversation Log Session 5"
Cohesion: 0.05
Nodes (39): `[09:08]` **Claude-1** (Claude Pane 1), `[09:08]` **User** (Claude Pane 1), `[09:14]` **Claude-1** (Claude Pane 1), `[09:14]` **User** (Claude Pane 1), `[09:15]` **User** (Claude Pane 1), `[09:17]` **Claude-1** (Claude Pane 1), `[09:24]` **Claude-1** (Claude Pane 1), `[09:24]` **User** (Claude Pane 1) (+31 more)

### Community 6 - "Search & Vendor Discovery"
Cohesion: 0.13
Nodes (34): catById(), fromPrice(), kmFrom(), TOWNS, bestPkg(), suggest(), SuggestStep(), verdicts() (+26 more)

### Community 7 - "Chat & Media Module"
Cohesion: 0.11
Nodes (34): phoneFor(), ChatScreen(), OPEN, PHOTOS, Composer(), Item, Gallery(), Album() (+26 more)

### Community 8 - "Conversation Log Session 8"
Cohesion: 0.05
Nodes (38): `[00:09]` **User** (Claude Pane 1), `[00:10]` **Claude-1** (Claude Pane 1), `[00:13]` **Claude-1** (Claude Pane 1), `[00:15]` **Claude-1** (Claude Pane 1), `[00:15]` **User** (Claude Pane 1), `[00:16]` **Claude-1** (Claude Pane 1), `[08:37]` **Claude-1** (Claude Pane 1), `[08:38]` **Claude-1** (Claude Pane 1) (+30 more)

### Community 9 - "Brand Guidelines & Design Tokens"
Cohesion: 0.06
Nodes (35): Border Radius Scale, Brand & Accent, Breakpoints, Buttons, Cards & Containers, Collapsing Strategy, Colors, Components (+27 more)

### Community 10 - "Vendor App Portal"
Cohesion: 0.12
Nodes (23): react, StatusChip(), TopBar(), Similar(), STEP_OF, STEPS, DepositLine(), GROUPS (+15 more)

### Community 11 - "Vendor App Portal"
Cohesion: 0.06
Nodes (31): Brand & Accent, Buttons, Collapsing Strategy, Colors, Components, Date Picker, Elevation, Font Family (+23 more)

### Community 12 - "Conversation Log Session 12"
Cohesion: 0.06
Nodes (31): `[13:31]` **Claude-1** (Claude Pane 1), `[13:31]` **User** (Claude Pane 1), `[13:32]` **Claude-1** (Claude Pane 1), `[13:34]` **Claude-1** (Claude Pane 1), `[13:34]` **User** (Claude Pane 1), `[13:35]` **Claude-1** (Claude Pane 1), `[13:35]` **User** (Claude Pane 1), `[13:36]` **Claude-1** (Claude Pane 1) (+23 more)

### Community 13 - "Search & Vendor Discovery"
Cohesion: 0.17
Nodes (22): cx(), EmptyState(), Img(), Pill(), Sheet(), Stars(), VerifiedBadge(), Vendor (+14 more)

### Community 14 - "Chat & Media Module"
Cohesion: 0.18
Nodes (24): Application, AuditEntry, Booking, ChatMsg, ContentReport, Invitation, ListingStatus, MajlisEvent (+16 more)

### Community 15 - "Kad Kahwin & Guest RSVP"
Cohesion: 0.12
Nodes (19): fmtDate(), Accent, accentCls(), ACCENTS, Corner(), DEFAULT_ACCENT, KadCard(), nameSize() (+11 more)

### Community 16 - "Chat & Media Module"
Cohesion: 0.09
Nodes (23): ALL_REELS, ALL_VENDORS, AREAS, BASE, busy, CHATS, FALLBACK_IMG, IMG (+15 more)

### Community 17 - "Chat & Media Module"
Cohesion: 0.16
Nodes (17): lucide-react, BTN, BtnVariant, Button(), Chip(), DAYS, Divider(), MONTHS (+9 more)

### Community 18 - "Majlis Planner & Suggestions"
Cohesion: 0.20
Nodes (17): clean(), finish(), fmtPhone(), LoginScreen(), validEmail(), validPhone(), Draft, draftFrom() (+9 more)

### Community 19 - "Vendor App Portal"
Cohesion: 0.14
Nodes (18): CategoryId, Card(), Field(), Toggle(), IMAGES, PlanCard(), DEFAULT_DAYS, docError() (+10 more)

### Community 20 - "Chat & Media Module"
Cohesion: 0.10
Nodes (20): C10. Review gate before showing, C1. Visible scrollbar, C2. Back button covered by an overlay, C3. Hero gradient, pattern and fade must be real elements, C4. Hero full-bleed: no radius, no corner gaps, C5. Inspirasi video full-bleed, C6. Category art: isometric PNG + green shadow, C7. Media only from AGY (+12 more)

### Community 21 - "tsconfig.json compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 22 - "Admin Console & Moderation"
Cohesion: 0.11
Nodes (17): 1. Feature reconciliation scan, 2. Screen-state audit (Empty / Loading / Error), 3. RBAC, 4. Auto-layout & spacing (prototype as reference for React/Tailwind), 4a. Must become Phase 5 coding rules, 4b. Acceptable as-is (documented exceptions), 4c. Needs an explicit decision, 5. Hug vs Fill (+9 more)

### Community 23 - "Feature Spec & Requirements"
Cohesion: 0.12
Nodes (16): §4 Settings (customer level) and §6 data the customer sees, §5 RBAC: Guest vs Customer (tested logged out via `#/akaun` → Log keluar), §7 Gherkin (run live), §9 Open Decisions 1–12, 🔴 Blockers (would mislead stakeholders or break a promised feature), Consistency findings (checked on purpose), Deferred (agreed cuts, not counted), Demo script (10 click-paths that show every customer feature) (+8 more)

### Community 24 - "Tabung & Payment Ledger"
Cohesion: 0.12
Nodes (16): B1 🔴 [BLOCKER] Every bottom sheet steals focus on each parent re-render. The Tabung amount field takes one character only., B2 🔴 [BLOCKER] Kad Aturcara rows overflow the screen. The activity field and the delete button cannot be used., B3 🔴 [BLOCKER] The guest heart on a search card sends the guest to Home after login, and the save is lost., B4 🔴 [BLOCKER] After login, Kembali goes back to the OTP screen., B5 🔴 [BLOCKER] After a browser or Android back, Kembali exits the app (retro C2/U3)., B6 🔴 [BLOCKER] Moving from one vendor URL to another crashes the whole app to a white screen., B7 🔴 [BLOCKER] Wizard date and location inputs have no accessible name., B8 🔴 [BLOCKER] Gold (`emas`) is used for status and UI chrome, which breaks the brand rule. The filter count badge also fails contrast. (+8 more)

### Community 25 - "Conversation Log Session 25"
Cohesion: 0.13
Nodes (15): `[15:24]` **User** (Antigravity Pane 0), 1. 🔄 Multi-Agent Sync Completed (`/sync`), 1. 🛡️ User Access Level Matrix (Guest vs Customer), 1. 🛠️ Wave 1 Polish Round Completed (P1, P2, P3), 1. What happened in Pane 1, 1. Wizard Padding & Close Button Fixes, 2. 🔄 Action Intent Preservation (Verified with Playwright), 2. Current State of the Codebase (+7 more)

### Community 26 - "Admin Console & Moderation"
Cohesion: 0.13
Nodes (14): 1. Executive Summary & Core Entity Lifecycle, 2. UI/UX Designer Scoping Advisory ("Master Screen → Clone & Tweak"), 3. Master Role-Based Feature Matrix, 4. Settings Hierarchy, 5. RBAC Summary, 6. Data Dictionary (core fields), 7. Key Acceptance Criteria (Gherkin), 8. Non-Goals (v1) (+6 more)

### Community 27 - "Vendor App Portal"
Cohesion: 0.21
Nodes (11): Instalment, BANNED, flagged(), HOLD, LABELS, MB, NOW, videoError() (+3 more)

### Community 28 - "Feature Spec & Requirements"
Cohesion: 0.15
Nodes (12): 1. Feature Reconciliation Scan, 2. 5-Screen-State Audit, 3. Role-Based Visibility (RBAC), 4. Auto-Layout & Spacing Audit, 5. Hug vs. Fill Sizing Constraints, 6. Design Token Alignment, 7. State Inventory (Figma Readiness), 🎯 Mission (+4 more)

### Community 29 - "Retro & Standing UI Rules"
Cohesion: 0.15
Nodes (12): 🏛️ FahiUX Multi-Agent Operating System (Workflow Playbook), 🗺️ Master Lifecycle Pipeline, Phase 1: Requirements & Feature Matrix, Phase 2: Brand Guidelines & Look-and-Feel, Phase 3: Git Baseline Checkpoint, Phase 4: Pre-Flight Gap & Layout Audit, Phase 5: Live Development (Vite + TSX), Phase 6: Code Review (TSX Quality & Security) (+4 more)

### Community 30 - "Conversation Log Session 30"
Cohesion: 0.17
Nodes (7): glob, json, os, re, Dump Conversation Script (FahiUX Multi-Agent System) Parses the current session…, Figma Canvas & Auto-Layout Sanitizer Engine. Universal utility to sanitize HTML…, sys

### Community 31 - "Vendor App Portal"
Cohesion: 0.20
Nodes (11): BottomNav(), hideNav(), LoginGate(), NO_NAV, PRIVATE, screenFor(), Shell(), TABS (+3 more)

### Community 32 - "UI System & Design Tokens"
Cohesion: 0.17
Nodes (11): 1. Maintain Live Dev Server, 2. Modular Component Architecture, 3. Strict Token Adherence, 4. Interactive States & Mock Data, 5. Figma-Ready Code (follow `figma-standard-ui`), 6. Delivery, 🎯 Mission, 📋 Responsibilities (+3 more)

### Community 33 - "Brand Guidelines & Design Tokens"
Cohesion: 0.17
Nodes (11): 10. Voice, 1. Spatial Rhythm & Containers, 2. Corner Radius Token Scale, 3. Colour System, 4. Surface, Border & Elevation, 5. Typography, 6. Iconography (Lucide React), 7. Signature Trust Components (+3 more)

### Community 34 - "Brand Guidelines & Design Tokens"
Cohesion: 0.18
Nodes (10): 🚫 Critical Anti-Patterns (Strictly Enforced), 🎯 Mission, 📋 Responsibilities, Role: Design Engineer Agent (Brand & Prototype Architect), 📌 Skills Activated, Step 0: Ingest User's Selected Design Foundation, Step 1: Draft Brand Guidelines (`docs/BRAND_GUIDELINES.md`), Step 2: Build the Concept Mood Board (`preview/moodboard.html`) (+2 more)

### Community 35 - "Feature Spec & Requirements"
Cohesion: 0.18
Nodes (10): 📌 Core Production Protocols, 🎯 Mission, Role: Figma AI Agent (Systems & Interactive Prototyping Specialist), 📌 Skills Activated, Step 1: State Inventory & HTML-to-Figma Capture, Step 2: Sweep, Then Repair Page-Wide, Step 3: Clone & Slot (Master Components), Step 4: Naming & Canvas Sections (+2 more)

### Community 36 - "Chat & Media Module"
Cohesion: 0.18
Nodes (10): 1. Summary by module, 2. Totals, 3. Polish items (A), 4. Regression (B), 5. Static review of `b4ecb6a` (C), 6. 🔴 Blockers, 7. 🟡 List (open gaps, priority order), 8. Polish round 2 (2026-11-12, customer side, fixed by Claude, not yet re-audited) (+2 more)

### Community 37 - "Feature Spec & Requirements"
Cohesion: 0.18
Nodes (10): 1. Executive Summary & Verdict Scorecard, 2. RBAC Capability Matrix (§5 Specification), 3. Deep Route-by-Route Access Audit, 4. Verification of Spec Gherkin Scenarios (§7), 5. Audit Conclusions & Summary, A. Public Routes (Evaluated as Guest), B. Private Routes (Evaluated as Guest), C. State Transitions & Intent Restoration (Evaluated Live) (+2 more)

### Community 38 - "Feature Spec & Requirements"
Cohesion: 0.20
Nodes (9): 🔴 Blockers (would mislead stakeholders), Contradiction check vs stakeholder feedback (spec header), Coverage table, Deferred (not blockers), Gherkin (section 7), Open Decisions 9–12, Overall, 🟡 Partial: what to add (grouped) (+1 more)

### Community 39 - "Retro & Standing UI Rules"
Cohesion: 0.22
Nodes (8): Gates Management, Kickoff, 🎯 Mission, Phase 7 Review Loop, 📋 Responsibilities by Phase, Retrospective (Phase 8), Role: Manager Agent (Tech Lead & Orchestrator), 📌 Rules & Constraints

### Community 40 - "UI System & Design Tokens"
Cohesion: 0.22
Nodes (8): 1. TypeScript Cleanliness & Safety, 2. Design Token & Tailwind Compliance, 3. React Performance & Component Hygiene, 4. Accessibility & Semantics, 🎯 Mission, 📤 Output Format, Role: Code Reviewer Agent (TSX Quality & Security Guard), 📋 The TSX Code Review Checklist

### Community 41 - "Majlis Planner & Suggestions"
Cohesion: 0.22
Nodes (8): `[12 Nov 08:17]` **User**, `[12 Nov 08:30]` **User**, `[12 Nov 08:46]` **User**, `[12 Nov 08:48]` **User**, `[12 Nov 09:58]` **Claude-1**, Executive Summary & Timeline Overview, Majlis Hub — Multi-Agent Synchronized Conversation Log, Sync 13 Nov 2026 (Claude-1 pane %1, 11 Nov 17:49 → 12 Nov 09:58 MYT)

### Community 42 - "Admin Console & Moderation"
Cohesion: 0.22
Nodes (8): 1. Executive Summary & Core Entity Lifecycle, 2. UI/UX Designer Scoping Advisory ("Master Screen → Clone & Tweak"), 3. Master Role-Based Feature Matrix (Enterprise UAT Standard), 4. Settings Hierarchy, MODULE & FEATURE SPECIFICATION MATRIX (SOFTWARE HOUSE STANDARD), Tab / Persona 1: [e.g. User Register & Onboarding], Tab / Persona 2: [e.g. User Business / Operational Staff], Tab / Persona 3: [e.g. Admin / Business Owner]

### Community 43 - "Auth & Account Profile"
Cohesion: 0.36
Nodes (5): AccountScreen(), fieldCls(), NOTIF, validEmail(), clearReviews()

### Community 44 - "Feature Spec & Requirements"
Cohesion: 0.25
Nodes (7): 🎯 Mission, 📋 Responsibilities, Role: Requirement Analyst Agent (Software House BA & Feature Matrix Architect), 📌 Rules & Constraints, Step 1: Client Discovery & Entity Lifecycle Mapping, Step 2: Build the Role-Based Feature Matrix, Step 3: UI/UX Scoping Advisory & Handoff

### Community 45 - "Chat & Media Module"
Cohesion: 0.25
Nodes (7): 2026-09-29 — Software House BA & UI/UX Handoff Framework Masterclass, 2026-10-11 — Figma Digital Twin Retro (7 modules, ~400 screens), 2026-11-14 — Chat Photo/Video (Majlis Hub, task 1 of 4), 2026-11-14 — WhatsApp-style Chat (Majlis Hub, task 1, round 2), 📝 Continuous Learning Ledger (`LESSONS.md`), 🏛️ Permanent Architectural Rules (Auto-Loaded), 📓 Session Changelog & Retrospectives

### Community 46 - "Brand Guidelines & Design Tokens"
Cohesion: 0.25
Nodes (7): 1. Spatial Rhythm & Containers, 2. Corner Radius Token Scale, 3. Surface & Border Stroke System, 4. Typography Scale, 5. Iconography Standards (Iconify + Lucide React), 6. Component Blueprint Specs, 🎨 Brand Guidelines & Design Token Specification

### Community 47 - "Retro & Standing UI Rules"
Cohesion: 0.33
Nodes (5): 🎯 Mission, Role: Retro Agent (Live Note-Taker & Rule Extractor), 📋 Rule Format, 📌 Rules & Constraints, 🔁 Working Loop

### Community 48 - "Cleanup QA_CONSISTENCY_WAVE1.m"
Cohesion: 0.33
Nodes (5): Cleanup, 🔴 New blocker, QA: Consistency re-check after the PM audit fix round (Wave 1), Results, 🟡 Warnings

### Community 49 - "Majlis Planner & Suggestions"
Cohesion: 0.33
Nodes (5): New 🔴 blockers, QA Re-check: Majlis Hub Wave 1, Regression smoke (first-report flows), Remaining 🟡, Verification table

### Community 50 - "Conversation Log Session 50"
Cohesion: 0.40
Nodes (5): `[11:38]` **Antigravity-1** (Antigravity Pane 0), `[11:38]` **User** (Antigravity Pane 0), `[11:41]` **User** (Antigravity Pane 0), `[11:49]` **Antigravity-1** (Antigravity Pane 0), 🧪 Verification & Build Status

### Community 51 - "Retro & Standing UI Rules"
Cohesion: 0.40
Nodes (4): 📝 Continuous Learning Ledger (`LESSONS.md`), 🏛️ Permanent Architectural Rules (Auto-Loaded), 📓 Session Changelog & Retrospectives, [YYYY-MM-DD] — [Feature or Module Name]

### Community 52 - "Conversation Log Session 52"
Cohesion: 0.50
Nodes (4): `[11:58]` **User** (Antigravity Pane 0), `[12:06]` **Antigravity-1** (Antigravity Pane 0), 2. Is it responsive for stakeholders on iPhone 6/7/SE and different sizes?, Why it won't break on stakeholders' phones:

### Community 53 - "State Store & Mock Data"
Cohesion: 0.67
Nodes (3): applyOverlay(), load(), StoreProvider()

### Community 54 - "Conversation Log Session 54"
Cohesion: 0.67
Nodes (3): `[10:42]` **User** (Antigravity Pane 0), `[10:55]` **Antigravity-1** (Antigravity Pane 0), 3. Can I continue the work?

### Community 55 - "Conversation Log Session 55"
Cohesion: 0.67
Nodes (3): `[11:49]` **User** (Antigravity Pane 0), `[11:53]` **Antigravity-1** (Antigravity Pane 0), ✅ The Fix

### Community 56 - "Conversation Log Session 56"
Cohesion: 0.67
Nodes (3): `[15:17]` **User** (Antigravity Pane 0), `[15:22]` **Antigravity-1** (Antigravity Pane 0), 🔗 Live Links (Latest Build Live Now)

### Community 57 - "Chat & Media Module"
Cohesion: 0.67
Nodes (3): 1. Fixer 2 Remaining Tasks ([`vendor`](file:///Users/fahi.abss/majlis-hub/src/modules/vendor/), [`booking`](file:///Users/fahi.abss/majlis-hub/src/modules/booking/), [`auth`](file:///Users/fahi.abss/majlis-hub/src/modules/auth/), [`chat`](file:///Users/fahi.abss/majlis-hub/src/modules/chat/)), 3. Extra Polish, 🛠️ What Was Completed

## Knowledge Gaps
- **613 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+608 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 726 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **61 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cx()` connect `Search & Vendor Discovery` to `Vendor App Portal`, `Admin Console & Moderation`, `Chat & Media Module`, `Search & Vendor Discovery`, `Chat & Media Module`, `Vendor App Portal`, `Auth & Account Profile`, `Kad Kahwin & Guest RSVP`, `Chat & Media Module`, `Majlis Planner & Suggestions`, `Vendor App Portal`, `Vendor App Portal`, `Vendor App Portal`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `📅 2026-11-10` connect `Conversation Log Session 0` to `Conversation Log Session 8`, `Conversation Log Session 25`, `Conversation Log Session 12`, `Conversation Log Session 5`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `Chronological Conversation Record` connect `Conversation Log Session 25` to `Conversation Log Session 0`, `Conversation Log Session 5`, `Conversation Log Session 8`, `Majlis Planner & Suggestions`, `Conversation Log Session 12`, `Conversation Log Session 50`, `Conversation Log Session 52`, `Conversation Log Session 54`, `Conversation Log Session 55`, `Conversation Log Session 56`, `Chat & Media Module`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `vendorById()` (e.g. with `AccountScreen()` and `CompareScreen()`) actually correct?**
  _`vendorById()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _613 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Conversation Log Session 0` be split into smaller, more focused modules?**
  _Cohesion score 0.022222222222222223 - nodes in this community are weakly interconnected._
- **Should `Vendor App Portal` be split into smaller, more focused modules?**
  _Cohesion score 0.06126331811263318 - nodes in this community are weakly interconnected._