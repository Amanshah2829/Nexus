import { z } from 'zod';

// Auth Schemas
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const SignupSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^a-zA-Z0-9]/, 'Must contain special character'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'First name too short').max(50),
  lastName: z.string().min(2, 'Last name too short').max(50),
  organizationName: z.string().min(2, 'Organization name too short').max(100),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const PasswordResetSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
});

export const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^a-zA-Z0-9]/, 'Must contain special character'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Complaint Schemas
export const CreateComplaintSchema = z.object({
  title: z.string().min(5, 'Title too short').max(200),
  description: z.string().min(20, 'Description too short').max(5000),
  category: z.enum(['technical', 'billing', 'account', 'feature_request', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  attachments: z.array(z.string().url()).optional(),
  templateId: z.string().optional(),
});

export const UpdateComplaintSchema = CreateComplaintSchema.partial().extend({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  assignedTo: z.string().optional(),
  internalNotes: z.string().max(5000).optional(),
});

export const AddCommentSchema = z.object({
  content: z.string().min(1, 'Comment required').max(5000),
  isInternal: z.boolean().default(false),
  mentions: z.array(z.string()).optional(),
});

// Inventory Schemas
export const CreateAssetSchema = z.object({
  name: z.string().min(3, 'Asset name too short').max(100),
  serialNumber: z.string().min(3).max(100),
  category: z.enum(['laptop', 'phone', 'tablet', 'monitor', 'keyboard', 'mouse', 'other']),
  status: z.enum(['active', 'inactive', 'maintenance', 'retired']).default('active'),
  assignedTo: z.string().optional(),
  location: z.string().max(200).optional(),
  purchaseDate: z.string().datetime().optional(),
  warrantyExpiry: z.string().datetime().optional(),
  cost: z.number().positive().optional(),
  customFields: z.record(z.any()).optional(),
});

export const UpdateAssetSchema = CreateAssetSchema.partial();

export const BulkAssetUpdateSchema = z.object({
  ids: z.array(z.string()).min(1),
  updates: UpdateAssetSchema,
});

// Settings Schemas
export const UpdateProfileSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  avatar: z.string().url().optional(),
});

export const UpdateOrganizationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  logo: z.string().url().optional(),
  domain: z.string().max(100).optional(),
  timezone: z.string().optional(),
  language: z.enum(['en', 'es', 'fr', 'de', 'ja']).optional(),
});

export const CreateAPIKeySchema = z.object({
  name: z.string().min(3).max(100),
  permissions: z.array(z.string()).min(1),
  expiresIn: z.enum(['7days', '30days', '90days', 'never']).optional(),
});

export const InviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'engineer', 'viewer']),
});

// Remote Session Schemas
export const RequestRemoteSessionSchema = z.object({
  complaintId: z.string(),
  reason: z.string().min(10).max(500),
  estimatedDuration: z.number().min(5).max(480),
  controlLevel: z.enum(['view_only', 'mouse_only', 'full_control']).optional(),
});

// Search & Filter Schemas
export const SearchSchema = z.object({
  query: z.string().min(1).max(200),
  filters: z.record(z.any()).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(10).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Type exports
export type LoginInput = z.infer<typeof LoginSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;
export type CreateComplaintInput = z.infer<typeof CreateComplaintSchema>;
export type UpdateComplaintInput = z.infer<typeof UpdateComplaintSchema>;
export type CreateAssetInput = z.infer<typeof CreateAssetSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
