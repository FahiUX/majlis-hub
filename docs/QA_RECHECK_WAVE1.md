# QA Re-check: Majlis Hub Wave 1

- **Reviewer:** QA agent (read-only), 2026-11-11
- **Build under test:** `c6bd312` (fixes in 2bcadab, 0170f11, 6fd3616, 4ab7c3b, c6bd312), dev server `http://localhost:5173`, 430×932
- **Method:** `playwright-cli -s=qa2 run-code` with real `locator.click()` and `keyboard.type()` (key by key, never `force`, never `fill` except the native date input). Started and ended with `localStorage.clear()`. Screenshots are in `scratchpad/qa2-*.png` and I looked at each one.
- **Inputs:** `docs/QA_REVIEW_WAVE1.md` (B1–B8), `docs/PM_REVIEW_WAVE1.md` (C-5.0, C-6.0, C-3.3, 48h expiry, review data)

**Result: all 8 QA blockers and all 5 PM blockers pass. No new 🔴 blockers.** One new 🟡 (compare pills overflow). Wave 1 can be shown.

## Verification table

| Item | Result | Evidence |
|---|---|---|
| `npx tsc --noEmit -p .` | ✅ | exit 0 |
| `npm run build` | ✅ | exit 0, 1888 modules, JS 450.9 kB / CSS 45.8 kB |
| **B1** sheet focus | ✅ | `#/tabung` → Saya dah simpan → Jumlah typed `5`,`0`,`0` key by key → value `500`, `activeElement` = `#tb-amt`. Nota `Bonus` typed in full. Wizard step 4 → Pembahagian → slider ArrowRight ×4: 46 → 50, focus stays on the slider (`qa2-b1-tabung-sheet.png`, `qa2-b1-split.png`) |
| **B2** Kad Aturcara | ✅ | `#/kad`: main 430/430, no overflow. Delete button at x 349–393 (44×44). Tambah acara 4 → 5 rows, typed "Potong kek", Buang acara 1 → 4 rows, row 1 now "Ketibaan pengantin" (`qa2-b2-kad-aturcara.png`) |
| **B3** guest heart on search | ✅ | Logged out via `#/akaun` → Cari → heart on Lensa Kasih Studio → `#/masuk?next=/cari?save=7` → phone → OTP `123456` → back on `#/cari`, `saved` = `[21,7]`, heart filled, toast "Disimpan ke senarai pendek" (`qa2-b3-after-login.png`) |
| **B4** no return to OTP | ✅ | After the B3 login, browser back went to `#/` (Home), not OTP. Second path: guest → `#/vendor/28` → heart → login → OTP → `#/vendor/28` → Kembali → `#/cari` |
| **B5** back after browser back | ✅ | `about:blank` → `#/cari` → click vendor → `go-back` → `#/cari` → open vendor → Kembali → `#/cari`. Original repro `#/kad` → RSVP → go-back → Kembali → `#/majlis` (stayed on localhost). `#/majlis` → Cari → vendor → back ×2 → Tabung → Kembali → `#/majlis` |
| **B6** vendor → vendor | ✅ | `#/vendor/7` → `location.hash='#/vendor/12'`: root has 1 child, h1 "Bingkai Abadi Films", 0 console errors. Also `#/vendor/7?book=1` → `#/vendor/2?book=1`: no crash |
| **B7** wizard labels | ✅ | Snapshot step 2: `textbox "Tarikh majlis"`, step 3: `textbox "Lokasi majlis"`, `spinbutton "Bilangan tetamu"`. `getByLabel` finds each one. 0 unnamed inputs on step 3 |
| **B8** gold for status | ✅ | Filter badge is now `bg-ink text-white` (`SearchScreen.tsx:88`). "Disenarai pendek" is a green Pill with a Bookmark icon (`PlannerScreen.tsx:98`). The remaining `emas` uses are countdown ring, kad templates, RSVP party icon, "Rating tertinggi" pill and the reel like heart (see 🟡 N2) |
| **C-5.0** leave review | ✅ | `#/tempahan/B-0988` → Tulis ulasan → empty submit shows "Pilih bilangan bintang" → 5 stars + typed text → Hantar ulasan → detail shows "Diulas / Ulasan anda / Ubah ulasan" → `#/vendor/29?tab=ulasan` contains the new review (`qa2-c50-review-sheet.png`, `qa2-c50-vendor29-ulasan.png`) |
| **C-6.0** account / logout | ✅ | Home avatar "Akaun" → `#/akaun` (profile, Tempahan saya, Disimpan list, Bahasa, notification switches, demo reset, Log keluar) → Log keluar → `#/`, `authed:false`, guest hero with 2 "Log masuk" CTAs (`qa2-c60-akaun.png`, `qa2-c60-guest-home.png`) |
| **C-3.3** custom checklist | ✅ | `#/majlis` → typed "Bunga telur QA" + note → Tambah item → checkbox appears → tick → still ticked after reload → Padam → gone (`qa2-c33-checklist.png`) |
| **48h expiry** | ✅ | B-1049: "Tamat tempoh" chip, "Vendor tidak membalas dalam 48 jam", "Cuba vendor serupa". B-1038: "Luput · deposit tak dibayar". B-1051: "Sebab: Penuh pada tarikh ini", plus similar vendors (`qa2-exp-*.png`) |
| **Review data** | ✅ | Vendor 7 and vendor 12 show different review text (7: "Sangat profesional dan tepat masa…", 12: "Hasil cantik. Cuma lambat sikit…"). "Nurul Aina" appears in no review on vendors 2, 7, 12 or 29 |
| **TopBar Kembali (C2)** | ✅ | `elementFromPoint` hits Kembali on all 19 routes that have one. Real clicks on deep links go to their fallbacks (banding→cari, vendor→cari, tempahan→majlis, detail→tempahan, wizard step 3→2, tabung/kad→majlis, rsvp→kad, chat→mesej, masuk/akaun→/). In-app: Tabung, Kad, Tempahan → `#/majlis` |
| **Console errors** | ✅ | 0 errors and 0 page errors on 30 routes (every `App.tsx` case, all 7 seeded bookings, wizard steps 1–4) and during every flow |
| **Horizontal overflow** | ✅ | `main.scrollWidth == clientWidth == 430` and document width 430 on all 30 routes |
| **Home hero fade** | ✅ | Fade layer measures **150px** (`HomeScreen.tsx:48`). Content now uses `pb-[104px]`, matching U7 |

## Regression smoke (first-report flows)

| Flow | Result |
|---|---|
| `#/cari?cat=photo` → tick 3 Banding → Bandingkan (3) → Kongsi → Buka halaman undian → pick + name "Hakim" → vote → "sudah dihantar" | ✅ (see 🟡 N1 for pill overflow) |
| `#/vendor/12` → Hantar permintaan → note kept ("Nota QA2") → submit → Lihat tempahan → Simulasi: vendor terima → Bayar deposit → Bayar → Selesai → "Disahkan · tarikh dikunci", deposit RM 645 paid | ✅ (`qa2-booking-confirmed.png`) |
| Wizard: type → Seterusnya → date → Seterusnya → location → Seterusnya → step 4 → Guna pakej ini → "Ya, ganti" confirm (old W4 fixed) → `#/majlis` | ✅ |
| `#/jemputan` → name, +2 orang → Hantar RSVP → "Tetamu QA2" in `#/kad/rsvp` | ✅ (`qa2-rsvp.png`) |
| `#/inspirasi` → Suka 8.9K → 9K, `aria-pressed=true` → Komen → typed + Enter → comment shows, focus stays in the comment input | ✅ |

## New 🔴 blockers

None.

## Remaining 🟡

| # | Where | Finding | Fix |
|---|---|---|---|
| N1 (new) | `CompareScreen.tsx:55`, likely `CompareShare.tsx:66` | Verdict pills are `whitespace-nowrap` and wider than the ~100px column. "Dalam bajet anda" runs 9–17px into the next column, and in column 3 it is clipped at the screen edge ("Dalam bajet and", `qa2-compare.png`). Measured: pill 320–430 vs column 312–413. | Add `!whitespace-normal` to those Pills (`className="!px-2 !py-0.5 !whitespace-normal"`), or use a shorter label such as "Ikut bajet". |
| N2 | `ReelSlide.tsx:69,78` | The liked heart and like burst are gold. Like is a state, so this is borderline under BRAND §3 (it was not in the B8 list). | Ask the user. Red (`fill-bahaya`) matches the vendor-page heart. |
| N3 | `BookingDetail.tsx` "Cuba vendor serupa", vendor 29 | Similar-vendor rows reuse one photo, and Inai by Mira shows a makeup photo with an "Inai" tag (old W15, needs an AGY media brief). B-1049 lists 2 similar vendors where the code comment says 3. | AGY brief for one photo per vendor. Check the similar-vendor filter if 3 are required. |
| N4 | `#/banding` deep link | Kembali falls back to `#/cari` and drops the category the user came from. | Optional: fall back to `/cari?cat=<category of the first id>`. |
| Old | W1 (reel height with nav), W3 (key on aturcara rows) and the other first-report warnings I did not re-test | Status not re-checked in this pass, except W2 (fade now 150, fixed), W4 (wizard asks "Ya, ganti", fixed) and S1 (no favicon 404 in the console, fixed). | See `QA_REVIEW_WAVE1.md`. |

Cleanup: `localStorage.clear()` ran at the end (length 0). The browser session `qa2` is closed. `git status` is clean.
