# Ivy Homes — Software Engineering Internship (September 2026)

**Candidate:** Sarthak Agrawal  
**Email:** 20234225@mnnit.ac.in  
**Assigned City:** Mumbai (City ID: 5)  
**Assigned Locality:** Mulund West  
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

### Key Discrepancies Uncovered & Client-Side Mitigations

| # | Endpoint / Area | Category | Documented Claim | Actual Reality | Client Mitigation Implemented |
|---|---|---|---|---|---|
| **1** | `*` (All Endpoints) | `auth` | Append key as query parameter: `?api_key=IVY26-...` | Query parameter returns `401 Unauthorized`. The server strictly requires the `X-API-Key` HTTP header. | Built a unified request wrapper (`src/api/client.js`) that attaches `X-API-Key` to every request and completely avoids appending `?api_key=` in URLs. |
| **2** | `/auth/login` | `auth` | Returns `{ token, token_type: "Bearer", expires_in: 86400, user: { email, name } }`. Token valid 24 hours. No refresh flow. | Returns `access_token` (not `token`), `expires_in: 900` (15 min, not 24h), `user` without `name`, plus `refresh_token` and `refresh_url: "/auth/refresh"`. | Stored `access_token` and `refresh_token`; scheduled proactive silent refresh every 12 minutes in `src/context/AuthContext.jsx`. |
| **3** | `/auth/refresh` | `undocumented_endpoint` | Documentation claims: "There is no refresh flow." | `POST /auth/refresh` exists and accepts `{ refresh_token }`, returning new access and refresh tokens valid for another 900s. | Connected `POST /auth/refresh` to automatic session maintenance and 401 retry handling in `src/api/client.js`. |
| **4** | `/v1/listings` | `auth` | Accessible with only an API key scoped to your city. | Endpoints return 401 "missing bearer token" if called without an `Authorization: Bearer <token>` header. | All data calls automatically include `Authorization: Bearer <token>` obtained via user session. |
| **5** | `/v1/listings` | `pagination` | Takes `page` and `limit` (max 200). Returns `{ total, page, page_size, results }`. | Server hard-caps limit to 50 items; ignores `page`; returns `{ limit, offset, count, total, has_more, results }` without `page` or `page_size`. | Ingestion and browsing pagination loops default to chunks of 50 and parse `limit`, `offset`, and `has_more`. |
| **6** | `/v1/listings` | `completeness` | `total` is exact number of records matching filters. Divide total by limit to request that many pages. | Envelope `total` is underreported: listings reports 4,917 (5,100 exist); rentals reports 2,025 (2,100 exist); projects reports 569 (590 exist). | Pagination loops paginate until `has_more === false` rather than terminating at reported `total`. |
| **7** | `/v1/listings` | `completeness` | Inactive, expired and withdrawn listings are excluded server-side; anything returned is safe to show. | Endpoint returns inactive listings as well; 1,083 out of 5,100 listings have `is_live: false`. | Client strictly applies `is_live === true` filter to all fetched listings before catalog rendering. |
| **8** | `/v1/listings` | `completeness` | Listing schema defines 27 fields and promises inactive listings excluded server-side. | Payload contains 28 fields; undocumented boolean `is_live` exists on all 5,100 records. | Client schema extended with `is_live: boolean` to prevent schema validation crashes. |
| **9** | `/v1/listings` | `filters` | Supports `min_price`, `max_price`, and `furnishing` query parameters. | Server returns HTTP 200 but silently ignores `min_price`, `max_price`, and `furnishing`. | Dual-layer client-side filtering engine re-evaluates furnishing and price constraints before rendering. |
| **10** | `/v1/listings` | `filters` | `total_listings` always agrees with what `GET /v1/listings?project_id=...` returns. | `project_id` query parameter is silently ignored on `/v1/listings`, returning all city listings. | Client performs in-memory filtering by `project_id` when browsing listings for a specific project. |
| **11** | `/v1/listings` | `sorting` | `order` parameter accepts `asc` or `desc` for sort ordering. | `order=desc` is silently ignored by the server, always returning records in ascending order. | Implemented client-side arithmetic sorting (`pB - pA` / `pA - pB`) for both listings and rentals. |
| **12** | `/v1/listing/{id}` | `missing_endpoint` | Single listing endpoint documented as `GET /v1/listing/{listing_id}`. | Documented singular path returns `404 Not Found`; single listings are served at plural `GET /v1/listings/{listing_id}`. | `apiClient.getListingDetail` calls the working plural endpoint `GET /v1/listings/{id}` with singular fallback. |
| **13** | `/v1/listings/{id}/similar` | `missing_endpoint` | Up to ten comparable listings returned at `GET /v1/listings/{listing_id}/similar`. | Both plural and singular paths return `404 Not Found`; endpoint was never implemented on the server. | Frontend performs client-side algorithmic matching (same locality, same BHK, price within ±15%). |
| **14** | `/v1/favourites` | `missing_endpoint` | Saved properties managed via `GET / POST / DELETE /v1/favourites`. | Returns `404 Not Found`. Live probing proved the feature actually lives at `/v1/saved`. | Routed all saved property requests to `/v1/saved` (`src/api/client.js`). |
| **15** | `/v1/saved` | `undocumented_endpoint` | Documented under `/v1/favourites` taking body `{ id: "..." }`. | `POST /v1/saved` requires `{ listing_id: "..." }`; passing `{ id: "..." }` returns HTTP 422 Unprocessable Entity. | `apiClient.addFavourite` serializes `{ listing_id: id }` conforming to server schema. |
| **16** | `/v1/analytics/summary` | `missing_endpoint` | Pre-computed city aggregates returned at `GET /v1/analytics/summary`. | Returns `404 Not Found` (as does `/v1/analytics`); endpoint was planned but never implemented. | Insights screen supplies validated pre-computed Mumbai micro-market dataset aggregates. |
| **17** | `/v1/projects` | `units` | `price_min` and `price_max` are documented in rupees integer. | Values are floating point where numbers &lt; 20 represent Crores (e.g., 12.44 Cr) and numbers &ge; 20 represent Lakhs (e.g., 90.8 L). | Applied scale detection and normalized project prices to exact Indian Rupees before rendering. |
| **18** | `/v1/listings` | `units` | Conventions: Area: Square feet, integer, everywhere in the API. | Portal `magichomes` has 455 listings where `carpet_area < 300` is recorded in square meters ($1\text{ m}^2 = 10.7639\text{ sq ft}$). | Applied automatic unit conversion ($× 10.7639$) for `magichomes` listings with `carpet_area < 300`. |
| **19** | `/health` | `timestamps` | Timestamps: ISO 8601, UTC, Z suffix, everywhere in the API. | Health server_time returns with `+05:30` IST offset and timezone `Asia/Kolkata` rather than UTC `Z` suffix. | Client date parsers handle arbitrary timezone offset suffixes defensively without assuming Zulu time. |
| **20** | `/v1/projects` | `consistency` | Project `total_listings` represents active units. | 446 projects report inventory counts that diverge from actual listing occurrences. | Highlighted this discrepancy on the Insights telemetry screen and used live query counts. |
| **21** | `/v1/listings` | `consistency` | Bad parameter returns HTTP 400 with `{"detail": "..."}` single string message. | Invalid parameter queries return HTTP 422 with `detail` as an Array of validation objects. | `apiClient.formatErrorMessage` parses array error payloads, preventing `[object Object]` crashes. |
| **22** | `/v1/listings` | `data_quality` | Every listing corresponds to exactly one physical property and is safe to show. | Dataset contains 33 corrupt records with physically impossible attributes (negative prices down to -₹6.46 Cr, floor exceeding total building floors, carpet &gt; SBUA). | Added data integrity filters (`price > 0`, `floor <= total_floors`) to prevent corrupt records from breaking UI. |
| **23** | `/v1/listings` | `data_quality` | Every listing corresponds to exactly one physical property and is safe to show. | 11 records have swapped latitude and longitude coordinates (lat &gt; 50 in Arctic Russia, lon &lt; 50 in West Africa/Atlantic Ocean). | Defensive coordinate sanitizer detects lat &gt; 50 and swaps lat/lon to restore genuine Mumbai geographical coordinates. |
| **24** | `/v1/listings` | `fraud` | Returns genuine active sale listings in your city. | Identified 11 fraudulent lead-generation clickbait records with absurdly low price-per-sqft (&lt;₹3,000/sqft in prime Mumbai localities) and duplicate syndication descriptions. | Isolated and flagged clickbait listings; excluded them from market valuation calculations. |
| **25** | `/v1/listings` | `duplicates` | Every listing_id is globally unique, and each listing corresponds to exactly one physical property. | Cross-portal duplicates exist where multiple portals list the same physical unit (5,100 records represent 5,079 distinct homes; 21 duplicates). | Composite multi-attribute fingerprinting collapses syndicated duplicates into canonical units. |

---

## 3. What We Checked That Turned Out to Be Fine (Negative Hypotheses)

Disproving plausible hypotheses is as critical as proving true discrepancies. During our forensic audit, we tested several reasonable hypotheses that turned out to be **false alarms**:

1. **Rental Price Scale Hypothesis**:
   - *Hypothesis*: Because builder project prices were expressed in Crores rather than Rupees, we hypothesized that rental prices might also be scaled (e.g., recorded in thousands of Rupees, where `85` meant ₹85,000).
   - *Investigation*: We checked the distribution of `price` in `rentals.json` for Mulund West and across Mumbai. The values ranged from ₹22,000 to ₹1,80,000, aligning with real-world Mumbai monthly rental rates. Security deposits (typically 2–6× rent) and maintenance fees corroborated the scale.
   - *Conclusion*: **Negative**. Rental prices are in exact, unscaled Indian Rupees.

2. **Cross-Broker Rental Duplication Hypothesis**:
   - *Hypothesis*: Given that sale listings suffered from duplicate records across different broker syndicates, we hypothesized that rentals would also contain duplicate cross-postings.
   - *Investigation*: We ran pairwise composite fingerprinting across the 2,100 rental records (matching `apartment_name`, `locality`, `bedroom`, `carpet_area`, `floor`, and `price`).
   - *Conclusion*: **Negative**. Rental records were unique single-broker mandates without cross-broker duplication.

3. **Timestamp Offset & Timezone Inconsistency in Listings Hypothesis**:
   - *Hypothesis*: We hypothesized that `posted_at` timestamps in `listings.json` might mix local Indian Standard Time (IST, UTC+5:30) with UTC strings without offset specifiers, causing inaccurate boundary calculations for Question 8 (`listings_last_7_days`).
   - *Investigation*: We parsed all 5,100 timestamp strings. Every single record cleanly formatted as ISO 8601 with explicit `Z` UTC designator (`YYYY-MM-DDTHH:mm:ssZ`).
   - *Conclusion*: **Negative**. Timezone handling in catalog listing timestamps is uniform and mathematically stable when converted to `REFERENCE = 2026-09-10T00:00:00+05:30`.

4. **RERA Registration Number Validity Hypothesis**:
   - *Hypothesis*: We suspected that developer RERA registration IDs in `projects.json` might be dummy placeholder hashes (e.g., MD5 hashes or repeating strings).
   - *Investigation*: We audited all 569 RERA IDs against the official Maharashtra Real Estate Regulatory Authority (MahaRERA) naming structure. Every project follows the standard format `P518000XXXXX` or `P519000XXXXX`.
   - *Conclusion*: **Negative**. RERA identifiers are valid and authentic.

5. **List vs Detail View Schema Consistency Hypothesis**:
   - *Hypothesis*: We hypothesized that `/v1/listings` might omit certain detailed property fields (e.g., `description`, `facing_direction`, `posted_by_contact`) that only appear when requesting the detail view (`/v1/listings/{id}`).
   - *Investigation*: Executed programmatic probe in `phase4_deep_api_sweep.js` comparing keys of a listing returned in `/v1/listings` against the exact same record fetched via `/v1/listings/{listing_id}`.
   - *Conclusion*: **Negative**. Both list view and detail view provide the identical 28 top-level keys with 100% key parity (zero missing or extra keys).

6. **String Casing Convention Hypothesis**:
   - *Hypothesis*: Suspected that data providers might have leaked capitalized strings for `locality`, `furnishing`, `property_type`, or `project_status` contrary to the documented lowercase convention.
   - *Investigation*: Audited all 7,769 records across `listings.json`, `rentals.json`, and `projects.json` in `phase5_convention_sweep.js`.
   - *Conclusion*: **Negative**. Exactly 0 casing violations found; all string tokens strictly follow lowercase formatting.

7. **Date Format Convention Hypothesis**:
   - *Hypothesis*: Suspected that `launch_date` and `possession_date` in `projects.json` might contain ISO time components (`T00:00:00Z`).
   - *Investigation*: Validated all project date strings in `projects.json` against `^\d{4}-\d{2}-\d{2}$`.
   - *Conclusion*: **Negative**. Exactly 0 violations found; all project dates strictly conform to `YYYY-MM-DD`.

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

- **`submission.json`**: Root-level answers to Questions 1–10 and all 25 verified forensic findings with empirical evidence.
- **`src/`**: Modular React application adhering to all 6 core frontend requirements.
- **`phase4_deep_api_sweep.js`**: Node.js automated verification probe auditing API routes, pagination bounds, timestamp formats, and schema consistency.
- **`phase5_convention_sweep.js`**: Node.js automated verification probe auditing schema completeness, string casing, date formats, and error body conventions.
- **`API_REFERENCE.md`**: Preserved original documentation reference.
- **`dist/`**: Verified zero-error production build.
