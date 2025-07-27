// 用户相关类型
export interface User {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  role: 'admin' | 'manager' | 'developer' | 'viewer';
  permissions: Permission[];
  department?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  resource: 'tasks' | 'bugs' | 'requirements' | 'sync' | 'users' | 'reports';
  actions: ('create' | 'read' | 'update' | 'delete' | 'sync' | 'export')[];
}

// 任务相关类型
export interface Task {
  id: string;
  title: string;
  type: 'bug' | 'requirement' | 'task' | 'other';
  status: TaskStatus;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignee?: string;
  description?: string;
  dueDate?: string;
  tags: string[];
  sourceId?: string;
  sourceType?: 'lark_bug' | 'lark_requirement' | 'manual' | 'other';
  metadata?: TaskMetadata;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type TaskStatus = 
  | 'pending'
  | 'pending_review'
  | 'in_progress'
  | 'testing'
  | 'resolved'
  | 'completed'
  | 'deployed'
  | 'closed'
  | 'reopened'
  | 'cancelled'
  | 'on_hold'
  | 'cannot_reproduce'
  | 'deferred';

export interface TaskMetadata {
  reporter?: string;
  proposer?: string;
  module?: string;
  severity?: string;
  requirementType?: string;
  estimatedHours?: number;
  actualHours?: number;
  originalStatus?: string;
  originalPriority?: string;
}

// 分页相关类型
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// 统计相关类型
export interface TaskStatistics {
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byType: Record<string, number>;
  overdue: number;
  topAssignees: Array<{ _id: string; count: number }>;
  total: number;
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  roleDistribution: Record<string, number>;
  recentLogins: Array<{
    username: string;
    displayName: string;
    lastLogin: string;
    avatar?: string;
  }>;
}

// 同步相关类型
export interface SyncResult {
  timestamp: string;
  duration: number;
  success: boolean;
  result?: {
    bugs?: {
      synced: number;
      errors: number;
      timestamp: string;
    };
    requirements?: {
      synced: number;
      errors: number;
      timestamp: string;
    };
    total: {
      synced: number;
      errors: number;
    };
  };
  error?: string;
}

export interface SyncStatus {
  isRunning: boolean;
  lastSync: SyncResult | null;
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  averageDuration: number;
}

// 表单相关类型
export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  displayName: string;
  department?: string;
}

export interface TaskForm {
  title: string;
  type: Task['type'];
  status: TaskStatus;
  priority: Task['priority'];
  assignee?: string;
  description?: string;
  dueDate?: string;
  tags: string[];
}

// 响应类型
export interface AuthResponse {
  message: string;
  user: User;
  token: string;
  refreshToken: string;
}

export interface ErrorResponse {
  error: string;
  message?: string;
}