# QA: Consistency re-check after the PM audit fix round (Wave 1)

- **Scope:** PM audit v2 blockers B1–B3, consistency findings and top gaps, fixed in `69c7134` and `31c9838` (HEAD).
- **Method:** playwright-cli session `qa3` at 430×932. All clicks were real role-based clicks (no `force`). Started and ended with `localStorage.clear()`. Read-only: no source edits, no commits.
- **Date:** 11 Nov 2026 (app TODAY).
- **Screenshots:** `scratchpad/qa3-*.png` (15 files).

**Verdict:** B1, B2 and B3 are fixed. Money now agrees across Planner, Tempahan and Tabung. One new 🔴: changing only the event date in the wizard counts as "replacing" the event, which silently wipes the custom checklist and renames the event. One check failed: the Compare "Kandungan pakej" row looks the same for every vendor.

## Results

| # | Item | Result | Evidence (numbers recorded) |
| :-: | :-- | :-: | :-- |
| 1 | **B1** guest gate | ✅ | Logged out via `#/akaun` → Log keluar. All 9 routes showed "Log masuk untuk teruskan" with no phone numbers: `tempahan`, `tempahan/B-1042`, `tabung`, `kad`, `kad/rsvp`, `mesej`, `mesej/7`, `majlis`, `majlis/baru`. `#/jemputan` stayed public. From the `tempahan/B-1042` gate: Log masuk → `#/masuk?next=%2Ftempahan%2FB-1042` → OTP 123456 → returned to `#/tempahan/B-1042`. Kembali then went to `#/tempahan`, not OTP. |
| 2 | **B2** own date never shown as taken | ✅ (legend 🟡) | 14 Feb banner per vendor: **7** "tempahan anda, tarikh sudah dikunci"; **10** "ditahan untuk anda, bayar deposit untuk kunci" (cell aria "ditahan untuk anda"); **11** "permintaan anda sedang menunggu jawapan vendor"; **23** (expired) "masih kosong"; **26** (lapsed) "masih kosong" and B-1038 offers "Tempah semula"; **29** "masih kosong". In Compare, the "Kosong 14 Feb?" row shows "Tempahan anda" for Lensa Kasih and "Kosong" for 12 and 13. The legend has "Tempahan anda" but only a generic "Ditahan (deposit belum dibayar)". "Ditahan untuk anda" appears in the banner and the cell label, not in the legend (🟡 Y3). `qa3-b2-vendor10-cal.png` |
| 3 | **B3** phone reveal | ✅ | `#/mesej/26` (lapsed): no phone, lock banner only (`qa3-b3-mesej26.png`). `#/mesej/7` (confirmed): "Telefon: 012-334 8810". `#/mesej/10`: 017-662 4401. `#/mesej/11` and `#/mesej/12`: no phone. The 012-345 6789 placeholder appeared nowhere. |
| 4a | Money agrees (seed) | ✅ | Planner and Tempahan both show: Disahkan **RM 11,750** · Dibayar **RM 1,890** · belum bayar **RM 9,860** · Menunggu **RM 1,800**. Tabung: "5 bayaran belum dibayar (**RM 9,860**)", Jumlah disimpan RM 2,300, Baki tabung RM 2,300, RM 2,520/bulan, Kurang RM 781. Sum check: 4,800 + 6,500 + 450 = 11,750; paid 1,440 + 450 = 1,890. |
| 4b | Pay deposit on B-1057 (RM 1,950, FPX) | ✅ | Planner and Tempahan: Disahkan 11,750 · Dibayar **3,840** · belum bayar **7,910**. Tabung: "4 bayaran (**RM 7,910**)", Baki tabung **RM 350** ("−RM 1,950 sudah dibayar"), still RM 2,520/bulan, **Kurang still RM 781** (no jump). |
| 4c | 2nd photographer warning | ✅ | `#/vendor/12` → Hantar permintaan shows "Anda sudah ada Lensa Kasih Studio untuk Foto & Video pada tarikh ini." Submit is disabled until "Saya faham, teruskan juga" is ticked; ticked = enabled, unticked = disabled again. `qa3-dup-photo.png` |
| 5 | Compare 7 / 12 / 13 | ❌ (kandungan) | Deposit RM 1,440 (30%) / RM 780 (20%) / RM 1,400 (50%). Ansuran 3 / 4 / 2 kali. Polisi refund RM 720 / 390 / 700. These rows differ ✅. **Kandungan pakej is the same for all three** ("Akad + Sanding, 10 jam, 800 foto, Video highlight"), yet Bingkai and Cahaya are highlighted green as "best" (🟡 Y1). Portfolio viewer opens ("Bingkai Abadi Films · 1/4", prev/next) and closes ✅. "Tunggu undian" shows on every column ✅. Pills are not clipped (each pill sw = cw) ✅. main scrollWidth 430 = clientWidth 430 ✅. `qa3-compare-top.png`, `qa3-compare-viewer.png` |
| 6a | Wizard prefill + change summary | ✅ | The wizard opens as "Kemas kini majlis" with every step filled (Perkahwinan, 2027-02-14, Shah Alam, 500, RM 40,000). Pax 500 → 520 → Guna pakej ini → "Kemas kini majlis? Tetamu 500 → 520" → Ya, simpan. Home "Ahd, 14 Feb 2027 · 520 pax", Planner "520 tetamu", Kad 14 Feb: all match. |
| 6b | Date change + kad banner | ✅ / 🔴 | Date 14 → 28 Feb. Confirm: "Ganti majlis sedia ada? Tarikh 14 Feb 2027 → 28 Feb 2027". Home and Planner both show 28 Feb, 109 HARI. Kad shows the banner "Tarikh kad berbeza dengan majlis anda", and "Kemaskini ikut majlis" sets the kad to 28 Feb and removes the banner ✅. **But the event was renamed "Majlis perkahwinan" and the custom items "Bunga telur" and "Door gift" were deleted**, and the confirm did not mention either (🔴 N1). `qa3-kad-banner.png`, `qa3-kad-fixed.png` |
| 6c | Filter km slider + 4 ke atas | ✅ | Kompang: 70 km = 3 vendors. Home key → "10 km / Tunjuk 1 vendor". 4× → → "30 km / 3". End → "150 km / 3". "4 ke atas" → 2 vendors, URL `km=150&r4=1`, Paluan Seri Selangor (3.8) hidden. `qa3-filter-km.png` |
| 7a | Login resumes booking sheet | ✅ | Guest: `#/cari?cat=inai` → Inai by Mira → "Log masuk untuk tempah" → `masuk?next=/vendor/29?book=1` → OTP → `#/vendor/29?book=1` with the "Hantar permintaan tempahan" sheet open. Tutup → `#/vendor/29`. Kembali → `#/cari?cat=inai`, never OTP. `qa3-resume-sheet.png` |
| 7b | Login applies pending like | ✅ | Guest on `#/inspirasi?v=2` (Solekan akad at top 0) → Suka → `masuk?next=/inspirasi?v=2&like=2` → OTP → `#/inspirasi?v=2`, same reel `aria-pressed=true`. Browser back → `#/`, not OTP. `qa3-insp-liked.png` |
| 8 | Inspirasi deep links | ✅ | `?v=2` opens reel 2 at the top. `?demo=error` shows "Video tidak dapat dimuatkan · Cuba lagi". `qa3-insp-v2.png`, `qa3-insp-error.png` |
| 9a | search → filter → compare → vote | ✅ | Sorting by Rating tertinggi sets `sort=top`. Compare 7 + 12 → Kongsi → `banding/kongsi?ids=7,12`. Name "Mak" → Undi Bingkai → "1 undian · Diundi". Compare then shows "Mak" on that column. |
| 9b | book → demo accept → pay | ✅ | Kak Long Emcee (v21) Majlis 4 jam RM 1,500 → B-7301 Diminta → "Simulasi: vendor terima" → "Bayar deposit RM 300 … ditahan untuk anda sehingga 11 Dis 2026" → pay → Disahkan. Chat phone 016-977 6691. Planner 13,250 / 2,190 / 11,060. Tabung 11,060 owed, Baki tabung 2,000. All consistent. |
| 9c | wizard → Guna pakej ini | ✅ | See 6a. |
| 9d | kad → RSVP → list | ✅ | Pak Cik Halim, Hadir, 3 people. List: Hadir 23 orang, 5 jawapan. Kad "RSVP (5)". Planner "23 hadir". |
| 9e | Review on B-0988 | ✅ | 5★ + text → "Diulas", "Ubah ulasan". Vendor 29 Ulasan tab shows the review. |
| 9f | Custom checklist | ✅ (then lost, N1) | "Bunga telur · 500 biji" and the suggested "Door gift" were added. Both were wiped by the date change (N1). |
| 9g | Every TopBar Kembali (retro C2) | ✅ | 31 route variants swept. Every TopBar Kembali was clicked for real, the URL changed and `elementFromPoint` hit the button (banding, vendor/7/10/12, tempahan + 4 details, majlis/baru, tabung, kad, kad/rsvp, mesej/7/26/12, masuk, akaun). |
| 9h | Console / overflow, all routes | ✅ (1 known) | 0 errors, 0 warnings, 0 pageerrors across the sweep and all flows. Document overflow is 0 everywhere. **`#/?demo=loading` main overflows by 6 px** (known PM gap #11, still open, 🟡 Y6). |
| 10 | Static checks | ✅ | `npx tsc --noEmit -p .` clean. `npm run build` OK (JS 463.6 kB / gzip 129.7 kB). `npx tsx src/modules/tabung/calc.ts` → "calc ok". `npx tsx src/modules/booking/money.ts` → "money ok". |

## 🔴 New blocker

**N1. Moving the wedding date silently wipes the custom checklist and renames the event.**
- **Repro:** `#/majlis` → add "Bunga telur" and tap "Door gift" under Item sendiri → `#/majlis/baru` → Seterusnya → date 2027-02-28 → Seterusnya ×2 → Guna pakej ini. The dialog reads "Ganti majlis sedia ada? Tarikh 14 Feb → 28 Feb" → Ya, ganti.
- **Result:** Planner title "Majlis Aina & Hakim" becomes "Majlis perkahwinan", and the custom items are gone. The confirm listed only the date.
- **Cause:** `SuggestStep.tsx` sets `replaces = !!e && (e.type !== d.type || e.date !== d.date)`. When `replaces` is true, `finish()` resets the name and sets `custom: []`.
- **Exact fix (one line):** a date move edits the event, it doesn't replace it. In `src/modules/planner/SuggestStep.tsx` change it to `const replaces = !!e && e.type !== d.type;`. If replacing on a type change should still wipe data, add `['Item sendiri', \`${e.custom?.length ?? 0} item\`, 'Dipadam']` to `changes` when `replaces`, so the confirm says so.

## 🟡 Warnings

1. **Y1. Compare "Kandungan pakej" looks identical but is scored as different.** `compareRows.tsx` shows `includes.slice(0, 3)`, while the vendor-specific extra ("Konsultasi percuma…" / "Diskaun 5%…") is appended last by `mock.ts:122`. Bingkai and Cahaya get the green "best" highlight for content you can't see. Fix: put the extra first in `mock.ts:122` (`['Konsultasi percuma sebelum majlis', ...inc]`), or show `slice(0, 4)` and raise the row to `h-[156px]`.
2. **Y2. Planner "Tempahan 4 aktif" vs Tempahan list "Perlu tindakan 1 + Aktif 2 = 3".** Planner counts the completed Inai booking. Fix: in `PlannerScreen.tsx:68`, count `OPEN.includes(liveStatus(b))` instead of `!DEAD.includes(...)`.
3. **Y3. The calendar legend doesn't show "Ditahan untuk anda".** It only shows "Ditahan (deposit belum dibayar)", and that style is shared with other customers' 20 Feb holds. Add a legend entry or rename it to "Ditahan (anda / orang lain)".
4. **Y4. Only one vendor (8, MC) is now busy on 14 Feb.** Excluding `SEEDED_BOOKED` removed 6 of 7 "taken" vendors, so "Penuh" in Compare and "sudah ditempah" can only be demoed on vendor 8. Add 14 Feb busy to 2–3 unbooked vendors, e.g. 9, 14 (photo) and 20.
5. **Y5. Wizard step 4 blames the budget when the date is the cause.** 13 Feb, 21 Feb and 6 Mac 2027 are busy for every vendor (`mock.ts:57`). Picking 21 Feb shows "Bajet ini cukup untuk 0 kategori … naikkan bajet" at RM 40,000. When the cause is `busy.includes(d.date)`, say "Semua vendor penuh pada tarikh ini, cuba tarikh lain".
6. **Y6. `#/?demo=loading` main scrollWidth is 6 px wider than clientWidth.** Known PM gap #11, still open.
7. **Y7. "Kemaskini ikut majlis" syncs the date but keeps the venue "Dewan Seri Kenanga, Seksyen 7, Shah Alam".** The event place is "Shah Alam, Selangor". This is probably intended, since the kad venue is more specific. Check that the banner only promises the date.
8. **Y8. Compare "Harga dari RM 2,650" (cheapest package) sits next to Deposit/Ansuran for the mid package (RM 4,800).** The label says "pakej ini" and the package name is shown, so this is readable, but a parent may misread it. Consider "Deposit (Akad + Sanding)".

## Cleanup

`localStorage.clear()` was run at the end, and session `qa3` is closed. No source files changed. The only file created is this doc. (`npm run build` refreshed the git-ignored `dist/`.)
