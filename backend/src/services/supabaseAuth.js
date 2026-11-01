/**
 * SAHELI — Supabase Auth Service (Backend)
 * Handles Supabase Auth Email OTP, JWT verification, and session synchronization.
 *
 * Security Principles:
 * - Credentials read strictly from environment (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY).
 * - Never logs private tokens, OTPs, or service-role keys in production.
 * - Caches verified JWTs in-memory to minimize round-trip latency to Supabase Auth servers.
 */

import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_TEST_SECRET = process.env.SUPABASE_JWT_TEST_SECRET || 'saheli-supabase-test-jwt-secret-2026';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export let supabaseServerClient = null;

export function getSupabaseServerClient() {
  if (supabaseServerClient) return supabaseServerClient;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  if (url && key) {
    try {
      supabaseServerClient = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      return supabaseServerClient;
    } catch (err) {
      console.warn('[SupabaseAuth] Initialization failed:', err.message);
    }
  }
  return null;
}

// Initial check
getSupabaseServerClient();

// In-memory cache for validated Supabase JWT tokens (TTL: 5 minutes)
const tokenValidationCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Verifies a Supabase JWT access token.
 * Returns { valid: true, user } if valid, or { valid: false, error } if invalid.
 */
export async function verifySupabaseToken(accessToken) {
  if (!accessToken || typeof accessToken !== 'string') {
    return { valid: false, error: 'Access token is required' };
  }

  // 1. Structure & Algorithm Validation
  const parts = accessToken.split('.');
  if (parts.length !== 3) {
    return { valid: false, error: 'Malformed JWT: must contain exactly 3 dot-separated parts' };
  }

  let header;
  try {
    header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
  } catch {
    return { valid: false, error: 'Malformed JWT header: invalid base64url or JSON' };
  }

  if (!header || typeof header !== 'object') {
    return { valid: false, error: 'Invalid JWT header format' };
  }

  const alg = String(header.alg || '').toUpperCase();
  if (!alg || alg === 'NONE') {
    return { valid: false, error: 'Insecure JWT: algorithm "none" is strictly forbidden' };
  }

  // Check in-memory validation cache (stores verified tokens for 5 minutes)
  const cached = tokenValidationCache.get(accessToken);
  if (cached && Date.now() < cached.expiresAt) {
    return { valid: true, user: cached.user };
  }

  const client = getSupabaseServerClient();

  // 2. Production Verification via Supabase Auth API
  if (client) {
    try {
      const { data, error } = await client.auth.getUser(accessToken);
      if (error || !data?.user) {
        return { valid: false, error: error?.message || 'Invalid or revoked Supabase access token' };
      }

      if (!data.user.email) {
        return { valid: false, error: 'Supabase user has no associated email address' };
      }

      // Cache valid user for 5 minutes
      tokenValidationCache.set(accessToken, {
        user: data.user,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      return { valid: true, user: data.user };
    } catch (err) {
      return { valid: false, error: err.message || 'Supabase verification network error' };
    }
  }

  // 3. Isolated Test Environment Cryptographic Signature Verification
  // In test mode or when a test verification secret is explicitly configured,
  // tokens must be cryptographically signed with SUPABASE_TEST_SECRET
  if (process.env.NODE_ENV === 'test' || Boolean(process.env.SUPABASE_JWT_TEST_SECRET)) {
    try {
      const [headerB64, payloadB64, providedSig] = parts;
      const expectedSig = crypto
        .createHmac('sha256', SUPABASE_TEST_SECRET)
        .update(`${headerB64}.${payloadB64}`)
        .digest('base64url');

      const sigBuffer = Buffer.from(providedSig);
      const expectedBuffer = Buffer.from(expectedSig);

      if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
        return { valid: false, error: 'Invalid JWT signature' };
      }

      const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));

      // Validate expiration
      if (!payload.exp || typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now()) {
        return { valid: false, error: 'JWT token has expired' };
      }

      // Validate email identity
      if (!payload.email || typeof payload.email !== 'string') {
        return { valid: false, error: 'JWT payload missing valid email claim' };
      }

      const user = {
        id: payload.sub || `sup-${Date.now()}`,
        email: payload.email.trim().toLowerCase(),
        role: payload.role || 'authenticated',
        app_metadata: payload.app_metadata || {},
        user_metadata: payload.user_metadata || {},
        confirmed_at: payload.confirmed_at || new Date().toISOString(),
        email_confirmed_at: payload.email_confirmed_at || new Date().toISOString(),
      };

      return { valid: true, user, isTestVerified: true };
    } catch {
      return { valid: false, error: 'Invalid test JWT payload or signature' };
    }
  }

  return {
    valid: false,
    error: 'Supabase server is not configured in environment (SUPABASE_URL and SUPABASE_ANON_KEY).',
  };
}

/**
 * Dispatch Supabase Auth Email OTP
 * Uses signInWithOtp({ email, options: { shouldCreateUser: true } })
 */
export async function sendSupabaseEmailOtp(email) {
  if (!email || typeof email !== 'string') {
    return { success: false, error: 'Valid email address is required.' };
  }

  const client = getSupabaseServerClient();
  if (!client) {
    return {
      success: false,
      configured: false,
      error: 'SUPABASE_NOT_CONFIGURED',
      message: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.',
    };
  }

  try {
    const { data, error } = await client.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      console.error('[SupabaseAuth] OTP dispatch error:', error.message);
      return {
        success: false,
        configured: true,
        error: error.message,
      };
    }

    return {
      success: true,
      configured: true,
      data,
    };
  } catch (err) {
    return {
      success: false,
      configured: true,
      error: err.message || 'Network error dispatching Supabase Email OTP.',
    };
  }
}

/**
 * Verify Supabase Email OTP
 * Uses verifyOtp({ email, token, type: 'email' })
 */
export async function verifySupabaseEmailOtp(email, token) {
  if (!email || !token) {
    return { success: false, error: 'Email and OTP token are required.' };
  }

  const client = getSupabaseServerClient();
  if (!client) {
    return {
      success: false,
      configured: false,
      error: 'SUPABASE_NOT_CONFIGURED',
    };
  }

  try {
    const { data, error } = await client.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: String(token).trim(),
      type: 'email',
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      session: data.session,
      user: data.user,
    };
  } catch (err) {
    return { success: false, error: err.message || 'Verification network error.' };
  }
}
