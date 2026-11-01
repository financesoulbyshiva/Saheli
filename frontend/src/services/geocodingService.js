/**
 * Nominatim Geocoding Service for SAHELI
 * OpenStreetMap-powered forward & reverse geocoding.
 * Complies with Nominatim Usage Policy: https://operations.osmfoundation.org/policies/nominatim/
 * - Valid descriptive User-Agent
 * - Rate limited and client-side cached
 */

const geocodeCache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes cache for address queries
let lastRequestTime = 0;

/**
 * Throttle requests to strictly comply with Nominatim 1 req/sec policy
 */
async function throttleNominatim() {
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < 1000) {
    await new Promise((resolve) => setTimeout(resolve, 1000 - timeSinceLast));
  }
  lastRequestTime = Date.now();
}

/**
 * Forward Geocoding: Search places by name, address, city, landmark
 * @param {string} query
 * @returns {Promise<{success: boolean, results?: array, error?: string}>}
 */
export async function searchLocations(query) {
  const trimmed = (query || '').trim();
  if (!trimmed || trimmed.length < 2) {
    return { success: true, results: [] };
  }

  const cacheKey = `fwd:${trimmed.toLowerCase()}`;
  const now = Date.now();
  const cached = geocodeCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return { success: true, results: cached.results, isCached: true };
  }

  try {
    await throttleNominatim();

    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', trimmed);
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '6');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'SAHELI-WomenSafety-Platform/1.0',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        return { success: false, error: 'Location search rate limit exceeded. Please wait a moment.' };
      }
      return { success: false, error: `Geocoding returned HTTP ${response.status}.` };
    }

    const data = await response.json();
    const results = (data || []).map((item) => ({
      placeId: item.place_id,
      osmId: item.osm_id,
      displayName: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      type: item.type || item.class,
      address: {
        road: item.address?.road,
        suburb: item.address?.suburb,
        city: item.address?.city || item.address?.town || item.address?.village,
        state: item.address?.state,
        postcode: item.address?.postcode,
        country: item.address?.country,
      },
      boundingBox: item.boundingbox,
    }));

    geocodeCache.set(cacheKey, { timestamp: now, results });

    return { success: true, results, isCached: false };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { success: false, error: 'Location search timed out.' };
    }
    return { success: false, error: 'Failed to search location. Please check your connection.' };
  }
}

/**
 * Reverse Geocoding: Convert coordinates to human-readable address
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{success: boolean, address?: string, details?: object, error?: string}>}
 */
export async function reverseGeocode(latitude, longitude) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return { success: false, error: 'Invalid coordinates' };
  }

  const cacheKey = `rev:${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  const now = Date.now();
  const cached = geocodeCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return { success: true, address: cached.address, details: cached.details, isCached: true };
  }

  try {
    await throttleNominatim();

    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('lat', latitude.toString());
    url.searchParams.set('lon', longitude.toString());
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'SAHELI-WomenSafety-Platform/1.0',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { success: false, error: `Reverse geocoding error (${response.status})` };
    }

    const data = await response.json();
    const address = data.display_name || 'Mapped location';

    geocodeCache.set(cacheKey, { timestamp: now, address, details: data.address });

    return { success: true, address, details: data.address, isCached: false };
  } catch (err) {
    return { success: false, error: err.message || 'Reverse geocoding failed' };
  }
}
