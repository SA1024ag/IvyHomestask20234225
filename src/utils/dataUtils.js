/**
 * dataUtils.js — Shared data integrity utilities
 *
 * Handles:
 *  1. Deduplication of cross-site listings (5,100 → 5,079 unique homes)
 *  2. Lat/lon swap correction for 11 affected records
 *  3. Fake listing ID filtering (11 confirmed fake records from submission.json)
 *  4. Google Maps URL generation from real coordinates
 */

// ─── Fake Listing IDs (confirmed via forensic API audit) ────────────────────
// Source: submission.json → answers.fake_listing_ids
export const FAKE_LISTING_IDS = new Set([
  'DWE-5000622',
  'DWE-5000893',
  'DWE-5001600',
  'DWE-5003025',
  'DWE-5003030',
  'MAG-5002355',
  'MAG-5002371',
  'MAG-5003431',
  'SQU-5002463',
  'ZER-5001089',
  'ZER-5001249',
]);

/**
 * Remove the 11 confirmed fake listings from the raw dataset.
 * @param {Array} listings - Raw listings array
 * @returns {Array} Listings with fake records removed
 */
export function filterFakeListings(listings) {
  return listings.filter((l) => !FAKE_LISTING_IDS.has(l.listing_id));
}

/**
 * Deduplicate cross-site listings. 21 properties are listed on multiple
 * portals (e.g. both Squarelane and MagicHomes) with identical physical
 * attributes. We keep the first occurrence (preserving listing_id variety)
 * and drop the rest.
 *
 * Deduplication key: apartment_name + locality + bedroom + floor + carpet_area
 * Result: 5,100 → 5,079 unique residential homes
 *
 * @param {Array} listings - Already fake-filtered listings array
 * @returns {Array} Deduplicated canonical listing array
 */
export function deduplicateListings(listings) {
  const seen = new Map();
  const canonical = [];

  for (const l of listings) {
    const key = [
      (l.apartment_name || '').toLowerCase().trim(),
      (l.locality || '').toLowerCase().trim(),
      String(l.bedroom ?? ''),
      String(l.floor ?? ''),
      String(l.carpet_area ?? ''),
    ].join('|');

    if (!seen.has(key)) {
      seen.set(key, true);
      canonical.push(l);
    }
  }

  return canonical;
}

/**
 * Fix swapped lat/lon coordinates. 11 listings in the raw dataset have
 * latitude and longitude values transposed — the lat field contains a
 * longitude value (~72-73) and the lon field contains a latitude value (~18-19).
 *
 * Detection heuristic: if latitude > 70, it's actually a Mumbai longitude.
 *
 * @param {Object} item - A single listing/rental/project record
 * @returns {Object} Record with corrected lat/lon (mutates a copy)
 */
export function fixCoordinates(item) {
  const lat = Number(item.latitude);
  const lon = Number(item.longitude);

  // If the "latitude" field is in the Mumbai longitude range (70–75),
  // the values are swapped — correct them.
  if (lat > 70 && lat < 75) {
    return {
      ...item,
      latitude: lon,   // was stored in longitude field
      longitude: lat,  // was stored in latitude field
    };
  }

  return item;
}

/**
 * Apply fixCoordinates to an entire array of records.
 * @param {Array} items
 * @returns {Array}
 */
export function fixAllCoordinates(items) {
  return items.map(fixCoordinates);
}

/**
 * Generate a Google Maps search URL for a lat/lon coordinate.
 * Opens Google Maps pinned to the property's real-world location.
 *
 * @param {number|string} lat
 * @param {number|string} lon
 * @param {string} [label] - Optional label for the pin
 * @returns {string} Google Maps URL
 */
export function getGoogleMapsUrl(lat, lon, label = '') {
  const latN = Number(lat);
  const lonN = Number(lon);

  if (!latN || !lonN || isNaN(latN) || isNaN(lonN)) {
    // Fallback: search by label name in Mumbai
    const query = encodeURIComponent(label ? `${label}, Mumbai` : 'Mumbai');
    return `https://www.google.com/maps/search/${query}`;
  }

  const encoded = encodeURIComponent(label || '');
  if (encoded) {
    return `https://www.google.com/maps/search/${encoded}/@${latN},${lonN},17z`;
  }
  return `https://www.google.com/maps?q=${latN},${lonN}`;
}

/**
 * Mumbai locality approximate center coordinates (for map default centers).
 */
export const LOCALITY_CENTERS = {
  'andheri west':   { lat: 19.1380, lng: 72.8261 },
  'bandra east':    { lat: 19.0580, lng: 72.8537 },
  'borivali west':  { lat: 19.2295, lng: 72.8502 },
  'chembur':        { lat: 19.0620, lng: 72.9019 },
  'goregaon east':  { lat: 19.1623, lng: 72.8637 },
  'kandivali east': { lat: 19.2096, lng: 72.8648 },
  'malad west':     { lat: 19.1875, lng: 72.8486 },
  'mulund west':    { lat: 19.1720, lng: 72.9566 },
  'powai':          { lat: 19.1176, lng: 72.9060 },
  'thane west':     { lat: 19.2183, lng: 72.9781 },
};

/** Mumbai city center */
export const MUMBAI_CENTER = { lat: 19.0760, lng: 72.8777 };
