import { NextRequest } from 'next/server';
import dbConnect from './db';

/**
 * Audit log entry interface
 */
export interface AuditLogEntry {
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: Record<string, any>;
  status: 'success' | 'failure';
  ipAddress?: string;
  userAgent?: string;
  details?: string;
  error?: string;
}

/**
 * Map of sensitive fields that should be masked in logs
 */
const SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'token',
  'apiKey',
  'secret',
  'creditCard',
  'ssn',
  'email',
];

/**
 * Mask sensitive data in changes object
 */
function maskSensitiveData(data: Record<string, any>): Record<string, any> {
  const masked: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      masked[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskSensitiveData(value);
    } else {
      masked[key] = value;
    }
  }

  return masked;
}

/**
 * Extract IP address from request
 */
export function getIpAddress(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

/**
 * Extract user agent from request
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Log an audit entry
 */
export async function logAudit(
  entry: AuditLogEntry,
  request?: NextRequest
): Promise<void> {
  try {
    await dbConnect();

    // Enrich with request data if provided
    if (request) {
      entry.ipAddress = entry.ipAddress || getIpAddress(request);
      entry.userAgent = entry.userAgent || getUserAgent(request);
    }

    // Mask sensitive data
    if (entry.changes) {
      entry.changes = maskSensitiveData(entry.changes);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUDIT]', {
        timestamp: entry.timestamp.toISOString(),
        userId: entry.userId,
        action: entry.action,
        resource: entry.resource,
        status: entry.status,
      });
    }

    // TODO: Store in database AuditLog collection
    // const auditLog = new AuditLog(entry);
    // await auditLog.save();
  } catch (error) {
    console.error('Failed to log audit entry:', error);
    // Don't throw - audit logging should not break operations
  }
}

/**
 * Log successful action
 */
export async function logSuccess(
  userId: string,
  action: string,
  resource: string,
  resourceId: string,
  changes?: Record<string, any>,
  request?: NextRequest
): Promise<void> {
  await logAudit(
    {
      timestamp: new Date(),
      userId,
      action,
      resource,
      resourceId,
      changes,
      status: 'success',
    },
    request
  );
}

/**
 * Log failed action
 */
export async function logFailure(
  userId: string,
  action: string,
  resource: string,
  resourceId: string,
  error: string,
  request?: NextRequest
): Promise<void> {
  await logAudit(
    {
      timestamp: new Date(),
      userId,
      action,
      resource,
      resourceId,
      status: 'failure',
      error,
    },
    request
  );
}

/**
 * Log security event
 */
export async function logSecurityEvent(
  userId: string,
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  details: string,
  request?: NextRequest
): Promise<void> {
  await logAudit(
    {
      timestamp: new Date(),
      userId,
      action: `SECURITY_EVENT_${severity.toUpperCase()}`,
      resource: 'SECURITY',
      resourceId: event,
      status: 'success',
      details,
    },
    request
  );
}

/**
 * Query audit logs with filters
 */
export async function queryAuditLogs(filters: {
  userId?: string;
  action?: string;
  resource?: string;
  status?: 'success' | 'failure';
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  skip?: number;
}): Promise<AuditLogEntry[]> {
  try {
    await dbConnect();

    const query: Record<string, any> = {};

    if (filters.userId) query.userId = filters.userId;
    if (filters.action) query.action = filters.action;
    if (filters.resource) query.resource = filters.resource;
    if (filters.status) query.status = filters.status;

    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) query.timestamp.$gte = filters.startDate;
      if (filters.endDate) query.timestamp.$lte = filters.endDate;
    }

    // TODO: Query AuditLog collection
    // const logs = await AuditLog.find(query)
    //   .sort({ timestamp: -1 })
    //   .skip(filters.skip || 0)
    //   .limit(filters.limit || 100)
    //   .lean();

    return [];
  } catch (error) {
    console.error('Failed to query audit logs:', error);
    return [];
  }
}

/**
 * Get audit log statistics
 */
export async function getAuditStats(userId: string, days: number = 7): Promise<{
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  securityEvents: number;
}> {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const logs = await queryAuditLogs({
      userId,
      startDate,
      limit: 10000,
    });

    return {
      totalActions: logs.length,
      successfulActions: logs.filter(l => l.status === 'success').length,
      failedActions: logs.filter(l => l.status === 'failure').length,
      securityEvents: logs.filter(l => l.resource === 'SECURITY').length,
    };
  } catch (error) {
    console.error('Failed to get audit stats:', error);
    return {
      totalActions: 0,
      successfulActions: 0,
      failedActions: 0,
      securityEvents: 0,
    };
  }
}
