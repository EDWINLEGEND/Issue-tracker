// User Roles
export enum UserRole {
  ADMIN = 'admin',
  CONTRIBUTOR = 'contributor',
  VIEWER = 'viewer'
}

// Issue Status
export enum IssueStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

// Issue Priority
export enum IssuePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Socket Events
export const SOCKET_EVENTS = {
  // Connection
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  
  // Issues
  ISSUE_CREATED: 'issue:created',
  ISSUE_UPDATED: 'issue:updated',
  ISSUE_STATUS_CHANGED: 'issue:status_changed',
  ISSUE_ASSIGNED: 'issue:assigned',
  
  // Comments
  COMMENT_ADDED: 'comment:added',
  COMMENT_UPDATED: 'comment:updated',
  COMMENT_DELETED: 'comment:deleted',
  
  // Notifications
  NOTIFICATION: 'notification',
  
  // Rooms
  JOIN_ISSUE: 'join:issue',
  LEAVE_ISSUE: 'leave:issue'
} as const;

// API Routes
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    REFRESH: '/auth/refresh'
  },
  ISSUES: {
    BASE: '/issues',
    BY_ID: (id: string) => `/issues/${id}`,
    ASSIGN: (id: string) => `/issues/${id}/assign`,
    STATUS: (id: string) => `/issues/${id}/status`
  },
  COMMENTS: {
    BASE: '/comments',
    BY_ISSUE: (issueId: string) => `/comments/issue/${issueId}`,
    BY_ID: (id: string) => `/comments/${id}`
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    RECENT: '/dashboard/recent'
  }
} as const;

// Status Colors for UI
export const STATUS_COLORS = {
  [IssueStatus.OPEN]: 'bg-blue-100 text-blue-800',
  [IssueStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
  [IssueStatus.RESOLVED]: 'bg-green-100 text-green-800',
  [IssueStatus.CLOSED]: 'bg-gray-100 text-gray-800'
} as const;

// Priority Colors for UI
export const PRIORITY_COLORS = {
  [IssuePriority.LOW]: 'bg-gray-100 text-gray-800',
  [IssuePriority.MEDIUM]: 'bg-blue-100 text-blue-800',
  [IssuePriority.HIGH]: 'bg-orange-100 text-orange-800',
  [IssuePriority.URGENT]: 'bg-red-100 text-red-800'
} as const;