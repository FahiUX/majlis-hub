# 🎨 Brand Guidelines & Design Token Specification

**Project:** Majlis Hub
**Version:** 1.1 (Gate 2 approved 2026-11-10 · v1.1 resolves pre-flight B5 + W21–W29)
**Design Philosophy:** *Warm marketplace, quiet confidence.* Photography and real proof (verified badges, real reviews, clear RM prices) carry the trust. The UI stays calm, generous and rounded so families feel welcome, and one deep green says "safe, checked, reliable".
**Reference standard (craft bar only, not cloned):** `docs/design-reference/airbnb` (marketplace structure, photo-first cards, single-accent discipline, one shadow tier) + `docs/design-reference/nerdwallet` (green-as-trust, mint washes instead of elevation, comparison density). Majlis Hub has its own palette, fonts, radius scale and components.

**Tone words:** Dipercayai (Trusted) · Hangat (Warm) · Teratur (Organised) · Meraikan (Celebratory, used sparingly)

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

## 3. Colour System

| Token | Hex | Use |
| :--- | :--- | :--- |
| `hijau` (primary) | `#0E5E4B` | Every primary CTA, active tab, selected state, Verified badge, links. White text on it = 7.7:1 |
| `hijau-pekat` | `#0A4A3B` | Pressed / hover state of primary |
| `hijau-malam` | `#062E25` | Footer, trust band, dark hero overlays |
| `pucuk-50` | `#EFF7F3` | Large soft panels (planner header, trust callouts) |
| `pucuk-100` | `#DDF0E7` | Selected filter pill fill, icon tiles |
| `pucuk-200` | `#B9DFCD` | Focus halo, progress track |
| `emas` | `#B98A2E` | **Celebration accent only.** Countdown ring, "Top rated" laurel, wedding ornaments. Never on body text |
| `emas-teks` | `#8A6420` | Gold text where needed (5.35:1 on white) |
| `emas-50` | `#F7F0E1` | Soft gold wash behind celebration moments |
| `kertas` (canvas) | `#FBFAF7` | App background: warm paper white, not clinical |
| `putih` (surface) | `#FFFFFF` | Cards, sheets, inputs |
| `ink` | `#1B2420` | Headlines, prices, star ratings (stars are ink, never yellow) |
| `body` | `#3C4743` | Running text |
| `muted` | `#67716D` | Meta lines: distance, dates, captions |
| `hairline` | `#E4E2DC` | Default 1px borders and dividers |
| `hairline-kuat` | `#CFCCC4` | Input borders, strong dividers |
| `bahaya` (danger) | `#B42318` | Errors, destructive actions |
| `bahaya-50` | `#FEF3F2` | Error alert / error state background (text stays `bahaya` or `ink`) |
| `amaran` (warning) | `#A15C07` | Over budget, reply deadline under 6h |
| `amaran-50` | `#FEF6E7` | Warning alert background |
| `skeleton` | `#EFEDE8` | Loading skeleton base (shimmer to `kertas`) |
| `info` | `#1F5FA8` | Neutral info, inline legal links |

**Rules**
- One green voice. On any screen, `hijau` appears in at most 1 filled CTA plus small trust marks. Everything else is ink on white/paper.
- Gold is for celebration, never for status or actions. Allowed gold moments: countdown ring, "Top rated" laurel, "Paling popular" package pill, event icon in booking sheet.
- Status is never colour alone. Always pair it with an icon and a label.

---

## 4. Surface, Border & Elevation
* **Page:** `kertas` · **Cards:** `putih` + `1px hairline`
* **Active / Selected:** `2px hijau` border + `pucuk-50` fill
* **Control stroke:** `1.5px line2` on checkbox, radio and timeline dots (only non-1px/2px stroke)
* **No side-only strokes.** Vendor replies sit in a `pucuk-50` panel, `rounded-xl`, no left border.
* **Focus ring:** `2px hijau` outline with 2px offset (keyboard), `4px pucuk-200` halo on inputs
* **One shadow tier only** (floating elements: search pill, sticky bars, dropdowns, card hover):
  `0 0 0 1px rgba(27,36,32,.04), 0 2px 6px rgba(27,36,32,.05), 0 8px 24px rgba(27,36,32,.08)`
* **Scrim:** `ink` at 48% for sheets and modals

---

## 5. Typography
* **UI family: Figtree** (Google Fonts, 400/500/600/700). Friendly, open shapes that stay very legible in BM's longer words.
* **Display accent: Fraunces** (Google Fonts, 500/600, soft optical size). Only for hero headlines, the My Majlis event name, and the big rating number. Gives a wedding-invitation warmth without going script.
* **Numbers:** `font-variant-numeric: tabular-nums` on prices (RM), pax, ratings and dates.

| Token | Size / Line | Weight | Family | Use |
| :--- | :--- | :--- | :--- | :--- |
| `display` | 32/38 (mobile 28/34) | 600 | Fraunces | Home hero, event name |
| `rating-xl` | 48/52 | 600 | Fraunces | Vendor rating "4.9" (peak trust moment) |
| `h1` | 24/30 | 700 | Figtree | Page titles, vendor name |
| `h2` | 20/26 | 600 | Figtree | Section heads ("Pakej", "Ulasan") |
| `h3` | 16/22 | 600 | Figtree | Card titles, package names |
| `body` | 15/22 | 400 | Figtree | Running text |
| `body-sm` | 14/20 | 400 | Figtree | Card meta, distance, dates |
| `label` | 13/16 | 600 | Figtree | Form labels, chip labels |
| `caption` | 12/16 | 500 | Figtree | Helper text, timestamps |
| `price` | 18/22 | 700 | Figtree tabular | "RM 28 / pax", "dari RM 2,500" |

- Headlines max 2 lines, `tracking-tight` (-0.01em) on h1/display only.
- No ALL-CAPS paragraphs. Uppercase is allowed only on micro-badges (11px/600, +0.04em).
- BM copy runs ~20% longer than EN. Every text container must wrap gracefully. No fixed-width labels.

---

## 6. Iconography (Lucide React)
* **Library:** `lucide-react`, `strokeWidth={1.75}` everywhere. Sizes 16 / 20 / 24. Feature tiles: 24px icon in a 44px `pucuk-100` circle.
* **Category icons:**

| Category | Icon |
| :--- | :--- |
| Catering | `UtensilsCrossed` |
| Photo & Video | `Camera` |
| MC / Emcee | `Mic` |
| Venue / Dewan | `Building2` |
| Decor & Pelamin | `Flower2` |
| Makeup / Mak Andam | `Sparkles` |

* **Trust & system icons:** Verified `ShieldCheck` · Verified Freelancer `BadgeCheck` · Booked via Majlis Hub `CalendarCheck` · Rating `Star` (ink fill) · Distance `MapPin` · Response time `Clock` · Halal `Award` + "Halal" text label (no official JAKIM logo) · Save `Heart` · Compare `Scale` · Chat `MessageCircle` · Budget `Wallet` · Checklist `ListChecks`

---

## 7. Signature Trust Components

| Component | Spec |
| :--- | :--- |
| **Verified badge** | Pill, `pucuk-100` fill, `hijau` text 12/600, `ShieldCheck` 14px. Tap → bottom sheet "What we checked": ✓ SSM matches business name ✓ IC verified ✓ Halal cert valid until … ✓ Verified on 12 Okt 2026 |
| **Verified Freelancer** | Same pill, `BadgeCheck` icon, label "Freelancer Disahkan" |
| **Booked via Majlis Hub tag** | On every review. `CalendarCheck` 12px + caption muted "Tempahan melalui Majlis Hub · Kenduri, Jun 2026" |
| **Rating block** | Fraunces 48px ink number + 5 ink stars + "128 ulasan sebenar" |
| **Price line** | Always RM, always visible: "RM 28 / pax · min 300 pax" or "dari RM 2,500". Never "PM for price" |
| **Response time** | `Clock` + "Biasanya balas dalam 2 jam" |
| **Status chips** | Requested = ink outline · Accepted = hijau fill white text · Completed = pucuk-100 + hijau text · Declined/Cancelled = hairline fill muted text · Expired = amaran outline. Each with an icon |

---

## 8. Component Blueprint Specs

**Sizing rule (Figma-safe):** controls get their height from padding + line-height, never from `h-*`. Visual heights below are the result, not a fixed value. Small visuals (chip 36, heart 36) keep a **44×44 hit area** via an invisible padding wrapper or `::after` inset.

| Component | Classes | Visual height |
| :--- | :--- | :--- |
| Primary button | `py-3.5 px-5 leading-5 bg-[#0E5E4B] text-white rounded-[10px] text-[15px] font-semibold hover:bg-[#0A4A3B]` · disabled `bg-[#B9DFCD] cursor-not-allowed` | 48 |
| Secondary button | `py-3.5 px-5 leading-5 bg-white border border-[#CFCCC4] text-[#1B2420] rounded-[10px] font-semibold hover:bg-[#FBFAF7]` | 48 |
| Small button (row actions: Cari, Pilih) | `py-2 px-3 leading-5 text-sm` + 44 hit area | 36 |
| Tertiary / text | `text-[#0E5E4B] font-semibold underline-offset-4 hover:underline` | — |
| Danger | `bg-white border border-[#B42318]/40 text-[#B42318]` (same padding as secondary) | 48 |
| Input | `py-3.5 px-3.5 leading-5 bg-white border border-[#CFCCC4] rounded-[10px]` · focus `border-[#0E5E4B] ring-4 ring-[#B9DFCD]/60` · error `border-[#B42318]` + 12px error text with `AlertCircle` | 48 |
| Textarea | input classes + `rows={3}` (no fixed height) | — |
| Search pill | `py-1.5 pl-[18px] pr-1.5 rounded-full bg-white` + shadow tier; right orb 44px circle `hijau` | 56 |
| Filter chip | `py-2 px-3.5 leading-5 rounded-full border border-[#E4E2DC] text-sm font-medium` · active `bg-[#DDF0E7] border-[#0E5E4B] text-[#0E5E4B]` + `X` | 36 (hit 44) |
| Pill / badge | `py-1 px-2.5 leading-4 rounded-full text-xs font-semibold` · on-photo variant: `bg-white/95` + shadow tier | 24 |
| Status chip | `py-1.5 px-2.5 leading-4 rounded-full text-[13px] font-semibold` + 14px icon | 28 |
| Heart (on photo) | 36px visual circle `bg-white/95` + shadow, 44 hit area | 36 (hit 44) |
| Language toggle | segmented, each option `py-1.5 px-3 text-xs font-bold` inside a `p-0.5` rounded-full track | 32 (hit 44) |

**Status chips:** Requested = ink 1px outline · Accepted = `hijau` fill, white text · Completed = `pucuk-100` + `hijau` text · Declined/Cancelled = `hairline` (#E4E2DC) fill + `muted` text · Expired = `amaran` outline · Not started = `kertas` fill + `hairline` solid 1px + `muted` text. Each with an icon.

**Surfaces:** Home hero = gradient `hijau-malam → hijau-pekat → hijau` (170°) with a soft `emas` glow top-right and the songket diamond pattern at 16% fading out downward, bottom corners 24px, status bar `hijau-malam`. The event card sits on it as a 10% white glass card. This is the only gradient in the product. Planner header = `pucuk-50` (working surface). Vendor card: photo 4:3 `rounded-xl`, Verified pill (on-photo variant) top-left, heart top-right, then name (h3, Fill) + rating (Hug), category · distance (body-sm muted), price line.

**Layout rules for code:** flex + gap everywhere (grid only for >6 equal cards, e.g. calendar); two-text rows = left `flex-1 min-w-0` + right `shrink-0`; no margins for spacing; no `truncate` except single-line inputs and fixed table rows; dividers are `h-px` elements, not side borders.

---

## 9. Imagery
* Real Malaysian majlis: pelamin, dewan, food spreads, couples, families. Warm daylight, natural colour, no heavy filters.
* Vendor photos are the hero. UI chrome stays white, paper and green so the photos lead.
* Placeholder art (prototype only): royalty-free / CC-licensed with inline credit. Never stock photos with watermarks.
* No illustrations of people in v1. Empty states use a single line icon in a `pucuk-50` circle + one short sentence + one action.

---

## 10. Voice
* BM default, friendly-formal ("anda"), short sentences. Example: "Tarikh ini masih kosong. Hantar permintaan sekarang."
* Specific over vague: "Biasanya balas dalam 2 jam" beats "Fast response".
* Never over-promise. No "Best caterer in Malaysia!". Let ratings and verification speak.
