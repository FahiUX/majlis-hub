# 🏗️ WEEV Technical Architecture Document

**System:** WEEV Event & Wedding Marketplace  
**Version:** 2.0  
**Stack:** React 19 · TypeScript 5.8 · Tailwind CSS v4 · Vite 6 · Lucide React

---

## 1. Architectural Overview

WEEV is built as a high-performance, mobile-first Single Page Application (SPA). To achieve sub-50ms interaction latency and zero runtime cold starts, it operates on an **in-memory reactive store with optimistic local storage persistence**, enabling rapid prototyping and verifiable multi-user simulations without backend server bottlenecks.

```mermaid
flowchart TD
    subgraph UI ["Presentation Layer (TSX)"]
        Router["Lightweight History Router\n(src/router.tsx)"]
        HomeMod["Home Module\n(src/modules/home/*)"]
        SearchMod["Search & Compare\n(src/modules/search/*)"]
        VendorMod["Vendor Profile & Reviews\n(src/modules/vendor/*)"]
        KadMod["Kad & RSVP Builder\n(src/modules/kad/*)"]
        TabungMod["Tabung Calculator\n(src/modules/tabung/*)"]
        VendorAppMod["Vendor Console\n(src/modules/vendorapp/*)"]
        AdminMod["Admin Console\n(src/modules/admin/*)"]
    end

    subgraph State ["Reactive State Layer"]
        Store["Single Store Engine\n(src/store.tsx)"]
        StorageAdapter["LocalStorage Migration Adapter\n('majlishub.v4')"]
    end

    subgraph Data ["Mock Database & Domain Layer"]
        MockDB["Curated Domain Models\n(src/data/mock.ts)"]
        Types["Domain Interfaces & Types\n(src/data/types.ts)"]
    end

    Router --> HomeMod & SearchMod & VendorMod & KadMod & TabungMod & VendorAppMod & AdminMod
    HomeMod & SearchMod & VendorMod & KadMod & TabungMod & VendorAppMod & AdminMod <==>|"useStore() / dispatch"| Store
    Store <==> StorageAdapter
    Store <.. MockDB
```

---

## 2. Directory Structure

```
majlis-hub/
├── docs/                        # Specifications, audits, and brand guidelines
│   ├── BRAND_GUIDELINES.md      # Official WEEV token spec (v2.0)
│   ├── MODULE_FEATURE_SPEC.md   # Functional requirements matrix
│   └── MODULE_STATUS.md         # Implementation status across modules
├── preview/                     # Stakeholder preview environments & decision decks
│   ├── weev-brand-palettes.html # Interactive multi-theme comparison lab
│   └── screenshots/             # 4K & full-mobile captured evidence
├── src/
│   ├── components/              # Shared design system components
│   │   ├── ui.tsx               # Button, Pill, Sheet, Chip, Modal, Stars
│   │   └── WeevLogo.tsx         # The Infinite Weave official brandmark
│   ├── data/                    # Domain data models & types
│   │   ├── mock.ts              # Curated vendors, categories, packages, reviews
│   │   └── types.ts             # TypeScript domain definitions
│   ├── modules/                 # Functional feature modules
│   │   ├── admin/               # Verification & editorial consoles
│   │   ├── auth/                # Multi-role authentication & OTP simulator
│   │   ├── booking/             # Booking detail, milestones, invoices
│   │   ├── home/                # Home screen, reminders, notifications
│   │   ├── kad/                 # Digital wedding card & live RSVP tracking
│   │   ├── search/              # Search, filter sheets, 3-way comparison table
│   │   ├── tabung/              # Savings budget calculator
│   │   ├── vendor/              # Public vendor profile, portfolio, packages
│   │   └── vendorapp/           # Vendor operating dashboard & onboarding
│   ├── App.tsx                  # Root shell with bottom navigation & overlays
│   ├── index.css                # Tailwind v4 @theme token declarations
│   ├── main.tsx                 # React DOM mount point
│   ├── router.tsx               # Lightweight zero-dependency router
│   └── store.tsx                # Reactive state engine & localStorage adapter
├── ARCHITECTURE.md              # System architecture (this document)
├── AI-AGENT.md                  # Multi-agent operating playbook
├── DESIGN-SYSTEM.md             # Design system specifications
├── PRD.md                       # Product requirements document
└── package.json                 # Project dependencies & scripts
```

---

## 3. Core Subsystems

### 3.1 Lightweight History Router (`src/router.tsx`)
* **Zero Dependency:** Built on native `window.location.hash` and `history.pushState` to eliminate bundle bloat.
* **Exact Origin Preservation (Rule U3):** Every back button invocation (`navBack()`) inspects the history breadcrumb stack to return the user to their exact originating scroll coordinate.
* **Query Parameter Parser:** Reactive query string parser (`useRoute()`) providing instant access to filters, tab selections, and URL-encoded voting parameters.

### 3.2 Reactive Store & State Engine (`src/store.tsx`)
* **Single Source of Truth:** Centralized state holding customer profile, active event, bookings array, saved vendors, custom invitations, guest RSVPs, and administrative featured lists.
* **Optimistic Local Storage Sync:** State modifications immediately trigger subscribers and debounce serializations to `localStorage` key `majlishub.v4`.
* **Automatic Schema Migration:** Detects legacy storage formats and seamlessly migrates schema structures without dropping user data.

### 3.3 Domain Model & Mock Database (`src/data/mock.ts`)
* **Curated Malaysian Taxonomy:** 6 primary wedding categories (Catering, Photography, Emcee/DJ, Venue, Decor, Makeup).
* **Realistic Pricing Structures:** Accurately reflects Malaysian market rates (e.g. Catering RM 25–45/pax; Photography RM 2,000–5,500; Dewan RM 8,000–25,000).
* **Calculated Metrics:** Dynamic helpers for Haversine geographic distance (`kmFrom()`), review distributions, and price ranges (`fromPrice()`).

---

## 4. Performance & Reliability Standards

1. **Strict TypeScript Typing:** Compiled under TypeScript 5.8 with `noImplicitAny` and `noUnusedLocals` enabled. Zero compilation warnings.
2. **Bundle Optimization:** Vite 6 with Rollup tree-shaking. Lucide icons are imported individually to prevent bundle inflation.
3. **Asset Inlining:** Small brandmarks and patterns are encoded as clean inline SVGs, preventing network round-trip overhead on critical rendering paths.
4. **Offline Resilience:** All planning workflows, card customizers, and vendor comparisons function 100% offline without network reliance.
