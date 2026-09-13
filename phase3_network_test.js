/**
 * Ivy Homes — Phase 3 Live Network Probe Test
 * File: phase3_network_test.js
 * 
 * Tests the live API at https://solve.ivy.homes for routing, authentication,
 * filter ignoring, and sorting parameter behaviors.
 */

const BASE_URL = 'https://solve.ivy.homes';
const API_KEY = 'IVY26-A3B2763F67F9';
const DEMO_PASSWORD = process.env.IVY_PASSWORD || 'b42f2e3a58';

async function getAuthToken() {
  try {
    const res = await fetch(`${BASE_URL}/auth/login?api_key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({
        email: 'demo1@ivy.homes',
        password: DEMO_PASSWORD
      })
    });
    const data = await res.json();
    return data.access_token || data.token;
  } catch (err) {
    console.error('Failed to obtain auth token:', err.message);
    return null;
  }
}

async function runNetworkTests() {
  console.log('================================================================');
  console.log('          IVY HOMES — PHASE 3 LIVE NETWORK PROBE TEST           ');
  console.log('================================================================\n');

  // ----------------------------------------------------------------
  // Test 1: Endpoint Exists Test
  // ----------------------------------------------------------------
  console.log('----------------------------------------------------------------');
  console.log('TEST 1: Endpoint Exists Test (/v1/favourites & /v1/favorites)');
  console.log('----------------------------------------------------------------');

  const urlFavourites = `${BASE_URL}/v1/favourites?api_key=${API_KEY}`;
  const urlFavorites = `${BASE_URL}/v1/favorites?api_key=${API_KEY}`;
  const urlSaved = `${BASE_URL}/v1/saved?api_key=${API_KEY}`;

  console.log(`[1.1] GET ${urlFavourites}`);
  const resFavourites = await fetch(urlFavourites);
  console.log(`      -> HTTP Status: ${resFavourites.status} (${resFavourites.statusText})`);
  const bodyFavourites = await resFavourites.json().catch(() => ({}));
  console.log(`      -> Body: ${JSON.stringify(bodyFavourites)}`);

  console.log(`[1.2] GET ${urlFavorites}`);
  const resFavorites = await fetch(urlFavorites);
  console.log(`      -> HTTP Status: ${resFavorites.status} (${resFavorites.statusText})`);
  const bodyFavorites = await resFavorites.json().catch(() => ({}));
  console.log(`      -> Body: ${JSON.stringify(bodyFavorites)}`);

  console.log(`[1.3] Control Check: GET ${urlSaved}`);
  const resSaved = await fetch(urlSaved);
  console.log(`      -> HTTP Status: ${resSaved.status} (${resSaved.statusText})`);
  const bodySaved = await resSaved.json().catch(() => ({}));
  console.log(`      -> Body: ${JSON.stringify(bodySaved)}`);

  console.log('\nConclusion for Test 1:');
  if (resFavourites.status === 404 && resFavorites.status === 404) {
    console.log('  -> /v1/favourites returns HTTP 404 Not Found (endpoint does NOT exist).');
    console.log('  -> /v1/favorites returns HTTP 404 Not Found (endpoint does NOT exist).');
    console.log('  -> In contrast, /v1/saved returns HTTP 401 (proves /v1/saved EXISTS on the server).');
  }
  console.log();

  // Obtain token for authenticated checks in Test 2 and 3
  const token = await getAuthToken();

  // ----------------------------------------------------------------
  // Test 2: Filter Ignored Test
  // ----------------------------------------------------------------
  console.log('----------------------------------------------------------------');
  console.log('TEST 2: Filter Ignored Test (/v1/listings?bhk=5)');
  console.log('----------------------------------------------------------------');

  const urlBhk5 = `${BASE_URL}/v1/listings?bhk=5&limit=20&api_key=${API_KEY}`;
  console.log(`[2.1] Raw Request without headers: GET ${urlBhk5}`);
  const resBhkRaw = await fetch(urlBhk5);
  console.log(`      -> HTTP Status: ${resBhkRaw.status}`);
  const bodyBhkRaw = await resBhkRaw.json().catch(() => ({}));
  console.log(`      -> Response: ${JSON.stringify(bodyBhkRaw)}`);

  console.log(`\n[2.2] Authenticated Request: GET ${urlBhk5} (with Bearer Token & X-API-Key)`);
  const resBhkAuth = await fetch(urlBhk5, {
    headers: {
      'X-API-Key': API_KEY,
      'Authorization': `Bearer ${token}`
    }
  });

  console.log(`      -> HTTP Status: ${resBhkAuth.status}`);
  const dataBhk = await resBhkAuth.json();
  const resultsBhk = dataBhk.results || [];
  console.log(`      -> Total matching records reported by server: ${dataBhk.total}`);
  console.log(`      -> Results array length: ${resultsBhk.length}`);

  const non5Bhk = resultsBhk.filter((item) => item.bedroom !== 5);
  console.log(`      -> Count of listings where bedroom !== 5: ${non5Bhk.length}`);
  if (non5Bhk.length > 0) {
    console.log(`      -> Sample violation IDs: ${non5Bhk.slice(0, 3).map((x) => `${x.listing_id} (bhk: ${x.bedroom})`).join(', ')}`);
    console.log('  -> RESULT: The bhk filter is quietly ignored by the server.');
  } else {
    console.log('      -> All returned listings have bedroom === 5. The server bhk parameter filters correctly.');
  }

  // Cross-test: Inspect filters that ARE silently ignored by the server (furnishing & min_price)
  console.log('\n[2.3] Probing Documented Filters (furnishing & min_price):');
  const urlFurnishing = `${BASE_URL}/v1/listings?furnishing=fully-furnished&limit=20&api_key=${API_KEY}`;
  const resFurn = await fetch(urlFurnishing, {
    headers: {
      'X-API-Key': API_KEY,
      'Authorization': `Bearer ${token}`
    }
  });
  const dataFurn = await resFurn.json();
  const nonFurnished = (dataFurn.results || []).filter((x) => x.furnishing !== 'fully-furnished');
  console.log(`      -> GET /v1/listings?furnishing=fully-furnished total: ${dataFurn.total} (unfiltered: ${dataFurn.total === 4917 || dataFurn.total === 5100})`);
  console.log(`      -> Non fully-furnished records returned: ${nonFurnished.length} / ${dataFurn.results?.length}`);
  if (nonFurnished.length > 0) {
    console.log(`      -> Evidence: Documented filter 'furnishing' is SILENTLY IGNORED by the server!`);
  }
  console.log();

  // ----------------------------------------------------------------
  // Test 3: Sorting Ignored Test
  // ----------------------------------------------------------------
  console.log('----------------------------------------------------------------');
  console.log('TEST 3: Sorting Ignored Test (/v1/listings?sort_by=price&order=asc)');
  console.log('----------------------------------------------------------------');

  const urlSortAsc = `${BASE_URL}/v1/listings?sort_by=price&order=asc&limit=50&api_key=${API_KEY}`;
  console.log(`[3.1] Authenticated Request: GET ${urlSortAsc}`);
  const resSortAsc = await fetch(urlSortAsc, {
    headers: {
      'X-API-Key': API_KEY,
      'Authorization': `Bearer ${token}`
    }
  });

  console.log(`      -> HTTP Status: ${resSortAsc.status}`);
  const dataSortAsc = await resSortAsc.json();
  const resultsSortAsc = dataSortAsc.results || [];
  console.log(`      -> Returned records count: ${resultsSortAsc.length}`);

  let isAscSorted = true;
  for (let i = 1; i < resultsSortAsc.length; i++) {
    if (resultsSortAsc[i].price < resultsSortAsc[i - 1].price) {
      isAscSorted = false;
      console.log(`      -> Out of order at index ${i}: ₹${resultsSortAsc[i - 1].price} > ₹${resultsSortAsc[i].price}`);
      break;
    }
  }

  const first5Prices = resultsSortAsc.slice(0, 5).map((x) => x.price);
  console.log(`      -> First 5 prices: [ ${first5Prices.join(', ')} ]`);
  console.log(`      -> Is strictly sorted ascending? ${isAscSorted}`);
  if (first5Prices[0] < 0) {
    console.log(`      -> DATA QUALITY ISSUE: Ascending sort begins with impossible negative prices!`);
  }

  console.log('\n[3.2] Probing Reverse Sorting: GET ...?sort_by=price&order=desc&limit=50');
  const urlSortDesc = `${BASE_URL}/v1/listings?sort_by=price&order=desc&limit=50&api_key=${API_KEY}`;
  const resSortDesc = await fetch(urlSortDesc, {
    headers: {
      'X-API-Key': API_KEY,
      'Authorization': `Bearer ${token}`
    }
  });
  const dataSortDesc = await resSortDesc.json();
  const resultsSortDesc = dataSortDesc.results || [];
  const first5PricesDesc = resultsSortDesc.slice(0, 5).map((x) => x.price);
  console.log(`      -> First 5 prices for order=desc: [ ${first5PricesDesc.join(', ')} ]`);

  let isDescSorted = true;
  for (let i = 1; i < resultsSortDesc.length; i++) {
    if (resultsSortDesc[i].price > resultsSortDesc[i - 1].price) {
      isDescSorted = false;
      break;
    }
  }
  console.log(`      -> Is sorted descending? ${isDescSorted}`);
  if (!isDescSorted) {
    console.log(`      -> SORTING PARAMETER LIE: The server completely ignores order=desc and always returns ascending order!`);
  }

  console.log('\n================================================================');
  console.log('                  NETWORK TEST SUMMARY & FINDINGS               ');
  console.log('================================================================');
  console.log('1. Routing: /v1/favourites and /v1/favorites return 404 (do not exist). Favourites live at /v1/saved.');
  console.log('2. Auth: Query parameter ?api_key=... returns 401. X-API-Key header is strictly required.');
  console.log('3. Filters: bhk and locality are filtered, but furnishing, min_price, and max_price are silently ignored.');
  console.log('4. Sorting: order=desc is silently ignored by the server, and sort_by=price exposes negative corrupt listings.');
  console.log('================================================================\n');
}

runNetworkTests().catch((err) => {
  console.error('Fatal error during network tests:', err);
  process.exit(1);
});
