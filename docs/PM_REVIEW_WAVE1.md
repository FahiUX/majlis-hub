# PM Review: Wave 1 (Customer app) vs MODULE_FEATURE_SPEC v2.0

- **Reviewer:** PM agent (Manager + Requirement Analyst), read-only
- **Date:** 2026-11-11
- **Scope:** Tab 1 Guest (G-1.0, G-2.0), Tab 2 Customer (all C- rows), section 7 Gherkin, Open Decisions 9–12. Front end only, mock data, BM only, simulated payments.
- **Out of scope:** V- and A- rows (Wave 2), Catering/Venue (paused).
- **Method:** read the spec, read every file in `src/`, then clicked through the app at `http://localhost:5173` (430×932) with Playwright session `pm`. Screenshots in the session scratchpad (`pm-*.png`). Flows run for real: search autocomplete ("pengapit"), filter sheet, empty radius + widen, compare (`?ids=7,12,13`), wizard step 4 at RM 40,000, deposit payment on B-1057, guest RSVP (Hadir +2 people → total 20 → 23). `localStorage['majlishub.v1']` cleared afterwards.

**Legend:** ✅ built as specified · 🟡 partly built (gap named) · 🔴 missing, or wrong in a way that would mislead stakeholders. "States" means the spec's 5 states: Ideal / Empty / Loading / Error / Edge.

---

## Overall

```
Rows working on the main (Ideal) path   ██████████████████░░  32 / 35  = 91%
Full spec incl. all 5 states (✅=1, 🟡=½)  ███████████░░░░░░░░░  19 / 35  = 54%
Gherkin (6 in scope)                      3 ✅ · 1 🟡 · 2 🔴
```

- ✅ 6 rows · 🟡 26 rows · 🔴 3 rows · deferred 2 rows (G-3.0, C-1.3)
- Most 🟡 rows are missing **Loading / Error** states or one edge case. The main path works.
- **Stakeholder feedback holds:** Cari opens a real search on "Semua" with category chips (no jump into one category). Deposit is 30 days and the date is shown as held. Tabung is a tracker only ("Duit kekal dalam akaun bank anda"). Categories are exactly the 8 talent ones; Catering and Venue are gone.

---

## Coverage table

| Row | Status | Evidence (route · file:line) | Gap |
| :-- | :-: | :-- | :-- |
| **G-1.0** Browse without login | 🟡 | `#/` · `home/HomeScreen.tsx:61-83`; guest gates in `vendor/VendorScreen.tsx:25,31`, `search/VendorCard.tsx:17`, `inspirasi/InspirasiScreen.tsx:45` | Guest gates are coded, but **the guest state cannot be shown**: `store.tsx:30` starts `authed: true` and nothing in the app logs out (no Account screen). Home has no **Loading** (skeleton), no **Error** (retry banner), no **Empty** (location denied → pick state). Featured row is "≤30 km from Shah Alam", not detected location. |
| **G-2.0** Register / Login | 🟡 | `#/masuk` · `auth/LoginScreen.tsx` | ✅ +60 validation, role choice, 6-digit OTP with paste, wrong OTP inline (`000000`), 60s resend. Missing: **email + password with eye toggle**, button **Loading** spinner, **Edge** "number already registered → go to login" (there is no register vs login split). |
| **C-1.0** Search vendors | ✅ | `#/cari` · `search/SearchScreen.tsx:80-117`, `searchLogic.ts:74-81` | Opens on "Semua", chips switch in place, live suggestions (category / vendor / area), recent searches, popular categories, "Tiada padanan", BM/EN keywords ("pengapit" → Bride Assistant, verified). Error via `?demo=error`. Loading is a card skeleton, not an inline spinner (fine). Minor: active chip is not scrolled into view (`?cat=mc` shows "Semua…Mak Andam", MC off-screen). |
| **C-1.1** Location filter | 🟡 | Filter sheet · `search/FilterSheet.tsx:54-70`, `searchLogic.ts:4-5` | Radius is **4 chips (10/30/70/150)**, not a 10–150 km slider. "Ikut negeri" has **no District** dropdown. Distance shows on cards ✅, empty + one-tap widen ✅ (`#/cari?cat=inai&km=10`). Missing: **Error** GPS denied → state fallback; **Edge** vendor service area (filter uses vendor base distance only). |
| **C-1.2** Filters & sort | 🟡 | `search/FilterSheet.tsx:9-37,81-84` | ✅ two-handle budget slider + histogram + RM 100 snap, live count ("Tunjuk 3 vendor"), removable pills, 3 sorts. Missing filters: **date available, pax, halal**. Rating filter is **4.8+**, spec says 4★+. **"Disahkan sahaja" toggle does nothing** (`searchLogic.ts:66`): switching it off changes no result, which looks broken in a demo. Empty state does not name the strictest filter. |
| **C-1.4** Compare vendors | 🟡 | `#/banding?ids=7,12,13` · `search/compareRows.tsx:20-38`, `CompareScreen.tsx` | ✅ all 11 rows, 3 verdict chips, best-in-row green, ties, mixed category blocked (`VendorCard.tsx:40`), max 3, "Tambah 1 lagi" empty. Gaps: portfolio strip **not tappable to full screen**; **cancellation policy is hard-coded** and the same for every vendor (`compareRows.tsx:35`); package inclusions are identical across vendors in mock data, so that row never differs; the customer's own confirmed photographer (Lensa Kasih, B-1042) shows **"Penuh"** on her own date. |
| **C-1.5** Share & vote | 🟡 | `#/banding/kongsi?ids=…` · `search/CompareShare.tsx` | ✅ WhatsApp link, no-login vote page, last vote wins by name, names on columns. Missing **Empty** "Tunggu undian" on the compare screen when no votes yet. |
| **C-1.3** Map view | Deferred | — | Open Decision 1 = B (list + distance). Correctly absent. |
| **C-2.0** View vendor | 🟡 | `#/vendor/7` · `vendor/VendorScreen.tsx` | ✅ swipe gallery, Verified badge → "Apa yang kami semak" sheet, rating, reviews, distance, reply time, 4 tabs. Missing: **Loading** skeleton, **Empty** "New on Majlis Hub" tag, **Error** suspended → "Not available" page (only a generic "tidak dijumpai"). Service area only in About tab, not above the fold. |
| **C-2.1** Packages | 🟡 | `vendor/VendorTabs.tsx:7-40`, `data/mock.ts:96-105` | ✅ clear RM price, inclusions, deposit % + instalment plan, 1–3 packages. Category fields (hours, language, sessions, size…) exist only as free-text bullets, not structured fields. Missing **Empty** "Ask for quote" CTA. |
| **C-2.2** Availability | 🟡 | `vendor/VendorTabs.tsx:43-79` | ✅ month calendar, booked shown by strike-through + grey (not colour only), event date ringed, "your date: free/booked" banner. Missing **"limited / 1 slot left"** state and the **"Ditahan" held state** that OD10 says other customers see. |
| **C-2.3** Reviews | 🟡 | `vendor/VendorTabs.tsx:81-121`, `data/mock.ts:37-41` | ✅ "Tempahan melalui Majlis Hub" tag, event type, date, stars, text, vendor reply, 5→1 bar. Gaps: no review **photos**; no **Empty** "No reviews yet"; 5→1 breakdown is hard-coded and the **same 3 reviews appear on all 24 vendors**. One is by **"Nurul Aina", the logged-in user**, who has no completed booking (see blockers). |
| **C-2.4** Save / Share | 🟡 | `vendor/VendorScreen.tsx:24-29` | ✅ heart → shortlist, guest → login. Share only copies the URL + toast; spec asks for a **WhatsApp-friendly share**. The saved shortlist has no screen to view it. |
| **C-3.0** Create event | 🟡 | `#/majlis/baru` · `planner/WizardScreen.tsx` | ✅ 5 event types, past date blocked, 2-day event, pax stepper. Location is **free text, no pin**. State holds **one event only** (`store.tsx:12`); "Majlis baru" overwrites the current event and keeps its old name (`SuggestStep.tsx:56`). Spec: a customer can have several events. |
| **C-3.0a** Suggested package | 🟡 | `#/majlis/baru?step=4` · `planner/SuggestStep.tsx` | ✅ one vendor per category within budget, default split, total vs budget bar, swap sheet with 3 alternatives, remove/add category, split sliders, "Bajet ini cukup untuk N kategori" + keep N, "Guna pakej ini" → shortlist (not booked). Verified: RM 40,000 → RM 27,000 total. Missing **Loading** skeleton; **Edge** "Tiada calon" offers no **widen radius** (fixed 70 km at `SuggestStep.tsx:21`). |
| **C-3.1** Planner dashboard | ✅ | `#/majlis` · `planner/PlannerScreen.tsx:47-123` | Header, countdown, place, pax, checklist with Belum mula / Disenarai pendek / status chips, budget bar, over-budget amber that never blocks, "Cari" CTAs. Vendor shows as name, not avatar (minor). |
| **C-3.2** Find vendor from planner | 🟡 | `planner/PlannerScreen.tsx:113` | Opens `#/cari?cat=<id>` only. **Not pre-filled with event date, radius or pax.** (The filter sheet's "dari lokasi majlis anda, Shah Alam" is static text.) |
| **C-3.3** Custom checklist items | 🔴 | — | **Not built.** No add-row, no notes, no default checklist per event type. Already flagged ❌ in `PREFLIGHT_AUDIT.md:54`. |
| **C-4.0** Send booking request | 🟡 | `#/vendor/7?book=1` · `vendor/BookSheet.tsx` | ✅ package pick, date, note, estimated total, success with "biasanya balas dalam…", booked date → 3 nearby free dates, duplicate request blocked, past date blocked. Missing: confirm **event pick / location / pax** (only date); submit **Loading** spinner. |
| **C-4.1** Track bookings | 🟡 | `#/tempahan` · `booking/BookingList.tsx:22-26`, `BookingDetail.tsx:68-79` | ✅ list, detail with 5-step timeline, status chips. Grouped by **action/status, not by event**. Seed data has no **Declined / Expired / Completed** booking to show. **Expired after 48h + "Try similar vendors" not built.** |
| **C-4.2** Cancel request | 🟡 | `booking/BookingSheets.tsx:77-109` | ✅ reason list + "Lain-lain" text, confirm sheet, vendor policy shown after deposit. Missing **Edge** warning when cancelling **less than 7 days** before the event. |
| **C-4.3** Chat with vendor | 🟡 | `#/mesej/7` · `chat/ChatScreen.tsx` | ✅ thread, phone shown only after Accepted, sent tick, failed → tap to retry (`?net=off`), "Mulakan perbualan" empty, quick chips. Missing **photo send** from the customer. Thread is per vendor, not per booking. |
| **C-4.4** Booking deposit | 🟡 | `#/tempahan/B-1057` · `booking/BookingDetail.tsx:51-66`, `BookingSheets.tsx:15-73` | ✅ Deposit Due card, countdown, "ditahan untuk anda sehingga…", FPX / card / e-wallet, processing spinner, failure + retry (`?fail=1`), ≤3 days red, paid → Confirmed + receipt (verified), lapsed → "Tempah semula" if free. Missing **reminders at 14/7/3/1 days** (no notification surface). No seeded lapsed booking, so Lapsed cannot be demoed without editing data. |
| **C-5.0** Leave review | 🔴 | — | **Not built.** No review form, no "Tulis ulasan" on a Completed booking, no completed booking in seed data. This is the core trust rule ("real reviews only"). `PREFLIGHT_AUDIT.md:59`. |
| **C-6.0** Profile & notifications | 🔴 | `App.tsx:45-51` (5 tabs, no Account) | **Not built and no entry point.** Also blocks: logout (so guest state G-1.0 cannot be shown), "Video disukai" (C-7.2), the saved shortlist, notification prefs. |
| **C-7.0** Video feed | 🟡 | `#/inspirasi` · `inspirasi/InspirasiScreen.tsx`, `ReelSlide.tsx` | ✅ full-screen snap feed, autoplay muted, loop, tap pause, progress bar, verified vendors only, category chips, empty category state. Missing: ranking by distance + freshness (fixed order), **Loading** dark skeleton, **Error** offline retry. **Edge contradicts spec:** feed loops forever (`InspirasiScreen.tsx:11-43`); spec wants "Anda dah tengok semua" + browse vendors. Home reel tiles link `#/inspirasi?v=<id>` but the feed ignores `v`. |
| **C-7.1** Video details | ✅ | `inspirasi/ReelSlide.tsx:83-94` | Vendor + badge, bold title, pin + area + km, 2-line desc with "lagi", hashtags, category, dark scrim. |
| **C-7.2** Like | 🟡 | `ReelSlide.tsx:42-53,76` | ✅ heart + count, double-tap burst, guest → login. Missing "Video disukai" in Account (no Account). After login the like is not applied automatically. |
| **C-7.3** Comments | 🟡 | `inspirasi/ReelSheets.tsx:10-47` | ✅ sheet, vendor tag, composer, "Jadi yang pertama komen", guest → login. Missing: **report comment (⋯)**, liking a comment (count is static), profanity filter, **Loading** rows, **Error** failed send. |
| **C-7.4** Share | 🟡 | `ReelSheets.tsx:49-67` | ✅ WhatsApp, copy, Telegram, native share with copy fallback. The link opens the feed (`#/inspirasi`), **not that video page**. |
| **C-7.5** Video → booking | ✅ | `ReelSlide.tsx:71-78,98-101` | "Lihat pakej · dari RM X" CTA, save, follow (+ on avatar). Suspended edge needs Wave 2 data. |
| **C-7.6** Report video | ✅ | `ReelSheets.tsx:69-86` | 4 reasons, guest-gated, toast. |
| **C-8.0** Tabung savings plan | ✅ | `#/tabung` · `tabung/calc.ts`, `TabungScreen.tsx` | "Simpan RM 2,520/bulan" across all bookings, ring per instalment, on track / "Kurang RM 781" amber, empty state, "Cara kira", tracker-only copy. |
| **C-8.1** Log savings & pay | 🟡 | `TabungScreen.tsx:26-34,108-121` | ✅ "Saya dah simpan" sheet, amount > remaining blocked, history timeline, "Bayar" → instalment payment in booking detail. Missing **overdue instalment** amber (no overdue state exists), reminders. |
| **C-9.0** Design kad kahwin | 🟡 | `#/kad` · `kad/KadEditor.tsx`, `KadCard.tsx:21` | ✅ 4 templates, couple, parents, date, time, venue + map link, ayat, aturcara add/remove, live preview, pre-fill from My Majlis, required inline errors, long names shrink. Missing **photo** and **colour accent** fields. Preview is inline, not in a phone frame. |
| **C-9.1** Share & RSVP | 🟡 | `#/jemputan`, `#/kad/rsvp` · `kad/KadGuest.tsx`, `KadRsvpList.tsx` | ✅ WhatsApp share, no-login guest page, RSVP form with +60 phone check, Hadir / Tidak, count, ucapan, closed state, totals, search, filter, CSV export, wishes wall. Verified live (20 → 23). Missing **"Belum jawab"** total (there is no guest list to compare against). Headcount > pax warning shows in the RSVP list, **not in My Majlis** as spec says. |

---

## Gherkin (section 7)

| Scenario | Status | Note |
| :-- | :-: | :-- |
| Only real customers can review | 🔴 | No review action exists anywhere (C-5.0). The first half passes only because nothing is shown. |
| Radius search (Shah Alam, 70 km, Photo) | ✅ | `#/cari?cat=photo`: verified only, ≤70 km, nearest first. Service-area coverage is approximated by base distance. |
| Booking request expires (48h) | 🔴 | No expiry logic, no "Expired" seed, no "similar vendors". |
| Deposit not paid in time | 🟡 | Logic is there (`BookingList.tsx:9-10`, `BookingDetail.tsx:60-66`), but no seeded lapsed booking, so it cannot be demoed. |
| Suggested package fits the budget | ✅ | RM 40,000 → RM 27,000 total, swap updates total live. |
| Guest RSVPs without an account | ✅ | Ran it: Hadir total 20 → 23 after a 3-person RSVP. |
| Vendor edits verified details | n/a | Wave 2. |

## Open Decisions 9–12

| # | Decision | Status | Note |
| :-: | :-- | :-: | :-- |
| 9 | Deposit vendor-set, default 30% | ✅ | Mock plans: 30% (3 payments) and 50% (MC, Inai). |
| 10 | Held date during Deposit Due | 🟡 | Customer sees "ditahan untuk anda sehingga…" ✅. Other customers never see "Ditahan" on the vendor calendar (C-2.2). |
| 11 | Duit salam QR later | ✅ | Not built, as decided. |
| 12 | Kad guest page, no login | ✅ | `#/jemputan` has no nav, no login. |

---

## 🔴 Blockers (would mislead stakeholders)

1. **C-5.0 Leave review is missing.** "Real reviews only" is one of the two trust rules. With no review form and no Completed booking, the demo cannot show how a review is earned. Gherkin 1 fails.
2. **C-6.0 Account is missing, with no entry point.** It also means there is no logout, so the **guest experience (G-1.0, "Log masuk untuk tempah", guest gates on like/comment/save) cannot be shown** without devtools.
3. **C-3.3 Custom checklist items are missing.**
4. **Booking expiry (C-4.1 edge / Gherkin 3) is missing.** No Expired state, no "Cuba vendor serupa".
5. **Misleading review data (C-2.3):** every vendor shows the same 3 reviews and the same 5→1 bars, and one review is signed **"Nurul Aina", the logged-in demo user**, who has no completed booking. In a demo this reads as "the app lets you review without booking", which contradicts the trust promise. Fix in `data/mock.ts:37-41`.

## 🟡 Partial: what to add (grouped)

- **Missing Loading / Error states** (most common gap): Home (skeleton, retry, location denied), Vendor profile (skeleton, suspended page), wizard step 4 (skeleton), Inspirasi (dark skeleton, offline), comments (skeleton, failed send), booking request and login buttons (spinner).
- **Search:** radius slider instead of 4 chips; District dropdown; GPS denied fallback; date / pax / halal filters; rating 4★+ (now 4.8+); make "Disahkan sahaja" do something or show it as fixed; scroll the active category chip into view.
- **Compare:** tap portfolio → full screen; per-vendor cancellation policy and package data; show "Ditempah anda" instead of "Penuh" for the customer's own vendor; "Tunggu undian" empty.
- **Vendor profile:** "New on Majlis Hub" tag, "Ask for quote", limited / held ("Ditahan") calendar states, review photos, "No reviews yet", WhatsApp share.
- **My Majlis:** several events; location pin; planner → search pre-filled with date / radius / pax; widen radius in step 4 when no candidate.
- **Booking:** pick event / pax in the request sheet; group list by event; seed Declined / Expired / Completed / Lapsed examples so every status can be demoed; <7-day cancel warning; photo in chat; reminders (14/7/3/1 days).
- **Tabung:** overdue instalment state.
- **Kad:** photo and colour accent fields; "Belum jawab" count; pax warning also in My Majlis.
- **Inspirasi:** "Anda dah tengok semua" end of feed instead of infinite loop; honour `?v=` from Home; share link to the single video; report / like comment; distance ranking.
- **Auth:** email + password with eye toggle; "number already registered" path.

## Deferred (not blockers)

- **G-3.0** BM / EN toggle: deliberately deferred; Wave 1 is BM only.
- **C-1.3** Map view: Open Decision 1 = B.
- **OD 11** Duit salam QR: later, by decision.
- **Gherkin 7** and all V- / A- rows: Wave 2.
- Real payments, backend, notifications delivery: non-goals for Phase 5 (but reminder UI is still in C-4.4 / C-8.1).

## Contradiction check vs stakeholder feedback (spec header)

| Feedback | Result |
| :-- | :-- |
| Cari must not jump into one category | ✅ `#/cari` opens on "Semua" with 24 vendors and chips |
| Deposit within 30 days, date held | ✅ `plan.ts:5-10`, "ditahan untuk anda sehingga 21 Nov 2026" |
| Tabung is a tracker, not a wallet | ✅ manual log only, bank-account copy, no balance held |
| 8 talent categories, Catering / Venue paused | ✅ `data/mock.ts:3-12` |
| Budget slider with histogram | ✅ `FilterSheet.tsx:9-37` |
| Richer compare + share & vote | 🟡 built; policy / package data identical across vendors |
| Package suggestion | ✅ (minus loading / widen) |
| Kad kahwin + RSVP | 🟡 built; photo / accent missing |
