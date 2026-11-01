import { verifySessionToken } from '../utils/crypto.js';
import { verifySupabaseToken } from '../services/supabaseAuth.js';
import db from '../db/index.js';

// In-memory sliding window rate-limiter store
const ipHits = new Map();

// Periodic cleanup of stale rate-limit records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipHits.entries()) {
    if (now > record.resetTime) {
      ipHits.delete(ip);
    }
  }
}, 300000).unref();

/**
 * Rate Limiter Middleware
 * Returns true if request is allowed, false if limit exceeded.
 */
export function checkRateLimit(ip, limit = 60, windowMs = 60000) {
  const now = Date.now();
  const cleanIp = ip || 'unknown-client';
  let record = ipHits.get(cleanIp);

  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
    ipHits.set(cleanIp, record);
    return { allowed: true, remaining: limit - 1, resetSeconds: Math.ceil(windowMs / 1000) };
  }

  record.count += 1;
  const remaining = Math.max(0, limit - record.count);
  const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

  if (record.count > limit) {
    return { allowed: false, remaining: 0, resetSeconds };
  }

  return { allowed: true, remaining, resetSeconds };
}

/**
 * Apply Production Security Headers
 */
export function applySecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' *;"
  );
}

/**
 * Extract and authenticate user from Bearer token
 */
export async function authenticateRequest(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7).trim();

  // 1. Try native SAHELI session token (HMAC-SHA256 with token_version check)
  const payload = verifySessionToken(token);
  if (payload && payload.userId) {
    try {
      const stmt = db.prepare(
        'SELECT id, name, email, phone, role, is_verified, account_status, token_version, blood_group, medical_notes, checkin_interval_minutes, created_at, supabase_id FROM users WHERE id = ?'
      );
      const user = stmt.get(payload.userId);
      if (!user) return null;

      // Disabled or suspended account rejection
      if (user.account_status === 'disabled' || user.account_status === 'suspended') {
        return null;
      }

      // Session revocation check (tokenVersion)
      if (payload.tokenVersion !== undefined && user.token_version !== undefined) {
        if (payload.tokenVersion < user.token_version) {
          return null;
        }
      }

      return user;
    } catch {
      return null;
    }
  }

  // 2. Try Supabase Auth JWT token with strict cryptographic signature verification
  // Tokens are NEVER accepted by merely decoding the payload
  const parts = token.split('.');
  if (parts.length === 3) {
    try {
      const verification = await verifySupabaseToken(token);
      if (!verification.valid || !verification.user?.email) {
        return null;
      }

      const email = verification.user.email.trim().toLowerCase();
      const supabaseId = verification.user.id;

      const stmt = db.prepare(
        'SELECT id, name, email, phone, role, is_verified, account_status, token_version, blood_group, medical_notes, checkin_interval_minutes, created_at, supabase_id FROM users WHERE email = ? OR supabase_id = ? OR id = ?'
      );
      let user = stmt.get(email, supabaseId, supabaseId);

      // Auto-provision if valid token from Supabase but not yet in SQLite
      if (!user) {
        const userId = supabaseId || `usr-${Date.now()}`;
        const now = new Date().toISOString();
        try {
          db.prepare(`
            INSERT INTO users (
              id, name, email, phone, password_hash, salt, role,
              is_verified, account_status, terms_accepted, terms_version,
              token_version, email_verified_at, supabase_id, created_at, updated_at
            ) VALUES (?, ?, ?, '', 'managed-by-supabase', 'managed', 'user', 1, 'active', 1, 'v2.0', 1, ?, ?, ?, ?)
          `).run(
            userId,
            verification.user.user_metadata?.name || email.split('@')[0],
            email,
            now,
            supabaseId || null,
            now,
            now
          );
          user = stmt.get(email, supabaseId, supabaseId);
        } catch {
          user = stmt.get(email, supabaseId, supabaseId);
        }
      }

      if (user) {
        // Enforce account status: never allow suspended or disabled users
        if (user.account_status === 'disabled' || user.account_status === 'suspended') {
          return null;
        }
        return user;
      }
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Require specific user role
 */
export function requireRole(role) {
  return (req, res, user, sendJson) => {
    if (!user) {
      sendJson(res, 401, { success: false, error: 'Authentication required. Please log in.' });
      return false;
    }
    if (user.role !== role) {
      sendJson(res, 403, { success: false, error: 'Forbidden. Insufficient permissions.' });
      return false;
    }
    return true;
  };
}

/**
 * Require administrator role
 */
export function requireAdmin(req, res, user, sendJson) {
  if (!user) {
    sendJson(res, 401, { success: false, error: 'Authentication required. Please log in.' });
    return false;
  }
  if (user.role !== 'admin') {
    sendJson(res, 403, { success: false, error: 'Forbidden. Administrator privilege required.' });
    return false;
  }
  return true;
}
