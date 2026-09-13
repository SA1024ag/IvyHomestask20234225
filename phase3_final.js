import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const LISTINGS_PATH = path.join(__dirname, 'listings.json');
const SUBMISSION_PATH = path.join(__dirname, 'submission.json');

// Exact hardcoded arrays from Phase 2 forensics
const corrupt_ids = [
  '100-5000050', '100-5000339', '100-5002758', '100-5003364', '100-5003914', '100-5004028',
  'DWE-5000518', 'DWE-5001781', 'DWE-5001929', 'DWE-5001932', 'DWE-5002147', 'DWE-5002309',
  'DWE-5002623', 'DWE-5003926', 'MAG-5000193', 'MAG-5000775', 'MAG-5001549', 'MAG-5001852',
  'MAG-5001874', 'MAG-5002204', 'MAG-5003706', 'SQU-5000538', 'SQU-5001700', 'SQU-5001891',
  'SQU-5002700', 'SQU-5003006', 'SQU-5003244', 'SQU-5003458', 'SQU-5003909', 'ZER-5001536',
  'ZER-5002788', 'ZER-5003818', 'ZER-5004007'
];

const fake_ids = [
  'DWE-5000622', 'DWE-5000893', 'DWE-5001600', 'DWE-5003025', 'DWE-5003030',
  'MAG-5002355', 'MAG-5002371', 'MAG-5003431', 'SQU-5002463', 'ZER-5001089',
  'ZER-5001249'
];

function runPhase3Final() {
  console.log('================================================================');
  console.log('       IVY HOMES — PHASE 3 FINAL SUBMISSION GENERATOR           ');
  console.log('================================================================\n');

  // ----------------------------------------------------------------
  // Step 1: Calculate Question 6 (avg_price_per_sqft_2bhk)
  // ----------------------------------------------------------------
  console.log('Step 1: Calculating Question 6 (avg_price_per_sqft_2bhk)...');
  const listings = JSON.parse(fs.readFileSync(LISTINGS_PATH, 'utf-8'));

  const corruptLookup = new Set(corrupt_ids);
  const fakeLookup = new Set(fake_ids);

  // Filter for records where is_live === true AND bedroom === 2, excluding corrupt and fake IDs
  const valid2bhkListings = listings.filter((l) => {
    if (l.is_live !== true) return false;
    if (l.bedroom !== 2) return false;
    if (!l.carpet_area || l.carpet_area <= 0) return false;
    if (!l.price || l.price <= 0) return false;
    if (corruptLookup.has(l.listing_id)) return false;
    if (fakeLookup.has(l.listing_id)) return false;
    return true;
  });

  const totalSumPricePerSqft = valid2bhkListings.reduce(
    (acc, l) => acc + (l.price / l.carpet_area),
    0
  );

  const mean = totalSumPricePerSqft / valid2bhkListings.length;
  const avg_price_per_sqft_2bhk = Number(mean.toFixed(2));

  console.log(`- Eligible 2BHK listings evaluated: ${valid2bhkListings.length}`);
  console.log(`- Arithmetic mean:                 ${mean}`);
  console.log(`- Final Question 6 value:          ₹${avg_price_per_sqft_2bhk}/sqft\n`);

  // ----------------------------------------------------------------
  // Step 2: Assemble the Submission Object
  // ----------------------------------------------------------------
  console.log('Step 2: Assembling candidate and answers object...');

  const apiKey = 'IVY26-A3B2763F67F9';
  const candidate = {
    name: 'Sarthak Agrawal',
    email: '20234225@mnnit.ac.in',
    repo_url: 'https://github.com/SA1024ag/IvyHomestask20234225',
    demo_url: ''
  };

  const answers = {
    total_listing_records: 5100,
    unique_properties: 5079,
    active_listings: 4017,
    corrupt_listing_ids: corrupt_ids,
    total_monthly_rent: 8859500,
    avg_price_per_sqft_2bhk: avg_price_per_sqft_2bhk,
    costliest_project: {
      project_id: 'P50016',
      price_max_inr: 124400000
    },
    listings_last_7_days: 167,
    fake_listing_ids: fake_ids,
    projects_with_wrong_listing_count: 446
  };

  // ----------------------------------------------------------------
  // Step 3: Write the Findings Array
  // ----------------------------------------------------------------
  console.log('Step 3: Constructing findings array mapping all 10 discoveries...');

  const findings = [
    {
      endpoint: '*',
      category: 'auth',
      documented: 'Append it as a query parameter: GET /v1/listings?api_key=IVY26-XXXXXXXXXXXX',
      actual: 'Query parameter returns 401. Requires X-API-Key header',
      how_found: 'Live network test against /v1/listings?api_key=...',
      impact: 'Authentication fails',
      evidence: []
    },
    {
      endpoint: '/v1/favourites',
      category: 'missing_endpoint',
      documented: 'Saved properties endpoint managed via GET/POST/DELETE /v1/favourites',
      actual: 'Returns 404, feature actually lives at /v1/saved',
      how_found: 'Live network test querying /v1/favourites vs /v1/saved',
      impact: 'Cannot save properties via documented path',
      evidence: []
    },
    {
      endpoint: '/v1/listings',
      category: 'filters',
      documented: 'Filters for furnishing, min_price, max_price',
      actual: 'These parameters are silently ignored by the server',
      how_found: 'Live network test against ?furnishing=fully-furnished',
      impact: 'Requires client-side filtering fallback',
      evidence: []
    },
    {
      endpoint: '/v1/listings',
      category: 'sorting',
      documented: 'order parameter accepts desc',
      actual: 'order=desc is silently ignored, always sorts asc',
      how_found: 'Live network test querying ?sort_by=price&order=desc',
      impact: 'Sorting UI will fail without client-side override',
      evidence: []
    },
    {
      endpoint: '/v1/projects',
      category: 'units',
      documented: 'price_min and price_max are in rupees',
      actual: 'Values are in floating-point Crores',
      how_found: 'Inspecting projects.json payload',
      impact: 'Prices display incorrectly unless multiplied by 10,000,000',
      evidence: ['P50001', 'P50002']
    },
    {
      endpoint: '/v1/listings',
      category: 'completeness',
      documented: 'Inactive listings are excluded server side',
      actual: 'Returns records with is_live: false',
      how_found: 'Counting records in listings.json',
      impact: 'Leaked inactive properties shown to users',
      evidence: ['ZER-5004068', 'SQU-5001676', '100-5003165', 'DWE-5003578', 'DWE-5002882']
    },
    {
      endpoint: '/v1/listings',
      category: 'duplicates',
      documented: 'each listing corresponds to exactly one physical property',
      actual: 'Identical properties duplicated across broker websites',
      how_found: 'Matching composite fingerprints of physical traits',
      impact: 'Bloated search results',
      evidence: ['MAG-5005024', 'MAG-5002602']
    },
    {
      endpoint: '/v1/listings',
      category: 'data_quality',
      documented: 'API is honest and healthy data',
      actual: 'Contains impossible data (negative prices, floors > total floors)',
      how_found: 'Scanning payload for physical impossibilities',
      impact: 'Breaks frontend UI formatting and metrics',
      evidence: corrupt_ids.slice(0, 20)
    },
    {
      endpoint: '/v1/listings',
      category: 'fraud',
      documented: 'genuine properties',
      actual: 'Extreme low price per sqft clickbait/lead-generation',
      how_found: 'Calculating price per sqft outliers',
      impact: 'Users tricked by fake bait listings',
      evidence: fake_ids
    },
    {
      endpoint: '/v1/projects',
      category: 'consistency',
      documented: 'total_listings agrees with GET /v1/listings?project_id',
      actual: 'Count mismatches the actual number of listings returned',
      how_found: 'Comparing project total_listings to actual listing occurrences',
      impact: 'Misleading availability counts in UI',
      evidence: ['P50001', 'P50004', 'P50008', 'P50011', 'P50014']
    }
  ];

  // ----------------------------------------------------------------
  // Step 4: Write to Disk
  // ----------------------------------------------------------------
  const finalSubmission = {
    api_key: apiKey,
    candidate: candidate,
    answers: answers,
    findings: findings
  };

  fs.writeFileSync(SUBMISSION_PATH, JSON.stringify(finalSubmission, null, 2), 'utf-8');

  console.log('================================================================');
  console.log(' SUCCESS: Complete submission.json successfully written to disk!');
  console.log(' File Path:       ' + SUBMISSION_PATH);
  console.log(' Candidate Name:  ' + candidate.name);
  console.log(' Candidate Email: ' + candidate.email);
  console.log(' Answers Count:   ' + Object.keys(answers).length);
  console.log(' Findings Count:  ' + findings.length);
  console.log('================================================================\n');

  console.log('Final Answers Object:');
  console.log(JSON.stringify(answers, null, 2));
}

runPhase3Final();
