import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  INITIAL_SAFETY_STATE,
  SAFETY_STATE_META,
  MOCK_GUARDIANS,
  MOCK_SAFE_PLACES,
} from '../data/mockData';
import {
  isSupabaseConfigured,
  supabaseClient,
  sendSupabaseEmailOtp,
  verifySupabaseEmailOtp,
  refreshSupabaseSession,
  signOutSupabase,
} from '../services/supabaseService';

const SafetyContext = createContext(null);

const LOCAL_STORAGE_KEY_GUARDIANS = 'saheli_guardians';
const LOCAL_STORAGE_KEY_PROFILE = 'saheli_profile';
const LOCAL_STORAGE_KEY_TOKEN = 'saheli_auth_token';

const DEFAULT_PROFILE = {
  name: '',
  phone: '',
  emergencyPin: '1234',
  bloodGroup: '',
  medicalNotes: '',
  checkInMinutes: 4,
};

// Format current time, e.g. "18:42"
const getDemoTime = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

export function SafetyProvider({ children }) {
  // Core Safety State: 'SAFE' | 'CAUTION' | 'THREAT' | 'EMERGENCY' | 'RECOVERED'
  const [safetyState, setSafetyStateRaw] = useState(INITIAL_SAFETY_STATE);
  const [activeTab, setActiveTab] = useState('home');
  const [viewMode, setViewMode] = useState('public'); // 'public' | 'app'

  // Safety Notifications Center
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Safety Telemetry Ready',
      message: 'Automated journey monitoring and check-in system standby.',
      time: 'Just now',
      read: false,
      type: 'safewalk',
    },
    {
      id: 'notif-2',
      title: 'Trusted Circle Armed',
      message: 'Priority guardian network armed for instant SOS dispatch.',
      time: 'Just now',
      read: false,
      type: 'guardian',
    },
    {
      id: 'notif-3',
      title: 'Verified Safe Havens Nearby',
      message: 'Nearby police, hospital, pharmacy, and public safe sanctuaries mapped.',
      time: 'Just now',
      read: true,
      type: 'place',
    },
    {
      id: 'notif-4',
      title: 'Client Privacy & Security Shield',
      message: 'Encrypted telemetry active. High-security coordinate protection enabled.',
      time: 'Just now',
      read: true,
      type: 'security',
    },
  ]);

  // Authentication State
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY_TOKEN) || null;
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Incident Tracking
  const [incidentStartTime, setIncidentStartTime] = useState(null);

  // User Profile
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name === 'Aadya Sharma') {
          return DEFAULT_PROFILE;
        }
        return parsed;
      }
      return DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  // Guardians
  const [guardians, setGuardians] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_GUARDIANS);
      return stored ? JSON.parse(stored) : MOCK_GUARDIANS;
    } catch {
      return MOCK_GUARDIANS;
    }
  });

  // Safe Places
  const [safePlaces, setSafePlaces] = useState(MOCK_SAFE_PLACES);
  const [selectedSafePlace, setSelectedSafePlace] = useState(null);
  const [alertedGuardian, setAlertedGuardian] = useState(null);

  // Real Geolocation Status
  const [locationStatus, setLocationStatus] = useState({
    requested: false,
    granted: false,
    denied: false,
    coords: null,
    accuracy: null,
    error: null,
  });

  // SafeWalk Journey State
  const [activeJourney, setActiveJourney] = useState({
    id: null,
    from: '',
    to: '',
    expectedArrival: '',
    guardianName: '',
    progressPercentage: 0,
    checkInMinutes: 4,
    checkInSecondsRemaining: 240,
    isStarted: false,
    waypoints: [],
  });

  // Timeline Activity Log
  const [timeline, setTimeline] = useState([
    {
      id: 'act-init-1',
      timestamp: getDemoTime(),
      state: 'SAFE',
      title: 'Safety System Ready',
      description: 'SAHELI active and monitoring. All safety features operational.',
    },
  ]);

  // Lightweight Toast System
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToast({ message, type, id });
    setTimeout(() => {
      setToast((current) => (current && current.id === id ? null : current));
    }, 3500);
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'info');
  }, [showToast]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    showToast('Notification center cleared', 'info');
  }, [showToast]);

  // Non-blocking sync with backend service
  const syncWithBackend = useCallback(
    async (endpoint, payload, method = 'POST') => {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(endpoint, {
          method,
          headers,
          body: payload ? JSON.stringify(payload) : undefined,
        });

        // Detect 401 token invalidation across any authenticated API call
        if (res.status === 401 && token) {
          localStorage.removeItem(LOCAL_STORAGE_KEY_TOKEN);
          setToken(null);
          setUser(null);
          setSessionExpired(true);
          return null;
        }

        return await res.json();
      } catch {
        return null; // Graceful offline fallback
      }
    },
    [token]
  );

  // Log timeline event with clean timestamp
  const addTimelineEvent = useCallback(
    (event) => {
      const timeStr = event.timestamp || getDemoTime();
      const newEntry = {
        id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: timeStr,
        ...event,
      };
      setTimeline((prev) => [newEntry, ...prev]);

      if (event.state) {
        syncWithBackend('/api/incidents', {
          state: event.state,
          title: event.title || 'Safety Event',
          description: event.description || '',
          latitude: locationStatus?.coords?.latitude || null,
          longitude: locationStatus?.coords?.longitude || null,
        });
      }
    },
    [locationStatus?.coords, syncWithBackend]
  );

  // State Transition Controller
  const setSafetyState = useCallback(
    (newState, reason) => {
      if (!SAFETY_STATE_META[newState]) return;
      setSafetyStateRaw(newState);

      if (newState !== 'SAFE' && newState !== 'RECOVERED') {
        setIncidentStartTime((prev) => prev || getDemoTime());
      } else {
        setIncidentStartTime(null);
      }

      addTimelineEvent({
        state: newState,
        title: `Status Changed to ${SAFETY_STATE_META[newState].label}`,
        description: reason || SAFETY_STATE_META[newState].description,
      });

      showToast(`Status updated: ${SAFETY_STATE_META[newState].label}`, 'info');
    },
    [addTimelineEvent, showToast]
  );

  // Fetch Safe Places from backend on mount or when GPS coordinates update
  const userLat = locationStatus?.coords?.latitude;
  const userLng = locationStatus?.coords?.longitude;

  useEffect(() => {
    async function loadSafePlaces() {
      try {
        const queryParams = userLat && userLng
          ? `?lat=${userLat}&lng=${userLng}`
          : '';
        const res = await fetch(`/api/safe-places${queryParams}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && json.data.length > 0) {
            setSafePlaces(json.data);
          }
        }
      } catch {
        // Use default havens
      }
    }
    loadSafePlaces();
  }, [userLat, userLng]);

  // Load Real Incident Ledger from Backend
  useEffect(() => {
    async function loadIncidents() {
      try {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch('/api/incidents', { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && json.data.length > 0) {
            setTimeline(
              json.data.map((item) => ({
                id: item.id,
                state: item.safety_state || 'SAFE',
                title: item.event_title || 'Safety Event',
                description: item.event_description || '',
                timestamp: item.created_at
                  ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
                  : getDemoTime(),
              }))
            );
          }
        }
      } catch {
        // Retain initial timeline
      }
    }
    loadIncidents();
  }, [token]);

  // Fetch Authenticated User & Guardians
  useEffect(() => {
    async function loadAuth() {
      if (!token) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            setUserProfile((prev) => ({
              ...prev,
              name: data.user.name,
              phone: data.user.phone,
              bloodGroup: data.user.blood_group,
              medicalNotes: data.user.medical_notes,
              checkInMinutes: data.user.checkin_interval_minutes,
            }));

            // Load user's guardians from backend
            const gRes = await fetch('/api/guardians', {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (gRes.ok) {
              const gData = await gRes.json();
              if (gData.success && gData.data) {
                setGuardians(gData.data);
              }
            }
          }
        } else {
          // Token expired or invalid — trigger session-expired state
          localStorage.removeItem(LOCAL_STORAGE_KEY_TOKEN);
          setToken(null);
          setUser(null);
          if (res.status === 401) {
            setSessionExpired(true);
          }
        }
      } catch {
        // Offline
      } finally {
        setIsAuthLoading(false);
      }
    }

    loadAuth();
  }, [token]);

  // Persist guardians to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_GUARDIANS, JSON.stringify(guardians));
    } catch {
      // Local storage unavailable
    }
  }, [guardians]);

  // Persist userProfile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(userProfile));
    } catch {
      // Local storage unavailable
    }
  }, [userProfile]);

  // Supabase Auth session refresh and synchronization listener
  useEffect(() => {
    if (!isSupabaseConfigured || !supabaseClient) return;
    try {
      const { data: authListener } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (event === 'TOKEN_REFRESHED' && session?.access_token) {
          localStorage.setItem(LOCAL_STORAGE_KEY_TOKEN, session.access_token);
          setToken(session.access_token);
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem(LOCAL_STORAGE_KEY_TOKEN);
          setToken(null);
          setUser(null);
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    } catch {
      // Ignore
    }
  }, []);

  // ===========================================================================
  // AUTHENTICATION METHODS
  // ===========================================================================

  const login = useCallback(async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      if (data.unverified) {
        return {
          success: false,
          pendingVerification: true,
          unverified: true,
          userId: data.userId || data.user?.id,
          user: data.user,
          message: data.message,
          error: data.message || 'Please verify your email address to access your SAHELI safety features.',
        };
      }
      localStorage.setItem(LOCAL_STORAGE_KEY_TOKEN, data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true, user: data.user };
    }
    const isUnverified = Boolean(data.unverified || (data.error || '').toLowerCase().includes('verify'));
    const isSuspended = Boolean((data.error || '').toLowerCase().includes('suspend') || (data.error || '').toLowerCase().includes('disable'));
    return {
      success: false,
      error: data.error || 'Login failed',
      accountDisabled: res.status === 403 && isSuspended,
      pendingVerification: isUnverified,
      unverified: isUnverified,
      userId: data.userId,
      user: data.user,
    };
  }, []);

  const register = useCallback(async (userData) => {
    // 1. If Supabase is configured, trigger Supabase Auth Email OTP
    let supabaseResult = null;
    if (isSupabaseConfigured && userData.email) {
      supabaseResult = await sendSupabaseEmailOtp(userData.email);
    }

    // 2. Register user record in SAHELI backend (SQLite)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      if (data.token) {
        localStorage.setItem(LOCAL_STORAGE_KEY_TOKEN, data.token);
        setToken(data.token);
      }
      if (data.user) {
        setUser(data.user);
      }
      return {
        success: true,
        user: data.user,
        requiresOtp: true,
        phone: data.phone || userData.phone,
        email: userData.email,
        isSupabase: isSupabaseConfigured,
        supabaseDispatched: supabaseResult?.success || false,
        message: data.message,
        emailDelivered: data.emailDelivered,
        emailError: data.emailError,
        verificationToken: data.verificationToken,
      };
    }
    return {
      success: false,
      error: data.error || 'Registration failed',
      unverified: Boolean(data.unverified),
      requiresOtp: Boolean(data.requiresOtp),
      userId: data.userId,
      email: data.email || userData.email,
      phone: data.phone || userData.phone,
      emailDelivered: data.emailDelivered,
      emailError: data.emailError,
      message: data.message,
    };
  }, []);

  const verifyOtp = useCallback(async ({ userId, phone, email, otp, name, emergencyPin }) => {
    // 1. If Supabase is configured, verify Email OTP via Supabase Auth
    if (isSupabaseConfigured && email) {
      const supRes = await verifySupabaseEmailOtp(email, otp);
      if (supRes.success && supRes.accessToken) {
        try {
          const syncRes = await fetch('/api/auth/supabase-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accessToken: supRes.accessToken,
              name,
              phone,
              emergencyPin,
            }),
          });
          const syncData = await syncRes.json();
          if (syncRes.ok && syncData.success) {
            localStorage.setItem(LOCAL_STORAGE_KEY_TOKEN, syncData.token || supRes.accessToken);
            setToken(syncData.token || supRes.accessToken);
            if (syncData.user) setUser(syncData.user);
            return { success: true, user: syncData.user };
          }
        } catch {
          // Fall through to local verify
        }
      } else if (supRes.error) {
        return { success: false, error: supRes.error };
      }
    }

    // 2. Local / Standard verification
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, phone, email, otp }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      if (data.token) {
        localStorage.setItem(LOCAL_STORAGE_KEY_TOKEN, data.token);
        setToken(data.token);
      }
      if (data.user) {
        setUser(data.user);
      } else {
        setUser((prev) => (prev ? { ...prev, is_verified: 1 } : prev));
      }
      return { success: true, user: data.user };
    }
    return {
      success: false,
      error: data.error || 'Verification failed',
      remainingAttempts: data.remainingAttempts,
    };
  }, []);

  const resendOtp = useCallback(async ({ userId, phone, email }) => {
    if (isSupabaseConfigured && email) {
      await sendSupabaseEmailOtp(email);
    }
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, phone, email }),
      });
      const data = await res.json();
      return {
        success: res.ok && data.success,
        message: data.message,
        error: data.error,
        retryAfterSeconds: data.retryAfterSeconds,
        emailDelivered: data.emailDelivered,
        emailError: data.emailError,
      };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, []);

  // Session expired state — exposed for AuthModal to open with 'session-expired' view
  const [sessionExpired, setSessionExpired] = useState(false);

  const logout = useCallback((opts = {}) => {
    const { silent = false, serverSide = false } = opts;
    const currentToken = localStorage.getItem(LOCAL_STORAGE_KEY_TOKEN);

    signOutSupabase();

    // Fire-and-forget server logout (non-blocking)
    if (currentToken && serverSide) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${currentToken}` },
      }).catch(() => {});
    }

    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY_TOKEN);
    } catch {
      // Ignore
    }
    setToken(null);
    setUser(null);
    if (!silent) showToast('You have been signed out.', 'info');
  }, [showToast]);

  const logoutAll = useCallback(async () => {
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch('/api/auth/logout-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        logout({ silent: false });
        showToast('All sessions have been signed out.', 'info');
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch {
      // Fallback: local-only logout
      logout({ silent: false });
      return { success: true };
    }
  }, [token, logout, showToast]);

  const verifyEmail = useCallback(async (verificationToken) => {
    const res = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: verificationToken }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setUser((prev) => (prev ? { ...prev, is_verified: 1 } : prev));
      return { success: true };
    }
    return { success: false, error: data.error || 'Verification failed' };
  }, []);

  const resendVerification = useCallback(async (emailAddr) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      // If we have an active session token, use authenticated resend endpoint
      const currentToken = localStorage.getItem(LOCAL_STORAGE_KEY_TOKEN);
      if (currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
      }
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers,
        body: JSON.stringify({ email: emailAddr }),
      });
      const data = await res.json();
      return {
        success: res.ok && data.success,
        error: data.error,
        verificationToken: data.verificationToken,
      };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return await res.json();
  }, []);

  const resetPassword = useCallback(async (resetToken, newPassword) => {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: resetToken, newPassword }),
    });
    const data = await res.json();
    return { success: res.ok && data.success, error: data.error };
  }, []);

  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      if (!token) return { success: false, error: 'Unauthorized' };
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      return { success: res.ok && data.success, error: data.error };
    },
    [token]
  );

  const deleteAccount = useCallback(
    async (password) => {
      if (!token) return { success: false, error: 'Unauthorized' };
      const res = await fetch('/api/auth/account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        logout();
        return { success: true };
      }
      return { success: false, error: data.error };
    },
    [token, logout]
  );

  // Update Profile
  const updateProfile = useCallback(
    async (newProfile) => {
      setUserProfile((prev) => ({
        ...prev,
        ...newProfile,
      }));

      if (token) {
        try {
          await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(newProfile),
          });
        } catch {
          // Offline fallback
        }
      }
    },
    [token]
  );

  // Browser Geolocation permission request and verification
  const requestLocationAccess = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationStatus({
        requested: true,
        granted: false,
        denied: true,
        error: 'Geolocation not supported in this browser.',
        coords: null,
        accuracy: null,
      });
      showToast('Geolocation is not supported by your browser.', 'warning');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        const accuracy = position.coords.accuracy;
        setLocationStatus({
          requested: true,
          granted: true,
          denied: false,
          coords,
          accuracy,
          error: null,
        });
        showToast(`Real GPS verified. Accuracy ±${Math.round(accuracy)}m`, 'success');
        addTimelineEvent({
          state: 'SAFE',
          title: 'Device GPS Verified',
          description: `Device GPS location verified with accuracy ±${Math.round(accuracy)}m. Location tracking active.`,
        });
      },
      (err) => {
        setLocationStatus({
          requested: true,
          granted: false,
          denied: true,
          coords: null,
          accuracy: null,
          error: err.message,
        });
        showToast(`Location permission ${err.code === 1 ? 'denied' : 'unavailable'}. Campus waypoints fallback active.`, 'warning');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );
  }, [addTimelineEvent, showToast]);

  // Live Location Sharing Telemetry
  const [activeLocationShare, setActiveLocationShare] = useState(null);

  const shareLiveLocation = useCallback(async (opts = {}) => {
    const lat = opts.latitude ?? locationStatus?.coords?.latitude;
    const lng = opts.longitude ?? locationStatus?.coords?.longitude;
    const accuracy = opts.accuracy ?? locationStatus?.accuracy;
    const durationMinutes = opts.durationMinutes || 60;

    if (lat === null || lat === undefined || lng === null || lng === undefined) {
      return { success: false, error: 'GPS coordinates unavailable. Please enable device location.' };
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/location/share', {
        method: 'POST',
        headers,
        body: JSON.stringify({ latitude: lat, longitude: lng, accuracy, durationMinutes }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActiveLocationShare(data.data);
        showToast('Live location sharing broadcast to your trusted circle.', 'success');
        return { success: true, data: data.data };
      }
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: 'Network error sharing location.' };
    }
  }, [locationStatus, token, showToast]);

  const revokeLiveLocation = useCallback(async () => {
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/location/revoke', {
        method: 'POST',
        headers,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActiveLocationShare(null);
        showToast('Location sharing has been revoked.', 'info');
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: 'Network error revoking location.' };
    }
  }, [token, showToast]);

  // SafeWalk Actions
  const startSafeWalk = useCallback(
    ({ from, to, expectedArrival, guardianName, waypoints }) => {
      const journeyFrom = from || 'Current Location';
      const journeyTo = to || 'Destination';
      const updatedJourney = {
        id: `journey-${Date.now()}`,
        from: journeyFrom,
        to: journeyTo,
        destination: journeyTo,
        startLocation: journeyFrom,
        expectedArrival: expectedArrival || 'Estimated in 20 min',
        guardianName: guardianName || (guardians[0]?.name || 'Primary Guardian'),
        progressPercentage: 10,
        checkInMinutes: userProfile?.checkInMinutes || 4,
        checkInSecondsRemaining: (userProfile?.checkInMinutes || 4) * 60,
        isStarted: true,
        waypoints: waypoints || [
          { name: journeyFrom, passed: true },
          { name: 'En-route Checkpoint', passed: false },
          { name: journeyTo, passed: false },
        ],
      };

      setActiveJourney(updatedJourney);
      setSafetyStateRaw('SAFE');
      setIncidentStartTime(null);

      addTimelineEvent({
        state: 'SAFE',
        title: 'SafeWalk started',
        description: `Journey started: ${updatedJourney.from} → ${updatedJourney.to}. Guardian: ${updatedJourney.guardianName}. ETA: ${updatedJourney.expectedArrival}.`,
      });

      showToast('SafeWalk started. Guardian monitoring is active.', 'success');
    },
    [addTimelineEvent, guardians, showToast, userProfile?.checkInMinutes]
  );

  const completeSafeWalk = useCallback(() => {
    setActiveJourney((prev) => ({
      ...prev,
      progressPercentage: 100,
      isStarted: false,
    }));

    syncWithBackend('/api/safewalk/checkin', {
      journeyId: activeJourney?.id || 'journey-01',
      status: 'completed',
    });

    addTimelineEvent({
      state: 'SAFE',
      title: 'SafeWalk completed',
      description: 'Destination reached safely. SafeWalk ended.',
    });

    showToast('SafeWalk completed! You have arrived safely.', 'success');
  }, [activeJourney?.id, addTimelineEvent, showToast, syncWithBackend]);

  const performCheckIn = useCallback(() => {
    const intervalMinutes = userProfile?.checkInMinutes || 4;
    setActiveJourney((prev) => ({
      ...prev,
      checkInSecondsRemaining: intervalMinutes * 60,
    }));

    syncWithBackend('/api/safewalk/checkin', {
      journeyId: activeJourney?.id || 'journey-01',
    });

    addTimelineEvent({
      state: 'SAFE',
      title: 'Safety check-in completed',
      description: 'User confirmed safety status along route. Telemetry logged to safety server.',
    });

    showToast("Check-in recorded. You're safe.", 'success');
  }, [activeJourney?.id, addTimelineEvent, showToast, syncWithBackend, userProfile?.checkInMinutes]);

  const triggerUncomfortable = useCallback(() => {
    setSafetyStateRaw('CAUTION');
    setIncidentStartTime(getDemoTime());

    addTimelineEvent({
      state: 'CAUTION',
      title: 'User reported discomfort',
      description: "User triggered 'I'm Uncomfortable'. Caution mode activated.",
    });

    showToast("Caution Mode activated: Let's help you move toward safety.", 'warning');
  }, [addTimelineEvent, showToast]);

  const identifySafePlace = useCallback(
    (place) => {
      const targetPlace = place || safePlaces[1] || safePlaces[0];
      setSelectedSafePlace(targetPlace);

      addTimelineEvent({
        state: 'CAUTION',
        title: 'Safe place identified',
        description: `Recommended safe haven located: ${targetPlace.name} (${targetPlace.distance}).`,
      });

      showToast('Nearest safe place identified.', 'info');
    },
    [safePlaces, addTimelineEvent, showToast]
  );

  const alertGuardian = useCallback(
    (guardian) => {
      const targetGuardian = guardian || guardians[0];
      setAlertedGuardian(targetGuardian);

      addTimelineEvent({
        state: 'CAUTION',
        title: 'Guardian alert triggered',
        description: `Standby alert sent to ${targetGuardian.name} (${targetGuardian.relationship}).`,
      });

      showToast(`Guardian alert sent to ${targetGuardian.name}.`, 'warning');
    },
    [guardians, addTimelineEvent, showToast]
  );

  const checkInAtSafePlace = useCallback(
    (place) => {
      const targetPlace = place || selectedSafePlace || safePlaces[1] || safePlaces[0];

      addTimelineEvent({
        state: safetyState,
        title: 'Safe place check-in',
        description: `Safe place check-in recorded at ${targetPlace.name}. User reported arriving at safe haven.`,
      });

      showToast(`Check-in recorded at ${targetPlace.name}.`, 'success');
    },
    [selectedSafePlace, safePlaces, safetyState, addTimelineEvent, showToast]
  );

  const addGuardian = useCallback(
    async ({ name, relationship, priority, phone }) => {
      const isPrimaryChoice = priority === 'Primary';
      const newGuardian = {
        id: `g-cust-${Date.now()}`,
        name: name.trim(),
        relationship: relationship || 'Friend',
        status: 'Available',
        availability: 'Available',
        priority: priority || 'Secondary',
        isPrimary: isPrimaryChoice,
        phone: phone || '+91 98999 11223',
        battery: 94,
        lastPing: 'Just now',
        isCustom: true,
      };

      if (token) {
        try {
          const res = await fetch('/api/guardians', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(newGuardian),
          });
          const data = await res.json();
          if (data.success && data.data) {
            newGuardian.id = data.data.id;
          }
        } catch {
          // Offline fallback
        }
      }

      setGuardians((prev) => {
        if (isPrimaryChoice) {
          return [newGuardian, ...prev.map((g) => ({ ...g, isPrimary: false, priority: 'Secondary' }))];
        }
        return [...prev, newGuardian];
      });

      addTimelineEvent({
        state: 'SAFE',
        title: 'Guardian added to network',
        description: `${newGuardian.name} (${newGuardian.relationship}) added as ${newGuardian.priority} guardian.`,
      });

      showToast(`Guardian added: ${newGuardian.name}`, 'success');
    },
    [token, addTimelineEvent, showToast]
  );

  const removeGuardian = useCallback(
    async (id) => {
      if (token) {
        try {
          await fetch(`/api/guardians/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch {
          // Offline fallback
        }
      }
      setGuardians((prev) => prev.filter((g) => g.id !== id));
      showToast('Guardian removed from network.', 'info');
    },
    [token, showToast]
  );

  const escalateToThreat = useCallback(() => {
    setSafetyStateRaw('THREAT');

    addTimelineEvent({
      state: 'THREAT',
      title: 'Safety level escalated',
      description: 'Safety level escalated to THREAT. Emergency assistance prepared.',
    });

    showToast('Safety level escalated to THREAT. Stay vigilant.', 'danger');
  }, [addTimelineEvent, showToast]);

  const triggerEmergency = useCallback(() => {
    setSafetyStateRaw('EMERGENCY');

    addTimelineEvent({
      state: 'EMERGENCY',
      title: 'Emergency mode activated',
      description: 'Emergency response activated. Guardian alert and location-sharing telemetry logged.',
    });

    // Automatically initiate live location broadcast if GPS coords are present
    if (locationStatus?.coords?.latitude && locationStatus?.coords?.longitude) {
      shareLiveLocation({ durationMinutes: 60 });
    }

    showToast('🚨 Emergency assistance mode is active.', 'danger');
  }, [addTimelineEvent, locationStatus?.coords, shareLiveLocation, showToast]);

  const resolveEmergency = useCallback(() => {
    setSafetyStateRaw('RECOVERED');
    setIncidentStartTime(null);

    addTimelineEvent({
      state: 'RECOVERED',
      title: 'User marked safe',
      description: 'User marked themselves safe. Emergency mode resolved and reassurance logged.',
    });

    showToast("You're safe. Emergency mode has been resolved.", 'success');

    setTimeout(() => {
      setSafetyStateRaw((current) => (current === 'RECOVERED' ? 'SAFE' : current));
    }, 4000);
  }, [addTimelineEvent, showToast]);

  const hasActiveIncident = safetyState === 'CAUTION' || safetyState === 'THREAT' || safetyState === 'EMERGENCY';
  const currentIncident = {
    hasActive: hasActiveIncident,
    state: safetyState,
    startedTime: incidentStartTime || '18:51',
    latitude: locationStatus?.coords?.latitude || null,
    longitude: locationStatus?.coords?.longitude || null,
    action:
      safetyState === 'EMERGENCY'
        ? 'Emergency response active'
        : safetyState === 'THREAT'
        ? 'Emergency assistance standby'
        : 'Caution guidance active',
  };

  // SafeWalk countdown timer
  useEffect(() => {
    if (!activeJourney?.isStarted) return;

    const timer = setInterval(() => {
      setActiveJourney((prev) => {
        if (!prev || prev.checkInSecondsRemaining <= 0) return prev;
        return {
          ...prev,
          checkInSecondsRemaining: prev.checkInSecondsRemaining - 1,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeJourney?.isStarted]);

  const value = {
    safetyState,
    safetyMeta: SAFETY_STATE_META[safetyState],
    setSafetyState,

    activeTab,
    setActiveTab,

    // Auth
    user,
    token,
    isAuthenticated: Boolean(user),
    isAuthLoading,
    sessionExpired,
    setSessionExpired,
    login,
    register,
    verifyOtp,
    resendOtp,
    refreshSupabaseSession,
    logout,
    logoutAll,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    changePassword,
    deleteAccount,

    // Profile & Diagnostics
    userProfile,
    updateProfile,
    locationStatus,
    requestLocationAccess,
    activeLocationShare,
    shareLiveLocation,
    revokeLiveLocation,

    // Domain Entities
    guardians,
    setGuardians,
    addGuardian,
    removeGuardian,
    safePlaces,
    selectedSafePlace,
    setSelectedSafePlace,
    alertedGuardian,

    // Workflows
    activeJourney,
    setActiveJourney,
    startSafeWalk,
    completeSafeWalk,
    performCheckIn,
    triggerUncomfortable,
    identifySafePlace,
    alertGuardian,
    checkInAtSafePlace,
    escalateToThreat,
    triggerEmergency,
    resolveEmergency,

    currentIncident,
    timeline,
    addTimelineEvent,

    // Navigation View Mode & Notifications
    viewMode,
    setViewMode,
    notifications,
    setNotifications,
    markAllNotificationsRead,
    clearNotifications,

    toast,
    showToast,
    hideToast,
  };

  return <SafetyContext.Provider value={value}>{children}</SafetyContext.Provider>;
}

export function useSafety() {
  const context = useContext(SafetyContext);
  if (!context) {
    throw new Error('useSafety must be used within a SafetyProvider');
  }
  return context;
}
