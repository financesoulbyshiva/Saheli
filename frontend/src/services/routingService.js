/**
 * OSRM Routing & Distance Service for SAHELI
 * Calculates real walking routes, turn geometry, distance, and duration
 * using Project-OSRM open routing API (zero-cost).
 * Public OSRM demo server: https://router.project-osrm.org
 * Note: Intended for demonstration / prototype use; no guaranteed production SLA.
 */

import { calculateHaversineDistance } from './overpassService';

const routeCache = new Map();
const CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes

/**
 * Format walking duration from seconds
 */
export function formatDurationMinutes(seconds) {
  if (!seconds || seconds <= 0) return 'Immediate';
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min walk`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m walk`;
}

/**
 * Format distance from meters
 */
export function formatDistanceMeters(meters) {
  if (meters === null || meters === undefined) return 'Unknown distance';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Fetch real route from OSRM between two geographic points
 * @param {object} origin { lat: number, lng: number }
 * @param {object} destination { lat: number, lng: number }
 * @param {string} [profile='walking'] 'walking' or 'driving'
 * @returns {Promise<{success: boolean, route?: object, error?: string, isCached?: boolean}>}
 */
export async function getRoutePreview(origin, destination, profile = 'walking') {
  if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
    return { success: false, error: 'Valid origin and destination coordinates are required.' };
  }

  const cacheKey = `${profile}:${origin.lat.toFixed(4)},${origin.lng.toFixed(4)}->${destination.lat.toFixed(4)},${destination.lng.toFixed(4)}`;
  const now = Date.now();
  const cached = routeCache.get(cacheKey);

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return { success: true, route: cached.route, isCached: true };
  }

  const straightLineKm = calculateHaversineDistance(
    origin.lat,
    origin.lng,
    destination.lat,
    destination.lng
  );

  try {
    // Coordinate format for OSRM: {longitude},{latitude};{longitude},{latitude}
    const coordsStr = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
    const url = `https://router.project-osrm.org/route/v1/${profile}/${coordsStr}?overview=full&geometries=geojson&steps=false`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        error: `OSRM routing service returned HTTP ${response.status}.`,
        straightLineDistanceKm: straightLineKm,
      };
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      return {
        success: false,
        error: data.message || 'No walkable road route found between these locations.',
        straightLineDistanceKm: straightLineKm,
      };
    }

    const route = data.routes[0];
    // Convert GeoJSON [lng, lat] coordinates into Leaflet [lat, lng] array
    const coordinates = (route.geometry?.coordinates || []).map(([lng, lat]) => [lat, lng]);

    const routeData = {
      coordinates,
      distanceMeters: route.distance,
      distanceFormatted: formatDistanceMeters(route.distance),
      durationSeconds: route.duration,
      durationFormatted: formatDurationMinutes(route.duration),
      straightLineDistanceKm: straightLineKm !== null ? Number(straightLineKm.toFixed(2)) : null,
      provider: 'Project-OSRM Walking Router (OpenStreetMap data)',
      profile,
    };

    routeCache.set(cacheKey, { timestamp: now, route: routeData });

    return { success: true, route: routeData, isCached: false };
  } catch (err) {
    if (err.name === 'AbortError') {
      return {
        success: false,
        error: 'Routing request timed out.',
        straightLineDistanceKm: straightLineKm,
      };
    }
    return {
      success: false,
      error: `Routing error: ${err.message || 'Unable to connect to OSRM router'}`,
      straightLineDistanceKm: straightLineKm,
    };
  }
}
