/**
 * Centralized type definitions for the entire application
 */

// User & Auth Types
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super-admin' | 'admin' | 'engineer' | 'user' | 'viewer';
  tenant: string;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Session {
  userId: string;
  email: string;
  role: string;
  tenant: string;
  isAuthenticated: boolean;
}

// Complaint/Ticket Types
export interface Complaint {
  _id: string;
  id: string;
  ticketNumber: string;
  tenant: string;
  title: string;
  description: string;
  status: 'created' | 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  reporter: string;
  reporterEmail: string;
  assignedTo?: string;
  attachments: string[];
  comments: Comment[];
  history: HistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: string;
  authorName: string;
  isInternal: boolean;
  attachments: string[];
  mentions: string[];
  createdAt: Date;
}

export interface HistoryEntry {
  action: string;
  userId: string;
  timestamp: Date;
  details?: Record<string, any>;
}

// Inventory/Asset Types
export interface Asset {
  _id: string;
  name: string;
  serialNumber: string;
  category: 'laptop' | 'phone' | 'tablet' | 'monitor' | 'keyboard' | 'mouse' | 'other';
  status: 'active' | 'inactive' | 'maintenance' | 'retired';
  tenant: string;
  assignedTo?: string;
  location?: string;
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  cost?: number;
  customFields?: Record<string, any>;
  attachments: string[];
  maintenanceHistory: MaintenanceRecord[];
  auditTrail: AuditEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceRecord {
  date: Date;
  type: string;
  description: string;
  cost?: number;
  vendor?: string;
  nextScheduled?: Date;
}

export interface AuditEntry {
  timestamp: Date;
  action: string;
  userId: string;
  changes: Record<string, any>;
}

// Settings Types
export interface TenantSettings {
  _id: string;
  tenant: string;
  emailSignature: string;
  logo?: string;
  brandColor?: string;
  emailNotifications: EmailNotificationSettings;
  securitySettings: SecuritySettings;
  customFields: CustomField[];
  automationRules: AutomationRule[];
}

export interface EmailNotificationSettings {
  complaintCreated: boolean;
  complaintAssigned: boolean;
  complaintClosed: boolean;
  weeklyDigest: boolean;
  dailySummary: boolean;
}

export interface SecuritySettings {
  twoFactorRequired: boolean;
  sessionTimeout: number;
  ipWhitelist: string[];
  passwordPolicy: {
    minLength: number;
    requireSpecialChars: boolean;
    requireNumbers: boolean;
  };
}

export interface CustomField {
  name: string;
  type: 'text' | 'number' | 'select' | 'date';
  options?: string[];
  required: boolean;
}

export interface AutomationRule {
  name: string;
  trigger: string;
  condition: Record<string, any>;
  action: string;
  enabled: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Notification Types
export interface Notification {
  _id: string;
  userId: string;
  type: 'complaint' | 'assignment' | 'system' | 'mention';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

// Dashboard Statistics
export interface DashboardStats {
  totalComplaints: number;
  openComplaints: number;
  avgResolutionTime: number;
  customerSatisfaction: number;
  totalAssets: number;
  assetUtilization: number;
}

// Export all types
export type * from './complaint-types';
export type * from './asset-types';
export type * from './user-types';
