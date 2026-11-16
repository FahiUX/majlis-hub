# 📋 WEEV Product Requirements Document (PRD)

**Product Name:** WEEV  
**Brand Meaning:** Wedding & Event + "Weave" (Interweaving vendors, couples, and families into seamless celebration)  
**Version:** 2.0 (Multi-Cultural Celebration Marketplace)  
**Status:** In Active Development (Wave 2)  
**Target Market:** Malaysia (Nationwide, starting with Klang Valley, Penang, and Johor)

---

## 1. Executive Summary & Vision

Planning a wedding or major celebration in Malaysia involves high emotional and financial stakes (average wedding budget RM 30,000 – RM 120,000). The current market relies on fragmented social media pages (Instagram, TikTok, WhatsApp) where pricing is opaque ("PM for price"), verification is non-existent, and couples face severe fraud risks regarding lost deposits.

**WEEV** is an inclusive, multi-cultural event marketplace and planning operating system. It brings together Malay, Chinese, Indian, and Western wedding traditions under a unified standard of **verified credentials, transparent pricing, milestone payment protection, and collaborative guest management**.

---

## 2. Target Audiences & Personas

### Primary Persona: The Modern Malaysian Couple (Aina & Amir / Rachel & Marcus / Priya & Arjun)
* **Age:** 25 – 36 years old. Mobile-first digital natives.
* **Pain Points:** 
  - Spending weeks asking vendors for price quotes via WhatsApp.
  - Fear of paying non-refundable 50% cash deposits to unverified Instagram vendors.
  - Difficulty tracking multi-vendor payment deadlines across 6–12 months.
  - Managing family expectations and guest RSVPs across scattered messaging apps.
* **Goals:** Quick transparent comparison, guaranteed booking slots, protected deposits, and stress-free RSVP tracking.

### Secondary Persona: The Verified Vendor (Zul Wedding Studio / Elegant Florals / DJ Mohan)
* **Profile:** Boutique studios, verified freelancers, and established banquet halls.
* **Pain Points:** Endless low-intent inquiries asking "PM harga", late milestone payments from couples, ghosting after contracts are drafted.
* **Goals:** High-intent qualified inquiries, automated deposit schedules, verified portfolio showcase, and reliable business management.

---

## 3. Core Value Propositions

1. **Zero "PM for Price":** Every listed vendor displays real starting rates, transparent package inclusions, and clear pax pricing.
2. **SSM & IC Identity Verification:** Strict verification by the WEEV editorial team before any vendor can accept customer bookings.
3. **Milestone Escrow Protection:** Deposits are tied to verifiable schedule milestones (booking lock, pre-event check-in, event completion).
4. **Multi-Cultural Celebration Support:** Tailored category taxonomies that respect diverse Malaysian wedding traditions (Pelamin, Akad Nikah, Tea Ceremony, Sangeet, Black-Tie Reception).
5. **Collaborative Planning Tools:** Built-in Tabung savings tracker, comparative voting links for WhatsApp family groups, and digital RSVP invitation cards.

---

## 4. Key Functional Modules

### 4.1 Customer Marketplace (`/`)
* **Discovery & Search:** Multi-faceted filter by category, location radius (KM), budget tier, rating (4.0+), and verified badge.
* **Side-by-Side Comparison (`/banding`):** Compare up to 3 vendors simultaneously across deposit terms, cancellation policies, response time, and package features.
* **WhatsApp Voting Link (`/undi`):** Couples can generate a public voting URL where bridal party members can vote on shortlisted vendors without logging in.
* **Vendor Profiles (`/vendor/:id`):** Real photo portfolios, package breakdowns, direct WhatsApp inquiries, and verified customer reviews.

### 4.2 Planning & Milestone Management (`/majlis`)
* **Event Countdown:** Radial progress ring tracking category completion towards wedding day.
* **Category Checklist:** 6 core verticals (Catering, Photography & Video, Emcee/DJ, Venue/Dewan, Pelamin & Decor, Makeup/Bridal).
* **Booking Pipeline:** Status transitions: `requested` → `accepted` → `confirmed` → `completed` → `reviewed`.

### 4.3 Tabung Savings Calculator (`/tabung`)
* **Dynamic Budget Deficit Tracking:** Calculates remaining balance required across all booked vendor installments.
* **Monthly Savings Targets:** Automatically computes monthly savings targets rounded to RM 10.
* **Bank Neutrality:** Clarifies that funds remain in the user's personal bank account; WEEV provides calculation and milestone reminders.

### 4.4 Kad & Digital RSVP Suite (`/kad`)
* **Live Customizer:** Digital invitation card with customizable background themes, couple typography, event details, and itinerary schedules.
* **Real-time RSVP Manager:** Instant guest responses (Hadir / Tidak Hadir), pax headcounts, dietary restrictions, and CSV export.

### 4.5 Vendor Operating Console (`/v`)
* **Inquiry & Booking Inbox:** Manage incoming customer requests, review dates, accept or decline proposals with reason tags.
* **Package & Availability Manager:** Add package tiers, block booked calendar dates, and update capacity limits.
* **Verification Onboarding:** Step-by-step document upload for SSM business registration and NRIC identity cards.

### 4.6 WEEV Platform Administration (`/admin`)
* **Verification Queue:** Review vendor business submissions, inspect uploaded documents, and approve or reject with feedback.
* **Editorial Curation:** Curate featured vendors ("Pilihan WEEV") displayed on the consumer home screen.
* **Audit Trail:** Comprehensive logging of administrative actions, status suspensions, and platform configurations.

---

## 5. Non-Functional Requirements & Constraints

* **Mobile-First UX:** Tailored specifically for 430px mobile viewport with responsive scale to desktop (1440px).
* **Zero Visible Scrollbars:** Smooth touch scrolling with `scrollbar-width: none` across all views.
* **Zero Broken Back Navigation:** Every back navigation button preserves history stack and returns to the exact previous view.
* **WCAG 2.2 AA Accessibility:** Strict contrast standards (Imperial Merlot on white = 9.8:1 AAA; Champagne Gold text on white = 5.4:1 AA).
* **Client-Side Simulation:** Rapid prototyping with optimistic state persistence in `localStorage` (`majlishub.v4`). Zero backend latency during demo.
