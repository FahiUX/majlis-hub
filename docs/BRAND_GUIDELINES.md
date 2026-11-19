# 🎨 WEEV Brand Guidelines & Design Token Specification

**Project:** WEEV (formerly Majlis Hub)  
**Version:** 3.0 (19 Nov 2026 · locked WEEV logo, Tempa mascot and palette; logo spec in `docs/brand/LOGO.md`)  
**Design Philosophy:** *Aristocratic warmth, celebratory prestige, and absolute escrow trust.*  
WEEV is a premier event and wedding marketplace serving all Malaysian communities (Malay, Chinese, Indian, and Western celebrations). The identity balances high-ticket escrow trust with the joyous spirit of matrimony. The palette comes straight from the logo: Royal Aubergine ink, Bubblegum Pink ribbon, Sunshine Gold confetti and a Warm Linen canvas. Friendly and celebratory, for every community and every kind of event.

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

## 3. Colour System (v3, from the logo)

| Token (legacy name) | Hex | Brand name · use |
| :--- | :--- | :--- |
| `hijau` / `aubergine` | `#2E1741` | **Royal Aubergine.** Primary CTA, active nav, links, verified badges. White on it 16:1. |
| `pekat` | `#22102F` | Pressed / hover of primary. |
| `malam` | `#170A20` | Deepest surfaces (dark Kad template, overlays). |
| `pucuk-50 / 100 / 200` | `#F6F2F8` `#ECE5F1` `#D9CCE4` | Aubergine washes: panels, selected pills, focus halos, disabled fills. |
| `emas` | `#E8B536` | **Sunshine Gold.** Countdown arc, likes, stars, celebration. Never text on light (1.8:1). |
| `emas-teks` | `#7E5A0C` | Gold-family text on light (5.6:1). |
| `emas-50` | `#FBF3DC` | Gold wash. |
| `pink` | `#DB619B` | **Bubblegum Pink.** Accents, icons, large display only (3.2:1 on linen, never small text). |
| `pink-teks` | `#A8336C` | Pink-family text on light (5.9:1). |
| `pink-50` | `#FCEFF5` | Pink wash. |
| `kertas` / `linen` | `#FAF7EF` | **Warm Linen.** App canvas. |
| `ink` | `#2E1741` | Headings, prices (= brand ink). |
| `body` | `#4A3A57` | Running text (9.6:1). |
| `muted` | `#6B6075` | Meta, captions (5.5:1). |
| `line` / `line2` | `#ECE6E8` / `#DCD2DA` | Hairlines / input borders. |
| `bahaya` `amaran` `info` (+`-50`) | unchanged | Status colours. |

> Legacy names (`hijau` = "green", `emas`, `kertas`) are kept so the v3 rebrand switched every screen at once. Read them by this table, not by their Malay meaning.

### Color Rules:
1. **One Master Voice:** Aubergine carries the primary CTA and trust badges; everything else sits on white or Warm Linen.
2. **Pink is a spark, not a voice:** ribbon, blush, highlights, icons, big display. Small pink text always uses `pink-teks`.
3. **Gold Discipline:** celebration only (countdown, likes, stars, confetti). Never a button, never small text on light.

---

## 4. Brandmark (🔒 locked)
* **Spec:** `docs/brand/LOGO.md` (anatomy, clear space, minimum sizes, allowed/not allowed). Files: `preview/logos/final/` only.
* **Component:** `<WeevLogo light={boolean} size={number} variant={'full' | 'mark' | 'mascot'} />` (wordmark, heart-ribbon W, or Tempa).
* **Favicon / app icons:** `public/brand/` (byte copies via `scripts/brand/sync-public.sh`), wired in `index.html` and `public/manifest.webmanifest`.

---

## 5. Typography Scale
* **Interface + display font:** `Nunito` (the logo tagline font). Headings 800, UI 400 to 700.
* **Kad only:** `Fraunces` (`font-kad`) for the couple's names on invitation cards.

| Role | Size/Line | Weight | Font | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `display-lg` | 28/34 | 800 | Nunito | Hero title, page h1s |
| `display-md` | 24/30 | 800 | Nunito | Section headers, vendor profile names |
| `h3` | 17/22 | 600 | Nunito | Card titles, sheet headers |
| `body` | 15/22 | 400 | Nunito | Running body text |
| `body-sm` | 13/18 | 400 | Nunito | Secondary meta, vendor categories |
| `caption` | 12/16 | 500 | Nunito | Timestamps, helper hints |
| `price` | 18/22 | 700 | Nunito (num) | Clear RM prices ("dari RM 2,500") |

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
| **Verified Badge** | Pill, `pucuk-100` fill, `hijau` (aubergine) text 12/600, `ShieldCheck` 14px. Tap opens "What We Checked" sheet: SSM registration, IC identity verification, portfolio authenticity audit. |
| **Verified Freelancer** | Same pill with `BadgeCheck` icon and "Freelancer Disahkan" label. |
| **Booked via WEEV Tag** | Displayed on verified customer reviews: "Tempahan melalui WEEV · Perkahwinan, Jun 2026". |
| **Transparent Pricing** | Always formatted with currency symbol, e.g., "RM 28 / pax" or "dari RM 2,500". "PM for price" is strictly prohibited. |
| **Escrow Security Notice** | Clear reminder that funds remain safe with milestone-based payment schedules. |

---

## 8. Surfaces & Hero Treatment
* **Hero Background:**
  `radial-gradient(110% 90% at 85% 10%, rgba(232, 181, 54, 0.24) 0%, transparent 60%), linear-gradient(170deg, #3D2056 0%, #2E1741 100%)`
* **Lattice Pattern:** Subtle celebratory weave lattice overlay at 18% opacity with soft fade out.
* **Fade to Canvas:** 150px gradient from the aubergine hero into Warm Linen (`#FAF7EF`).
