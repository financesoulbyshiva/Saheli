/**
 * Supabase Service for SAHELI (Properties, Hostels & Verified Havens)
 * Provides authenticated queries to Supabase Lakebase PostgreSQL.
 * If credentials are not configured, gracefully reports unconfigured state
 * without injecting mock or fabricated property listings.
 */

import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export let isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export let supabaseClient = null;

export function initializeSupabase(url, key) {
  if (!url || !key) return null;
  supabaseUrl = url;
  supabaseAnonKey = key;
  isSupabaseConfigured = true;
  try {
    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return supabaseClient;
  } catch (err) {
    console.warn('[SupabaseService] Initialization failed:', err.message);
    return null;
  }
}

if (isSupabaseConfigured) {
  initializeSupabase(supabaseUrl, supabaseAnonKey);
}

/**
 * Runtime public configuration loader (eliminates manual local .env setup)
 * Queries /api/config for public URL and Anon Key if not present in Vite build.
 */
export async function ensureSupabaseConfigured() {
  if (isSupabaseConfigured && supabaseClient) {
    return true;
  }
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const data = await res.json();
      if (data?.supabaseUrl && data?.supabaseAnonKey) {
        initializeSupabase(data.supabaseUrl, data.supabaseAnonKey);
        return true;
      }
    }
  } catch {
    // Network / build fallback
  }
  return isSupabaseConfigured;
}

if (typeof window !== 'undefined' && !isSupabaseConfigured) {
  ensureSupabaseConfigured();
}

/**
 * Dispatch 6-digit Email OTP via Supabase Auth
 * Uses signInWithOtp({ email, options: { shouldCreateUser: true } })
 */
export async function sendSupabaseEmailOtp(email) {
  await ensureSupabaseConfigured();
  if (!isSupabaseConfigured || !supabaseClient) {
    return {
      success: false,
      configured: false,
      error: 'Supabase Auth is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to dispatch real verification emails.',
    };
  }

  try {
    const { data, error } = await supabaseClient.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      return { success: false, configured: true, error: error.message };
    }

    return { success: true, configured: true, data };
  } catch (err) {
    return { success: false, configured: true, error: err.message || 'Failed to dispatch Supabase Email OTP' };
  }
}

/**
 * Verify 6-digit Email OTP via Supabase Auth
 * Uses verifyOtp({ email, token, type: 'email' })
 */
export async function verifySupabaseEmailOtp(email, token) {
  await ensureSupabaseConfigured();
  if (!isSupabaseConfigured || !supabaseClient) {
    return {
      success: false,
      configured: false,
      error: 'Supabase is not configured.',
    };
  }

  try {
    const { data, error } = await supabaseClient.auth.verifyOtp({
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
      accessToken: data.session?.access_token || null,
    };
  } catch (err) {
    return { success: false, error: err.message || 'Failed to verify Supabase OTP' };
  }
}

/**
 * Sign in using email and password via Supabase Auth
 */
export async function signInWithSupabasePassword(email, password) {
  await ensureSupabaseConfigured();
  if (!isSupabaseConfigured || !supabaseClient) {
    return { success: false, configured: false, error: 'Supabase is not configured' };
  }

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      return { success: false, configured: true, error: error.message };
    }

    return {
      success: true,
      configured: true,
      session: data.session,
      user: data.user,
      accessToken: data.session?.access_token || null,
    };
  } catch (err) {
    return { success: false, configured: true, error: err.message || 'Supabase sign-in failed' };
  }
}

/**
 * Refresh current Supabase Auth session
 */
export async function refreshSupabaseSession() {
  await ensureSupabaseConfigured();
  if (!isSupabaseConfigured || !supabaseClient) return null;
  try {
    const { data, error } = await supabaseClient.auth.refreshSession();
    if (error || !data?.session) return null;
    return data.session;
  } catch {
    return null;
  }
}

/**
 * Sign out of active Supabase session
 */
export async function signOutSupabase() {
  if (isSupabaseConfigured && supabaseClient) {
    try {
      await supabaseClient.auth.signOut();
    } catch {
      // Ignore
    }
  }
}

/**
 * Get current active Supabase Auth session
 */
export async function getSupabaseSession() {
  if (!isSupabaseConfigured || !supabaseClient) return null;
  try {
    const { data } = await supabaseClient.auth.getSession();
    return data?.session || null;
  } catch {
    return null;
  }
}

/**
 * Fetch verified properties and hostels from Supabase
 * @param {object} [filter] Optional filters
 * @param {string} [filter.category] 'property' | 'hostel' | 'all'
 * @returns {Promise<{success: boolean, data: array, configured: boolean, error?: string}>}
 */
export async function fetchPropertiesAndHostels(filter = {}) {
  if (!isSupabaseConfigured || !supabaseClient) {
    return {
      success: true,
      data: [],
      configured: false,
      message: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to load verified community listings.',
    };
  }

  try {
    let query = supabaseClient
      .from('properties')
      .select('id, name, category, address, latitude, longitude, description, availability, contact_phone, verified, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (filter.category && filter.category !== 'all') {
      query = query.eq('category', filter.category);
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        data: [],
        configured: true,
        error: error.message || 'Error querying properties from Supabase.',
      };
    }

    const formatted = (data || []).map((item) => ({
      id: `prop-${item.id}`,
      name: item.name,
      category: item.category === 'hostel' ? 'Hostel' : 'Property / Accommodation',
      address: item.address,
      latitude: item.latitude,
      longitude: item.longitude,
      description: item.description,
      availability: item.availability || 'Inquire with management',
      phone: item.contact_phone || null,
      isVerified: Boolean(item.verified),
      dataSource: 'Supabase Lakebase Registry',
    }));

    return {
      success: true,
      data: formatted,
      configured: true,
    };
  } catch (err) {
    return {
      success: false,
      data: [],
      configured: true,
      error: err.message || 'Network error querying Supabase.',
    };
  }
}

/**
 * SQL DDL Schema for Supabase Properties and Hostels (RLS enabled)
 * Exported for reference and deployment documentation.
 */
export const SUPABASE_PROPERTIES_SCHEMA_SQL = `
-- ==============================================================================
-- SAHELI Supabase Schema: Verified Properties & Hostels
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('hostel', 'property', 'pg', 'women_shelter')),
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
  longitude DOUBLE PRECISION NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
  description TEXT DEFAULT '',
  availability TEXT DEFAULT 'Available',
  contact_phone TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- 1. Read Policy: Everyone can view verified properties
CREATE POLICY "Public verified properties are viewable by all users"
  ON public.properties
  FOR SELECT
  USING (verified = true);

-- 2. Owner Policy: Property owners can view their unverified submissions
CREATE POLICY "Owners can view own properties"
  ON public.properties
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

-- 3. Insert Policy: Authenticated users can submit new properties
CREATE POLICY "Authenticated users can submit properties for verification"
  ON public.properties
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id AND verified = false);

-- 4. Update Policy: Only owners can update their own unverified listings
CREATE POLICY "Owners can update own pending properties"
  ON public.properties
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id AND verified = false)
  WITH CHECK (auth.uid() = owner_id AND verified = false);

-- Spatial Indices
CREATE INDEX IF NOT EXISTS idx_properties_coords ON public.properties(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_properties_category ON public.properties(category);
`;
