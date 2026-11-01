/**
 * SAHELI Backend — Runtime Configuration
 */
export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET || 'saheli-production-safety-secret-key-2026',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  databasePath: process.env.DATABASE_PATH || 'database/saheli.db',
};
