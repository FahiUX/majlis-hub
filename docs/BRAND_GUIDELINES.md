# 🎨 Brand Guidelines & Design Token Specification

**Project:** Majlis Hub
**Version:** 1.0 (Draft for Gate 2)
**Design Philosophy:** *Warm marketplace, quiet confidence.* Photography and real proof (verified badges, real reviews, clear RM prices) carry the trust. The UI stays calm, generous and rounded so families feel welcome, and one deep green says "safe, checked, reliable".
**Reference standard (craft bar only, not cloned):** `docs/design-reference/airbnb` (marketplace structure, photo-first cards, single-accent discipline, one shadow tier) + `docs/design-reference/nerdwallet` (green-as-trust, mint washes instead of elevation, comparison density). Majlis Hub has its own palette, fonts, radius scale and components.

**Tone words:** Dipercayai (Trusted) · Hangat (Warm) · Teratur (Organised) · Meraikan (Celebratory, used sparingly)

---

## 1. Spatial Rhythm & Containers
* **Base Grid Unit:** 4px, with 8px as the working step.
* **Spacing tokens:** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64
* **Mobile (customer, primary):** 16px side gutter, 12px between cards, 24px between sections. Sticky bottom action bar 72px tall.
* **Desktop (vendor/admin dashboards, customer wide view):** `max-w-[1280px]`, `px-6 lg:px-8`, sidebar 248px.
* **Section rhythm:** 48px between major bands on desktop, 32px on mobile. Card grids stay tight (16px) so it reads as a marketplace.

---

## 2. Corner Radius Token Scale
* **Outer cards, sheets & modals:** `rounded-2xl` (16px). Bottom sheets: 24px top corners only.
* **Inner containers, photos inside cards, tables:** `rounded-xl` (12px)
* **Buttons, inputs, selects:** `rounded-[10px]`
* **Badges, chips, filter pills, avatars, search bar:** `rounded-full`

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
| `amaran` (warning) | `#A15C07` | Over budget, reply deadline under 6h |
| `info` | `#1F5FA8` | Neutral info, inline legal links |

**Rules**
- One green voice. On any screen, `hijau` appears in at most 1 filled CTA plus small trust marks. Everything else is ink on white/paper.
- Gold is for celebration, never for status or actions.
- Status is never colour alone. Always pair it with an icon and a label.

---

## 4. Surface, Border & Elevation
* **Page:** `kertas` · **Cards:** `putih` + `1px hairline`
* **Active / Selected:** `2px hijau` border + `pucuk-50` fill
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
* **Primary button:** `h-12 px-5 bg-[#0E5E4B] text-white rounded-[10px] text-[15px] font-semibold hover:bg-[#0A4A3B] active:scale-[.99]`. Full-width in mobile sticky bars.
* **Secondary button:** `h-12 px-5 bg-white border border-[#CFCCC4] text-[#1B2420] rounded-[10px] font-semibold hover:bg-[#FBFAF7]`
* **Tertiary / text:** `text-[#0E5E4B] font-semibold underline-offset-4 hover:underline`
* **Danger:** `bg-white border border-[#B42318]/40 text-[#B42318]`
* **Input:** `h-12 px-3.5 bg-white border border-[#CFCCC4] rounded-[10px]`. Focus: `border-[#0E5E4B] ring-4 ring-[#B9DFCD]/60`. Error: `border-[#B42318]` + 12px error text with `AlertCircle`.
* **Search pill:** `h-14 rounded-full bg-white` + shadow tier, `Search` icon left, "Cari katering, jurugambar, MC…" placeholder, circular 44px `hijau` filter button right.
* **Filter chip:** `h-9 px-3.5 rounded-full border border-[#E4E2DC] text-sm font-medium`. Active: `bg-[#DDF0E7] border-[#0E5E4B] text-[#0E5E4B]` + `X` to remove.
* **Vendor card (list):** photo 4:3 `rounded-xl`, Verified pill floating top-left on photo, heart 36px circle top-right, then name (h3), category · distance (body-sm muted), rating `★ 4.9 (128)`, price line.
* **Touch targets:** minimum 44×44px. Primary CTAs 48px tall.

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
