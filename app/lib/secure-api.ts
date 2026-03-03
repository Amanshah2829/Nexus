import { NextRequest, NextResponse } from 'next/server';
import { getSession } from './session';
import { logSuccess, logFailure, getIpAddress, getUserAgent } from './audit';
import { sanitizeObject, sanitizeQueryParams } from './sanitize';
import { checkRateLimit } from './api-helpers';

/**
 * Secure API route handler with built-in security features
 */
export async function createSecureHandler(
  handler: (
    req: NextRequest,
    userId: string,
    context: {
      sanitize: typeof sanitizeObject;
      log: typeof logSuccess;
      sanitizeQuery: typeof sanitizeQueryParams;
    }
  ) => Promise<NextResponse>,
  options?: {
    action?: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
    resource?: string;
    requireRole?: string;
    rateLimit?: { requests: number; windowMs: number };
  }
) {
  return async (req: NextRequest, routeContext?: any) => {
    try {
      // 1. Check session
      const session = await getSession(req);
      if (!session) {
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        );
      }

      // 2. Rate limiting
      const ipAddress = getIpAddress(req);
      const rateLimitKey = `${session.userId}:${req.method}:${new URL(req.url).pathname}`;
      
      const limit = options?.rateLimit || { requests: 100, windowMs: 60000 };
      if (!checkRateLimit(rateLimitKey, limit.requests, limit.windowMs)) {
        await logFailure(
          session.userId,
          options?.action || 'READ',
          options?.resource || 'UNKNOWN',
          'rate-limit',
          'Rate limit exceeded',
          req
        );

        return NextResponse.json(
          { message: 'Too many requests. Please try again later.' },
          { status: 429, headers: { 'Retry-After': '60' } }
        );
      }

      // 3. Role checking
      if (options?.requireRole && session.role !== options.requireRole) {
        await logFailure(
          session.userId,
          options.action || 'READ',
          options.resource || 'UNKNOWN',
          'permission-denied',
          `Required role: ${options.requireRole}, user role: ${session.role}`,
          req
        );

        return NextResponse.json(
          { message: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      // 4. Call handler with security utilities
      const response = await handler(req, session.userId, {
        sanitize: sanitizeObject,
        log: (action: string, resource: string, resourceId: string, changes?: any) =>
          logSuccess(session.userId, action, resource, resourceId, changes, req),
        sanitizeQuery: sanitizeQueryParams,
      });

      return response;
    } catch (error: any) {
      console.error('[Secure Handler Error]', error);

      return NextResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Validate request body is valid JSON
 */
export async function validateJson(req: NextRequest): Promise<any> {
  try {
    return await req.json();
  } catch {
    throw new Error('Invalid JSON in request body');
  }
}

/**
 * Enforce HTTPS in production
 */
export function requireHttps(req: NextRequest): boolean {
  if (process.env.NODE_ENV === 'production') {
    return req.nextUrl.protocol === 'https:';
  }
  return true;
}

/**
 * Validate request origin (CORS)
 */
export function validateOrigin(req: NextRequest, allowedOrigins: string[]): boolean {
  const origin = req.headers.get('origin');
  
  if (!origin) {
    return true; // Allow requests without origin header (same-site requests)
  }

  return allowedOrigins.includes(origin) || allowedOrigins.includes('*');
}

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Strict Transport Security (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  );

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );

  return response;
}

/**
 * Validate request method
 */
export function validateMethod(
  req: NextRequest,
  allowedMethods: string[]
): boolean {
  return allowedMethods.includes(req.method);
}
