# 🎨 Brand Guidelines & Design Token Specification

**Project:** [Project Name]  
**Version:** 1.0  
**Design Philosophy:** High-density, utilitarian elegance, agency-grade finish, zero generic AI slop.

---

## 1. Spatial Rhythm & Containers
* **Base Grid Unit:** 4px / 8px multiples.
* **App Shell Max-Width:** `max-w-7xl` (1280px) or `max-w-[1440px]`.
* **Standard Page Padding:** `px-4 sm:px-6 lg:px-8`, `py-6 sm:py-8`.
* **Standard Card Gap:** `gap-4` or `gap-6` (Never arbitrary odd pixels).

---

## 2. Corner Radius Token Scale
Strict hierarchical scaling. Pick ONE rule set and never deviate:
* **Outer Cards & Modals:** `rounded-2xl` (16px)
* **Inner Sub-containers / Tables:** `rounded-xl` (12px)
* **Buttons, Form Inputs & Selects:** `rounded-lg` (8px)
* **Status Badges, Avatars & Pills:** `rounded-full` (9999px)

---

## 3. Surface & Border Stroke System
* **Primary Background:** `bg-slate-50` (dark: `bg-slate-950`)
* **Card Surface:** `bg-white` (dark: `bg-slate-900`)
* **Standard Border Stroke:** `1px solid` with alpha (`border-slate-200/80` or `border-zinc-200`)
* **Active / Selected Stroke:** `1.5px` or `2px` brand color
* **Shadows:** Ultra-subtle, ambient only:
  - `shadow-sm` or `shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]`
  - Never heavy muddy drop-shadows.

---

## 4. Typography Scale
* **Font Family:** [Inter / Geist / Plus Jakarta Sans / Outfit]
* **Page Titles (H1):** `text-2xl sm:text-3xl font-bold tracking-tight text-slate-900`
* **Section Headers (H2):** `text-lg sm:text-xl font-semibold tracking-tight text-slate-900`
* **Card Titles (H3):** `text-base font-semibold text-slate-800`
* **Body Text:** `text-sm text-slate-600 leading-relaxed`
* **Micro-copy & Status Badges:** `text-xs font-semibold uppercase tracking-wider`

---

## 5. Iconography Standards (Iconify + Lucide React)
* **Primary Icon Library:** Lucide React (`lucide-react`)
* **Discovery Source:** Search `iconify.design` for domain-accurate icons.
* **Stroke Consistency:** Strictly `strokeWidth={1.5}` or `strokeWidth={1.75}` across all icons.
* **Standard Sizing:**
  - Inline navigation: `w-4 h-4` (16px) or `w-5 h-5` (20px)
  - Hero / Feature icons: `w-8 h-8` (32px) or `w-10 h-10` (40px) inside a `p-2.5 rounded-xl` container.

---

## 6. Component Blueprint Specs
* **Primary Button:** `px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition`
* **Secondary Button:** `px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition`
* **Status Badges:** `inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium`
  - Success: `bg-emerald-50 text-emerald-700 border border-emerald-200`
  - Warning: `bg-amber-50 text-amber-700 border border-amber-200`
  - Danger / Urgent: `bg-rose-50 text-rose-700 border border-rose-200`
  - Neutral / Waiting: `bg-slate-100 text-slate-600 border border-slate-200`
