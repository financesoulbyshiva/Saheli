import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import {
  User,
  Phone,
  Lock,
  Compass,
  Clock,
  CheckCircle2,
  LogOut,
  Trash2,
  KeyRound,
  Download,
  ShieldCheck,
  SunMoon,
} from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';

/**
 * ProfileSettingsModal Component
 * Complete profile management, emergency PIN, password change,
 * GPS permission diagnostics, GDPR data export, and permanent account deletion.
 */
export function ProfileSettingsModal({ isOpen, onClose, onOpenAuth, onOpenLegal }) {
  const {
    user,
    token,
    userProfile,
    updateProfile,
    locationStatus,
    requestLocationAccess,
    changePassword,
    deleteAccount,
    logout,
    showToast,
  } = useSafety();

  const [name, setName] = useState(userProfile?.name || user?.name || '');
  const [phone, setPhone] = useState(userProfile?.phone || user?.phone || '');
  const [emergencyPin, setEmergencyPin] = useState(userProfile?.emergencyPin || '1234');
  const [bloodGroup, setBloodGroup] = useState(userProfile?.bloodGroup || user?.blood_group || 'O+');
  const [medicalNotes, setMedicalNotes] = useState(userProfile?.medicalNotes || user?.medical_notes || '');
  const [checkInMinutes, setCheckInMinutes] = useState(userProfile?.checkInMinutes || 4);

  // Password Change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  // Account Deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Data Export state
  const [exportLoading, setExportLoading] = useState(false);

  const handleExportData = async () => {
    if (!token) {
      showToast('You must be signed in to export account data', 'warning');
      return;
    }
    setExportLoading(true);
    try {
      const res = await fetch('/api/auth/export', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Failed to export data');
      }
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `saheli_data_export_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Account data exported successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Error exporting personal data', 'danger');
    } finally {
      setExportLoading(false);
    }
  };

  // Sync state if userProfile or user updates
  useEffect(() => {
    if (userProfile || user) {
      setName(userProfile?.name || user?.name || '');
      setPhone(userProfile?.phone || user?.phone || '');
      setEmergencyPin(userProfile?.emergencyPin || '1234');
      setBloodGroup(userProfile?.bloodGroup || user?.blood_group || 'O+');
      setMedicalNotes(userProfile?.medicalNotes || user?.medical_notes || '');
      setCheckInMinutes(userProfile?.checkInMinutes || user?.checkin_interval_minutes || 4);
    }
  }, [userProfile, user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty', 'warning');
      return;
    }
    if (emergencyPin.length < 4) {
      showToast('Emergency PIN must be at least 4 digits', 'warning');
      return;
    }

    await updateProfile({
      name: name.trim(),
      phone: phone.trim(),
      emergencyPin,
      bloodGroup,
      medicalNotes: medicalNotes.trim(),
      checkInMinutes: Number(checkInMinutes),
    });

    showToast('Profile & Safety Settings saved', 'success');
    onClose();
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      showToast('New passwords do not match', 'warning');
      return;
    }

    setPassLoading(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        showToast('Password changed successfully', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setShowPasswordChange(false);
      } else {
        showToast(res.error || 'Failed to change password', 'danger');
      }
    } catch (err) {
      showToast(err.message || 'Error updating password', 'danger');
    } finally {
      setPassLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deletePassword) {
      showToast('Password is required to confirm account deletion', 'warning');
      return;
    }

    setDeleteLoading(true);
    try {
      const res = await deleteAccount(deletePassword);
      if (res.success) {
        showToast('Your account has been permanently deleted.', 'info');
        setShowDeleteConfirm(false);
        onClose();
      } else {
        showToast(res.error || 'Account deletion failed', 'danger');
      }
    } catch (err) {
      showToast(err.message || 'Error during account deletion', 'danger');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile & Security Settings"
      size="md"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          {user ? (
            <Button
              variant="ghost"
              size="sm"
              icon={<LogOut size={15} />}
              onClick={() => {
                logout();
                onClose();
              }}
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Sign Out
            </Button>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Guest Profile</span>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="ghost" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="md" icon={<CheckCircle2 size={16} />} onClick={handleSave}>
              Save Preferences
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Account Status Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            backgroundColor: user ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.04)',
            borderRadius: '12px',
            border: '1px solid',
            borderColor: user ? 'rgba(56, 189, 248, 0.28)' : 'var(--color-border-subtle)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {user ? user.email : 'Local Guest Profile'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {user ? (
                user.is_verified ? (
                  <span style={{ color: '#34D399', fontWeight: 600 }}>
                    ✓ Verified Account
                  </span>
                ) : (
                  <span style={{ color: '#FBBF24', fontWeight: 600 }}>
                    ⚠ Email Unverified
                  </span>
                )
              ) : (
                'Sign in to sync your guardians and records securely across devices.'
              )}
            </div>
          </div>

          {!user && onOpenAuth && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
            >
              Sign In / Register
            </Button>
          )}
        </div>

        {/* User Profile Section */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-brand-primary)', marginBottom: '0.5rem' }}>
            Personal Identification
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="label-text" htmlFor="profile-name">
                Full Name *
              </label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  id="profile-name"
                  type="text"
                  className="saheli-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label-text" htmlFor="profile-phone">
                Mobile Number *
              </label>
              <div className="input-with-icon">
                <Phone size={16} className="input-icon" />
                <input
                  id="profile-phone"
                  type="tel"
                  className="saheli-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Emergency PIN & Medical Info */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-brand-primary)', marginBottom: '0.5rem' }}>
            Emergency Security & Medical
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="label-text" htmlFor="profile-pin">
                Emergency PIN (4 digits)
              </label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  id="profile-pin"
                  type="password"
                  maxLength={6}
                  className="saheli-input"
                  value={emergencyPin}
                  onChange={(e) => setEmergencyPin(e.target.value)}
                  placeholder="4 digits"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label-text" htmlFor="profile-blood">
                Blood Group
              </label>
              <select
                id="profile-blood"
                className="saheli-input saheli-select"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label className="label-text" htmlFor="profile-notes">
              Medical Alerts / Emergency Notes
            </label>
            <input
              id="profile-notes"
              type="text"
              className="saheli-input"
              value={medicalNotes}
              onChange={(e) => setMedicalNotes(e.target.value)}
              placeholder="e.g. Inhaler in bag, allergic to penicillin"
            />
          </div>
        </div>

        {/* SafeWalk Check-in Frequency */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-brand-primary)', marginBottom: '0.5rem' }}>
            SafeWalk Preferences
          </div>

          <div className="form-group">
            <label className="label-text" htmlFor="checkin-interval">
              Check-in Frequency
            </label>
            <div className="input-with-icon">
              <Clock size={16} className="input-icon" />
              <select
                id="checkin-interval"
                className="saheli-input saheli-select"
                value={checkInMinutes}
                onChange={(e) => setCheckInMinutes(e.target.value)}
              >
                <option value={2}>Every 2 minutes (High Alert / Night)</option>
                <option value={4}>Every 4 minutes (Standard)</option>
                <option value={5}>Every 5 minutes</option>
                <option value={10}>Every 10 minutes (Campus Daytime)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Application Theme Settings */}
        <div
          style={{
            padding: '0.875rem 1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '12px',
            border: '1px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SunMoon size={18} style={{ color: 'var(--color-brand-primary)' }} />
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Visual Appearance
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Switch between light and high-contrast dark themes
              </div>
            </div>
          </div>
          <ThemeSwitcher variant="pill" />
        </div>

        {/* Browser Geolocation Testing */}
        <div style={{ padding: '0.875rem', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', border: '1px solid var(--color-border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Compass size={16} style={{ color: 'var(--color-brand-primary)' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                GPS Location Hardware Status
              </span>
            </div>
            <Badge variant={locationStatus?.granted ? 'safe' : locationStatus?.denied ? 'emergency' : 'neutral'} size="sm">
              {locationStatus?.granted ? 'GPS Verified' : locationStatus?.denied ? 'Denied' : 'Standby'}
            </Badge>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4, margin: '0 0 0.5rem 0' }}>
            {locationStatus?.granted && locationStatus.accuracy
              ? `Real device location verified with accuracy ±${Math.round(locationStatus.accuracy)}m.`
              : locationStatus?.denied
              ? 'GPS permission denied. Campus waypoint fallback active.'
              : 'Explicit permission required to broadcast live coordinates during emergency.'}
          </p>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={<Compass size={14} />}
            onClick={requestLocationAccess}
          >
            {locationStatus?.granted ? 'Re-verify Accuracy' : 'Request GPS Permission'}
          </Button>
        </div>

        {/* Privacy & Data Rights (GDPR / DPDP) */}
        <div
          style={{
            padding: '0.875rem 1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '12px',
            border: '1px solid var(--color-border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} style={{ color: 'var(--color-brand-secondary)' }} />
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Privacy & Data Rights
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  GDPR & DPDP Act 2023 data portability and access
                </div>
              </div>
            </div>
            <Badge variant="safe" size="sm">Zero Sale of Data</Badge>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.4, margin: 0 }}>
            You have the right to request a complete machine-readable copy of your personal data, guardian connections, active SafeWalk logs, and incident records.
          </p>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<Download size={14} />}
              onClick={handleExportData}
              disabled={exportLoading || !user}
            >
              {exportLoading ? 'Generating Export...' : 'Download Personal Data Export (JSON)'}
            </Button>
            {onOpenLegal && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenLegal('privacy');
                }}
              >
                Review Privacy Policy
              </Button>
            )}
          </div>
        </div>

        {/* Change Password Toggle (Authenticated Users) */}
        {user && (
          <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '1rem' }}>
            <button
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                color: 'var(--color-brand-primary)',
                fontWeight: 700,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                padding: 0,
              }}
              onClick={() => setShowPasswordChange(!showPasswordChange)}
            >
              <KeyRound size={16} />
              <span>{showPasswordChange ? 'Hide Password Change' : 'Change Password'}</span>
            </button>

            {showPasswordChange && (
              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="label-text" htmlFor="curr-pass">
                    Current Password
                  </label>
                  <input
                    id="curr-pass"
                    type="password"
                    className="saheli-input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div className="form-group">
                    <label className="label-text" htmlFor="new-pass">
                      New Password (8+ chars)
                    </label>
                    <input
                      id="new-pass"
                      type="password"
                      className="saheli-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label-text" htmlFor="confirm-new-pass">
                      Confirm New Password
                    </label>
                    <input
                      id="confirm-new-pass"
                      type="password"
                      className="saheli-input"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                  </div>
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={handleChangePassword} disabled={passLoading}>
                  {passLoading ? 'Updating...' : 'Confirm Password Change'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Danger Zone: Delete Account */}
        {user && (
          <div style={{ borderTop: '1px solid rgba(239, 68, 68, 0.3)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-state-emergency)' }}>
                  Danger Zone
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  Permanently delete account, guardians, and incident history.
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={<Trash2 size={14} />}
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                style={{ color: 'var(--color-state-emergency)' }}
              >
                Delete Account
              </Button>
            </div>

            {showDeleteConfirm && (
              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '0.875rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <p style={{ fontSize: '0.75rem', color: '#FCA5A5', margin: 0, fontWeight: 600 }}>
                  Are you absolutely sure? This action cannot be undone. Enter your password to confirm:
                </p>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input
                    type="password"
                    className="saheli-input"
                    placeholder="Enter account password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                    Cancel
                  </Button>
                  <Button type="button" variant="danger" size="sm" onClick={handleDeleteAccount} disabled={deleteLoading}>
                    {deleteLoading ? 'Deleting...' : 'Permanently Delete'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
}
