# PM Audit v2: Wave 1 customer app vs MODULE_FEATURE_SPEC v2.0

- **Question from the user:** "Does it cover our module and feature, for the user?"
- **Reviewer:** PM agent (Manager + Requirement Analyst), read-only. No source edits, no commits.
- **Date:** 2026-11-11 · **Code:** HEAD `c6bd312` (includes `0170f11`, `6fd3616`, `4ab7c3b`)
- **Scope:** Tab 1 Guest (G-1.0, G-2.0, G-3.0), Tab 2 Customer (every C- row), §4 Settings (customer level), §5 RBAC (Guest vs Customer), §6 fields the customer sees, §7 Gherkin, §9 Open Decisions 1–12, and the 10 stakeholder points in the spec header.
- **Known cuts (not counted against the build):** BM only (G-3.0 EN deferred), map view (OD1 = B), no backend, simulated payments.
- **Method:** read the spec, `docs/PM_REVIEW_WAVE1.md`, `src/App.tsx`, `router.tsx`, `store.tsx`, `data/mock.ts`, `components/ui.tsx` and all 40 files in `src/modules/*`. Then drove the app at `http://localhost:5173` (430×932) with Playwright session `pm2`, starting from `localStorage.clear()`. Every verdict below was judged fresh against HEAD; the old review was used only as a list of things to re-check. Real clicks only (no forced state), plus the documented `?demo=loading`, `?demo=error`, `?fail=1`, `?closed=1`, `?net=off` params. Ran as Customer and as Guest (logged out via `#/akaun`). 31 screenshots: `scratchpad/pm2-*.png`. `localStorage` cleared at the end. No console errors on 15 swept routes.

**Legend:** ✅ built as specified · 🟡 built with a named gap · 🔴 missing, or wrong in a way that misleads · ❌ state not built · – state not defined in the spec · *code* = verified by reading the code; the seed data cannot reach it with real clicks.

---

## Verdict

```
Overall coverage (✅=1, 🟡=½)   ████████████▌░░░░░░░  22 / 35 rows   = 63%
Main path (Ideal) works          ████████████████████  35 / 35 rows   = 100%
States score (spec states)       ██████████████▌░░░░░  82 / 113       = 73%
Stakeholder points               ████████████████░░░░   8 / 10 fully, 10 / 10 present
Gherkin (6 in scope)             4 ✅ · 2 🟡 · 0 🔴
```

**Yes, every customer feature in the spec now exists and its main path works.** That is a big step from the first review (3 rows were missing; C-5.0 review, C-6.0 account, C-3.3 custom checklist are now built and work). Rows: **9 ✅ · 26 🟡 · 0 🔴**, plus 2 deferred (G-3.0, C-1.3).

**It is not yet safe to demo without a script.** Three things would mislead stakeholders (section "Blockers"):
1. **A logged-out guest can open the customer's private screens:** bookings, Tabung, kad editor, the RSVP list with guests' phone numbers, chat threads and vendor phone numbers.
2. **The customer's own held/confirmed date shows as "sudah ditempah" (booked by someone else)** on the vendor profile and as "Penuh" in Compare. This contradicts the stakeholder #8 story ("lock your date") and makes Gherkin 4 ("Tempah semula") impossible to show.
3. **Chat reveals a phone number for a lapsed booking**, and the number is a placeholder (`012-345 6789`).

The 🟡 rows are mostly missing secondary filters, missing Loading/Error states, and numbers that don't reconcile across screens.

**States score method:** a row is scored only on the states the spec defines for it, plus Ideal (main path) for every row. Score = sum ÷ 113 defined states. On a flat 35 × 5 = 175 base, the same work scores 82 / 175 = 47%. That figure under-counts, because the spec defines no Loading or Error state for most rows.

---

## Stakeholder 10-point check (spec header v2.0)

| # | Point | Covered? | Where (route) | Gap |
| :-: | :-- | :-: | :-- | :-- |
| 1 | Talent first: 8 categories, Catering/Venue paused | ✅ | `#/` tiles, `#/cari` chips · `data/mock.ts:3-12` | None. Exactly the 8 talent categories; no catering or venue anywhere. |
| 2 | Cari is a real search, not a jump into one category | ✅ | `#/cari` opens on **Semua** (24 vendors) · `SearchScreen.tsx:92-95` | Active chip is not scrolled into view (`#/cari?cat=mc`: the MC chip sits at x 609 on a 430 screen). |
| 3 | Budget slider | ✅ | `#/cari` → Tapis · `FilterSheet.tsx:9-37` | Two handles, histogram, RM 100 snap, live "Tunjuk N vendor". The sheet's "4 ke atas" and "Disahkan sahaja" toggles change nothing (see C-1.2). |
| 4 | Richer compare + share/vote, verdict chips, portfolio | 🟡 | `#/banding?ids=7,12,13`, `#/banding/kongsi?ids=7,12,13` | Works, and votes show on columns ("Hakim ✓"). But 4 of 11 rows are **identical for every vendor** (package inclusions, deposit 30%, 3 payments, hard-coded cancel policy, `compareRows.tsx:32-35`). The portfolio strip can't be tapped to full screen. Verdict chips are clipped at the column edge. No "Tunggu undian". The customer's own photographer shows "Penuh". |
| 5 | Suggested package you can customise | ✅ | `#/majlis/baru` → step 4 · `SuggestStep.tsx` | Swap / remove / add / split all work, total updates live. The swap sheet often has only 1 alternative (mock has 3 vendors per category). No "widen radius" when a category has no candidate. |
| 6 | Kad kahwin + RSVP | ✅ | `#/kad`, `#/jemputan`, `#/kad/rsvp` | Gherkin passes (Hadir 20 → 23). The kad does not follow the event when the event changes. There is no "Belum jawab" count. The RSVP list is open to guests (privacy). |
| 7 | Bride Assistant category | ✅ | `#/cari?cat=bride`; "pengapit" autocompletes | Packages list tasks (dress, touch-up, schedule, salam). |
| 8 | 30-day deposit with held date | 🟡 | `#/tempahan/B-1057` | The countdown, "ditahan untuk anda sehingga 21 Nov", FPX/card/e-wallet, `?fail=1` retry, receipt and Confirmed all work. **But the vendor profile of the same booking says "Tarikh majlis anda: sudah ditempah"** (blocker B2). ≤3-day red and the 14/7/3/1 reminders cannot be demoed. |
| 9 | Tabung tracker (no wallet) | ✅ | `#/tabung` | "Simpan RM 2,520/bulan" matches the Planner tile, updates live after a payment, "Duit kekal dalam akaun bank anda". "Sudah simpan" does not drop when a payment is made. |
| 10 | Keep short video (Inspirasi) | ✅ | `#/inspirasi` | Snap feed, autoplay, double-tap like, comments, share, report, "Lihat pakej" CTA. Only 3 videos. `?v=` from Home is ignored. The share link opens the feed, not the video. |

**Result: 10 / 10 present, 8 / 10 fully covered (#4 and #8 partial).**

---

## Full coverage table

States: **I** Ideal · **E** Empty · **L** Loading · **Er** Error · **Ed** Edge.

### Tab 1: Guest

| Row | Feature | Status | I | E | L | Er | Ed | Evidence (route · file:line) | Gap |
| :-- | :-- | :-: | :-: | :-: | :-: | :-: | :-: | :-- | :-- |
| G-1.0 | Browse without login | 🟡 | 🟡 | ❌ | ✅ | ✅ | ✅ | `#/` logged out: "Log masuk" in hero, guest card · `HomeScreen.tsx:55-73`; `#/?demo=loading` skeleton, `#/?demo=error` "Cuba lagi" `:103-127`; `loading="lazy"` `ui.tsx:79` | Featured row = "≤30 km of Shah Alam" (fixed), not detected location. No "location denied → pick state" (Empty). **Private screens open to guests (blocker B1).** `#/?demo=loading` scrolls 6 px sideways. |
| G-2.0 | Register / Login | 🟡 | ✅ | ✅ | ❌ | ✅ | ❌ | `#/masuk` · `LoginScreen.tsx`: +60 check (`9` → "Nombor tidak sah"), role choice, 6-digit OTP with paste, `000000` → "Kod salah", 60 s resend | No email + password + eye toggle. No button spinner. No "number already registered → login". After "Log masuk untuk tempah", you return to the vendor but **the booking sheet does not open** (`?book=1` in the URL, 0 dialogs; `VendorScreen.tsx:17` reads it only on mount). |
| G-3.0 | BM / EN toggle | Deferred | – | – | – | – | – | `#/akaun` shows "BM · EN akan datang" | Deliberate cut. |

### Tab 2: Customer

| Row | Feature | Status | I | E | L | Er | Ed | Evidence (route · file:line) | Gap |
| :-- | :-- | :-: | :-: | :-: | :-: | :-: | :-: | :-- | :-- |
| C-1.0 | Search vendors | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `#/cari?focus=1`: recent + popular; "pengapit" → Bride Assistant + Pengapit Setia; "photographer" → Foto & Video; "xyzz" → "Tiada padanan"; `?demo=error` retry · `SearchScreen.tsx:80-152`, `searchLogic.ts:52-81` | Error is a full-page state, not a toast (fine). Active chip not scrolled into view. |
| C-1.1 | Location filter | 🟡 | ✅ | ✅ | ✅ | ❌ | ❌ | `#/cari?cat=inai&km=10` → "Tiada vendor dalam 10 km" → "Luaskan ke 30 km" → 2 vendors · `FilterSheet.tsx:54-70` | Radius is 4 chips, not a 10–150 km slider. "Ikut negeri" has no District. No GPS-denied fallback. Service area = vendor base distance only. Distances are always from Shah Alam, even after the event moves (see Consistency). |
| C-1.2 | Filters & sort | 🟡 | 🟡 | 🟡 | – | – | ❌ | Sheet live count "Tunjuk 24 → 10 → 6 vendor", removable pills, 3 sorts · `FilterSheet.tsx:81-84`, `searchLogic.ts:59-69` | **No date-available, pax or halal filters.** "4 ke atas" and "Disahkan sahaja" change nothing (24 → 24; every vendor is ≥4.6★ and verified, `searchLogic.ts:66`). With `all=1` the header still says "· disahkan" and no pill appears. Empty state does not name the strictest filter. |
| C-1.3 | Map view | Deferred | – | – | – | – | – | — | OD1 = B. Correctly absent. |
| C-1.4 | Compare vendors | 🟡 | 🟡 | ✅ | – | – | ✅ | Ticked 3 photographers → `#/banding`; MC tick → toast "Hanya boleh banding vendor kategori yang sama"; `#/banding?ids=7` → "Tambah 1 lagi untuk banding" · `compareRows.tsx`, `CompareScreen.tsx` | Package inclusions, deposit, instalments and policy rows are identical across vendors (mock), so the "richer compare" shows no difference. Policy is hard-coded (`compareRows.tsx:35`). Portfolio not tappable. Verdict chips clipped. Lensa Kasih (the customer's own confirmed photographer) shows "Penuh". |
| C-1.5 | Share & vote | 🟡 | ✅ | ❌ | – | – | ✅ | `#/banding/kongsi?ids=7,12,13`, no login; name required; voted Bingkai then "Tukar undian" → Lensa Kasih: last vote wins; column shows "Hakim ✓" · `CompareShare.tsx:22-27` | No "Tunggu undian" on the compare screen. Votes live in the same browser's storage (prototype limit; a partner on another phone sees nothing). |
| C-2.0 | View vendor | 🟡 | ✅ | ❌ | ✅ | 🟡 | ❌ | `#/vendor/12`: gallery, "Disahkan" → "Apa yang kami semak" sheet, 4.8, distance, "Biasanya balas dalam 2 jam", 4 tabs; `?demo=loading` skeleton; `?demo=error` retry · `VendorScreen.tsx:20-29,133-146` | No "New on Majlis Hub" tag. Suspended → generic "Vendor tidak dijumpai", not a "Not available" page. "143 ulasan sebenar" but 3 shown, with no "see all". Service area only in Tentang. |
| C-2.1 | Packages | 🟡 | ✅ | ❌ | – | – | ❌ | RM price, inclusions, deposit % + plan per package · `VendorTabs.tsx:10-43` | No "Ask for quote" for a vendor with no packages. Category fields are free-text bullets, not structured. No "See full menu" collapse. |
| C-2.2 | Availability | 🟡 | ✅ | – | – | – | ❌ | Feb calendar, legend (Kosong / Ditempah bergaris / Ditahan / Tarikh anda); `#/vendor/12` 20 Feb "ditahan, menunggu deposit" · `VendorTabs.tsx:46-88` | No "1 slot left". **The customer's own deposit-due vendor (`#/vendor/10`) shows 14 Feb as "sudah ditempah", not "ditahan untuk anda"** (B2). |
| C-2.3 | Reviews | ✅ | ✅ | ✅ *code* | – | – | 🟡 | "Tempahan melalui Majlis Hub" tag, vendor reply, 5→1 bars, user review with photo + "Baru" · `VendorTabs.tsx:90-144` | Bingkai Abadi is 4.8★ but its 3 visible reviews are 4★, 4★, 3★. The count stays 53 after you post. Hidden-review edge needs Admin data (Wave 2). |
| C-2.4 | Save / Share | 🟡 | 🟡 | – | – | – | ✅ | Heart on card + profile; shortlist in `#/akaun` "Disimpan · 2"; guest heart → login → back to `#/cari?cat=makeup`, saved `[21,16]` · `VendorCard.tsx:9-29` | Share only copies the URL + toast ("Kongsi di WhatsApp"); no WhatsApp link with preview. |
| C-3.0 | Create event | 🟡 | ✅ | – | – | ✅ | 🟡 | `#/majlis/baru`: 5 types, Seterusnya disabled until answered, 1 Nov 2026 → "Tarikh ini sudah lepas", "Majlis 2 hari" fills 15 Feb · `WizardScreen.tsx` | **Day 2 is not saved** (`SuggestStep.tsx:58-63` has no `day2`). Location is free text, no pin. One event only; a new one replaces it. The wizard starts from defaults (pax 300, RM 25,000), so "Majlis baru" with the same type + date silently overwrites pax 500 → 300 and budget. |
| C-3.0a | Suggested package | 🟡 | ✅ | ✅ | ✅ | – | 🟡 | RM 40,000 → 8 vendors, "Jumlah RM 27,000, Baki RM 13,000"; Tukar → RM 25,250; RM 3,000 → "Bajet ini cukup untuk 4 kategori" + keep button; `?demo=loading` skeleton · `SuggestStep.tsx:16-33` | No "widen radius" (fixed 70 km, `:21`). Swap sheet showed 1 alternative (spec: 3). |
| C-3.1 | Planner dashboard | 🟡 | 🟡 | ✅ *code* | – | – | ✅ *code* | `#/majlis`: 95 HARI LAGI, Shah Alam, 500 tetamu, checklist with status chips, shortcuts Kad 20 hadir / Tabung RM 2,520/bln / Tempahan · `PlannerScreen.tsx:35-123` | **Budget bar "Ditempah RM 13,550" adds requested, unpaid deposit-due and a pre-wedding inai**; spec says confirmed spend (= RM 5,250). Vendor shows as a name, not an avatar. Inai row shows amber "Tarikh tempahan lain: 31 Okt 2026". |
| C-3.2 | Find vendor from planner | 🟡 | 🟡 | – | – | – | ❌ | "Cari MC" → `#/cari?cat=mc&km=70` | Not pre-filled with event date or pax. Radius is not taken from the event location. |
| C-3.3 | Custom checklist | ✅ | ✅ | ✅ | – | – | – | Added "Door gift" chip + "Bunga telur / 500 biji"; empty name → "Tulis nama item dahulu."; ideas change for Kenduri · `CustomChecklist.tsx` | "Link to a vendor later" not built (minor). New in this wave. |
| C-4.0 | Send booking request | 🟡 | ✅ | – | ❌ | ✅ | ✅ | `#/vendor/12` → sheet → 13 Feb → "sudah ditempah… Tarikh terdekat: 12, 14, 15 Feb" → 14 Feb → "biasanya balas dalam 2 jam"; again → "Anda sudah hantar permintaan" · `BookSheet.tsx` | No event / location / pax confirmation. No submit spinner. **No warning when the category is already confirmed**: a second photographer was requested while Lensa Kasih is confirmed, and the Planner spend jumped to RM 15,700. |
| C-4.1 | Track bookings | ✅ | ✅ | ✅ *code* | – | – | ✅ | `#/tempahan`: Perlu tindakan / Aktif / Lepas; all 7 seeded statuses; `#/tempahan/B-1049` "Tamat tempoh" + "Cuba vendor serupa" (2 vendors) · `BookingList.tsx:9-12`, `BookingDetail.tsx:18-36` | Grouped by action, not by event (only one event exists, so this is moot). |
| C-4.2 | Cancel request | 🟡 | ✅ | – | – | – | 🟡 | `#/tempahan/B-1042` → Batalkan: "Deposit sudah dibayar" + vendor policy, reason required · `BookingSheets.tsx:80-112` | No warning when cancelling < 7 days before the event. |
| C-4.3 | Chat with vendor | 🟡 | 🟡 | ✅ | ✅ | ✅ | – | `#/mesej/12?net=off` → "Gagal dihantar. Ketik untuk cuba lagi" → retry sent; empty "Mulakan perbualan"; phone hidden for Requested, shown after "Simulasi: vendor terima" (`019-220 7314`) · `ChatScreen.tsx` | No photo send. Thread per vendor, not per booking. **Lapsed booking reveals a placeholder phone** (B3). |
| C-4.4 | Booking deposit | 🟡 | ✅ | 🟡 | ✅ | ✅ | 🟡 | `#/tempahan/B-1057?fail=1` → "Memproses…" → "Pembayaran gagal… Kiraan hari masih berjalan"; then e-Dompet → receipt R-1057-1 → "Disahkan · tarikh dikunci", schedule 2/3 · `BookingDetail.tsx:81-96`, `BookingSheets.tsx:15-76` | No "no bookings due" empty message (the group just hides). ≤3 days red is coded but no seed reaches it. Lapsed works (`B-1038`), but "Tempah semula" never shows because the seed marks the date taken. No 14/7/3/1 reminders. |
| C-5.0 | Leave review | 🟡 | ✅ | – | – | ✅ | ❌ | `#/tempahan/B-0988` (Completed) → Tulis ulasan → empty → "Pilih bilangan bintang"; 13 chars → "(13/20)"; 5★ + photo → "Diulas", shown on `#/vendor/29?tab=ulasan` with tag. Confirmed B-1042 and its vendor have no review action · `ReviewSheet.tsx`, `BookingDetail.tsx:106-124` | No "report: not completed" dispute link. Count not updated. Photos are picked from the vendor's own gallery (demo stand-in). New in this wave. |
| C-6.0 | Profile & notifications | 🟡 | 🟡 | – | – | – | – | `#/akaun`: name, phone, Tempahan saya, Disimpan list, Bahasa BM, 4 notification switches, Tetapan semula demo, Log keluar · `AccountScreen.tsx` | Phone is hard-coded "+60 12-345 6789". No email, no avatar, no edit. Switches are not saved (local `useState`). No "Video disukai" list. New in this wave. |
| C-7.0 | Video feed | 🟡 | ✅ | ✅ | ✅ | ❌ | ❌ | `#/inspirasi`: snap, autoplay muted, tap pause, progress bar, category chips; MC → "Belum ada video untuk kategori ini"; `?demo=loading` dark skeleton · `InspirasiScreen.tsx` | No offline/Error state. The feed loops forever (spec: "Anda dah tengok semua" + browse vendors). Home tile `#/inspirasi?v=3` opens reel 1, not reel 3. No distance/freshness ranking. Only 3 videos. |
| C-7.1 | Video details | ✅ | ✅ | – | – | – | ✅ | Vendor + badge, bold title, pin · Puchong · 19 km · category, 2-line desc + "lagi", hashtags, scrim · `ReelSlide.tsx:85-96` | — |
| C-7.2 | Like | 🟡 | 🟡 | – | – | – | 🟡 | Heart + count, double-tap burst; guest → `#/masuk?next=/inspirasi` · `ReelSlide.tsx:42-53,78` | No "Video disukai" in Account. The like is not applied after login. |
| C-7.3 | Comments | 🟡 | 🟡 | ✅ | ❌ | ❌ | 🟡 | Sheet, "Vendor" tag, composer adds "Aina · baru"; guest sees "Log masuk untuk komen" · `ReelSheets.tsx:10-47` | No report (⋯) on a comment, no comment like (static count), no profanity filter, no skeleton, no failed-send state. New comments vanish when you leave the tab. |
| C-7.4 | Share | 🟡 | 🟡 | – | – | – | ✅ | WhatsApp, Salin pautan, Telegram, Lagi… with copy fallback · `ReelSheets.tsx:49-67` | The link is `#/inspirasi`, not that video. |
| C-7.5 | Video → booking | ✅ | ✅ | – | – | – | 🟡 | "Lihat pakej · dari RM 3,900" → profile; save; + follow · `ReelSlide.tsx:71-103` | Suspended-vendor edge needs Admin data. The vendor's own comment says "pakej ini bermula RM 6,500" (mismatch). |
| C-7.6 | Report video | ✅ | ✅ | – | – | – | – | ⋯ → 4 reasons → "Laporan dihantar" · `ReelSheets.tsx:69-86` | Toast only; the admin queue is Wave 2 (acceptable). |
| C-8.0 | Tabung savings plan | ✅ | ✅ | ✅ *code* | – | – | ✅ | `#/tabung`: RM 2,520/bulan → RM 1,870 after the deposit → RM 1,710 after logging RM 500; "Kurang RM 172" amber; rings per instalment; "Cara kira" · `calc.ts:24-44` | "Sudah simpan" stays the same after a payment (see Consistency). |
| C-8.1 | Log savings & pay | 🟡 | ✅ | – | – | ✅ | 🟡 | "Saya dah simpan" → 99999 → "Jumlah melebihi baki… (RM 5,610)"; typing "500" holds (QA B1 fixed); Sejarah timeline; "Bayar" → booking detail · `TabungScreen.tsx:26-34,118-131` | The "N ansuran sudah lewat" banner is coded (`:40-48`) but no seed reaches it. No reminders. |
| C-9.0 | Design kad | ✅ | ✅ | ✅ | – | ✅ | ✅ | `#/kad`: 4 templates, photo (Taman/Kafe) + accent (Hijau/Emas/Malam), live preview; empty bride → "Lengkapkan 1 maklumat wajib" + "Wajib diisi"; long names shrink (`KadCard.tsx:38`); no sideways scroll (QA B2 fixed) | Preview is inline, not in a phone frame. Photos are 2 stock images, no upload. Pre-fill happens only when fields are empty. |
| C-9.1 | Share & RSVP | 🟡 | ✅ | ✅ *code* | – | ✅ | 🟡 | `#/jemputan` (no nav, no login) → no name → "Sila isi nama"; phone `123` → "tidak sah"; 3 people → "Kami catat 3 orang hadir"; `#/kad/rsvp` Hadir 20 → 23; `?closed=1` → "RSVP sudah ditutup"; CSV export · `KadGuest.tsx`, `KadRsvpList.tsx` | No "Belum jawab" total. Headcount > pax warning only on the RSVP list, not in My Majlis. One fixed link for every kad. |

**Totals:** ✅ 9 · 🟡 26 · 🔴 0 · deferred 2 → (9 + 26 × ½) / 35 = **63%**. Spec states: **82 / 113 = 73%**.

---

## §4 Settings (customer level) and §6 data the customer sees

| Item | Status | Note |
| :-- | :-: | :-- |
| Name | 🟡 | Shown, not editable |
| Avatar | ❌ | Initial letter only |
| Phone (+60) | 🟡 | Hard-coded "+60 12-345 6789", not the number you logged in with |
| Email | ❌ | Absent |
| Password / OTP | ✅ | OTP only (password path not built, see G-2.0) |
| Language | 🟡 | BM; "EN · akan datang" (deliberate) |
| Notification channels | 🟡 | WhatsApp / SMS / Emel / Push switches; not saved |

| Entity (§6) | Customer sees | Missing / wrong |
| :-- | :-- | :-- |
| Vendor Listing | name, category, freelancer flag, base area, rating, review count, reply time, verified-since | service_radius / states[] (only base area); halal (n/a for talent) |
| Package | name, RM price, "dari", inclusions, deposit %, plan | min_pax; structured category_fields |
| Availability | busy dates, held date | capacity / used ("1 slot left") |
| Event | type, date, location (text), pax, budget, budget_split, checklist_items | **dates[] (day 2 dropped)**; lat/lng |
| Payment Plan | deposit, deadline, instalments due / paid / overdue | — |
| Tabung Entry | amount, note, date | — |
| Invitation | all fields incl. photo, accent, rsvp_close | share_slug is one fixed link |
| RSVP | all fields | — |
| Compare Share | ids in URL, votes by name | votes are device-local |
| Booking Request | vendor, package, date, est. total, note, all 10 statuses, reason | event_id, pax, explicit reply_deadline |
| Review | rating, text, photos, vendor reply | — |
| Video / Comment / Like | title, desc, location, category, hashtags, counts, vendor tag | package link; comment likes are static |

---

## §7 Gherkin (run live)

| Scenario | Result | What happened |
| :-- | :-: | :-- |
| 1 Only real customers can review | ✅ | B-1042 (Confirmed) and `#/vendor/10` show no review action. B-0988 (Completed) shows "Tulis ulasan" on Booking Detail; the posted review appears on `#/vendor/29?tab=ulasan` with "Tempahan melalui Majlis Hub". |
| 2 Radius search (Shah Alam, 70 km, Photo) | 🟡 | `#/cari?cat=photo`: 3 verified photographers, all ≤70 km, nearest first (6, 21, 62 km). The event location cannot be set from search: "Diukur dari lokasi majlis anda, Shah Alam" is static and stays after the event moves to Bangi. Service area = base distance. |
| 3 Booking request expires (48h) | ✅ | `#/tempahan/B-1049`: "Tamat tempoh · Vendor tidak membalas dalam 48 jam" + "Cuba vendor serupa" (Teman Raja Sehari, Dara Assist). Computed from `createdAt + 2 days` (`BookingList.tsx:9-12`). |
| 4 Deposit not paid in time | 🟡 | `#/tempahan/B-1038`: "Luput · deposit tak dibayar … tarikh telah dilepaskan" ✅. **"Tempah semula" never shows**: the mock marks the vendor busy on 14 Feb, so the screen says "Tarikh ini sudah diambil orang lain". The success branch cannot be demoed. |
| 5 Suggested package fits RM 40,000 | ✅ | Total RM 27,000 ≤ RM 40,000; swap → RM 25,250 live. |
| 6 Guest RSVPs without an account | ✅ | `#/jemputan`, Hadir × 3 → `#/kad/rsvp` Hadir 20 → 23, Planner tile "23 hadir". |
| 7 Vendor edits verified details | n/a | Wave 2. |

## §9 Open Decisions 1–12

| # | Decision | Status | Evidence / note |
| :-: | :-- | :-: | :-- |
| 1 | Map view → B (list + distance) | ✅ | No map; km on every card. |
| 2 | Vendor reply deadline 48h | ✅ | Auto "Tamat tempoh" after 2 days (B-1049). |
| 3 | Daily capacity set by vendor | 🟡 | Vendor side is Wave 2; customer calendar has no "1 slot left". |
| 4 | Freelancers allowed, "Verified Freelancer" | ✅ | "Freelancer Disahkan" badge; verify sheet says IC checked. |
| 5 | Phone shared only after Accepted | 🟡 | Correct for Requested / Expired; **wrong for Lapsed** (reveals) and **visible to guests** (B1, B3). |
| 6 | Only verified vendors post videos | ✅ | All reels are from verified vendors, badge shown. |
| 7 | Comment moderation: auto-filter + report + queue | 🟡 | Video report exists; no comment report, no word filter. |
| 8 | Max video 60 s | n/a | Upload is vendor side (Wave 2). Reels are short loops. |
| 9 | Deposit set by vendor, default 30% | ✅ | 30% (3 payments) and 50% (MC, Inai, 2 payments). |
| 10 | Date held during Deposit Due ("Ditahan") | 🟡 | Other customers' holds show as "Ditahan" (even-id vendors, demo). **The customer's own hold shows as "sudah ditempah"** (B2). |
| 11 | Duit salam QR later | ✅ | Not built, as decided. |
| 12 | Kad page for guests, no login | ✅ | `#/jemputan` has no nav and no login. |

## §5 RBAC: Guest vs Customer (tested logged out via `#/akaun` → Log keluar)

| Capability | Spec Guest | App as Guest | Spec Customer | App as Customer | Verdict |
| :-- | :-: | :-- | :-: | :-- | :-: |
| Search & view vendors | ✅ | ✅ `#/cari`, `#/vendor/7` | ✅ | ✅ | ✅ |
| Save (heart) | — | → login, then the save completes | ✅ | ✅ | ✅ |
| Compare / share vote | — | **Allowed** ("Bandingkan (2)") | ✅ | ✅ | 🟡 lenient, low risk |
| My Majlis planner `#/majlis` | — | Gated: "Log masuk untuk rancang majlis anda" | ✅ | ✅ | ✅ |
| Wizard `#/majlis/baru` | — | **Opens** | ✅ | ✅ | 🔴 |
| Bookings `#/tempahan`, `#/tempahan/B-1042` | — | **Shows all of Aina's bookings and their detail** | ✅ | ✅ | 🔴 |
| Tabung `#/tabung` | — | **Shows Aina's savings plan** | ✅ | ✅ | 🔴 |
| Kad editor `#/kad`, RSVP list `#/kad/rsvp` | — | **Opens; RSVP list shows guests' names + phone numbers** | ✅ | ✅ | 🔴 |
| Messages `#/mesej`, `#/mesej/7` | — | **Shows threads + vendor phone "012-334 8810"; can send** | ✅ | ✅ | 🔴 |
| Send booking request | — | "Log masuk untuk tempah" → login | ✅ | ✅ | 🟡 sheet doesn't reopen after login |
| Write review | — | Completed booking detail is reachable (same leak) | ✅ Completed only | ✅ | 🔴 via leak |
| Watch / share videos | ✅ | ✅ | ✅ | ✅ | ✅ |
| Like / comment / save / report video | — | → login | ✅ | ✅ | ✅ (like not applied after login) |

Cause: only `PlannerScreen.tsx:15` and `AccountScreen.tsx:30` check `s.authed`. `BookingList`, `BookingDetail`, `TabungScreen`, `KadEditor`, `KadRsvpList`, `MessagesScreen`, `ChatScreen` and `WizardScreen` have no guard.

---

## Consistency findings (checked on purpose)

| # | Area | Finding | Severity |
| :-: | :-- | :-- | :-: |
| 1 | Held / own dates | `mock.ts:114` adds 14 Feb 2027 to every 3rd vendor (ids 7, 10, 11, 18, 23, 26, 29). These include the customer's own Lensa Kasih (Confirmed), Teratak Pelamin (Deposit Due) and Andaman Seri Ayu (Requested, later "accepted"). Their profiles say "Tarikh majlis anda: sudah ditempah", Compare says "Penuh", and lapsed Kompang can't offer "Tempah semula". | 🔴 |
| 2 | Phone reveal | `ChatScreen.tsx:24` uses raw `status`, not the lapsed/expired check used everywhere else. `#/mesej/26` (lapsed) shows "Tempahan diterima. Telefon: 012-345 6789" (placeholder; `PHONES` has no entry for 26). | 🔴 |
| 3 | Spend vs budget | Planner "Ditempah RM 13,550" = Confirmed 4,800 + Deposit-Due 6,500 + Requested 1,800 + Completed inai 450. Tabung "owed" uses Confirmed + Deposit-Due unpaid only (RM 9,860). A second photographer request moves Planner to RM 15,700 with no warning. The three money screens use three different bases. | 🟡 high |
| 4 | Event change | After `#/majlis/baru` → Kenduri, 20 Mac 2027, Bangi: Home, Planner, chat quick-reply and vendor calendar update ✅. **Kad stays 14 Feb, Dewan Seri Kenanga.** Search still measures from Shah Alam. All the 14 Feb bookings stay on the new kenduri ("3/8 disahkan", each with "Tarikh tempahan lain"). | 🟡 high |
| 5 | Wizard overwrite | The wizard does not pre-fill from the current event. Same type + same date skips the "Ganti majlis?" confirm, so pax 500 → 300 and budget RM 40,000 → RM 25,000 are silently overwritten. | 🟡 high |
| 6 | Countdown / date | Home ring 95 HARI = Planner 95 HARI LAGI = 14 Feb 2027 (correct from 11 Nov 2026). Pax 500 on Home and Planner. Kad 14 Feb. ✅ in seed state. | ✅ |
| 7 | Progress | Home "2/8 vendor disahkan" = Planner "2/8 disahkan" ✅. Counts an inai session on 31 Okt 2026 (before the wedding), so the Inai row carries an amber "Tarikh tempahan lain". | 🟡 low |
| 8 | Booking statuses | List, detail, planner chips and Tabung all agree (shared lapsed/expired logic, duplicated in `BookingList.tsx:9` and `calc.ts:10`). Chat is the odd one out (#2). | ✅ / 🔴 |
| 9 | Tabung | Planner tile = Tabung (RM 2,520 → 1,870 → 1,710) ✅. "Sudah simpan RM 2,300" does not drop when the RM 1,950 deposit is paid, while Sejarah lists −RM 1,950. Reads as double-counted money. | 🟡 |
| 10 | Saved hearts | Search card, vendor heart and `#/akaun` "Disimpan" agree ([21] → [21,16] after guest login). | ✅ |
| 11 | RSVP totals | Kad "RSVP (4/5)" = responses; Planner "20/23 hadir" = people; RSVP list "Hadir 20/23 orang". Consistent before and after the guest RSVP. | ✅ |
| 12 | Prices | Teratak's reel comment: "pakej ini bermula RM 6,500"; CTA and profile: "dari RM 3,900". | 🟡 |
| 13 | Ratings | Bingkai Abadi 4.8★ with visible reviews 4★ / 4★ / 3★. "143 ulasan sebenar" with 3 listed. | 🟡 |
| 14 | Photos | Cahaya Senja **Photography** uses `planning.jpg` (couple at a café), not photography work. Other categories have matching photos. | 🟡 low |
| 15 | Account | Phone always "+60 12-345 6789" whatever number logs in. | 🟡 low |

---

## 🔴 Blockers (would mislead stakeholders or break a promised feature)

1. **B1: Guest sees private data.** Logged out, `#/tempahan`, `#/tempahan/B-1042`, `#/tabung`, `#/kad`, `#/kad/rsvp` (guest phone numbers), `#/mesej`, `#/mesej/7` (vendor phone) and `#/majlis/baru` all open. This breaks §5 RBAC and the "login wall at action" rule, and looks like a privacy bug the moment someone demos the guest view. Fix: one guard (a shared `RequireAuth` or a check in `screenFor`, `App.tsx:26-43`) for `tempahan`, `tabung`, `kad` (not `jemputan`), `mesej`, `majlis/*`.
2. **B2: The customer's own held date reads as taken by someone else.** `data/mock.ts:114` busy rule collides with the seeded bookings (consistency #1). This undercuts stakeholder #8 and OD10 ("Ditahan", lock the date), shows "Penuh" for her own photographer in Compare, and blocks Gherkin 4's "Tempah semula". Fix in mock data: keep 14 Feb free for vendors that hold a customer booking (7, 10, 11, 26), or treat the customer's own active booking as "ditempah oleh anda" / "ditahan untuk anda".
3. **B3: Chat reveals a placeholder phone on a lapsed booking.** `ChatScreen.tsx:24` should use the same lapsed/expired status as the rest of the app. Also drop the `012-345 6789` fallback (`:36,40`) or add the phone to `PHONES`.

## 🟡 Gaps ranked by stakeholder impact

1. **Compare doesn't show differences (stakeholder #2/#4).** Vary package inclusions, deposit %, number of payments and cancel policy per vendor in mock. Make the portfolio tappable to full screen. Stop the verdict chips clipping. Add "Tunggu undian".
2. **Money doesn't reconcile.** Planner spend should be confirmed spend (or say clearly what it counts). Warn before a second vendor in an already-confirmed category. Tabung "Sudah simpan" should reflect payments made.
3. **One-event model leaks across screens.** Wizard pre-fills from the current event. Day 2 is saved. The replace confirm also covers a pax/budget change. Kad and search location follow the event. Bookings belong to an event.
4. **Search filters missing or dead (C-1.2/C-1.1).** Add date-available, pax and halal. "4 ke atas" and "Disahkan sahaja" do nothing: hide them or give mock vendors <4★ / unverified. Use a radius slider. Add District. Add GPS-denied fallback.
5. **Login round-trip.** After "Log masuk untuk tempah" the booking sheet should open (`VendorScreen.tsx:17` state read only on mount). Apply a pending like after login. Add email + password and button spinners (G-2.0).
6. **Inspirasi polish.** Honour `?v=` from Home tiles. Share link to the single video. End-of-feed state. Offline error. Comment report and like. More than 3 videos. Fix the RM 6,500 vs RM 3,900 mismatch.
7. **Deposit/Tabung time states can't be shown.** Seed one deposit due in ≤3 days (red), one lapsed booking whose date is free ("Tempah semula") and one overdue instalment. Add a reminders surface (14/7/3/1 days).
8. **Vendor profile trust details.** "New on Majlis Hub" tag, "Ask for quote", suspended "Not available" page, "1 slot left", WhatsApp share with preview. Make sample reviews match the rating. Bump the count after a review. Add a dispute link on reviews.
9. **Planner → search pre-fill (C-3.2)** with event date, pax and radius from the event location.
10. **Account (C-6.0).** Real phone, email, edit, saved notification switches, "Video disukai".
11. **Small.** Scroll the active category chip into view. Fix 6 px sideways scroll on `#/?demo=loading`. Use a correct photo for Cahaya Senja. Add a "Belum jawab" RSVP count and a pax warning in My Majlis.

## Deferred (agreed cuts, not counted)

- **G-3.0** BM/EN toggle: BM only this wave.
- **C-1.3** Map view: OD1 = B.
- **OD11** Duit salam QR: later.
- Real payments, backend, real notification delivery, cross-device vote/RSVP sync: Phase 5 is front end + mock (§8 Non-Goals).
- **Gherkin 7:** Wave 2 (vendor).

## Wave 2: not in scope this wave (no verdict)

| Row | Note |
| :-- | :-- |
| V-1.0 | Vendor onboarding step 1 (business info, SSM / freelancer IC). The login "Saya vendor" role only toasts "akan datang". |
| V-1.1 | Service area pin + radius; would feed C-1.1 service-area matching. |
| V-1.2 | Document upload (SSM, IC, halal) with preview. |
| V-1.3 | Profile + packages → Submitted for Verification. |
| V-2.0 | Vendor dashboard KPIs + verification banner. |
| V-3.0 | Booking requests table with reply countdown. |
| V-3.1 | Accept / Decline; stood in for by "Simulasi: vendor terima" on Booking Detail. |
| V-3.2 | Mark completed; stood in for by the seeded Completed booking B-0988. |
| V-4.0 | Availability calendar manager + daily capacity (OD3). |
| V-5.0 | Edit listing; re-verification keeps the old listing live. |
| V-6.0 | Reply to reviews (one public reply); seeded replies stand in. |
| V-7.0 | Vendor inbox + quick replies. |
| V-8.0 | Video upload (≤60 s, OD8). |
| V-8.1 | Video management + insights. |
| V-9.0 | Deposit % / instalment / cancel-policy rules per package (OD9). |
| A-1.0 | Admin KPI dashboard. |
| A-2.0 | Verification queue with SLA badge. |
| A-2.1 | Split-screen vendor review with checklist, audit-logged. |
| A-3.0 | Manage / suspend vendors. |
| A-4.0 | Read-only booking monitor + audit timeline. |
| A-5.0 | Review moderation (hide with logged reason). |
| A-6.0 | Categories, package templates, featured vendors. |
| A-7.0 | Video & comment moderation queue. |

---

## Demo script (10 click-paths that show every customer feature)

Before each session: `http://localhost:5173/#/akaun` → **Tetapan semula demo** → Tetapkan semula. Until B1 to B3 are fixed, **don't open Tempahan / Tabung / Kad / Mesej while logged out**, don't open `#/vendor/10` or `#/vendor/7` → Pakej calendar, and don't press "Guna pakej ini" in the wizard (it overwrites pax/budget).

1. **Talent-first home → real search (#1, #2, #7).** `http://localhost:5173/#/` → tap **Bride Assistant** tile → `#/cari?cat=bride` → tap **Semua** chip → tap the search box (`#/cari?focus=1`) → type `pengapit`, then `photographer`, then `xyzz` ("Tiada padanan").
2. **Budget slider + empty radius (#3).** `#/cari` → filter button → drag **Bajet maksimum** to RM 1,000 ("Tunjuk 10 vendor") → Tunjuk. Then `#/cari?cat=inai&km=10` → **Luaskan ke 30 km**.
3. **Compare + partner vote (#4).** `#/cari?cat=photo` → tick **Banding** on all 3 → **Bandingkan (3)** → **Kongsi dengan pasangan** → **Buka halaman undian** (`#/banding/kongsi?ids=7,12,13`) → name "Hakim" → **Undi ini** → back to `#/banding?ids=7,12,13` ("Hakim ✓").
4. **Vendor trust + held date of another customer.** `#/vendor/12` → tap **Disahkan** ("Apa yang kami semak") → **Ulasan** tab → **Pakej** tab, scroll to the calendar (20 Feb "Ditahan") → **Hantar permintaan** → pick 13 Feb (nearby free dates) → 14 Feb → **Hantar permintaan**.
5. **Wizard + suggested package (#5).** `#/majlis/baru` → Perkahwinan → 14 Feb 2027 + "Majlis 2 hari" → Shah Alam → budget `40000` → **Tukar** on Foto & Video (total updates) → **Pembahagian** sliders → set `3000` ("Bajet ini cukup untuk 4 kategori"). Close with ✕ (don't press Guna).
6. **Planner + checklist.** `#/majlis` → shortcuts (Kad 20 hadir, Tabung, Tempahan) → **Cari** on MC → back → under Item sendiri tap **Door gift**, add "Bunga telur / 500 biji".
7. **Deposit lock (#8).** `#/tempahan/B-1057?fail=1` → **Bayar deposit** → Bayar (fails, "Kiraan hari masih berjalan") → open `#/tempahan/B-1057` → **Bayar deposit** → e-Dompet → receipt → "Disahkan · tarikh dikunci" → **Lihat pelan Tabung**.
8. **Tabung (#9).** `#/tabung` → **Saya dah simpan** → `99999` (blocked) → `500` "Gaji November" → plan drops to RM 1,710/bulan → open "Cara kira".
9. **Whole booking lifecycle + real reviews.** `#/tempahan` → B-1049 (Tamat tempoh + Cuba vendor serupa) → B-1051 (Ditolak + reason) → B-1063 → **Simulasi: vendor terima** → **Mesej vendor** (phone now shown) → B-0988 → **Tulis ulasan** (try a short text first) → **Lihat di profil vendor** (`#/vendor/29?tab=ulasan`).
10. **Kad kahwin + guest RSVP (#6), short video (#10), guest view.** `#/kad` → Klasik Krim, photo Taman, accent Hijau → **Kongsi kad** → open `#/jemputan` → RSVP Hadir × 3 → `#/kad/rsvp` (23 hadir) → `#/jemputan?closed=1`. Then `#/inspirasi` → double-tap like, Komen, Kongsi, ⋯ Lapor, **Lihat pakej**. Finally `#/akaun` → **Log keluar** → `#/vendor/7` ("Log masuk untuk tempah") → `#/inspirasi` tap like (asks to log in).
