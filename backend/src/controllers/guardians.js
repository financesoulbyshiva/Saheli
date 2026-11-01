import db from '../db/index.js';
import { sanitizeString } from '../utils/crypto.js';

export const guardiansController = {
  getGuardians(req, res, user, sendJson) {
    if (!user) {
      // Return public template fixtures for unauthenticated demo visitors
      const publicStmt = db.prepare('SELECT * FROM guardians LIMIT 5');
      const data = publicStmt.all();
      sendJson(res, 200, { success: true, count: data.length, data });
      return;
    }

    const stmt = db.prepare('SELECT * FROM guardians WHERE user_id = ? ORDER BY priority ASC, created_at DESC');
    const data = stmt.all(user.id);
    sendJson(res, 200, { success: true, count: data.length, data });
  },

  addGuardian(req, body, res, user, sendJson) {
    if (!user) {
      sendJson(res, 401, { success: false, error: 'Authentication required to manage guardians' });
      return;
    }

    const name = sanitizeString(body.name || '');
    const relationship = sanitizeString(body.relationship || 'Friend', 50);
    const phone = sanitizeString(body.phone || '', 20);
    const priority = body.priority === 'Primary' ? 'Primary' : 'Secondary';

    if (!name || name.length < 2) {
      sendJson(res, 400, { success: false, error: 'Guardian name must be at least 2 characters long' });
      return;
    }

    if (!phone || phone.length < 7) {
      sendJson(res, 400, { success: false, error: 'Valid phone number is required' });
      return;
    }

    const id = `g-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const now = new Date().toISOString();

    // If setting as primary, demote existing primary for this user
    if (priority === 'Primary') {
      db.prepare("UPDATE guardians SET priority = 'Secondary' WHERE user_id = ?").run(user.id);
    }

    const insertStmt = db.prepare(`
      INSERT INTO guardians (id, user_id, name, relationship, phone, priority, status, battery, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'Available', 95, ?)
    `);

    insertStmt.run(id, user.id, name, relationship, phone, priority, now);

    const created = db.prepare('SELECT * FROM guardians WHERE id = ?').get(id);
    sendJson(res, 201, {
      success: true,
      message: 'Guardian added to trusted network',
      data: created,
    });
  },

  deleteGuardian(req, guardianId, res, user, sendJson) {
    if (!user) {
      sendJson(res, 401, { success: false, error: 'Authentication required' });
      return;
    }

    // Verify ownership before deleting (Authorization protection!)
    const guardian = db.prepare('SELECT * FROM guardians WHERE id = ?').get(guardianId);
    if (!guardian) {
      sendJson(res, 404, { success: false, error: 'Guardian not found' });
      return;
    }

    if (guardian.user_id !== user.id) {
      sendJson(res, 403, { success: false, error: 'Forbidden: You do not own this guardian record' });
      return;
    }

    db.prepare('DELETE FROM guardians WHERE id = ? AND user_id = ?').run(guardianId, user.id);
    sendJson(res, 200, {
      success: true,
      message: 'Guardian removed from your trusted network',
    });
  },
};
