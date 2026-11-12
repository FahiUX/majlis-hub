> Verified independently 2026-11-11 (real clicks). Replaces the self-graded "100%" version from 54797e5. Blockers B1 (late-booking schedule) and B2 (gold Baru pill) fixed after this audit.

# Majlis Hub: Module status, independently verified

- **Date:** 11 Nov 2026 · **Code:** `f053517` (polish commit `b4ecb6a`, self-graded status `54797e5`)
- **Reviewer:** independent QA + PM, read-only (no source edits, no commits)
- **Checked against:** `docs/MODULE_FEATURE_SPEC.md` v2.0, every Guest + Customer row, using the same method as the `2e56ad5` audit (✅ = 1, 🟡 = ½; 5 states per spec row; deferred G-3.0 and C-1.3 left out; Vendor/Admin Wave 2 = 0)
- **How:** Playwright CLI session `v1`, 430×932, real clicks (no `force`), logged-in customer and logged-out guest. `localStorage.clear()` + reload at the start and the end. Store key `majlishub.v3`. Screenshots: `scratchpad/v1-*.png` (26 files).

---

## 1. Summary by module

| Module | Features | ✅ | 🟡 | 🔴 | % | Note |
| :-- | :-: | :-: | :-: | :-: | :-: | :-- |
| Akaun & Log masuk | 2 | 1 | 1 | 0 | 75% | C-6.0 now ✅ (real phone, Ubah profil with email check, toggles persist, Video disukai). G-2.0 unchanged: no email + password, no button spinner, no "already registered" path. |
| Carian & Penapis | 4 | 2 | 2 | 0 | 75% | C-1.0 and C-1.2 now ✅ (free-on-date, pax, halal, removable pills). C-1.1: District + truthful origin fixed, but no GPS-denied fallback and no multi-state service area. G-1.0 unchanged. |
| Banding vendor | 2 | 2 | 0 | 0 | 100% | Compare, share, vote ("Hakim" shows on the column) all pass. |
| Profil vendor | 5 | 2 | 3 | 0 | 70% | C-2.2 now ✅. "Lihat semua 53 ulasan" opens only 3 reviews. "See full menu" collapse not built. No og:meta, so WhatsApp shows no preview card. |
| Tempahan & Deposit | 4 | 3 | 1 | 0 | 88% | C-4.0 and C-4.2 now ✅. C-4.4 has a schedule bug when the booking date is less than 30 days away (see 🔴 B1). |
| Chat | 1 | 1 | 0 | 0 | 100% | Photo send works. Thread is per vendor, not per booking (minor). |
| Majlis Saya | 5 | 2 | 3 | 0 | 70% | Day 2 shows, active count matches, prefill works and follows a place change. Still no map pin or multiple events. Swap sheet shows 1 alternative (spec says 3). No "widen radius". No vendor avatar. |
| Tabung | 2 | 2 | 0 | 0 | 100% | Overdue instalment (B-1042) is amber, "Bayar sekarang" works, and money matches Planner and Tempahan. |
| Kad Kahwin & RSVP | 2 | 1 | 1 | 0 | 75% | Belum jawab = invited − answered, which is right. Too-many-guests warning is still only on the RSVP list, not in Majlis Saya. |
| Inspirasi video | 7 | 6 | 1 | 0 | 93% | C-7.2 and C-7.3 now ✅. C-7.0: the feed never ends ("Anda dah tengok semua" not built) and isn't ranked by distance. |
| Ulasan | 1 | 0 | 1 | 0 | 50% | The profile updates (4.9 · 54), but the search card still says 5.0 · 53 ulasan. |
| Vendor (Wave 2) | 15 | 0 | 0 | 0 | 0% | ⬜ Not built |
| Admin (Wave 2) | 8 | 0 | 0 | 0 | 0% | ⬜ Not built |
| **Total** | **60** | **22** | **13** | **0** | | 2 deferred (⏸), 23 Wave 2 (⬜) |

## 2. Totals

```
Customer side (G + C, 35 rows, 2 deferred left out)
  ✅ 22 · 🟡 13 · 🔴 0     (22 + 13×½) / 35 = 28.5 / 35 = 81%   ████████████████░░░░

Full spec (60 rows; Wave 2 and deferred = 0)
  28.5 / 60 = 48%                                            ██████████░░░░░░░░░░

Stakeholder 10 points                                        10 / 10
```

**Compared with the self-graded claim:** `54797e5` says the customer side is **100%** (35/35 ✅). This independent check gives **81%** (up from the 67% baseline in `2e56ad5`, so +14 points). The gap of 19 points comes from 13 rows that still have spec gaps. That file is also inconsistent with itself: its summary table says 100%, but its detailed tables are copied unchanged from the 67% audit and still list every old gap.

---

## 3. Polish items (A)

| # | Item | Result | Evidence |
| :-: | :-- | :-: | :-- |
| 1 | Filter: free on date | ✅ | Mak Andam 3 → 2 vendors; Inai 2 → 1; MC 2 → 1. `aria-pressed` toggles. |
| 2 | Filter: guest count | ✅ | Stepper starts at event pax (500), +100 steps; 900 tetamu → "Tunjuk 1 vendor". Pill "1200 tetamu" can be removed. |
| 3 | Filter: halal | ✅ | Works on Mak Andam and Inai. Turned off on Foto with the hint "Halal: tidak berkaitan untuk kategori ini". |
| 4 | Town picker | ✅ | Ikut negeri → Selangor → Klang: "2 vendor semua kategori · Klang", distance 1 km, URL `?st=Selangor&town=Klang`. |
| 5 | kmFrom distances | ✅ | Event place changed to Bangi: "dalam 70 km dari Bangi", Kak Long Emcee 1 km → 41 km. searchLogic self-check passes. |
| 6 | "dari <town>" truthful | ✅ | Text follows the event town (Shah Alam → Bangi) or the chosen town. |
| 7 | Active chip scrolled into view | ✅ | `#/cari?cat=inai`: chip at x 362–414 inside the 16–414 row (scrollLeft 600). |
| 8 | Planner → search prefill | ✅ | Cari MC → `#/cari?cat=mc&free=1&pax=500&from=majlis`, chip "Ikut majlis anda: 14 Feb 2027 · 500 tetamu · Shah Alam". × shows 1 → 2 vendors. Note: once a shortlist exists, the row shows "Lihat" and the Cari path is gone. |
| 9 | Notifications page + Home bell + urgent card | ✅ | Bell "Notifikasi, 2 segera". Amber Home card "Deposit Teratak Pelamin perlu dibayar dalam 2 hari". `#/notifikasi` lists Segera, Lewat and RSVP items, and each item links through. |
| 10 | Booking request confirms event/place/pax + spinner | ✅ | Sheet shows "Majlis Aina & Hakim · Shah Alam, Selangor · Bilangan tetamu 500 ±". On submit the button is disabled and reads "Menghantar…" with a spinner, then the success sheet appears. |
| 11 | Cancel < 7 days warning | ✅ | Booking dated 15 Nov 2026: "Majlis tinggal 4 hari…", plus deposit RM 600 and "Jika batal hari ini: RM 0 dipulangkan". |
| 12 | Deposit ≤ 3 days red (B-1057) | ✅ | Red card "Segera: 2 hari lagi", text-bahaya countdown (v1-b1057.png). |
| 13 | Overdue instalment (B-1042) | ✅ | "Bayaran kedua · Lewat 3 hari · RM 1,920 · Bayar sekarang RM 1,920". Tabung shows the banner "1 ansuran sudah lewat". |
| 14 | Reminder schedule | ✅ | 14/7/3/1 days, with "Dihantar" or "Akan datang" set from TODAY. reminders.ts self-check passes. |
| 15 | Vendor "Baru" pill | 🟡 | Shows on Dara Assist (19 reviews), but uses the **emas** tone, which the brand reserves for celebration, never status (see B2). |
| 16 | Suspended `#/vendor/32` | ✅ | "Vendor ini tidak tersedia buat masa ini…" + "Cari vendor serupa". Kembali works. |
| 17 | "1 slot lagi" | ✅ | "Tarikh majlis anda (14 Feb 2027): masih kosong, tinggal 1 slot" + legend entry. |
| 18 | "Ditahan untuk anda" legend | ✅ | Legend: Kosong / Ditempah / Ditahan untuk anda / Ditahan (orang lain) / 1 slot lagi. |
| 19 | Minta sebut harga → chat draft | ✅ | `#/mesej/21?draft=…`. The input holds "Salam, boleh beri sebut harga untuk 14 Feb 2027, 500 tetamu?" and sends. |
| 20 | WhatsApp share | 🟡 | Sheet opens `wa.me/?text=Kak Long Emcee di Majlis Hub, disahkan dan dari RM 1,500. <link>`. No og:meta in `index.html`, so no preview card (spec "with preview"). |
| 21 | Lihat semua ulasan | 🟡 | "Lihat semua 53 ulasan" expands to 3 reviews only, then "Tunjuk kurang". |
| 22 | Laporkan ulasan | ✅ | 4 reasons, submit stays disabled until one is picked, toast "Laporan dihantar…". |
| 23 | Review count/average include user review | 🟡 | B-0988 2★ → profile 4.9 · 54 ulasan ✅. Search card still says **5.0 · 53 ulasan** ❌. |
| 24 | Chat photo send | ✅ | "Hantar gambar" sheet → photo bubble (naturalWidth 896) with tick. |
| 25 | Real phone from login | ✅ | Logged in as 1398765432 → Akaun "+60 13-987 65432". Formatting is off (should be 13-9876 5432). A new number inherits the previous user's majlis (demo limitation). |
| 26 | Ubah profil | ✅ | Invalid email blocked: "Emel tidak sah (cth. nama@contoh.my)". Name and email saved and survive a reload. |
| 27 | Notif toggles persist | ✅ | WhatsApp off, SMS on; both survive a reload. |
| 28 | Video disukai | ✅ | Like a reel → "Video disukai · 1" → tap → `#/inspirasi?v=1`. |
| 29 | Planner day 2 | ✅ | "Akad Ahd, 14 Feb 2027 · Sanding Isn, 15 Feb 2027". The confirm sheet lists "Hari kedua Tiada → 15 Feb 2027". |
| 30 | Active count = booking list | ✅ | Planner "4 aktif" = list (Perlu tindakan 1 + Aktif 3); later 5 = 1 + 4. |
| 31 | Wizard "semua penuh pada tarikh" | ✅ | 13 Feb 2027: "Semua … penuh pada 13 Feb 2027. Bukan soal bajet…" + "Tukar tarikh". |
| 32 | RSVP Belum jawab + Dijemput | ✅ | 120 invited − 4 answered = 116; 50 → 46; persists. Edge: invited 2 (fewer than 4 answered) is accepted silently and shows Belum jawab 0. |
| 33 | Comment like | 🟡 | Like works (22 → 23), but it is component state keyed by index and resets on reload. |
| 34 | Comment report | ✅ | 4-reason sheet → submit. |
| 35 | Profanity filter | ✅ | "bodoh betul harga ni" blocked: "Komen ini ada perkataan kesat…". |
| 36 | Comment loading | ✅ | `?cdemo=loading` → 9 skeleton nodes. |
| 37 | Failed send + retry | ✅ | `?net=off` → "gagal dihantar · Cuba lagi" → retry → "baru". |
| 38 | Comment persistence | ✅ | Posted comment survives a reload (`majlishub.comments`). Likes do not (see #33). |

**Polish score: 32 ✅ · 6 🟡 · 0 ❌ of 38.**

## 4. Regression (B)

| Check | Result | Evidence |
| :-- | :-: | :-- |
| Search → filter → compare → vote | ✅ | Decor ×3 → Bandingkan (3) → Kongsi → vote page → Hakim votes Laman Bunga → "1 undian" → compare column shows "Hakim". |
| Book → demo accept → pay deposit | ✅ | B-5603 Kak Long: Diminta → Simulasi terima → RM 300 FPX → receipt R-5603-1. |
| Money matches | ✅ | Planner = Tempahan: Disahkan RM 13,250 · Dibayar RM 2,190 · belum bayar RM 11,060. Tabung: 8 bayaran RM 11,060, −RM 300 sudah dibayar. |
| Wizard → Guna pakej ini | ✅ | Edit flow, confirm sheet, planner rows switch to shortlisted vendors ("Lihat"). |
| Kad → RSVP → list | ✅ | Totals and list correct (seeded RSVPs); invited count persists. |
| Review on B-0988 | ✅ | 2★ + text → "Diulas", "Ubah ulasan", shows first on the profile (but see #23). |
| Guest gate | ✅ | tempahan, tempahan/B-1042, majlis, majlis/baru, tabung, kad, kad/rsvp, mesej, mesej/7, notifikasi all show "Log masuk untuk teruskan". Akaun shows its own guest view. |
| Login resume to booking sheet | ✅ | Guest `#/vendor/24` → "Log masuk untuk tempah" → OTP → `#/vendor/24?book=1` with the sheet open. |
| TopBar Kembali (C2) | ✅ | 14 TopBar routes: `elementFromPoint` = button on every one, and a real click navigates. In-app origins return correctly: chat → vendor/21, B-1057 → notifikasi, vendor → inspirasi, vendor → banding, notifikasi → home, kad/rsvp → kad, wizard step N → N−1. Deep links fall back (vendor → cari, tempahan → majlis). |
| Console errors | ✅ | 0 errors on all 31 routes and states (fresh reload each). |
| Horizontal overflow | ✅ | scrollWidth 430/430 and 0 off-screen elements on all 31. |
| `npx tsc --noEmit -p .` | ✅ | clean |
| `npm run build` | ✅ | 496 kB JS / 46.6 kB CSS, built in 1.29 s |
| `tabung/calc.ts` | ✅ | "calc ok" |
| `booking/money.ts` | ✅ | "money ok" (adds reminder + refund asserts) |
| `search/searchLogic.ts`, `home/reminders.ts` | ✅ | no assert failures; "reminders ok" |

## 5. Static review of `b4ecb6a` (C)

| Rule | Result |
| :-- | :-- |
| Margins / `space-*` / `max-w-` / `min-w-[` / `ml-auto` / `items-baseline` | ✅ none (only `scroll-mt-16`, a scroll offset, not layout) |
| `truncate` / `line-clamp` | ✅ none in changed files |
| `::before` / `::after` / `before:` / `after:` | ✅ none |
| `any` | ✅ none |
| Files > 300 lines | ✅ none (largest: SuggestStep 222, HomeScreen 209, VendorTabs 211) |
| Icon buttons without `aria-label` | ✅ none (new: "Hantar gambar", "Kurangkan/Tambah tetamu", "Buang tapisan majlis", "Suka komen", "Laporkan komen …") |
| Unicode glyph icons | 🟡 `AccountScreen.tsx:106` "Tekan ♥ atau…" (new). `SuggestStep.tsx:200` "→" (older). |
| emas/gold used for status | 🔴 `VendorScreen.tsx:91` `<Pill tone="emas">Baru di Majlis Hub</Pill>`. 🟡 `ReelSheets.tsx:78` comment-like heart `fill-emas` (copies the existing reel like in `ReelSlide.tsx:78`, also gold). |

---

## 6. 🔴 Blockers

**B1. A booking less than 30 days before its date gets an impossible payment schedule (C-4.4 / C-8.1)**
- **Repro:** `#/vendor/8` (Amir Hakimi) → Hantar permintaan → Tarikh majlis `15/11/2026` → submit → Lihat tempahan → Simulasi: vendor terima → Bayar deposit → Bayar RM 600. Then open `#/notifikasi`.
- **Seen:** stored `depositDeadline: 2026-12-11` (26 days *after* the event) and `Baki akhir due: 2026-11-08` (3 days *before* the booking was made). Notifikasi and Tabung at once say **"Baki akhir Amir Hakimi lewat 3 hari"** about a payment that was created today. Before paying, the card said "30 hari lagi untuk bayar deposit" for an event 4 days away.
- **Fix (one place, both callers):** in `src/modules/booking/BookingDetail.tsx:66`, change `const deadline = addDays(TODAY, 30);` to `const deadline = [addDays(TODAY, 30), addDays(b.date, -1)].sort()[0];`. In `src/modules/booking/plan.ts`, change the instalment `due` to `[addDays(eventDate, -i.daysBefore), TODAY].sort().reverse()[0]` (never earlier than today, never after the event). Add one assert to the money.ts self-check: a booking 4 days out has every `due` in `[TODAY, date]`.

**B2. Gold used as a status tag (brand token breach, per `06_code_reviewer_tsx.md`)**
- **Repro:** `#/vendor/24` (Dara Assist). The "Baru di Majlis Hub" pill is `bg-emas-50 text-emas-teks`.
- **Rule:** `BRAND_GUIDELINES.md` line 59: "Gold is for celebration, never for status or actions." "Baru" is not one of the allowed moments.
- **Fix:** `src/modules/vendor/VendorScreen.tsx:91` → `<Pill tone="hijau">` (or `tone="muted"`).

## 7. 🟡 List (open gaps, priority order)

1. **C-5.0 / #23:** the new review is not counted in the search card or compare (5.0 · 53 vs profile 4.9 · 54). Have the card and compare read the same `reviews.ts` stats helper the profile uses.
2. **C-2.0 / #21:** "Lihat semua 53 ulasan" shows 3. Either label it "Lihat semua 3 ulasan di sini" or generate more mock reviews.
3. **C-3.0a:** the swap sheet shows 1 alternative (spec: 3). No "widen radius" when a category has no candidate. The wizard suggests Akustik Rindu for 14 Feb although B-1051 was declined "Penuh pada tarikh ini" (vendor `busy` doesn't include it).
4. **C-2.4 / #20:** no og:title, og:description or og:image in `index.html`, so the WhatsApp link has no preview card.
5. **C-2.1:** "See full menu" collapse for long package lists is not built.
6. **C-7.3 / #33:** comment likes reset on reload (local `useState`, keyed by array index). Persist them alongside `majlishub.comments` with a stable id.
7. **C-7.0:** no end of feed ("Anda dah tengok semua"), no ranking by distance.
8. **C-9.1:** the headcount-over-pax amber warning is only on the RSVP list, not in Majlis Saya. The invited count can be set below the number already answered.
9. **C-3.0 / C-3.1:** place is free text (no pin). Only one event. Planner rows show category art, not the vendor avatar.
10. **C-1.1 / G-1.0:** no GPS-denied fallback, no multi-state service area, "near you" is fixed for guests.
11. **G-2.0:** no email + password, no spinner on "Hantar kod" or "Sahkan", no "already registered" path.
12. **Small:** phone formatted as "+60 13-987 65432". Logging in with another number inherits the last user's majlis. Copy glyph "♥" in Akaun. The BookSheet accepts a date other than the majlis date without saying so. The compare tray from another category stays visible in a new category.

## 8. Polish round 2 (2026-11-12, customer side, fixed by Claude, not yet re-audited)

Items from §7, each clicked through in the browser at 430px. 22 customer routes: 0 console errors, no horizontal scroll.

1. Reviews written in the app are counted everywhere (search card, compare, planner, profile) through `applyOverlay` in mock.ts.
2. The profile shows 6 reviews per vendor. The button says "Lihat N lagi ulasan" and the list ends with "Menunjukkan 6 ulasan terkini daripada 47".
3. Swap sheet: up to 3 alternatives, with "Lebih slot bajet" or "Lebih jauh" labels, plus "Cari lagi". Vendors who declined the date are no longer suggested. Added 16 vendors so each category has 5.
4. og:title, og:description and og:image in `index.html`, so WhatsApp shows a preview card. It is one card for the whole site.
5. Packages: with more than 3, the rest sit behind "Lihat menu penuh (N pakej)".
6. Comment likes are saved in localStorage with a stable key.
7. Inspirasi: nearest to the majlis first, plus an end card "Anda dah tengok semua" with "Tonton semula" and "Cari vendor". The endless loop is removed.
8. Majlis Saya shows an amber warning when guests marked Hadir are more than pax. The invited count can't go below the number already answered.
9. Majlis Saya rows show the vendor's photo once one is chosen. Not done: map pin, more than one majlis.
10. "Guna lokasi semasa" measures from the nearest town. When GPS is denied it falls back to State → District with a message.
11. Login:
    - email and password, with an eye toggle;
    - spinner on Hantar kod, Sahkan and Log masuk;
    - a message when the number is already registered;
    - the vendor role opens #/v;
    - 10-digit phone numbers are formatted correctly.
12. Small fixes:
    - the BookSheet warns when the date is not the majlis date;
    - the compare tray is hidden in a different category;
    - the "→" glyph is now an icon.

Still open: one majlis only, no map pin, no multi-state service area, and every login opens the demo account (stated on the login screen).
