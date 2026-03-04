/**
 * Sanitize API responses to prevent data exposure
 * Removes sensitive fields based on user role and resource
 */

export interface SanitizationRules {
  fieldsToRemove: string[];
  fieldsToMask?: Record<string, (value: any) => string>;
  fieldsToIncludeOnly?: string[];
}

const DEFAULT_SANITIZATION_RULES: Record<string, SanitizationRules> = {
  user: {
    fieldsToRemove: ['password', 'passwordResetToken', 'twoFactorSecret', 'lastFailedLogin', 'failedLoginAttempts'],
  },
  complaint: {
    fieldsToRemove: ['__v'],
  },
  tenant: {
    fieldsToRemove: ['subscriptionKey', 'apiKeys', 'webhookSecrets'],
  },
  auditLog: {
    fieldsToRemove: [],
  },
};

/**
 * Sanitize a single object
 */
export function sanitizeObject<T extends Record<string, any>>(
  data: T,
  resourceType: string,
  userRole?: string
): Partial<T> {
  if (!data) return {};

  const rules = DEFAULT_SANITIZATION_RULES[resourceType] || { fieldsToRemove: [] };
  const sanitized: any = { ...data };

  // Remove sensitive fields
  rules.fieldsToRemove.forEach((field) => {
    delete sanitized[field];
  });

  // Mask sensitive fields
  if (rules.fieldsToMask) {
    Object.entries(rules.fieldsToMask).forEach(([field, maskFn]) => {
      if (sanitized[field]) {
        sanitized[field] = maskFn(sanitized[field]);
      }
    });
  }

  // Include only specific fields if specified
  if (rules.fieldsToIncludeOnly) {
    const filtered: any = {};
    rules.fieldsToIncludeOnly.forEach((field) => {
      if (field in sanitized) {
        filtered[field] = sanitized[field];
      }
    });
    return filtered;
  }

  return sanitized;
}

/**
 * Sanitize an array of objects
 */
export function sanitizeArray<T extends Record<string, any>>(
  data: T[],
  resourceType: string,
  userRole?: string
): Partial<T>[] {
  return data.map((item) => sanitizeObject(item, resourceType, userRole));
}

/**
 * Check if user can access field
 */
export function canAccessField(field: string, userRole: string): boolean {
  const restrictedFields: Record<string, string[]> = {
    tenantId: ['super-admin', 'admin', 'engineer'],
    createdBy: ['super-admin', 'admin', 'engineer'],
    internalNotes: ['admin', 'engineer'],
    ipAddress: ['super-admin', 'admin'],
    lastLogin: ['super-admin', 'admin'],
    failedAttempts: ['super-admin', 'admin'],
  };

  const allowedRoles = restrictedFields[field];
  if (!allowedRoles) return true; // Public field

  return allowedRoles.includes(userRole);
}

/**
 * Filter response fields based on role
 */
export function filterByRole<T extends Record<string, any>>(
  data: T,
  userRole: string
): Partial<T> {
  const filtered: any = {};

  Object.entries(data).forEach(([key, value]) => {
    if (canAccessField(key, userRole)) {
      filtered[key] = value;
    }
  });

  return filtered;
}
