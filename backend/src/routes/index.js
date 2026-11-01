/**
 * SAHELI Backend — Route Map Reference
 * Endpoints handled in server.js
 */
export const API_ROUTES = {
  HEALTH: '/api/health',
  CONFIG: '/api/config',
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    LOGOUT_ALL: '/api/auth/logout-all',
    ME: '/api/auth/me',
    PROFILE: '/api/auth/profile',
    CHANGE_PASSWORD: '/api/auth/change-password',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
    VERIFY_OTP: '/api/auth/verify-otp',
    RESEND_OTP: '/api/auth/resend-otp',
    SUPABASE_SESSION: '/api/auth/supabase-session',
    RESEND_VERIFICATION: '/api/auth/resend-verification',
    ACCOUNT: '/api/auth/account',
    EXPORT: '/api/auth/export',
  },
  GUARDIANS: {
    LIST_CREATE: '/api/guardians',
    DELETE: '/api/guardians/:id',
  },
  SAFE_PLACES: '/api/safe-places',
  INCIDENTS: '/api/incidents',
  SAFEWALK_CHECKIN: '/api/safewalk/checkin',
  LOCATION: {
    SHARE: '/api/location/share',
    REVOKE: '/api/location/revoke',
    SHARED: '/api/location/shared',
    PROTECTED_CONTACTS: '/api/location/protected-contacts',
  },
  ADMIN: {
    OVERVIEW: '/api/admin/overview',
    USERS: '/api/admin/users',
    UPDATE_USER_STATUS: '/api/admin/users/:id/status',
  },
};
