// Firebase query constraint types
export interface QueryConstraint {
  type: 'where' | 'orderBy' | 'limit';
  field?: string; // Optional for limit constraints
  op?: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'array-contains-any' | 'in' | 'not-in';
  value?: any;
  direction?: 'asc' | 'desc';
  limit?: number;
}

// Firebase document data types
export interface FirebaseDocument {
  id?: string;
  createdAt: any;
  updatedAt: any;
}

// User types
export interface User extends FirebaseDocument {
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'user' | 'moderator';
  isActive: boolean;
  lastLoginAt: any;
  subscriptionPlan: 'free' | 'developer' | 'professional' | 'enterprise';
  apiRequestsCount: number;
  apiRequestsLimit: number;
  // New authentication fields
  password?: string; // Hashed password
  isEmailVerified: boolean;
  emailVerificationOTP?: string;
  emailVerificationExpiresAt?: any;
  loginOTP?: string;
  loginOTPExpiresAt?: any;
  passwordResetOTP?: string;
  passwordResetExpiresAt?: any;
  failedLoginAttempts: number;
  lastFailedLoginAt?: any;
  accountLockedUntil?: any;
}

// OTP verification types
export interface OTPVerification {
  id?: string;
  email: string;
  otp: string;
  purpose: 'signup' | 'login' | 'password-reset';
  expiresAt: any;
  isUsed: boolean;
  createdAt: any;
}

// Session types
export interface UserSession {
  id?: string;
  userId: string;
  token: string;
  expiresAt: any;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  createdAt: any;
}

// Project types
export interface Project extends FirebaseDocument {
  name: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planning' | 'on-hold';
  progress: number;
  startDate: any;
  endDate: any;
  budget: number;
  spent: number;
  team: string[];
  ownerId: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// Revenue types
export interface Revenue extends FirebaseDocument {
  amount: number;
  currency: string;
  source: string;
  month: string;
  year: number;
  category: string;
  description?: string;
}

// System metrics types
export interface SystemMetric extends FirebaseDocument {
  metricType: 'cpu' | 'memory' | 'disk' | 'network' | 'api_requests';
  value: number;
  unit: string;
  timestamp: any;
  serverId: string;
}

// API request log types
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

// Dashboard overview types
export interface DashboardOverview extends FirebaseDocument {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  completedProjects: number;
  totalRevenue: number;
  growthRate: number;
  period: string;
}

// User statistics types
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

// Revenue analytics types
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
  REVENUE_ANALYTICS: 'revenue_analytics',
  OTP_VERIFICATIONS: 'otp_verifications',
  USER_SESSIONS: 'user_sessions'
} as const;

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];
