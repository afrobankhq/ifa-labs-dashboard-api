import { Router, Request, Response } from 'express';

const router = Router();

// Health check endpoint
router.get('/', (req: Request, res: Response) => {
  const healthData = {
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    memory: process.memoryUsage(),
    platform: process.platform,
    nodeVersion: process.version
  };

  res.status(200).json(healthData);
});

// Detailed health check
router.get('/detailed', (req: Request, res: Response) => {
  const detailedHealth = {
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    system: {
      uptime: process.uptime(),
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3001,
      corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
    },
    version: '1.0.0'
  };

  res.status(200).json(detailedHealth);
});

export { router as healthRouter };
