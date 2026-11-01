import db from '../db/index.js';
import { sanitizeString } from '../utils/crypto.js';

const VALID_STATES = ['SAFE', 'CAUTION', 'THREAT', 'EMERGENCY', 'RECOVERED'];

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const incidentsController = {
  createIncident(req, body, res, user, sendJson) {
    const state = (body.state || '').toUpperCase();
    if (!VALID_STATES.includes(state)) {
      sendJson(res, 400, {
        success: false,
        error: `Invalid safety state. Must be one of: ${VALID_STATES.join(', ')}`,
      });
      return;
    }

    const title = sanitizeString(body.title || 'Safety Event', 120);
    const description = sanitizeString(body.description || '', 500);

    let latitude = null;
    let longitude = null;
    if (typeof body.latitude === 'number' && body.latitude >= -90 && body.latitude <= 90) {
      latitude = body.latitude;
    }
    if (typeof body.longitude === 'number' && body.longitude >= -180 && body.longitude <= 180) {
      longitude = body.longitude;
    }

    const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')
      .split(',')[0]
      .trim();
    const userId = user ? user.id : null;

    // Deduplicate rapid repeat SOS requests (within 20 seconds) from the same user/IP
    if (state === 'EMERGENCY') {
      const twentySecsAgo = new Date(Date.now() - 20 * 1000).toISOString();
      const existingQuery = userId
        ? 'SELECT * FROM incident_logs WHERE safety_state = ? AND created_at > ? AND user_id = ? ORDER BY created_at DESC LIMIT 1'
        : 'SELECT * FROM incident_logs WHERE safety_state = ? AND created_at > ? AND client_ip = ? ORDER BY created_at DESC LIMIT 1';
      const existingParams = userId ? ['EMERGENCY', twentySecsAgo, userId] : ['EMERGENCY', twentySecsAgo, clientIp];
      const recentEmergency = db.prepare(existingQuery).get(...existingParams);

      if (recentEmergency) {
        if (latitude !== null && longitude !== null) {
          db.prepare('UPDATE incident_logs SET latitude = ?, longitude = ? WHERE id = ?').run(
            latitude,
            longitude,
            recentEmergency.id
          );
          recentEmergency.latitude = latitude;
          recentEmergency.longitude = longitude;
        }

        sendJson(res, 200, {
          success: true,
          message: 'Active emergency incident updated with latest telemetry (deduplicated)',
          data: recentEmergency,
          isDuplicate: true,
        });
        return;
      }
    }

    const id = `inc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO incident_logs (id, user_id, safety_state, event_title, event_description, latitude, longitude, client_ip, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, userId, state, title, description, latitude, longitude, clientIp, now);

    const created = db.prepare('SELECT * FROM incident_logs WHERE id = ?').get(id);
    sendJson(res, 201, {
      success: true,
      message: 'Safety incident logged successfully',
      data: created,
    });
  },

  getIncidents(req, res, user, sendJson) {
    if (!user) {
      // Unauthenticated visitor gets recent anonymous ledger (coordinates excluded for privacy)
      const stmt = db.prepare(
        'SELECT id, safety_state, event_title, event_description, created_at FROM incident_logs ORDER BY created_at DESC LIMIT 10'
      );
      const data = stmt.all();
      sendJson(res, 200, { success: true, count: data.length, data });
      return;
    }

    // Authenticated user gets their incidents
    const stmt = db.prepare('SELECT * FROM incident_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 50');
    const data = stmt.all(user.id);
    sendJson(res, 200, { success: true, count: data.length, data });
  },

  getSafePlaces(req, res, sendJson, searchParams = null) {
    const stmt = db.prepare('SELECT * FROM safe_places ORDER BY distance ASC');
    const rows = stmt.all();

    // Check for optional geolocation query parameters: ?lat=...&lng=...
    let queryLat = null;
    let queryLng = null;
    if (searchParams) {
      const parsedLat = parseFloat(searchParams.get('lat'));
      const parsedLng = parseFloat(searchParams.get('lng'));
      if (!isNaN(parsedLat) && parsedLat >= -90 && parsedLat <= 90) {
        queryLat = parsedLat;
      }
      if (!isNaN(parsedLng) && parsedLng >= -180 && parsedLng <= 180) {
        queryLng = parsedLng;
      }
    }

    const hasUserCoords = queryLat !== null && queryLng !== null;

    const formatted = rows.map((r) => {
      let safetyTags = [];
      let features = [];
      try {
        safetyTags = JSON.parse(r.safety_tags);
      } catch {
        safetyTags = [];
      }
      try {
        features = JSON.parse(r.features);
      } catch {
        features = [];
      }

      let distanceStr = r.distance;
      let timeEstStr = r.time_est;
      let distanceKm = null;
      let isLocal = false;
      let regionNotice = 'Verified Safety Haven Registry. Enable device GPS for localized distance.';

      if (hasUserCoords && typeof r.latitude === 'number' && typeof r.longitude === 'number') {
        distanceKm = haversineDistanceKm(queryLat, queryLng, r.latitude, r.longitude);
        isLocal = distanceKm <= 25;
        distanceStr = distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m away` : `${distanceKm.toFixed(1)} km away`;
        timeEstStr = `${Math.max(1, Math.round(distanceKm * 12))} min walk`;
        regionNotice = isLocal ? null : 'Verified Haven (Outside your immediate area)';
      }

      return {
        ...r,
        distance: distanceStr,
        timeEst: timeEstStr,
        distanceKm: distanceKm !== null ? parseFloat(distanceKm.toFixed(2)) : null,
        isLocal,
        regionNotice,
        city: 'Delhi NCR',
        verifiedSource: 'Delhi NCR Municipal & Campus Safety Registry',
        isVerified: Boolean(r.is_verified),
        safetyTags,
        features,
      };
    });

    if (hasUserCoords) {
      formatted.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    sendJson(res, 200, {
      success: true,
      count: formatted.length,
      data: formatted,
    });
  },
};
