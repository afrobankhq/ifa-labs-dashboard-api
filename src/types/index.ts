// Common API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

// Dashboard overview types
export interface DashboardOverview {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  completedProjects: number;
  revenue: number;
  growthRate: number;
  lastUpdated: string;
}

// User statistics types
export interface UserType {
  type: string;
  count: number;
  percentage: number;
}

export interface UserStats {
  totalUsers: number;
  newUsersThisMonth: number;
  activeUsers: number;
  inactiveUsers: number;
  userGrowth: number;
  topUserTypes: UserType[];
}

// Project types
export interface Project {
  id: number;
  name: string;
  status: 'completed' | 'in-progress' | 'planning' | 'on-hold';
  progress: number;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  team: string[];
}

export interface ProjectResponse {
  projects: Project[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProjects: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Revenue analytics types
export interface RevenueBreakdown {
  month: string;
  revenue: number;
  growth: number;
}

export interface RevenueSource {
  source: string;
  amount: number;
  percentage: number;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  period: string;
  breakdown: RevenueBreakdown[];
  topRevenueSources: RevenueSource[];
}

// System metrics types
export interface SystemMetrics {
  serverStatus: string;
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  activeConnections: number;
  responseTime: number;
  lastUpdated: string;
}

// Health check types
export interface HealthCheck {
  success: boolean;
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  memory: NodeJS.MemoryUsage;
  platform: string;
  nodeVersion: string;
}

export interface DetailedHealthCheck {
  success: boolean;
  status: string;
  timestamp: string;
  system: {
    uptime: number;
    platform: string;
    arch: string;
    nodeVersion: string;
    memory: NodeJS.MemoryUsage;
    cpu: NodeJS.CpuUsage;
  };
  environment: {
    nodeEnv: string;
    port: string | number;
    corsOrigin: string;
  };
  version: string;
}
