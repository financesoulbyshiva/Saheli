import db from '../db/index.js';
import { checkRateLimit } from '../middleware/index.js';

export const locationController = {
  // 1. Share or update current location telemetry
  shareLocation(req, body, res, user, sendJson) {
    if (!user) {
      sendJson(res, 401, { success: false, error: 'Authentication required to share location' });
      return;
    }

    // Rate limit: 30 telemetry pings per minute per authenticated user
    const rateLimit = checkRateLimit(`loc-${user.id}`, 30, 60000);
    if (!rateLimit.allowed) {
      sendJson(res, 429, {
        success: false,
        error: 'Too many location updates. Please throttle telemetry pings.',
        retryAfterSeconds: rateLimit.resetSeconds,
      });
      return;
    }

    const lat = typeof body?.latitude === 'number' ? body.latitude : parseFloat(body?.latitude);
    const lng = typeof body?.longitude === 'number' ? body.longitude : parseFloat(body?.longitude);
    const accuracy = typeof body?.accuracy === 'number' ? Math.max(0, body.accuracy) : null;
    const durationMinutes = Math.min(1440, Math.max(5, parseInt(body?.durationMinutes || '60', 10)));

    if (isNaN(lat) || lat < -90 || lat > 90) {
      sendJson(res, 400, { success: false, error: 'Invalid latitude. Must be between -90 and 90.' });
      return;
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      sendJson(res, 400, { success: false, error: 'Invalid longitude. Must be between -180 and 180.' });
      return;
    }

    const now = Date.now();
    const expiresAt = now + durationMinutes * 60 * 1000;
    const nowIso = new Date().toISOString();
    const shareId = `loc-${user.id}`;

    // Upsert into location_shares using user.id from verified session (IDOR prevention)
    const existing = db.prepare('SELECT id FROM location_shares WHERE user_id = ?').get(user.id);
    if (existing) {
      db.prepare(`
        UPDATE location_shares SET
          latitude = ?,
          longitude = ?,
          accuracy = ?,
          is_active = 1,
          expires_at = ?,
          updated_at = ?
        WHERE user_id = ?
      `).run(lat, lng, accuracy, expiresAt, nowIso, user.id);
    } else {
      db.prepare(`
        INSERT INTO location_shares (id, user_id, latitude, longitude, accuracy, is_active, expires_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
      `).run(shareId, user.id, lat, lng, accuracy, expiresAt, nowIso, nowIso);
    }

    sendJson(res, 200, {
      success: true,
      message: 'Location sharing active and broadcast to trusted circle',
      data: {
        userId: user.id,
        latitude: lat,
        longitude: lng,
        accuracy,
        isActive: true,
        expiresAt: new Date(expiresAt).toISOString(),
        updatedAt: nowIso,
      },
    });
  },

  // 2. Revoke active location sharing
  revokeLocation(req, res, user, sendJson) {
    if (!user) {
      sendJson(res, 401, { success: false, error: 'Authentication required' });
      return;
    }

    db.prepare('UPDATE location_shares SET is_active = 0, updated_at = ? WHERE user_id = ?').run(
      new Date().toISOString(),
      user.id
    );

    sendJson(res, 200, {
      success: true,
      message: 'Location sharing revoked. Coordinates are no longer visible.',
    });
  },

  // 3. Get active shared location for self or an authorized ward
  getSharedLocation(req, res, user, sendJson, searchParams = null) {
    if (!user) {
      sendJson(res, 401, { success: false, error: 'Authentication required' });
      return;
    }

    const targetUserId = searchParams ? searchParams.get('targetUserId') || searchParams.get('userId') : null;
    const isSelf = !targetUserId || targetUserId === user.id;

    if (!isSelf) {
      // Authorization Check: Verify requesting user is an authorized guardian of target user
      const wardGuardians = db.prepare('SELECT phone FROM guardians WHERE user_id = ?').all(targetUserId);
      const userPhoneDigits = (user.phone || '').replace(/\D/g, '');

      const isAuthorizedGuardian = wardGuardians.some((g) => {
        const gDigits = (g.phone || '').replace(/\D/g, '');
        return (
          gDigits.length >= 7 &&
          userPhoneDigits.length >= 7 &&
          (gDigits.endsWith(userPhoneDigits.slice(-10)) || userPhoneDigits.endsWith(gDigits.slice(-10)))
        );
      });

      if (!isAuthorizedGuardian) {
        sendJson(res, 403, {
          success: false,
          error: 'Forbidden: You are not authorized to view this user’s location.',
        });
        return;
      }
    }

    const queryUserId = isSelf ? user.id : targetUserId;
    const now = Date.now();
    const share = db
      .prepare('SELECT * FROM location_shares WHERE user_id = ? AND is_active = 1 AND expires_at > ?')
      .get(queryUserId, now);

    if (!share) {
      sendJson(res, 200, {
        success: true,
        sharingActive: false,
        data: null,
        message: isSelf
          ? 'You are not currently sharing your location.'
          : 'User has either stopped sharing or the location broadcast window has expired.',
      });
      return;
    }

    sendJson(res, 200, {
      success: true,
      sharingActive: true,
      data: {
        userId: share.user_id,
        latitude: share.latitude,
        longitude: share.longitude,
        accuracy: share.accuracy,
        expiresAt: new Date(share.expires_at).toISOString(),
        updatedAt: share.updated_at,
      },
    });
  },

  // 4. Get active locations of all users who added current user as guardian
  getProtectedContactsLocations(req, res, user, sendJson) {
    if (!user) {
      sendJson(res, 401, { success: false, error: 'Authentication required' });
      return;
    }

    const userPhoneDigits = (user.phone || '').replace(/\D/g, '');
    if (!userPhoneDigits || userPhoneDigits.length < 7) {
      sendJson(res, 200, { success: true, count: 0, data: [] });
      return;
    }

    // Find all users where guardians table has matching phone
    const guardianships = db.prepare('SELECT user_id, name, relationship, priority FROM guardians').all();
    const wardUserIds = guardianships
      .filter((g) => {
        const gDigits = (g.phone || '').replace(/\D/g, '');
        return (
          gDigits.length >= 7 &&
          (gDigits.endsWith(userPhoneDigits.slice(-10)) || userPhoneDigits.endsWith(gDigits.slice(-10)))
        );
      })
      .map((g) => g.user_id);

    const uniqueWardIds = [...new Set(wardUserIds)];
    const now = Date.now();

    const results = uniqueWardIds.map((wardId) => {
      const wardUser = db.prepare('SELECT id, name, phone FROM users WHERE id = ?').get(wardId);
      const share = db
        .prepare('SELECT * FROM location_shares WHERE user_id = ? AND is_active = 1 AND expires_at > ?')
        .get(wardId, now);

      return {
        wardId,
        name: wardUser ? wardUser.name : 'Protected Contact',
        sharingActive: Boolean(share),
        location: share
          ? {
              latitude: share.latitude,
              longitude: share.longitude,
              accuracy: share.accuracy,
              updatedAt: share.updated_at,
              expiresAt: new Date(share.expires_at).toISOString(),
            }
          : null,
      };
    });

    sendJson(res, 200, {
      success: true,
      count: results.length,
      data: results,
    });
  },
};
