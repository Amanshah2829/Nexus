import { NextRequest } from 'next/server';
import { getSession } from '@/app/lib/session';

/**
 * Represents an authenticated user's security context
 * Prevents IDOR by validating ownership on all operations
 */
export interface SecurityContext {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
  permissions: string[];
  isAuthenticated: boolean;
}

/**
 * Extract security context from request
 * Validates user is authenticated and has proper session
 */
export async function getSecurityContext(request: NextRequest): Promise<SecurityContext> {
  try {
    const session = await getSession(request);

    if (!session || !session.userId) {
      return {
        userId: '',
        email: '',
        role: '',
        tenantId: '',
        permissions: [],
        isAuthenticated: false,
      };
    }

    return {
      userId: session.userId,
      email: session.email,
      role: session.role,
      tenantId: session.tenant || '',
      permissions: getPermissionsForRole(session.role),
      isAuthenticated: true,
    };
  } catch (error) {
    return {
      userId: '',
      email: '',
      role: '',
      tenantId: '',
      permissions: [],
      isAuthenticated: false,
    };
  }
}

/**
 * Verify user owns resource (IDOR prevention)
 */
export function verifyResourceOwnership(
  resourceTenantId: string,
  userTenantId: string,
  userRole: string
): boolean {
  // Super admin can access any tenant
  if (userRole === 'super-admin') {
    return true;
  }
  
  // Regular users can only access their own tenant
  return resourceTenantId === userTenantId;
}

/**
 * Verify user has required permission
 */
export function verifyPermission(userPermissions: string[], requiredPermission: string): boolean {
  return userPermissions.includes(requiredPermission) || userPermissions.includes('admin');
}

/**
 * Get permissions based on role
 */
function getPermissionsForRole(role: string): string[] {
  const rolePermissions: Record<string, string[]> = {
    'super-admin': ['admin', 'manage-users', 'manage-tenants', 'view-audit', 'manage-settings'],
    'admin': ['admin', 'manage-users', 'view-audit', 'manage-settings'],
    'engineer': ['create-ticket', 'update-ticket', 'view-tickets', 'view-analytics'],
    'user': ['create-ticket', 'view-own-tickets'],
    'viewer': ['view-tickets', 'view-analytics'],
  };

  return rolePermissions[role] || [];
}

/**
 * Create audit log entry
 */
export function createAuditLog(
  userId: string,
  tenantId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  changes?: Record<string, any>
) {
  return {
    userId,
    tenantId,
    action,
    resourceType,
    resourceId,
    changes: changes || {},
    timestamp: new Date(),
    ipAddress: process.env.NODE_ENV === 'development' ? '127.0.0.1' : 'unknown',
  };
}
