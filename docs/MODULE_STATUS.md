# Majlis Hub: Module status (Wave 1 re-measure)

- **Date:** 11 Nov 2026 · **Code:** after fix commits `69c7134`, `31c9838`, `3652849`
- **Checked against:** `docs/MODULE_FEATURE_SPEC.md` v2.0, every row (Guest, Customer, Vendor, Admin)
- **How:** every Guest and Customer row was clicked through live in the app (phone size 430×932), as a logged-in customer and as a logged-out guest. Demo switches used where they exist: `?demo=loading`, `?demo=error`, `?fail=1`, `?closed=1`, `?net=off`. Browser data was cleared at the start and at the end. No code was changed.
- **Not tested on purpose:** Vendor and Admin (Wave 2, not built yet). EN language toggle (G-3.0) and map view (C-1.3) are deferred by decision.

**Legend**
- Status: ✅ done as the spec says · 🟡 works, with a gap · 🔴 missing · ⬜ not built yet (Wave 2) · ⏸ deferred by decision
- States: ✅ works · 🟡 partly · ❌ missing · – spec doesn't ask for it (or needs Wave 2 data to show)
- % siap: ✅ = 1, 🟡 = ½. Deferred rows (⏸) are left out of the module %.

---

## 1. Summary by module

| Module | Features | ✅ Siap | 🟡 Sebahagian | 🔴 Tiada | % siap | Note |
| :-- | :-: | :-: | :-: | :-: | :-: | :-- |
| Akaun & Log masuk | 3 | 0 | 2 | 0 | 50% | Phone + OTP login works and returns you to where you were. Account page shows a fixed phone, no email, settings not saved. EN deferred. |
| Carian & Penapis | 5 | 1 | 3 | 0 | 63% | Search is strong. Missing filters: date free, guests (pax), halal. No District. Map deferred. |
| Banding vendor | 2 | 2 | 0 | 0 | 100% | Rows now differ per vendor, photo viewer, verdict chips, partner vote all work. |
| Profil vendor | 5 | 1 | 4 | 0 | 60% | Your own dates now show correctly. Missing: "New" tag, "Ask for quote", "1 slot left", WhatsApp share. |
| Tempahan & Deposit | 4 | 1 | 3 | 0 | 63% | Full lifecycle + deposit lock + "Tempah semula" work. No event/pax confirm, no spinner, no reminders. |
| Chat | 1 | 0 | 1 | 0 | 50% | Text, retry and phone-after-accept work. No photo sending. |
| Majlis Saya (planner + wizard + pakej cadangan + checklist) | 5 | 1 | 4 | 0 | 60% | Editing the date no longer wipes your checklist. Day 2 is saved but not shown. Planner → search isn't pre-filled. |
| Tabung | 2 | 1 | 1 | 0 | 75% | Plan, logging and payments agree with Planner. No reminders; "late" state can't be shown. |
| Kad Kahwin & RSVP | 2 | 1 | 1 | 0 | 75% | Editor, guest RSVP and list work. No "Belum jawab" count. |
| Inspirasi video | 7 | 4 | 3 | 0 | 79% | Deep links, share-to-video and like-after-login now work. Comments are basic; feed never ends. |
| Ulasan | 1 | 0 | 1 | 0 | 50% | Real-review rule works. No dispute link; review count doesn't go up. |
| Vendor (Wave 2) | 15 | 0 | 0 | 0 | 0% | ⬜ Belum (Wave 2) |
| Admin (Wave 2) | 8 | 0 | 0 | 0 | 0% | ⬜ Belum (Wave 2) |
| **Total** | **60** | **12** | **23** | **0** | | 2 deferred (⏸), 23 Wave 2 (⬜) |

---

## 2. Detailed table

States column order: **Biasa / Kosong / Loading / Ralat / Kes tepi**

### Akaun & Log masuk

| ID | Feature | Status | Biasa | Kosong | Loading | Ralat | Kes tepi | Where to see it | What's missing |
| :-- | :-- | :-: | :-: | :-: | :-: | :-: | :-: | :-- | :-- |
| G-2.0 | Register / Login | 🟡 | ✅ | ✅ | ❌ | ✅ | ❌ | `#/masuk` | No email + password option. No spinner on buttons. No "number already registered" path. |
| G-3.0 | BM / EN toggle | ⏸ | – | – | – | – | – | `#/akaun` ("EN · akan datang") | Deferred by decision. |
| C-6.0 | Profile & notifications | 🟡 | 🟡 | – | – | – | – | `#/akaun` | Phone is always "+60 12-345 6789" (not the number you logged in with). No email, avatar or edit. Switches reset. No "Video disukai". |

### Carian & Penapis

| ID | Feature | Status | Biasa | Kosong | Loading | Ralat | Kes tepi | Where to see it | What's missing |
| :-- | :-- | :-: | :-: | :-: | :-: | :-: | :-: | :-- | :-- |
| G-1.0 | Browse without login | 🟡 | 🟡 | ❌ | ✅ | ✅ | ✅ | `#/` logged out, `#/?demo=loading`, `#/?demo=error` | "Near you" is fixed to Shah Alam, not your location. No "location denied → pick state". Private pages now ask guests to log in ✅. |
| C-1.0 | Search vendors | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `#/cari?focus=1` | Small: the active category chip isn't scrolled into view. |
| C-1.1 | Location filter | 🟡 | ✅ | ✅ | ✅ | ❌ | ❌ | `#/cari` → Tapis; `#/cari?cat=inai&km=10` | Radius slider 10–150 km now ✅. No District. No "GPS denied" fallback. Distances are always from Shah Alam, even when the text says your event place. |
| C-1.2 | Filters & sort | 🟡 | 🟡 | ✅ | – | – | ❌ | `#/cari` → Tapis | Budget slider, rating 4+, sort, pills and live count work. **No date-free, guest-count or halal filter.** |
| C-1.3 | Map view | ⏸ | – | – | – | – | – | — | Deferred by decision (list + distance instead). |

### Banding vendor

| ID | Feature | Status | Biasa | Kosong | Loading | Ralat | Kes tepi | Where to see it | What's missing |
| :-- | :-- | :-: | :-: | :-: | :-: | :-: | :-: | :-- | :-- |
| C-1.4 | Compare vendors | ✅ | ✅ | ✅ | – | – | ✅ | `#/cari?cat=photo` → tick 3 → `#/banding` | Nothing important. |
| C-1.5 | Share & vote | ✅ | ✅ | ✅ | – | – | ✅ | `#/banding/kongsi?ids=7,12,13` | Votes stay on the same phone (prototype limit). |

### Profil vendor

| ID | Feature | Status | Biasa | Kosong | Loading | Ralat | Kes tepi | Where to see it | What's missing |
| :-- | :-- | :-: | :-: | :-: | :-: | :-: | :-: | :-- | :-- |
| C-2.0 | View vendor | 🟡 | ✅ | ❌ | ✅ | 🟡 | ❌ | `#/vendor/12`, `?demo=loading`, `?demo=error` | No "New on Majlis Hub" tag. Suspended vendor shows "not found", not "not available". Only 3 reviews shown of 88, no "see all". |
| C-2.1 | Packages | 🟡 | ✅ | ❌ | – | – | ❌ | `#/vendor/12` → Pakej | No "Ask for quote" when a vendor has no package. No "see full list" collapse. |
| C-2.2 | Availability | 🟡 | ✅ | – | – | – | ❌ | `#/vendor/7`, `/10`, `/11` → calendar | Your own booked / held / requested date now shows correctly ✅. No "1 slot left". Legend has no "held for you" entry. |
| C-2.3 | Reviews | ✅ | ✅ | ✅ | – | – | – | `#/vendor/29?tab=ulasan` | Hidden-review case needs Admin (Wave 2). |
| C-2.4 | Save / Share | 🟡 | 🟡 | – | – | – | ✅ | Heart on cards and profile; Kongsi on profile | Share only copies the link; no WhatsApp link with preview. Guest heart → login → saved ✅. |

### Tempahan & Deposit

| ID | Feature | Status | Biasa | Kosong | Loading | Ralat | Kes tepi | Where to see it | What's missing |
| :-- | :-- | :-: | :-: | :-: | :-: | :-: | :-: | :-- | :-- |
| C-4.0 | Send booking request | 🟡 | ✅ | – | ❌ | ✅ | ✅ | `#/vendor/29` → Hantar permintaan | Doesn't confirm event, place or guest count. No spinner on submit. Taken date → nearby dates ✅; duplicate blocked ✅. |
| C-4.1 | Track bookings | ✅ | ✅ | ✅ | – | – | ✅ | `#/tempahan`, `#/tempahan/B-1049` | Small: Planner says "5 aktif", list shows 4. |
| C-4.2 | Cancel request | 🟡 | ✅ | – | – | – | 🟡 | `#/tempahan/B-1042` → Batalkan | Shows vendor's policy after deposit ✅. No warning when cancelling less than 7 days before. |
| C-4.4 | Booking deposit | 🟡 | ✅ | 🟡 | ✅ | ✅ | 🟡 | `#/tempahan/B-1057`, `?fail=1`; lapsed `#/tempahan/B-1038` | Pay, fail + retry, receipt, "Tempah semula" ✅. No 14/7/3/1-day reminders. "≤3 days = red" can't be shown with demo data. |

### Chat

| ID | Feature | Status | Biasa | Kosong | Loading | Ralat | Kes tepi | Where to see it | What's missing |
| :-- | :-- | :-: | :-: | :-: | :-: | :-: | :-: | :-- | :-- |
| C-4.3 | Chat with vendor | 🟡 | 🟡 | ✅ | ✅ | ✅ | – | `#/mesej`, `#/mesej/13?net=off`, `#/mesej/7` | Can't send a photo. One thread per vendor, not per booking. Phone only after accept ✅ (lapsed hides it ✅). |

### Majlis Saya (planner + wizard + pakej cadangan + checklist)

| ID | Feature | Status | Biasa | Kosong | Loading | Ralat | Kes tepi | Where to see it | What's missing |
| :-- | :-- | :-: | :-: | :-: | :-: | :-: | :-: | :-- | :-- |
| C-3.0 | Create event | 🟡 | ✅ | – | – | ✅ | 🟡 | `#/majlis/baru` | Past date blocked ✅, edit pre-fills ✅. Day 2 is saved but not shown anywhere. Place is text, no map pin. Only one event. |
| C-3.0a | Suggested full package | 🟡 | ✅ | ✅ | ✅ | – | 🟡 | `#/majlis/baru` → step 4 | No "widen radius" when a category has no candidate. A fully-booked date is blamed on the budget. Swap shows 2 options, not 3. |
| C-3.1 | Planner dashboard | 🟡 | 🟡 | ✅ | – | – | ✅ | `#/majlis` | Money bar now counts confirmed spend ✅. Vendor shows as a name, no avatar. "Tempahan 5 aktif" vs 4 in the list. |
| C-3.2 | Find vendor from planner | 🟡 | 🟡 | – | – | – | ❌ | `#/majlis` → Cari | Opens the category only; date, guests and event place are not carried over. |
| C-3.3 | Custom checklist items | ✅ | ✅ | ✅ | – | – | – | `#/majlis` → Item sendiri | Items now survive a date change ✅. Linking an item to a vendor not built (minor). |

### Tabung

| ID | Feature | Status | Biasa | Kosong | Loading | Ralat | Kes tepi | Where to see it | What's missing |
| :-- | :-- | :-: | :-: | :-: | :-: | :-: | :-: | :-- | :-- |
| C-8.0 | Savings plan | ✅ | ✅ | ✅ | – | – | ✅ | `#/tabung` | Nothing important. Matches Planner and Tempahan. |
| C-8.1 | Log savings & pay instalment | 🟡 | ✅ | – | – | ✅ | 🟡 | `#/tabung` → Saya dah simpan / Bayar | Over-amount blocked ✅. "Instalment late" can't be shown with demo data. No reminders. |

### Kad Kahwin & RSVP

| ID | Feature | Status | Biasa | Kosong | Loading | Ralat | Kes tepi | Where to see it | What's missing |
| :-- | :-- | :-: | :-: | :-: | :-: | :-: | :-: | :-- | :-- |
| C-9.0 | Design digital card | ✅ | ✅ | ✅ | – | ✅ | ✅ | `#/kad` | Small: preview is not inside a phone frame. Kad now follows a changed event date ✅. |
| C-9.1 | Share & RSVP | 🟡 | ✅ | ✅ | – | ✅ | 🟡 | `#/jemputan`, `#/jemputan?closed=1`, `#/kad/rsvp` | No "Belum jawab" count. "Too many guests" warning only on the RSVP list, not in Majlis Saya. |

### Inspirasi video

| ID | Feature | Status | Biasa | Kosong | Loading | Ralat | Kes tepi | Where to see it | What's missing |
| :-- | :-- | :-: | :-: | :-: | :-: | :-: | :-: | :-- | :-- |
| C-7.0 | Video feed | 🟡 | ✅ | ✅ | ✅ | ✅ | ❌ | `#/inspirasi?v=3`, `?demo=loading`, `?demo=error` | Feed loops forever (no "Anda dah tengok semua"). Only 3 videos. No ranking by distance. |
| C-7.1 | Video details | ✅ | ✅ | – | – | – | ✅ | `#/inspirasi` | — |
| C-7.2 | Like | 🟡 | 🟡 | – | – | – | ✅ | `#/inspirasi` (double-tap) | Guest like → login → like applied ✅. No "Video disukai" list in Account. |
| C-7.3 | Comments | 🟡 | 🟡 | ✅ | ❌ | ❌ | 🟡 | `#/inspirasi` → Komen | Can't like or report a comment. No bad-word filter. No loading or "failed to send" state. |
| C-7.4 | Share | ✅ | ✅ | – | – | – | ✅ | `#/inspirasi` → Kongsi | Link now opens that exact video ✅. |
| C-7.5 | Video → booking | ✅ | ✅ | – | – | – | – | `#/inspirasi` → Lihat pakej | Suspended-vendor case needs Admin (Wave 2). |
| C-7.6 | Report video | ✅ | ✅ | – | – | – | – | `#/inspirasi` → ⋯ | Admin queue is Wave 2. |

### Ulasan

| ID | Feature | Status | Biasa | Kosong | Loading | Ralat | Kes tepi | Where to see it | What's missing |
| :-- | :-- | :-: | :-: | :-: | :-: | :-: | :-: | :-- | :-- |
| C-5.0 | Leave review | 🟡 | ✅ | – | – | ✅ | ❌ | `#/tempahan/B-0988` → Tulis ulasan | Only completed bookings can review ✅. No "not completed" dispute link. Review count stays the same after posting. |

### Vendor (Wave 2)

| ID | Feature | Status | Biasa | Kosong | Loading | Ralat | Kes tepi | Where to see it | What's missing |
| :-- | :-- | :-: | :-: | :-: | :-: | :-: | :-: | :-- | :-- |
| V-1.0 | Onboarding: business info | ⬜ Belum (Wave 2) | – | – | – | – | – | — | Not built |
| V-1.1 | Onboarding: service area | ⬜ Belum (Wave 2) | – | – | – | – | – | — | Not built |
| V-1.2 | Onboarding: documents | ⬜ Belum (Wave 2) | – | – | – | – | – | — | Not built |
| V-1.3 | Onboarding: profile & packages | ⬜ Belum (Wave 2) | – | – | – | – | – | — | Not built |
| V-2.0 | Dashboard overview | ⬜ Belum (Wave 2) | – | – | – | – | – | — | Not built |
| V-3.0 | Booking requests table | ⬜ Belum (Wave 2) | – | – | – | – | – | — | Not built |
| V-3.1 | Accept / Decline | ⬜ Belum (Wave 2) | – | – | – | – | – | — | Not built (customer side has a "Simulasi: vendor terima" button) |
| V-3.2 | Mark completed | ⬜ Belum (Wave 2) | – | – | – | – | – | — | Not built |
| V-4.0 | Manage availability | ⬜ Belum (Wave 2) | – | – | – | – | – | — | Not built |
| V-5.0 | Edit listing & packages | ⬜ Belum (Wave 2) | – | – | – | – | – | — | Not built |
| V-6.0 | Reply to reviews | ⬜ Belum (Wave 2) | – | – | – | – | – | — | Not built |
| V-7.0 | Chat with customers | ⬜ Belum (Wave 2) | – | – | – | – | – | — | Not built |
| V-8.0 | Upload video | ⬜ Belum (Wave 2) | – | – | – | – | – | — | Not built |
| V-8.1 | Manage videos & insights | ⬜ Belum (Wave 2) | – | – | – | – | – | — | Not built |
| V-9.0 | Deposit & instalment rules | ⬜ Belum (Wave 2) | – | – | – | – | – | — | Not built |

### Admin (Wave 2)

| ID | Feature | Status | Biasa | Kosong | Loading | Ralat | Kes tepi | Where to see it | What's missing |
| :-- | :-- | :-: | :-: | :-: | :-: | :-: | :-: | :-- | :-- |
| A-1.0 | Platform KPIs | ⬜ Belum (Wave 2) | – | – | – | – | – | — | Not built |
| A-2.0 | Verification queue | ⬜ Belum (Wave 2) | – | – | – | – | – | — | Not built |
| A-2.1 | Review a vendor | ⬜ Belum (Wave 2) | – | – | – | – | – | — | Not built |
| A-3.0 | Manage vendors | ⬜ Belum (Wave 2) | – | – | – | – | – | — | Not built |
| A-4.0 | Monitor bookings | ⬜ Belum (Wave 2) | – | – | – | – | – | — | Not built |
| A-5.0 | Moderate review reports | ⬜ Belum (Wave 2) | – | – | – | – | – | — | Not built |
| A-6.0 | Categories & content | ⬜ Belum (Wave 2) | – | – | – | – | – | — | Not built |
| A-7.0 | Video & comment moderation | ⬜ Belum (Wave 2) | – | – | – | – | – | — | Not built |

---

## 3. Totals

```
Customer side (Guest + Customer, 35 rows, 2 deferred left out)
  ✅ 12 · 🟡 23 · 🔴 0          (12 + 23×½) / 35 = 23.5 / 35 = 67%   █████████████░░░░░░░

Full spec (all 60 rows; Wave 2 and deferred count 0)
  23.5 / 60 = 39%                                                     ████████░░░░░░░░░░░░

Stakeholder 10 points                                                 10 / 10
```

Up from 63% at the last PM audit (v2). Moved to ✅ this round: Compare (C-1.4), Share & vote (C-1.5), Video share (C-7.4). The 3 blockers from that audit (guests seeing private pages, your own date shown as "taken", phone shown on a lapsed booking) are fixed. So is the QA blocker (a date change wiping the checklist).

**Stakeholder 10 points**

| # | Point | Result | Note |
| :-: | :-- | :-: | :-- |
| 1 | Talent first, 8 categories | ✅ | Exactly the 8 talent categories |
| 2 | Cari is a real search | ✅ | Opens on "Semua", BM/EN keywords work |
| 3 | Budget slider | ✅ | Two handles, histogram, RM 100 steps, live count |
| 4 | Richer compare + share & vote | ✅ | Deposit, instalments, policy and package contents now differ; photo viewer; votes show |
| 5 | Suggested package you can change | ✅ | Swap, remove, split, live total |
| 6 | Kad kahwin + RSVP | ✅ | Guest RSVP without login, list updates |
| 7 | Bride Assistant category | ✅ | "pengapit" finds it |
| 8 | 30-day deposit, date held | ✅ | Your own hold now shows "ditahan untuk anda"; lapsed → "Tempah semula". Reminders not built |
| 9 | Tabung (tracker, no wallet) | ✅ | Agrees with Planner and Tempahan |
| 10 | Short video (Inspirasi) | ✅ | Feed, like, comment, share, report, "Lihat pakej" |

---

## 4. Top 5 remaining gaps (priority order)

1. **Search filters missing and distance is misleading (C-1.2, C-1.1, C-3.2).** No "free on my date", guest-count or halal filter. Distances are always from Shah Alam, while the text says "from your event place". Planner → Cari doesn't carry the date, guests or place.
2. **Account page looks fake (C-6.0, C-7.2).** The phone is always "+60 12-345 6789" whatever number logs in. No email, avatar or edit. Notification switches reset. No "Video disukai" list.
3. **Booking and deposit polish (C-4.0, C-4.2, C-4.4, C-8.1).** The request doesn't confirm event, place or guests, and there's no spinner. No warning when cancelling within 7 days. No deposit or instalment reminders. "≤3 days left = red" and "instalment late" can't be shown with the demo data.
4. **Vendor profile trust details (C-2.0, C-2.1, C-2.2, C-2.4, C-5.0).** Missing: "New on Majlis Hub" tag, "Ask for quote", "1 slot left", a proper "not available" page, WhatsApp share with preview, "see all reviews", a review dispute link. The review count doesn't go up after you post.
5. **Inspirasi comments and feed end (C-7.0, C-7.3).** Can't like or report a comment, no bad-word filter, no loading or "failed to send" state. The feed loops forever and has only 3 videos.

**Small fixes worth doing with these:** Planner "5 aktif" vs 4 in the list. Wizard blames the budget when the date is fully booked. Day 2 of a 2-day majlis is saved but never shown. Active category chip isn't scrolled into view. No "Belum jawab" RSVP count.
