/**
 * SAHELI Backend — Request Validators
 */
import { validatePasswordStrength, validateEmail, sanitizeString } from '../utils/crypto.js';

export function validateRegistrationInput(body) {
  const name = sanitizeString(body.name || '');
  const email = (body.email || '').trim().toLowerCase();
  const phone = sanitizeString(body.phone || '');
  const password = body.password || '';

  if (!name || name.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters long' };
  }
  if (!validateEmail(email)) {
    return { valid: false, error: 'Invalid email address format' };
  }
  if (!phone || phone.replace(/\D/g, '').length < 7) {
    return { valid: false, error: 'Valid phone number is required' };
  }
  const passCheck = validatePasswordStrength(password);
  if (!passCheck.valid) {
    return { valid: false, error: passCheck.message };
  }
  return { valid: true };
}

export function validateLoginInput(body) {
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';
  if (!email || !password) {
    return { valid: false, error: 'Email and password are required' };
  }
  return { valid: true };
}
