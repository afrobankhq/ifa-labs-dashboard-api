import { 
  CollectionReference,
  DocumentReference,
  DocumentSnapshot,
  QuerySnapshot,
  Query,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp
} from 'firebase-admin/firestore';
import { db } from '../config/firebase';
import { 
  User, 
  Project, 
  Revenue, 
  SystemMetric, 
  ApiRequestLog, 
  DashboardOverview, 
  UserStats, 
  RevenueAnalytics,
  COLLECTIONS,
  QueryConstraint
} from '../types/firebase';

// Base Firebase service class
export abstract class BaseFirebaseService<T> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  // Create a new document
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docData = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await db.collection(this.collectionName).add(docData);
    return docRef.id;
  }

  // Get a document by ID
  async getById(id: string): Promise<T | null> {
    const docRef = db.collection(this.collectionName).doc(id);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  }

  // Update a document
  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<void> {
    const docRef = db.collection(this.collectionName).doc(id);
    const updateData = {
      ...data,
      updatedAt: Timestamp.now()
    };
    
    await docRef.update(updateData);
  }

  // Delete a document
  async delete(id: string): Promise<void> {
    const docRef = db.collection(this.collectionName).doc(id);
    await docRef.delete();
  }

  // Get all documents with optional query constraints
  async getAll(constraints: QueryConstraint[] = []): Promise<T[]> {
    let q: Query = db.collection(this.collectionName);
    
    // Apply constraints
    constraints.forEach(constraint => {
      if (constraint.type === 'where' && constraint.field) {
        q = q.where(constraint.field, constraint.op || '==', constraint.value);
      } else if (constraint.type === 'orderBy' && constraint.field) {
        q = q.orderBy(constraint.field, constraint.direction || 'asc');
      } else if (constraint.type === 'limit') {
        q = q.limit(constraint.limit || 100);
      }
    });
    
    const querySnapshot = await q.get();
    
    return querySnapshot.docs.map((doc: DocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  }

  // Get documents with pagination
  async getPaginated(
    pageSize: number = 10,
    lastDoc?: QueryDocumentSnapshot<DocumentData>,
    constraints: QueryConstraint[] = []
  ): Promise<{ data: T[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
    let q: Query = db.collection(this.collectionName);
    
    // Apply constraints
    constraints.forEach(constraint => {
      if (constraint.type === 'where' && constraint.field) {
        q = q.where(constraint.field, constraint.op || '==', constraint.value);
      } else if (constraint.type === 'orderBy' && constraint.field) {
        q = q.orderBy(constraint.field, constraint.direction || 'asc');
      }
    });
    
    q = q.limit(pageSize);
    
    if (lastDoc) {
      q = q.startAfter(lastDoc);
    }
    
    const querySnapshot = await q.get();
    const docs = querySnapshot.docs;
    
    return {
      data: docs.map((doc: DocumentSnapshot) => ({ id: doc.id, ...doc.data() })) as T[],
      lastDoc: docs.length > 0 ? docs[docs.length - 1] : null
    };
  }
}

// User service
export class UserService extends BaseFirebaseService<User> {
  constructor() {
    super(COLLECTIONS.USERS);
  }

  async getByEmail(email: string): Promise<User | null> {
    const users = await this.getAll([{ type: 'where', field: 'email', op: '==', value: email }]);
    return users.length > 0 ? users[0] : null;
  }

  async getActiveUsers(): Promise<User[]> {
    return this.getAll([{ type: 'where', field: 'isActive', op: '==', value: true }]);
  }

  async getUsersByRole(role: User['role']): Promise<User[]> {
    return this.getAll([{ type: 'where', field: 'role', op: '==', value: role }]);
  }

  async getUsersBySubscription(plan: User['subscriptionPlan']): Promise<User[]> {
    return this.getAll([{ type: 'where', field: 'subscriptionPlan', op: '==', value: plan }]);
  }

  async updateApiRequestCount(userId: string, increment: number = 1): Promise<void> {
    const user = await this.getById(userId);
    if (user) {
      const newCount = user.apiRequestsCount + increment;
      await this.update(userId, { apiRequestsCount: newCount });
    }
  }
}

// Project service
export class ProjectService extends BaseFirebaseService<Project> {
  constructor() {
    super(COLLECTIONS.PROJECTS);
  }

  async getByStatus(status: Project['status']): Promise<Project[]> {
    return this.getAll([{ type: 'where', field: 'status', op: '==', value: status }]);
  }

  async getByOwner(ownerId: string): Promise<Project[]> {
    return this.getAll([{ type: 'where', field: 'ownerId', op: '==', value: ownerId }]);
  }

  async getByPriority(priority: Project['priority']): Promise<Project[]> {
    return this.getAll([{ type: 'where', field: 'priority', op: '==', value: priority }]);
  }

  async getProjectsByTeamMember(teamMember: string): Promise<Project[]> {
    return this.getAll([{ type: 'where', field: 'team', op: 'array-contains', value: teamMember }]);
  }

  async getProjectsByDateRange(startDate: Date, endDate: Date): Promise<Project[]> {
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    
    return this.getAll([
      { type: 'where', field: 'startDate', op: '>=', value: startTimestamp },
      { type: 'where', field: 'endDate', op: '<=', value: endTimestamp }
    ]);
  }
}

// Revenue service
export class RevenueService extends BaseFirebaseService<Revenue> {
  constructor() {
    super(COLLECTIONS.REVENUE);
  }

  async getByMonth(month: string, year: number): Promise<Revenue[]> {
    return this.getAll([
      { type: 'where', field: 'month', op: '==', value: month },
      { type: 'where', field: 'year', op: '==', value: year }
    ]);
  }

  async getBySource(source: string): Promise<Revenue[]> {
    return this.getAll([{ type: 'where', field: 'source', op: '==', value: source }]);
  }

  async getByCategory(category: string): Promise<Revenue[]> {
    return this.getAll([{ type: 'where', field: 'category', op: '==', value: category }]);
  }

  async getTotalRevenueByPeriod(month: string, year: number): Promise<number> {
    const revenues = await this.getByMonth(month, year);
    return revenues.reduce((total, revenue) => total + revenue.amount, 0);
  }
}

// System metrics service
export class SystemMetricsService extends BaseFirebaseService<SystemMetric> {
  constructor() {
    super(COLLECTIONS.SYSTEM_METRICS);
  }

  async getByType(metricType: SystemMetric['metricType']): Promise<SystemMetric[]> {
    return this.getAll([
      { type: 'where', field: 'metricType', op: '==', value: metricType },
      { type: 'orderBy', field: 'timestamp', direction: 'desc' }
    ]);
  }

  async getByServer(serverId: string): Promise<SystemMetric[]> {
    return this.getAll([
      { type: 'where', field: 'serverId', op: '==', value: serverId },
      { type: 'orderBy', field: 'timestamp', direction: 'desc' }
    ]);
  }

  async getLatestMetrics(limitCount: number = 100): Promise<SystemMetric[]> {
    return this.getAll([
      { type: 'orderBy', field: 'timestamp', direction: 'desc' },
      { type: 'limit', limit: limitCount }
    ]);
  }
}

// API logs service
export class ApiLogsService extends BaseFirebaseService<ApiRequestLog> {
  constructor() {
    super(COLLECTIONS.API_LOGS);
  }

  async getByUser(userId: string): Promise<ApiRequestLog[]> {
    return this.getAll([
      { type: 'where', field: 'userId', op: '==', value: userId },
      { type: 'orderBy', field: 'timestamp', direction: 'desc' }
    ]);
  }

  async getByEndpoint(endpoint: string): Promise<ApiRequestLog[]> {
    return this.getAll([
      { type: 'where', field: 'endpoint', op: '==', value: endpoint },
      { type: 'orderBy', field: 'timestamp', direction: 'desc' }
    ]);
  }

  async getByStatusCode(statusCode: number): Promise<ApiRequestLog[]> {
    return this.getAll([
      { type: 'where', field: 'statusCode', op: '==', value: statusCode },
      { type: 'orderBy', field: 'timestamp', direction: 'desc' }
    ]);
  }

  async getRecentLogs(limitCount: number = 100): Promise<ApiRequestLog[]> {
    return this.getAll([
      { type: 'orderBy', field: 'timestamp', direction: 'desc' },
      { type: 'limit', limit: limitCount }
    ]);
  }
}

// Dashboard overview service
export class DashboardOverviewService extends BaseFirebaseService<DashboardOverview> {
  constructor() {
    super(COLLECTIONS.DASHBOARD_OVERVIEW);
  }

  async getLatestOverview(): Promise<DashboardOverview | null> {
    const overviews = await this.getAll([
      { type: 'orderBy', field: 'createdAt', direction: 'desc' },
      { type: 'limit', limit: 1 }
    ]);
    
    return overviews.length > 0 ? overviews[0] : null;
  }

  async getByPeriod(period: string): Promise<DashboardOverview[]> {
    return this.getAll([{ type: 'where', field: 'period', op: '==', value: period }]);
  }
}

// User stats service
export class UserStatsService extends BaseFirebaseService<UserStats> {
  constructor() {
    super(COLLECTIONS.USER_STATS);
  }

  async getLatestStats(): Promise<UserStats | null> {
    const stats = await this.getAll([
      { type: 'orderBy', field: 'createdAt', direction: 'desc' },
      { type: 'limit', limit: 1 }
    ]);
    
    return stats.length > 0 ? stats[0] : null;
  }
}

// Revenue analytics service
export class RevenueAnalyticsService extends BaseFirebaseService<RevenueAnalytics> {
  constructor() {
    super(COLLECTIONS.REVENUE_ANALYTICS);
  }

  async getByPeriod(period: string): Promise<RevenueAnalytics[]> {
    return this.getAll([{ type: 'where', field: 'period', op: '==', value: period }]);
  }

  async getLatestAnalytics(): Promise<RevenueAnalytics | null> {
    const analytics = await this.getAll([
      { type: 'orderBy', field: 'createdAt', direction: 'desc' },
      { type: 'limit', limit: 1 }
    ]);
    
    return analytics.length > 0 ? analytics[0] : null;
  }
}

// Export all services
export const userService = new UserService();
export const projectService = new ProjectService();
export const revenueService = new RevenueService();
export const systemMetricsService = new SystemMetricsService();
export const apiLogsService = new ApiLogsService();
export const dashboardOverviewService = new DashboardOverviewService();
export const userStatsService = new UserStatsService();
export const revenueAnalyticsService = new RevenueAnalyticsService();
