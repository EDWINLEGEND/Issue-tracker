import { UserRole, IssueStatus, IssuePriority } from './constants';

// User Types
export interface User {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Issue Types
export interface Issue {
  _id: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  createdBy: User | string;
  assignedTo?: User | string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateIssueData {
  title: string;
  description: string;
  priority: IssuePriority;
  assignedTo?: string;
  tags?: string[];
}

export interface UpdateIssueData {
  title?: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  assignedTo?: string;
  tags?: string[];
}

// Comment Types
export interface Comment {
  _id: string;
  content: string;
  issueId: string;
  createdBy: User | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentData {
  content: string;
  issueId: string;
}

// Dashboard Types
export interface DashboardStats {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  closedIssues: number;
  myAssignedIssues: number;
  recentActivity: RecentActivity[];
}

export interface RecentActivity {
  _id: string;
  type: 'issue_created' | 'issue_updated' | 'comment_added' | 'issue_assigned';
  message: string;
  user: User;
  issue?: Issue;
  createdAt: Date;
}

// Socket Types
export interface SocketNotification {
  type: 'issue_created' | 'issue_updated' | 'comment_added' | 'issue_assigned';
  message: string;
  data: any;
  timestamp: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query Types
export interface IssueQuery {
  page?: number;
  limit?: number;
  status?: IssueStatus;
  priority?: IssuePriority;
  assignedTo?: string;
  createdBy?: string;
  search?: string;
  tags?: string[];
}