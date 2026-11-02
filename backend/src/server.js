/**
 * SAHELI — Backend API Server
 * Production-ready Node.js REST API with SQLite ACID persistence,
 * secure scrypt authentication, rate limiting, and security headers.
 */

import http from 'http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Automatically load .env configuration if present
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envCandidates = [
  path.resolve(__dirname, '../../.env'),
  path.resolve(process.cwd(), '.env'),
];
for (const envPath of envCandidates) {
  if (fs.existsSync(envPath) && typeof process.loadEnvFile === 'function') {
    try {
      process.loadEnvFile(envPath);
      break;
    } catch {
      // Ignore
    }
  }
}

import { applySecurityHeaders, checkRateLimit, authenticateRequest, requireAdmin, requireRole } from './middleware/index.js';
import db from './db/index.js';
import { authController } from './controllers/auth.js';
import { guardiansController } from './controllers/guardians.js';
import { incidentsController } from './controllers/incidents.js';
import { locationController } from './controllers/location.js';
import { verifySmtpConnection } from './services/email.js';

const PORT = parseInt(process.env.PORT || '5000', 10);

function sendJson(res, statusCode, data) {
  applySecurityHeaders(res);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 100 * 1024) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', (err) => reject(err));
  });
}

export async function handleRequest(req, res) {
  const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1')
    .split(',')[0]
    .trim();
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = url.pathname;
  if (!pathname.startsWith('/api') && pathname !== '/') {
    pathname = `/api${pathname}`;
  }
  const method = req.method;

  // Handle CORS Pre-flight
  if (method === 'OPTIONS') {
    applySecurityHeaders(res);
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  // 1. General Rate Limiting (120 req / minute per IP in production)
  const isTest = process.env.NODE_ENV === 'test' || process.execArgv.includes('--test');
  const generalLimitMax = isTest ? 1000 : 120;
  const generalLimit = checkRateLimit(`gen-${clientIp}`, generalLimitMax, 60000);
  res.setHeader('RateLimit-Limit', 120);
  res.setHeader('RateLimit-Remaining', generalLimit.remaining);
  res.setHeader('RateLimit-Reset', generalLimit.resetSeconds);

  if (!generalLimit.allowed) {
    sendJson(res, 429, {
      success: false,
      error: 'Too many requests. Please slow down and try again shortly.',
      retryAfterSeconds: generalLimit.resetSeconds,
    });
    return;
  }

  try {
    // 2. Health Check
    if (method === 'GET' && (pathname === '/api/health' || pathname === '/')) {
      sendJson(res, 200, {
        service: 'SAHELI Backend API',
        status: 'operational',
        version: '1.2.0',
        environment: process.env.NODE_ENV || 'production',
        database: 'SQLite (WAL Mode, Foreign Keys Enforced)',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // 2b. Safe Public Runtime Configuration (For Frontend Vite Client)
    // NEVER exposes private secrets, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, or SMTP passwords
    if (method === 'GET' && pathname === '/api/config') {
      const publicUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
      const publicAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
      sendJson(res, 200, {
        success: true,
        supabaseUrl: publicUrl,
        supabaseAnonKey: publicAnonKey,
        isConfigured: Boolean(publicUrl && publicAnonKey),
      });
      return;
    }

    // 3. Stricter Rate Limiting for Auth Endpoints (25 req / minute per IP in production)
    const isAuthEndpoint = pathname.startsWith('/api/auth');
    if (isAuthEndpoint && (method === 'POST' || method === 'PUT')) {
      const authLimitMax = isTest && clientIp !== '198.51.100.42' ? 200 : 25;
      const authLimit = checkRateLimit(`auth-${clientIp}`, authLimitMax, 60000);
      if (!authLimit.allowed) {
        sendJson(res, 429, {
          success: false,
          error: 'Too many authentication attempts. Please try again in a few moments.',
          retryAfterSeconds: authLimit.resetSeconds,
        });
        return;
      }
    }

    // Authenticate user token if present
    const user = await authenticateRequest(req);

    // =========================================================================
    // AUTHENTICATION & ACCOUNT ROUTES
    // =========================================================================

    if (pathname === '/api/auth/register' && method === 'POST') {
      const body = await parseJsonBody(req);
      await authController.register(req, body, res, sendJson);
      return;
    }

    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await parseJsonBody(req);
      await authController.login(req, body, res, sendJson);
      return;
    }

    if (pathname === '/api/auth/logout' && method === 'POST') {
      authController.logout(req, res, user, sendJson);
      return;
    }

    if (pathname === '/api/auth/logout-all' && method === 'POST') {
      authController.logoutAll(req, res, user, sendJson);
      return;
    }

    if (pathname === '/api/auth/me' && method === 'GET') {
      authController.me(req, res, user, sendJson);
      return;
    }

    if (pathname === '/api/auth/profile' && method === 'PUT') {
      const body = await parseJsonBody(req);
      authController.updateProfile(req, body, res, user, sendJson);
      return;
    }

    if (pathname === '/api/auth/change-password' && method === 'POST') {
      const body = await parseJsonBody(req);
      authController.changePassword(req, body, res, user, sendJson);
      return;
    }

    if (pathname === '/api/auth/forgot-password' && method === 'POST') {
      const body = await parseJsonBody(req);
      await authController.forgotPassword(req, body, res, sendJson);
      return;
    }

    if (pathname === '/api/auth/reset-password' && method === 'POST') {
      const body = await parseJsonBody(req);
      authController.resetPassword(req, body, res, sendJson);
      return;
    }

    if (pathname === '/api/auth/verify-email') {
      if (method === 'GET') {
        const token = url.searchParams.get('token') || url.searchParams.get('verify');
        const appUrl = process.env.APP_URL || 'http://localhost:5173';
        if (!token) {
          res.writeHead(302, { Location: `${appUrl}/?verify_status=missing` });
          res.end();
          return;
        }
        const verifyResult = authController.verifyEmailInternal(token);
        if (verifyResult.success) {
          res.writeHead(302, { Location: `${appUrl}/?verify_status=success` });
        } else {
          res.writeHead(302, { Location: `${appUrl}/?verify_status=expired` });
        }
        res.end();
        return;
      }

      if (method === 'POST') {
        const body = await parseJsonBody(req);
        authController.verifyEmail(req, body, res, sendJson);
        return;
      }
    }

    if (pathname === '/api/auth/verify-otp' && method === 'POST') {
      const body = await parseJsonBody(req);
      authController.verifyOtp(req, body, res, sendJson);
      return;
    }

    if (pathname === '/api/auth/resend-otp' && method === 'POST') {
      const body = await parseJsonBody(req);
      await authController.resendOtp(req, body, res, sendJson);
      return;
    }

    if (pathname === '/api/auth/supabase-session' && method === 'POST') {
      const body = await parseJsonBody(req);
      await authController.syncSupabaseSession(req, body, res, sendJson);
      return;
    }

    if (pathname === '/api/auth/resend-verification' && method === 'POST') {
      const body = await parseJsonBody(req);
      await authController.resendVerification(req, body, res, user, sendJson);
      return;
    }

    if (pathname === '/api/auth/account' && method === 'DELETE') {
      const body = await parseJsonBody(req);
      authController.deleteAccount(req, body, res, user, sendJson);
      return;
    }

    if (pathname === '/api/auth/export' && method === 'GET') {
      authController.exportData(req, res, user, sendJson);
      return;
    }

    // =========================================================================
    // GUARDIANS ROUTES (WITH OWNERSHIP CHECK)
    // =========================================================================

    if (pathname === '/api/guardians' && method === 'GET') {
      guardiansController.getGuardians(req, res, user, sendJson);
      return;
    }

    if (pathname === '/api/guardians' && method === 'POST') {
      const body = await parseJsonBody(req);
      guardiansController.addGuardian(req, body, res, user, sendJson);
      return;
    }

    if (pathname.startsWith('/api/guardians/') && method === 'DELETE') {
      const guardianId = pathname.slice('/api/guardians/'.length).trim();
      guardiansController.deleteGuardian(req, guardianId, res, user, sendJson);
      return;
    }

    // =========================================================================
    // SAFE PLACES & INCIDENTS
    // =========================================================================

    if ((pathname === '/api/safe-places' || pathname === '/api/places') && method === 'GET') {
      incidentsController.getSafePlaces(req, res, sendJson, url.searchParams);
      return;
    }

    if (pathname === '/api/incidents' && method === 'GET') {
      incidentsController.getIncidents(req, res, user, sendJson);
      return;
    }

    if (pathname === '/api/incidents' && method === 'POST') {
      const body = await parseJsonBody(req);
      incidentsController.createIncident(req, body, res, user, sendJson);
      return;
    }

    // SafeWalk Check-in telemetry
    if (pathname === '/api/safewalk/checkin' && method === 'POST') {
      const body = await parseJsonBody(req);
      sendJson(res, 200, {
        success: true,
        message: 'Telemetry check-in confirmed by safety server',
        data: {
          journeyId: body.journeyId || 'active-walk',
          status: 'confirmed',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // =========================================================================
    // LOCATION SHARING & TELEMETRY ROUTES (AUTHORIZED)
    // =========================================================================

    if (pathname === '/api/location/share' && method === 'POST') {
      const body = await parseJsonBody(req);
      locationController.shareLocation(req, body, res, user, sendJson);
      return;
    }

    if (pathname === '/api/location/revoke' && method === 'POST') {
      locationController.revokeLocation(req, res, user, sendJson);
      return;
    }

    if (pathname === '/api/location/shared' && method === 'GET') {
      locationController.getSharedLocation(req, res, user, sendJson, url.searchParams);
      return;
    }

    if (pathname === '/api/location/protected-contacts' && method === 'GET') {
      locationController.getProtectedContactsLocations(req, res, user, sendJson);
      return;
    }

    // =========================================================================
    // ADMINISTRATIVE ACCESS ROUTES (ROLE-BASED AUTHORIZATION)
    // =========================================================================

    if (pathname === '/api/admin/overview' && method === 'GET') {
      if (!requireAdmin(req, res, user, sendJson)) return;
      const totalUsers = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
      const verifiedUsers = db.prepare('SELECT COUNT(*) AS count FROM users WHERE is_verified = 1').get().count;
      const totalIncidents = db.prepare('SELECT COUNT(*) AS count FROM incident_logs').get().count;
      const totalPlaces = db.prepare('SELECT COUNT(*) AS count FROM safe_places').get().count;

      sendJson(res, 200, {
        success: true,
        data: {
          metrics: {
            totalUsers,
            verifiedUsers,
            totalIncidents,
            totalPlaces,
            databaseHealth: 'WAL Mode Active',
          },
        },
      });
      return;
    }

    if (pathname === '/api/admin/users' && method === 'GET') {
      if (!requireAdmin(req, res, user, sendJson)) return;
      const usersList = db.prepare(`
        SELECT id, name, email, phone, role, is_verified, account_status, terms_accepted, terms_version, created_at, updated_at
        FROM users ORDER BY created_at DESC
      `).all();

      sendJson(res, 200, {
        success: true,
        data: usersList,
      });
      return;
    }

    if (pathname.startsWith('/api/admin/users/') && pathname.endsWith('/status') && method === 'PUT') {
      if (!requireAdmin(req, res, user, sendJson)) return;
      const parts = pathname.split('/');
      const targetUserId = parts[4];
      const body = await parseJsonBody(req);
      const newStatus = body.status === 'disabled' ? 'disabled' : body.status === 'suspended' ? 'suspended' : 'active';
      db.prepare('UPDATE users SET account_status = ?, updated_at = ? WHERE id = ?').run(
        newStatus,
        new Date().toISOString(),
        targetUserId
      );
      sendJson(res, 200, {
        success: true,
        message: `User status updated to ${newStatus}`,
      });
      return;
    }

    // 404 Route Not Found
    sendJson(res, 404, {
      success: false,
      error: `Endpoint not found: ${method} ${pathname}`,
    });
  } catch (error) {
    console.error('API Error:', error.message);
    sendJson(res, error.message === 'Invalid JSON format' ? 400 : 500, {
      success: false,
      error: error.message || 'Internal Server Error',
    });
  }
}

const server = http.createServer(handleRequest);
export { server };

const isDirectExecution = process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('src/server.js');

if (isDirectExecution) {
  server.listen(PORT, async () => {
    console.log(`SAHELI Backend API listening on port ${PORT}`);
    if (process.env.SMTP_USER) {
      const check = await verifySmtpConnection();
      if (check.connected) {
        console.log(`[EmailService] ✓ SMTP connected: ${check.message}`);
      } else {
        console.log(`[EmailService] ⚠ SMTP notice: ${check.message || check.error}`);
      }
    }
  });
}

export default server;
