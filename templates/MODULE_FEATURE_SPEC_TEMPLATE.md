# MODULE & FEATURE SPECIFICATION MATRIX (SOFTWARE HOUSE STANDARD)

**Project Name:** [Project Name, e.g. Commercial Accounting System / Training Portal / E-Com Platform]  
**Document Version:** 1.0  
**Target Platform:** [Web App / Desktop / Mobile]  
**Dynamic Role Scoping:** [List of Personas, e.g. User Register, User Business, Staff, Admin, Super Admin]  

---

## 1. Executive Summary & Core Entity Lifecycle
* **Core Business Problem:** [What problem does this software solve?]
* **Core Entity & Lifecycle Spine:**  
  `[Initial State, e.g. Draft / Requested]` ➔ `[Processing State, e.g. Pending Approval / In-Progress]` ➔ `[Final State, e.g. Posted / Completed]` ➔ `[Exception State, e.g. Voided / Cancelled]`
* **Immutability & Audit Rule:** [Define which finalized records cannot be directly edited/deleted and require reversing audit entries].

---

## 2. UI/UX Designer Scoping Advisory ("Master Screen → Clone & Tweak")

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. MASTER SCREENS (Design from Scratch ~12-15 Screens):                                     │
│    • 1 Master Data Table (with Search, Filter Pills, Action Icons, Pagination, Export)      │
│    • 1 Master Full Form Editor (with line-items table, dynamic totals, action buttons)      │
│    • 1 Master Slide-out Drawer Form (for Quick Add/Edit)                                    │
│    • 1 Master Onboarding Stepper Modal (4-step wizard)                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 2. CLONED VARIANTS (Component Toggles in Figma):                                            │
│    • [Staff View]: Clone Master Screen, hide [Modules X, Y] in Sidebar, toggle [Button Z]  │
│    • [Table Variant]: Clone Master Table, hide [Cost/Margin Column] for Sales Staff         │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Master Role-Based Feature Matrix (Enterprise UAT Standard)

### Tab / Persona 1: [e.g. User Register & Onboarding]
| No | Module | Features / Action | UI/UX Explanation & Screen Behavior | UI Component / Micro-Detail | 5 States (Ideal, Empty, Loading, Error, Edge) | Tester | Comments |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **1.0** | **Register** | User Registration | User inserts Name, Email, Phone, and Password. Eye icon toggles password visibility. | Sign Up Form Card | **Ideal:** Form loaded<br>**Empty:** Initial<br>**Loading:** Spinner<br>**Error:** Inline red validation<br>**Edge:** Existing email alert | `PASS` | Hyperlink to T&C |
| **2.0** | **Setup Wizard** | Step 1: Profile | User fills Company/Entity Name, Registration #, and uploads Logo. | Drag-and-Drop Uploader | **Ideal:** Image preview<br>**Empty:** Default placeholder<br>**Loading:** Uploading %<br>**Error:** Max 2MB limit<br>**Edge:** Non-image format blocked | `PASS` | PNG/JPG max 2MB |

### Tab / Persona 2: [e.g. User Business / Operational Staff]
| No | Module | Features / Action | UI/UX Explanation & Screen Behavior | UI Component / Micro-Detail | 5 States (Ideal, Empty, Loading, Error, Edge) | Tester | Comments |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **1.0** | **Dashboard** | Operational KPIs | Displays operational summary cards (My Sales, Open Tasks, Unpaid Items). | Metric Cards Grid | **Ideal:** Real figures<br>**Empty:** Zero count<br>**Loading:** Skeleton<br>**Error:** Retry button<br>**Edge:** 7-digit currency wrap | `PASS` | *Financial profit hidden* |
| **2.0** | **Main List** | Search & Filter Bar | Search bar with live auto-complete. Filter dropdowns for Date Range and Status pills. | Filter Bar Component | **Ideal:** Filtered results<br>**Empty:** No matches illustration<br>**Loading:** Shimmer table<br>**Error:** Error toast<br>**Edge:** 500+ records pagination | `PASS` | Reset filter button |
| **2.1** | **Main List** | Action Column | Row action icon buttons: View Detail (Eye), Edit (Pencil), Delete (Trash), or 1-Click Convert. | Icon Action Group | **Ideal:** Icons visible<br>**Empty:** N/A<br>**Loading:** Disabled<br>**Error:** Error dialog<br>**Edge:** Restricted role grayed-out | `PASS` | Confirmation modal on delete |

### Tab / Persona 3: [e.g. Admin / Business Owner]
| No | Module | Features / Action | UI/UX Explanation & Screen Behavior | UI Component / Micro-Detail | 5 States (Ideal, Empty, Loading, Error, Edge) | Tester | Comments |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **1.0** | **Approvals** | Approvals Queue | Central task inbox showing items submitted by staff waiting for manager approval. | Task Queue Table | **Ideal:** List of pending items<br>**Empty:** All caught up graphic<br>**Loading:** Skeleton<br>**Error:** Banner<br>**Edge:** Bulk approve 20+ items | `PASS` | Green Approve vs Red Reject with reason |
| **2.0** | **Team & RBAC** | User Management | List of team members with assigned roles. '+ Invite User' opens slide-out drawer form. | Users Table + Drawer | **Ideal:** Active members<br>**Empty:** Zero invites<br>**Loading:** Shimmer<br>**Error:** Toast error<br>**Edge:** Resend expired invite | `PASS` | Role permission checkboxes |

---

## 4. Settings Hierarchy

| Setting Level | Target Persona | Accessible Features |
| :--- | :--- | :--- |
| **👤 My Profile & Account** | **ALL Users** (Admin + Staff) | Name, Avatar, Password change, 2FA, Language, Light/Dark theme, Notifications. |
| **🏢 Business & System Settings** | **Admin / Owner ONLY** | Legal Name, BRN, Base Currency, Fiscal Year, Payment Gateway, Regional Taxes, Multi-Entity. |
