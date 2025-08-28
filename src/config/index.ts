import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3001'),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
  security: {
    helmet: process.env.HELMET_ENABLED !== 'false',
    compression: process.env.COMPRESSION_ENABLED !== 'false',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    morganFormat: process.env.MORGAN_FORMAT || 'combined',
  },
  api: {
    version: '1.0.0',
    basePath: '/api',
  },
} as const;

export default config;
