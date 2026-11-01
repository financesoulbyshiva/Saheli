/**
 * SAHELI — Vercel Serverless API Gateway
 * Directs all /api requests to the core backend handler.
 */

import { handleRequest, server } from '../backend/src/server.js';

export default async function handler(req, res) {
  if (typeof handleRequest === 'function') {
    return handleRequest(req, res);
  }
  return server.emit('request', req, res);
}
