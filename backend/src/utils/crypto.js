import crypto from 'node:crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'saheli-production-safety-secret-key-2026';

/**
 * Hash password with scrypt and a unique salt.
 * Returns { salt, hash }.
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return {
    salt,
    hash: derivedKey.toString('hex'),
  };
}

/**
 * Verify password against stored salt and hash using constant-time comparison.
 */
export function verifyPassword(password, salt, storedHash) {
  if (!password || !salt || !storedHash) return false;
  try {
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(derivedKey.toString('hex'), 'hex');
    const storedBuffer = Buffer.from(storedHash, 'hex');
    if (keyBuffer.length !== storedBuffer.length) return false;
    return crypto.timingSafeEqual(keyBuffer, storedBuffer);
  } catch {
    return false;
  }
}

/**
 * Hash emergency PIN
 */
export function hashPin(pin) {
  return crypto.createHash('sha256').update(pin).digest('hex');
}

/**
 * Verify emergency PIN
 */
export function verifyPin(pin, storedPinHash) {
  if (!pin || !storedPinHash) return false;
  const hash = crypto.createHash('sha256').update(pin).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedPinHash, 'hex'));
}

/**
 * Generate cryptographically secure random token (e.g. for reset/verification).
 */
export function generateRandomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generate a cryptographically secure random 6-digit numeric OTP.
 */
export function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Compute SHA-256 hash of an OTP for secure storage.
 */
export function hashOtp(otp) {
  if (!otp || typeof otp !== 'string') return null;
  return crypto.createHash('sha256').update(otp.trim()).digest('hex');
}

/**
 * Constant-time verification of OTP against stored hash.
 */
export function verifyOtpHash(otp, storedHash) {
  if (!otp || !storedHash) return false;
  try {
    const computedHash = crypto.createHash('sha256').update(otp.trim()).digest('hex');
    const computedBuf = Buffer.from(computedHash, 'hex');
    const storedBuf = Buffer.from(storedHash, 'hex');
    if (computedBuf.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(computedBuf, storedBuf);
  } catch {
    return false;
  }
}

/**
 * Compute SHA-256 hash of a token for secure storage.
 */
export function hashToken(token) {
  if (!token) return null;
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Create a signed session token.
 * Payload: { userId, email, role, tokenVersion, exp }
 */
export function createSessionToken(payload, expiresInSeconds = 86400 * 7) {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const tokenVersion = payload.tokenVersion ?? 1;
  const data = JSON.stringify({ ...payload, tokenVersion, exp });
  const b64Payload = Buffer.from(data).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(b64Payload)
    .digest('base64url');
  return `${b64Payload}.${signature}`;
}

/**
 * Verify and decode a session token.
 * Returns payload if valid and not expired, or null.
 */
export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [b64Payload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(b64Payload)
    .digest('base64url');

  try {
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSig);
    if (sigBuffer.length !== expectedBuffer.length) return null;
    if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return null;

    const payloadStr = Buffer.from(b64Payload, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadStr);

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password) {
  if (typeof password !== 'string') return { valid: false, message: 'Password must be a string' };
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters long' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must include at least one uppercase letter' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must include at least one lowercase letter' };
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must include at least one number' };
  return { valid: true };
}

/**
 * Validate email address format
 */
export function validateEmail(email) {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
}

/**
 * Sanitize text input to prevent XSS / malicious injection
 */
export function sanitizeString(input, maxLength = 255) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '');
}
