import { Timestamp } from 'firebase-admin/firestore';

// Base interface for all Firebase documents
export interface FirebaseDocument {
  id?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// User model
export interface User extends FirebaseDocument {
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'user' | 'moderator';
  isActive: boolean;
  lastLoginAt: Timestamp;
  subscriptionPlan: 'free' | 'developer' | 'professional' | 'enterprise';
  apiRequestsCount: number;
  apiRequestsLimit: number;
}

// Project model
export interface Project extends FirebaseDocument {
  name: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planning' | 'on-hold';
  progress: number;
  startDate: Timestamp;
  endDate: Timestamp;
  budget: number;
  spent: number;
  team: string[];
  ownerId: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// Revenue model
export interface Revenue extends FirebaseDocument {
  amount: number;
  currency: string;
  source: string;
  month: string;
  year: number;
  category: string;
  description?: string;
}

// System metrics model
export interface SystemMetric extends FirebaseDocument {
  metricType: 'cpu' | 'memory' | 'disk' | 'network' | 'api_requests';
  value: number;
  unit: string;
  timestamp: Timestamp;
  serverId: string;
}

// API request log model
export interface ApiRequestLog extends FirebaseDocument {
  userId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  userAgent: string;
  ipAddress: string;
  requestBody?: any;
  responseBody?: any;
}

// Dashboard overview model
export interface DashboardOverview extends FirebaseDocument {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  completedProjects: number;
  totalRevenue: number;
  growthRate: number;
  period: string;
}

// User statistics model
export interface UserStats extends FirebaseDocument {
  totalUsers: number;
  newUsersThisMonth: number;
  activeUsers: number;
  inactiveUsers: number;
  userGrowth: number;
  topUserTypes: {
    type: string;
    count: number;
    percentage: number;
  }[];
}

// Revenue analytics model
export interface RevenueAnalytics extends FirebaseDocument {
  totalRevenue: number;
  period: string;
  breakdown: {
    month: string;
    revenue: number;
    growth: number;
  }[];
  topRevenueSources: {
    source: string;
    amount: number;
    percentage: number;
  }[];
}

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  PROJECTS: 'projects',
  REVENUE: 'revenue',
  SYSTEM_METRICS: 'system_metrics',
  API_LOGS: 'api_logs',
  DASHBOARD_OVERVIEW: 'dashboard_overview',
  USER_STATS: 'user_stats',
  REVENUE_ANALYTICS: 'revenue_analytics'
} as const;

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];
