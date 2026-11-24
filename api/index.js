/**
 * SAHELI — Vercel Serverless API Gateway
 * Directs all /api requests to the core backend handler.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Ensure environment variables are loaded on Vercel Serverless
try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const envCandidates = [
    path.resolve(__dirname, '../.env'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '../.env.example'),
    path.resolve(process.cwd(), '.env.example'),
  ];
  for (const envPath of envCandidates) {
    if (fs.existsSync(envPath)) {
      try {
        if (typeof process.loadEnvFile === 'function') process.loadEnvFile(envPath);
        const content = fs.readFileSync(envPath, 'utf8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx <= 0) continue;
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key] && val) {
            process.env[key] = val;
          }
        }
      } catch {}
    }
    if (process.env.SMTP_USER && process.env.JWT_SECRET) break;
  }
} catch {}

import { handleRequest, server } from '../backend/src/server.js';

export default async function handler(req, res) {
  if (typeof handleRequest === 'function') {
    return handleRequest(req, res);
  }
  return server.emit('request', req, res);
}
