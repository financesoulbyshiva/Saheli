import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import crypto from 'node:crypto';

process.env.NODE_ENV = 'test';
process.env.SAHELI_OTP_TEST_MODE = 'true';

import server from '../src/server.js';
import db from '../src/db/index.js';
import { createSessionToken, hashPassword, hashToken } from '../src/utils/crypto.js';
import { sendVerificationEmail } from '../src/services/email.js';

const TEST_PORT = 5059;

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      `http://localhost:${TEST_PORT}${path}`,
      options,
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        });
      }
    );
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

test('SAHELI Complete Production Security & API Test Suite', async (t) => {
  await new Promise((resolve) => server.listen(TEST_PORT, resolve));

  t.after(() => {
    server.close();
  });

  const uniqueId = Date.now();
  const testEmail = `aadya_${uniqueId}@saheli.org`;
  const userBEmail = `bob_${uniqueId}@saheli.org`;

  let testUserToken = null;
  let testUserId = null;
  let testVerificationToken = null;
  let testGuardianId = null;

  // 1. Health check & security headers
  await t.test('1. Health check returns 200 and security headers', async () => {
    const res = await makeRequest('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'operational');
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
    assert.equal(res.headers['x-frame-options'], 'DENY');
    assert.ok(res.headers['strict-transport-security']);
  });

  // 2. Registration - Weak Password Rejection
  await t.test('2. Registration rejects weak password (<8 chars / missing numbers)', async () => {
    const res = await makeRequest('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+91 9876543210',
        password: 'weak',
      },
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /Password must be/);
  });

  // 3. Registration - Valid User
  await t.test('3. Registration succeeds with valid credentials & scrypt hash', async () => {
    const res = await makeRequest('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        name: 'Aadya Sharma',
        email: testEmail,
        phone: '+91 9876543210',
        password: 'SafePassword123!',
      },
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
    assert.ok(res.body.user.id);
    assert.equal(res.body.user.email, testEmail);
    assert.equal(res.body.user.is_verified, 0);

    testUserToken = res.body.token;
    testUserId = res.body.user.id;
    testVerificationToken = res.body.verificationToken;
  });

  // 4. Registration - Duplicate Email Prevention
  await t.test('4. Registration rejects duplicate email address', async () => {
    const res = await makeRequest('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        name: 'Duplicate User',
        email: testEmail,
        phone: '+91 9876543210',
        password: 'SafePassword123!',
      },
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  // 5. Registration - Terms Rejection
  await t.test('5. Registration rejects if terms_accepted is explicitly false', async () => {
    const res = await makeRequest('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        name: 'Decline Terms',
        email: `declined_${Date.now()}@saheli.org`,
        phone: '+91 9876543210',
        password: 'ValidPassword123!',
        terms_accepted: false,
      },
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /accept the Terms of Service/);
  });

  // 5. Login - Invalid Credentials
  await t.test('5. Login rejects invalid password', async () => {
    const res = await makeRequest('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        email: testEmail,
        password: 'WrongPassword456!',
      },
    });
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error, 'Invalid email or password');
  });

  // 6. Login - Success
  await t.test('6. Login succeeds with correct credentials', async () => {
    const res = await makeRequest('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        email: testEmail,
        password: 'SafePassword123!',
      },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
  });

  // 7. Protected Route - Access Denied Without Token
  await t.test('7. Protected profile route rejects unauthenticated request with 401', async () => {
    const res = await makeRequest('/api/auth/me');
    assert.equal(res.status, 401);
  });

  // 8. Protected Route - Access Granted with Token
  await t.test('8. Protected profile route returns authenticated user data', async () => {
    const res = await makeRequest('/api/auth/me', {
      headers: { Authorization: `Bearer ${testUserToken}` },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.id, testUserId);
    assert.equal(res.body.user.email, testEmail);
  });

  // 9. Email Verification
  await t.test('9. Email verification activates account with valid token', async () => {
    const res = await makeRequest('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { token: testVerificationToken },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    // Verify in DB that is_verified is now 1
    const userInDb = db.prepare('SELECT is_verified FROM users WHERE id = ?').get(testUserId);
    assert.equal(userInDb.is_verified, 1);
  });

  // 10. Forgot Password & Reset Flow
  await t.test('10. Forgot password generates time-limited reset token without user enumeration', async () => {
    const res = await makeRequest('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: testEmail },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.resetToken);

    // Complete reset
    const resetRes = await makeRequest('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        token: res.body.resetToken,
        newPassword: 'BrandNewPassword456!',
      },
    });
    assert.equal(resetRes.status, 200);
    assert.equal(resetRes.body.success, true);

    // Login with new password
    const loginRes = await makeRequest('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        email: testEmail,
        password: 'BrandNewPassword456!',
      },
    });
    assert.equal(loginRes.status, 200);
    testUserToken = loginRes.body.token; // Update token
  });

  // 11. Guardians - Add Guardian for User
  await t.test('11. Authenticated user can add a trusted contact to their network', async () => {
    const res = await makeRequest('/api/guardians', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`,
      },
      body: {
        name: 'Sister Priya',
        relationship: 'Sister',
        phone: '+91 9811122233',
        priority: 'Primary',
      },
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.id);
    testGuardianId = res.body.data.id;
  });

  // 12. Security: Cross-User Authorization Protection
  await t.test('12. User B cannot delete User A guardian (Cross-user isolation test)', async () => {
    // Register User B
    const userBRes = await makeRequest('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        name: 'User Bob',
        email: userBEmail,
        phone: '+91 9777788888',
        password: 'PasswordBob123!',
      },
    });
    const userBToken = userBRes.body.token;

    // User B tries to delete User A's guardian
    const deleteAttempt = await makeRequest(`/api/guardians/${testGuardianId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userBToken}` },
    });
    assert.equal(deleteAttempt.status, 403);
    assert.equal(deleteAttempt.body.success, false);
    assert.match(deleteAttempt.body.error, /Forbidden/);
  });

  // 13. Owner can delete own guardian
  await t.test('13. Owner can delete their own guardian record', async () => {
    const res = await makeRequest(`/api/guardians/${testGuardianId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${testUserToken}` },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  // 14. Emergency Incident Logging with Coordinate Validation
  await t.test('14. Incident logging validates state and stores coordinates', async () => {
    const res = await makeRequest('/api/incidents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`,
      },
      body: {
        state: 'EMERGENCY',
        title: 'SOS Active Assistance',
        description: 'User initiated emergency dispatch flow',
        latitude: 28.6139,
        longitude: 77.209,
      },
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.safety_state, 'EMERGENCY');
    assert.equal(res.body.data.latitude, 28.6139);
  });

  // 15. Safe Places Endpoint
  await t.test('15. Safe places returns parsed verified havens', async () => {
    const res = await makeRequest('/api/safe-places');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 3);
    assert.ok(Array.isArray(res.body.data[0].safetyTags));
  });

  // 16. Rate Limiting Test (Auth Endpoint Burst)
  await t.test('16. Auth rate limiter blocks burst attacks exceeding 25 req/min', async () => {
    let lastStatus = 200;
    for (let i = 0; i < 28; i++) {
      const res = await makeRequest('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '198.51.100.42',
        },
        body: { email: 'test@burst.com', password: 'TestPassword123!' },
      });
      lastStatus = res.status;
      if (lastStatus === 429) break;
    }
    assert.equal(lastStatus, 429);
  });

  // 17. Privacy & Data Export Test (GDPR/DPDP compliance)
  await t.test('17. Authenticated user can export their personal account data', async () => {
    const res = await makeRequest('/api/auth/export', {
      headers: { Authorization: `Bearer ${testUserToken}` },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.profile);
    assert.ok(Array.isArray(res.body.data.guardians));
    assert.ok(res.body.data.privacySummary);
  });

  // 18. SQL Injection Sanitization in Registration
  await t.test('18. Registration escapes SQL injection strings safely', async () => {
    const sqliEmail = `sqli_${Date.now()}@saheli.org`;
    const res = await makeRequest('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        name: "Robert'; DROP TABLE users; --",
        email: sqliEmail,
        phone: '+91 9999988888',
        password: 'ValidPassword123!',
      },
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);

    // Verify database table still exists and name is stored as literal string
    const userInDb = db.prepare('SELECT name FROM users WHERE email = ?').get(sqliEmail);
    assert.ok(userInDb);
    assert.equal(userInDb.name, "Robert'; DROP TABLE users; --");
  });

  // 19. Single-Use Verification Token
  await t.test('19. Verification token cannot be reused once account is activated', async () => {
    const res = await makeRequest('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { token: testVerificationToken },
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /Invalid or expired/);
  });

  // 20. Expired or Invalid Verification Token
  await t.test('20. Invalid verification token is rejected', async () => {
    const res = await makeRequest('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { token: 'completely-bogus-token-xyz-123' },
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  // 21. Password Reset Rejects Old Password
  await t.test('21. Password reset rejects if new password is same as current password', async () => {
    // Generate fresh reset token
    const forgotRes = await makeRequest('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: testEmail },
    });
    const freshResetToken = forgotRes.body.resetToken;
    assert.ok(freshResetToken);

    // Attempt to reset with same password 'BrandNewPassword456!'
    const resetAttempt = await makeRequest('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        token: freshResetToken,
        newPassword: 'BrandNewPassword456!',
      },
    });
    assert.equal(resetAttempt.status, 400);
    assert.equal(resetAttempt.body.success, false);
    assert.match(resetAttempt.body.error, /cannot be the same/);
  });

  // 22. Password Reset Token Single-Use Validation
  await t.test('22. Reset token cannot be reused after successful password reset', async () => {
    const forgotRes = await makeRequest('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: testEmail },
    });
    const singleUseToken = forgotRes.body.resetToken;

    // First use: success
    const firstReset = await makeRequest('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        token: singleUseToken,
        newPassword: 'ThirdPassword789!',
      },
    });
    assert.equal(firstReset.status, 200);

    // Second use with same token: rejected
    const secondReset = await makeRequest('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        token: singleUseToken,
        newPassword: 'FourthPassword999!',
      },
    });
    assert.equal(secondReset.status, 400);
    assert.equal(secondReset.body.success, false);
    assert.match(secondReset.body.error, /Invalid or expired/);

    // Update test user's token with new login
    const loginRes = await makeRequest('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: testEmail, password: 'ThirdPassword789!' },
    });
    assert.equal(loginRes.status, 200);
    testUserToken = loginRes.body.token;
  });

  // 23. Disabled or Suspended Account Rejection
  await t.test('23. Suspended account is blocked from login with 403', async () => {
    // Create a disabled user in DB with valid hashed password
    const disabledId = `usr-disabled-${Date.now()}`;
    const disabledEmail = `disabled_${Date.now()}@saheli.org`;
    const { salt, hash } = hashPassword('AnyPassword123!');
    db.prepare(`
      INSERT INTO users (id, name, email, phone, password_hash, salt, role, is_verified, account_status, created_at, updated_at)
      VALUES (?, 'Suspended User', ?, '+91 9111122222', ?, ?, 'user', 1, 'disabled', datetime('now'), datetime('now'))
    `).run(disabledId, disabledEmail, hash, salt);

    const res = await makeRequest('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: disabledEmail, password: 'AnyPassword123!' },
    });
    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /suspended or disabled/);
  });

  // 24. Role Authorization - Normal User Blocked from Admin Endpoints
  await t.test('24. Normal user is forbidden (403) from accessing admin endpoints', async () => {
    const res = await makeRequest('/api/admin/overview', {
      headers: { Authorization: `Bearer ${testUserToken}` },
    });
    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /Administrator privilege required/);
  });

  // 25. Role Authorization - Admin Access Permitted
  await t.test('25. Admin user is authorized (200) to access admin endpoints', async () => {
    const adminId = `usr-admin-${Date.now()}`;
    const adminEmail = `admin_${Date.now()}@saheli.org`;
    db.prepare(`
      INSERT INTO users (id, name, email, phone, password_hash, salt, role, is_verified, account_status, token_version, created_at, updated_at)
      VALUES (?, 'Admin Master', ?, '+91 9000011111', 'dummyhash', 'dummysalt', 'admin', 1, 'active', 1, datetime('now'), datetime('now'))
    `).run(adminId, adminEmail);

    const adminToken = createSessionToken({
      userId: adminId,
      email: adminEmail,
      role: 'admin',
      tokenVersion: 1,
    });

    const res = await makeRequest('/api/admin/overview', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.metrics.totalUsers >= 1);
  });

  // 26. Role Tampering Prevention via Profile Update
  await t.test('26. Normal user cannot elevate their role to admin via profile update', async () => {
    const res = await makeRequest('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`,
      },
      body: {
        name: 'Aadya Sharma',
        role: 'admin', // Malicious attempt to elevate role
      },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.role, 'user'); // Role remained 'user'

    // Verify in database directly
    const userInDb = db.prepare('SELECT role FROM users WHERE id = ?').get(testUserId);
    assert.equal(userInDb.role, 'user');
  });

  // 27. Session Invalidation via Logout
  await t.test('27. Logout invalidates active session token', async () => {
    const logoutRes = await makeRequest('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${testUserToken}` },
    });
    assert.equal(logoutRes.status, 200);
    assert.equal(logoutRes.body.success, true);

    // Subsequent authenticated request using the same token should fail with 401
    const subsequentMe = await makeRequest('/api/auth/me', {
      headers: { Authorization: `Bearer ${testUserToken}` },
    });
    assert.equal(subsequentMe.status, 401);
  });

  // 28. Expired Token Verification Rejected
  await t.test('28. Expired email verification token is rejected', async () => {
    const expiredToken = `expired-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const expiredTokenHash = hashToken(expiredToken);
    const expiredUserId = `usr-expired-${Date.now()}`;
    const expiredEmail = `expired_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`;
    const pastTime = Date.now() - 10000; // 10 seconds ago

    db.prepare(`
      INSERT INTO users (
        id, name, email, phone, password_hash, salt, role,
        is_verified, account_status, terms_accepted, terms_version,
        verification_token, verification_token_hash, verification_token_expires,
        created_at, updated_at
      ) VALUES (?, 'Expired User', ?, '+919999900001', 'dummyhash', 'dummysalt', 'user', 0, 'active', 1, 'v2.0', ?, ?, ?, datetime('now'), datetime('now'))
    `).run(expiredUserId, expiredEmail, expiredToken, expiredTokenHash, pastTime);

    const res = await makeRequest('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { token: expiredToken },
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /expired/i);
  });

  // 29. Resend Verification Flow
  await t.test('29. Resend verification flow generates fresh single-use token', async () => {
    const unverifiedEmail = `unv_resend_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`;
    const unverifiedUserId = `usr-unv-${Date.now()}`;
    const initialToken = `init-token-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const initialHash = hashToken(initialToken);
    const { hash, salt } = hashPassword('UnverifiedPass123!');

    db.prepare(`
      INSERT INTO users (
        id, name, email, phone, password_hash, salt, role,
        is_verified, account_status, terms_accepted, terms_version,
        verification_token, verification_token_hash, verification_token_expires,
        created_at, updated_at
      ) VALUES (?, 'Resend User', ?, '+919999900002', ?, ?, 'user', 0, 'active', 1, 'v2.0', ?, ?, ?, datetime('now'), datetime('now'))
    `).run(unverifiedUserId, unverifiedEmail, hash, salt, initialToken, initialHash, Date.now() + 86400000);

    const res = await makeRequest('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: unverifiedEmail },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.verificationToken);
    assert.notEqual(res.body.verificationToken, initialToken);

    // Verify token was updated in database
    const user = db.prepare('SELECT verification_token_hash FROM users WHERE id = ?').get(unverifiedUserId);
    assert.equal(user.verification_token_hash, hashToken(res.body.verificationToken));
  });

  // 30. Resend Rate Limiting
  await t.test('30. Resend verification rate limits excessive requests', async () => {
    const rateLimitEmail = `rl_resend_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`;
    const rateLimitUserId = `usr-rl-${Date.now()}`;
    const { hash, salt } = hashPassword('RateLimitPass123!');

    db.prepare(`
      INSERT INTO users (
        id, name, email, phone, password_hash, salt, role,
        is_verified, account_status, terms_accepted, terms_version,
        verification_token, verification_token_hash, verification_token_expires,
        created_at, updated_at
      ) VALUES (?, 'RL User', ?, '+919999900003', ?, ?, 'user', 0, 'active', 1, 'v2.0', 'rl-token', 'rl-hash', ?, datetime('now'), datetime('now'))
    `).run(rateLimitUserId, rateLimitEmail, hash, salt, Date.now() + 86400000);

    // Burst 4 calls (limit is 3 per 15 min)
    let rateLimited = false;
    for (let i = 0; i < 4; i++) {
      const res = await makeRequest('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '198.51.100.99',
        },
        body: { email: rateLimitEmail },
      });
      if (res.status === 429) {
        rateLimited = true;
        assert.equal(res.body.success, false);
        break;
      }
    }
    assert.equal(rateLimited, true);
  });

  // 31. Unverified Login Restrictions
  await t.test('31. Unverified login restrictions reject login when ENFORCE_VERIFIED_LOGIN is active', async () => {
    const unverifiedLoginEmail = `unv_login_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`;
    const unverifiedLoginId = `usr-ul-${Date.now()}`;
    const { hash, salt } = hashPassword('UnverifiedLogin123!');

    db.prepare(`
      INSERT INTO users (
        id, name, email, phone, password_hash, salt, role,
        is_verified, account_status, terms_accepted, terms_version,
        created_at, updated_at
      ) VALUES (?, 'Unv Login', ?, '+919999900004', ?, ?, 'user', 0, 'active', 1, 'v2.0', datetime('now'), datetime('now'))
    `).run(unverifiedLoginId, unverifiedLoginEmail, hash, salt);

    process.env.ENFORCE_VERIFIED_LOGIN = 'true';
    try {
      const res = await makeRequest('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '198.51.100.105',
        },
        body: { email: unverifiedLoginEmail, password: 'UnverifiedLogin123!' },
      });
      assert.equal(res.status, 403);
      assert.equal(res.body.unverified, true);
      assert.match(res.body.error, /verify your email/i);
    } finally {
      delete process.env.ENFORCE_VERIFIED_LOGIN;
    }
  });

  // 32. Email Provider Failure Handling
  await t.test('32. Email service handles provider rejection safely without crashing', async () => {
    const result = await sendVerificationEmail({
      to: 'safety-test@example.com',
      name: 'Safety Tester',
      token: 'test-token-safe-fail-001',
    });
    // With dummy or missing credentials, it must return delivered: false without throwing
    assert.equal(typeof result, 'object');
    assert.equal(typeof result.delivered, 'boolean');
  });

  // 33. Location Sharing: Authenticated User Can Share GPS Coordinates
  await t.test('33. Location sharing: Authenticated user can share GPS coordinates', async () => {
    const userInDb = db.prepare('SELECT token_version FROM users WHERE id = ?').get(testUserId);
    const activeLocationToken = createSessionToken({
      userId: testUserId,
      email: testEmail,
      role: 'user',
      tokenVersion: userInDb ? userInDb.token_version : 1,
    });

    const res = await makeRequest('/api/location/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${activeLocationToken}`,
      },
      body: {
        latitude: 28.6145,
        longitude: 77.2090,
        accuracy: 12.5,
        durationMinutes: 45,
      },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.latitude, 28.6145);
    assert.equal(res.body.data.longitude, 77.2090);
    assert.equal(res.body.data.isActive, true);
  });

  // 34. Location Sharing: Unauthenticated Request is Rejected with 401
  await t.test('34. Location sharing: Unauthenticated request is rejected with 401', async () => {
    const res = await makeRequest('/api/location/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { latitude: 28.6145, longitude: 77.2090 },
    });
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  // 35. Location Sharing: Invalid Coordinates are Rejected with 400
  await t.test('35. Location sharing: Invalid coordinates are rejected with 400', async () => {
    const userInDb = db.prepare('SELECT token_version FROM users WHERE id = ?').get(testUserId);
    const activeLocationToken = createSessionToken({
      userId: testUserId,
      email: testEmail,
      role: 'user',
      tokenVersion: userInDb ? userInDb.token_version : 1,
    });

    const res = await makeRequest('/api/location/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${activeLocationToken}`,
      },
      body: { latitude: 195.0, longitude: 77.2090 }, // Latitude > 90 is invalid
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /latitude/i);
  });

  // 36. Location Sharing: Active Share is Returned via GET /api/location/shared
  await t.test('36. Location sharing: Active share is returned via GET /api/location/shared', async () => {
    const userInDb = db.prepare('SELECT token_version FROM users WHERE id = ?').get(testUserId);
    const activeLocationToken = createSessionToken({
      userId: testUserId,
      email: testEmail,
      role: 'user',
      tokenVersion: userInDb ? userInDb.token_version : 1,
    });

    const res = await makeRequest('/api/location/shared', {
      method: 'GET',
      headers: { Authorization: `Bearer ${activeLocationToken}` },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.sharingActive, true);
    assert.equal(res.body.data.latitude, 28.6145);
  });

  // 37. Location Sharing: Revocation Deactivates Sharing
  await t.test('37. Location sharing: Revocation deactivates sharing and conceals coordinates', async () => {
    const userInDb = db.prepare('SELECT token_version FROM users WHERE id = ?').get(testUserId);
    const activeLocationToken = createSessionToken({
      userId: testUserId,
      email: testEmail,
      role: 'user',
      tokenVersion: userInDb ? userInDb.token_version : 1,
    });

    const revokeRes = await makeRequest('/api/location/revoke', {
      method: 'POST',
      headers: { Authorization: `Bearer ${activeLocationToken}` },
    });
    assert.equal(revokeRes.status, 200);
    assert.equal(revokeRes.body.success, true);

    // Verify subsequent fetch reports sharingActive: false
    const getRes = await makeRequest('/api/location/shared', {
      method: 'GET',
      headers: { Authorization: `Bearer ${activeLocationToken}` },
    });
    assert.equal(getRes.status, 200);
    assert.equal(getRes.body.sharingActive, false);
    assert.equal(getRes.body.data, null);
  });

  // 38. Safe Places Geolocation & Regional Distance Accuracy
  await t.test('38. Safe places: Calculates dynamic Haversine distance and regional notices', async () => {
    // A. Local Coordinates (Delhi NCR center)
    const localRes = await makeRequest('/api/safe-places?lat=28.6145&lng=77.2090', {
      method: 'GET',
    });
    assert.equal(localRes.status, 200);
    assert.equal(localRes.body.success, true);
    assert.equal(localRes.body.data[0].isLocal, true);
    assert.equal(typeof localRes.body.data[0].distanceKm, 'number');
    assert.equal(localRes.body.data[0].regionNotice, null);
    assert.equal(localRes.body.data[0].city, 'Delhi NCR');

    // B. Distant Coordinates (Mumbai ~1,100km away)
    const distantRes = await makeRequest('/api/safe-places?lat=19.0760&lng=72.8777', {
      method: 'GET',
    });
    assert.equal(distantRes.status, 200);
    assert.equal(distantRes.body.data[0].isLocal, false);
    assert.ok(distantRes.body.data[0].distanceKm > 1000);
    assert.match(distantRes.body.data[0].regionNotice, /Outside your immediate area/);
  });

  // 39. SOS Incident Management: Deduplication of rapid repeat EMERGENCY requests
  await t.test('39. SOS: Deduplicates rapid repeat emergency incidents and updates telemetry', async () => {
    // Clear prior emergency logs for testUserId to test fresh SOS creation followed by deduplication
    db.prepare("DELETE FROM incident_logs WHERE user_id = ? AND safety_state = 'EMERGENCY'").run(testUserId);

    const userInDb = db.prepare('SELECT token_version FROM users WHERE id = ?').get(testUserId);
    const activeToken = createSessionToken({
      userId: testUserId,
      email: testEmail,
      role: 'user',
      tokenVersion: userInDb ? userInDb.token_version : 1,
    });

    // First SOS
    const firstSos = await makeRequest('/api/incidents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${activeToken}`,
      },
      body: {
        state: 'EMERGENCY',
        title: 'Immediate Distress Alert',
        latitude: 28.6145,
        longitude: 77.2090,
      },
    });
    assert.equal(firstSos.status, 201);
    const incidentId = firstSos.body.data.id;

    // Immediate second SOS (e.g. repeated panic press with refined GPS)
    const secondSos = await makeRequest('/api/incidents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${activeToken}`,
      },
      body: {
        state: 'EMERGENCY',
        title: 'Immediate Distress Alert Refined',
        latitude: 28.6152,
        longitude: 77.2098,
      },
    });
    assert.equal(secondSos.status, 200);
    assert.equal(secondSos.body.isDuplicate, true);
    assert.equal(secondSos.body.data.id, incidentId);
    assert.equal(secondSos.body.data.latitude, 28.6152);
  });

  // 40. Location Sharing: Authorized trusted contact can retrieve ward's active shared location
  let sharedGuardianToken = null;
  await t.test('40. Location sharing: Authorized guardian can retrieve active shared location', async () => {
    const userInDb = db.prepare('SELECT token_version FROM users WHERE id = ?').get(testUserId);
    const activeWardToken = createSessionToken({
      userId: testUserId,
      email: testEmail,
      role: 'user',
      tokenVersion: userInDb ? userInDb.token_version : 1,
    });

    // 1. User A activates sharing
    await makeRequest('/api/location/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${activeWardToken}`,
      },
      body: {
        latitude: 28.6160,
        longitude: 77.2100,
        accuracy: 8.0,
        durationMinutes: 60,
      },
    });

    // 2. User A registers Guardian (Phone: +91 9988776655)
    const guardianPhone = '+91 9988776655';
    await makeRequest('/api/guardians', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${activeWardToken}`,
      },
      body: {
        name: 'Dr. Guardian Sister',
        relationship: 'Sister',
        phone: guardianPhone,
        priority: 'Primary',
      },
    });

    // 3. Create real user account in database for the Guardian with matching phone
    const guardianUserId = `u-guardian-${Date.now()}`;
    const nowIso = new Date().toISOString();
    db.prepare(`
      INSERT INTO users (id, name, email, phone, salt, password_hash, is_verified, account_status, token_version, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'salt', 'hash', 1, 'active', 1, ?, ?)
    `).run(guardianUserId, 'Dr. Guardian Sister', `guardian_${Date.now()}@saheli.org`, guardianPhone, nowIso, nowIso);

    sharedGuardianToken = createSessionToken({
      userId: guardianUserId,
      email: `guardian_${Date.now()}@saheli.org`,
      phone: guardianPhone,
      role: 'user',
      tokenVersion: 1,
    });

    // 4. Guardian requests ward's location
    const res = await makeRequest(`/api/location/shared?targetUserId=${testUserId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${sharedGuardianToken}` },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.sharingActive, true);
    assert.equal(res.body.data.latitude, 28.6160);
    assert.equal(res.body.data.longitude, 77.2100);
  });

  // 41. Location Sharing: Unauthorized stranger is rejected with 403 Forbidden
  await t.test('41. Location sharing: Unauthorized stranger is rejected with 403 Forbidden', async () => {
    // Create real user account in database for stranger with unrelated phone
    const strangerUserId = `u-stranger-${Date.now()}`;
    const strangerPhone = '+91 9111122222';
    const nowIso = new Date().toISOString();
    db.prepare(`
      INSERT INTO users (id, name, email, phone, salt, password_hash, is_verified, account_status, token_version, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'salt', 'hash', 1, 'active', 1, ?, ?)
    `).run(strangerUserId, 'Stranger User', `stranger_${Date.now()}@saheli.org`, strangerPhone, nowIso, nowIso);

    const strangerToken = createSessionToken({
      userId: strangerUserId,
      email: `stranger_${Date.now()}@saheli.org`,
      phone: strangerPhone,
      role: 'user',
      tokenVersion: 1,
    });

    const res = await makeRequest(`/api/location/shared?targetUserId=${testUserId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${strangerToken}` },
    });
    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /Forbidden/);
  });

  // 42. Location Sharing: Revoked sharing conceals coordinates from authorized guardian
  await t.test('42. Location sharing: Revoked sharing conceals coordinates from guardian', async () => {
    const userInDb = db.prepare('SELECT token_version FROM users WHERE id = ?').get(testUserId);
    const activeWardToken = createSessionToken({
      userId: testUserId,
      email: testEmail,
      role: 'user',
      tokenVersion: userInDb ? userInDb.token_version : 1,
    });

    // 1. Ward revokes sharing
    const revokeRes = await makeRequest('/api/location/revoke', {
      method: 'POST',
      headers: { Authorization: `Bearer ${activeWardToken}` },
    });
    assert.equal(revokeRes.status, 200);

    // 2. Guardian attempts to read location again
    const res = await makeRequest(`/api/location/shared?targetUserId=${testUserId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${sharedGuardianToken}` },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.sharingActive, false);
    assert.equal(res.body.data, null);
  });

  // 43. Email OTP: Registration creates unverified user with hashed 6-digit OTP
  let otpUserId = null;
  let otpPhone = `+91 91234${String(Date.now()).slice(-5)}`;
  let otpEmail = `email_user_${Date.now()}@saheli.org`;
  let devOtp = null;
  const otpTestHeaders = {
    'Content-Type': 'application/json',
    'X-Forwarded-For': '198.51.100.77',
  };

  await t.test('43. Email OTP: Registration generates 6-digit OTP and stores hash in DB', async () => {
    const res = await makeRequest('/api/auth/register', {
      method: 'POST',
      headers: otpTestHeaders,
      body: {
        name: 'Email OTP Test User',
        email: otpEmail,
        phone: otpPhone,
        password: 'ValidPassword123!',
      },
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.requiresOtp, true);
    assert.equal(res.body.user.is_verified, 0);
    assert.ok(res.body.devOtp);
    assert.match(res.body.devOtp, /^\d{6}$/);

    otpUserId = res.body.user.id;
    devOtp = res.body.devOtp;

    // Check database to ensure plaintext OTP is NOT stored and hash is stored
    const dbUser = db.prepare('SELECT otp_hash, otp_expires, otp_attempts FROM users WHERE id = ?').get(otpUserId);
    assert.ok(dbUser.otp_hash);
    assert.notEqual(dbUser.otp_hash, devOtp);
    assert.ok(dbUser.otp_expires > Date.now());
    assert.equal(dbUser.otp_attempts, 0);
  });

  // 44. Email OTP: Incorrect OTP returns 400 and decrements remaining attempts
  await t.test('44. Email OTP: Incorrect OTP is rejected with remaining attempts count', async () => {
    const res = await makeRequest('/api/auth/verify-otp', {
      method: 'POST',
      headers: otpTestHeaders,
      body: {
        userId: otpUserId,
        otp: '000000',
      },
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.remainingAttempts, 4);

    const dbUser = db.prepare('SELECT otp_attempts FROM users WHERE id = ?').get(otpUserId);
    assert.equal(dbUser.otp_attempts, 1);
  });

  // 45. Email OTP: 5 incorrect attempts locks the OTP code
  await t.test('45. Email OTP: Exceeding 5 failed attempts invalidates and locks OTP', async () => {
    // Perform 4 more failed attempts (total 5)
    for (let i = 0; i < 4; i++) {
      await makeRequest('/api/auth/verify-otp', {
        method: 'POST',
        headers: otpTestHeaders,
        body: {
          userId: otpUserId,
          otp: '000000',
        },
      });
    }

    // 6th attempt should return 429 or 400 locked error
    const res = await makeRequest('/api/auth/verify-otp', {
      method: 'POST',
      headers: otpTestHeaders,
      body: {
        userId: otpUserId,
        otp: devOtp,
      },
    });

    assert.ok(res.status === 429 || res.status === 400);
    assert.equal(res.body.success, false);

    const dbUser = db.prepare('SELECT otp_hash FROM users WHERE id = ?').get(otpUserId);
    assert.equal(dbUser.otp_hash, null);
  });

  // 46. Email OTP: Resend enforces 60-second cooldown
  await t.test('46. Email OTP: Resend enforces 60-second cooldown rate limit', async () => {
    // Attempt resend immediately (registration was just performed, last_sent < 60s ago)
    const res = await makeRequest('/api/auth/resend-otp', {
      method: 'POST',
      headers: otpTestHeaders,
      body: {
        userId: otpUserId,
      },
    });

    assert.equal(res.status, 429);
    assert.equal(res.body.success, false);
    assert.ok(res.body.retryAfterSeconds > 0);
  });

  // 47. Email OTP: Valid OTP verification activates user account and clears OTP (single-use)
  await t.test('47. Email OTP: Valid OTP verification activates user and issues session token', async () => {
    // Reset last_sent timestamp in DB to simulate cooldown expiration
    db.prepare('UPDATE users SET otp_last_sent_at = ? WHERE id = ?').run(Date.now() - 70000, otpUserId);

    // Request fresh OTP
    const resendRes = await makeRequest('/api/auth/resend-otp', {
      method: 'POST',
      headers: otpTestHeaders,
      body: {
        userId: otpUserId,
      },
    });

    assert.equal(resendRes.status, 200);
    assert.equal(resendRes.body.success, true);
    assert.ok(resendRes.body.devOtp);
    const freshOtp = resendRes.body.devOtp;

    // Verify with valid fresh OTP
    const verifyRes = await makeRequest('/api/auth/verify-otp', {
      method: 'POST',
      headers: otpTestHeaders,
      body: {
        userId: otpUserId,
        otp: freshOtp,
      },
    });

    assert.equal(verifyRes.status, 200);
    assert.equal(verifyRes.body.success, true);
    assert.ok(verifyRes.body.token);
    assert.equal(verifyRes.body.user.is_verified, 1);

    // Database check: user is verified, email_verified_at set, otp_hash cleared
    const dbUser = db.prepare('SELECT is_verified, email_verified_at, otp_hash FROM users WHERE id = ?').get(otpUserId);
    assert.equal(dbUser.is_verified, 1);
    assert.ok(dbUser.email_verified_at);
    assert.equal(dbUser.otp_hash, null);

    // Reused OTP should be rejected
    const reuseRes = await makeRequest('/api/auth/verify-otp', {
      method: 'POST',
      headers: otpTestHeaders,
      body: {
        userId: otpUserId,
        otp: freshOtp,
      },
    });

    assert.equal(reuseRes.status, 400);
    assert.equal(reuseRes.body.success, false);
  });

  // 48. Supabase Auth: Session synchronization auto-provisions and links user record
  // 48. Supabase Auth: Session synchronization auto-provisions and links user record
  const makeTestSupabaseToken = (payload, secret = 'saheli-supabase-test-jwt-secret-2026', alg = 'HS256') => {
    const headerB64 = Buffer.from(JSON.stringify({ alg, typ: 'JWT' })).toString('base64url');
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    if (alg.toLowerCase() === 'none') {
      return `${headerB64}.${payloadB64}.`;
    }
    const sig = crypto.createHmac('sha256', secret).update(`${headerB64}.${payloadB64}`).digest('base64url');
    return `${headerB64}.${payloadB64}.${sig}`;
  };

  await t.test('48. Supabase Auth: Session synchronization auto-provisions and links user record', async () => {
    const mockEmail = `supabase_sync_${Date.now()}@saheli.org`;
    const mockToken = makeTestSupabaseToken({
      sub: `sup-usr-${Date.now()}`,
      email: mockEmail,
      role: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const res = await makeRequest('/api/auth/supabase-session', {
      method: 'POST',
      headers: otpTestHeaders,
      body: {
        accessToken: mockToken,
        name: 'Supabase Verified User',
        phone: '+91 9876543210',
        emergencyPin: '5678',
      },
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.email, mockEmail);
    assert.equal(res.body.user.is_verified, 1);
    assert.ok(res.body.token);

    // Protected route check using the synchronized session token
    const profileRes = await makeRequest('/api/auth/me', {
      headers: { Authorization: `Bearer ${res.body.token}` },
    });
    assert.equal(profileRes.status, 200);
    assert.equal(profileRes.body.user.email, mockEmail);
  });

  // 49. Public Runtime Configuration: GET /api/config returns safe config and leaks no private secrets
  await t.test('49. Public runtime config: GET /api/config returns safe client parameters and no secrets', async () => {
    const res = await makeRequest('/api/config', { method: 'GET' });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(typeof res.body.isConfigured, 'boolean');
    assert.equal(res.body.jwtSecret, undefined);
    assert.equal(res.body.serviceRoleKey, undefined);
    assert.equal(res.body.SUPABASE_SERVICE_ROLE_KEY, undefined);
    assert.equal(res.body.SMTP_PASS, undefined);
  });

  // 50. Existing User Migration: Supabase token links to existing SQLite user without duplication
  await t.test('50. Existing user migration: Supabase token links existing SQLite user and preserves guardians', async () => {
    const existingEmail = `legacy_user_${Date.now()}@saheli.org`;
    const existingUserId = `usr-legacy-${Date.now()}`;
    const nowIso = new Date().toISOString();

    // 1. Pre-existing SQLite user with existing guardian
    db.prepare(`
      INSERT INTO users (id, name, email, phone, password_hash, salt, role, is_verified, account_status, created_at, updated_at)
      VALUES (?, 'Legacy Priya', ?, '+91 9888877777', 'legacy_hash', 'legacy_salt', 'user', 0, 'active', ?, ?)
    `).run(existingUserId, existingEmail, nowIso, nowIso);

    const legacyGuardianId = `g-legacy-${Date.now()}`;
    db.prepare(`
      INSERT INTO guardians (id, user_id, name, relationship, phone, priority, status, battery, created_at)
      VALUES (?, ?, 'Legacy Mother', 'Mother', '+91 9999900000', 'Primary', 'Available', 90, ?)
    `).run(legacyGuardianId, existingUserId, nowIso);

    // 2. Cryptographically signed Supabase login token for the same email
    const supToken = makeTestSupabaseToken({
      sub: `sup-uuid-${Date.now()}`,
      email: existingEmail,
      role: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    // 3. User verifies with Supabase session sync
    const syncRes = await makeRequest('/api/auth/supabase-session', {
      method: 'POST',
      headers: otpTestHeaders,
      body: {
        accessToken: supToken,
        name: 'Legacy Priya Updated',
      },
    });

    assert.equal(syncRes.status, 200);
    assert.equal(syncRes.body.success, true);
    // User ID must remain the original existingUserId, not a new duplicate!
    assert.equal(syncRes.body.user.id, existingUserId);
    assert.equal(syncRes.body.user.is_verified, 1);

    // Verify no duplicate user was inserted
    const countCheck = db.prepare('SELECT COUNT(*) as count FROM users WHERE email = ?').get(existingEmail);
    assert.equal(countCheck.count, 1);

    // Verify original guardian is still owned by the migrated user
    const guardianCheck = db.prepare('SELECT * FROM guardians WHERE user_id = ?').all(existingUserId);
    assert.equal(guardianCheck.length, 1);
    assert.equal(guardianCheck[0].name, 'Legacy Mother');

    // 4. Test direct Supabase JWT on protected endpoint without using native session token
    const directJwtMe = await makeRequest('/api/auth/me', {
      headers: { Authorization: `Bearer ${supToken}` },
    });
    assert.equal(directJwtMe.status, 200);
    assert.equal(directJwtMe.body.user.id, existingUserId);
    assert.equal(directJwtMe.body.user.email, existingEmail);
  });

  // 51. Cryptographic Security: Rejects algorithm "none", forged signatures, and malformed JWTs
  await t.test('51. JWT Security: Rejects algorithm "none", forged signatures, and malformed JWTs', async () => {
    // A. Algorithm "none" attack
    const noneToken = makeTestSupabaseToken(
      { sub: 'attacker-1', email: 'attacker@saheli.org', exp: Math.floor(Date.now() / 1000) + 3600 },
      'saheli-supabase-test-jwt-secret-2026',
      'none'
    );
    const noneRes = await makeRequest('/api/auth/me', {
      headers: { Authorization: `Bearer ${noneToken}` },
    });
    assert.equal(noneRes.status, 401);

    // B. Forged signature attack (wrong secret)
    const forgedToken = makeTestSupabaseToken(
      { sub: 'attacker-2', email: 'attacker@saheli.org', exp: Math.floor(Date.now() / 1000) + 3600 },
      'wrong-attacker-secret'
    );
    const forgedRes = await makeRequest('/api/auth/me', {
      headers: { Authorization: `Bearer ${forgedToken}` },
    });
    assert.equal(forgedRes.status, 401);

    // C. Malformed token (missing parts)
    const malformedRes = await makeRequest('/api/auth/me', {
      headers: { Authorization: 'Bearer this.is.not.a.valid.jwt.token' },
    });
    assert.equal(malformedRes.status, 401);
  });

  // 52. Expiration Validation: Expired Supabase JWT is rejected
  await t.test('52. JWT Security: Expired Supabase token is rejected with 401', async () => {
    const expiredToken = makeTestSupabaseToken({
      sub: 'expired-sup-user',
      email: 'expired_sup@saheli.org',
      exp: Math.floor(Date.now() / 1000) - 300, // expired 5 mins ago
    });
    const res = await makeRequest('/api/auth/me', {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert.equal(res.status, 401);
  });

  // 53. Account Suspension Enforcement: Suspended user cannot bypass lockout via Supabase sync
  await t.test('53. Account Security: Suspended user cannot log in or reactivate account via Supabase sync', async () => {
    const suspendedEmail = `suspended_audit_${Date.now()}@saheli.org`;
    const suspendedId = `usr-suspended-${Date.now()}`;
    const nowIso = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, name, email, phone, password_hash, salt, role, is_verified, account_status, created_at, updated_at)
      VALUES (?, 'Suspended User', ?, '+91 9111122222', 'hash', 'salt', 'user', 1, 'suspended', ?, ?)
    `).run(suspendedId, suspendedEmail, nowIso, nowIso);

    const supToken = makeTestSupabaseToken({
      sub: `sup-sus-${Date.now()}`,
      email: suspendedEmail,
      role: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const syncRes = await makeRequest('/api/auth/supabase-session', {
      method: 'POST',
      headers: otpTestHeaders,
      body: { accessToken: supToken },
    });

    assert.equal(syncRes.status, 403);
    assert.equal(syncRes.body.success, false);
    assert.match(syncRes.body.error, /suspended or disabled/i);

    // Verify account_status is STILL 'suspended' in SQLite
    const checkDb = db.prepare('SELECT account_status FROM users WHERE id = ?').get(suspendedId);
    assert.equal(checkDb.account_status, 'suspended');
  });

  // 54. Account Linking Security: Body claim mismatch with verified JWT identity is rejected
  await t.test('54. Account Linking: Email mismatch between body claim and verified JWT token is rejected with 400', async () => {
    const tokenEmail = `token_identity_${Date.now()}@saheli.org`;
    const bodyEmail = `claimed_victim_${Date.now()}@saheli.org`;

    const supToken = makeTestSupabaseToken({
      sub: `sup-mismatch-${Date.now()}`,
      email: tokenEmail,
      role: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const res = await makeRequest('/api/auth/supabase-session', {
      method: 'POST',
      headers: otpTestHeaders,
      body: {
        accessToken: supToken,
        email: bodyEmail, // mismatch claim
      },
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /email mismatch/i);
  });
});
