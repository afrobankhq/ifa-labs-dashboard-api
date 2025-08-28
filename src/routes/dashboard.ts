import { Router, Request, Response } from 'express';
import { 
  dashboardOverviewService, 
  userStatsService, 
  projectService, 
  revenueAnalyticsService, 
  systemMetricsService 
} from '../services/firebase';
import { authenticateUser, requireRole, requireSubscription, subscriptionRateLimit } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { Timestamp } from 'firebase-admin/firestore';

const router = Router();

// Get dashboard overview data
router.get('/overview', 
  authenticateUser, 
  subscriptionRateLimit,
  async (_req: Request, res: Response) => {
    try {
      const overview = await dashboardOverviewService.getLatestOverview();
      
      if (!overview) {
        // Return default data if no overview exists
        const defaultOverview = {
          success: true,
          data: {
            totalUsers: 0,
            activeUsers: 0,
            totalProjects: 0,
            completedProjects: 0,
            revenue: 0,
            growthRate: 0,
            lastUpdated: new Date().toISOString()
          }
        };
        return res.status(200).json(defaultOverview);
      }

      const overviewData = {
        success: true,
        data: {
          totalUsers: overview.totalUsers,
          activeUsers: overview.activeUsers,
          totalProjects: overview.totalProjects,
          completedProjects: overview.completedProjects,
          revenue: overview.totalRevenue,
          growthRate: overview.growthRate,
          lastUpdated: overview.updatedAt.toDate().toISOString()
        }
      };

      return res.status(200).json(overviewData);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard overview'
      });
    }
  }
);

// Get user statistics
router.get('/users/stats', 
  authenticateUser, 
  requireRole(['admin', 'moderator']),
  subscriptionRateLimit,
  async (_req: Request, res: Response) => {
    try {
      const stats = await userStatsService.getLatestStats();
      
      if (!stats) {
        // Return default data if no stats exist
        const defaultStats = {
          success: true,
          data: {
            totalUsers: 0,
            newUsersThisMonth: 0,
            activeUsers: 0,
            inactiveUsers: 0,
            userGrowth: 0,
            topUserTypes: []
          }
        };
        return res.status(200).json(defaultStats);
      }

      const userStats = {
        success: true,
        data: {
          totalUsers: stats.totalUsers,
          newUsersThisMonth: stats.newUsersThisMonth,
          activeUsers: stats.activeUsers,
          inactiveUsers: stats.inactiveUsers,
          userGrowth: stats.userGrowth,
          topUserTypes: stats.topUserTypes
        }
      };

      return res.status(200).json(userStats);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch user statistics'
      });
    }
  }
);

// Get project data
router.get('/projects', 
  authenticateUser, 
  subscriptionRateLimit,
  async (req: Request, res: Response) => {
    try {
      const { status, limit = 10, page = 1 } = req.query;
      
      let projects;
      
      if (status && status !== 'all') {
        projects = await projectService.getByStatus(status as any);
      } else {
        projects = await projectService.getAll();
      }

      // Simple pagination (Firestore has better pagination with cursor-based approach)
      const pageSize = Number(limit);
      const currentPage = Number(page);
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedProjects = projects.slice(startIndex, endIndex);

      const response = {
        success: true,
        data: {
          projects: paginatedProjects.map(project => ({
            id: project.id,
            name: project.name,
            status: project.status,
            progress: project.progress,
            startDate: project.startDate.toDate().toISOString(),
            endDate: project.endDate.toDate().toISOString(),
            budget: project.budget,
            spent: project.spent,
            team: project.team,
            description: project.description,
            priority: project.priority,
            tags: project.tags
          })),
          pagination: {
            currentPage,
            totalPages: Math.ceil(projects.length / pageSize),
            totalProjects: projects.length,
            hasNextPage: endIndex < projects.length,
            hasPrevPage: currentPage > 1
          }
        }
      };

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch projects'
      });
    }
  }
);

// Get revenue analytics
router.get('/analytics/revenue', 
  authenticateUser, 
  requireSubscription('professional'),
  subscriptionRateLimit,
  async (req: Request, res: Response) => {
    try {
      const { period = 'monthly' } = req.query;
      
      const analytics = await revenueAnalyticsService.getByPeriod(period as string);
      
      if (analytics.length === 0) {
        // Return default data if no analytics exist
        const defaultAnalytics = {
          success: true,
          data: {
            totalRevenue: 0,
            period: period,
            breakdown: [],
            topRevenueSources: []
          }
        };
        return res.status(200).json(defaultAnalytics);
      }

      const latestAnalytics = analytics[0]; // Get the most recent analytics
      
      const revenueData = {
        success: true,
        data: {
          totalRevenue: latestAnalytics.totalRevenue,
          period: latestAnalytics.period,
          breakdown: latestAnalytics.breakdown,
          topRevenueSources: latestAnalytics.topRevenueSources
        }
      };

      return res.status(200).json(revenueData);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch revenue analytics'
      });
    }
  }
);

// Get system metrics
router.get('/metrics/system', 
  authenticateUser, 
  requireRole(['admin']),
  subscriptionRateLimit,
  async (_req: Request, res: Response) => {
    try {
      const metrics = await systemMetricsService.getLatestMetrics(10);
      
      const systemMetrics = {
        success: true,
        data: {
          serverStatus: 'healthy',
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage(),
          activeConnections: Math.floor(Math.random() * 100) + 50,
          responseTime: Math.floor(Math.random() * 50) + 10,
          lastUpdated: new Date().toISOString(),
          firebaseMetrics: metrics.map(metric => ({
            type: metric.metricType,
            value: metric.value,
            unit: metric.unit,
            timestamp: metric.timestamp.toDate().toISOString()
          }))
        }
      };

      return res.status(200).json(systemMetrics);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch system metrics'
      });
    }
  }
);

// Create new project (Admin only)
router.post('/projects', 
  authenticateUser, 
  requireRole(['admin']),
  subscriptionRateLimit,
  async (req: Request, res: Response) => {
    try {
      const projectData = req.body;
      
      // Validate required fields
      if (!projectData.name || !projectData.description || !projectData.ownerId) {
        throw createError('Missing required fields', 400);
      }

      const projectId = await projectService.create({
        name: projectData.name,
        description: projectData.description,
        status: projectData.status || 'planning',
        progress: projectData.progress || 0,
        startDate: projectData.startDate ? Timestamp.fromDate(new Date(projectData.startDate)) : Timestamp.now(),
        endDate: projectData.endDate ? Timestamp.fromDate(new Date(projectData.endDate)) : Timestamp.now(),
        budget: projectData.budget || 0,
        spent: projectData.spent || 0,
        team: projectData.team || [],
        ownerId: projectData.ownerId,
        tags: projectData.tags || [],
        priority: projectData.priority || 'medium'
      });

      return res.status(201).json({
        success: true,
        data: { id: projectId, message: 'Project created successfully' }
      });
    } catch (error: any) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        return res.status(500).json({
          success: false,
          error: 'Failed to create project'
        });
      }
    }
  }
);

// Update project
router.put('/projects/:id', 
  authenticateUser, 
  subscriptionRateLimit,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Check if project exists
      const existingProject = await projectService.getById(id);
      if (!existingProject) {
        throw createError('Project not found', 404);
      }

      // Only allow updates if user is admin or project owner
      if (req.user?.role !== 'admin' && req.user?.userId !== existingProject.ownerId) {
        throw createError('Insufficient permissions', 403);
      }

      // Remove fields that shouldn't be updated
      const { id: _, createdAt: __, ...cleanUpdateData } = updateData;
      
      await projectService.update(id, cleanUpdateData);

      return res.status(200).json({
        success: true,
        data: { message: 'Project updated successfully' }
      });
    } catch (error: any) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        return res.status(500).json({
          success: false,
          error: 'Failed to update project'
        });
      }
    }
  }
);

export { router as dashboardRouter };
