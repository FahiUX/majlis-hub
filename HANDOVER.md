# WEEV — Project Handover & Next Steps

> **Date:** 16 November 2026 (17:00 MYT)  
> **Repository:** [`FahiUX/majlis-hub`](https://github.com/FahiUX/majlis-hub) (Branch: `main`)  
> **Active Port:** `4174` (Static Preview), `5173` (React Vite App)  
> **Primary Design Tool:** VectorCraft Desktop App (Socket port `7979`)  

---

## 1. Executive Summary & Session Pivot

During today's session, the brand underwent a major strategic pivot based on direct stakeholder feedback:

* **Initial Work (Discarded/Archived):**
  Explored three royal heritage concepts (Concept A: Sovereign Lotus, Concept B: Eternal Swash Serif, Concept C: Crown Knot) with an Imperial Merlot (`#481226`) and Chiseled Champagne Gold (`#E5BE64`) aesthetic. 
  * **Stakeholder Verdict:** **Rejected.** The stakeholder found it too formal, traditional, and bridal/jewelry-like rather than feeling like a modern, scalable tech platform and community ecosystem.

* **New Stakeholder-Approved Direction:**
  The stakeholder provided and approved a **vibrant, modern, friendly mascot-driven tech identity** (`Screenshot 2026-11-16 at 4.49.24 PM.png`):
  1. **Mascot ("The Brain" / Smart Event Planner):**
     * A cool pink cartoon brain wearing dark sunglasses, smiling confidently.
     * Holding two interlocking golden wedding rings in its right hand (**Weddings**).
     * Holding a star calendar schedule in its left hand (**Events**).
     * Cartoon white gloves and energetic sparkle accents.
     * Communicates intelligence, AI matching, stress-free planning, and playful reassurance.
  2. **Wordmark ("weev"):**
     * Friendly, bold, rounded chubby lowercase wordmark.
     * The initial **'W' is custom-sculpted as an organic Heart**, featuring an inner pink heart cut-out and an energetic diagonal pink sash/ribbon.
  3. **Tagline & Positioning:**
     * Subtitle: `Wedding • Event` (Aubergine with Bubblegum Pink bullet).
     * Tagline: `— Find Your People. Make It Happen. —`
     * Communicates community, vendor discovery, and execution.

---

## 2. Official Brand Palette Tokens

| Swatch | Color Name | Hex Code | Usage |
| :---: | :--- | :--- | :--- |
| <span style="display:inline-block;width:24px;height:24px;background:#2E1741;border-radius:4px;"></span> | **Royal Aubergine** | `#2E1741` | Primary ink, wordmark, sunglasses frame, line art, dark text |
| <span style="display:inline-block;width:24px;height:24px;background:#DB619B;border-radius:4px;"></span> | **Bubblegum Pink** | `#DB619B` | Heart 'W' cut-out, wedding sash, bullet dot, secondary CTA |
| <span style="display:inline-block;width:24px;height:24px;background:#E396B1;border-radius:4px;"></span> | **Brain Pink** | `#E396B1` | Mascot character body fill |
| <span style="display:inline-block;width:24px;height:24px;background:#E8B536;border-radius:4px;"></span> | **Sunshine Gold** | `#E8B536` | Wedding rings, calendar star, energy spark accents |
| <span style="display:inline-block;width:24px;height:24px;background:#FFFFFF;border:1px solid #ddd;border-radius:4px;"></span> | **Pristine White** | `#FFFFFF` | Cartoon gloves, calendar paper, sunglasses gloss |
| <span style="display:inline-block;width:24px;height:24px;background:#FAF7EF;border:1px solid #ccc;border-radius:4px;"></span> | **Warm Linen** | `#FAF7EF` | Background surface canvas, cards, app background |

---

## 3. Generated Production Assets Inventory

All vector files have been generated, verified, and pushed to the repository under `preview/logos/`:

### Master Brand Lockup
* **Pure SVG:** [`preview/logos/weev-mascot-master.svg`](preview/logos/weev-mascot-master.svg)
* **Transparent SVG:** [`preview/logos/weev-mascot-transparent.svg`](preview/logos/weev-mascot-transparent.svg)
* **VectorCraft Native (.vectorcraft):** [`preview/logos/weev-mascot-master.vectorcraft`](preview/logos/weev-mascot-master.vectorcraft)
* **Adobe Illustrator (.ai):** [`preview/logos/weev-mascot-master.ai`](preview/logos/weev-mascot-master.ai)
* **Vector PDF (.pdf):** [`preview/logos/weev-mascot-master.pdf`](preview/logos/weev-mascot-master.pdf)
* **Vector EPS (.eps):** [`preview/logos/weev-mascot-master.eps`](preview/logos/weev-mascot-master.eps)
* **High-Res PNG (2x):** [`preview/logos/weev-mascot-master.png`](preview/logos/weev-mascot-master.png)
* **Transparent PNG (2x):** [`preview/logos/weev-mascot-transparent.png`](preview/logos/weev-mascot-transparent.png)

### App Icons & Marks
* **Mascot App Icon (512x512 SVG):** [`preview/logos/weev-app-icon-mascot.svg`](preview/logos/weev-app-icon-mascot.svg)
* **Mascot App Icon (PNG):** [`preview/logos/weev-app-icon-mascot.png`](preview/logos/weev-app-icon-mascot.png)
* **Heart 'W' Favicon (512x512 SVG):** [`preview/logos/weev-app-icon-heart.svg`](preview/logos/weev-app-icon-heart.svg)
* **Heart 'W' Favicon (PNG):** [`preview/logos/weev-app-icon-heart.png`](preview/logos/weev-app-icon-heart.png)

### Code & Component Integration
* **React Component:** [`src/components/WeevLogo.tsx`](src/components/WeevLogo.tsx)
  * Supports `variant="full"` (Master lockup)
  * Supports `variant="mark"` (Heart 'W' monogram)
  * Supports `variant="mascot"` (Mascot head icon)
  * Supports `size` (custom px height) and `light` mode.

---

## 4. How to Continue at Home

### A. Start Development Server
```bash
git pull origin main
npm install
npm run dev
```
Access the React 19 customer application at `http://localhost:5173`.

### B. View Brand Showcase & History
```bash
python3 -m http.server 4174
```
Open `http://localhost:4174/preview/logo-evolution.html` to review all iterations from initial concepts to the final mascot identity.

### C. Edit Vectors in VectorCraft Desktop App
1. Open the VectorCraft app on your machine.
2. Open [`preview/logos/weev-mascot-master.vectorcraft`](preview/logos/weev-mascot-master.vectorcraft) directly from File > Open, or via the CLI:
   ```bash
   vectorcraft-cli convert preview/logos/weev-mascot-master.svg preview/logos/weev-mascot-master.vectorcraft
   ```

---

## 5. Recommended Next Steps for Tomorrow / Home Session

1. **Custom Vector Redraw (Refining beyond trace):**
   * The current vector is a multi-layered segmented trace of the stakeholder's image reference.
   * Handcraft custom, bespoke bezier curves for the mascot's gloves, sunglasses, and letterforms in VectorCraft or Illustrator to make the line art 100% production-bespoke and unique.
2. **Horizontal Navbar Lockup:**
   * Create an ultra-compact horizontal lockup: Small Mascot Head (or Heart 'W') on the left + "weev" wordmark + "Wedding • Event" on one line (height: 36px–44px) for the website header.
3. **Mascot Pose Library for App States:**
   * **Success / Booking Confirmed:** Mascot celebrating with confetti.
   * **Budget Calculator / Tabung:** Mascot holding a calculator or coins.
   * **Empty State / Search Zero Results:** Mascot peeking with magnifying glass.
   * **Error / 404:** Mascot scratching its head with sunglasses tilted down.
4. **App Theme Color Pass:**
   * Replace remaining legacy green/gold classes in Tailwind config with the new tokens (`#2E1741`, `#DB619B`, `#FAF7EF`).
