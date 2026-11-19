# 🎨 WEEV Design System Specification (v3.0)

**Project:** WEEV  
**Palette:** WEEV brand v3 (Royal Aubergine · Bubblegum Pink · Sunshine Gold · Warm Linen), source `docs/brand/LOGO.md` §2  
**Reference Philosophy:** *Quiet Confidence, Celebratory Aristocracy, High-Ticket Escrow Trust.*  
**Standard:** WCAG 2.2 Level AA / AAA Compliant

---

## 1. Design Tokens & Color Matrix

The WEEV color system is codified in `src/index.css` via Tailwind CSS v4 `@theme`.

```css
@theme {
  --font-sans: "Nunito", system-ui, -apple-system, sans-serif;
  --font-display: "Nunito", system-ui, -apple-system, sans-serif;
  /* invitation cards (Kad) only: the couple's card keeps a classic serif */
  --font-kad: "Fraunces", Georgia, serif;

  /* Primary: Royal Aubergine */
  --color-hijau: #2E1741;
  --color-pekat: #22102F;
  --color-malam: #170A20;

  /* Aubergine washes */
  --color-pucuk-50: #F6F2F8;
  --color-pucuk-100: #ECE5F1;
  --color-pucuk-200: #D9CCE4;

  /* Celebration accent: Sunshine Gold (gold text uses emas-teks) */
  --color-emas: #E8B536;
  --color-emas-teks: #7E5A0C;
  --color-emas-50: #FBF3DC;

  /* Bubblegum Pink: accent; pink-teks for text on light */
  --color-pink: #DB619B;
  --color-pink-teks: #A8336C;
  --color-pink-50: #FCEFF5;

  /* Surfaces & typography */
  --color-kertas: #FAF7EF;
  --color-ink: #2E1741;
  --color-body: #4A3A57;
  --color-muted: #6B6075;
  --color-line: #ECE6E8;
  --color-line2: #DCD2DA;

  /* Status */
  --color-bahaya: #B42318;
  --color-bahaya-50: #FEF3F2;
  --color-amaran: #A15C07;
  --color-amaran-50: #FEF6E7;
  --color-skeleton: #F0EAE6;
  --color-info: #1F5FA8;

  /* Brand names */
  --color-aubergine: #2E1741;
  --color-linen: #FAF7EF;

  --shadow-float: 0 0 0 1px rgba(46,23,65,.05), 0 2px 6px rgba(46,23,65,.06), 0 8px 24px rgba(46,23,65,.08);
}
```

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

---

## 2. Typography Hierarchy

WEEV uses **Nunito** for the whole interface (the logo tagline font). Headings (`font-display`) are Nunito ExtraBold 800 to echo the wordmark. **Fraunces** survives only as `font-kad`, for the couple's names on Kad invitations.

| Role | Font Family | Size / Line-height | Weight | Letter-spacing | Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | Nunito | 28px / 34px | 800 ExtraBold | Normal | Home hero question, page titles |
| **Section Header** | Nunito | 20px / 26px | 600 Semi-Bold | Normal | Category headers, sheet headers |
| **Vendor Name** | Nunito | 22px / 28px | 800 ExtraBold | Normal | Vendor detail header |
| **Price / Number** | Nunito | 18px / 22px | 700 Bold | Tabular (`num`) | Package pricing ("RM 2,500") |
| **Body Running** | Nunito | 15px / 22px | 400 Regular | Normal | Package details, review bodies |
| **Metadata** | Nunito | 13px / 18px | 400 Regular | Normal | Distance, categories, dates |
| **Micro Caption** | Nunito | 11px / 14px | 600 Semi-Bold | +0.06em | Status badges, pills, tabs |

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
* **Floating Search Pill:** Rounded-full container `py-1.5 pl-[18px] pr-1.5 bg-white text-ink shadow-float flex items-center gap-2`. Right trigger action orb is a 44px circle in Royal Aubergine.
* **Filter Chips:** `rounded-full border border-line bg-white text-ink text-sm px-3.5 py-2 font-medium active:bg-pucuk-100 active:border-hijau active:text-hijau`.

### 4.4 Cards & Modals
* **Outer Cards:** `rounded-2xl` (16px) with 1px border in `border-line` (`#ECE6E8`) and white surface fill.
* **Bottom Sheets:** `rounded-t-[24px]` with smooth spring entrance animation and drag handle indicator.

---

## 5. Motion & Interaction

* **Ken Burns Hero Animation:** Subtle zoom transition on featured image carousels (`@keyframes kenburns`).
* **Micro Shimmer:** Loading skeletons employ linear gradient shimmer transitioning from `#F0EAE6` to Warm Linen (`#FAF7EF`) and back.
* **Launch splash:** `src/components/Splash.tsx` plays the approved logo MP4 once per session on a cold open of Home; tap to skip, 7 s fallback, off under reduced motion.
* **Reduced Motion Compliance:** `@media (prefers-reduced-motion: reduce)` disables all transforms and animations for user accessibility.

---

## 6. Official Brandmark (🔒 locked)

The logo, heart-ribbon W and Tempa the weaver bird are final. **`docs/brand/LOGO.md` is the only spec**; files live in `preview/logos/final/`.

* **In the app:** `<WeevLogo variant="full" | "mark" | "mascot" light size />` (`src/components/WeevLogo.tsx`) loads `public/brand/` files.
* **`public/brand/`** = byte copies made by `scripts/brand/sync-public.sh`; the pre-commit hook and the Brand lock CI run `--check`, so a copy can never drift from `LOGO.sha256`.
* Favicon, apple-touch icon and `public/manifest.webmanifest` icons come from the same folder.
* The old Concept B serif logo and the brain mascot are retired (`preview/logos/trashcan/`): never use.
