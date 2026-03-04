import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { getSecurityContext, verifyResourceOwnership, SecurityContext } from './context';
import { sanitizeObject, sanitizeArray } from './sanitize-response';

/**
 * Secured API handler with validation, auth, and sanitization
 * Prevents IDOR, XSS, data exposure, and other common vulnerabilities
 */
export async function handleSecureRequest<T>(
  request: NextRequest,
  handler: (
    req: NextRequest,
    context: SecurityContext,
    data?: T
  ) => Promise<any>,
  options?: {
    method?: string | string[];
    requireAuth?: boolean;
    schema?: ZodSchema;
    resourceType?: string;
    checkOwnership?: (data: any, context: SecurityContext) => boolean;
  }
): Promise<NextResponse> {
  try {
    // Verify method
    if (options?.method) {
      const allowedMethods = Array.isArray(options.method) ? options.method : [options.method];
      if (!allowedMethods.includes(request.method)) {
        return NextResponse.json(
          { error: 'Method not allowed' },
          { status: 405 }
        );
      }
    }

    // Get security context
    const context = await getSecurityContext(request);

    // Check authentication if required
    if (options?.requireAuth !== false && !context.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    let parsedData: T | undefined;
    if (options?.schema && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        const body = await request.json();
        parsedData = options.schema.parse(body) as T;
      } catch (error: any) {
        return NextResponse.json(
          { error: 'Invalid request data', details: error.errors },
          { status: 400 }
        );
      }
    }

    // Check ownership if needed
    if (options?.checkOwnership && parsedData) {
      const owns = options.checkOwnership(parsedData, context);
      if (!owns) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }
    }

    // Call handler
    const result = await handler(request, context, parsedData);

    // Sanitize response
    let sanitizedResult = result;
    if (options?.resourceType) {
      if (Array.isArray(result)) {
        sanitizedResult = sanitizeArray(result, options.resourceType, context.role);
      } else if (result && typeof result === 'object') {
        sanitizedResult = sanitizeObject(result, options.resourceType, context.role);
      }
    }

    return NextResponse.json(sanitizedResult);
  } catch (error: any) {
    console.error('[API Error]', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Verify resource belongs to user's tenant
 */
export function verifyTenantOwnership(resourceTenantId: string, userTenantId: string, userRole: string): boolean {
  if (userRole === 'super-admin') return true;
  return resourceTenantId === userTenantId;
}

/**
 * Verify user has specific role
 */
export function requireRole(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Create success response
 */
export function successResponse<T>(data: T, statusCode = 200) {
  return NextResponse.json(data, { status: statusCode });
}

/**
 * Create error response
 */
export function errorResponse(message: string, statusCode = 400) {
  return NextResponse.json(
    { error: message },
    { status: statusCode }
  );
}
