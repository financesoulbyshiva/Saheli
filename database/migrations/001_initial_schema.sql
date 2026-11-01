-- Migration 001: Initial Schema
-- Applies users, guardians, safewalk_sessions, incident_logs, and safe_places.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  is_verified INTEGER NOT NULL DEFAULT 0,
  verification_token TEXT,
  verification_token_expires INTEGER,
  reset_token TEXT,
  reset_token_expires INTEGER,
  emergency_pin_hash TEXT,
  blood_group TEXT DEFAULT 'O+',
  medical_notes TEXT DEFAULT '',
  checkin_interval_minutes INTEGER DEFAULT 4,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);

CREATE TABLE IF NOT EXISTS guardians (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Secondary',
  status TEXT NOT NULL DEFAULT 'Available',
  battery INTEGER NOT NULL DEFAULT 95,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_guardians_user_id ON guardians(user_id);

CREATE TABLE IF NOT EXISTS safewalk_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  expected_arrival TEXT NOT NULL,
  checkin_interval_minutes INTEGER NOT NULL DEFAULT 4,
  status TEXT NOT NULL DEFAULT 'Active',
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON safewalk_sessions(user_id);

CREATE TABLE IF NOT EXISTS incident_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  safety_state TEXT NOT NULL,
  event_title TEXT NOT NULL,
  event_description TEXT DEFAULT '',
  latitude REAL,
  longitude REAL,
  client_ip TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_incidents_user_id ON incident_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incident_logs(created_at);

CREATE TABLE IF NOT EXISTS safe_places (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  distance TEXT NOT NULL,
  time_est TEXT NOT NULL,
  address TEXT NOT NULL,
  open_status TEXT NOT NULL,
  is_verified INTEGER NOT NULL DEFAULT 1,
  phone TEXT NOT NULL,
  safety_tags TEXT NOT NULL,
  features TEXT NOT NULL
);
