import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// Global Constants (as specified)
// ==========================================
const REFERENCE_TIME = new Date('2026-09-10T00:00:00+05:30');
const SEVEN_DAYS_PRIOR = new Date('2026-09-03T00:00:00+05:30');
const ASSIGNED_LOCALITY = 'mulund west';

// File paths
const LISTINGS_PATH = path.join(__dirname, 'listings.json');
const RENTALS_PATH = path.join(__dirname, 'rentals.json');
const PROJECTS_PATH = path.join(__dirname, 'projects.json');
const SUBMISSION_PATH = path.join(__dirname, 'submission.json');

// Check CLI flags if any
const args = process.argv.slice(2);
const rawProjectPrice = args.includes('--raw-project-price') || args.includes('--crores');
const includePlotsInCorrupt = args.includes('--include-plots');

function loadJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Required file not found: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function solve() {
  console.log('====================================================');
  console.log(' Ivy Homes — Grading Questions Solver');
  console.log(' Reference Time:', REFERENCE_TIME.toISOString(), '(IST 2026-09-10 00:00:00+05:30)');
  console.log(' Seven Days Prior:', SEVEN_DAYS_PRIOR.toISOString(), '(IST 2026-09-03 00:00:00+05:30)');
  console.log(' Assigned Locality:', ASSIGNED_LOCALITY);
  console.log('====================================================\n');

  // Load input datasets
  const listings = loadJson(LISTINGS_PATH, 'listings.json');
  const rentals = loadJson(RENTALS_PATH, 'rentals.json');
  const projects = loadJson(PROJECTS_PATH, 'projects.json');

  console.log(`Loaded ${listings.length} listings, ${rentals.length} rentals, and ${projects.length} projects.\n`);

  // ----------------------------------------------------
  // Q1: total_listing_records
  // The total count of all objects inside listings.json.
  // ----------------------------------------------------
  const total_listing_records = listings.length;

  // ----------------------------------------------------
  // Q2: unique_properties
  // Calculate the number of distinct physical properties.
  // Group the listings array by a composite key of immutable physical specs.
  // Composite key: locality + apartment_name + floor + bedroom + carpet_area + facing_direction
  // ----------------------------------------------------
  const propertyKeySet = new Set();
  for (const item of listings) {
    const key = [
      (item.locality || '').trim().toLowerCase(),
      (item.apartment_name || '').trim().toLowerCase(),
      item.floor ?? '',
      item.bedroom ?? '',
      item.carpet_area ?? '',
      (item.facing_direction || '').trim().toLowerCase()
    ].join('|');
    propertyKeySet.add(key);
  }
  const unique_properties = propertyKeySet.size;

  // ----------------------------------------------------
  // Q3: active_listings
  // Count the number of records in listings.json where the property is_live strictly equals true.
  // ----------------------------------------------------
  const active_listings = listings.filter((l) => l.is_live === true).length;

  // ----------------------------------------------------
  // Q4: corrupt_listing_ids
  // Find listings that are physically impossible:
  // - carpet_area being greater than super_built_up_area (or super_builtup_area)
  // - floor being greater than total_floors
  // - price, carpet_area, or bedroom being <= 0
  // Note: Plots (property_type === 'plot') are bare land and legitimately have 0 bedrooms/floors.
  // Residential dwellings (apartments, villas, houses) with bedroom <= 0 are physically impossible.
  // ----------------------------------------------------
  const corruptSet = new Set();
  let countSbua = 0;
  let countFloor = 0;
  let countPrice = 0;
  let countCarpet = 0;
  let countBedroom = 0;

  for (const l of listings) {
    const sbua = l.super_built_up_area ?? l.super_builtup_area;
    const isSbuaCorrupt = sbua != null && l.carpet_area != null && l.carpet_area > sbua;
    const isFloorCorrupt = l.floor != null && l.total_floors != null && l.floor > l.total_floors;
    const isPriceCorrupt = l.price != null && l.price <= 0;
    const isCarpetCorrupt = l.carpet_area != null && l.carpet_area <= 0;
    
    // For plots, bedroom = 0 is expected. For residential buildings, bedroom <= 0 is physically impossible.
    const isBedroomCorrupt = includePlotsInCorrupt
      ? (l.bedroom != null && l.bedroom <= 0)
      : (l.bedroom != null && l.bedroom <= 0 && l.property_type !== 'plot');

    if (isSbuaCorrupt) countSbua++;
    if (isFloorCorrupt) countFloor++;
    if (isPriceCorrupt) countPrice++;
    if (isCarpetCorrupt) countCarpet++;
    if (isBedroomCorrupt) countBedroom++;

    if (isSbuaCorrupt || isFloorCorrupt || isPriceCorrupt || isCarpetCorrupt || isBedroomCorrupt) {
      corruptSet.add(l.listing_id);
    }
  }

  const corrupt_listing_ids = Array.from(corruptSet).sort();

  // ----------------------------------------------------
  // Q5: total_monthly_rent
  // Filter rentals.json for records where locality.toLowerCase() === "mulund west".
  // Sum their price values (the API uses price for monthly rent).
  // ----------------------------------------------------
  const mulundRentals = rentals.filter(
    (r) => (r.locality || '').trim().toLowerCase() === ASSIGNED_LOCALITY.toLowerCase()
  );
  const total_monthly_rent = mulundRentals.reduce(
    (sum, r) => sum + (Number(r.price) || 0),
    0
  );

  // ----------------------------------------------------
  // Q9: fake_listing_ids (computed before Q6 because Q6 depends on it)
  // Find listings designed to farm leads rather than sell a genuine property:
  // - Exact duplicate description strings posted by the same posted_by_contact but located in different localities
  // - Absurdly low outlier prices meant as clickbait (e.g. price is 95% lower than the locality average)
  // ----------------------------------------------------
  // 1. Calculate genuine average price per locality (excluding corrupt non-positive prices)
  const localityPrices = {};
  for (const l of listings) {
    if (l.price && l.price > 0) {
      const loc = (l.locality || '').trim().toLowerCase();
      if (!localityPrices[loc]) localityPrices[loc] = [];
      localityPrices[loc].push(l.price);
    }
  }

  const localityAvgPrice = {};
  for (const [loc, prices] of Object.entries(localityPrices)) {
    localityAvgPrice[loc] = prices.reduce((a, b) => a + b, 0) / prices.length;
  }

  // 2. Track contact + description combinations to find duplicate descriptions in different localities
  const contactDescMap = new Map();
  for (const l of listings) {
    const contact = (l.posted_by_contact || '').trim();
    const desc = (l.description || '').trim();
    if (contact && desc) {
      const key = `${contact}:::${desc}`;
      if (!contactDescMap.has(key)) contactDescMap.set(key, []);
      contactDescMap.get(key).push(l);
    }
  }

  const fakeSet = new Set();

  // Check duplicate descriptions cross-locality
  for (const [_, items] of contactDescMap.entries()) {
    const locSet = new Set(items.map((x) => (x.locality || '').trim().toLowerCase()));
    if (locSet.size > 1) {
      for (const item of items) {
        fakeSet.add(item.listing_id);
      }
    }
  }

  // Check clickbait outlier prices (e.g., 95% lower than locality average)
  for (const l of listings) {
    if (l.price && l.price > 0) {
      const loc = (l.locality || '').trim().toLowerCase();
      const avg = localityAvgPrice[loc];
      if (avg && l.price < avg * 0.05) {
        fakeSet.add(l.listing_id);
      }
    }
  }

  const fake_listing_ids = Array.from(fakeSet).sort();

  // ----------------------------------------------------
  // Q6: avg_price_per_sqft_2bhk
  // Filter listings.json where is_live === true AND bedroom === 2.
  // Explicitly exclude any listing_id found in corrupt_listing_ids and fake_listing_ids.
  // Calculate sum of price / carpet_area, divide by count, round to exactly 2 decimal places.
  // ----------------------------------------------------
  const corruptLookup = new Set(corrupt_listing_ids);
  const fakeLookup = new Set(fake_listing_ids);

  const eligible2bhk = listings.filter((l) => {
    if (l.is_live !== true) return false;
    if (l.bedroom !== 2) return false;
    if (!l.carpet_area || l.carpet_area <= 0) return false;
    if (!l.price || l.price <= 0) return false;
    if (corruptLookup.has(l.listing_id)) return false;
    if (fakeLookup.has(l.listing_id)) return false;
    return true;
  });

  const sumPricePerSqft = eligible2bhk.reduce(
    (sum, l) => sum + l.price / l.carpet_area,
    0
  );
  const avg_price_per_sqft_2bhk =
    eligible2bhk.length > 0
      ? Number((sumPricePerSqft / eligible2bhk.length).toFixed(2))
      : 0;

  // ----------------------------------------------------
  // Q7: costliest_project
  // Find the object in projects.json with the absolute highest price_max value.
  // Return formatted strictly as: {"project_id": "...", "price_max_inr": ...}
  // Note: As documented in the assessment, API projects return price in Crores (e.g. 12.44),
  // whereas the question specification and API_REFERENCE explicitly mandate price_max_inr in INR.
  // 12.44 Cr = 124,400,000 INR.
  // ----------------------------------------------------
  let maxProject = projects[0];
  for (const p of projects) {
    if (p.price_max > maxProject.price_max) {
      maxProject = p;
    }
  }

  const priceMaxInr = rawProjectPrice
    ? maxProject.price_max
    : (maxProject.price_max < 100 ? Math.round(maxProject.price_max * 10000000) : maxProject.price_max);

  const costliest_project = {
    project_id: maxProject.project_id,
    price_max_inr: priceMaxInr
  };

  // ----------------------------------------------------
  // Q8: listings_last_7_days
  // Parse each listing's posted_at date.
  // Count how many fall strictly within date >= SEVEN_DAYS_PRIOR && date < REFERENCE_TIME.
  // Ensure timezone math correctly handles UTC to IST conversions.
  // ----------------------------------------------------
  const refTimeMs = REFERENCE_TIME.getTime();
  const sevenDaysPriorMs = SEVEN_DAYS_PRIOR.getTime();

  let listings_last_7_days = 0;
  for (const l of listings) {
    if (l.posted_at) {
      const postedMs = new Date(l.posted_at).getTime();
      if (!isNaN(postedMs) && postedMs >= sevenDaysPriorMs && postedMs < refTimeMs) {
        listings_last_7_days++;
      }
    }
  }

  // ----------------------------------------------------
  // Q10: projects_with_wrong_listing_count
  // For every project in projects.json, count the exact number of records in listings.json
  // that carry its project_id. Compare this actual count against the project's own total_listings.
  // Return the number of projects where these two numbers do not match.
  // ----------------------------------------------------
  const actualCountByProjectId = {};
  for (const l of listings) {
    if (l.project_id) {
      actualCountByProjectId[l.project_id] = (actualCountByProjectId[l.project_id] || 0) + 1;
    }
  }

  let projects_with_wrong_listing_count = 0;
  for (const p of projects) {
    const actualCount = actualCountByProjectId[p.project_id] || 0;
    if (actualCount !== p.total_listings) {
      projects_with_wrong_listing_count++;
    }
  }

  // ==========================================
  // Assemble final answers object
  // ==========================================
  const computedAnswers = {
    total_listing_records,
    unique_properties,
    active_listings,
    corrupt_listing_ids,
    total_monthly_rent,
    avg_price_per_sqft_2bhk,
    costliest_project,
    listings_last_7_days,
    fake_listing_ids,
    projects_with_wrong_listing_count
  };

  // ==========================================
  // Print detailed terminal results
  // ==========================================
  console.log('----------------------------------------------------');
  console.log(' COMPUTED RESULTS FOR THE 10 GRADING QUESTIONS');
  console.log('----------------------------------------------------');
  console.log(`1. total_listing_records:               ${total_listing_records}`);
  console.log(`2. unique_properties:                   ${unique_properties}`);
  console.log(`3. active_listings:                     ${active_listings}`);
  console.log(`4. corrupt_listing_ids (${corrupt_listing_ids.length} records):`);
  console.log(`   - Breakdown: ${countSbua} carpet > super_builtup, ${countFloor} floor > total_floors, ${countPrice} price <= 0, ${countBedroom} built 0-BHK dwelling`);
  console.log(`   - IDs: [ ${corrupt_listing_ids.slice(0, 5).join(', ')}, ... (${corrupt_listing_ids.length} total) ]`);
  console.log(`5. total_monthly_rent (Mulund West):    ₹${total_monthly_rent.toLocaleString('en-IN')} (${mulundRentals.length} rentals)`);
  console.log(`6. avg_price_per_sqft_2bhk:             ₹${avg_price_per_sqft_2bhk}/sqft (${eligible2bhk.length} live 2BHKs)`);
  console.log(`7. costliest_project:                   ${JSON.stringify(costliest_project)}`);
  console.log(`   (Project "${maxProject.apartment_name}" with price_max = ₹${maxProject.price_max} Cr = ₹${costliest_project.price_max_inr.toLocaleString('en-IN')} INR)`);
  console.log(`8. listings_last_7_days:                ${listings_last_7_days}`);
  console.log(`9. fake_listing_ids (${fake_listing_ids.length} records):`);
  console.log(`   - IDs: [ ${fake_listing_ids.join(', ')} ]`);
  console.log(`10. projects_with_wrong_listing_count:  ${projects_with_wrong_listing_count} / ${projects.length} projects`);
  console.log('----------------------------------------------------\n');

  // ==========================================
  // Update submission.json (ONLY modifies answers)
  // ==========================================
  let submissionData = {};
  if (fs.existsSync(SUBMISSION_PATH)) {
    try {
      const existingText = fs.readFileSync(SUBMISSION_PATH, 'utf-8').trim();
      if (existingText.length > 0) {
        submissionData = JSON.parse(existingText);
      }
    } catch {
      console.warn('Warning: Could not parse existing submission.json.');
    }
  }

  // Strictly update only the answers object, leaving candidate, api_key, and findings untouched
  submissionData.answers = {
    ...(submissionData.answers || {}),
    ...computedAnswers
  };

  fs.writeFileSync(SUBMISSION_PATH, JSON.stringify(submissionData, null, 2), 'utf-8');
  console.log(`[OK] Successfully updated answers in ${SUBMISSION_PATH}!\n`);

  return computedAnswers;
}

solve();
