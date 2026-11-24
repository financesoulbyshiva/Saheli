import db from '../db/index.js';
import {
  hashPassword,
  verifyPassword,
  hashPin,
  createSessionToken,
  verifySessionToken,
  generateRandomToken,
  generateOtp,
  hashOtp,
  verifyOtpHash,
  hashToken,
  validatePasswordStrength,
  validateEmail,
  sanitizeString,
} from '../utils/crypto.js';
import { checkRateLimit } from '../middleware/index.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.js';
import { sendSupabaseEmailOtp, verifySupabaseToken } from '../services/supabaseAuth.js';

function sanitizeUser(user) {
  if (!user) return null;
  const {
    password_hash,
    salt,
    reset_token,
    reset_token_hash,
    reset_token_expires,
    verification_token,
    verification_token_hash,
    verification_token_expires,
    otp_hash,
    otp_expires,
    otp_attempts,
    otp_last_sent_at,
    ...safe
  } = user;
  return safe;
}

export const authController = {
  // 1. User Registration
  async register(req, body, res, sendJson) {
    const name = sanitizeString(body.name || '');
    const email = (body.email || '').trim().toLowerCase();
    const phone = sanitizeString(body.phone || '');
    const password = body.password || '';
    const emergencyPin = body.emergencyPin || '1234';

    if (!name || name.length < 2) {
      sendJson(res, 400, { success: false, error: 'Name must be at least 2 characters long' });
      return;
    }

    if (!validateEmail(email)) {
      sendJson(res, 400, { success: false, error: 'Invalid email address format' });
      return;
    }

    if (!phone || phone.replace(/\D/g, '').length < 7) {
      sendJson(res, 400, { success: false, error: 'Valid phone number is required' });
      return;
    }
    const cleanPhone = phone.trim();

    if (body.terms_accepted === false) {
      sendJson(res, 400, {
        success: false,
        error: 'You must accept the Terms of Service and Privacy Policy to register.',
      });
      return;
    }

    const passCheck = validatePasswordStrength(password);
    if (!passCheck.valid) {
      sendJson(res, 400, { success: false, error: passCheck.message });
      return;
    }

    const isTestMode = process.env.NODE_ENV === 'test' || process.env.SAHELI_OTP_TEST_MODE === 'true';

    // Check if user already exists
    const existing = db.prepare('SELECT id, is_verified, name, verification_token FROM users WHERE email = ?').get(email);
    if (existing) {
      if (existing.is_verified === 0) {
        // Account exists but has not completed OTP verification.
        // Update credentials and dispatch a fresh 6-digit verification code while preserving existing verification_token.
        const freshOtp = generateOtp();
        const freshOtpHashed = hashOtp(freshOtp);
        const freshOtpExpires = Date.now() + 5 * 60 * 1000;

        const { salt: newSalt, hash: newHash } = hashPassword(password);
        const newPinHash = hashPin(emergencyPin);

        db.prepare(`
          UPDATE users
          SET name = ?, phone = ?, password_hash = ?, salt = ?, emergency_pin_hash = ?,
              otp_hash = ?, otp_expires = ?, otp_attempts = 0, otp_last_sent_at = ?,
              updated_at = ?
          WHERE id = ?
        `).run(
          name, cleanPhone, newHash, newSalt, newPinHash,
          freshOtpHashed, freshOtpExpires, Date.now(),
          new Date().toISOString(), existing.id
        );

        let emailResult = { delivered: false };
        try {
          emailResult = await sendVerificationEmail({
            to: email,
            name,
            token: freshOtp,
            otp: freshOtp,
            verificationToken: existing.verification_token,
          });
        } catch (err) {
          console.error('[Auth] Re-registration OTP dispatch error:', err.message);
          emailResult = { delivered: false, error: err.message };
        }

        const emailDelivered = Boolean(emailResult?.delivered);
        const emailNotice = emailDelivered
          ? 'An account was pending verification. A fresh 6-digit verification code has been dispatched to your Gmail inbox.'
          : 'Account updated. If the email does not appear in your inbox shortly, please check your spam folder or click Resend.';

        sendJson(res, 400, {
          success: false,
          unverified: true,
          requiresOtp: true,
          userId: existing.id,
          email,
          phone: cleanPhone,
          emailDelivered,
          emailError: emailResult?.error || null,
          error: emailNotice,
          message: emailNotice,
          ...(isTestMode ? { devOtp: freshOtp, verificationToken: existing.verification_token } : {}),
        });
        return;
      }

      sendJson(res, 400, {
        success: false,
        error: 'An account with this email already exists or is unavailable.',
      });
      return;
    }

    const { salt, hash } = hashPassword(password);
    const pinHash = hashPin(emergencyPin);
    const userId = `usr-${Date.now()}-${generateRandomToken(4)}`;
    const now = new Date().toISOString();
    const nowMs = Date.now();

    // Generate cryptographically secure 6-digit Email OTP (5-minute expiration)
    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const otpExpires = nowMs + 5 * 60 * 1000;

    const verificationToken = generateRandomToken(32);
    const verificationTokenHash = hashToken(verificationToken);
    const verificationExpires = nowMs + 86400 * 1000;
    const termsAccepted = body.terms_accepted !== false && body.termsAccepted !== false ? 1 : 0;
    const termsVersion = body.terms_version || 'v2.0';
    const termsAcceptedAt = termsAccepted ? now : null;

    const insertStmt = db.prepare(`
      INSERT INTO users (
        id, name, email, phone, password_hash, salt, role,
        is_verified, account_status, terms_accepted, terms_version, terms_accepted_at,
        otp_hash, otp_expires, otp_attempts, otp_last_sent_at,
        verification_token, verification_token_hash, verification_token_expires,
        token_version, emergency_pin_hash, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'user', 0, 'active', ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, 1, ?, ?, ?)
    `);

    insertStmt.run(
      userId,
      name,
      email,
      cleanPhone,
      hash,
      salt,
      termsAccepted,
      termsVersion,
      termsAcceptedAt,
      otpHash,
      otpExpires,
      nowMs,
      verificationToken,
      verificationTokenHash,
      verificationExpires,
      pinHash,
      now,
      now
    );

    // Seed initial default guardian for new user
    const guardianStmt = db.prepare(`
      INSERT INTO guardians (id, user_id, name, relationship, phone, priority, status, battery, created_at)
      VALUES (?, ?, ?, ?, ?, 'Primary', 'Available', 95, ?)
    `);
    guardianStmt.run(`g-${Date.now()}-1`, userId, 'Primary Contact', 'Family', cleanPhone, now);

    const token = createSessionToken({
      userId,
      email,
      name,
      phone: cleanPhone,
      role: 'user',
      tokenVersion: 1,
      passwordHash: hash,
      salt,
      emergencyPinHash: pinHash,
      otpHash,
      otpExpires,
      isVerified: false,
    });
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    // Dispatch Email OTP directly via email service
    let emailResult = { delivered: false };
    try {
      emailResult = await sendVerificationEmail({ to: email, name, token: otp, otp, verificationToken });
      if (!emailResult.delivered && !emailResult.configured) {
        const supResult = await sendSupabaseEmailOtp(email);
        if (supResult.configured && supResult.success) {
          emailResult = supResult;
        }
      }
    } catch (err) {
      emailResult = { delivered: false, error: err.message };
    }

    const emailDelivered = Boolean(emailResult?.delivered);
    const emailNotice = emailDelivered
      ? 'A 6-digit verification code has been dispatched to your email address.'
      : (isTestMode ? `Email service notice: ${emailResult?.error || 'could not deliver to inbox'}. Active code: [${otp}]` : `Notice: Verification email could not be delivered to inbox (${emailResult?.error || 'SMTP delivery failure'}). Please check your sender email configuration.`);

    sendJson(res, 201, {
      success: true,
      message: 'Registration successful. ' + emailNotice,
      token,
      user: sanitizeUser(user),
      requiresOtp: true,
      email,
      phone: cleanPhone,
      emailDelivered,
      emailError: emailResult?.error || null,
      supabaseConfigured: emailResult.configured !== false,
      ...(isTestMode ? { devOtp: otp, verificationToken } : {}),
    });
  },

  // 2. User Login
  async login(req, body, res, sendJson) {
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';

    if (!email || !password) {
      sendJson(res, 400, { success: false, error: 'Email and password are required' });
      return;
    }

    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      // Check for client-provided verified account hint from localStorage for cross-container recovery
      const accountHint = req.headers['x-account-hint'] || body?.accountHint;
      if (accountHint) {
        const hint = verifySessionToken(accountHint);
        if (hint && hint.email === email && hint.passwordHash && hint.salt) {
          if (verifyPassword(password, hint.salt, hint.passwordHash)) {
            const nowIso = new Date().toISOString();
            const isVerifiedVal = hint.isVerified !== undefined ? (hint.isVerified ? 1 : 0) : 1;
            db.prepare(`
              INSERT OR REPLACE INTO users (
                id, name, email, phone, password_hash, salt, role,
                is_verified, email_verified_at, phone_verified_at,
                account_status, terms_accepted, terms_version, token_version,
                emergency_pin_hash, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 1, 'v2.0', ?, ?, ?, ?)
            `).run(
              hint.userId,
              hint.name || 'User',
              hint.email,
              hint.phone || '',
              hint.passwordHash,
              hint.salt,
              hint.role || 'user',
              isVerifiedVal,
              isVerifiedVal ? nowIso : null,
              isVerifiedVal ? nowIso : null,
              hint.tokenVersion || 1,
              hint.emergencyPinHash || null,
              nowIso,
              nowIso
            );
            user = db.prepare('SELECT * FROM users WHERE id = ?').get(hint.userId);
          }
        }
      }
    }

    if (!user) {
      // Dummy verification to prevent timing attack enumeration
      hashPassword('dummy-pass-timing-neutralizer');
      sendJson(res, 401, { success: false, error: 'Invalid email or password' });
      return;
    }

    const isValid = verifyPassword(password, user.salt, user.password_hash);
    if (!isValid) {
      sendJson(res, 401, { success: false, error: 'Invalid email or password' });
      return;
    }

    if (user.account_status === 'disabled' || user.account_status === 'suspended') {
      sendJson(res, 403, {
        success: false,
        error: 'Your account has been suspended or disabled. Please contact safety support.',
      });
      return;
    }

    // Unverified account handling: automatically generate and dispatch a fresh 6-digit OTP to user's email
    if (!user.is_verified) {
      const now = Date.now();
      const loginOtp = generateOtp();
      const loginOtpHash = hashOtp(loginOtp);
      const loginOtpExpires = now + 5 * 60 * 1000;

      db.prepare(`
        UPDATE users SET
          otp_hash = ?,
          otp_expires = ?,
          otp_attempts = 0,
          otp_last_sent_at = ?,
          updated_at = ?
        WHERE id = ?
      `).run(loginOtpHash, loginOtpExpires, now, new Date().toISOString(), user.id);

      console.log(`[Auth] Verification OTP dispatched on login to ${user.email}: [${loginOtp}]`);

      let emailResult = { delivered: false };
      try {
        emailResult = await sendVerificationEmail({
          to: user.email,
          name: user.name,
          token: loginOtp,
          otp: loginOtp,
          verificationToken: user.verification_token,
        });
      } catch (err) {
        console.error('[Auth] Login OTP dispatch error:', err.message);
        emailResult = { delivered: false, error: err.message };
      }

      const token = createSessionToken({
        userId: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        tokenVersion: user.token_version || 1,
        passwordHash: user.password_hash,
        salt: user.salt,
        emergencyPinHash: user.emergency_pin_hash,
        otpHash: loginOtpHash,
        otpExpires: loginOtpExpires,
        isVerified: false,
      });

      const emailDelivered = Boolean(emailResult?.delivered);
      if (process.env.ENFORCE_VERIFIED_LOGIN === 'true') {
        sendJson(res, 403, {
          success: false,
          unverified: true,
          requiresOtp: true,
          userId: user.id,
          email: user.email,
          phone: user.phone,
          error: emailDelivered
            ? 'Please verify your email address before logging in. A new 6-digit OTP code has been sent to your Gmail inbox.'
            : `Please verify your email address. Verification code generated, but email could not be delivered (${emailResult?.error || 'SMTP failed'}).`,
          message: emailDelivered
            ? 'A new 6-digit OTP code has been sent to your Gmail inbox.'
            : `Email delivery failed: ${emailResult?.error || 'SMTP error'}.`,
          emailDelivered,
          emailError: emailResult?.error || null,
          ...(process.env.NODE_ENV === 'test' || process.env.SAHELI_OTP_TEST_MODE === 'true' ? { devOtp: loginOtp } : {}),
        });
        return;
      }

      sendJson(res, 200, {
        success: true,
        unverified: true,
        requiresOtp: true,
        userId: user.id,
        email: user.email,
        phone: user.phone,
        message: emailDelivered
          ? 'A fresh 6-digit verification OTP has been sent to your Gmail inbox.'
          : `Verification code generated, but email delivery to inbox failed (${emailResult?.error || 'SMTP failure'}).`,
        emailDelivered,
        emailError: emailResult?.error || null,
        token,
        user: sanitizeUser(user),
        ...(process.env.NODE_ENV === 'test' || process.env.SAHELI_OTP_TEST_MODE === 'true' ? { devOtp: loginOtp } : {}),
      });
      return;
    }

    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      tokenVersion: user.token_version || 1,
      passwordHash: user.password_hash,
      salt: user.salt,
      emergencyPinHash: user.emergency_pin_hash,
      isVerified: true,
    });

    sendJson(res, 200, {
      success: true,
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
      unverified: !user.is_verified,
    });
  },

  // 3. User Profile (Me)
  me(req, res, user, sendJson) {
    if (!user) {
      sendJson(res, 401, { success: false, error: 'Unauthorized. Please log in.' });
      return;
    }
    sendJson(res, 200, {
      success: true,
      user: sanitizeUser(user),
    });
  },

  // 4. Update Profile
  updateProfile(req, body, res, user, sendJson) {
    if (!user) {
      sendJson(res, 401, { success: false, error: 'Unauthorized. Please log in.' });
      return;
    }

    const name = sanitizeString(body.name || user.name);
    const phone = sanitizeString(body.phone || user.phone);
    const bloodGroup = sanitizeString(body.bloodGroup || user.blood_group || 'O+', 5);
    const medicalNotes = sanitizeString(body.medicalNotes || '', 255);
    const checkinInterval = Number(body.checkInMinutes) || user.checkin_interval_minutes || 4;
    const now = new Date().toISOString();

    const currentUser = db.prepare('SELECT emergency_pin_hash FROM users WHERE id = ?').get(user.id);
    let pinHash = currentUser?.emergency_pin_hash ?? null;
    if (body.emergencyPin && body.emergencyPin.length >= 4) {
      pinHash = hashPin(body.emergencyPin);
    }

    const updateStmt = db.prepare(`
      UPDATE users SET
        name = ?, phone = ?, blood_group = ?, medical_notes = ?,
        checkin_interval_minutes = ?, emergency_pin_hash = ?, updated_at = ?
      WHERE id = ?
    `);

    updateStmt.run(name, phone, bloodGroup, medicalNotes, checkinInterval, pinHash, now, user.id);

    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    sendJson(res, 200, {
      success: true,
      message: 'Profile updated successfully',
      user: sanitizeUser(updated),
    });
  },

  // 5. Change Password
  changePassword(req, body, res, user, sendJson) {
    if (!user) {
      sendJson(res, 401, { success: false, error: 'Unauthorized. Please log in.' });
      return;
    }

    const currentPassword = body.currentPassword || '';
    const newPassword = body.newPassword || '';

    const fullUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    const isValid = verifyPassword(currentPassword, fullUser.salt, fullUser.password_hash);
    if (!isValid) {
      sendJson(res, 400, { success: false, error: 'Current password does not match' });
      return;
    }

    if (currentPassword === newPassword) {
      sendJson(res, 400, {
        success: false,
        error: 'New password cannot be the same as your current password.',
      });
      return;
    }

    const passCheck = validatePasswordStrength(newPassword);
    if (!passCheck.valid) {
      sendJson(res, 400, { success: false, error: passCheck.message });
      return;
    }

    const { salt, hash } = hashPassword(newPassword);
    const now = new Date().toISOString();

    db.prepare('UPDATE users SET password_hash = ?, salt = ?, token_version = token_version + 1, updated_at = ? WHERE id = ?').run(
      hash,
      salt,
      now,
      user.id
    );

    sendJson(res, 200, {
      success: true,
      message: 'Password changed successfully. Active sessions updated.',
    });
  },

  // 6. Forgot Password (Initiate Reset)
  async forgotPassword(req, body, res, sendJson) {
    const email = (body.email || '').trim().toLowerCase();

    // Prevent user enumeration: always return same message
    const genericSuccess = {
      success: true,
      message: 'If an account exists for this email, a 6-digit password reset code has been sent to your Gmail inbox.',
    };

    if (!email || !validateEmail(email)) {
      sendJson(res, 200, genericSuccess);
      return;
    }

    // Rate limiting: 5 reset attempts per 15 minutes per IP or email
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'ip';
    const rateLimitKey = `forgot-${email || clientIp}`;
    const limit = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
    if (!limit.allowed) {
      sendJson(res, 429, {
        success: false,
        error: 'Too many password reset requests. Please wait a few moments before trying again.',
        retryAfterSeconds: limit.resetSeconds,
      });
      return;
    }

    let user = db.prepare('SELECT id, name, email FROM users WHERE email = ?').get(email);
    if (!user) {
      // Auto-provision unverified user record so password reset OTP is dispatched to their inbox
      const userId = `usr-${Date.now()}-${generateRandomToken(4)}`;
      const { salt, hash } = hashPassword(generateRandomToken(32));
      const nowIso = new Date().toISOString();
      const defaultName = email.split('@')[0].replace(/[._-]+/g, ' ') || 'User';
      db.prepare(`
        INSERT INTO users (id, name, email, phone, password_hash, salt, role, is_verified, account_status, terms_accepted, terms_version, created_at, updated_at)
        VALUES (?, ?, ?, '', ?, ?, 'user', 0, 'active', 1, 'v2.0', ?, ?)
      `).run(userId, defaultName, email, hash, salt, nowIso, nowIso);
      user = { id: userId, name: defaultName, email };
    }

    // Generate a user-friendly 6-digit reset code
    const resetOtp = generateOtp();
    const resetHash = hashToken(resetOtp);
    const expires = Date.now() + 3600 * 1000; // 1 hour
    db.prepare('UPDATE users SET reset_token = ?, reset_token_hash = ?, reset_token_expires = ? WHERE id = ?').run(
      resetOtp,
      resetHash,
      expires,
      user.id
    );

    console.log(`[Auth] Password reset code dispatched to ${user.email}: [${resetOtp}]`);

    let emailResult = { delivered: false };
    try {
      emailResult = await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        token: resetOtp,
      });
    } catch (err) {
      console.error('[Auth] Failed to send password reset email:', err.message);
      emailResult = { delivered: false, error: err.message };
    }

    const resetSessionToken = createSessionToken({
      action: 'password_reset',
      email: user.email,
      userId: user.id,
      resetHash,
      resetExpires: expires,
    }, 3600);

    const emailDelivered = Boolean(emailResult?.delivered);
    sendJson(res, 200, {
      ...genericSuccess,
      emailSent: emailDelivered,
      emailDelivered,
      emailError: emailDelivered ? null : (emailResult?.error || 'Email delivery failed'),
      message: emailDelivered
        ? 'A 6-digit password reset code has been sent to your Gmail inbox.'
        : (process.env.NODE_ENV === 'test'
            ? 'If an account exists with this email, a password reset code has been sent.'
            : `Password reset requested, but email delivery to inbox failed: ${emailResult?.error || 'SMTP delivery error'}.`),
      resetSessionToken,
      email: user.email,
      ...(process.env.NODE_ENV === 'test' || process.env.SAHELI_OTP_TEST_MODE === 'true' ? { resetToken: resetOtp } : {}),
    });
  },

  // 7. Reset Password (Complete with Token)
  resetPassword(req, body, res, sendJson) {
    const token = (body.token || '').trim();
    const newPassword = body.newPassword || '';

    if (!token) {
      sendJson(res, 400, { success: false, error: 'Reset token is required' });
      return;
    }

    const passCheck = validatePasswordStrength(newPassword);
    if (!passCheck.valid) {
      sendJson(res, 400, { success: false, error: passCheck.message });
      return;
    }

    const now = Date.now();
    const tokenHash = hashToken(token);
    let user = db
      .prepare('SELECT id, password_hash, salt FROM users WHERE (reset_token_hash = ? OR reset_token = ?) AND reset_token_expires > ?')
      .get(tokenHash, token, now);

    if (!user) {
      // Check stateless reset token for cross-container serverless support
      const authHeader = req.headers['authorization'];
      const bearerToken = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.slice(7).trim() : (body?.resetSessionToken || null);
      if (bearerToken) {
        const payload = verifySessionToken(bearerToken);
        if (payload && payload.action === 'password_reset') {
          const matchesHash = payload.resetHash && (payload.resetHash === tokenHash);
          const notExpired = payload.resetExpires && (now <= payload.resetExpires);
          if (matchesHash && notExpired) {
            if (payload.userId) user = db.prepare('SELECT id, password_hash, salt FROM users WHERE id = ?').get(payload.userId);
            if (!user && payload.email) user = db.prepare('SELECT id, password_hash, salt FROM users WHERE email = ?').get(payload.email);
            if (!user) {
              const userId = payload.userId || `u-${Date.now()}`;
              const userEmail = payload.email || (body?.email || '').trim().toLowerCase();
              const defaultName = userEmail.split('@')[0].replace(/[._-]+/g, ' ') || 'User';
              const nowIso = new Date().toISOString();
              db.prepare(`
                INSERT INTO users (id, name, email, phone, password_hash, salt, role, is_verified, account_status, terms_accepted, terms_version, created_at, updated_at)
                VALUES (?, ?, ?, '', 'temp-pass', 'temp-salt', 'user', 1, 'active', 1, 'v2.0', ?, ?)
              `).run(userId, defaultName, userEmail, nowIso, nowIso);
              user = { id: userId, email: userEmail, password_hash: '', salt: '' };
            }
          }
        }
      }
    }

    if (!user) {
      sendJson(res, 400, {
        success: false,
        error: 'Invalid or expired password reset token.',
      });
      return;
    }

    // Check that new password is not identical to current password
    if (verifyPassword(newPassword, user.salt, user.password_hash)) {
      sendJson(res, 400, {
        success: false,
        error: 'New password cannot be the same as your current password.',
      });
      return;
    }

    const { salt, hash } = hashPassword(newPassword);
    const updatedTime = new Date().toISOString();

    // Revoke all existing sessions by incrementing token_version and mark email verified
    db.prepare(`
      UPDATE users SET
        password_hash = ?, salt = ?,
        is_verified = 1, email_verified_at = ?,
        reset_token = NULL, reset_token_hash = NULL, reset_token_expires = NULL,
        token_version = token_version + 1,
        updated_at = ?
      WHERE id = ?
    `).run(hash, salt, updatedTime, updatedTime, user.id);

    sendJson(res, 200, {
      success: true,
      message: 'Password reset successful. You may now log in with your new password.',
    });
  },

  // 8. Verify Email Internal (shared by GET redirect and POST API)
  verifyEmailInternal(token) {
    if (!token || typeof token !== 'string') {
      return { success: false, error: 'INVALID_TOKEN' };
    }
    const cleanToken = token.trim();
    const tokenHash = hashToken(cleanToken);
    const now = Date.now();

    let user = db
      .prepare('SELECT id FROM users WHERE (verification_token_hash = ? OR verification_token = ?) AND verification_token_expires > ?')
      .get(tokenHash, cleanToken, now);

    // If cleanToken is a 6-digit numeric OTP, also match against active unverified user OTPs
    if (!user && /^\d{6}$/.test(cleanToken)) {
      const candidates = db
        .prepare('SELECT id, otp_hash, otp_expires FROM users WHERE is_verified = 0 AND otp_hash IS NOT NULL')
        .all();
      for (const candidate of candidates) {
        if (now <= candidate.otp_expires && verifyOtpHash(cleanToken, candidate.otp_hash)) {
          user = candidate;
          break;
        }
      }
    }

    if (!user) {
      return { success: false, error: 'EXPIRED_OR_INVALID' };
    }

    const nowIso = new Date().toISOString();
    db.prepare(`
      UPDATE users SET
        is_verified = 1,
        email_verified_at = ?,
        otp_hash = NULL,
        otp_expires = NULL,
        otp_attempts = 0,
        verification_token = NULL,
        verification_token_hash = NULL,
        verification_token_expires = NULL,
        updated_at = ?
      WHERE id = ?
    `).run(nowIso, nowIso, user.id);

    return { success: true, userId: user.id };
  },

  // 8b. Verify Email (POST API)
  verifyEmail(req, body, res, sendJson) {
    const token = (body.token || '').trim();

    if (!token) {
      sendJson(res, 400, { success: false, error: 'Verification token is required' });
      return;
    }

    const result = this.verifyEmailInternal(token);
    if (!result.success) {
      sendJson(res, 400, {
        success: false,
        error: 'Invalid or expired email verification token.',
      });
      return;
    }

    sendJson(res, 200, {
      success: true,
      message: 'Email verified successfully. Account is fully active.',
    });
  },

  // 9. Resend Verification Token
  async resendVerification(req, body, res, user, sendJson) {
    let targetUser = user;
    const bodyEmail = (body?.email || '').trim().toLowerCase();

    if (!targetUser && bodyEmail) {
      targetUser = db.prepare('SELECT * FROM users WHERE email = ?').get(bodyEmail);
    }

    // Generic safe response to prevent user enumeration
    if (!targetUser) {
      sendJson(res, 200, {
        success: true,
        message: 'If an unverified account exists with this email, a verification link has been sent.',
      });
      return;
    }

    if (targetUser.is_verified) {
      sendJson(res, 400, { success: false, error: 'Email address is already verified.' });
      return;
    }

    // Rate limiting: 3 resends per 15 minutes per user/IP
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'ip';
    const rateLimitKey = `resend-${targetUser.id || clientIp}`;
    const limit = checkRateLimit(rateLimitKey, 3, 15 * 60 * 1000);
    if (!limit.allowed) {
      sendJson(res, 429, {
        success: false,
        error: 'Too many verification email requests. Please wait a few moments before trying again.',
        retryAfterSeconds: limit.resetSeconds,
      });
      return;
    }

    const token = generateRandomToken(32);
    const tokenHash = hashToken(token);
    const expires = Date.now() + 86400 * 1000;

    db.prepare('UPDATE users SET verification_token = ?, verification_token_hash = ?, verification_token_expires = ? WHERE id = ?').run(
      token,
      tokenHash,
      expires,
      targetUser.id
    );

    let emailResult = { delivered: false, error: 'NOT_SENT' };
    try {
      emailResult = await sendVerificationEmail({
        to: targetUser.email,
        name: targetUser.name,
        token,
      });
    } catch (err) {
      emailResult = { delivered: false, error: err.message };
    }

    const emailDelivered = Boolean(emailResult?.delivered);
    sendJson(res, 200, {
      success: true,
      message: emailDelivered
        ? 'A fresh verification token has been dispatched to your email.'
        : `Verification token generated, but email could not be delivered to inbox (${emailResult?.error || 'SMTP failure'}).`,
      emailSent: emailDelivered,
      emailDelivered,
      emailError: emailDelivered ? null : (emailResult?.error || 'Email delivery failed'),
      ...(process.env.NODE_ENV !== 'production' ? { verificationToken: token } : {}),
    });
  },

  // 10. Verify Mobile OTP
  verifyOtp(req, body, res, sendJson) {
    const rawOtp = String(body?.otp || '').trim();
    if (!rawOtp || rawOtp.length !== 6 || !/^\d{6}$/.test(rawOtp)) {
      sendJson(res, 400, { success: false, error: 'A valid 6-digit numeric OTP is required.' });
      return;
    }

    let user = null;
    const bodyEmail = (body?.email || '').trim().toLowerCase();
    const bodyPhone = String(body?.phone || '').trim();
    const userId = body?.userId;

    if (userId) {
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    }
    if (!user && bodyEmail) {
      user = db.prepare('SELECT * FROM users WHERE email = ?').get(bodyEmail);
    }
    if (!user && bodyPhone) {
      if (bodyPhone.includes('@')) {
        user = db.prepare('SELECT * FROM users WHERE email = ?').get(bodyPhone.toLowerCase());
      } else {
        user = db.prepare('SELECT * FROM users WHERE phone = ?').get(bodyPhone);
      }
    }

    // Stateless cross-container recovery: verify against signed registration / session token
    const authHeader = req.headers['authorization'];
    const bearerToken = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.slice(7).trim() : (body?.token || null);
    let payload = null;
    if (bearerToken) {
      payload = verifySessionToken(bearerToken);
    }

    if (!user && payload && (payload.otpHash || payload.email)) {
      const now = Date.now();
      if (payload.otpExpires && now > payload.otpExpires) {
        sendJson(res, 400, { success: false, error: 'Verification code has expired. Please request a new code.' });
        return;
      }

      if (payload.otpHash) {
        const isValid = verifyOtpHash(rawOtp, payload.otpHash);
        if (!isValid) {
          sendJson(res, 400, {
            success: false,
            error: 'Incorrect verification code. Please check your Gmail inbox and try again.',
          });
          return;
        }
      }

      // Cryptographic proof verified! Restore user into this serverless instance's db as verified
      const restoredUserId = payload.userId || (userId || `u-${Date.now()}`);
      const restoredEmail = payload.email || bodyEmail;
      const restoredName = payload.name || 'User';
      const restoredPhone = payload.phone || bodyPhone || '';
      const nowIso = new Date().toISOString();

      db.prepare(`
        INSERT OR REPLACE INTO users (
          id, name, email, phone, password_hash, salt, role,
          is_verified, phone_verified_at, email_verified_at,
          account_status, terms_accepted, terms_version, token_version,
          emergency_pin_hash, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, 'active', 1, 'v2.0', ?, ?, ?, ?)
      `).run(
        restoredUserId,
        restoredName,
        restoredEmail,
        restoredPhone,
        payload.passwordHash || 'stateless-verified',
        payload.salt || 'stateless-salt',
        payload.role || 'user',
        nowIso,
        nowIso,
        payload.tokenVersion || 1,
        payload.emergencyPinHash || null,
        nowIso,
        nowIso
      );

      try {
        db.prepare(`
          INSERT OR IGNORE INTO guardians (id, user_id, name, relationship, phone, priority, status, battery, created_at)
          VALUES (?, ?, 'Primary Contact', 'Family', ?, 'Primary', 'Available', 95, ?)
        `).run(`g-${Date.now()}-1`, restoredUserId, restoredPhone, nowIso);
      } catch {}

      const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(restoredUserId);
      const activeToken = createSessionToken({
        userId: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        role: updatedUser.role,
        tokenVersion: updatedUser.token_version || 1,
        passwordHash: updatedUser.password_hash,
        salt: updatedUser.salt,
        emergencyPinHash: updatedUser.emergency_pin_hash,
        isVerified: true,
      });

      sendJson(res, 200, {
        success: true,
        message: 'Email address verified successfully. Account is fully active.',
        token: activeToken,
        user: sanitizeUser(updatedUser),
      });
      return;
    }

    // Check for candidate matching active OTP in DB
    if (!user) {
      const now = Date.now();
      const candidates = db.prepare('SELECT * FROM users WHERE is_verified = 0 AND otp_hash IS NOT NULL').all();
      for (const cand of candidates) {
        if (now <= (cand.otp_expires || 0) && verifyOtpHash(rawOtp, cand.otp_hash)) {
          user = cand;
          break;
        }
      }
    }

    if (user && !user.otp_hash && payload && payload.otpHash) {
      user.otp_hash = payload.otpHash;
      user.otp_expires = payload.otpExpires;
    }

    if (!user) {
      sendJson(res, 400, { success: false, error: 'User account not found for verification.' });
      return;
    }

    if (user.is_verified) {
      sendJson(res, 400, { success: false, error: 'Account is already verified. You may proceed to log in.' });
      return;
    }

    if (!user.otp_hash) {
      sendJson(res, 400, { success: false, error: 'No active OTP verification code found. Please request a new code.' });
      return;
    }

    const now = Date.now();
    if (now > user.otp_expires) {
      // Invalidate expired OTP
      db.prepare('UPDATE users SET otp_hash = NULL, otp_expires = NULL, otp_attempts = 0 WHERE id = ?').run(user.id);
      sendJson(res, 400, { success: false, error: 'Verification code has expired. Please request a new code.' });
      return;
    }

    if (user.otp_attempts >= 5) {
      // Invalidate locked OTP
      db.prepare('UPDATE users SET otp_hash = NULL, otp_expires = NULL, otp_attempts = 0 WHERE id = ?').run(user.id);
      sendJson(res, 429, {
        success: false,
        error: 'Too many incorrect attempts. This verification code has been locked. Please request a new code.',
      });
      return;
    }

    const isValid = verifyOtpHash(rawOtp, user.otp_hash);
    if (!isValid) {
      db.prepare('UPDATE users SET otp_attempts = otp_attempts + 1 WHERE id = ?').run(user.id);
      const remaining = Math.max(0, 5 - (user.otp_attempts + 1));
      sendJson(res, 400, {
        success: false,
        error: `Incorrect verification code. ${remaining} attempts remaining before code is locked.`,
        remainingAttempts: remaining,
      });
      return;
    }

    // Success: Activate account, set phone_verified_at & email_verified_at, clear OTP (single-use)
    const nowIso = new Date().toISOString();
    db.prepare(`
      UPDATE users SET
        is_verified = 1,
        phone_verified_at = ?,
        email_verified_at = ?,
        otp_hash = NULL,
        otp_expires = NULL,
        otp_attempts = 0,
        updated_at = ?
      WHERE id = ?
    `).run(nowIso, nowIso, nowIso, user.id);

    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    const token = createSessionToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      phone: updatedUser.phone,
      role: updatedUser.role,
      tokenVersion: updatedUser.token_version || 1,
      passwordHash: updatedUser.password_hash,
      salt: updatedUser.salt,
      emergencyPinHash: updatedUser.emergency_pin_hash,
      isVerified: true,
    });

    sendJson(res, 200, {
      success: true,
      message: 'Email address verified successfully. Account is fully active.',
      token,
      user: sanitizeUser(updatedUser),
    });
  },

  // 11. Resend Email OTP
  async resendOtp(req, body, res, sendJson) {
    let user = null;
    const bodyEmail = (body?.email || '').trim().toLowerCase();
    const bodyPhone = String(body?.phone || '').trim();
    const userId = body?.userId;

    if (userId) {
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    }
    if (!user && bodyEmail) {
      user = db.prepare('SELECT * FROM users WHERE email = ?').get(bodyEmail);
    }
    if (!user && bodyPhone) {
      if (bodyPhone.includes('@')) {
        user = db.prepare('SELECT * FROM users WHERE email = ?').get(bodyPhone.toLowerCase());
      } else {
        user = db.prepare('SELECT * FROM users WHERE phone = ?').get(bodyPhone);
      }
    }

    // Stateless cross-container recovery
    if (!user) {
      const authHeader = req.headers['authorization'];
      const bearerToken = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.slice(7).trim() : (body?.token || null);
      if (bearerToken) {
        const payload = verifySessionToken(bearerToken);
        if (payload && (payload.email || payload.userId)) {
          const nowIso = new Date().toISOString();
          const targetUserId = payload.userId || (userId || `u-${Date.now()}`);
          const targetEmail = payload.email || bodyEmail;
          db.prepare(`
            INSERT OR IGNORE INTO users (
              id, name, email, phone, password_hash, salt, role,
              is_verified, account_status, terms_accepted, terms_version, token_version,
              emergency_pin_hash, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'active', 1, 'v2.0', ?, ?, ?, ?)
          `).run(
            targetUserId,
            payload.name || 'User',
            targetEmail,
            payload.phone || bodyPhone || '',
            payload.passwordHash || 'stateless-unverified',
            payload.salt || 'stateless-salt',
            payload.role || 'user',
            payload.tokenVersion || 1,
            payload.emergencyPinHash || null,
            nowIso,
            nowIso
          );
          user = db.prepare('SELECT * FROM users WHERE id = ?').get(targetUserId);
        }
      }
    }

    if (!user) {
      // Prevent user enumeration
      sendJson(res, 200, {
        success: true,
        message: 'If an unverified account exists, a new 6-digit code has been dispatched to your email address.',
      });
      return;
    }

    if (user.is_verified) {
      sendJson(res, 400, { success: false, error: 'Account email is already verified.' });
      return;
    }

    const now = Date.now();
    // 15-second cooldown check (30s in production)
    const cooldownMs = process.env.NODE_ENV === 'production' ? 30 * 1000 : 15 * 1000;
    const timeSinceLastSent = now - (user.otp_last_sent_at || 0);
    if (timeSinceLastSent < cooldownMs) {
      const waitSeconds = Math.ceil((cooldownMs - timeSinceLastSent) / 1000);
      sendJson(res, 429, {
        success: false,
        error: `Please wait ${waitSeconds} seconds before requesting a new code.`,
        retryAfterSeconds: waitSeconds,
      });
      return;
    }

    // Rate limiting: 10 resends per 15 minutes per user/IP
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'ip';
    const rateLimitKey = `resend-otp-${user.id || clientIp}`;
    const maxResends = process.env.NODE_ENV === 'production' ? 5 : 20;
    const limit = checkRateLimit(rateLimitKey, maxResends, 15 * 60 * 1000);
    if (!limit.allowed) {
      sendJson(res, 429, {
        success: false,
        error: 'Too many OTP requests. Please wait a few moments before trying again.',
        retryAfterSeconds: limit.resetSeconds,
      });
      return;
    }

    // Generate fresh 6-digit OTP and invalidate previous code
    const newOtp = generateOtp();
    const newOtpHash = hashOtp(newOtp);
    const newExpires = now + 5 * 60 * 1000;

    db.prepare(`
      UPDATE users SET
        otp_hash = ?,
        otp_expires = ?,
        otp_attempts = 0,
        otp_last_sent_at = ?,
        updated_at = ?
      WHERE id = ?
    `).run(newOtpHash, newExpires, now, new Date().toISOString(), user.id);

    console.log(`[Auth] Resending verification OTP to ${user.email}. Fresh Code: [${newOtp}]`);

    let emailResult = { delivered: false };
    try {
      emailResult = await sendVerificationEmail({
        to: user.email,
        name: user.name,
        token: newOtp,
        otp: newOtp,
        verificationToken: user.verification_token,
      });
      if (!emailResult.delivered && !emailResult.configured) {
        const supResult = await sendSupabaseEmailOtp(user.email);
        if (supResult.configured && supResult.success) {
          emailResult = supResult;
        }
      }
    } catch (err) {
      emailResult = { delivered: false, error: err.message };
    }

    const newToken = createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role || 'user',
      tokenVersion: user.token_version || 1,
      passwordHash: user.password_hash,
      salt: user.salt,
      emergencyPinHash: user.emergency_pin_hash,
      otpHash: newOtpHash,
      otpExpires: newExpires,
      isVerified: false,
    });

    const isTestMode = process.env.NODE_ENV === 'test' || process.env.SAHELI_OTP_TEST_MODE === 'true';
    const emailDelivered = Boolean(emailResult?.delivered);

    sendJson(res, 200, {
      success: true,
      message: emailDelivered
        ? 'A fresh 6-digit verification code has been dispatched to your email address.'
        : (isTestMode ? `Email service notice: ${emailResult?.error || 'could not deliver to inbox'}. Active code: [${newOtp}]` : `Notice: Verification email could not be delivered to inbox (${emailResult?.error || 'SMTP delivery failure'}).`),
      token: newToken,
      emailDelivered,
      emailError: emailResult?.error || null,
      ...(isTestMode ? { devOtp: newOtp } : {}),
    });
  },

  // 12. Supabase Session Synchronization
  async syncSupabaseSession(req, body, res, sendJson) {
    const accessToken = body?.accessToken || '';
    const name = sanitizeString(body?.name || '');
    const phone = sanitizeString(body?.phone || '');
    const emergencyPin = body?.emergencyPin || '1234';

    if (!accessToken) {
      sendJson(res, 400, { success: false, error: 'Supabase access token is required' });
      return;
    }

    const verification = await verifySupabaseToken(accessToken);
    if (!verification.valid || !verification.user) {
      sendJson(res, 401, { success: false, error: verification.error || 'Invalid Supabase session' });
      return;
    }

    const email = (verification.user.email || '').trim().toLowerCase();
    const supabaseId = verification.user.id;
    const now = new Date().toISOString();

    // Prevent email mismatch between frontend body claims and verified token identity
    if (body?.email) {
      const suppliedEmail = String(body.email).trim().toLowerCase();
      if (suppliedEmail && suppliedEmail !== email) {
        sendJson(res, 400, {
          success: false,
          error: 'Email mismatch: token identity does not match supplied email address.',
        });
        return;
      }
    }

    // Check if user already exists in SQLite
    let user = db.prepare('SELECT * FROM users WHERE email = ? OR supabase_id = ? OR id = ?').get(email, supabaseId, supabaseId);

    if (user) {
      // Enforce account status: never allow suspended or disabled users to log in or reactivate
      if (user.account_status === 'disabled' || user.account_status === 'suspended') {
        sendJson(res, 403, {
          success: false,
          error: 'Your account has been suspended or disabled. Please contact safety support.',
        });
        return;
      }

      db.prepare(`
        UPDATE users SET
          supabase_id = COALESCE(supabase_id, ?),
          is_verified = 1,
          email_verified_at = COALESCE(email_verified_at, ?),
          updated_at = ?
        WHERE id = ?
      `).run(supabaseId, now, now, user.id);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    } else {
      const userId = supabaseId || `usr-${Date.now()}-${generateRandomToken(4)}`;
      const passHash = hashPassword(generateRandomToken(24));
      const pinHash = hashPin(emergencyPin);

      db.prepare(`
        INSERT INTO users (
          id, name, email, phone, password_hash, salt, role,
          is_verified, account_status, terms_accepted, terms_version, terms_accepted_at,
          token_version, emergency_pin_hash, email_verified_at, supabase_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'user', 1, 'active', 1, 'v2.0', ?, 1, ?, ?, ?, ?, ?)
      `).run(
        userId,
        name || email.split('@')[0],
        email,
        phone || '',
        passHash.hash,
        passHash.salt,
        now,
        pinHash,
        now,
        supabaseId,
        now,
        now
      );

      // Seed initial default guardian
      const guardianStmt = db.prepare(`
        INSERT INTO guardians (id, user_id, name, relationship, phone, priority, status, battery, created_at)
        VALUES (?, ?, ?, ?, ?, 'Primary', 'Available', 95, ?)
      `);
      guardianStmt.run(`g-${Date.now()}-1`, userId, 'Primary Contact', 'Family', phone || '112', now);

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    }

    const sessionToken = createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.token_version || 1,
    });

    sendJson(res, 200, {
      success: true,
      message: 'Supabase session verified and linked.',
      token: sessionToken,
      user: sanitizeUser(user),
    });
  },

  // 10. Delete Account
  deleteAccount(req, body, res, user, sendJson) {
    if (!user) {
      sendJson(res, 401, { success: false, error: 'Unauthorized' });
      return;
    }

    const password = body.password || '';
    const fullUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    const isValid = verifyPassword(password, fullUser.salt, fullUser.password_hash);

    if (!isValid) {
      sendJson(res, 400, {
        success: false,
        error: 'Password confirmation failed. Account deletion aborted.',
      });
      return;
    }

    // SQLite foreign key cascade will remove user's guardians and sessions
    db.prepare('DELETE FROM users WHERE id = ?').run(user.id);

    sendJson(res, 200, {
      success: true,
      message: 'Account and associated records have been permanently deleted.',
    });
  },

  // 11. Export Account Data (GDPR / DPDP Compliance)
  exportData(req, res, user, sendJson) {
    if (!user) {
      sendJson(res, 401, { success: false, error: 'Unauthorized' });
      return;
    }

    const userData = db.prepare(`
      SELECT id, name, email, phone, role, is_verified, blood_group, medical_notes, checkin_interval_minutes, created_at, updated_at
      FROM users WHERE id = ?
    `).get(user.id);

    const guardians = db.prepare(`
      SELECT id, name, relationship, phone, priority, status, battery, created_at
      FROM guardians WHERE user_id = ?
    `).all(user.id);

    const incidents = db.prepare(`
      SELECT id, safety_state, event_title, event_description, latitude, longitude, created_at
      FROM incident_logs WHERE user_id = ?
    `).all(user.id);

    const safewalks = db.prepare(`
      SELECT id, from_location, to_location, expected_arrival, status, progress_percentage, created_at
      FROM safewalk_sessions WHERE user_id = ?
    `).all(user.id);

    sendJson(res, 200, {
      success: true,
      message: 'Account data export retrieved successfully.',
      exportTimestamp: new Date().toISOString(),
      data: {
        profile: userData,
        guardians: guardians || [],
        incidents: incidents || [],
        safewalks: safewalks || [],
        privacySummary: {
          encryptionStandard: 'scrypt salted key derivation',
          storageType: 'Local SQLite WAL with zero third-party sharing',
          locationTrackingPolicy: 'Dispatched only during explicit emergency or SafeWalk heartbeat',
          dataRetention: 'Retained until explicitly deleted by user request',
        },
      },
    });
  },

  // 12. Logout (Session Invalidation)
  logout(req, res, user, sendJson) {
    if (user && user.id) {
      db.prepare('UPDATE users SET token_version = token_version + 1 WHERE id = ?').run(user.id);
    }
    sendJson(res, 200, {
      success: true,
      message: 'Logged out successfully. Session invalidated.',
    });
  },

  // 13. Logout All Devices (Revoke All Sessions)
  logoutAll(req, res, user, sendJson) {
    if (!user) {
      sendJson(res, 401, { success: false, error: 'Unauthorized' });
      return;
    }
    db.prepare('UPDATE users SET token_version = token_version + 1 WHERE id = ?').run(user.id);
    sendJson(res, 200, {
      success: true,
      message: 'Logged out from all devices. All active sessions invalidated.',
    });
  },
};
