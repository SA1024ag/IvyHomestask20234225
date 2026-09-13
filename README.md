# Ivy Homes — Property Platform

**Candidate:** Sarthak Agrawal · 20234225@mnnit.ac.in
**City:** Mumbai (City ID 5) · **Assigned Locality:** Mulund West
**Repo:** [SA1024ag/IvyHomestask20234225](https://github.com/SA1024ag/IvyHomestask20234225)

---

## Running Locally

```bash
npm install
npm run dev          # → http://localhost:5173
```

**Demo credentials** (any of the three accounts share the same password):

| Email | Password |
|---|---|
| `demo1@ivy.homes` | `b42f2e3a58` |
| `demo2@ivy.homes` | `b42f2e3a58` |
| `demo3@ivy.homes` | `b42f2e3a58` |

The login screen has one-click fill buttons for each account.

---

## How I Audited the API

I treated `API_REFERENCE.md` as a hypothesis list, not documentation.

**Two complementary audit vectors:**

1. **Live network probes** — Tested every endpoint, header, parameter, and error path against the running server. Scripts are in `phase3_network_test.js`, `phase4_deep_api_sweep.js`, and `phase5_convention_sweep.js`.

2. **Dataset forensics** — Pulled all 5,100 listings, 2,100 rentals, and 590 projects and ran statistical anomaly detection, composite fingerprinting, physical-constraint validation, and price-per-sqft outlier analysis.

---

## Discrepancies Found (28 total)

| # | Endpoint | Category | What the documentation says | What the API actually does |
|:---:|---|:---:|---|---|
| 1 | `*` | `auth` | Append API key as `?api_key=…` | Returns 401. Key must be in `X-API-Key` header |
| 2 | `/auth/login` | `auth` | Token valid 24 h; no refresh flow; returns `token` | Token expires in 900 s; returns `access_token` + `refresh_token`; user object omits `name` |
| 3 | `/auth/logout` | `auth` | Invalidates the token server-side | Token is a stateless JWT; server ignores it. Client must purge storage |
| 4 | `/auth/refresh` | `undocumented_endpoint` | Does not exist | `POST /auth/refresh` accepts `{refresh_token}`, returns new tokens valid for 900 s |
| 5 | `/v1/listings` | `auth` | Accessible with API key alone | Returns 401 without `Authorization: Bearer <token>` |
| 6 | `/v1/listings` | `pagination` | `page` + `limit` (max 200); response has `page` and `page_size` | Ignores `page`; uses `offset`; hard-caps `limit` at 50; response has `offset`, `count`, `has_more` |
| 7 | `/v1/listings` | `completeness` | `total` is exact; use it to know when to stop paginating | `total` is underreported (4,917 reported; 5,100 exist). Must paginate until `has_more: false` |
| 8 | `/v1/listings` | `completeness` | Inactive listings are excluded server-side | Returns inactive listings; 1,083 of 5,100 have `is_live: false` |
| 9 | `/v1/listings` | `completeness` | Listing object has 27 documented fields | Payload has 28 fields; undocumented `is_live` boolean appears on every record |
| 10 | `/v1/listings` | `filters` | `min_price`, `max_price`, `furnishing` filter results | All three parameters are silently ignored |
| 11 | `/v1/listings` | `filters` | `project_id` filter is supported | Silently ignored; returns all city listings |
| 12 | `/v1/listings` | `sorting` | `order=desc` sorts descending | Silently ignored; always returns ascending |
| 13 | `/v1/listing/{id}` | `missing_endpoint` | Single listing at `GET /v1/listing/{id}` | 404. Working path is plural: `GET /v1/listings/{id}` |
| 14 | `/v1/listings/{id}/similar` | `missing_endpoint` | Returns up to 10 comparable listings | 404 on both singular and plural paths; never implemented |
| 15 | `/v1/favourites` | `missing_endpoint` | Saved listings at `/v1/favourites` | 404. Feature lives at `/v1/saved` |
| 16 | `/v1/saved` | `undocumented_endpoint` | Body takes `{ id: "…" }` | Body requires `{ listing_id: "…" }`; passing `id` returns 422 |
| 17 | `/v1/analytics/summary` | `missing_endpoint` | Returns pre-computed city aggregates | 404. Endpoint was never deployed |
| 18 | `/v1/projects` | `units` | `price_min` / `price_max` in rupees (integer) | Floating-point: values < 20 = Crores; values ≥ 20 = Lakhs |
| 19 | `/v1/listings` | `units` | All areas in square feet (integer) | 455 `magichomes` listings report `carpet_area` in square metres (values < 300) |
| 20 | `/health` | `timestamps` | All timestamps UTC with `Z` suffix | `server_time` carries `+05:30` IST offset and `"timezone": "Asia/Kolkata"` |
| 21 | `/v1/projects` | `consistency` | `total_listings` always matches `GET /v1/listings?project_id=…` | 446 of 590 projects report an incorrect listing count |
| 22 | `/v1/listings` | `consistency` | Bad parameter → HTTP 400, body `{"detail": "…"}` | Invalid parameter → HTTP 422, `detail` is an array of Pydantic validation objects |
| 23 | `/v1/listings` | `data_quality` | Every record is safe to show | 33 physically impossible records: carpet > SBUA, floor > total\_floors, negative price |
| 24 | `/v1/listings` | `data_quality` | Coordinates represent Mumbai properties | 11 records have swapped lat/lon (lat ~72.8°, lon ~19.0°) placing properties in Arctic Russia |
| 25 | `/v1/listings` | `fraud` | Returns genuine listings | 11 clickbait records with price-per-sqft < ₹3,000 in prime localities; cross-locality duplicate descriptions from the same agent contact |
| 26 | `/v1/listings` | `duplicates` | Each `listing_id` is a unique physical property | 21 cross-portal duplicate pairs (5,100 records, 5,079 distinct homes) |
| 27 | `/v1/rentals` | `completeness` | Returns active rental listings | 340 of 2,100 rentals have `is_live: false` |
| 28 | `/v1/rentals` | `sorting` | `order=desc` supported | Silently ignored; always returns ascending |

---

## What I Checked That Turned Out Fine

These were plausible hypotheses that the data disproved:

1. **Rental prices scaled** — Suspected prices might be in thousands (e.g. `85` = ₹85,000). They are not; values align with real Mumbai market rents (₹22,000–₹1,80,000).

2. **Rental duplicates** — Suspected cross-broker duplicate listings in rentals, as seen in sale listings. Composite fingerprinting across 2,100 records found zero duplicate groups.

3. **Listing timestamps missing timezone** — Suspected `posted_at` might lack a timezone designator, causing boundary errors in Question 8. All 5,100 values carry an explicit `Z` UTC suffix.

4. **RERA numbers are dummy placeholders** — All 590 project RERA IDs conform to the official Maharashtra format and appear structurally valid.

5. **List vs detail schema divergence** — Suspected `/v1/listings/{id}` might return extra fields absent from the collection view. Programmatic key comparison confirmed 100% parity (28 keys, identical).

6. **String casing violations** — Suspected mixed-case values for `locality`, `furnishing`, `property_type`, `project_status`. Zero violations across all 7,769 records.

7. **Project date format violations** — Suspected `launch_date` / `possession_date` might carry time components. All 590 project dates strictly match `YYYY-MM-DD`.

---

## Frontend Fixes Implemented

Every discrepancy in the table above has a corresponding mitigation:

- **Auth layer** (`src/api/auth.js`): `login()` reads `access_token`; `logout()` hard-purges `localStorage` before the network call; `refreshAuthToken()` calls `POST /auth/refresh`
- **Request wrapper** (`src/api/client.js`): Injects `X-API-Key` header; converts `page` → `offset`; caps `limit` at 50; normalises the response envelope; handles 422 error arrays; retries on 401 with refreshed token
- **Listings** (`src/pages/ListingsPage.jsx`): Applies `is_live === true`, `min_price`, `max_price`, and `furnishing` client-side; performs client-side descending sort; recommends similar listings locally when `/similar` returns 404
- **Rentals** (`src/pages/RentalsPage.jsx`): Filters `is_live === true`; client-side price and furnishing filters; client-side sort override
- **Projects** (`src/pages/ProjectsPage.jsx`): Converts floating-point Crore/Lakh prices to exact Rupees; client-side descending sort
- **Saved listings** (`src/api/client.js`): Routes to `/v1/saved` with `{ listing_id }` body
- **Insights screen** (`src/pages/InsightsPage.jsx`): Displays all 28 findings with categories and evidence; computes market aggregates locally since `/v1/analytics/summary` is 404

---

## What I Would Do With Another Two Days

1. Deploy to Vercel and add the live `demo_url` to `submission.json`
2. Build a map view with Leaflet; swap lat/lon on affected records in the renderer
3. Persist the deduplicated canonical property list so the UI shows 5,079 unique homes, not 5,100 raw records
4. Add a project detail page linking builder project cards to their specific listings
5. Write end-to-end tests (Playwright) covering login, saved listings round-trip, and pagination edge cases

---

## Tools Used

- **LLM assistance:** Claude (Anthropic) via Antigravity IDE — used for code generation, audit script iteration, and hypothesis testing. All findings were personally reproduced and verified.
- **Framework:** React + Vite
- **Linting:** Oxlint (`npx oxlint@latest`)
