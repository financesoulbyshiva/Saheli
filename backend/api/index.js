/**
 * Standalone Backend Vercel Serverless Function entry point
 */
import { handleRequest, server } from '../src/server.js';

export default async function handler(req, res) {
  if (typeof handleRequest === 'function') {
    return handleRequest(req, res);
  }
  return server.emit('request', req, res);
}
