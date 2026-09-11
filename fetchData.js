const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://solve.ivy.homes';
const API_KEY = process.env.IVY_API_KEY || 'IVY26-A3B2763F67F9';
const DEFAULT_PASSWORD = process.env.IVY_PASSWORD || 'b42f2e3a58';
const LIMIT = 200; // API server caps this to max allowed (50)

const ENDPOINTS = [
  { name: 'listings', path: '/v1/listings', file: 'listings.json' },
  { name: 'rentals', path: '/v1/rentals', file: 'rentals.json' },
  { name: 'projects', path: '/v1/projects', file: 'projects.json' }
];

async function login(password) {
  const loginUrl = `${BASE_URL}/auth/login?api_key=${API_KEY}`;
  console.log(`[auth] Logging in as demo1@ivy.homes...`);

  const res = await fetch(loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({
      email: 'demo1@ivy.homes',
      password: password
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Login failed (${res.status}): ${JSON.stringify(data)}`);
  }

  // Live API returns access_token (documentation stated token)
  const token = data.access_token || data.token;
  if (!token) {
    throw new Error(`No access token returned in login response: ${JSON.stringify(data)}`);
  }

  console.log(`[auth] Login successful! Token acquired (valid for ${data.expires_in}s).`);
  return token;
}

async function fetchEndpointData(endpoint, authToken) {
  const results = [];
  let offset = 0;
  let page = 1;

  console.log(`\n========================================`);
  console.log(`Fetching ${endpoint.name} from ${endpoint.path}...`);
  console.log(`========================================`);

  while (true) {
    const url = new URL(`${BASE_URL}${endpoint.path}`);
    url.searchParams.set('api_key', API_KEY);
    url.searchParams.set('limit', String(LIMIT));
    url.searchParams.set('offset', String(offset));
    url.searchParams.set('page', String(page)); // Send page as well for compatibility

    const headers = {
      'X-API-Key': API_KEY,
      'Authorization': `Bearer ${authToken}`
    };

    process.stdout.write(`[${endpoint.name}] Fetching offset ${offset} (page ${page})... `);
    const res = await fetch(url.toString(), { headers });

    if (!res.ok) {
      const errorText = await res.text();
      console.log(`Failed! (${res.status})`);
      throw new Error(`Request to ${url.toString()} failed with status ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    const pageResults = Array.isArray(data) ? data : (data.results || []);

    console.log(`Got ${pageResults.length} records. (Total accumulated: ${results.length + pageResults.length}/${data.total || '?'})`);

    if (pageResults.length === 0) {
      console.log(`[${endpoint.name}] Results array is empty. Completed.`);
      break;
    }

    results.push(...pageResults);
    offset += pageResults.length;
    page++;

    // Stop if server indicates no more records exist or reached reported total
    if (data.has_more === false) {
      console.log(`[${endpoint.name}] Server reported has_more: false. Completed.`);
      break;
    }
    if (typeof data.total === 'number' && results.length >= data.total) {
      console.log(`[${endpoint.name}] Reached total count of ${data.total}. Completed.`);
      break;
    }
  }

  return results;
}

async function main() {
  const password = process.argv[2] || DEFAULT_PASSWORD;
  const token = await login(password);

  for (const endpoint of ENDPOINTS) {
    const data = await fetchEndpointData(endpoint, token);
    const outputPath = path.join(__dirname, endpoint.file);
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`[saved] Successfully wrote ${data.length} records to ${endpoint.file}`);
  }

  console.log('\n========================================');
  console.log('All datasets successfully fetched and saved!');
  console.log('========================================\n');
}

main().catch((err) => {
  console.error('\nError:', err.message);
  process.exit(1);
});
