import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/firebase';
import { createError } from './errorHandler';
import JWTService from '../services/jwtService';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
        subscriptionPlan: string;
      };
    }
  }
}

// JWT authentication middleware
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('No token provided', 401);
    }

    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      throw createError('Invalid token format', 401);
    }

    // Verify JWT token
    const decodedToken = JWTService.verifyToken(token);
    
    if (!decodedToken) {
      throw createError('Invalid or expired token', 401);
    }

    // Check if token is expired
    if (JWTService.isTokenExpired(token)) {
      throw createError('Token has expired', 401);
    }

    // Get user from Firestore
    const user = await userService.getById(decodedToken.userId);
    
    if (!user) {
      throw createError('User not found', 404);
    }

    if (!user.isActive) {
      throw createError('User account is inactive', 403);
    }

    // Add user info to request
    req.user = {
      userId: decodedToken.userId,
      email: decodedToken.email,
      role: decodedToken.role,
      subscriptionPlan: decodedToken.subscriptionPlan
    };

    next();
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
    } else {
      next(createError('Authentication failed', 401));
    }
  }
};

// Role-based access control middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(createError('Authentication required', 401));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(createError('Insufficient permissions', 403));
      return;
    }

    next();
  };
};

// Subscription plan middleware
export const requireSubscription = (requiredPlan: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(createError('Authentication required', 401));
      return;
    }

    const planHierarchy = {
      'free': 0,
      'developer': 1,
      'professional': 2,
      'enterprise': 3
    };

    const userPlanLevel = planHierarchy[req.user.subscriptionPlan as keyof typeof planHierarchy] || 0;
    const requiredPlanLevel = planHierarchy[requiredPlan as keyof typeof planHierarchy] || 0;

    if (userPlanLevel < requiredPlanLevel) {
      next(createError('Higher subscription plan required', 403));
      return;
    }

    next();
  };
};

// Rate limiting middleware based on subscription plan
export const subscriptionRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      next(createError('Authentication required', 401));
      return;
    }

    // Get current API request count
    const user = await userService.getById(req.user.userId);
    
    if (!user) {
      next(createError('User not found', 404));
      return;
    }

    // Check if user has exceeded their API request limit
    if (user.apiRequestsCount >= user.apiRequestsLimit) {
      next(createError('API request limit exceeded', 429));
      return;
    }

    // Increment API request count
    await userService.updateApiRequestCount(req.user.userId, 1);

    next();
  } catch (error) {
    next(error);
  }
};

// Optional authentication middleware (for endpoints that can work with or without auth)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      next();
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      next();
      return;
    }

    // Verify JWT token
    const decodedToken = JWTService.verifyToken(token);
    
    if (!decodedToken) {
      next();
      return;
    }

    // Check if token is expired
    if (JWTService.isTokenExpired(token)) {
      next();
      return;
    }

    // Get user from Firestore
    const user = await userService.getById(decodedToken.userId);
    
    if (user && user.isActive) {
      // Add user info to request
      req.user = {
        userId: decodedToken.userId,
        email: decodedToken.email,
        role: decodedToken.role,
        subscriptionPlan: decodedToken.subscriptionPlan
      };
    }

    next();
  } catch (error) {
    // If authentication fails, continue without user
    next();
  }
};
