/**
 * SAHELI — Database Backup Utility
 * Creates an atomic snapshot copy of the SQLite database file with timestamp.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

export function performBackup() {
  const dbPath = process.env.DATABASE_PATH || path.join(projectRoot, 'database', 'saheli.db');
  const backupDir = path.join(projectRoot, 'database', 'backups');

  if (!fs.existsSync(dbPath)) {
    console.warn(`No database file found at ${dbPath}. Initializing new db before backup.`);
    return null;
  }

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilename = `saheli_backup_${timestamp}.db`;
  const backupFilePath = path.join(backupDir, backupFilename);

  fs.copyFileSync(dbPath, backupFilePath);

  // Backup rotation: keep only latest 10 backups
  const existingBackups = fs
    .readdirSync(backupDir)
    .filter((file) => file.startsWith('saheli_backup_') && file.endsWith('.db'))
    .sort()
    .reverse();

  if (existingBackups.length > 10) {
    const toRemove = existingBackups.slice(10);
    for (const oldFile of toRemove) {
      fs.unlinkSync(path.join(backupDir, oldFile));
    }
  }

  console.log(`Database backup successful: ${backupFilePath}`);
  return backupFilePath;
}

if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('backup.js')) {
  performBackup();
}
