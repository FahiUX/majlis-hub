# 🎨 WEEV Brand Guidelines & Design Token Specification

**Project:** WEEV (formerly Majlis Hub)  
**Version:** 2.0 (Rebrand to Multi-Cultural Celebration Marketplace · 3A + 3B Imperial Merlot & Champagne System)  
**Design Philosophy:** *Aristocratic warmth, celebratory prestige, and absolute escrow trust.*  
WEEV is a premier event and wedding marketplace serving all Malaysian communities (Malay, Chinese, Indian, and Western celebrations). The identity balances high-ticket escrow trust with the joyous spirit of matrimony. The palette moves away from single-ethnicity tropes into universal celebratory luxury: rich Imperial Merlot wine, Champagne Gold ceremonial highlights, and warm Alabaster Linen canvases.

**Tone words:** Exclusive (Eksklusif) · Trusted (Dipercayai) · Celebratory (Meraikan) · Inclusive (Untuk Semua) · Transparent (Telus)

---

## 1. Spatial Rhythm & Containers
* **Base Grid Unit:** 4px, with 8px as the working step.
* **Spacing tokens:** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64
* **Mobile (customer, primary):** 16px side gutter, 12px between cards, 24px between sections. Sticky bottom action bar 72px tall.
* **Desktop (vendor/admin dashboards, customer wide view):** 1440 frame, content `w-full px-6 lg:px-8` (no `max-w-*`), sidebar 248px fixed.
* **Section rhythm:** 48px between major bands on desktop, 32px on mobile. Vertical card lists 12px gap on mobile; card grids 16px. Never off-scale values (no 5/6/10/14/28).

---

## 2. Corner Radius Token Scale
* **Outer cards, sheets & modals:** `rounded-2xl` (16px). Bottom sheets: 24px top corners only.
* **Inner containers, photos inside cards, tables:** `rounded-xl` (12px)
* **Buttons, inputs, selects:** `rounded-[10px]`
* **Badges, chips, filter pills, avatars, search bar:** `rounded-full`
* **Checkbox:** `rounded-[6px]` (only exception to the scale)

---

## 3. Colour System (3A + 3B Imperial Merlot & Champagne)

| Token | Hex | Role & Usage |
| :--- | :--- | :--- |
| `merlot` / `hijau` (Primary) | `#481226` | **Imperial Merlot.** Every primary CTA, active navigation item, selected state, verified badge, and key link. White text on it = 9.8:1 contrast (AAA). |
| `bordeaux` / `pekat` | `#320B1A` | **Deep Velvet Bordeaux.** Pressed and hover state of primary actions. |
| `wine-noir` / `malam` | `#1E0711` | **Wine Noir.** Footers, dark hero base, and deep structural surfaces. |
| `pucuk-50` (Wash) | `#FAF2F4` | **Delicate Rosé Silk Wash.** Soft panels, trust callouts, planner background cards. |
| `pucuk-100` (Pill Fill) | `#F3E2E7` | **Soft Rosé Tint.** Selected filter pill fill, subtle badge backdrop. |
| `pucuk-200` (Halo/Track) | `#DEC2CC` | **Velvet Mauve.** Focus ring halos, progress tracks, subtle indicators. |
| `champagne` / `emas` | `#E5BE64` | **Champagne Gold Celebration Accent.** Countdown progress ring, "Top rated" laurels, wedding badges, celebration icons. Never used for plain body text. |
| `champagne-text` / `emas-teks` | `#8C6918` | Gold text on white / paper surfaces (5.4:1 contrast ratio, WCAG AA). |
| `champagne-soft` / `emas-50` | `#FAF2DF` | Soft champagne illumination wash behind milestone moments. |
| `linen` / `kertas` (Canvas) | `#FAF7F4` | **Alabaster Linen.** Warm, human, natural canvas. Not harsh clinical blue-white. |
| `putih` (Surface) | `#FFFFFF` | Primary cards, sheets, form inputs. |
| `ink` | `#1C0912` | **Velvet Wine Noir.** Headlines, prices, star ratings. |
| `body` | `#3D2731` | **Deep Espresso Plum.** Running body copy and descriptions. |
| `muted` | `#6F6167` | **Velvet Taupe.** Metadata, distance, dates, captions. |
| `line` (Hairline) | `#ECE3DC` | Default 1px card borders and hairlines. |
| `line2` (Strong) | `#DAC9BF` | Form input borders and emphasized dividers. |
| `bahaya` (Danger) | `#B42318` | Errors, cancellation notices, destructive actions. |
| `bahaya-50` | `#FEF3F2` | Error alert banner background. |
| `amaran` (Warning) | `#A15C07` | Deadlines under 6h, budget overrun notices. |
| `amaran-50` | `#FEF6E7` | Warning banner background. |
| `skeleton` | `#F1E9E4` | Skeleton loading shimmer base. |
| `info` | `#1F5FA8` | Neutral legal and informational tags. |

### Color Rules:
1. **One Master Voice:** On any screen, Imperial Merlot appears in at most 1 primary CTA plus trust badges. Everything else sits peacefully on white or Alabaster Linen.
2. **Champagne Gold Discipline:** Gold is reserved for matrimonial celebration, countdown rings, and verified excellence. It is never used for general interactive buttons or status.
3. **Multi-Cultural Appropriateness:** Red/wine represents joy and luck in Chinese weddings, deep bridal celebration in Indian weddings, royal court elegance in Malay weddings, and timeless black-tie romance in Western celebrations.

---

## 4. Brandmark & Symbolism ("The Infinite Weave")
* **Symbolism:** Two interlocking rings seamlessly interwoven into an architectural, monoline 'W'. Reflects couples coming together, vendor collaboration, and reliable deposit escrow.
* **Component:** `<WeevLogo light={boolean} size={number} variant={'mark' | 'full' | 'lockup'} />`
* **Clear Space:** Maintain at least half the emblem width as clear space around the brandmark.
* **Favicon:** Scalable vector SVG embedded in `<link rel="icon">`.

---

## 5. Typography Scale
* **Display Font:** `Fraunces` (Serif) — used for brand name, page h1s, countdown days, and editorial callouts.
* **Interface Font:** `Figtree` (Sans-Serif) — clean geometric sans for UI labels, tables, navigation, inputs, and running text.

| Role | Size/Line | Weight | Font | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `display-lg` | 32/38 | 600 | Fraunces | Hero title, milestone headers |
| `display-md` | 24/30 | 600 | Fraunces | Section headers, vendor profile names |
| `h3` | 17/22 | 600 | Figtree | Card titles, sheet headers |
| `body` | 15/22 | 400 | Figtree | Running body text |
| `body-sm` | 13/18 | 400 | Figtree | Secondary meta, vendor categories |
| `caption` | 12/16 | 500 | Figtree | Timestamps, helper hints |
| `price` | 18/22 | 700 | Figtree (num) | Clear RM prices ("dari RM 2,500") |

---

## 6. Iconography (Lucide React)
* **Library:** `lucide-react`, `strokeWidth={1.75}` across all icons. Sizes 16 / 20 / 24.
* **Categories:**
  - Catering: `UtensilsCrossed`
  - Photo & Video: `Camera`
  - MC / Emcee: `Mic`
  - Venue / Dewan: `Building2`
  - Decor & Pelamin: `Flower2`
  - Makeup & Styling: `Sparkles`
* **Trust & Verification Icons:**
  - Verified Business: `ShieldCheck`
  - Verified Freelancer: `BadgeCheck`
  - Booked via WEEV: `CalendarCheck`
  - Star Rating: `Star` (ink fill)
  - Escrow Protection: `Landmark`

---

## 7. Signature Trust Components

| Component | Specification |
| :--- | :--- |
| **Verified Badge** | Pill, `pucuk-100` fill, `merlot` text 12/600, `ShieldCheck` 14px. Tap opens "What We Checked" sheet: SSM registration, IC identity verification, portfolio authenticity audit. |
| **Verified Freelancer** | Same pill with `BadgeCheck` icon and "Freelancer Disahkan" label. |
| **Booked via WEEV Tag** | Displayed on verified customer reviews: "Tempahan melalui WEEV · Perkahwinan, Jun 2026". |
| **Transparent Pricing** | Always formatted with currency symbol, e.g., "RM 28 / pax" or "dari RM 2,500". "PM for price" is strictly prohibited. |
| **Escrow Security Notice** | Clear reminder that funds remain safe with milestone-based payment schedules. |

---

## 8. Surfaces & Hero Treatment
* **Hero Background (3A+3B Hybrid):**  
  `radial-gradient(110% 90% at 85% 10%, rgba(229, 190, 100, 0.26) 0%, transparent 60%), linear-gradient(170deg, #52142E 0%, #360E1E 100%)`
* **Lattice Pattern:** Subtle celebratory weave lattice overlay at 18% opacity with soft fade out.
* **Fade to Canvas:** 150px gradient seamlessly transitioning from hero wine into Alabaster Linen (`#FAF7F4`).
