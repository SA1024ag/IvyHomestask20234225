import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const LISTINGS_PATH = path.join(__dirname, 'listings.json');
const PROJECTS_PATH = path.join(__dirname, 'projects.json');

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function runPhase2Forensics() {
  console.log('================================================================');
  console.log('          IVY HOMES — PHASE 2 FORENSICS & DATA QUALITY          ');
  console.log('================================================================\n');

  const listings = loadJson(LISTINGS_PATH);
  const projects = loadJson(PROJECTS_PATH);

  // ----------------------------------------------------------------
  // 1. Question 2 (unique_properties)
  // ----------------------------------------------------------------
  console.log('----------------------------------------------------------------');
  console.log('1. Question 2: unique_properties (Physical Fingerprint Deduplication)');
  console.log('----------------------------------------------------------------');

  const fingerprintMap = new Map();
  for (const item of listings) {
    const fp = [
      item.locality,
      item.apartment_name,
      item.property_type,
      item.bedroom,
      item.floor,
      item.carpet_area,
      item.facing_direction
    ].map((v) => (v ?? '').toString().trim().toLowerCase()).join('|');

    if (!fingerprintMap.has(fp)) {
      fingerprintMap.set(fp, []);
    }
    fingerprintMap.get(fp).push(item.listing_id);
  }

  const unique_properties = fingerprintMap.size;
  const duplicateGroups = Array.from(fingerprintMap.entries()).filter(([, ids]) => ids.length > 1);
  const totalDuplicateRecords = duplicateGroups.reduce((acc, [, ids]) => acc + ids.length, 0);

  console.log(`Total listings processed:              ${listings.length}`);
  console.log(`Unique physical property fingerprints: ${unique_properties}`);
  console.log(`Duplicate property clusters:           ${duplicateGroups.length} clusters (${totalDuplicateRecords} records)`);
  console.log(`Example duplicate cluster:`);
  if (duplicateGroups.length > 0) {
    const [sampleFp, sampleIds] = duplicateGroups[0];
    console.log(`  Fingerprint: "${sampleFp}"`);
    console.log(`  Listings:    [ ${sampleIds.join(', ')} ]\n`);
  }

  // ----------------------------------------------------------------
  // 2. Question 4 (corrupt_listing_ids)
  // ----------------------------------------------------------------
  console.log('----------------------------------------------------------------');
  console.log('2. Question 4: corrupt_listing_ids (Physically Impossible Data)');
  console.log('----------------------------------------------------------------');

  const corruptListings = [];
  const sbuaViolations = [];
  const floorViolations = [];
  const priceViolations = [];
  const carpetViolations = [];

  for (const item of listings) {
    const sbua = item.super_built_up_area ?? item.super_builtup_area;
    const reasons = [];

    // Check 1: carpet_area > super_built_up_area
    if (sbua != null && item.carpet_area != null && item.carpet_area > sbua) {
      const msg = `carpet_area (${item.carpet_area} sqft) > super_built_up_area (${sbua} sqft)`;
      reasons.push(msg);
      sbuaViolations.push({ id: item.listing_id, reason: msg });
    }

    // Check 2: floor > total_floors (assuming total_floors > 0)
    if (item.total_floors != null && item.total_floors > 0 && item.floor != null && item.floor > item.total_floors) {
      const msg = `floor (${item.floor}) > total_floors (${item.total_floors})`;
      reasons.push(msg);
      floorViolations.push({ id: item.listing_id, reason: msg });
    }

    // Check 3: price <= 0 or carpet_area <= 0
    if (item.price != null && item.price <= 0) {
      const msg = `price (₹${item.price.toLocaleString('en-IN')}) <= 0`;
      reasons.push(msg);
      priceViolations.push({ id: item.listing_id, reason: msg });
    }

    if (item.carpet_area != null && item.carpet_area <= 0) {
      const msg = `carpet_area (${item.carpet_area}) <= 0`;
      reasons.push(msg);
      carpetViolations.push({ id: item.listing_id, reason: msg });
    }

    if (reasons.length > 0) {
      corruptListings.push({
        listing_id: item.listing_id,
        reasons: reasons.join('; ')
      });
    }
  }

  const corrupt_listing_ids = corruptListings.map((c) => c.listing_id).sort();

  console.log(`Corrupt listings flagged: ${corrupt_listing_ids.length}`);
  console.log(`- Carpet > Super Built-up Area: ${sbuaViolations.length} records`);
  console.log(`- Floor > Total Floors:         ${floorViolations.length} records`);
  console.log(`- Price <= 0 (Negative Prices): ${priceViolations.length} records`);
  console.log(`- Carpet Area <= 0:             ${carpetViolations.length} records\n`);

  console.log('Detailed Flagged Corrupt Listings:');
  corruptListings.forEach((c, idx) => {
    console.log(`  ${String(idx + 1).padStart(2, ' ')}. [${c.listing_id}] -> ${c.reasons}`);
  });

  console.log(`\nSorted corrupt_listing_ids array (${corrupt_listing_ids.length} items):`);
  console.log(JSON.stringify(corrupt_listing_ids));
  console.log();

  // ----------------------------------------------------------------
  // 3. Question 9 (fake_listing_ids)
  // ----------------------------------------------------------------
  console.log('----------------------------------------------------------------');
  console.log('3. Question 9: fake_listing_ids (Lead-Generation Fraud)');
  console.log('----------------------------------------------------------------');

  const fakeListings = [];
  const patternAFlags = [];
  const patternBFlags = [];

  // Pattern A: Price Bait (price / carpet_area < 3,000 / sqft)
  const PRICE_PER_SQFT_THRESHOLD = 3000;
  for (const item of listings) {
    if (item.price != null && item.price > 0 && item.carpet_area != null && item.carpet_area > 0) {
      const pricePerSqft = item.price / item.carpet_area;
      if (pricePerSqft < PRICE_PER_SQFT_THRESHOLD) {
        const msg = `Absurdly low price bait: ₹${Math.round(pricePerSqft).toLocaleString('en-IN')}/sqft (Total: ₹${item.price.toLocaleString('en-IN')} for ${item.carpet_area} sqft in ${item.locality})`;
        patternAFlags.push({
          listing_id: item.listing_id,
          rate: Number(pricePerSqft.toFixed(2)),
          price: item.price,
          carpet_area: item.carpet_area,
          locality: item.locality,
          reason: msg
        });
        fakeListings.push({
          listing_id: item.listing_id,
          reason: msg
        });
      }
    }
  }

  // Pattern B: Spam Descriptions (exact same description posted by same contact across different localities)
  const contactDescMap = new Map();
  for (const item of listings) {
    const contact = (item.posted_by_contact || '').trim();
    const desc = (item.description || '').trim();
    if (contact && desc) {
      const key = `${contact}:::${desc}`;
      if (!contactDescMap.has(key)) {
        contactDescMap.set(key, []);
      }
      contactDescMap.get(key).push(item);
    }
  }

  for (const [, group] of contactDescMap.entries()) {
    const locSet = new Set(group.map((l) => (l.locality || '').trim().toLowerCase()));
    if (locSet.size > 1) {
      for (const item of group) {
        const msg = `Spam description across multiple localities: [${Array.from(locSet).join(', ')}] by contact ${item.posted_by_contact}`;
        patternBFlags.push({
          listing_id: item.listing_id,
          contact: item.posted_by_contact,
          localities: Array.from(locSet),
          reason: msg
        });
        if (!fakeListings.some((f) => f.listing_id === item.listing_id)) {
          fakeListings.push({
            listing_id: item.listing_id,
            reason: msg
          });
        }
      }
    }
  }

  const fake_listing_ids = fakeListings.map((f) => f.listing_id).sort();

  console.log(`Fake listings flagged: ${fake_listing_ids.length}`);
  console.log(`- Pattern A (Price Bait < ₹3,000/sqft): ${patternAFlags.length} records`);
  console.log(`- Pattern B (Cross-locality spam text): ${patternBFlags.length} records\n`);

  console.log('Detailed Flagged Fake Listings (Pattern A Clickbait):');
  patternAFlags.forEach((f, idx) => {
    console.log(`  ${String(idx + 1).padStart(2, ' ')}. [${f.listing_id}] ₹${f.rate}/sqft -> Total ₹${f.price.toLocaleString('en-IN')} in ${f.locality} (${f.carpet_area} sqft)`);
  });

  console.log(`\nSorted fake_listing_ids array (${fake_listing_ids.length} items):`);
  console.log(JSON.stringify(fake_listing_ids));
  console.log();

  // ----------------------------------------------------------------
  // 4. Question 10 (projects_with_wrong_listing_count)
  // ----------------------------------------------------------------
  console.log('----------------------------------------------------------------');
  console.log('4. Question 10: projects_with_wrong_listing_count');
  console.log('----------------------------------------------------------------');

  const actualTotalMap = {};
  const actualActiveMap = {};

  for (const l of listings) {
    if (l.project_id) {
      actualTotalMap[l.project_id] = (actualTotalMap[l.project_id] || 0) + 1;
      if (l.is_live === true) {
        actualActiveMap[l.project_id] = (actualActiveMap[l.project_id] || 0) + 1;
      }
    }
  }

  let countMismatchBoth = 0;
  let countMismatchTotal = 0;
  let countMismatchActive = 0;
  const mismatchBothProjects = [];

  for (const p of projects) {
    const actual_total = actualTotalMap[p.project_id] || 0;
    const actual_active = actualActiveMap[p.project_id] || 0;
    const reported = p.total_listings;

    const mismatchesTotal = reported !== actual_total;
    const mismatchesActive = reported !== actual_active;
    const mismatchesBoth = mismatchesTotal && mismatchesActive;

    if (mismatchesTotal) countMismatchTotal++;
    if (mismatchesActive) countMismatchActive++;

    if (mismatchesBoth) {
      countMismatchBoth++;
      mismatchBothProjects.push({
        project_id: p.project_id,
        name: p.apartment_name,
        reported,
        actual_total,
        actual_active
      });
    }
  }

  console.log(`Total projects in dataset:                         ${projects.length}`);
  console.log(`Projects where reported != actual_total (all listings):     ${countMismatchTotal}`);
  console.log(`Projects where reported != actual_active (is_live true):   ${countMismatchActive}`);
  console.log(`Projects where reported mismatches BOTH metrics:            ${countMismatchBoth}\n`);

  console.log('Sample projects that mismatch BOTH reported and active (first 10):');
  mismatchBothProjects.slice(0, 10).forEach((p, idx) => {
    console.log(`  ${String(idx + 1).padStart(2, ' ')}. [${p.project_id}] ${p.name.padEnd(26)} -> Reported: ${String(p.reported).padStart(2, ' ')} | Actual Total: ${String(p.actual_total).padStart(2, ' ')} | Actual Active: ${String(p.actual_active).padStart(2, ' ')}`);
  });
  console.log();

  // ----------------------------------------------------------------
  // SUMMARY BLOCK
  // ----------------------------------------------------------------
  console.log('================================================================');
  console.log('                     PHASE 2 SUMMARY OUTPUT                     ');
  console.log('================================================================');
  console.log(JSON.stringify({
    unique_properties,
    corrupt_listings_count: corrupt_listing_ids.length,
    corrupt_listing_ids,
    fake_listings_count: fake_listing_ids.length,
    fake_listing_ids,
    projects_with_wrong_listing_count_against_both: countMismatchBoth,
    projects_with_wrong_listing_count_against_all_records: countMismatchTotal,
    projects_with_wrong_listing_count_against_active_records: countMismatchActive
  }, null, 2));
  console.log('================================================================\n');
}

runPhase2Forensics();
