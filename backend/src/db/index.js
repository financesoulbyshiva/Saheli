import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

const isTest = process.env.NODE_ENV === 'test';
const isVercel = Boolean(process.env.VERCEL || process.env.NOW_REGION);
const dbPath = isTest
  ? ':memory:'
  : process.env.DATABASE_PATH || (isVercel ? path.join('/tmp', 'saheli.db') : path.join(projectRoot, 'database', 'saheli.db'));

if (!isTest) {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export const db = new DatabaseSync(dbPath);

// Enable WAL mode for high concurrency & enforce foreign keys
if (!isTest) {
  db.exec('PRAGMA journal_mode = WAL;');
}
db.exec('PRAGMA foreign_keys = ON;');

const embeddedSchemaSql = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  is_verified INTEGER NOT NULL DEFAULT 0,
  email_verified_at TEXT,
  account_status TEXT NOT NULL DEFAULT 'active',
  terms_accepted INTEGER NOT NULL DEFAULT 1,
  terms_version TEXT DEFAULT 'v2.0',
  terms_accepted_at TEXT,
  verification_token TEXT,
  verification_token_hash TEXT,
  verification_token_expires INTEGER,
  otp_hash TEXT,
  otp_expires INTEGER,
  otp_attempts INTEGER NOT NULL DEFAULT 0,
  otp_last_sent_at INTEGER DEFAULT 0,
  phone_verified_at TEXT,
  supabase_id TEXT,
  reset_token TEXT,
  reset_token_hash TEXT,
  reset_token_expires INTEGER,
  token_version INTEGER NOT NULL DEFAULT 1,
  emergency_pin_hash TEXT,
  blood_group TEXT DEFAULT 'O+',
  medical_notes TEXT DEFAULT '',
  checkin_interval_minutes INTEGER DEFAULT 4,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
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
  latitude REAL,
  longitude REAL,
  open_status TEXT NOT NULL,
  is_verified INTEGER NOT NULL DEFAULT 1,
  phone TEXT NOT NULL,
  safety_tags TEXT NOT NULL,
  features TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS location_shares (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  accuracy REAL,
  is_active INTEGER NOT NULL DEFAULT 1,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_location_shares_user_id ON location_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_location_shares_active ON location_shares(is_active, expires_at);
`;

const embeddedSeedSql = `INSERT OR IGNORE INTO safe_places (id, name, category, distance, time_est, address, latitude, longitude, open_status, is_verified, phone, safety_tags, features) VALUES
('sp-1', 'College Campus Security Post', 'Security Post', '120m away', '2 min walk', 'Gate 2, Central University Campus', 28.6152, 77.2082, 'Open 24/7', 1, '011-2345678', '["Security","CCTV","24/7","First Aid"]', '["Uniformed Guards","High-Mast Lights","Emergency Gate"]'),
('sp-2', 'Apollo 24/7 Pharmacy', 'Pharmacy', '240m away', '3 min walk', 'Shop 4, Commercial Complex, Main Road', 28.6125, 77.2078, 'Open 24/7', 1, '011-9876543', '["24/7","CCTV","First Aid","Security"]', '["Well-Lit Storefront","CCTV Active","First Aid"]'),
('sp-3', 'Civil Hospital Emergency Ward', 'Hospital', '550m away', '7 min walk', 'Sector 4, Main Hospital Blvd', 28.6145, 77.2105, 'Emergency Open 24/7', 1, '102 / 011-8765432', '["24/7","Security","First Aid","CCTV"]', '["Paramedics On Site","Police Desk Inside","Ambulance Standby"]'),
('sp-4', 'Safe Partner Store - Daily Mart', 'Safe Partner Store', '380m away', '5 min walk', 'Crossroad 9, Green Avenue', 28.6118, 77.2110, 'Open until 11:30 PM', 1, '011-5432109', '["Security","CCTV","First Aid"]', '["Verified Merchant","Indoor Seating","CCTV Monitored"]');
`;

// Initialize schema and seed data
export function initializeDatabase() {
  const schemaCandidates = [
    path.join(projectRoot, 'database', 'schema', 'schema.sql'),
    path.resolve(process.cwd(), 'database', 'schema', 'schema.sql'),
    path.resolve(__dirname, '../../../database/schema/schema.sql'),
  ];
  const seedCandidates = [
    path.join(projectRoot, 'database', 'seed', 'seed.sql'),
    path.resolve(process.cwd(), 'database', 'seed', 'seed.sql'),
    path.resolve(__dirname, '../../../database/seed/seed.sql'),
  ];

  let schemaLoaded = false;
  for (const sPath of schemaCandidates) {
    if (fs.existsSync(sPath)) {
      try {
        const schemaSql = fs.readFileSync(sPath, 'utf8');
        db.exec(schemaSql);
        schemaLoaded = true;
        break;
      } catch {
        // Continue
      }
    }
  }

  if (!schemaLoaded) {
    try {
      db.exec(embeddedSchemaSql);
    } catch {
      // Continue
    }
  }

  // Safe idempotent migration for existing tables
  const newColumns = [
    { name: 'email_verified_at', def: 'TEXT' },
    { name: 'account_status', def: "TEXT NOT NULL DEFAULT 'active'" },
    { name: 'terms_accepted', def: 'INTEGER NOT NULL DEFAULT 1' },
    { name: 'terms_version', def: "TEXT DEFAULT 'v2.0'" },
    { name: 'terms_accepted_at', def: 'TEXT' },
    { name: 'verification_token_hash', def: 'TEXT' },
    { name: 'reset_token_hash', def: 'TEXT' },
    { name: 'token_version', def: 'INTEGER NOT NULL DEFAULT 1' },
    { name: 'otp_hash', def: 'TEXT' },
    { name: 'otp_expires', def: 'INTEGER' },
    { name: 'otp_attempts', def: 'INTEGER NOT NULL DEFAULT 0' },
    { name: 'otp_last_sent_at', def: 'INTEGER DEFAULT 0' },
    { name: 'phone_verified_at', def: 'TEXT' },
    { name: 'supabase_id', def: 'TEXT' },
  ];

  try {
    const tableInfo = db.prepare('PRAGMA table_info(users)').all();
    const existingCols = new Set(tableInfo.map((col) => col.name));
    for (const col of newColumns) {
      if (!existingCols.has(col.name)) {
        try {
          db.exec(`ALTER TABLE users ADD COLUMN ${col.name} ${col.def};`);
        } catch {
          // Column already exists or error
        }
      }
    }

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
      CREATE INDEX IF NOT EXISTS idx_users_otp_hash ON users(otp_hash);
      CREATE INDEX IF NOT EXISTS idx_users_reset_token_hash ON users(reset_token_hash);
      CREATE INDEX IF NOT EXISTS idx_users_verification_token_hash ON users(verification_token_hash);
      CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_id);
    `);

    // Safe places latitude/longitude columns
    const safePlaceCols = db.prepare('PRAGMA table_info(safe_places)').all();
    const existingSafeCols = new Set(safePlaceCols.map((c) => c.name));
    if (!existingSafeCols.has('latitude')) {
      try { db.exec('ALTER TABLE safe_places ADD COLUMN latitude REAL;'); } catch {}
    }
    if (!existingSafeCols.has('longitude')) {
      try { db.exec('ALTER TABLE safe_places ADD COLUMN longitude REAL;'); } catch {}
    }

    // Ensure location_shares table exists
    db.exec(`
      CREATE TABLE IF NOT EXISTS location_shares (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        accuracy REAL,
        is_active INTEGER NOT NULL DEFAULT 1,
        expires_at INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_location_shares_user_id ON location_shares(user_id);
      CREATE INDEX IF NOT EXISTS idx_location_shares_active ON location_shares(is_active, expires_at);
    `);

    // Backfill safe_places coordinates if null
    try {
      db.exec(`
        UPDATE safe_places SET latitude = 28.6152, longitude = 77.2082 WHERE id = 'sp-1' AND latitude IS NULL;
        UPDATE safe_places SET latitude = 28.6125, longitude = 77.2078 WHERE id = 'sp-2' AND latitude IS NULL;
        UPDATE safe_places SET latitude = 28.6145, longitude = 77.2105 WHERE id = 'sp-3' AND latitude IS NULL;
        UPDATE safe_places SET latitude = 28.6118, longitude = 77.2110 WHERE id = 'sp-4' AND latitude IS NULL;
      `);
    } catch {}
  } catch {
    // Ignored
  }

  // Check if safe_places needs initial seeding
  try {
    const checkStmt = db.prepare('SELECT COUNT(*) AS count FROM safe_places');
    const result = checkStmt.get();
    if (result && result.count === 0) {
      let seedLoaded = false;
      for (const sPath of seedCandidates) {
        if (fs.existsSync(sPath)) {
          try {
            const seedSql = fs.readFileSync(sPath, 'utf8');
            db.exec(seedSql);
            seedLoaded = true;
            break;
          } catch {
            // Continue
          }
        }
      }
      if (!seedLoaded) {
        db.exec(embeddedSeedSql);
      }
    }
  } catch (err) {
    console.error('Database initialization error:', err.message);
  }
}

// Auto-initialize upon import
initializeDatabase();

export default db;
