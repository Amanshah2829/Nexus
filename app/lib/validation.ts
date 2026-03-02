import { z } from 'zod';

/**
 * Auth Schemas
 */
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const SignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const ResetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Complaint Schemas
 */
export const CreateComplaintSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description too long'),
  category: z.string().min(1, 'Category is required'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  building: z.string().optional(),
  room: z.string().optional(),
  phone: z.string().optional(),
});

export const UpdateComplaintSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  status: z.enum(['created', 'scheduled', 'visited', 'observation', 'follow-up', 'closed', 'pending-info', 'pending-approval', 'archived']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  category: z.string().optional(),
});

/**
 * Remote Session Schemas
 */
export const CreateRemoteSessionSchema = z.object({
  complaintId: z.string().min(1, 'Complaint ID is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500, 'Reason too long'),
  estimatedDuration: z.number().min(5, 'Duration must be at least 5 minutes').max(120, 'Duration cannot exceed 120 minutes').optional(),
});

export const ApproveRemoteSessionSchema = z.object({
  timeLimit: z.number().min(5, 'Time limit must be at least 5 minutes').max(120, 'Time limit cannot exceed 120 minutes').optional(),
});

export const DenyRemoteSessionSchema = z.object({
  reason: z.string().max(500, 'Reason too long').optional(),
});

export const UpdateControlPermissionsSchema = z.object({
  controlLevel: z.enum(['view-only', 'mouse-only', 'full-control']).optional(),
  allowRemoteInput: z.boolean().optional(),
  allowScreenRecording: z.boolean().optional(),
  canShareScreen: z.boolean().optional(),
  canShareAudio: z.boolean().optional(),
});

export const SendChatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
});

/**
 * Inventory Schemas
 */
export const CreateAssetSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  assetId: z.string().min(1, 'Asset ID is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['active', 'inactive', 'damaged', 'lost']).default('active'),
});

export const UpdateAssetSchema = z.object({
  name: z.string().min(2).optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['active', 'inactive', 'damaged', 'lost']).optional(),
});

/**
 * User Schemas
 */
export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name is required'),
  role: z.enum(['admin', 'engineer', 'user']),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'engineer', 'user']).optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Settings Schemas
 */
export const UpdateSettingsSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.any(),
});

/**
 * Type exports for use in components
 */
export type LoginFormData = z.infer<typeof LoginSchema>;
export type SignupFormData = z.infer<typeof SignupSchema>;
export type CreateComplaintData = z.infer<typeof CreateComplaintSchema>;
export type CreateRemoteSessionData = z.infer<typeof CreateRemoteSessionSchema>;
export type CreateAssetData = z.infer<typeof CreateAssetSchema>;
export type CreateUserData = z.infer<typeof CreateUserSchema>;
export type ChangePasswordData = z.infer<typeof ChangePasswordSchema>;
