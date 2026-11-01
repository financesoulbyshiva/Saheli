# SAHELI — Database Reliability, Backup & Disaster Recovery Guide

## 1. Storage Architecture
* **Primary Engine:** SQLite via Node.js native `node:sqlite` (ACID compliant).
* **Write Mode:** WAL (`Write-Ahead Logging`) mode enabled for maximum concurrent read performance during writes.
* **Integrity:** `PRAGMA foreign_keys = ON;` is enforced on every connection.
* **Storage Location:** `database/saheli.db` (Configurable via `DATABASE_PATH` environment variable).

---

## 2. Backup Strategy & Automation
* **Backup Utility:** [`backend/src/db/backup.js`](file:///c:/Users/Shivprasad/Desktop/PROJECTS/SAHELI/backend/src/db/backup.js)
* **Execution:** Run via `npm run db:backup` or configure a cron job (e.g., daily at 02:00 AM UTC).
* **Destination:** `database/backups/`
* **Naming Convention:** `saheli_backup_YYYY-MM-DDTHH-mm-ss-sssZ.db`
* **Retention Policy:** Automated FIFO rotation preserves the latest 10 backup archives.

---

## 3. Restoration Procedure
In the event of database corruption or hardware failover:

1. Stop the application backend service:
   ```bash
   # Terminate the server process
   ```
2. Locate the most recent healthy backup in `database/backups/`.
3. Move or rename the corrupted active database:
   ```bash
   mv database/saheli.db database/saheli_corrupt.db
   rm -f database/saheli.db-wal database/saheli.db-shm
   ```
4. Restore from the chosen backup:
   ```bash
   cp database/backups/saheli_backup_YYYY-MM-DDTHH-mm-ss-sssZ.db database/saheli.db
   ```
5. Run the verification test suite to ensure schema and data integrity:
   ```bash
   npm test
   ```
6. Restart the backend API server.
