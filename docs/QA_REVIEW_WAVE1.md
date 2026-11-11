# QA Review: Majlis Hub Wave 1

- **Reviewer:** QA agent (independent, read-only), role `.agents/06_code_reviewer_tsx.md`
- **Date:** 2026-11-11
- **Scope:** every file in `src/` (40 files, 3,793 lines), dev server `http://localhost:5173` at 430×932
- **Rules applied:** `figma-standard-ui` sections 1–14, F and the Guardians checklist (mobile 430 frame, so the 1440 and `p-10` canvas rules are skipped), `docs/BRAND_GUIDELINES.md` v1.1, `docs/retro.md` C1–C10
- **Method:** static read + grep. Then real Playwright clicks (`playwright-cli -s=qa run-code`, `locator.click()` and `mouse` drags, never `force`). Then a visual check of each screenshot.
- **Concurrency note:** `src/store.tsx` and `src/data/mock.ts` changed at 09:09, during this review (4 demo bookings added, storage key renamed `majlishub.v1` → `majlishub.v2`). The findings below do not depend on those lines. At the end I removed both keys from localStorage.

**Result: 8 🔴 blockers, 19 🟡 warnings, 8 🟢 suggestions.** Do not show Wave 1 until the blockers are fixed. B1, B2, B3 and B5 break flows a tester will hit within minutes.

| Check | Result |
|---|---|
| `npx tsc --noEmit -p .` | ✅ clean (exit 0) |
| `npm run build` | ✅ clean (tsc + vite, 418 kB JS / 42 kB CSS) |
| `any` types | ✅ 0 |
| Files over 300 lines | ✅ none (largest `SuggestStep.tsx` 167) |
| Console errors on 21 routes (fresh load) | ✅ none (only `favicon.ico` 404, see S1) |
| Horizontal overflow `main.scrollWidth > clientWidth` | ❌ `/kad` +53px (B2), all other routes 0 |
| Visible scrollbars (C1) | ✅ none on any route |
| Broken images | ✅ none |

---

## 🔴 Blockers

### B1 🔴 [BLOCKER] Every bottom sheet steals focus on each parent re-render. The Tabung amount field takes one character only.
- **Where:** `src/components/ui.tsx:107-113` (`Sheet`), which affects `TabungScreen.tsx:108`, `SuggestStep.tsx:152` (split sliders) and `ReelSheets.tsx:15` (after sending a comment)
- **Cause:** the effect depends on `[open, onClose]`. Callers pass an inline `onClose={() => setOpen(false)}`, so each keystroke that re-renders the parent creates a new `onClose`. The effect then runs again and calls `ref.current.focus()` on the dialog, which moves focus out of the input.
- **Repro:** `#/majlis` → Tabung → **Saya dah simpan** → tap Jumlah → type `500`. The field shows `5` and focus is on the dialog. The Nota field shows `B` after typing `Bonus`. In the wizard step 4 → **Pembahagian** → focus a slider → ArrowRight: focus leaves the slider after one step.
- **Fix (one place, every sheet):**
  ```tsx
  const closeRef = useRef(onClose); closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    ref.current?.focus();
    const k = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open]);
  ```

### B2 🔴 [BLOCKER] Kad Aturcara rows overflow the screen. The activity field and the delete button cannot be used.
- **Where:** `src/modules/kad/KadEditor.tsx:21` + `:107-109`
- **Cause:** `inputCls()` already contains `w-full`, and `cx(inputCls(), 'w-[104px] shrink-0')` adds a second width. `w-full` wins, so the time input is 356px wide. The activity input is squeezed to 30px (x 401–431) and the delete button sits at x 439–483, off a 430 screen. `main` scrolls 53px sideways.
- **Repro:** `#/kad` → scroll to **Aturcara**. Screenshot: `scratchpad/qa-kad-aturcara.png`.
- **Fix:** take the width out of the shared class. `const inputBase = 'px-3.5 py-3 leading-5 …'` (no `w-full`). `Input` and the textarea add `w-full`. The time input uses `cx(inputBase, 'w-[104px] shrink-0')` and the activity input uses `cx(inputBase, 'flex-1 min-w-0')`.

### B3 🔴 [BLOCKER] The guest heart on a search card sends the guest to Home after login, and the save is lost.
- **Where:** `src/modules/search/VendorCard.tsx:17`, which calls `nav('/masuk')` with no `next`
- **Repro:** set `authed:false` → `#/cari?cat=makeup` → tap the heart on a card → login `12-345 6789` → OTP `123456` → the app lands on `#/` (not Search), and `saved` is still `[21]`.
- **Fix:** `if (!s.authed) return nav('/masuk?next=' + encodeURIComponent(location.hash.slice(1) || '/'));`. `VendorScreen.tsx:25` already does this correctly. Optional: carry `&save=<id>` and apply it after login (S6).

### B4 🔴 [BLOCKER] After login, Kembali goes back to the OTP screen.
- **Where:** `src/modules/auth/LoginScreen.tsx:32` (phone → OTP uses `nav`) and `:52` (`nav(next)`)
- **Repro:** guest → `#/vendor/16` → heart → login → OTP → you land on the vendor (correct) → tap **Kembali** → you are on "Masukkan kod" while already logged in (`scratchpad/qa-guest-back.png`). Browser back does the same (A case: `#/masuk?step=otp&next=%2F`).
- **Fix:** move to the OTP step with `swap(...)`, not `nav`. In `verify()`, call `back(next)` in place of `nav(next)`. `history.back()` then returns to the screen that opened login (= `next`), and a deep link falls back to `next`.

### B5 🔴 [BLOCKER] After a browser or Android back, Kembali exits the app (retro C2/U3).
- **Where:** `src/router.tsx:26-30`. The module-level `depth` goes up on `nav()` but never comes down on a browser or system back.
- **Repro:** open `about:blank`, then `#/kad` → tap **RSVP (4)** → browser back (lands on `#/kad`, `depth` still 1) → tap **Kembali** → the browser goes to `about:blank`, out of the app.
- **Fix:** keep the depth in the history entry:
  ```ts
  const d = () => (history.state?.d as number | undefined) ?? 0;
  export const nav = (to: string) => { history.pushState({ d: d() + 1 }, '', '#' + to); dispatchEvent(new HashChangeEvent('hashchange')); };
  export const swap = (to: string) => { history.replaceState(history.state, '', '#' + to); dispatchEvent(new HashChangeEvent('hashchange')); };
  export const back = (fallback = '/') => (d() > 0 ? history.back() : swap(fallback));
  ```

### B6 🔴 [BLOCKER] Moving from one vendor URL to another crashes the whole app to a white screen.
- **Where:** `src/App.tsx:31` (`<VendorScreen id={Number(b)} />` has no `key`) + `src/modules/vendor/BookSheet.tsx:22,28`. `pkgId` state from the old vendor survives, then `v.packages.find(...)!` returns `undefined`, and `rm(pkg.price)` throws in the footer JSX even while the sheet is closed. There is no error boundary.
- **Repro:** `#/vendor/7` → change the hash to `#/vendor/12` (a shared link opened in the same tab, or a Phase 7 capture script that goes from vendor to vendor). `#root` ends up with 0 children. `TypeError: Cannot read properties of undefined (reading 'price')`.
- **Fix:** `case 'vendor': return <VendorScreen key={b} id={Number(b)} />;`. Also guard `const pkg = v.packages.find(p => p.id === pkgId) ?? v.packages[0];`. Use the same `key` pattern for `BookingDetail` and `ChatScreen`.

### B7 🔴 [BLOCKER] Wizard date and location inputs have no accessible name.
- **Where:** `src/modules/planner/WizardScreen.tsx:125-132`. `Field` renders a `<span>`, not a `<label>`, so the inputs at `:68`, `:80` and `:90` have no name. The error `<p role="alert">` is not tied to the input either.
- **Repro:** Playwright `getByLabel('Tarikh majlis')` returns 0 on `#/majlis/baru?step=2`. The a11y sweep lists `date:` (step 2) and `text:Contoh: Dewan Seri Kenanga…` (step 3) as unnamed.
- **Fix:** render `Field` as `<label className="w-full flex flex-col gap-2">…</label>`, the same way `KadEditor.tsx:12` does. Add `aria-describedby` that points to the error id.

### B8 🔴 [BLOCKER] Gold (`emas`) is used for status and UI chrome, which breaks the brand rule. The filter count badge also fails contrast.
- **Where:**
  - `src/modules/search/SearchScreen.tsx:77`: the filter count badge is `bg-emas text-white text-[11px]`. White on `#B98A2E` is about 3.0:1, which fails WCAG AA for 11px text.
  - `src/modules/planner/PlannerScreen.tsx:99`: the "Disenarai pendek" status pill uses `tone="emas"`.
- **Rule:** BRAND §3 says "Gold is for celebration, never for status or actions."
- **Fix:** badge `bg-ink text-white` (or `bg-bahaya` as on the Mesej tab dot). Shortlisted pill `tone="hijau"` with a `Bookmark` icon. More borderline gold uses are listed in W5.

---

## 🟡 Warnings

| # | Where | Finding | Fix |
|---|---|---|---|
| W1 | `InspirasiScreen.tsx:49`, `App.tsx:44` | **C5 fails as written.** Video measures 430×870.5 and the viewport is 430×932, because the bottom nav (61.5px) stays below the reel. `object-fit: cover` ✅, transparent top ✅. | Ask the user: overlay a transparent nav on the reel (`absolute bottom-0` dark nav) or hide the nav on `/inspirasi`. Do not change it without asking (M4). |
| W2 | `HomeScreen.tsx:86` | **U7 mismatch.** The hero fade is `h-[120px]` and the inner content uses `py-5`. U7 says a 150px fade and 104px bottom padding. | Confirm with the user before changing (U8/M4). The 120 may be deliberate. |
| W3 | `KadEditor.tsx:106` | Editable, deletable aturcara rows use `key={i}`. Deleting a middle row moves focus and IME state to the wrong row. | Add `id` to aturcara items and key on it. |
| W4 | `SuggestStep.tsx:51-61` | **"Majlis baru" silently overwrites the current event.** I made a Kenduri on 20 Mac 2027: the planner kept the name "Majlis Aina & Hakim" and still lists the 14 Feb bookings as confirmed for it (`qa-planner.png`). | Ask for confirmation ("Ganti majlis sedia ada?"), reset `name`, and flag bookings whose date ≠ the event date. |
| W5 | `HomeScreen.tsx:79`, `SuggestStep.tsx:95`, `TabungScreen.tsx:93,132`, `KadRsvpList.tsx:93`, `CompareScreen.tsx:55`, `CompareShare.tsx:66` | More gold outside the allowed moments: CTA icon, section-heading Sparkles, the "paid to vendor" icon, partial-saving rings, the colour of not-attending wishes, and "Nilai terbaik" pills. | Keep gold for the countdown ring, top-rated, kad templates and RSVP celebration. Use `hijau`, `ink` or `muted` elsewhere. |
| W6 | `CompareScreen.tsx:86` | Rogue hex `bg-[#1F8F4E]` for the WhatsApp button. `KadShare.tsx:23` uses `bg-hijau` for the same button. | Use `bg-hijau` (one share-button style). |
| W7 | `TabungScreen.tsx:51,78` | Two filled green CTAs on one screen ("Saya dah simpan" plus the primary "Bayar" when a payment is due within 30 days). BRAND §3 says one green voice. | Make the row action `secondary` and show urgency with an `amaran` pill. |
| W8 | `VendorCard.tsx:44`, `CompareTray.tsx:18`, `ReelSlide.tsx:94` | Small tap targets: Banding checkbox 79×20, tray remove ✕ 20×20, reel "lagi" 21×20. BRAND §8 requires a 44 hit area. | Add `py-3` (checkbox, "lagi") and a 44px wrapper with a 20px visual for ✕. |
| W9 | `ui.tsx:117-120` | The sheet has no focus trap and does not return focus to the opener. The scrim is a focusable `button aria-label="Tutup"`, so screen readers hear two "Tutup" buttons. | Scrim `tabIndex={-1} aria-hidden="true"`, trap Tab inside the dialog, restore focus to `document.activeElement` from before opening. |
| W10 | `BookingSheets.tsx:24-37` | The simulated payment `setTimeout` is not cancelled. If you close the sheet during "Memproses…", the booking still flips to paid 1.2s later. | Keep the timer in a ref and clear it on close or unmount. |
| W11 | `VendorScreen.tsx:80` | A tab `<button>` gets its height from `h-12` with no `py` (Guardian: height from padding). It uses `justify-end gap-3` to place the underline. | `py-3 leading-5`, with the underline as an absolute `h-0.5` bar at the bottom of a `relative` tab. |
| W12 | `SuggestStep.tsx:145`, `FilterSheet.tsx:75`, `compareRows.tsx:32` | Unicode glyphs used as icons: `★`, `→`, `•`. | `<Star className="w-3 h-3 fill-ink" />`, the words "rendah ke tinggi", and a `<Dot>` icon or a plain list. |
| W13 | `ChatScreen.tsx:48` | `opacity-60` on failed message text (figma-standard-ui: text stays at 100% opacity). | `bg-hijau/60` on the bubble, or `text-white/80`. |
| W14 | `ReelSlide.tsx:69-81`, `qa-inspirasi-like.png` | The white rail icons and counts sit over the light middle of cream reels with weak contrast. The gradient only darkens the top 20% and the bottom 58%. | Add a right-edge scrim (`bg-gradient-to-l from-black/40`) or put the counts in `bg-black/35` chips. |
| W15 | `mock.ts` (FALLBACK_IMG), `qa-home-mid.png`, `qa-cari-applied.png` | Different vendors show the **same photo** (Inai by Mira = Andaman Seri Ayu = Wajah Berseri). This hurts trust (U13). | Brief AGY for one photo per vendor (C7/U10). |
| W16 | `ui.tsx:7` | `rm()` breaks across lines between "RM" and the digits ("RM / 2,300" in `qa-tabung.png`). | `'RM ' + …` |
| W17 | `ui.tsx:89`, `HomeScreen.tsx:21`, `PlannerScreen.tsx:53,57`, `CompareScreen.tsx:55,59`, `CompareShare.tsx:35`, `WizardScreen.tsx:119`, `SuggestStep.tsx:66`, `TabungScreen.tsx:45` | Text sizes outside the type scale: `[10px]` (below the 12px caption; 11px is reserved for micro-badges), `[17px]`, `[26px]`, `[40px]`. | Map to tokens: caption 12, h3 16/22, mobile display 28/34, rating-xl 48. |
| W18 | `HomeScreen.tsx:49`, `KadEditor.tsx:67`, `CompareShare.tsx:33`, `CompareScreen.tsx:51`, `compareRows.tsx:37`, `SearchScreen.tsx:18-19`, `FilterSheet.tsx:21` | Radii outside the scale: `rounded-lg` ×4, `rounded-md`, bare `rounded` ×2, `rounded-t-[3px]`. | Use `rounded-xl` for inner photos and tiles, `rounded-full` for skeleton bars and histogram tops. |
| W19 | `store.tsx` | The storage key changed to `majlishub.v2` during this review. The QA brief and other agents' scripts still say `v1`. | Update `docs/retro.md` and the reset instructions. |

---

## 🟢 Suggestions

| # | Where | Suggestion |
|---|---|---|
| S1 | `index.html` | Add a favicon. This removes the only console error (`favicon.ico` 404) on every route. |
| S2 | `store.tsx:87-91` | The toast timer is stored on the function object through `as unknown`. A `useRef<number>()` is simpler and typed. |
| S3 | `KadCard.tsx:28-52`, `TabungScreen.tsx:131-132`, `HomeScreen.tsx:17` | Hardcoded SVG hex. Use `className="stroke-emas"` or `stroke="var(--color-emas)"` so tokens stay the single source. |
| S4 | `VendorTabs.tsx:65` | Calendar day `<span aria-label>` is ignored by many screen readers. Use `role="img"` or visually hidden text. |
| S5 | `/masuk` has 2 `<h1>` (TopBar + page). `/cari`, `/inspirasi` and `/jemputan` have none. | One `h1` per screen: TopBar title as `h1` only when the page has no own heading. |
| S6 | `VendorCard.tsx:17`, `InspirasiScreen.tsx:45` | After login, finish the action the guest started (save, like) through a `&do=` param. |
| S7 | `KadEditor.tsx:66-69` | Template thumbnails are plain colour swatches. A mini `KadCard` preview would help users pick. |
| S8 | `ReelSlide.tsx:91` | The description is cut with `…` and a "lagi" toggle. This is acceptable for a reel feed, but it is the only text truncation left. Mark it as an approved exception in retro. |

---

## figma-standard-ui grep counts (`src/**/*.tsx`)

| Pattern | Count | Verdict |
|---|---|---|
| Margins `m[trblxy]-N`, negative margins | 0 | ✅ |
| `space-x/y-` | 0 | ✅ |
| `max-w-` | 0 | ✅ |
| `min-w-[…]` | 0 | ✅ |
| `min-h-` | 2: `App.tsx:97`, `InspirasiScreen.tsx:49` | ✅ allowed (`min-h-0` flex reset, does not export) |
| `max-h` / `maxHeight` | 1: `ui.tsx:120` (88%) | ✅ allowed (sheet overlay cap) |
| `truncate` | 1: `KadShare.tsx:20` | ✅ allowed (single-line read-only input) |
| `line-clamp` | 0 | ✅ (JS `…` in `ReelSlide.tsx:91`, see S8) |
| `items-baseline` | 0 | ✅ |
| `ml-auto` | 0 | ✅ |
| `grid` | 2: `HomeScreen.tsx:106` (8 tiles), `VendorTabs.tsx:58` (calendar) | ✅ allowed (more than 6 cards; fixed calendar cells) |
| `before:/after:/::before/::after` | 0 (`FilterSheet.tsx:6` styles the native `::-webkit-slider-thumb`) | ✅ allowed (native control) |
| `border-b`+`pb-` / `border-t`+`pt-` on one element | 0 | ✅ |
| `h-*` on button/pill/input without `py` | 1: `VendorScreen.tsx:80` | ❌ W11 |
| `whitespace-nowrap` | 6, all on Button/Chip/Pill/StatusChip/category pills/voter chips | ✅ allowed |
| Unicode glyph icons | 3: `SuggestStep.tsx:145`, `FilterSheet.tsx:75`, `compareRows.tsx:32` | ❌ W12 |
| SVG `<text>` | 0 | ✅ |
| `preserveAspectRatio="none"` | 0 | ✅ |
| `opacity-*` on text | 1: `ChatScreen.tsx:48` | ❌ W13 (the KadGuest `disabled:opacity-40` on ± buttons is fine) |
| Index keys | 17 | ✅ static lists, except `KadEditor.tsx:106` (W3) |
| Clickable `div/span` | 0 | ✅ |

## Flows driven end to end (real clicks)

| Flow | Result |
|---|---|
| Home search pill → `#/cari?focus=1` (input focused) → Batal → chip "Mak Andam" → filter sheet → drag max and min thumbs with the mouse → "Tunjuk 3 vendor" → URL `?cat=makeup&min=300&max=2500`, active chip shown | ✅ |
| Tick 3 photographers → tray → Bandingkan (3) → table (no clipped cells) → Kongsi → Buka halaman undian → empty-name error → name "Hakim" → vote → thanks → back → Kembali to `/cari?cat=photo` | ✅ |
| Vendor 12 → Hantar permintaan → typed note kept focus → success → Lihat tempahan → Simulasi vendor terima → Bayar deposit → Pembayaran berjaya → Selesai → "Disahkan · tarikh dikunci" → Kembali → vendor → Kembali → `/cari` | ✅ |
| Guest heart (search card) → login → OTP 123456 | ❌ lands on Home (B3) |
| Guest heart (vendor page) → login → OTP → back on vendor ✅ → Kembali | ❌ returns to OTP (B4) |
| Wizard 1 → 4 (Kenduri, 20 Mac 2027, Dewan Komuniti Bangi, +50 pax) → Pembahagian → Tukar → Guna pakej ini → `/majlis` | ✅ flow, but ❌ B7 labels, W4 overwrite, B1 slider focus |
| Tabung → Saya dah simpan → type amount | ❌ B1 (only first char). With `fill('500')`: monthly RM 2,520 → 2,360 and "+RM 500" in history ✅ |
| Kad: type groom name ✅ → template Bunga Emas ✅ → empty bride blocks share ✅ → Kongsi → link `#/jemputan` → RSVP errors (name, phone) ✅ → submit 3 orang ✅ → shows in `#/kad/rsvp` ✅ | ✅ (B2 on Aturcara) |
| Inspirasi: video autoplays, double-tap → liked (8.9K → 9K), no pause toggle ✅ → Komen → type + Enter → comment appears ✅ (focus lost after send, B1) → Profil → vendor → Kembali → same reel ✅ | ✅ |
| Kembali real-click sweep: in-app (Tabung, Tempahan, detail, Kad, RSVP, wizard steps, chat, vendor after tab swaps) and deep-link fallback on 10 routes; `elementFromPoint` of each back button hits the button on all 13 TopBar routes | ✅. Exception: B5 after browser back. |

Screenshots: `/private/tmp/claude-503/-Users-fahi-abss/2454da75-054f-4373-8c4c-4f75cc14a622/scratchpad/qa-*.png` (home, home-mid, cari-focus, filter, filter-dragged, cari-applied, compare-tray, compare, compare-share, vote, vendor, booksheet, book-success, booking-requested, pay, pay-ok, booking-confirmed, vendor-switch, guest-*, wiz1, wiz3, wiz4, wiz-swap, planner, tabung, tabung-sheet, kad, kad-aturcara, kad-share, jemputan, jemputan-done, rsvp, inspirasi, inspirasi-like, inspirasi-comment, tempahan, chat, masuk, ulasan, mesej, detail-req, home-bottom).

## Visual pass

- ✅ No squashed circles. Stepper, Ring, avatars, OTP boxes and calendar days are all round or square.
- ✅ No broken images. No clipped text in the compare table.
- ✅ The hero card blends into the gradient. Text on reel cards has a dark gradient behind it.
- ❌ Clipped and overflowing Aturcara row (B2).
- ❌ Weak contrast on the reel rail over light footage (W14).
- ❌ The same photo is reused across vendors (W15).
- ❌ "RM" wraps away from its amount (W16).
- ⚠️ Radii are mostly on scale. 9 off-scale uses are listed in W18.

---

## Retro C1–C10 status

| Rule | Status | Evidence |
|---|---|---|
| C1 Visible scrollbar | ✅ | `src/index.css` has `* { scrollbar-width: none }` and `*::-webkit-scrollbar { display: none }`. No local override (grep 0). Playwright on 21 routes: no element with `offsetWidth-clientWidth>0` and overflow (only `<input>` false positives on `/kad`). |
| C2 Back button covered / wrong target | ❌ | Not covered: `elementFromPoint` hits Kembali on all 13 TopBar routes, and real clicks land on the origin screen (or the fallback on deep links). But B5: after a browser or Android back, Kembali leaves the app. B4: login stays in history. |
| C3 Hero layers are real elements | ✅ | `HomeScreen.tsx:42-87`: gradient is the `section` background, pattern is an `aria-hidden pointer-events-none` div child, fade is a real div. No pseudo-elements (grep 0). The 120px fade differs from U7 (W2). |
| C4 Hero full-bleed | ✅ | The hero `section` has no `rounded`, `border` or `mx`, and fills 430 from top 0 (`qa-home.png`). The event card has no border (`bg-white/[.06]`). |
| C5 Inspirasi full-bleed video | ❌ | `object-fit: cover`, width 430 and the transparent top are correct. Height is 870.5 against a 932 viewport because the bottom nav stays (W1). |
| C6 Category art + green shadow | ✅ | 8 tiles use `img/cat/${c.art}.png`, all 8 files exist in `public/img/cat/`, and the `drop-shadow(0 6px 6px rgba(14,94,75,.28))` style is at `HomeScreen.tsx:109`. |
| C7 Media only from AGY | ✅ | No stock or external media URLs (grep 0). All `src` values point under `img/` or `video/`. The duplicate photos (W15) still need an AGY brief. |
| C8 Front end only | ✅ | No `fetch`, `axios`, `XMLHttpRequest`, `WebSocket` or env keys (grep 0). The only external URLs are user-tapped `wa.me`, `t.me` and `maps.google.com` links. Payment is simulated and labelled "Ini simulasi". A network monitor was not run. |
| C9 figma-standard-ui layout | ❌ | Margins, `space-*`, `max-w` and `min-w-[]` are all clean. Open items: `h-12` tab buttons (W11), 3 unicode glyph icons (W12), text opacity (W13), off-scale radii (W18). |
| C10 Review gate | ❌ | QA logged here and `docs/PM_REVIEW_WAVE1.md` exists. `docs/retro.md` statuses are still ☐, and 8 blockers are open. Do not show Wave 1 yet. |
