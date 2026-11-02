import { useState, useEffect, useMemo, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import {
  User, Mail, Phone, Lock, KeyRound, CheckCircle2, AlertCircle,
  Eye, EyeOff, ArrowLeft, LogIn, UserPlus, RefreshCw,
  Clock, ShieldCheck, Ban
} from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';
import { EmergencyCallButton } from '../safety/EmergencyCallButton';

/* ────────────────────────────────────────────────────────────
 *  Google Sign-In Button (UI-only with Coming-Soon Toast/Notice)
 * ────────────────────────────────────────────────────────────*/
function GoogleAuthButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        width: '100%',
        padding: '9px 16px',
        borderRadius: 'var(--radius-md, 8px)',
        border: '1px solid var(--color-border-subtle)',
        backgroundColor: 'var(--color-bg-surface-subtle)',
        color: 'var(--color-text-primary)',
        fontSize: '0.8125rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span>Continue with Google</span>
    </button>
  );
}

/* ────────────────────────────────────────────────────────────
 *  Password Strength Evaluator
 * ────────────────────────────────────────────────────────────*/
function evaluatePasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Weak', color: 'var(--color-danger, #EF4444)' };
  if (score <= 2) return { score: 2, label: 'Fair', color: '#F59E0B' };
  if (score <= 3) return { score: 3, label: 'Medium', color: '#F59E0B' };
  if (score === 4) return { score: 4, label: 'Strong', color: 'var(--color-success, #10B981)' };
  return { score: 5, label: 'Very Strong', color: 'var(--color-success, #10B981)' };
}

/* ────────────────────────────────────────────────────────────
 *  Password Strength Meter
 * ────────────────────────────────────────────────────────────*/
function PasswordStrengthMeter({ password }) {
  const strength = evaluatePasswordStrength(password);
  if (!password) return null;

  return (
    <div style={{ marginTop: '6px' }}>
      <div style={{
        display: 'flex', gap: '4px', marginBottom: '4px',
      }}>
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            style={{
              flex: 1, height: '3px', borderRadius: '2px',
              backgroundColor: strength.score >= level ? strength.color : 'var(--color-border-subtle)',
              transition: 'background-color 0.2s ease',
            }}
          />
        ))}
      </div>
      <span style={{
        fontSize: '0.6875rem', fontWeight: 600, color: strength.color,
        transition: 'color 0.2s ease',
      }}>
        {strength.label}
      </span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 *  Password Input with Show/Hide Toggle
 * ────────────────────────────────────────────────────────────*/
function PasswordInput({ id, placeholder, value, onChange, required = true, autoComplete }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="input-with-icon" style={{ position: 'relative' }}>
      <Lock size={16} className="input-icon" />
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        className="saheli-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        style={{ paddingRight: '40px' }}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        style={{
          position: 'absolute', right: '10px', top: '50%',
          transform: 'translateY(-50%)', background: 'none',
          border: 'none', cursor: 'pointer', padding: '4px',
          color: 'var(--color-text-muted)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 *  View Title Map
 * ────────────────────────────────────────────────────────────*/
const VIEW_TITLES = {
  login: 'Sign In to SAHELI',
  register: 'Create Your SAHELI Account',
  forgot: 'Reset Your Password',
  reset: 'Enter New Password',
  verify: 'Verify Mobile Number',
  'verify-success': 'Mobile Number Verified!',
  'pending-verification': 'Mobile Verification Required',
  'session-expired': 'Session Expired',
  'account-disabled': 'Account Suspended',
};

/* ════════════════════════════════════════════════════════════
 *  AuthModal Component — 9 Authentication Views
 * ════════════════════════════════════════════════════════════*/
export function AuthModal({ isOpen, onClose, initialView = 'login', onOpenLegal, initialToken = '', initialError = null }) {
  const {
    login: doLogin, register: doRegister, forgotPassword, resetPassword,
    verifyOtp: doVerifyOtp, resendOtp: doResendOtp,
    showToast,
  } = useSafety();

  const [view, setView] = useState(initialView);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emergencyPin, setEmergencyPin] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  // Email OTP Verification State
  const [otpInput, setOtpInput] = useState('');
  const [otpTargetPhone, setOtpTargetPhone] = useState('');
  const [otpTargetEmail, setOtpTargetEmail] = useState('');
  const [otpUserId, setOtpUserId] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [codeNotice, setCodeNotice] = useState(null);

  // 60-Second Cooldown Timer for OTP Resends
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((sec) => Math.max(0, sec - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Sync view when modal reopens with a different initialView
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      if (initialToken) setTokenInput(initialToken);
      setError(initialError || null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialView, initialToken, initialError]);

  const resetForm = useCallback(() => {
    setName(''); setEmail(''); setPhone('');
    setPassword(''); setConfirmPassword('');
    setTokenInput(''); setTermsAccepted(false);
    setEmergencyPin(''); setMarketingConsent(false);
    setOtpInput(''); setOtpTargetPhone(''); setOtpTargetEmail('');
    setOtpUserId(null); setCodeNotice(null);
    setError(null); setSuccessMsg(null); setLoading(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleGoogleClick = () => {
    showToast('Google Sign-In is coming soon in the next update. Please use email and password.', 'info');
  };

  const switchView = useCallback((newView) => {
    setError(null);
    setSuccessMsg(null);
    setView(newView);
  }, []);

  // ── Handlers ──────────────────────────────────────────────

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await doLogin(email, password);
      if (result.success) {
        showToast(`Welcome back, ${result.user?.name || 'User'}!`, 'success');
        handleClose();
      } else {
        // Detect account-disabled or pending-verification states
        if (result.accountDisabled) {
          switchView('account-disabled');
        } else if (result.pendingVerification || result.unverified) {
          setOtpTargetEmail(email);
          if (result.userId) setOtpUserId(result.userId);
          if (result.user?.id) setOtpUserId(result.user.id);
          setResendCooldown(60);
          showToast('Verification code sent! Please check your Gmail inbox.', 'info');
          switchView('verify');
        } else {
          setError(result.error || 'Invalid credentials');
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (!termsAccepted) {
      setError('You must read and agree to the Terms of Service and Privacy Policy to create an account.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters with numbers and uppercase letters.');
      return;
    }

    setLoading(true);
    try {
      const result = await doRegister({
        name, email, phone, password, emergencyPin: emergencyPin || '1234',
        terms_accepted: true, terms_version: 'v2.0',
      });
      if (result.success) {
        showToast('Account created! Please verify your email with the 6-digit OTP.', 'success');
        setOtpTargetPhone(phone);
        setOtpTargetEmail(email);
        if (result.user?.id) setOtpUserId(result.user.id);
        if (result.devOtp) setCodeNotice(result.devOtp);
        setResendCooldown(60);
        setOtpInput('');
        switchView('verify');
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    const cleanedOtp = otpInput.replace(/\D/g, '');
    if (cleanedOtp.length !== 6) {
      setError('Please enter a valid 6-digit numeric OTP.');
      return;
    }

    setLoading(true);
    try {
      const result = await doVerifyOtp({
        userId: otpUserId,
        phone: otpTargetPhone || phone,
        email: otpTargetEmail || email,
        otp: cleanedOtp,
        name,
        emergencyPin,
      });
      if (result.success) {
        showToast('Email verified! Your SAHELI account is active.', 'success');
        switchView('verify-success');
      } else {
        const attemptsNotice = result.remainingAttempts !== undefined
          ? ` (${result.remainingAttempts} attempts remaining)`
          : '';
        setError((result.error || 'Verification failed') + attemptsNotice);
      }
    } catch (err) {
      setError(err.message || 'Verification request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setLoading(true);
    try {
      const result = await doResendOtp({
        userId: otpUserId,
        phone: otpTargetPhone || phone,
        email: otpTargetEmail || email,
      });
      if (result.success) {
        setResendCooldown(result.retryAfterSeconds || 60);
        setSuccessMsg(result.message || 'A fresh verification code was sent to your email.');
        if (result.devOtp) setCodeNotice(result.devOtp);
      } else {
        if (result.retryAfterSeconds) {
          setResendCooldown(result.retryAfterSeconds);
        }
        setError(result.error || 'Could not resend OTP. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to resend verification OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await forgotPassword(email);
      setSuccessMsg(result.message || 'A 6-digit password reset code has been sent to your Gmail inbox.');
      showToast('Reset code sent! Please check your Gmail inbox.', 'success');
      if (result.resetToken) {
        setTokenInput(result.resetToken);
      }
      switchView('reset');
    } catch (err) {
      setError(err.message || 'Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const result = await resetPassword(tokenInput, password);
      if (result.success) {
        showToast('Password reset successfully. Please log in.', 'success');
        resetForm();
        switchView('login');
      } else {
        setError(result.error || 'Password reset failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // ── Shared Sub-Components ─────────────────────────────────

  const tabSwitcher = useMemo(() => {
    if (view !== 'login' && view !== 'register') return null;
    const tabs = [
      { key: 'login', label: 'Sign In', icon: <LogIn size={14} /> },
      { key: 'register', label: 'Create Account', icon: <UserPlus size={14} /> },
    ];
    return (
      <div style={{
        display: 'flex', backgroundColor: 'var(--color-bg-surface-subtle)',
        borderRadius: 'var(--radius-full, 9999px)', padding: '4px',
        border: '1px solid var(--color-border-subtle)',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            style={{
              flex: 1, padding: '8px 12px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '6px',
              border: view === tab.key ? '1px solid var(--color-brand-border)' : '1px solid transparent',
              borderRadius: 'var(--radius-full, 9999px)',
              background: view === tab.key ? 'var(--color-brand-subtle)' : 'transparent',
              fontWeight: view === tab.key ? 700 : 500,
              color: view === tab.key ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
              cursor: 'pointer', fontSize: '0.8125rem',
              transition: 'all 0.15s ease',
            }}
            onClick={() => switchView(tab.key)}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>
    );
  }, [view, switchView]);

  const alertBanner = (type, message) => {
    const isError = type === 'error';
    return (
      <div style={{
        padding: '0.75rem',
        backgroundColor: isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
        border: `1px solid ${isError ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
        borderRadius: '8px', fontSize: '0.8rem',
        color: isError ? 'var(--color-danger, #EF4444)' : 'var(--color-success, #10B981)',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        {isError
          ? <AlertCircle size={16} style={{ flexShrink: 0 }} />
          : <CheckCircle2 size={16} style={{ flexShrink: 0 }} />}
        <span>{message}</span>
      </div>
    );
  };

  const backToLogin = (
    <button
      type="button"
      onClick={() => switchView('login')}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--color-text-muted)', fontSize: '0.8125rem',
        display: 'flex', alignItems: 'center', gap: '4px',
        padding: '4px 0', fontWeight: 500,
      }}
    >
      <ArrowLeft size={14} /> Back to Sign In
    </button>
  );

  // ── Render ────────────────────────────────────────────────

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={VIEW_TITLES[view] || 'Authentication'}
      size="sm"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Instant Emergency 112 Helpline Banner */}
        <EmergencyCallButton variant="banner" />

        {/* Tab Switcher */}
        {tabSwitcher}

        {/* Alerts */}
        {error && alertBanner('error', error)}
        {successMsg && alertBanner('success', successMsg)}

        {/* ═══════ 1. LOGIN FORM ═══════ */}
        {view === 'login' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <GoogleAuthButton onClick={handleGoogleClick} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '2px 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border-subtle)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>or sign in with email</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border-subtle)' }} />
            </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div className="form-group">
                <label className="label-text" htmlFor="login-email">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon" />
                  <input
                    id="login-email" type="email" className="saheli-input"
                    placeholder="name@example.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="label-text" htmlFor="login-password">Password</label>
                  <button
                    type="button"
                    style={{
                      background: 'none', border: 'none', fontSize: '0.6875rem',
                      color: 'var(--color-brand-primary)', cursor: 'pointer', fontWeight: 600,
                    }}
                    onClick={() => switchView('forgot')}
                  >
                    Forgot password?
                  </button>
                </div>
                <PasswordInput
                  id="login-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" variant="primary" size="md" fullWidth disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
            </form>
          </div>
        )}

        {/* ═══════ 2. REGISTER FORM ═══════ */}
        {view === 'register' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <GoogleAuthButton onClick={handleGoogleClick} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '2px 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border-subtle)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>or register with email</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border-subtle)' }} />
            </div>

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="label-text" htmlFor="reg-name">Full Name *</label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input
                    id="reg-name" type="text" className="saheli-input"
                    placeholder="Enter your full name" value={name}
                    onChange={(e) => setName(e.target.value)} required
                    autoComplete="name"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="form-group">
                  <label className="label-text" htmlFor="reg-email">Email Address *</label>
                  <div className="input-with-icon">
                    <Mail size={16} className="input-icon" />
                    <input
                      id="reg-email" type="email" className="saheli-input"
                      placeholder="Enter your email address" value={email}
                      onChange={(e) => setEmail(e.target.value)} required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="label-text" htmlFor="reg-phone">Mobile Number *</label>
                  <div className="input-with-icon">
                    <Phone size={16} className="input-icon" />
                    <input
                      id="reg-phone" type="tel" className="saheli-input"
                      placeholder="Enter your mobile number" value={phone}
                      onChange={(e) => setPhone(e.target.value)} required
                      autoComplete="tel"
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="form-group">
                  <label className="label-text" htmlFor="reg-pass">Password *</label>
                  <PasswordInput
                    id="reg-pass"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <PasswordStrengthMeter password={password} />
                </div>

                <div className="form-group">
                  <label className="label-text" htmlFor="reg-confirm">Confirm Password *</label>
                  <PasswordInput
                    id="reg-confirm"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-danger, #EF4444)', marginTop: '4px', display: 'block' }}>
                      Passwords do not match
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="label-text" htmlFor="reg-pin">Safety Emergency PIN (4–6 digits)</label>
                <div className="input-with-icon">
                  <KeyRound size={16} className="input-icon" />
                  <input
                    id="reg-pin" type="password" maxLength={6} className="saheli-input"
                    placeholder="e.g. 1234" value={emergencyPin}
                    onChange={(e) => setEmergencyPin(e.target.value.replace(/\D/g, ''))}
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Terms and Privacy Agreement Checkbox */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                padding: '0.625rem 0.75rem',
                backgroundColor: 'var(--color-bg-surface-subtle)',
                borderRadius: '8px', border: '1px solid var(--color-border-subtle)',
                marginTop: '4px',
              }}>
                <input
                  id="reg-terms-consent" type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  style={{
                    marginTop: '2px', accentColor: 'var(--color-brand-primary)',
                    cursor: 'pointer', width: '16px', height: '16px', flexShrink: 0,
                  }}
                  required
                />
                <label
                  htmlFor="reg-terms-consent"
                  style={{
                    fontSize: '0.75rem', lineHeight: '1.4',
                    color: 'var(--color-text-secondary)', cursor: 'pointer',
                  }}
                >
                  I have read and agree to the{' '}
                  <button type="button" onClick={() => onOpenLegal && onOpenLegal('terms')}
                    style={{
                      background: 'none', border: 'none', padding: 0,
                      color: 'var(--color-brand-primary)', textDecoration: 'underline',
                      cursor: 'pointer', fontSize: 'inherit', fontFamily: 'inherit',
                    }}>
                    Terms of Service
                  </button>,{' '}
                  <button type="button" onClick={() => onOpenLegal && onOpenLegal('privacy')}
                    style={{
                      background: 'none', border: 'none', padding: 0,
                      color: 'var(--color-brand-primary)', textDecoration: 'underline',
                      cursor: 'pointer', fontSize: 'inherit', fontFamily: 'inherit',
                    }}>
                    Privacy Policy
                  </button>, and emergency dispatch location tracking terms.
                </label>
              </div>

              {/* Optional Marketing Consent Checkbox */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                padding: '0.5rem 0.75rem',
                backgroundColor: 'transparent',
                borderRadius: '8px',
                marginTop: '2px',
              }}>
                <input
                  id="reg-marketing-consent" type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  style={{
                    marginTop: '2px', accentColor: 'var(--color-brand-primary)',
                    cursor: 'pointer', width: '16px', height: '16px', flexShrink: 0,
                  }}
                />
                <label
                  htmlFor="reg-marketing-consent"
                  style={{
                    fontSize: '0.75rem', lineHeight: '1.4',
                    color: 'var(--color-text-secondary)', cursor: 'pointer',
                  }}
                >
                  Keep me updated on safety alerts, platform features, and community announcements (optional).
                </label>
              </div>

              <Button type="submit" variant="primary" size="md" fullWidth disabled={loading}>
                {loading ? 'Creating Account...' : 'Register Secure Account'}
              </Button>
            </form>
          </div>
        )}

        {/* ═══════ 3. FORGOT PASSWORD ═══════ */}
        {view === 'forgot' && (
          <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {backToLogin}
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              Enter your registered email address and we will generate a secure, time-limited password reset token.
            </p>

            <div className="form-group">
              <label className="label-text" htmlFor="forgot-email">Email Address</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  id="forgot-email" type="email" className="saheli-input"
                  placeholder="name@example.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} required
                  autoComplete="email"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Button type="button" variant="ghost" size="md" fullWidth onClick={() => switchView('login')}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" fullWidth disabled={loading}>
                {loading ? 'Processing...' : 'Send Reset Link'}
              </Button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => switchView('reset')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-brand-primary)', fontSize: '0.75rem',
                  fontWeight: 600, textDecoration: 'underline',
                }}
              >
                Already have a reset token? Enter code here
              </button>
            </div>
          </form>
        )}

        {/* ═══════ 4. RESET PASSWORD WITH TOKEN ═══════ */}
        {view === 'reset' && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {backToLogin}

            <div className="form-group">
              <label className="label-text" htmlFor="reset-token">Password Reset Code / Token</label>
              <div className="input-with-icon">
                <KeyRound size={16} className="input-icon" />
                <input
                  id="reset-token" type="text" className="saheli-input"
                  placeholder="Enter 6-digit code or reset token from email"
                  value={tokenInput} onChange={(e) => setTokenInput(e.target.value)}
                  required autoComplete="off"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label-text" htmlFor="reset-new-pass">New Password *</label>
              <PasswordInput
                id="reset-new-pass" value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars, 1 number"
                autoComplete="new-password"
              />
              <PasswordStrengthMeter password={password} />
            </div>

            <div className="form-group">
              <label className="label-text" htmlFor="reset-confirm-pass">Confirm New Password *</label>
              <PasswordInput
                id="reset-confirm-pass" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
              />
            </div>

            <Button type="submit" variant="primary" size="md" fullWidth disabled={loading}>
              {loading ? 'Updating Password...' : 'Update Password'}
            </Button>
          </form>
        )}

        {/* ═══════ 5. VERIFY EMAIL ADDRESS VIA SUPABASE EMAIL OTP ═══════ */}
        {view === 'verify' && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', margin: '0 0 4px 0' }}>
                We dispatched a 6-digit verification code to
              </p>
              <strong style={{ fontSize: '0.9375rem', color: 'var(--color-brand-primary)', fontFamily: 'monospace' }}>
                {otpTargetEmail || email || 'your registered email address'}
              </strong>
            </div>

            {codeNotice && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: 'rgba(55, 88, 249, 0.08)',
                border: '1px solid rgba(55, 88, 249, 0.25)',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} style={{ color: 'var(--color-brand-primary)', flexShrink: 0 }} />
                  <span>
                    Active OTP: <strong style={{ letterSpacing: '0.15em', fontFamily: 'monospace', color: 'var(--color-text-primary)' }}>{codeNotice}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpInput(codeNotice)}
                  style={{
                    padding: '3px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: 'var(--color-brand-primary)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Auto Fill
                </button>
              </div>
            )}

            <div className="form-group" style={{ textAlign: 'center' }}>
              <label className="label-text" htmlFor="verify-otp-input" style={{ display: 'block', marginBottom: '8px' }}>
                Enter 6-Digit Email OTP
              </label>
              <div className="input-with-icon" style={{ maxWidth: '240px', margin: '0 auto' }}>
                <KeyRound size={16} className="input-icon" />
                <input
                  id="verify-otp-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  className="saheli-input"
                  placeholder="••••••"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  required
                  autoComplete="one-time-code"
                  style={{
                    letterSpacing: '0.45em',
                    textAlign: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                />
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                Expires in 5 minutes. Single-use only.
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                type="button"
                variant="ghost"
                size="md"
                fullWidth
                onClick={handleResendOtp}
                disabled={loading || resendCooldown > 0}
              >
                <RefreshCw size={14} style={{ marginRight: '4px' }} className={loading ? 'animate-spin' : ''} />
                {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend OTP'}
              </Button>
              <Button type="submit" variant="primary" size="md" fullWidth disabled={loading || otpInput.length !== 6}>
                {loading ? 'Verifying...' : 'Verify & Activate'}
              </Button>
            </div>

            <button
              type="button"
              onClick={() => switchView('login')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-muted)', fontSize: '0.8125rem',
                textAlign: 'center', padding: '4px', fontWeight: 500,
              }}
            >
              ← Back to Sign In
            </button>
          </form>
        )}

        {/* ═══════ 6. VERIFY SUCCESS ═══════ */}
        {view === 'verify-success' && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '1rem', padding: '1.5rem 0', textAlign: 'center',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'var(--color-brand-subtle)',
              border: '2px solid var(--color-brand-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShieldCheck size={32} style={{ color: 'var(--color-brand-primary)' }} />
            </div>
            <div>
              <h3 style={{
                margin: '0 0 8px 0', fontSize: '1.125rem', fontWeight: 700,
                color: 'var(--color-text-primary)',
              }}>
                Email Address Verified!
              </h3>
              <p style={{
                margin: 0, fontSize: '0.875rem',
                color: 'var(--color-text-secondary)', lineHeight: '1.5',
              }}>
                Your SAHELI safety account is active. You can now use SafeWalk, add trusted guardians, and trigger emergency response.
              </p>
            </div>
            <Button variant="primary" size="md" fullWidth onClick={handleClose}>
              Continue to Dashboard
            </Button>
          </div>
        )}

        {/* ═══════ 7. PENDING VERIFICATION ═══════ */}
        {view === 'pending-verification' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              padding: '1rem', borderRadius: '10px',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex', alignItems: 'flex-start', gap: '12px',
            }}>
              <Clock size={20} style={{ color: '#F59E0B', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{
                  margin: '0 0 4px 0', fontSize: '0.875rem', fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}>
                  Email verification required
                </p>
                <p style={{
                  margin: 0, fontSize: '0.8125rem',
                  color: 'var(--color-text-secondary)', lineHeight: '1.5',
                }}>
                  Please verify your email address to access SAHELI safety features. Enter the 6-digit OTP code sent to your email.
                </p>
              </div>
            </div>

            <div className="form-group">
              <label className="label-text" htmlFor="pending-phone">Registered Phone or Email</label>
              <div className="input-with-icon">
                <Phone size={16} className="input-icon" />
                <input
                  id="pending-phone"
                  type="text"
                  className="saheli-input"
                  placeholder="e.g. +91 98765 43210 or email"
                  value={otpTargetEmail || otpTargetPhone || phone || email}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.includes('@')) {
                      setOtpTargetEmail(val);
                      setEmail(val);
                    } else {
                      setOtpTargetPhone(val);
                    }
                  }}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="ghost"
                size="md"
                fullWidth
                onClick={handleResendOtp}
                disabled={loading || resendCooldown > 0}
              >
                <RefreshCw size={14} style={{ marginRight: '4px' }} className={loading ? 'animate-spin' : ''} />
                {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Send Fresh OTP'}
              </Button>
              <Button variant="primary" size="md" fullWidth onClick={() => switchView('verify')}>
                Enter OTP Code
              </Button>
            </div>

            <button
              type="button" onClick={() => switchView('login')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-muted)', fontSize: '0.8125rem',
                textAlign: 'center', padding: '4px', fontWeight: 500,
              }}
            >
              ← Back to Sign In
            </button>
          </div>
        )}

        {/* ═══════ 8. SESSION EXPIRED ═══════ */}
        {view === 'session-expired' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              padding: '1rem', borderRadius: '10px',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex', alignItems: 'flex-start', gap: '12px',
            }}>
              <Clock size={20} style={{ color: 'var(--color-brand-primary)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{
                  margin: '0 0 4px 0', fontSize: '0.875rem', fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}>
                  Your session has expired
                </p>
                <p style={{
                  margin: 0, fontSize: '0.8125rem',
                  color: 'var(--color-text-secondary)', lineHeight: '1.5',
                }}>
                  For your security, your session token has been invalidated. Please sign in again to continue using SAHELI.
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div className="form-group">
                <label className="label-text" htmlFor="expired-email">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon" />
                  <input
                    id="expired-email" type="email" className="saheli-input"
                    placeholder="name@example.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} required
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="label-text" htmlFor="expired-password">Password</label>
                <PasswordInput
                  id="expired-password" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" variant="primary" size="md" fullWidth disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In Again'}
              </Button>
            </form>
          </div>
        )}

        {/* ═══════ 9. ACCOUNT DISABLED / SUSPENDED ═══════ */}
        {view === 'account-disabled' && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '1rem', padding: '1.5rem 0', textAlign: 'center',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '2px solid rgba(239, 68, 68, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Ban size={32} style={{ color: 'var(--color-danger, #EF4444)' }} />
            </div>
            <div>
              <h3 style={{
                margin: '0 0 8px 0', fontSize: '1.125rem', fontWeight: 700,
                color: 'var(--color-text-primary)',
              }}>
                Account Suspended
              </h3>
              <p style={{
                margin: 0, fontSize: '0.875rem',
                color: 'var(--color-text-secondary)', lineHeight: '1.5',
              }}>
                Your SAHELI account has been suspended or disabled. If you believe this is an error, please contact our safety support team for assistance.
              </p>
            </div>
            <Button
              variant="primary" size="md" fullWidth
              onClick={() => window.open('mailto:support@saheli.org?subject=Account%20Suspension%20Review', '_blank')}
            >
              Contact Safety Support
            </Button>
            <button
              type="button" onClick={() => switchView('login')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-muted)', fontSize: '0.8125rem',
                padding: '4px', fontWeight: 500,
              }}
            >
              ← Try Another Account
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
