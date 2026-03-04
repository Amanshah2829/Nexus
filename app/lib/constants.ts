/**
 * Application constants
 * Centralized configuration values
 */

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  'super-admin': [
    'manage-tenants',
    'manage-users',
    'view-audit',
    'manage-settings',
    'manage-complaints',
    'manage-assets',
    'manage-integrations',
  ],
  'admin': [
    'manage-users',
    'view-audit',
    'manage-settings',
    'manage-complaints',
    'manage-assets',
    'manage-integrations',
  ],
  'engineer': [
    'create-complaint',
    'update-complaint',
    'view-complaints',
    'view-assets',
    'create-asset',
    'update-asset',
    'view-analytics',
  ],
  'user': [
    'create-complaint',
    'view-own-complaints',
    'view-assets',
  ],
  'viewer': [
    'view-complaints',
    'view-analytics',
    'view-assets',
  ],
};

// Complaint status options
export const COMPLAINT_STATUSES = [
  'created',
  'open',
  'in_progress',
  'resolved',
  'closed',
] as const;

// Complaint priority options
export const COMPLAINT_PRIORITIES = [
  'low',
  'medium',
  'high',
  'critical',
] as const;

// Asset status options
export const ASSET_STATUSES = [
  'active',
  'inactive',
  'maintenance',
  'retired',
] as const;

// Asset categories
export const ASSET_CATEGORIES = [
  'laptop',
  'phone',
  'tablet',
  'monitor',
  'keyboard',
  'mouse',
  'other',
] as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
  COMPLAINTS: {
    LIST: '/api/complaints',
    CREATE: '/api/complaints',
    GET: (id: string) => `/api/complaints/${id}`,
    UPDATE: (id: string) => `/api/complaints/${id}`,
    DELETE: (id: string) => `/api/complaints/${id}`,
    COMMENTS: (id: string) => `/api/complaints/${id}/comments`,
  },
  ASSETS: {
    LIST: '/api/inventory',
    CREATE: '/api/inventory',
    GET: (id: string) => `/api/inventory/${id}`,
    UPDATE: (id: string) => `/api/inventory/${id}`,
    DELETE: (id: string) => `/api/inventory/${id}`,
  },
  SETTINGS: {
    PROFILE: '/api/settings/profile',
    ORGANIZATION: '/api/settings/organization',
    NOTIFICATIONS: '/api/settings/notifications',
    SECURITY: '/api/settings/security',
  },
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// UI Constants
export const UI = {
  TOAST_DURATION: 3000,
  MODAL_ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300,
};

// Session constants
export const SESSION = {
  TIMEOUT_MINUTES: 30,
  REFRESH_THRESHOLD_MINUTES: 5,
  COOKIE_NAME: 'auth-session',
  SECURE: process.env.NODE_ENV === 'production',
};

// Feature flags
export const FEATURES = {
  ENABLE_2FA: true,
  ENABLE_AUDIT_LOGS: true,
  ENABLE_WEBHOOKS: true,
  ENABLE_CUSTOM_FIELDS: true,
  ENABLE_AI_ROUTING: false, // Coming soon
  ENABLE_KNOWLEDGE_BASE: false, // Coming soon
};

// Email constants
export const EMAIL = {
  FROM: process.env.EMAIL_FROM || 'noreply@nexus.app',
  REPLY_TO: process.env.EMAIL_REPLY_TO || 'support@nexus.app',
  MAX_ATTACHMENTS: 5,
  MAX_FILE_SIZE: 25 * 1024 * 1024, // 25MB
};

// Validation constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 12,
  PASSWORD_REGEX: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])/,
  EMAIL_MAX_LENGTH: 254,
  URL_REGEX: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
};

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You are not authorized to perform this action',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  BAD_REQUEST: 'Invalid request',
  INTERNAL_ERROR: 'An internal error occurred',
  INVALID_EMAIL: 'Invalid email address',
  INVALID_PASSWORD: 'Invalid password',
  DUPLICATE_EMAIL: 'Email already registered',
  SESSION_EXPIRED: 'Session expired. Please login again',
  INVALID_TOKEN: 'Invalid or expired token',
};

// Success messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  COMPLAINT_CREATED: 'Complaint created successfully',
  COMPLAINT_UPDATED: 'Complaint updated successfully',
  ASSET_CREATED: 'Asset created successfully',
  ASSET_UPDATED: 'Asset updated successfully',
};

// Time constants (in milliseconds)
export const TIMEOUTS = {
  API_REQUEST: 30000,
  NOTIFICATION_AUTO_DISMISS: 5000,
  SEARCH_DEBOUNCE: 300,
};

// Color mappings
export const COLOR_MAP = {
  'low': '#10b981',
  'medium': '#f59e0b',
  'high': '#ef4444',
  'critical': '#991b1b',
  'active': '#10b981',
  'inactive': '#6b7280',
  'maintenance': '#f59e0b',
  'retired': '#ef4444',
};
