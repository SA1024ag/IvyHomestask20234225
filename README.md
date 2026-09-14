# Ivy Homes — Property Intelligence & Discovery Platform

**Candidate:** Sarthak Agrawal · [sarthak.20234225@mnnit.ac.in](mailto:sarthak.20234225@mnnit.ac.in) · Roll: 20234225  
**City:** Mumbai (City ID: 5) · **Assigned Locality:** Mulund West  
**Repository:** [SA1024ag/IvyHomestask20234225](https://github.com/SA1024ag/IvyHomestask20234225)  
**Live Production Demo:** [Ivy Homes Discovery Platform](https://sa1024ag.github.io/IvyHomestask20234225/)

---

## Executive Summary

Ivy Homes is a high-performance, production-grade real estate discovery and intelligence platform tailored for the Mumbai property ecosystem. Built with React and Vite, the platform bridges the gap between raw, imperfect broker datasets and a seamless, verified consumer experience.

By implementing an autonomous **Forensic API Audit Layer** and an intelligent **Data Normalization Pipeline**, the application dynamically catches, rectifies, and isolates 28 documented server-side edge cases, data corruptions, and architectural discrepancies without disrupting user experience.

---

## Frontend Features & Capabilities

### 1. Unified Property Discovery Catalog
- **Multi-Vertical Navigation**: Dedicated exploratory views for **Sale Listings** (5,079 canonical homes), **Verified Rentals** (2,100 leases), and **Builder Projects** (590 developments).
- **Interactive Whole-Card Navigation**: Every card across all three verticals (`PropertyCard`, `RentalCard`, `ProjectCard`) is fully clickable, instantly transitioning into high-fidelity detail views with responsive spring micro-animations.
- **Isolated Control Interactions**: Child action triggers (Google Maps, Compare checkboxes, Favorite hearts, Contact Lister buttons, External Portal links) utilize strict event propagation isolation to ensure independent action execution without unwanted page transitions.
- **Fast Filter & Search Suite**: Real-time filtering by locality (all 10 Mumbai hubs), BHK configuration (1 to 5+ BHK), furnishing state, and price bounds with automatic client-side fallback compensation for server-side query drops.
- **Bi-Directional Sorting Engine**: Instant client-side sort execution by price (ascending/descending), carpet area, rate per square foot, and date posted, overcoming server-side sort restrictions.
- **Interactive Page Hop Navigation**: Direct page jumper form and keyboard accessibility alongside smooth scroll-to-top state restoration.

### 2. Deep-Linked Detail Views
- **Residences Detail (`/listings/:id`)**:
  - Comprehensive architectural overview, carpet area normalization, price-per-square-foot metrics, and direct seller contact integration.
  - **Contextual "Compare With It" Pairing**: Under "More Properties You'll Like", selecting compare on any recommended home automatically pairs and includes the currently viewed property into the comparison drawer.
  - **Direct Google Maps Integration**: Prominently positioned navigation actions in the header, location metadata bar, and verified seller card.
- **Builder Projects Detail (`/projects/:id`)**:
  - Comprehensive project overview: RERA registration verification, developer portfolio, construction status timeline, price range brackets, and total units inventory.
  - **Associated Live Inventory**: Directly links builder projects to their live, verified resale and primary listings with dedicated pagination.
  - One-click Google Maps location deep-linking and external portal references.
- **Rental Residences Detail (`/rentals/:id`)**:
  - Transparent financial breakdown: Monthly Rent, Security Deposit, and Maintenance fee schedules.
  - Tenant compatibility tags (Family, Bachelors, Company Lease), dedicated parking status, facing orientation, and floor elevations.
  - Verified lister card with click-to-call direct dialer (`tel:`) and instant Google Maps navigation.
  - "More Rentals You'll Like" algorithmic alternatives in the same micro-market.

### 3. Comprehensive Comparison Matrix & Visualizer
- **Side-by-Side Spec Comparison**: Compare up to 3 properties simultaneously across sale homes, rentals, and builder projects.
- **Multi-Dimensional Metrics**: Comprehensive side-by-side analysis of total price, normalized carpet area, rate per sqft, bedroom/bathroom counts, furnishing, elevation, and developer reputation.
- **Floating Compare Banner**: Real-time persistent bottom tray providing instant visibility into active comparisons across all routes, with quick-clear and compare navigation.
- **Interactive Analytical Visualizations**: Embedded comparative charts contrasting spatial efficiency and financial metrics.

### 4. Universal Google Maps GPS Integration
- **Precision Geocoding & Deep Linking**: Every card and detail page includes direct Google Maps actions with coordinates and formatted address labels (`lat,lon` + apartment name, locality, Mumbai).
- **Coordinate Anomaly Rectification**: Automatically detects and repairs inverted latitude/longitude coordinates before generating external navigation URLs.

### 5. Data Hygiene & Anomaly Engine
- **Cross-Portal Canonical Deduplication**: Merges duplicate records appearing across multiple listing portals, distilling 5,100 raw entries down to 5,079 distinct, canonical Mumbai residences.
- **Arctic Coordinate Correction**: Detects swapped coordinate pairs (`lat > 70°`, placing Mumbai properties in Arctic Russia) and restores proper coordinates (`lat ~19.1°`, `lon ~72.8°`).
- **Fraud & Clickbait Filtration**: Eliminates corrupt listings exhibiting physically impossible parameters (e.g., negative pricing, floor > total floors, carpet area > super built-up area) and bait-and-switch listings under ₹3,000/sqft.
- **Unit Normalization**: Automatically converts square meter measurements (< 300 sqm from MagicHomes) to square feet (×10.7639) for consistent market valuation.

### 6. Authentication & User Persistence
- **Resilient Token Lifecycle**: Proactive token refresh via `POST /auth/refresh` before the 900-second token expiration window.
- **Stateful Favorites Sync**: Fully synchronized saved properties saved to backend (`/v1/saved`) and backed up in local storage.
- **Quick-Fill Demo Access**: Seamless one-click login buttons for demo accounts.
- **Responsive Dark/Light Theme System**: Harmonious HSL color tokens with glassmorphic elements and contrast ratios adhering to WCAG standards.

---

## Running Locally

### Prerequisites
- Node.js 18.0+
- npm 9.0+

### Installation & Setup

```bash
# Clone the repository
git clone https://github.com/SA1024ag/IvyHomestask20234225.git
cd IvyHomestask20234225

# Install project dependencies
npm install

# Start development server
npm run dev
```

The application will be accessible at `http://localhost:5173/IvyHomestask20234225/` (or port assigned by Vite).

### Production Build

```bash
# Validate production bundle compilation
npm run build

# Preview production build locally
npm run preview
```

### Demo Accounts

The login portal includes one-click autofill buttons for each account:

| Account | Email | Password | Role |
|:---|:---|:---|:---|
| **Demo User 1** | `demo1@ivy.homes` | `b42f2e3a58` | Verified Buyer |
| **Demo User 2** | `demo2@ivy.homes` | `b42f2e3a58` | Verified Buyer |
| **Demo User 3** | `demo3@ivy.homes` | `b42f2e3a58` | Verified Buyer |

---

## How We Worked Out Which Parts of Documentation to Distrust (And What We Did)

The backend API was audited through systematic live network probes and full dataset forensic analysis across all 5,100 listings, 2,100 rentals, and 590 projects.

Below is the complete register of all 28 identified discrepancies alongside the implemented frontend mitigations:

| # | Endpoint | Category | Documented Behavior | Actual Server Behavior | Frontend Mitigation Implemented |
|:---:|:---|:---:|:---|:---|:---|
| 1 | `*` | Auth | Append API key as query parameter `?api_key=...` | Returns HTTP 401. API key is only accepted via `X-API-Key` header | Injected `X-API-Key` into request interceptor header config (`src/api/client.js`) |
| 2 | `/auth/login` | Auth | Token valid for 24h; no refresh; returns `token` | Token expires in 900s; returns `access_token` + `refresh_token`; user object omits `name` | Extracted `access_token`; initialized background refresh loop before expiry |
| 3 | `/auth/logout` | Auth | Server invalidates JWT on `/auth/logout` | Stateless JWT ignored server-side; remains valid until expiry | Performed immediate client-side storage hard purge before triggering API call |
| 4 | `/auth/refresh` | Missing Doc | Endpoint omitted from documentation | `POST /auth/refresh` active; accepts `{ refresh_token }` | Integrated automatic token rotation on 401 response and before expiry |
| 5 | `/v1/listings` | Auth | Public endpoint accessible with API key alone | Returns HTTP 401 without `Authorization: Bearer <token>` | Enforced authenticated state and Bearer token attachment on all catalog calls |
| 6 | `/v1/listings` | Pagination | `page` + `limit` (max 200); returns `page` and `page_size` | Ignores `page`; requires `offset`; hard-caps `limit` at 50; returns `has_more` | Added `normalizePaginationParams` converting `page` → `offset` and capping at 50 |
| 7 | `/v1/listings` | Completeness | `total` is exact; indicates when to stop pagination | `total` underreports true count (4,917 reported vs 5,100 exist) | Paginated exhaustively until `has_more: false` or empty result set |
| 8 | `/v1/listings` | Data Integrity | Inactive listings filtered server-side | Returns inactive listings; 1,083 of 5,100 have `is_live: false` | Added strict client-side predicate filter checking `is_live === true` |
| 9 | `/v1/listings` | Schema | Listing object has 27 documented fields | Payload has 28 fields; undocumented `is_live` boolean on every record | Updated interface model to parse `is_live` |
| 10 | `/v1/listings` | Filters | `min_price`, `max_price`, `furnishing` filter results | Server silently ignores all three filter parameters | Implemented client-side filtering pipeline preserving user constraints |
| 11 | `/v1/listings` | Filters | `project_id` filter is supported server-side | Silently ignored; returns unfiltered city catalog | Filtered associated project listings on client side using `l.project_id === id` |
| 12 | `/v1/listings` | Sorting | `order=desc` sorts results descending | Silently ignored; always returns records in ascending order | Implemented client-side sorting comparator across all numeric and string fields |
| 13 | `/v1/listing/{id}` | Endpoint | Documented as singular path: `GET /v1/listing/{id}` | Returns HTTP 404. Working endpoint is plural: `GET /v1/listings/{id}` | Standardized all entity fetching on `GET /v1/listings/{id}` |
| 14 | `/v1/listings/{id}/similar` | Missing API | Returns up to 10 comparable properties | Returns HTTP 404; endpoint was never deployed | Implemented localized heuristic matching based on locality and bedroom count |
| 15 | `/v1/favourites` | Endpoint | Saved listings documented at `/v1/favourites` | Returns HTTP 404. Live endpoint is `/v1/saved` | Routed all bookmarking operations to `/v1/saved` |
| 16 | `/v1/saved` | Schema | Payload takes `{ id: "..." }` | Payload requires `{ listing_id: "..." }`; passing `id` returns HTTP 422 | Normalized mutation bodies to dispatch `{ listing_id }` |
| 17 | `/v1/analytics/summary` | Missing API | Returns pre-computed city statistics | Returns HTTP 404. Endpoint was never deployed | Computed locality and BHK market analytics directly from verified catalog |
| 18 | `/v1/projects` | Units | `price_min` / `price_max` represented as integer rupees | Floating point: values < 20 = Crores; values ≥ 20 = Lakhs | Created `normalizeProjectPrice` converting floating unit scales to exact INR |
| 19 | `/v1/listings` | Units | All carpet areas represented in square feet | 455 `magichomes` listings report area in square meters (< 300) | Added square-meter detection (< 300) and multiplied by 10.7639 |
| 20 | `/health` | Timestamps | All timestamps formatted in UTC with `Z` suffix | `server_time` carries `+05:30` IST offset with `"timezone": "Asia/Kolkata"` | Implemented timezone-aware date parsing |
| 21 | `/v1/projects` | Consistency | `total_listings` matches live associated inventory | 446 of 590 projects report an incorrect listing count | Computed live inventory counts dynamically from verified listing dataset |
| 22 | `/v1/listings` | Error Handling | Invalid parameter returns HTTP 400 with `{ "detail": "..." }` | Returns HTTP 422 with `detail` as an array of Pydantic validation objects | Implemented recursive error parser extracting human-readable message strings |
| 23 | `/v1/listings` | Data Quality | All records physically valid | 33 physically impossible records (carpet > SBUA, negative prices) | Implemented constraint validator isolating corrupt records |
| 24 | `/v1/listings` | Data Quality | Coordinates represent Mumbai properties | 11 records have inverted lat/lon (lat ~72.8°, lon ~19.0°) in Arctic Russia | Built `fixCoordinates` auto-swapping coordinates when `lat > 70` |
| 25 | `/v1/listings` | Fraud | Returns genuine listings | 11 clickbait records with price-per-sqft < ₹3,000 in prime localities | Built `filterFakeListings` eliminating anomalous pricing outliers |
| 26 | `/v1/listings` | Duplicates | Each listing ID represents a unique home | 21 cross-portal duplicate pairs (5,100 records = 5,079 distinct homes) | Implemented composite fingerprint deduplication (`apartment + bhk + floor + area`) |
| 27 | `/v1/rentals` | Completeness | Returns active rental properties | 340 of 2,100 rentals have `is_live: false` | Filtered rentals by `is_live === true` |
| 28 | `/v1/rentals` | Sorting | `order=desc` supported on rentals | Silently ignored; always returns ascending | Implemented client-side sort override for rental pricing and dates |

---

## What We Checked That Turned Out to Be Fine (Hypotheses Disproved)

During the forensic audit, several plausible hypotheses were investigated and disproved by the data, demonstrating that the API remains consistent and honest in many subtle operational areas:

1. **Rental Price Scaling**: Investigated whether rental values were shorthand thousands (e.g. `85` = ₹85,000). Data confirmed values represent exact market rupee figures (₹22,000 to ₹1,80,000).
2. **Rental Duplicate Pairs**: Investigated whether cross-broker syndication generated duplicate rental postings. Composite fingerprinting across all 2,100 rentals confirmed zero duplicate pairs.
3. **UTC Timestamp Integrity on Listings**: Verified that `posted_at` in all 5,100 listings strictly carries the `Z` UTC designator, confirming timestamp parser integrity.
4. **MahaRERA Registration Conformance**: Verified that all 590 project RERA IDs strictly conform to Maharashtra real estate authority naming formats (`PRM/KA/RERA/...` or `P518...`).
5. **Collection vs Detail Schema Parity**: Verified that `/v1/listings/{id}` schema matches the collection schema key-for-key across all 28 payload attributes.
6. **Locality String Normalization**: Verified all locality names conform to standard lower-case Mumbai zoning strings across all 7,769 records without misspellings.

---

## What We Would Do With Another Two Days

If granted an additional 48 hours for production hardening and feature expansion, the engineering roadmap prioritizes:

1. **Automated End-to-End Test Suite**:
   - Build a comprehensive Playwright / Cypress test matrix covering all 6 core workflows: auth refresh lifecycle across 30+ minutes, deep-linked detail views, client-side filter combinations, and real-time favourites persistence.
2. **Automated Valuation Model (AVM) & Deal Scoring**:
   - Train a lightweight client-side regression model on historical $/sqft across micro-markets to assign each listing a "Deal Score" (e.g., Fair Value, Undervalued, Premium), giving buyers actionable market intelligence.
3. **Interactive Polygonal & Radius Geospatial Filtering**:
   - Implement Canvas/WebGL-powered custom map boundaries allowing buyers to draw polygonal search areas around specific transit hubs (e.g., Eastern Express Highway, Metro Line 4 corridor).
4. **Server-Side Rendering (SSR) & Sub-50ms Edge Caching**:
   - Migrate catalog routing to Next.js / Remix with ISR (Incremental Static Regeneration), generating pre-rendered static HTML for all 5,079 canonical residences for instant SEO indexing.
5. **Real-Time Inventory Streaming via SSE / WebSockets**:
   - Implement real-time push events for price changes, new units added to builder projects, and instantaneous favourites state syncing across multiple devices.
6. **Broader Comparative Analytics Visualizations**:
   - Expand the comparison matrix with interactive visual radar charts and mortgage amortization calculators factoring in Mumbai stamp duty and registration costs.

---

## AI & LLM Usage Disclosure

In strict adherence to the assignment guidelines (*"Use any LLM, any framework, any library. Say so in your README; it costs you nothing and lying about it costs you the internship."*):
- **LLM Assistance**: Google Antigravity / Gemini & Claude were utilized as intelligent pair-programming co-pilots for code drafting, exploratory API probing scripts, forensic statistical sanity-checking, and layout structuring.
- **Engineering Authorship**: All hypotheses, data validation checks, forensic deductions, architectural bug mitigations, and final answers were personally audited, verified against ground truth, and executed by the candidate.

---

## Tech Stack & Tooling

- **Core Framework**: React 18 · Vite 5
- **Routing**: React Router DOM (HashRouter for universal GitHub Pages / static hosting compatibility)
- **Styling**: Vanilla CSS Design System with CSS Custom Properties, Glassmorphism, and responsive breakpoints
- **Motion & Transitions**: Framer Motion
- **Iconography**: Lucide React
- **Data Forensics & Probing**: Node.js automated test suites (`phase3_network_test.js`, `phase4_deep_api_sweep.js`, `phase5_convention_sweep.js`)
- **Code Quality**: Oxlint

---

## Project Structure

```
ivy-homes-assignment/
├── src/
│   ├── api/
│   │   ├── auth.js            # Authentication lifecycle & token refresh management
│   │   └── client.js          # Resilient API client with mitigation wrappers
│   ├── components/
│   │   ├── CompareCharts.jsx  # Comparative data visualizer
│   │   ├── CompareFloatingBanner.jsx # Persistent comparison action drawer
│   │   ├── IvyLogo.jsx        # Scalable SVG brand assets
│   │   ├── Navbar.jsx         # Navigation bar with responsive mobile menu
│   │   ├── ProjectCard.jsx    # Fully clickable builder project card
│   │   ├── PropertyCard.jsx   # Fully clickable listing card with compare-with-current
│   │   ├── PropertyImagePlaceholder.jsx # Contextual SVG fallback art
│   │   ├── ProtectedRoute.jsx # Session-guarded route wrapper
│   │   └── RentalCard.jsx     # Fully clickable rental card with quick contact
│   ├── context/
│   │   ├── AuthContext.jsx    # Session state & demo credentials
│   │   ├── CompareContext.jsx # Multi-category comparison engine (sales, rentals, projects)
│   │   ├── FavouritesContext.jsx # Saved homes synchronization
│   │   └── ThemeContext.jsx   # Dark / Light theme engine
│   ├── pages/
│   │   ├── ComparePage.jsx    # Side-by-side comparison matrix
│   │   ├── FavouritesPage.jsx # Bookmarked properties view
│   │   ├── InsightsPage.jsx   # Forensic API audit findings & market intelligence
│   │   ├── LandingPage.jsx    # Overview portal & system dashboard
│   │   ├── ListingDetailPage.jsx # Residence detail with Google Maps & compare pairing
│   │   ├── ListingsPage.jsx   # Sale catalog with 5,079 canonical homes
│   │   ├── LoginPage.jsx      # Authentication portal with one-click autofill
│   │   ├── ProjectDetailPage.jsx # Builder development detail with live inventory
│   │   ├── ProjectsPage.jsx   # Builder projects catalog
│   │   ├── RentalDetailPage.jsx  # Rental detail with financial breakdown & Google Maps
│   │   └── RentalsPage.jsx    # Rental discovery catalog
│   ├── utils/
│   │   └── dataUtils.js       # Coordinate fixing, deduplication, and Google Maps URL builder
│   ├── App.jsx                # Route declarations & provider hierarchy
│   ├── index.css              # Design tokens, typography, utilities, and dark theme
│   └── main.jsx               # Application entry point
├── public/
│   ├── listings.json          # Pre-cached catalog dataset
│   ├── projects.json          # Builder projects dataset
│   └── rentals.json           # Rental catalog dataset
├── README.md                  # Comprehensive platform documentation
├── submission.json            # Final assignment answers & verification payload
└── package.json               # Dependencies and scripts
```
