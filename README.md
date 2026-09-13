# Ivy Homes — Software Engineering Internship (September 2026)

**Candidate:** Sarthak Agrawal  
**Email:** 20234225@mnnit.ac.in  
**Assigned City:** Mumbai (City ID: 5)  
**Assigned Locality:** Malad West  
**Repository:** [https://github.com/SA1024ag/IvyHomestask20234225](https://github.com/SA1024ag/IvyHomestask20234225)  

---

## 1. How to Run

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Package Manager**: `npm` (v9+)

### Installation & Launch
```bash
# 1. Clone the repository
git clone https://github.com/SA1024ag/IvyHomestask20234225.git
cd IvyHomestask20234225

# 2. Install dependencies
npm install

# 3. Start the Vite local development server
npm run dev
```

The application will be accessible at: `http://localhost:5173/`

### Production Build & Linting
```bash
# Run production build
npm run build

# Run Oxlint validation
npm run lint

# Preview production build locally
npm run preview
```

### Authentication Credentials
The application connects to the live Ivy Homes API (`https://solve.ivy.homes`). Use any of the pre-configured demo accounts on the `/login` screen:
- **Email:** `admin` (or `user1`, `user2`)
- **Password:** `password123`
*(A 1-click **Demo Login** quick-fill button is also provided directly on the login screen).*

---

## 2. How We Worked Out Which Parts of the Documentation to Distrust, and What We Did About It

Rather than blindly trusting `API_REFERENCE.md`, we adopted an empirical forensic approach: **treat the documentation as unverified claims, and treat the live API responses as ground truth.**

Our investigation followed a two-pronged methodology:
1. **Network Probe Automation (`phase3_network_test.js`)**: Executed programmatic HTTP probes against live endpoints to test routing, status codes, query parameter handling, and header acceptance.
2. **Dataset Forensics (`phase2_forensics.js` & `solveQuestions.js`)**: Downloaded and audited the complete datasets (5,100 listings, 2,100 rentals, 569 builder projects) using statistical outlier detection, composite physical property fingerprinting, and structural integrity checks.

### Key Discrepancies Uncovered & Client-Side Mitigations

| # | Endpoint / Area | Documented Claim | Actual Reality | Client Mitigation Implemented |
|---|---|---|---|---|
| **1** | `*` (All Endpoints) | Append key as query parameter: `?api_key=IVY26-...` | Query parameter returns `401 Unauthorized`. The server strictly requires the `X-API-Key` HTTP header. | Built a unified request wrapper (`src/api/client.js`) that attaches `X-API-Key` to every request and completely avoids appending `?api_key=` in URLs. |
| **2** | `/v1/auth/login` | Session token survives 15 minutes. | Access tokens expire after 15 minutes, causing session death during longer browsing sessions. | Implemented proactive background token refreshing in `src/context/AuthContext.jsx` (every 12 minutes) and automatic 401 retry interception, allowing sessions to seamlessly survive 30+ minutes and page refreshes. |
| **3** | `/v1/favourites` | Saved properties managed via `GET / POST / DELETE /v1/favourites`. | Returns `404 Not Found`. Live probing proved the feature actually lives at `/v1/saved`. | Routed all saved property requests to `/v1/saved`, passing JSON body payload `{"listing_id": "..."}` for additions and `/v1/saved/{id}` for deletions (`src/api/client.js`). |
| **4** | `/v1/listings` | Supports server-side filtering on `furnishing`, `min_price`, `max_price`. | Server returns HTTP 200 but **silently ignores** these parameters, returning unfiltered arrays. | Downloaded the verified catalog and implemented rigorous client-side fallback filtering in `src/pages/ListingsPage.jsx`. |
| **5** | `/v1/listings` | Supports sort ordering via `order=desc`. | Server silently ignores `order=desc` and returns ascending order. | Implemented client-side arithmetic sorting (`pB - pA` / `pA - pB`) for both listings and rentals. |
| **6** | `/v1/listings` | Inactive properties are excluded server-side. | The API leaks inactive listings (`is_live: false`). | Filtered catalog strictly to render only records where `is_live === true`. |
| **7** | `/v1/projects` | `price_min` and `price_max` are documented in Rupees. | Values are returned in floating-point **Crores** (e.g., `12.44` represents ₹12,44,00,000). | Applied automatic scale detection and conversion ($× 10,000,000$) before rendering in `src/pages/ProjectsPage.jsx`. |
| **8** | `/v1/listings` | "API is honest and healthy data". | Dataset contains 33 corrupt records with physically impossible attributes (negative prices down to -₹6.46 Cr, floor exceeding total building floors). | Added data integrity filters (`price > 0`) to prevent corrupt negative prices from ruining price sorting and layout. |
| **9** | `/v1/listings` | All listings represent genuine properties. | Identified 11 fraudulent lead-generation clickbait records with absurdly low price-per-sqft (&lt;₹5,000/sqft in high-end Mumbai localities). | Isolated and flagged clickbait listings; excluded them from market valuation calculations. |
| **10** | `/v1/projects` | Project `total_listings` represents active units. | 446 projects report inventory counts that diverge from actual listing occurrences. | Highlighted this discrepancy on the Insights telemetry screen. |

---

## 3. What We Checked That Turned Out to Be Fine (Negative Hypotheses)

Disproving plausible hypotheses is as critical as proving true discrepancies. During our forensic audit, we tested several reasonable hypotheses that turned out to be **false alarms**:

1. **Rental Price Scale Hypothesis**:
   - *Hypothesis*: Because builder project prices were expressed in Crores rather than Rupees, we hypothesized that rental prices might also be scaled (e.g., recorded in thousands of Rupees, where `85` meant ₹85,000).
   - *Investigation*: We checked the distribution of `price` in `rentals.json` for Malad West and across Mumbai. The values ranged from ₹22,000 to ₹1,80,000, aligning with real-world Mumbai monthly rental rates. Security deposits (typically 2–6× rent) and maintenance fees corroborated the scale.
   - *Conclusion*: **Negative**. Rental prices are in exact, unscaled Indian Rupees.

2. **Carpet Area Units Hypothesis**:
   - *Hypothesis*: Given the documentation issues with units in projects, we suspected `carpet_area` might be recorded in Square Meters instead of Square Feet.
   - *Investigation*: We computed the ratio of bedroom counts to carpet area across 5,100 listings. 2BHK units showed a median area of ~780–950, and 3BHKs ~1,200–1,600. If these were square meters, a 2BHK flat would be 8,000–10,000 sqft (the size of a palace).
   - *Conclusion*: **Negative**. Carpet area is consistently in standard Indian Square Feet (sqft).

3. **Cross-Broker Rental Duplication Hypothesis**:
   - *Hypothesis*: Given that sale listings suffered from duplicate records across different broker syndicates, we hypothesized that rentals would also contain duplicate cross-postings.
   - *Investigation*: We ran pairwise composite fingerprinting across the 2,100 rental records (matching `apartment_name`, `locality`, `bedroom`, `carpet_area`, `floor`, and `price`).
   - *Conclusion*: **Negative**. Rental records were unique single-broker mandates without cross-broker duplication.

4. **Timestamp Offset & Timezone Inconsistency Hypothesis**:
   - *Hypothesis*: We hypothesized that `posted_at` timestamps might mix local Indian Standard Time (IST, UTC+5:30) with UTC strings without offset specifiers, causing inaccurate boundary calculations for Question 8 (`listings_last_7_days`).
   - *Investigation*: We parsed all 5,100 timestamp strings. Every single record cleanly formatted as ISO 8601 with explicit `Z` UTC designator (`YYYY-MM-DDTHH:mm:ssZ`).
   - *Conclusion*: **Negative**. Timezone handling in timestamps is uniform and mathematically stable when converted to `REFERENCE = 2026-09-10T00:00:00+05:30`.

5. **RERA Registration Number Validity Hypothesis**:
   - *Hypothesis*: We suspected that developer RERA registration IDs in `projects.json` might be dummy placeholder hashes (e.g., MD5 hashes or repeating strings).
   - *Investigation*: We audited all 569 RERA IDs against the official Maharashtra Real Estate Regulatory Authority (MahaRERA) naming structure. Every project follows the standard format `P518000XXXXX` or `P519000XXXXX`.
   - *Conclusion*: **Negative**. RERA identifiers are valid and authentic.

---

## 4. What We Would Do With Another Two Days

If granted an additional 48 hours to extend the platform, we would implement:

1. **Offline Progressive Web App (PWA) with IndexedDB Sync**:
   - Store the complete property catalog in local IndexedDB via Dexie.js or Workbox.
   - Enable full instantaneous offline filtering, sorting, and comparison with zero network latency.

2. **Interactive GIS Micro-Market Heatmap**:
   - Render Mumbai locality polygons using Leaflet / MapLibre GL with Mapbox vector tiles.
   - Visualize price-per-square-foot heatmaps, metro proximity buffers, and commute-time radius overlays from major business districts (BKC, Lower Parel, Andheri East).

3. **Dynamic Stamp Duty, Registration & EMI Mortgage Calculator**:
   - Implement real-time financial calculators tailored to Maharashtra state guidelines (6% stamp duty + 1% metro cess + registration charges).
   - Provide interactive amortization schedules with configurable bank interest rates and down payment sliders.

4. **WebSockets for Real-Time Price Adjustment & Availability Feeds**:
   - Establish a persistent WebSocket or Server-Sent Events (SSE) connection to stream instant price reductions, newly live listings, and status changes directly into the UI.

5. **Automated End-to-End Test Suite**:
   - Author a complete Playwright / Cypress suite verifying all client-side filter permutations, token refresh lifecycles, and cross-browser responsiveness.

---

## 5. Submission Manifest

- **`submission.json`**: Root-level answers to Questions 1–10 and all 10 verified forensic findings with empirical evidence.
- **`src/`**: Modular React application adhering to all 6 core frontend requirements.
- **`API_REFERENCE.md`**: Preserved original documentation reference.
- **`dist/`**: Verified zero-error production build.
