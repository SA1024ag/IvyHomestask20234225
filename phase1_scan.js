import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const LISTINGS_PATH = path.join(__dirname, 'listings.json');
const RENTALS_PATH = path.join(__dirname, 'rentals.json');
const PROJECTS_PATH = path.join(__dirname, 'projects.json');

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function runPhase1Scan() {
  console.log('====================================================');
  console.log('       IVY HOMES — PHASE 1 SCAN (Straightforward Metrics)');
  console.log('====================================================\n');

  // Load datasets
  const listings = loadJson(LISTINGS_PATH);
  const rentals = loadJson(RENTALS_PATH);
  const projects = loadJson(PROJECTS_PATH);

  // 1. Question 1 (total_listing_records)
  const total_listing_records = listings.length;
  console.log('----------------------------------------------------');
  console.log('1. Question 1: total_listing_records');
  console.log('----------------------------------------------------');
  console.log(`Total objects in listings.json: ${total_listing_records}\n`);

  // 2. Question 3 (active_listings)
  const active_listings = listings.filter((l) => l.is_live === true).length;
  const inactive_listings = listings.filter((l) => l.is_live === false).length;
  console.log('----------------------------------------------------');
  console.log('2. Question 3: active_listings');
  console.log('----------------------------------------------------');
  console.log(`Active listings (is_live === true):   ${active_listings}`);
  console.log(`Inactive listings (is_live === false): ${inactive_listings}`);
  console.log(`Total checked (active + inactive):    ${active_listings + inactive_listings}\n`);

  // 3. Question 5 (total_monthly_rent)
  const ASSIGNED_LOCALITY = 'mulund west';
  const mulundRentals = rentals.filter(
    (r) => (r.locality || '').trim().toLowerCase() === ASSIGNED_LOCALITY
  );
  const total_monthly_rent = mulundRentals.reduce(
    (sum, r) => sum + (Number(r.price) || 0),
    0
  );
  console.log('----------------------------------------------------');
  console.log('3. Question 5: total_monthly_rent');
  console.log('----------------------------------------------------');
  console.log(`Matching rental units in "${ASSIGNED_LOCALITY}": ${mulundRentals.length}`);
  console.log(`Total monthly rent sum: ₹${total_monthly_rent.toLocaleString('en-IN')} (Raw: ${total_monthly_rent})\n`);

  // 4. Question 7 (costliest_project)
  let maxProject = projects[0];
  for (const p of projects) {
    if (p.price_max > maxProject.price_max) {
      maxProject = p;
    }
  }
  const price_max_inr = Math.round(maxProject.price_max * 10000000);
  const costliest_project = {
    project_id: maxProject.project_id,
    price_max_inr: price_max_inr
  };
  console.log('----------------------------------------------------');
  console.log('4. Question 7: costliest_project');
  console.log('----------------------------------------------------');
  console.log(`Project ID:        ${maxProject.project_id}`);
  console.log(`Project Name:      ${maxProject.apartment_name}`);
  console.log(`Developer:         ${maxProject.developer_name}`);
  console.log(`Locality:          ${maxProject.locality}`);
  console.log(`Raw price_max:     ${maxProject.price_max} Cr (API returns Crores)`);
  console.log(`Converted to INR:  ₹${price_max_inr.toLocaleString('en-IN')} (${price_max_inr})`);
  console.log(`Formatted Output:  ${JSON.stringify(costliest_project)}\n`);

  // 5. Question 8 (listings_last_7_days)
  const REFERENCE_TIME = new Date('2026-09-10T00:00:00+05:30');
  const SEVEN_DAYS_PRIOR = new Date('2026-09-03T00:00:00+05:30');

  const refMs = REFERENCE_TIME.getTime();
  const priorMs = SEVEN_DAYS_PRIOR.getTime();

  let listings_last_7_days = 0;
  for (const l of listings) {
    if (l.posted_at) {
      const postedMs = new Date(l.posted_at).getTime();
      if (!isNaN(postedMs) && postedMs >= priorMs && postedMs < refMs) {
        listings_last_7_days++;
      }
    }
  }
  console.log('----------------------------------------------------');
  console.log('5. Question 8: listings_last_7_days');
  console.log('----------------------------------------------------');
  console.log(`Reference Moment:  ${REFERENCE_TIME.toISOString()} (IST: 2026-09-10 00:00:00+05:30)`);
  console.log(`Seven Days Prior:  ${SEVEN_DAYS_PRIOR.toISOString()} (IST: 2026-09-03 00:00:00+05:30)`);
  console.log(`Listings in range: ${listings_last_7_days}\n`);

  console.log('====================================================');
  console.log('               PHASE 1 SUMMARY OUTPUT');
  console.log('====================================================');
  console.log(JSON.stringify({
    total_listing_records,
    active_listings,
    inactive_listings,
    total_monthly_rent,
    costliest_project,
    listings_last_7_days
  }, null, 2));
  console.log('====================================================\n');
}

runPhase1Scan();
