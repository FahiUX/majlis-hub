# 🎨 WEEV Design System Specification (v2.0)

**Project:** WEEV  
**Palette:** 3A + 3B Imperial Merlot & Champagne Gold  
**Reference Philosophy:** *Quiet Confidence, Celebratory Aristocracy, High-Ticket Escrow Trust.*  
**Standard:** WCAG 2.2 Level AA / AAA Compliant

---

## 1. Design Tokens & Color Matrix

The WEEV color system is codified in `src/index.css` via Tailwind CSS v4 `@theme`.

```css
@theme {
  /* Primary Identity: Imperial Merlot */
  --color-hijau: #481226;          /* Primary CTA, Active Tabs, Verification Marks */
  --color-pekat: #320B1A;          /* Primary Pressed / Hover State */
  --color-malam: #1E0711;          /* Wine Noir: Footers, Dark Hero Overlays */

  /* Surface Washes: Rosé Silk (replaces mint) */
  --color-pucuk-50: #FAF2F4;       /* Subtle Panel Wash, Working Surfaces */
  --color-pucuk-100: #F3E2E7;      /* Selected Filter Pill Fill, Chip Backgrounds */
  --color-pucuk-200: #DEC2CC;      /* Focus Rings, Progress Tracks */

  /* Celebration Accent: Champagne Gold */
  --color-emas: #E5BE64;           /* Countdown Arc, Milestone Laurels, Wedding Rings */
  --color-emas-teks: #8C6918;      /* Gold Text on Light Surfaces (5.4:1 contrast) */
  --color-emas-50: #FAF2DF;        /* Ambient Glow Wash, Highlight Moments */

  /* Canvas & Inks */
  --color-kertas: #FAF7F4;         /* Alabaster Linen App Canvas */
  --color-ink: #1C0912;            /* Velvet Wine Noir: Headings, Prices, Star Ratings */
  --color-body: #3D2731;           /* Deep Espresso Plum: Running Text */
  --color-muted: #6F6167;          /* Velvet Taupe: Timestamps, Captions, Meta Lines */
  --color-line: #ECE3DC;           /* Hairline Dividers (1px) */
  --color-line2: #DAC9BF;          /* Input Borders, Strong Framing */

  /* Alerts & System */
  --color-bahaya: #B42318;         /* Danger / Errors */
  --color-bahaya-50: #FEF3F2;      /* Danger Banner Background */
  --color-amaran: #A15C07;         /* Warning / Approaching Deadlines */
  --color-amaran-50: #FEF6E7;      /* Warning Banner Background */
  --color-skeleton: #F1E9E4;       /* Skeleton Shimmer Base */
  --color-info: #1F5FA8;           /* Neutral Information / Legal */
}
```

---

## 2. Typography Hierarchy

WEEV employs a dual-font typographic spine:
1. **Fraunces (Serif):** Expresses heritage, luxury editorial quality, and celebratory warmth.
2. **Figtree (Geometric Sans):** Provides modern legibility, structured forms, and tabular numeric alignment.

| Role | Font Family | Size / Line-height | Weight | Letter-spacing | Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | Fraunces | 28px / 34px | 600 Semi-Bold | -0.01em | Home hero question, landing titles |
| **Section Header** | Figtree | 20px / 26px | 600 Semi-Bold | Normal | Category headers, sheet headers |
| **Vendor Name** | Fraunces | 22px / 28px | 600 Semi-Bold | Normal | Vendor detail header |
| **Price / Number** | Figtree | 18px / 22px | 700 Bold | Tabular (`num`) | Package pricing ("RM 2,500") |
| **Body Running** | Figtree | 15px / 22px | 400 Regular | Normal | Package details, review bodies |
| **Metadata** | Figtree | 13px / 18px | 400 Regular | Normal | Distance, categories, dates |
| **Micro Caption** | Figtree | 11px / 14px | 600 Semi-Bold | +0.06em | Status badges, pills, tabs |

---

## 3. Spatial System & Layout Rules

* **4px / 8px Grid Discipline:** All margins, paddings, gaps, and dimensions strictly adhere to the scale: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64`. Off-scale values (5, 7, 9, 15) are prohibited.
* **Mobile Frame (Primary):**
  - Side gutter: `px-4` (16px).
  - Vertical card list gap: `gap-3` (12px).
  - Section-to-section gap: `gap-6` (24px).
  - Sticky bottom action bar: `h-[72px]` fixed with safe-area inset padding.
* **Touch Target Standard:** All clickable elements maintain a minimum hit area of **44 × 44 px**, even if the visual container is smaller (via invisible padding wrappers).
* **Scrollbar Suppression:** Mobile app experience forbids visible scrollbars (`scrollbar-width: none; *::-webkit-scrollbar: none;`).

---

## 4. Component Blueprints

### 4.1 Buttons
* **Primary Button:** `bg-hijau text-white rounded-[10px] py-3.5 px-5 font-semibold text-[15px] hover:bg-pekat active:scale-[0.99] transition-transform` (Visual height ~48px).
* **Secondary Button:** `bg-white border border-line2 text-ink rounded-[10px] py-3.5 px-5 font-semibold hover:bg-kertas` (Visual height ~48px).
* **Ghost Button:** `text-hijau font-semibold hover:bg-pucuk-50 px-3 py-2 rounded-full`.
* **Destructive Button:** `bg-white border border-bahaya/40 text-bahaya rounded-[10px] py-3.5 px-5 font-semibold hover:bg-bahaya-50`.

### 4.2 Verified Badges & Pills
* **SSM Verified Badge:** Pill container with `bg-pucuk-100 text-hijau text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5`. Accompanied by `ShieldCheck` icon.
* **Freelancer Badge:** Same pill with `BadgeCheck` icon and "Freelancer Disahkan" label.
* **On-Photo Badge:** `bg-white/95 text-ink shadow-float backdrop-blur-sm` for high contrast against dynamic image fills.

### 4.3 Search Pill & Filters
* **Floating Search Pill:** Rounded-full container `py-1.5 pl-[18px] pr-1.5 bg-white text-ink shadow-float flex items-center gap-2`. Right trigger action orb is a 44px circle in Imperial Merlot.
* **Filter Chips:** `rounded-full border border-line bg-white text-ink text-sm px-3.5 py-2 font-medium active:bg-pucuk-100 active:border-hijau active:text-hijau`.

### 4.4 Cards & Modals
* **Outer Cards:** `rounded-2xl` (16px) with 1px border in `border-line` (`#ECE3DC`) and white surface fill.
* **Bottom Sheets:** `rounded-t-[24px]` with smooth spring entrance animation and drag handle indicator.

---

## 5. Motion & Interaction

* **Ken Burns Hero Animation:** Subtle zoom transition on featured image carousels (`@keyframes kenburns`).
* **Micro Shimmer:** Loading skeletons employ linear gradient shimmer transitioning from `#F1E9E4` to Alabaster Linen (`#FAF7F4`) and back.
* **Reduced Motion Compliance:** `@media (prefers-reduced-motion: reduce)` disables all transforms and animations for user accessibility.
