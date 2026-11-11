# MODULE & FEATURE SPECIFICATION MATRIX

**Project Name:** Majlis Hub
**Document Version:** 2.0 (v1.0 Gate 1 approved 2026-11-06 · v1.1 Inspirasi feed 2026-11-10 · **v2.0 stakeholder feedback 2026-11-11: talent-first categories, real search, budget slider, richer compare, package suggestion, digital kad kahwin + RSVP, booking deposit, Tabung savings plan.** **Gate 1 v2.0 approved 2026-11-11** with Open Decisions 9–12 as recommended. **Gate 3 approved 2026-11-11**: Phase 5 front end started)
**Build scope (Phase 5):** front end only. All data is mock, payments are simulated, nothing is sent or charged.
**Target Platform:** Mobile-first responsive web app (Customer on phone; Vendor & Admin dashboards optimised for desktop, usable on phone)
**Languages:** Bahasa Melayu + English (toggle, BM default)
**Dynamic Role Scoping:** Guest · Customer · Vendor · Admin

---

## 1. Executive Summary & Core Entity Lifecycle

* **v2 focus: talent first.** Catering and Venue (Dewan) are paused. v1 categories: **Photo & Video, MC, Mak Andam, Pelamin & Dekor, Bride Assistant, Inai (henna), Kompang & Hadrah, Penyanyi / Band.**
* **Core Business Problem:** Planning a majlis (wedding, kenduri, corporate or family event) in Malaysia means hunting for each vendor on a different platform: Google for catering, Facebook/Instagram for photographers, WhatsApp contacts for an MC. Availability and price are unclear and hard to check. Majlis Hub puts verified vendors from every category in one place, searchable by location, with real reviews and in-app booking requests.
* **Trust Promise (design + product north star):** *"Ohh, I trust this app."* Trust comes from two hard rules:
  1. **Verified badge:** Admin checks every vendor (SSM registration, halal cert where relevant, identity) before they go live.
  2. **Real reviews only:** Only customers with a **Completed** booking on Majlis Hub can leave a review.
* **Core Entity & Lifecycle Spine: `Booking Request`**
  `Requested` ➔ `Accepted` ➔ `Deposit Due` ➔ `Confirmed` ➔ `Completed` ➔ `Reviewed`
  - **Deposit Due:** after the vendor accepts, the customer has **30 days** to pay the booking deposit. The date is **held** for them during that time (other customers see it as "Ditahan").
  - **Confirmed:** deposit paid, date locked. Remaining balance follows the vendor's instalment plan (see Tabung).
  Exception states: `Declined` (vendor says no, with reason) · `Expired` (no vendor reply in 48h) · `Lapsed` (deposit not paid within 30 days → auto-cancelled, date released) · `Cancelled` (either side cancels before event, with reason)
* **Secondary Entity: `Vendor Listing`**
  `Draft` ➔ `Submitted for Verification` ➔ `Verified (Live)` ➔ `Suspended`
  Exception: `Rejected` (admin gives reason; vendor can fix and resubmit)
* **Immutability & Audit Rule:**
  - Completed bookings cannot be deleted. They stay in both parties' history.
  - Reviews cannot be edited after 7 days or deleted by vendors. Vendors may post **one public reply**. Admin can hide a review only with a logged reason (audit trail visible in Admin).
  - Every status change on a Booking or Vendor Listing writes an audit entry (who, when, from → to, reason).

---

## 2. UI/UX Designer Scoping Advisory ("Master Screen → Clone & Tweak")

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ 1. MASTER SCREENS (Design from scratch, ~13 screens)                         │
│   M1  Home / Discover (mobile): search, category tiles, featured vendors     │
│   M2  Search Results: filter bar + vendor card list + map toggle             │
│   M3  Vendor Profile: gallery, packages, reviews, availability calendar      │
│   M4  Booking Request Sheet: bottom sheet / drawer form                      │
│   M5  My Majlis Planner: event header, category checklist, budget tracker    │
│   M6  Booking Detail + Status Timeline (shared Customer & Vendor)            │
│   M7  Inbox / Booking Chat thread                                            │
│   M8  Onboarding Stepper: 4-step wizard (Vendor registration)                │
│   M9  Dashboard Shell (desktop): sidebar + KPI cards                         │
│   M10 Master Data Table: search, filter pills, actions, pagination, export   │
│   M11 Availability Calendar Manager (Vendor)                                 │
│   M12 Verification Review Split Screen (Admin): docs left, decision right    │
│   M13 Auth: login / register / OTP                                           │
│   M14 Inspirasi feed: full-screen vertical video + right action rail         │
│   M15 Kad Kahwin editor: template picker + live card preview + fields        │
│   M16 Kad Kahwin guest page + RSVP form (opens from a link, no login)        │
│   M17 Payment & Tabung: deposit countdown, instalment schedule, savings plan │
└──────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ 2. CLONED VARIANTS                                                           │
│   • Category landing pages: clone M2, pre-set category filter + hero        │
│   • Vendor Profile per category: clone M3, swap package fields              │
│     (Catering = per pax + menu; Photo = hours + deliverables; MC = language)│
│   • Vendor dashboard vs Admin dashboard: clone M9, swap sidebar + KPIs      │
│   • Vendor Bookings / Admin Vendors / Admin Bookings / Admin Reviews tables:│
│     clone M10, swap columns + row actions                                   │
│   • Booking Detail: Customer sees Cancel/Review; Vendor sees Accept/Decline │
│   • Guest view of M3: same screen, CTA becomes "Log in to request"          │
│   • Vendor profile "Video" tab: clone M14 as a 3-column thumbnail grid      │
│   • Comments: reuse bottom sheet (M4 pattern) + chat composer (M7)          │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Master Role-Based Feature Matrix

**Traceability IDs:** `G-` Guest/Onboarding · `C-` Customer · `V-` Vendor · `A-` Admin

### Tab 1: Guest & Onboarding (all users)
| No | Module | Features / Action | UI/UX Explanation & Screen Behavior | UI Component / Micro-Detail | 5 States (Ideal, Empty, Loading, Error, Edge) | Tester | Comments |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **G-1.0** | **Discover** | Browse without login | Guest can search, filter and view vendor profiles. Booking, saving and reviews ask for login. | Home (M1), CTA swap on M3 | **Ideal:** Featured vendors near detected location<br>**Empty:** Location denied → pick state manually<br>**Loading:** Card skeletons<br>**Error:** Retry banner<br>**Edge:** Slow 3G, images lazy-load | | Login wall only at action, never at browse |
| **G-2.0** | **Auth** | Register / Login | Phone number + OTP (primary), or email + password with eye toggle. Choose role on first register: "I'm planning a majlis" / "I'm a vendor". | Auth screens (M13), 6-digit OTP input | **Ideal:** Logged in<br>**Empty:** Initial form<br>**Loading:** Button spinner<br>**Error:** Wrong OTP inline, resend after 60s countdown<br>**Edge:** Number already registered → go to login | | Malaysian +60 format validation |
| **G-3.0** | **Language** | BM / EN toggle | Toggle in header and in profile. Remembered per device and account. | Segmented toggle | **Ideal:** Instant switch<br>**Edge:** Vendor-written content stays in its original language | | BM default |

### Tab 2: Customer (planning a majlis)
| No | Module | Features / Action | UI/UX Explanation & Screen Behavior | UI Component / Micro-Detail | 5 States (Ideal, Empty, Loading, Error, Edge) | Tester | Comments |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **C-1.0** | **Search** | Search vendors | The **Cari tab opens a real search page**, not a fixed category. Search box with live auto-complete (vendor names, categories, areas) + recent searches + **category chips at the top** to switch category in place ("Semua" by default). No need to go back to Home. Category tiles on Home: Photo & Video, MC, Mak Andam, Pelamin & Dekor, Bride Assistant, Inai, Kompang & Hadrah, Penyanyi / Band. | Search page (M2) + category chips | **Ideal:** Suggestions as you type<br>**Empty:** Recent searches + popular categories; no match → "Tiada padanan. Cuba kategori lain"<br>**Loading:** Inline spinner<br>**Error:** Toast<br>**Edge:** BM/EN keyword both match ("jurugambar" = photographer, "pengapit" = bride assistant) | | Stakeholder #3 |
| **C-1.1** | **Search** | Location filter | Two modes: **State → District** dropdowns, or **radius slider** (10–150 km) from the event location or current GPS. Results show distance ("23 km away"). | Filter bar + bottom-sheet filters (M2) | **Ideal:** Results sorted by distance<br>**Empty:** "No vendors within 70 km. Widen radius?" + one-tap widen<br>**Loading:** Shimmer cards<br>**Error:** GPS denied → fallback to state<br>**Edge:** Vendor serves multiple states (service area) | | Matches the "70 km range" use case |
| **C-1.2** | **Search** | Filters & sort | Filters: date available, **budget range slider (two handles, RM min–max, with a price histogram so users see where most vendors sit; snaps to RM 100)**, pax capacity, verified only (on by default), rating 4★+, halal cert. Sort: Nearest, Top rated, Price low→high. Active filters show as removable pills. | Filter pills + bottom sheet | **Ideal:** Count updates live ("38 vendors")<br>**Empty:** Suggest removing the strictest filter<br>**Edge:** Date filter hides vendors already booked that day | | |
| **C-1.3** | **Search** | Map view | Toggle list ↔ map. Pins grouped when zoomed out. Tap pin → mini vendor card. | Map + mini card | **Ideal:** Pins in radius circle<br>**Loading:** Map skeleton<br>**Error:** Map fails → list stays usable | | Nice-to-have for v1 (see Open Decisions) |
| **C-1.4** | **Compare** | Compare vendors | Tick up to 3 vendors in the same category → side-by-side table. **Rows:** starting price, rating, review count, distance, verified, availability on your date, **package inclusions, deposit %, number of instalments, cancellation policy, reply time, portfolio count.** **Verdict chips** on top of each column: "Nilai terbaik", "Rating tertinggi", "Dalam bajet anda". **Portfolio row:** 3 photo/video strips side by side, tap to view full screen. | Sticky compare tray + compare table | **Ideal:** 3 columns, best value per row in green<br>**Empty:** "Add 1 more to compare"<br>**Edge:** Mixed categories blocked with hint; a tie gives both columns the chip | | Stakeholder #2 |
| **C-1.5** | **Compare** | Share & vote | "Kongsi dengan pasangan" sends a WhatsApp link to the comparison. The partner/family opens it (no login) and taps 👍 on their pick. Votes show on each column ("Aina ✓, Hakim ✓"). | Share sheet + vote chip | **Empty:** No votes yet → "Tunggu undian"<br>**Edge:** Same person votes twice → last vote wins | | Wedding decisions are made together |
| **C-2.0** | **Vendor Profile** | View vendor | Cover gallery (swipe), name + **Verified badge** (tap → explains what was checked), rating + review count, distance, service area, response time ("Usually replies in 2h"). Tabs: Packages · Reviews · Portfolio · About. | Vendor Profile (M3) | **Ideal:** Full profile<br>**Empty:** No reviews yet → "New on Majlis Hub" tag<br>**Loading:** Skeleton<br>**Error:** Vendor suspended → "Not available" page<br>**Edge:** 200+ photos paginate | | Trust signals above the fold |
| **C-2.1** | **Vendor Profile** | Packages | Package cards with **clear RM price** (or "from RM"), what's included, **deposit % and instalment plan**, and category fields: Photo/Video = hours, deliverables; MC = language, duration; Mak Andam = sessions, outfits; Pelamin = size, flowers; **Bride Assistant = hours, tasks (dress, makeup touch-up, schedule, salam guests), akad/sanding**; Inai = hands/feet, style; Kompang = group size; Band = sets, songs. | Package card list | **Ideal:** 1–5 packages<br>**Empty:** "Ask for quote" CTA<br>**Edge:** Long menu collapses with "See full menu" | | |
| **C-2.2** | **Vendor Profile** | Availability | Month calendar: available / booked / limited. If the customer has a My Majlis event, its date is highlighted. | Calendar (read-only) | **Ideal:** Clear colour + label legend<br>**Edge:** Catering capacity per day (e.g. 2 events/day) shows "1 slot left" | | Colour is never the only signal |
| **C-2.3** | **Vendor Profile** | Reviews | Each review has a **"Booked via Majlis Hub"** tag, event type, date, star rating, text, photos, and the vendor reply. Summary bar breakdown 5★→1★. | Review list + rating summary | **Ideal:** Reviews listed<br>**Empty:** "No reviews yet"<br>**Edge:** Hidden review shows nothing (no gaps) | | Real reviews only |
| **C-2.4** | **Vendor Profile** | Save / Share | Heart to save to shortlist. Share opens WhatsApp-friendly link with preview. | Icon buttons | **Edge:** Guest tap → login prompt | | |
| **C-3.0** | **My Majlis** | Create event | Wizard: event type (Wedding, Kenduri, Corporate, Birthday, Other), date(s), location (pin + address), pax, total budget (RM). | Stepper (reuse M8 pattern) | **Ideal:** Event created → planner opens<br>**Error:** Past date blocked<br>**Edge:** Multi-day event (akad + sanding on two days) | | One customer can have several events |
| **C-3.0a** | **My Majlis** | Suggested full package (wizard step 4) | After budget is entered, show **"Pakej dicadangkan"**: one top vendor per category that fits the budget, location and date, with a default budget split (e.g. Photo 30%, Pelamin 25%, Mak Andam 20%, MC 10%, others 15%). Total vs budget bar. User can **customise**: swap a vendor (sheet with 3 alternatives in the same budget slot), remove/add a category, drag the split. "Guna pakej ini" adds them to the planner as shortlisted (not booked). | Suggestion card list + swap sheet + split slider | **Ideal:** Full package within budget<br>**Empty:** Budget too low → "Bajet ini cukup untuk 3 kategori" + suggest which to drop<br>**Loading:** Skeleton cards<br>**Edge:** No vendor free on that date in a category → "Tiada calon" + widen radius | | Stakeholder #5 |
| **C-3.1** | **My Majlis** | Planner dashboard | Event header (name, countdown "45 days to go", location, pax). **Category checklist**: each category shows Not started / Requested / Confirmed + vendor avatar. Budget bar: confirmed spend vs budget. | Planner (M5) | **Ideal:** Mixed progress<br>**Empty:** All "Not started" + "Find catering" CTAs<br>**Edge:** Over budget → amber warning, never blocks | | The "everything in one place" promise |
| **C-3.2** | **My Majlis** | Find vendor from planner | Tap a category → search opens pre-filled with event date, location radius and pax. | Deep link into M2 | **Edge:** Event location changed → results refresh | | Saves re-typing |
| **C-3.3** | **My Majlis** | Custom checklist items | Add own items (e.g. "Door gifts", "Kad kahwin") with notes. These can link to a vendor later. | Inline add row | **Empty:** Default checklist per event type | | |
| **C-4.0** | **Booking** | Send booking request | From a package: confirm event (pick from My Majlis or enter date/location/pax), choose package, add note. Shows estimated total. Submit → status **Requested**. | Bottom sheet (M4) | **Ideal:** Success screen + "Vendor usually replies in 2h"<br>**Loading:** Button spinner<br>**Error:** Date just got booked → suggest nearby dates<br>**Edge:** Duplicate request to the same vendor and date blocked | | No payment in v1 |
| **C-4.1** | **Booking** | Track bookings | List grouped by event. Status chips: Requested, Accepted, Declined, Expired, Cancelled, Completed. | List + Booking Detail (M6) with status timeline | **Empty:** "No bookings yet"<br>**Edge:** Expired after 48h → "Try similar vendors" | | |
| **C-4.2** | **Booking** | Cancel request | Cancel before the event with a reason (dropdown + text). Confirmation modal. | Modal | **Edge:** Cancelling less than 7 days before the event shows a warning; after deposit → shows the vendor's cancellation policy | | |
| **C-4.4** | **Payment** | Booking deposit (lock the date) | When a booking is **Accepted** it becomes **Deposit Due**: a card shows "Bayar deposit RM X dalam 30 hari untuk kunci tarikh" with a countdown. Pay (simulated: FPX / card / e-wallet picker → success). Paid → **Confirmed**, date locked, receipt. Reminders at 14, 7, 3 and 1 day left. Not paid in 30 days → **Lapsed** (auto-cancel, date released). | Payment card + countdown + pay sheet (M17) | **Ideal:** Deposit paid → Confirmed<br>**Empty:** No bookings due<br>**Loading:** Processing spinner<br>**Error:** Payment failed → retry, countdown keeps running<br>**Edge:** ≤3 days left → red; lapsed → "Tempah semula" if the date is still free | | Stakeholder #8 · simulated in Phase 5 |
| **C-8.0** | **Tabung** | Savings plan | Each Confirmed booking shows the vendor's **instalment schedule** (e.g. 3 payments: deposit, 50% two months before, balance one week before). Tabung works out **how much to save per month** for every upcoming instalment across all bookings, as one plan: "Simpan RM 1,250/bulan". | Tabung screen (M17) + progress ring per instalment | **Ideal:** On track (green)<br>**Empty:** "Tiada bayaran lagi. Tempah vendor untuk mula menabung"<br>**Edge:** Behind plan → amber "Kurang RM 300 bulan ini" + new monthly amount | | Stakeholder #9 · money stays in the user's own bank (tracker only, no wallet) |
| **C-8.1** | **Tabung** | Log savings & pay instalment | User taps "Saya dah simpan" to log an amount (manual). When an instalment is due: "Bayar ansuran 2/3" (simulated payment). Reminders before each due date. Timeline of everything paid and saved. | Log sheet + timeline | **Error:** Amount > remaining → blocked with hint<br>**Edge:** Instalment overdue → amber, vendor notified; does **not** cancel a Confirmed booking | | |
| **C-9.0** | **Kad Kahwin** | Design digital card | Pick a template (4–6, brand-safe: Songket Hijau, Klasik Krim, Moden Minimal, Bunga Emas). Edit: couple names, parents' names, date, time, venue + map link, photo, colour accent, opening ayat/doa, aturcara (schedule). Live preview on a phone frame. | Editor (M15) | **Ideal:** Card preview updates live<br>**Empty:** Pre-filled from My Majlis event<br>**Error:** Required field missing → inline<br>**Edge:** Long names auto-shrink to fit | | Stakeholder #6 |
| **C-9.1** | **Kad Kahwin** | Share & RSVP | Share link via WhatsApp. Guest opens the card page (no login, M16): card + **RSVP form** (name, phone, Hadir / Tidak hadir, number of people, message/ucapan). Couple sees **RSVP list**: totals (Hadir 312 · Tidak 18 · Belum jawab), search, export, guest messages wall. | Guest page (M16) + RSVP list | **Ideal:** RSVPs counted live<br>**Empty:** "Belum ada jawapan. Kongsi kad anda"<br>**Error:** Form invalid → inline<br>**Edge:** RSVP closes on a set date; headcount above pax → amber warning in My Majlis | | Feeds pax in the planner |
| **C-4.3** | **Booking** | Chat with vendor | Thread per booking. Text + photo. Phone number is shared only after Accepted. | Chat (M7) | **Empty:** Prompt "Say hi"<br>**Loading:** Message sending tick<br>**Error:** Failed → tap to retry | | Keeps the conversation in-app |
| **C-5.0** | **Review** | Leave review | Unlocked only when a booking is **Completed** (vendor marks done, or auto 2 days after the event date). Stars, text, up to 5 photos. Editable for 7 days. | Review form | **Ideal:** Posted with "Booked via Majlis Hub" tag<br>**Error:** Text too short (<20 chars)<br>**Edge:** Customer disputes "not completed" → report link | | Core trust rule |
| **C-7.0** | **Inspirasi** | Video feed | New bottom tab "Inspirasi". Full-screen vertical feed, swipe up/down (scroll-snap), autoplay muted, loop, tap to pause/play, progress bar. Only videos from **verified vendors**. Ranked by distance to My Majlis location + freshness. Category filter chips at top (Semua, Foto, Pelamin, Mak Andam…). | Feed (M14) | **Ideal:** Video plays, rail visible<br>**Empty:** No videos in area → "Luaskan kawasan"<br>**Loading:** Dark skeleton<br>**Error:** Offline → retry<br>**Edge:** End of feed → "Anda dah tengok semua" + browse vendors | | Discovery + trust |
| **C-7.1** | **Inspirasi** | Video details | Bottom-left overlay: vendor avatar + name + Verified badge, **title** (bold, max 2 lines), **location** (pin + area, distance), **description** (2 lines + "lagi" expand), hashtags, category chip. | Text overlay on scrim gradient | **Edge:** Long BM text expands over video, scrollable | | Text over dark scrim, AA contrast |
| **C-7.2** | **Inspirasi** | Like | Heart on right rail with count; **double-tap video** to like (heart burst). Liked videos saved in Account → "Video disukai". | Icon button + count | **Edge:** Guest → login prompt, then like applied | | |
| **C-7.3** | **Inspirasi** | Comments | Comment icon + count opens bottom sheet: list (avatar, name, time, text, like comment), vendor replies tagged **Vendor**, composer at bottom. Report comment (⋯). | Sheet + composer | **Empty:** "Jadi yang pertama komen"<br>**Loading:** Skeleton rows<br>**Error:** Failed send → retry<br>**Edge:** Guest → login; profanity filter blocks + explains | | Logged-in users only |
| **C-7.4** | **Inspirasi** | Share | Share sheet: WhatsApp, copy link, more (native share). Link opens the video page with vendor CTA (works for guests). | Share sheet | **Edge:** No native share → copy link fallback | | WhatsApp first (MY habit) |
| **C-7.5** | **Inspirasi** | Video → booking | Sticky CTA on each video: "Lihat pakej · dari RM X" → Vendor Profile (M3). Save (bookmark) to shortlist. Follow vendor (+ on avatar). | CTA pill | **Edge:** Vendor suspended → video hidden from feed | | Conversion point |
| **C-7.6** | **Inspirasi** | Report video | ⋯ menu → Report (Misleading, Not a real vendor work, Inappropriate, Other) → admin queue. | Sheet | | | Trust |
| **C-6.0** | **Account** | Profile & notifications | Name, phone, email, avatar, language, notification prefs (WhatsApp/SMS/email/push). | Settings list | | | |

### Tab 3: Vendor (business owner)
| No | Module | Features / Action | UI/UX Explanation & Screen Behavior | UI Component / Micro-Detail | 5 States (Ideal, Empty, Loading, Error, Edge) | Tester | Comments |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **V-1.0** | **Onboarding** | Step 1: Business info | Business name, category (one or more of the 8 talent categories), SSM number, contact person, phone. | Stepper (M8) | **Error:** SSM format invalid<br>**Edge:** Freelancer with no SSM → IC + "Freelancer" path | | Many MCs/photographers are freelancers |
| **V-1.1** | **Onboarding** | Step 2: Service area | Base location pin + service radius or states served. | Map pin + radius slider | **Edge:** Nationwide toggle | | Feeds C-1.1 |
| **V-1.2** | **Onboarding** | Step 3: Documents | Drag-and-drop upload: SSM cert, IC (front/back), halal cert (required for Catering if claiming halal), with preview. | File uploader | **Loading:** Upload %<br>**Error:** Max 5 MB, PDF/JPG/PNG<br>**Edge:** Halal cert expiry date captured | | Private, admin-only |
| **V-1.3** | **Onboarding** | Step 4: Profile & packages | Cover photos, about, at least 1 package with RM price. Submit → **Submitted for Verification**. | Gallery uploader + package form | **Ideal:** "We'll verify within 2 working days" screen<br>**Error:** No package → blocked | | Clear price is required |
| **V-2.0** | **Dashboard** | Overview | KPI cards: New requests, Upcoming events (30 days), Response rate, Rating. Verification status banner. | Dashboard (M9) | **Empty:** New vendor checklist<br>**Loading:** Skeleton<br>**Edge:** Rejected → banner with admin reason + "Fix & resubmit" | | |
| **V-3.0** | **Bookings** | Booking requests table | Search by customer/event, filter pills by status, date range picker. Columns: event date, customer, package, pax, est. total, status, time left to reply. Row actions: View, Accept, Decline. Pagination 10/25/50, export CSV. | Data table (M10) | **Ideal:** Requests sorted by urgency<br>**Empty:** "No requests yet. Complete your profile to rank higher"<br>**Edge:** Countdown under 6h shows red | | |
| **V-3.1** | **Bookings** | Accept / Decline | Accept → status Accepted, date marked booked (or slot used). Decline needs a reason (Fully booked / Outside area / Other). | Booking Detail (M6), vendor variant | **Error:** Accepting would exceed daily capacity → warning<br>**Edge:** Decline offers "Suggest another date" | | |
| **V-3.2** | **Bookings** | Mark completed | After the event date: "Mark as completed" → unlocks customer review. Auto-completes 2 days after if not marked. | Action button | **Edge:** Customer cancelled → cannot complete | | |
| **V-4.0** | **Calendar** | Manage availability | Month view. Tap dates to block or unblock. Set daily capacity (default 1). Confirmed bookings show automatically. | Calendar manager (M11) | **Ideal:** Booked, blocked and free are distinct<br>**Edge:** Blocking a date with a pending request → prompt to decline it | | |
| **V-5.0** | **Profile** | Edit listing & packages | Edit gallery, about, packages. Edits to name, category or documents send the listing back for re-verification. Other edits go live instantly. | Form + drawer for package add/edit | **Edge:** Re-verification keeps the old listing live meanwhile | | Protects the badge |
| **V-6.0** | **Reviews** | Reply to reviews | List of reviews. One public reply per review. Report review (to admin) with reason. | Review list + reply drawer | **Empty:** "No reviews yet"<br>**Edge:** Reply locked after posting (edit within 24h) | | Vendor cannot delete reviews |
| **V-8.0** | **Videos** | Upload video | Upload MP4/MOV, **max 60s, 100 MB**, vertical 9:16 preferred (auto-crop preview). Fields: **title** (≤80), **location** (defaults to business base, editable), **description** (≤300), category, hashtags, link to a package (optional), cover frame picker. Submit → **Processing** → **Live** (auto-check) or **In review** (flagged). | Uploader + form | **Loading:** Upload % + processing<br>**Error:** Too long / too large / wrong format<br>**Edge:** Unverified vendor → upload locked with "Complete verification first" | | Only verified vendors post |
| **V-8.1** | **Videos** | Manage & insights | Grid of own videos with status (Live / In review / Removed with reason), views, likes, comments, profile taps, enquiries from video. Edit text, delete, pin to profile. Reply to comments (tagged Vendor). | Data table / grid | **Empty:** "Video pertama anda boleh tarik 3× lebih permintaan" | | |
| **V-7.0** | **Inbox** | Chat with customers | Same as C-4.3, vendor side. Quick-reply templates. | Chat (M7) | | | |
| **V-9.0** | **Payments** | Deposit & instalment rules | Per package: deposit % (default 30%), number of instalments (1–4) and due rules (e.g. 60 days / 7 days before event), cancellation policy. Sees deposit status per booking (Due / Paid / Lapsed). | Form + booking table column | **Edge:** Changing rules doesn't affect bookings already Confirmed | | Wave 2 |

### Tab 4: Admin (Majlis Hub team)
| No | Module | Features / Action | UI/UX Explanation & Screen Behavior | UI Component / Micro-Detail | 5 States (Ideal, Empty, Loading, Error, Edge) | Tester | Comments |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **A-1.0** | **Dashboard** | Platform KPIs | Pending verifications, new vendors this week, bookings this month, reported reviews, top categories by area. | Dashboard (M9), admin variant | **Loading:** Skeleton<br>**Error:** Retry | | |
| **A-2.0** | **Verification** | Verification queue | Table of Submitted listings, oldest first, SLA badge (over 2 working days = red). Filter by category and state. | Data table (M10) | **Empty:** "All caught up" | | |
| **A-2.1** | **Verification** | Review a vendor | Split screen: documents viewer (zoom) on the left; checklist (SSM matches name, IC matches contact, halal cert valid and not expired, photos genuine) + Approve / Reject with reason on the right. | Split screen (M12) | **Error:** Document fails to load → request re-upload<br>**Edge:** Halal cert expiring within 30 days → approve with reminder | | Every decision is audit-logged |
| **A-3.0** | **Vendors** | Manage vendors | Search, filters (category, state, status, rating). Actions: View, Suspend (reason), Reinstate. Export CSV. | Data table (M10) | **Edge:** Suspending a vendor with upcoming Accepted bookings → warning + notify customers | | |
| **A-4.0** | **Bookings** | Monitor bookings | Read-only table of all bookings with status filters + audit timeline per booking. | Data table + drawer | **Edge:** Many cancellations from one vendor → flag | | Admin does not edit bookings |
| **A-5.0** | **Reviews** | Moderate reports | Reported reviews queue. Actions: Keep, Hide (reason required, logged). Hidden reviews are kept in the database. | Queue + drawer | **Empty:** "No reports" | | Transparency rule |
| **A-7.0** | **Content** | Video & comment moderation | Queue of flagged/reported videos and comments with reason counts. Actions: Approve, Remove (reason, logged, vendor notified), Warn vendor. Auto-flag rules (banned words, repeated reports ≥3). | Queue + video preview drawer | **Empty:** "Tiada laporan" | | Audit-logged |
| **A-6.0** | **Settings** | Categories & content | Manage category list, package field templates per category, featured vendors on Home. | Settings forms | | | |

---

## 4. Settings Hierarchy

| Setting Level | Target Persona | Accessible Features |
| :--- | :--- | :--- |
| **👤 My Profile & Account** | All users | Name, avatar, phone, email, password/OTP, language (BM/EN), notification channels |
| **🏪 Business Settings** | Vendor | Business profile, service area, daily capacity, quick-reply templates, documents |
| **🏢 Platform Settings** | Admin only | Categories, package templates, verification checklist, featured vendors, admin team members |

---

## 5. RBAC Summary

| Capability | Guest | Customer | Vendor | Admin |
| :--- | :---: | :---: | :---: | :---: |
| Search & view vendors | ✅ | ✅ | ✅ | ✅ |
| Save, compare, My Majlis planner | — | ✅ | — | — |
| Send booking request | — | ✅ | — | — |
| Accept / decline / complete booking | — | — | ✅ (own) | — |
| Write review | — | ✅ (Completed only) | — | — |
| Watch / share Inspirasi videos | ✅ | ✅ | ✅ | ✅ |
| Like / comment / save / report video | — | ✅ | ✅ | — |
| Upload video | — | — | ✅ (Verified only) | — |
| Remove video / comment | — | — | ✅ (own video) | ✅ (logged) |
| Reply to review | — | — | ✅ (own, 1×) | — |
| View vendor documents | — | — | ✅ (own) | ✅ |
| Verify / suspend vendors, hide reviews | — | — | — | ✅ (logged) |

---

## 6. Data Dictionary (core fields)

| Entity | Key Fields |
| :--- | :--- |
| **User** | id, name, phone (+60), email, role (customer/vendor/admin), language, created_at |
| **Vendor Listing** | id, owner_user_id, business_name, categories[], ssm_no / ic_no, freelancer flag, base_location (lat/lng), service_radius_km / states[], status, verified_at, halal_cert_expiry, rating_avg, review_count, response_time_avg |
| **Package** | id, vendor_id, category, name, price_rm, price_type (fixed / from / per_pax), min_pax, category_fields (JSON), active |
| **Availability** | vendor_id, date, capacity, used, blocked flag |
| **Event (My Majlis)** | id, customer_id, type, dates[], location, pax, budget_rm, budget_split{category:%}, checklist_items[] |
| **Payment Plan** | booking_id, deposit_rm, deposit_deadline (accepted_at + 30d), instalments[{no, amount_rm, due_date, status (due/paid/overdue), paid_at}] |
| **Tabung Entry** | id, customer_id, amount_rm, note, created_at (manual log; no money held) |
| **Invitation (Kad Kahwin)** | id, event_id, template, fields (names, parents, date, time, venue, map_url, photo, accent, ayat, aturcara[]), rsvp_close_date, share_slug |
| **RSVP** | id, invitation_id, guest_name, phone, attending (yes/no), count, message, created_at |
| **Compare Share** | id, vendor_ids[], votes[{name, vendor_id}] |
| **Booking Request** | id, event_id, vendor_id, package_id, date, pax, est_total_rm, note, status (requested/accepted/deposit_due/confirmed/completed/reviewed/declined/expired/lapsed/cancelled), reply_deadline, status_reason |
| **Review** | id, booking_id (must be Completed), rating 1–5, text, photos[], vendor_reply, hidden flag, hidden_reason |
| **Video** | id, vendor_id, title, description, location (lat/lng + label), category, hashtags[], package_id?, duration_s, url, cover_url, status (processing/live/in_review/removed), views, likes_count, comments_count, created_at |
| **Video Comment** | id, video_id, user_id, text, is_vendor_reply, likes_count, hidden flag, created_at |
| **Video Like / Save** | user_id, video_id, created_at (unique pair) |
| **Audit Entry** | id, entity_type, entity_id, actor_id, from_status, to_status, reason, timestamp |

---

## 7. Key Acceptance Criteria (Gherkin)

```gherkin
Scenario: Only real customers can review
  Given a customer has a booking with status "Accepted"
  When they open the vendor profile
  Then the "Write a review" action is not shown
  And once the booking is "Completed" the action appears on the Booking Detail

Scenario: Radius search
  Given a customer sets the event location to Shah Alam and radius 70 km
  When they open Photo & Video
  Then only verified photographers whose service area covers that location within 70 km are listed, nearest first

Scenario: Booking request expires
  Given a booking request is "Requested"
  When 48 hours pass with no vendor reply
  Then the status becomes "Expired" and the customer is shown similar available vendors

Scenario: Deposit not paid in time
  Given a booking is "Deposit Due" with a 30-day deadline
  When 30 days pass without the deposit being paid
  Then the booking becomes "Lapsed", the date is released, and the customer sees "Tempah semula" if the date is still free

Scenario: Suggested package fits the budget
  Given a customer enters a total budget of RM 40,000 in the wizard
  When they reach step 4
  Then one vendor per category is suggested, the total is at or under RM 40,000,
  And swapping a vendor updates the total live

Scenario: Guest RSVPs without an account
  Given a guest opens a shared kad kahwin link
  When they submit Hadir with 3 people
  Then the couple's RSVP list shows them and the Hadir total goes up by 3

Scenario: Vendor edits verified details
  Given a vendor is "Verified"
  When they change their business name or upload a new SSM document
  Then the change goes to the verification queue and the current listing stays live until approved
```

---

## 8. Non-Goals (v1)

- **Real** payment processing (Phase 5 simulates FPX / card / e-wallet; a gateway such as FPX via a licensed provider comes later)
- Holding customer money (Tabung is a savings tracker, not a wallet; a wallet would need a BNM e-money licence or bank partner)
- Catering and Venue categories (paused for the talent-first launch)
- Backend: Phase 5 is front end only with mock data
- Native iOS/Android apps (web app first, shareable links)
- Vendor subscription plans or ads/boosted listings
- Multi-staff vendor accounts
- Customer-uploaded videos, live streaming, duets/remix, in-app video editor (v1 Inspirasi is vendor-posted only)

---

## 9. Open Decisions (BA Recommendation)

| # | Question | Options | BA Recommendation |
| :---: | :--- | :--- | :--- |
| 1 | Map view (C-1.3) in v1? | A) Yes · B) List only, distance shown | **B** for prototype. Distance + radius already answer "how near". Add the map after. |
| 2 | Reply deadline for vendors | A) 24h · B) 48h · C) 72h | **B 48h**. Fast enough for customers, fair to small vendors |
| 3 | Daily capacity | A) Always 1 per date · B) Vendor sets capacity | **B**. Caterers and makeup artists often do 2+ events a day |
| 4 | Freelancers without SSM | A) Block · B) Allow with IC verification, labelled "Verified Freelancer" | **B**. Most MCs and many photographers are freelancers |
| 5 | Phone number sharing | A) Visible on profile · B) Shared only after Accepted | **B**. Keeps the deal in-app so reviews stay real |
| 6 | Who can post Inspirasi videos? | A) Verified vendors only · B) Anyone | **A**. Keeps the feed trustworthy and every video leads to a bookable vendor |
| 7 | Comment moderation | A) Pre-approve every comment · B) Auto-filter + report + admin queue | **B**. Real-time feels alive; filter and reports catch abuse |
| 8 | Max video length | A) 30s · B) 60s · C) 3 min | **B 60s**. Enough for a pelamin walkthrough or a buffet tour |
| 9 | Deposit amount | A) Fixed 30% for all · B) Vendor sets 10–50% | **B, default 30%**. Talent prices vary a lot; vendors know their risk |
| 10 | Held date during Deposit Due | A) Hold for the customer (others see "Ditahan") · B) Not held, first to pay wins | **A**. That's the whole point of "lock the date" |
| 11 | Kad kahwin money gift (duit salam QR) | A) Include · B) Later | **B Later**. Needs payment handling; RSVP first |
| 12 | Kad kahwin page for guests | A) No login, link only · B) Login | **A**. Guests are aunties and uncles; zero friction |
