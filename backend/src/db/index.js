import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

const isTest = process.env.NODE_ENV === 'test';
const dbPath = isTest
  ? ':memory:'
  : process.env.DATABASE_PATH || path.join(projectRoot, 'database', 'saheli.db');

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

// Initialize schema and seed data
export function initializeDatabase() {
  const schemaPath = path.join(projectRoot, 'database', 'schema', 'schema.sql');
  const seedPath = path.join(projectRoot, 'database', 'seed', 'seed.sql');

  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
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
    if (result && result.count === 0 && fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      db.exec(seedSql);
    }
  } catch (err) {
    console.error('Database initialization error:', err.message);
  }
}

// Auto-initialize upon import
initializeDatabase();

export default db;
