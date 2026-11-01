/**
 * OpenStreetMap Overpass API Service for SAHELI
 * Live discovery of actual emergency facilities, hospitals, police,
 * ambulance, fire stations, pharmacies, and women's support centers.
 * Zero-cost, public OpenStreetMap geospatial data under ODbL license.
 */

// In-memory cache to respect Overpass public usage policies (10-minute cache)
const overpassCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

/**
 * Category tag queries for Overpass QL
 */
const CATEGORY_FILTERS = {
  police: `
    node["amenity"="police"](around:{{radius}},{{lat}},{{lng}});
    way["amenity"="police"](around:{{radius}},{{lat}},{{lng}});
  `,
  hospital: `
    node["amenity"="hospital"](around:{{radius}},{{lat}},{{lng}});
    way["amenity"="hospital"](around:{{radius}},{{lat}},{{lng}});
    node["amenity"="clinic"](around:{{radius}},{{lat}},{{lng}});
    way["amenity"="clinic"](around:{{radius}},{{lat}},{{lng}});
  `,
  ambulance: `
    node["emergency"="ambulance_station"](around:{{radius}},{{lat}},{{lng}});
    way["emergency"="ambulance_station"](around:{{radius}},{{lat}},{{lng}});
  `,
  fire_station: `
    node["amenity"="fire_station"](around:{{radius}},{{lat}},{{lng}});
    way["amenity"="fire_station"](around:{{radius}},{{lat}},{{lng}});
  `,
  pharmacy: `
    node["amenity"="pharmacy"](around:{{radius}},{{lat}},{{lng}});
    way["amenity"="pharmacy"](around:{{radius}},{{lat}},{{lng}});
  `,
  women_support: `
    node["social_facility"="shelter"](around:{{radius}},{{lat}},{{lng}});
    way["social_facility"="shelter"](around:{{radius}},{{lat}},{{lng}});
    node["social_facility:for"="women"](around:{{radius}},{{lat}},{{lng}});
    way["social_facility:for"="women"](around:{{radius}},{{lat}},{{lng}});
    node["amenity"="community_centre"]["community_centre:for"="women"](around:{{radius}},{{lat}},{{lng}});
  `,
  essential: `
    node["amenity"="toilets"](around:{{radius}},{{lat}},{{lng}});
    node["amenity"="fuel"](around:{{radius}},{{lat}},{{lng}});
    node["amenity"="bus_station"](around:{{radius}},{{lat}},{{lng}});
    node["railway"="station"](around:{{radius}},{{lat}},{{lng}});
  `,
};

/**
 * Calculate Great-Circle Distance via Haversine Formula (km)
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (
    typeof lat1 !== 'number' ||
    typeof lon1 !== 'number' ||
    typeof lat2 !== 'number' ||
    typeof lon2 !== 'number'
  ) {
    return null;
  }
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Maps OSM tag combinations to standardized SAHELI category labels
 */
function determineFacilityCategory(tags) {
  if (tags.amenity === 'police') return 'Police';
  if (tags.amenity === 'hospital') return 'Hospital';
  if (tags.amenity === 'clinic') return 'Hospital';
  if (tags.emergency === 'ambulance_station') return 'Ambulance';
  if (tags.amenity === 'fire_station') return 'Fire Station';
  if (tags.amenity === 'pharmacy') return 'Pharmacy';
  if (
    tags.social_facility === 'shelter' ||
    tags['social_facility:for'] === 'women' ||
    tags['community_centre:for'] === 'women'
  ) {
    return "Women's Support";
  }
  if (tags.amenity === 'fuel') return 'Petrol Pump';
  if (tags.amenity === 'toilets') return 'Public Restroom';
  if (tags.amenity === 'bus_station' || tags.railway === 'station') return 'Transit Station';
  return 'Essential Facility';
}

/**
 * Cleanly format OSM address tags
 */
function formatOsmAddress(tags) {
  const parts = [];
  if (tags['addr:housenumber'] || tags['addr:street']) {
    parts.push([tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' '));
  }
  if (tags['addr:suburb']) parts.push(tags['addr:suburb']);
  if (tags['addr:city'] || tags['addr:town'] || tags['addr:village']) {
    parts.push(tags['addr:city'] || tags['addr:town'] || tags['addr:village']);
  }
  if (tags['addr:state']) parts.push(tags['addr:state']);
  if (tags['addr:postcode']) parts.push(tags['addr:postcode']);

  return parts.length > 0 ? parts.join(', ') : 'Address mapped on OpenStreetMap';
}

/**
 * Fetch nearby emergency services from Overpass API
 * @param {object} options
 * @param {number} options.latitude User's verified latitude
 * @param {number} options.longitude User's verified longitude
 * @param {number} [options.radiusMeters=5000] Search radius in meters (max 15000)
 * @param {string} [options.category='all'] Category key ('all', 'police', 'hospital', 'ambulance', 'fire_station', 'pharmacy', 'women_support', 'essential')
 * @returns {Promise<{success: boolean, data?: array, error?: string, isCached?: boolean}>}
 */
export async function fetchNearbyEmergencyServices({
  latitude,
  longitude,
  radiusMeters = 5000,
  category = 'all',
}) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return { success: false, error: 'Valid numerical coordinates are required.' };
  }

  const radius = Math.min(Math.max(radiusMeters, 500), 15000);
  const cacheKey = `${latitude.toFixed(3)},${longitude.toFixed(3)}-${radius}-${category}`;
  const now = Date.now();
  const cached = overpassCache.get(cacheKey);

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return { success: true, data: cached.data, isCached: true };
  }

  // Construct Overpass query blocks based on requested category
  let queryParts = '';
  if (category === 'all') {
    queryParts = Object.values(CATEGORY_FILTERS).join('\n');
  } else if (CATEGORY_FILTERS[category]) {
    queryParts = CATEGORY_FILTERS[category];
  } else {
    queryParts = Object.values(CATEGORY_FILTERS).join('\n');
  }

  const populatedQuery = queryParts
    .replaceAll('{{radius}}', radius.toString())
    .replaceAll('{{lat}}', latitude.toString())
    .replaceAll('{{lng}}', longitude.toString());

  const fullOverpassQL = `
    [out:json][timeout:15];
    (
      ${populatedQuery}
    );
    out center tags;
  `;

  let lastError = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': 'SAHELI-WomenSafety-Platform/1.0',
        },
        body: `data=${encodeURIComponent(fullOverpassQL)}`,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          lastError = 'Public Overpass server rate limit reached. Trying fallback.';
          continue; // Try mirror
        }
        lastError = `Overpass returned status ${response.status}.`;
        continue;
      }

      const result = await response.json();
      const elements = result.elements || [];

      const parsedResults = [];
      const seenIds = new Set();

      for (const el of elements) {
        if (!el || seenIds.has(el.id)) continue;
        seenIds.add(el.id);

        const lat = el.lat ?? el.center?.lat;
        const lon = el.lon ?? el.center?.lon;
        if (lat === undefined || lon === undefined) continue;

        const tags = el.tags || {};
        const name =
          tags.name ||
          tags['name:en'] ||
          tags.operator ||
          tags.description ||
          `Unnamed ${determineFacilityCategory(tags)}`;

        const straightLineKm = calculateHaversineDistance(latitude, longitude, lat, lon);

        // Verified phone check: only extract actual mapped numbers
        const rawPhone = tags.phone || tags['contact:phone'] || tags['emergency:phone'] || null;
        const website = tags.website || tags['contact:website'] || null;
        const openingHours = tags.opening_hours || null;
        const categoryLabel = determineFacilityCategory(tags);

        parsedResults.push({
          id: `osm-${el.type}-${el.id}`,
          osmId: el.id,
          name,
          category: categoryLabel,
          latitude: lat,
          longitude: lon,
          address: formatOsmAddress(tags),
          straightLineDistanceKm: straightLineKm !== null ? Number(straightLineKm.toFixed(2)) : null,
          distanceFormatted:
            straightLineKm !== null
              ? straightLineKm < 1
                ? `${Math.round(straightLineKm * 1000)}m (aerial)`
                : `${straightLineKm.toFixed(1)} km (aerial)`
              : 'Unknown',
          phone: rawPhone,
          openingHours,
          website,
          dataSource: 'OpenStreetMap Contributors (ODbL)',
          isVerifiedOfficial: false, // Community-sourced
          lastUpdated: tags['check_date'] || tags['survey:date'] || 'Community mapped',
          rawTags: tags,
        });
      }

      // Sort by proximity (nearest first)
      parsedResults.sort((a, b) => (a.straightLineDistanceKm ?? 999) - (b.straightLineDistanceKm ?? 999));

      overpassCache.set(cacheKey, { timestamp: now, data: parsedResults });

      return {
        success: true,
        data: parsedResults,
        isCached: false,
        total: parsedResults.length,
      };
    } catch (err) {
      if (err.name === 'AbortError') {
        lastError = 'Overpass API request timed out.';
      } else {
        lastError = err.message || 'Network error querying OpenStreetMap.';
      }
    }
  }

  // Graceful Fallback: Query Nominatim for real community-mapped facilities if Overpass is unreachable
  try {
    const fallbackResults = await fetchNominatimEmergencyFallback({
      latitude,
      longitude,
      category,
    });

    if (fallbackResults && fallbackResults.length > 0) {
      overpassCache.set(cacheKey, { timestamp: now, data: fallbackResults });
      return {
        success: true,
        data: fallbackResults,
        isCached: false,
        total: fallbackResults.length,
        isFallback: true,
      };
    }
  } catch (fallbackErr) {
    console.warn('[OverpassService] Nominatim fallback failed:', fallbackErr.message);
  }

  return {
    success: false,
    error: lastError || 'Unable to connect to OpenStreetMap discovery servers.',
    data: [],
  };
}

/**
 * Fallback discovery querying Nominatim bounding box when Overpass mirrors are unavailable
 */
async function fetchNominatimEmergencyFallback({ latitude, longitude, category }) {
  const keywordMap = {
    police: 'police station',
    hospital: 'hospital',
    ambulance: 'ambulance',
    fire_station: 'fire station',
    pharmacy: 'pharmacy',
    women_support: 'women shelter',
    essential: 'public toilet',
  };

  const searchTerm = keywordMap[category] || (category === 'all' ? 'hospital' : category);
  const delta = 0.06; // ~6km bounding box
  const viewbox = `${longitude - delta},${latitude + delta},${longitude + delta},${latitude - delta}`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchTerm)}&format=json&limit=15&viewbox=${viewbox}&bounded=1`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'SAHELI-WomenSafety-Platform/1.0',
      Accept: 'application/json',
    },
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) return null;
  const items = await response.json();
  if (!Array.isArray(items) || items.length === 0) return null;

  const labelMap = {
    police: 'Police',
    hospital: 'Hospital',
    ambulance: 'Ambulance',
    fire_station: 'Fire Station',
    pharmacy: 'Pharmacy',
    women_support: "Women's Support",
    essential: 'Essential Facility',
  };

  return items.map((item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    const straightLineKm = calculateHaversineDistance(latitude, longitude, lat, lon);
    const nameParts = (item.display_name || '').split(',');
    const primaryName = nameParts[0]?.trim() || `Unnamed ${category}`;
    const restAddress = nameParts.slice(1).join(',').trim();

    return {
      id: `osm-nom-${item.osm_type || 'node'}-${item.osm_id || item.place_id}`,
      osmId: item.osm_id || item.place_id,
      name: primaryName,
      category: labelMap[category] || 'Emergency Service',
      latitude: lat,
      longitude: lon,
      address: restAddress || item.display_name,
      straightLineDistanceKm: straightLineKm !== null ? Number(straightLineKm.toFixed(2)) : null,
      distanceFormatted:
        straightLineKm !== null
          ? straightLineKm < 1
            ? `${Math.round(straightLineKm * 1000)}m (aerial)`
            : `${straightLineKm.toFixed(1)} km (aerial)`
          : 'Unknown',
      phone: null,
      openingHours: null,
      website: null,
      dataSource: 'OpenStreetMap via Nominatim Discovery (ODbL)',
      isVerifiedOfficial: false,
      lastUpdated: 'OpenStreetMap Registry',
      rawTags: {},
    };
  }).sort((a, b) => (a.straightLineDistanceKm ?? 999) - (b.straightLineDistanceKm ?? 999));
}
